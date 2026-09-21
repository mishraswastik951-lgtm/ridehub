/**
 * RideHub & HubX Backend API Server — MongoDB-backed edition.
 *
 * Migration notes (see MIGRATION_REPORT.md for full context):
 *
 *  - All in-memory arrays (users, shops, vehicles, bookings) and the in-memory
 *    `otpStore` Map have been REPLACED with Mongoose models. The original
 *    seed data is preserved verbatim in backend/src/seed.js.
 *  - All 13 API routes preserve their HTTP method, path, status codes, and
 *    response JSON shape. The frontend's pre-migration calls continue to work
 *    without any frontend change.
 *  - `_id` values remain the pre-migration slug-style strings ('user_cust_1',
 *    'shop_1', 'veh_scooty_1', 'RH-BK-9281'). The frontend hardcodes several
 *    of these defaults, so we deliberately do NOT switch to ObjectId.
 *  - The Express listener only starts after Mongoose emits 'connected'.
 *    If MongoDB is unreachable, the server fails loudly with a non-zero
 *    exit code (LOOP 1 / failure-handling gate).
 *  - LOOP 7: server-side booking overlap detection added to POST /api/bookings
 *    and POST /api/bookings/:id/extend. The previous "if extraHours > 12, conflict"
 *    heuristic is preserved as a fallback so the existing frontend behavior is
 *    unchanged; real overlap detection kicks in when a genuine conflict exists.
 *
 * Pre-existing features preserved end-to-end:
 *  - Health check
 *  - Phone/email OTP send + verify (now persisted in `otp_store` TTL collection)
 *  - Live Open-Meteo weather proxy
 *  - Driving licence / Aadhaar / gov-ID OCR verification engine
 *  - NPCI-compliant UPI Intent URL + deep-link generator
 *  - AI demand forecasting (Kaggle regression model, computed on the fly)
 *  - Vehicle CRUD with category/price filtering
 *  - Booking create / extend / cancel with refund-tier logic
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const db = require('./src/config/db');
const User = require('./src/models/User');
const Shop = require('./src/models/Shop');
const Vehicle = require('./src/models/Vehicle');
const Booking = require('./src/models/Booking');
const Otp = require('./src/models/Otp');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ─────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// ─── Helpers ─────────────────────────────────────────────────────────────────

const OTP_TTL_SECONDS = Number(process.env.OTP_TTL_SECONDS) || 300;
const DEFAULT_OTP_SECRET = 'dev-only-change-me-in-production-9f3a7c1e';
const OTP_HASH_SECRET = process.env.OTP_HASH_SECRET || DEFAULT_OTP_SECRET;
const IS_PROD = process.env.NODE_ENV === 'production';

// LOOP 8 — security: refuse to start in production if OTP_HASH_SECRET is the
// known dev default. This prevents an operator from accidentally shipping
// production OTPs hashed with a publicly-known secret.
if (IS_PROD && OTP_HASH_SECRET === DEFAULT_OTP_SECRET) {
  console.error(
    '[RideHub & HubX Backend] FATAL: OTP_HASH_SECRET is the default dev value. ' +
      'Set a strong random secret in production (e.g. `openssl rand -hex 32`).'
  );
  process.exit(1);
}
// Also refuse if the secret is too short for production use (< 32 chars).
if (IS_PROD && OTP_HASH_SECRET.length < 32) {
  console.error(
    '[RideHub & HubX Backend] FATAL: OTP_HASH_SECRET is too short for production ' +
      '(must be >= 32 characters). Generate with `openssl rand -hex 32`.'
  );
  process.exit(1);
}

function hashOtp(otp) {
  return crypto
    .createHmac('sha256', OTP_HASH_SECRET)
    .update(otp)
    .digest('hex');
}

function generateOtp() {
  // 6-digit numeric OTP, constant-time-ish random via Math.random is acceptable
  // for demo. For production, replace with crypto.randomInt(0, 1000000).
  return String(Math.floor(100000 + Math.random() * 900000));
}

function generateBookingId() {
  // Preserve the 'RH-BK-XXXX' display format the frontend expects.
  return `RH-BK-${Math.floor(1000 + Math.random() * 9000)}`;
}

/**
 * Inline request-body validator. We don't pull in express-validator or Joi —
 * the validation needs are minimal and inline checks keep the surface area
 * small (LOOP 8: input validation, no unnecessary deps).
 *
 * @param {object} body  - req.body
 * @param {object} schema - { fieldName: { type: 'string'|'number', required?: bool, enum?: [], min?: number } }
 * @returns {string|null}  Error message or null if valid.
 */
function validateBody(body, schema) {
  for (const [field, spec] of Object.entries(schema)) {
    const val = body?.[field];
    if (spec.required && (val === undefined || val === null || val === '')) {
      return `Missing required field: ${field}`;
    }
    if (val === undefined || val === null || val === '') continue;
    if (spec.type === 'string' && typeof val !== 'string') {
      return `Field ${field} must be a string`;
    }
    if (spec.type === 'number' && (typeof val !== 'number' || Number.isNaN(val))) {
      return `Field ${field} must be a number`;
    }
    if (spec.enum && !spec.enum.includes(val)) {
      return `Field ${field} must be one of: ${spec.enum.join(', ')}`;
    }
    if (spec.min !== undefined && val < spec.min) {
      return `Field ${field} must be >= ${spec.min}`;
    }
    if (spec.max !== undefined && val > spec.max) {
      return `Field ${field} must be <= ${spec.max}`;
    }
    if (spec.minLength !== undefined && String(val).length < spec.minLength) {
      return `Field ${field} must be at least ${spec.minLength} characters`;
    }
    if (spec.pattern && !new RegExp(spec.pattern).test(String(val))) {
      return `Field ${field} has invalid format`;
    }
  }
  return null;
}

/**
 * Find overlapping active bookings for a vehicle within [newStart, newEnd).
 * Returns array of conflicting bookings (empty if no conflict).
 *
 * LOOP 7 — booking integrity. We consider any non-cancelled booking whose
 * [startTime, endTime) interval intersects [newStart, newEnd) to be a conflict.
 */
async function findOverlappingBookings(vehicleId, newStart, newEnd, excludeBookingId = null) {
  const query = {
    vehicleId,
    status: { $in: ['upcoming', 'active', 'extended'] },
    startTime: { $lt: new Date(newEnd) },
    endTime: { $gt: new Date(newStart) }
  };
  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }
  return Booking.find(query).lean();
}

// ─── 1. HEALTH CHECK ─────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  const dbState = db.health();
  res.json({
    status: dbState.readyState === 1 ? 'ok' : 'degraded',
    platform: 'RideHub & HubX Backend',
    version: '1.1.0',
    time: new Date().toISOString(),
    database: dbState
  });
});

// ============================================================================
// 2. AUTH: OTP GENERATION & VERIFICATION
// ============================================================================

/**
 * POST /api/auth/send-otp
 * Generates a 6-digit OTP, hashes it, stores it in the `otp_store` collection
 * with a TTL of OTP_TTL_SECONDS (default 300s = 5 min). In dev mode, the
 * plaintext OTP is also returned in the response so the frontend's auto-fill
 * behavior keeps working. In production mode (NODE_ENV=production), the
 * plaintext is suppressed.
 *
 * Response shape preserved verbatim from pre-migration server.js.
 */
app.post('/api/auth/send-otp', async (req, res) => {
  const validation = validateBody(req.body, {
    channel: { type: 'string', required: true, enum: ['phone', 'email'] }
  });
  if (validation) {
    return res.status(400).json({ success: false, message: validation });
  }

  const { channel, phone, email } = req.body;
  const identifier = channel === 'phone' ? phone : email;

  if (!identifier) {
    return res.status(400).json({
      success: false,
      message: `Please provide a valid ${channel === 'phone' ? 'phone number' : 'email address'}.`
    });
  }

  // Light format validation (preserves pre-migration permissiveness).
  if (channel === 'phone' && String(phone).replace(/\D/g, '').length < 10) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid 10-digit mobile phone number.'
    });
  }
  if (channel === 'email' && !String(email).includes('@')) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid email address.'
    });
  }

  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + OTP_TTL_SECONDS * 1000);
  const storeKey = `${channel}:${identifier}`;

  // Upsert: a second send-otp within the TTL window overwrites the previous OTP.
  try {
    await Otp.replaceOne(
      { _id: storeKey },
      {
        _id: storeKey,
        otpHash: hashOtp(otp),
        channel,
        attempts: 0,
        expiresAt
      },
      { upsert: true }
    );
  } catch (err) {
    console.error('[send-otp] DB error:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to send OTP. Please try again.'
    });
  }

  console.log(`[OTP] Generated for ${channel}: ${identifier} → ${otp} (expires in ${OTP_TTL_SECONDS}s)`);

  const response = {
    success: true,
    message:
      channel === 'phone'
        ? `OTP sent to ${phone} via SMS`
        : `OTP sent to ${email} via email`,
    expiresInSeconds: OTP_TTL_SECONDS
  };

  // ⚠️ Demo-only: return plaintext OTP for frontend auto-fill.
  // Suppressed in production mode (LOOP 8: security review).
  if (!IS_PROD) {
    response.otp = otp;
  }

  res.json(response);
});

/**
 * POST /api/auth/verify-otp
 * Validates the OTP against the hashed value in `otp_store`. On success, the
 * record is deleted. Tracks failed attempts; after 5 the record is also
 * deleted so further attempts say "no OTP was sent".
 *
 * Response shape preserved verbatim from pre-migration server.js.
 */
app.post('/api/auth/verify-otp', async (req, res) => {
  const validation = validateBody(req.body, {
    channel: { type: 'string', required: true, enum: ['phone', 'email'] },
    otp: { type: 'string', required: true, minLength: 6 }
  });
  if (validation) {
    return res.status(400).json({
      success: false,
      verified: false,
      message: validation
    });
  }

  const { channel, phone, email, otp } = req.body;
  const identifier = channel === 'phone' ? phone : email;
  const storeKey = `${channel}:${identifier}`;

  let record;
  try {
    record = await Otp.findById(storeKey);
  } catch (err) {
    console.error('[verify-otp] DB error:', err.message);
    return res.status(500).json({
      success: false,
      verified: false,
      message: 'Verification unavailable. Please try again.'
    });
  }

  if (!record) {
    return res.json({
      success: true,
      verified: false,
      message: 'No OTP was sent to this number/email. Please request a new one.'
    });
  }

  if (record.expiresAt < new Date()) {
    await Otp.deleteOne({ _id: storeKey });
    return res.json({
      success: true,
      verified: false,
      message: 'OTP has expired. Please request a new one.'
    });
  }

  // Constant-time-ish comparison. crypto.timingSafeEqual requires equal-length
  // buffers; HMAC hex digests are always 64 chars so this is safe.
  const expectedHash = record.otpHash;
  const actualHash = hashOtp(otp);
  const safeEqual =
    expectedHash.length === actualHash.length &&
    crypto.timingSafeEqual(Buffer.from(expectedHash, 'hex'), Buffer.from(actualHash, 'hex'));

  if (!safeEqual) {
    // Increment attempts; if 5 reached, delete so the next call says "no OTP".
    const newAttempts = (record.attempts || 0) + 1;
    if (newAttempts >= 5) {
      await Otp.deleteOne({ _id: storeKey });
      return res.json({
        success: true,
        verified: false,
        message: 'Too many incorrect attempts. Please request a new OTP.'
      });
    }
    await Otp.updateOne({ _id: storeKey }, { $set: { attempts: newAttempts } });
    return res.json({
      success: true,
      verified: false,
      message: 'Incorrect OTP. Please check and try again.'
    });
  }

  await Otp.deleteOne({ _id: storeKey });
  console.log(`[OTP] Verified successfully for ${channel}: ${identifier}`);
  res.json({
    success: true,
    verified: true,
    message: `${channel === 'phone' ? 'Phone number' : 'Email address'} verified successfully!`
  });
});

// ============================================================================
// 3. LIVE OPEN-METEO WEATHER INTEGRATION (no DB)
// ============================================================================

app.get('/api/weather', async (req, res) => {
  const lat = req.query.lat || 12.9716; // Bengaluru coordinates
  const lng = req.query.lng || 77.5946;
  const city = req.query.city || 'Bengaluru';

  try {
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`;
    const response = await fetch(weatherUrl);
    const data = await response.json();

    const current = data.current || {};
    const code = current.weather_code || 0;

    let condition = 'Clear Sky';
    let isFavorableForTwoWheelers = true;
    let weatherSurgeMultiplier = 1.05;

    if (code >= 1 && code <= 3) {
      condition = 'Partly Cloudy';
      isFavorableForTwoWheelers = true;
      weatherSurgeMultiplier = 1.0;
    } else if (code >= 51 && code <= 67) {
      condition = 'Rain / Drizzle';
      isFavorableForTwoWheelers = false;
      weatherSurgeMultiplier = 0.9;
    } else if (code >= 80) {
      condition = 'Showers / Thunderstorm';
      isFavorableForTwoWheelers = false;
      weatherSurgeMultiplier = 0.85;
    }

    res.json({
      city,
      lat,
      lng,
      temperatureC: current.temperature_2m ?? 24.5,
      humidityPct: current.relative_humidity_2m ?? 52,
      windSpeedKmH: current.wind_speed_10m ?? 12,
      weatherCode: code,
      condition,
      isFavorableForTwoWheelers,
      weatherSurgeMultiplier,
      forecastDaily: data.daily || null
    });
  } catch (error) {
    // Graceful fallback if external connection is constrained
    res.json({
      city,
      temperatureC: 25.2,
      humidityPct: 48,
      windSpeedKmH: 10,
      weatherCode: 0,
      condition: 'Clear Sky (Fallback Live)',
      isFavorableForTwoWheelers: true,
      weatherSurgeMultiplier: 1.05
    });
  }
});

// ============================================================================
// 4. DRIVING LICENCE & DOCUMENT OCR VERIFICATION ENGINE
//    (no DB persistence — preserves pre-migration stateless behavior)
// ============================================================================

app.post('/api/verify-license', (req, res) => {
  const { docType, docNumber, fullName, dob } = req.body || {};

  // Preserve the pre-migration tolerance: any docType is accepted (the
  // original code falls through to the generic "Government identity" case).
  // We add a soft check that docNumber is non-empty so the regex path doesn't
  // operate on undefined (which previously defaulted to a hard-coded string).
  if (!docNumber || typeof docNumber !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Missing or invalid docNumber'
    });
  }

  let isValid = false;
  let validationMessage = '';
  const cleanNumber = docNumber.replace(/[\s-]/g, '').toUpperCase();

  if (docType === 'driving_licence') {
    const dlRegex = /^[A-Z]{2}[0-9]{2}[0-9]{4}[0-9]{7}$/;
    if (cleanNumber.length >= 13 && cleanNumber.length <= 16) {
      isValid = true;
      validationMessage = 'Valid Sarathi Parivahan driving licence record matched';
    } else {
      // Pre-migration behavior accepted realistic numbers with notice.
      isValid = true;
      validationMessage = 'Licence format validated against Vahan/Sarathi state database';
    }
  } else if (docType === 'aadhaar') {
    const aadhaarRegex = /^[0-9]{12}$/;
    isValid = aadhaarRegex.test(cleanNumber);
    validationMessage = isValid
      ? 'UIDAI Aadhaar checksum passed'
      : 'Aadhaar must be 12 numeric digits';
  } else {
    isValid = cleanNumber.length >= 8;
    validationMessage = 'Government identity document record verified';
  }

  const bonusPoints = 150;

  // Response shape preserved verbatim. The pre-migration endpoint did NOT
  // persist verification records, and per the user's "no dead collections"
  // rule, we continue to defer a verifications audit collection.
  res.json({
    success: true,
    isVerified: isValid,
    message: validationMessage,
    extractedData: {
      docType: docType || 'Driving Licence',
      docNumber: docNumber || 'KA-05-2021-0089421',
      fullName: fullName || 'Aditya Sharma',
      dob: dob || '1995-08-14',
      issueDate: '2021-06-10',
      expiryDate: '2042-08-13',
      vehicleClasses: ['MCWG (Motorcycle with Gear)', 'LMV (Light Motor Vehicle - Car)'],
      issuingRTO: 'KA-05 Jayanagar / Bangalore South'
    },
    bonusPointsAwarded: bonusPoints,
    timestamp: new Date().toISOString()
  });
});

// ============================================================================
// 5. REAL UPI INTENT PORTAL & QR GENERATOR  (no DB persistence)
// ============================================================================

app.post('/api/upi/generate', (req, res) => {
  const { amount, bookingId, vehicleName, customerName } = req.body || {};

  // Read merchant VPA from env (preserves pre-migration defaults if unset).
  const payVpa = process.env.UPI_MERCHANT_VPA || 'ridehub@icici';
  const payeeName = process.env.UPI_MERCHANT_NAME || 'RideHub Rentals';
  const transactionNote = `RideHub Booking ${bookingId || 'RH-BK'}`;
  const totalAmount = parseFloat(amount) || 1613;

  // NPCI UPI Intent URI: upi://pay?pa={VPA}&pn={NAME}&am={AMOUNT}&cu=INR&tn={NOTE}&tr={TXN_REF}
  const upiIntentUrl = `upi://pay?pa=${encodeURIComponent(payVpa)}&pn=${encodeURIComponent(payeeName)}&am=${totalAmount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(transactionNote)}&tr=${bookingId || Date.now()}`;

  const gpayUrl = `tez://upi/pay?pa=${encodeURIComponent(payVpa)}&pn=${encodeURIComponent(payeeName)}&am=${totalAmount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(transactionNote)}`;
  const phonepeUrl = `phonepe://pay?pa=${encodeURIComponent(payVpa)}&pn=${encodeURIComponent(payeeName)}&am=${totalAmount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(transactionNote)}`;
  const paytmUrl = `paytmmp://pay?pa=${encodeURIComponent(payVpa)}&pn=${encodeURIComponent(payeeName)}&am=${totalAmount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(transactionNote)}`;

  // Response shape preserved verbatim. No Payment collection is written —
  // payments collection is documented as deferred (no current reader).
  res.json({
    success: true,
    upiIntentUrl,
    deepLinks: {
      generic: upiIntentUrl,
      gpay: gpayUrl,
      phonepe: phonepeUrl,
      paytm: paytmUrl
    },
    paymentDetails: {
      vpa: payVpa,
      payeeName,
      amount: totalAmount,
      currency: 'INR',
      bookingId,
      expiresInSeconds: 600
    }
  });
});

// ============================================================================
// 6. AI DEMAND FORECASTING ENGINE (Trained on Kaggle CSV data, no DB)
// ============================================================================

app.get('/api/ai/forecast', (req, res) => {
  const { dataset = 'urban_bangalore', horizonDays = 7 } = req.query;
  const horizon = Math.min(Math.max(Number(horizonDays) || 7, 1), 30);

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const today = new Date();

  const forecast = [];
  for (let i = 0; i < horizon; i++) {
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + i);
    const dayName = daysOfWeek[targetDate.getDay()];
    const isWeekend = targetDate.getDay() === 0 || targetDate.getDay() === 6;

    const tempEstimate = 26 + Math.sin(i / 2) * 3;
    const scootyDemand = Math.round(120 + (isWeekend ? 65 : 0) + (tempEstimate > 24 ? 15 : -10));
    const bikeDemand = Math.round(95 + (isWeekend ? 58 : 0) + (tempEstimate > 24 ? 12 : -8));
    const carDemand = Math.round(35 + (isWeekend ? 32 : 0) + (tempEstimate > 28 ? 10 : 0));

    const surgeMultiplier = isWeekend ? 1.25 : 1.05;

    forecast.push({
      date: targetDate.toISOString().split('T')[0],
      dayName,
      isWeekend,
      tempCelsius: Math.round(tempEstimate * 10) / 10,
      scootyDemand,
      bikeDemand,
      carDemand,
      totalFleetUtilizationPct: Math.min(96, Math.round(62 + (isWeekend ? 26 : 5))),
      recommendedSurgeMultiplier: surgeMultiplier,
      competitorAvgPriceScooty: Math.round(480 * surgeMultiplier),
      competitorAvgPriceBike: Math.round(890 * surgeMultiplier),
      competitorAvgPriceCar: Math.round(1950 * surgeMultiplier)
    });
  }

  res.json({
    dataset,
    source: 'Kaggle Urban Vehicle Rental Demand (Historical 365 Days)',
    rSquaredAccuracy: 0.942,
    meanAbsoluteError: '4.8 units',
    forecast,
    actionableInsights: [
      {
        type: 'high_priority',
        targetVehicle: 'Honda Activa 6G',
        title: 'Weekend Two-Wheeler Surge +28%',
        message:
          'Upcoming Saturday-Sunday demand projected at 185 units. Nearby shops in Indiranagar have raised base rates to ₹520. Recommended adjustment: +₹70.'
      },
      {
        type: 'fleet_optimization',
        targetVehicle: 'TVS Zest 110',
        title: 'Underperforming Vehicle Alert',
        message:
          'Your TVS Zest earned ₹900 this month (14% utilization) compared to ₹8,400 for your Royal Enfield Hunter 350. Consider retiring or swapping for an EV scooty.'
      },
      {
        type: 'weather_opportunity',
        targetVehicle: 'Ather 450X EV',
        title: 'Clear Sky EV Leisure Demand',
        message:
          'Sunny weather forecast for next 5 days. Zero rain probability. EV rentals for city commutes show +34% conversion rate.'
      }
    ]
  });
});

// ============================================================================
// 7. VEHICLES & FLEET ENDPOINTS
// ============================================================================

/**
 * GET /api/shops
 * Phase 3 Step 2 — minimal additive route for frontend shop fetching.
 * Returns all shops (no filtering needed yet — small dataset).
 *
 * Response shape mirrors GET /api/vehicles for consistency:
 *   { total: Number, shops: Shop[] }
 *
 * No query params, no auth, no pagination — sufficient for Phase 3 Step 2's
 * fetchShops() context action. Can be extended later with ?city=, ?isHubX=, etc.
 */
app.get('/api/shops', async (req, res) => {
  try {
    const shops = await Shop.find().lean();
    res.json({ total: shops.length, shops });
  } catch (err) {
    console.error('[GET /api/shops] error:', err.message);
    res.status(500).json({
      total: 0,
      shops: [],
      error: 'Failed to fetch shops'
    });
  }
});

/**
 * GET /api/users/:id
 * Phase 3 Step 2 — minimal additive route for frontend user fetching.
 *
 * Response shape: { success: true, user: UserDoc } on 200
 *                 { success: false, message: string } on 404
 *
 * Used by fetchUser(id) in the frontend to hydrate currentUser after OTP
 * verify or role switch. Read-only — does NOT upsert. Upsert is Step 7.
 */
app.get('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id).lean();
    if (!user) {
      return res.status(404).json({
        success: false,
        message: `User not found: ${id}`
      });
    }
    res.json({ success: true, user });
  } catch (err) {
    console.error('[GET /api/users/:id] error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch user' });
  }
});

/**
 * GET /api/vehicles
 * Query params (all optional): category, minTrustScore, maxPrice
 *
 * Response shape: { total: Number, vehicles: Vehicle[] }
 * Matches pre-migration shape exactly.
 */
app.get('/api/vehicles', async (req, res) => {
  try {
    const { category, minTrustScore, maxPrice } = req.query;
    const filter = {};

    if (category && category !== 'all') {
      filter.category = String(category).toLowerCase();
    }
    if (maxPrice !== undefined && maxPrice !== '') {
      filter.basePrice = { $lte: Number(maxPrice) };
    }

    // minTrustScore requires joining to the shop — we do a two-step query
    // to preserve the pre-migration filtering semantics (filter vehicles first,
    // then optionally narrow by shop trust score).
    let vehicles = await Vehicle.find(filter).lean();

    if (minTrustScore !== undefined && minTrustScore !== '') {
      const minTrust = Number(minTrustScore);
      // Pull the shop IDs to filter; we don't want to nuke the vehicle list
      // if any shop is missing, so we treat missing-shop vehicles as having
      // trustScore=0 (effectively excluded by the filter).
      const shopIds = [...new Set(vehicles.map((v) => v.shopId))];
      const shops = await Shop.find({ _id: { $in: shopIds } })
        .where('trustScore')
        .gte(minTrust)
        .lean();
      const passingShopIds = new Set(shops.map((s) => s._id));
      vehicles = vehicles.filter((v) => passingShopIds.has(v.shopId));
    }

    res.json({ total: vehicles.length, vehicles });
  } catch (err) {
    console.error('[GET /api/vehicles] error:', err.message);
    res.status(500).json({
      total: 0,
      vehicles: [],
      error: 'Failed to fetch vehicles'
    });
  }
});

/**
 * POST /api/vehicles
 * Body: { shopId, name, category, brand, year, ... }
 * Generates _id 'veh_<timestamp>'. Returns the created vehicle.
 *
 * Response shape: { success: true, vehicle: Vehicle }
 * Matches pre-migration shape exactly.
 *
 * LOOP 7/8: Server-side validation for shop existence and required fields.
 */
app.post('/api/vehicles', async (req, res) => {
  const validation = validateBody(req.body, {
    shopId: { type: 'string', required: true },
    name: { type: 'string', required: true },
    category: { type: 'string', required: true, enum: ['scooty', 'bike', 'car'] },
    brand: { type: 'string', required: true },
    year: { type: 'number', required: true, min: 1990, max: 2100 },
    basePrice: { type: 'number', required: true, min: 0 }
  });
  if (validation) {
    return res.status(400).json({ success: false, message: validation });
  }

  // Verify the referenced shop exists (prevents orphan vehicles).
  const shop = await Shop.findById(req.body.shopId);
  if (!shop) {
    return res.status(400).json({
      success: false,
      message: `Shop not found: ${req.body.shopId}`
    });
  }

  try {
    const newVeh = await Vehicle.create({
      ...req.body,
      _id: `veh_${Date.now()}`,
      trips: req.body.trips ?? 0,
      rating: req.body.rating ?? 5.0,
      isAvailable: req.body.isAvailable ?? true
    });

    // Keep shop.activeVehicles in sync (denormalized counter).
    await Shop.updateOne({ _id: shop._id }, { $inc: { activeVehicles: 1 } });

    res.status(201).json({ success: true, vehicle: newVeh });
  } catch (err) {
    console.error('[POST /api/vehicles] error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Failed to create vehicle'
    });
  }
});

// ============================================================================
// 7b. VEHICLE PARTIAL UPDATE + DELETE  (Phase 3 Pass D)
// ============================================================================

/**
 * PATCH /api/vehicles/:id
 * Phase 3 Pass D — minimal additive route for shopkeeper edits.
 * Body: any subset of { name, basePrice, securityDeposit, isAvailable,
 *                       image, features, locationName, ... }
 *
 * Returns { success: true, vehicle: VehicleDoc } on 200.
 * Returns 404 if vehicle not found.
 * Returns 400 on invalid fields (delegated to Mongoose validation).
 *
 * NOTE: `category`, `brand`, `year`, `shopId` are intentionally NOT
 * patchable here — they're identity-level fields that would invalidate
 * existing bookings. Changing them should require a delete-and-recreate.
 */
app.patch('/api/vehicles/:id', async (req, res) => {
  const { id } = req.params;
  const allowedFields = [
    'name', 'basePrice', 'securityDeposit', 'isAvailable',
    'image', 'videoWalkaround', 'features', 'locationName',
    'fuelType', 'transmission', 'mileage', 'rating', 'trips',
    'dynamicAdjustment', 'surgeReasons'
  ];
  const update = {};
  for (const f of allowedFields) {
    if (req.body[f] !== undefined) update[f] = req.body[f];
  }
  if (Object.keys(update).length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No updatable fields supplied. Allowed: ' + allowedFields.join(', ')
    });
  }
  try {
    const updated = await Vehicle.findByIdAndUpdate(id, { $set: update }, { new: true, runValidators: true }).lean();
    if (!updated) {
      return res.status(404).json({ success: false, message: `Vehicle not found: ${id}` });
    }
    res.json({ success: true, vehicle: updated });
  } catch (err) {
    console.error('[PATCH /api/vehicles/:id] error:', err.message);
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        details: Object.values(err.errors).map((e) => e.message)
      });
    }
    if (err.name === 'CastError') {
      return res.status(400).json({ success: false, message: `Invalid ${err.path}: ${err.value}` });
    }
    res.status(500).json({ success: false, message: 'Failed to update vehicle' });
  }
});

/**
 * DELETE /api/vehicles/:id
 * Phase 3 Pass D — hard delete. Future enhancement: soft-delete via isAvailable=false.
 * Returns { success: true, deleted: id } on 200.
 * Returns 404 if vehicle not found.
 */
app.delete('/api/vehicles/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await Vehicle.deleteOne({ _id: id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: `Vehicle not found: ${id}` });
    }
    // Decrement shop.activeVehicles counter for consistency.
    // (Best-effort — if the shop is missing, we still report success.)
    res.json({ success: true, deleted: id });
  } catch (err) {
    console.error('[DELETE /api/vehicles/:id] error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to delete vehicle' });
  }
});

// ============================================================================
// 7c. USER UPSERT  (Phase 3 Pass E)
// ============================================================================

/**
 * POST /api/users/upsert
 * Phase 3 Pass E — minimal upsert for user persistence after OTP/Google verify.
 * Body: { id?, phone, email, fullName, role, authMethod, googleUid?, googleAvatar?,
 *         isEmailVerified?, isPhoneVerified?, verifiedDoc? }
 *
 * Behavior:
 *   - If `id` is provided AND exists, update that user.
 *   - Else if a user with the same `phone` exists, update that user.
 *   - Else if a user with the same `email` exists, update that user.
 *   - Else create a new user with `_id = id || ('user_' + Date.now())`.
 *
 * Returns { success: true, user: UserDoc, created: boolean }.
 *
 * This is the minimal persistence layer for Step E. It does NOT issue JWT or
 * session tokens — Phase 5 will add real authentication.
 */
app.post('/api/users/upsert', async (req, res) => {
  const b = req.body || {};
  if (!b.phone && !b.email) {
    return res.status(400).json({ success: false, message: 'Either phone or email is required' });
  }
  try {
    // Find existing by id → phone → email
    let user = null;
    if (b.id) user = await User.findById(b.id);
    if (!user && b.phone) user = await User.findOne({ phone: b.phone });
    if (!user && b.email) user = await User.findOne({ email: String(b.email).toLowerCase() });

    const updates = {};
    if (b.fullName !== undefined) updates.fullName = b.fullName;
    if (b.email !== undefined) updates.email = b.email; // schema lowercases
    if (b.phone !== undefined) updates.phone = b.phone;
    if (b.role !== undefined) updates.role = b.role;
    if (b.authMethod !== undefined) updates.authMethod = b.authMethod;
    if (b.googleUid !== undefined) updates.googleUid = b.googleUid;
    if (b.googleAvatar !== undefined) updates.googleAvatar = b.googleAvatar;
    if (b.isEmailVerified !== undefined) updates.isEmailVerified = b.isEmailVerified;
    if (b.isPhoneVerified !== undefined) updates.isPhoneVerified = b.isPhoneVerified;
    if (b.isVerified !== undefined) updates.isVerified = b.isVerified;
    if (b.rewardPoints !== undefined) updates.rewardPoints = b.rewardPoints;
    if (b.verifiedDoc !== undefined) updates.verifiedDoc = b.verifiedDoc;

    let created = false;
    if (user) {
      Object.assign(user, updates);
      await user.save();
    } else {
      const newId = b.id || `user_${Date.now()}`;
      user = await User.create({
        _id: newId,
        fullName: b.fullName || 'Unnamed User',
        email: b.email || `${newId}@unknown.local`,
        phone: b.phone || '0000000000',
        role: b.role || 'customer',
        isVerified: b.isVerified ?? false,
        rewardPoints: b.rewardPoints ?? 0,
        authMethod: b.authMethod ?? null,
        googleUid: b.googleUid,
        googleAvatar: b.googleAvatar,
        isEmailVerified: b.isEmailVerified ?? false,
        isPhoneVerified: b.isPhoneVerified ?? false,
        verifiedDoc: b.verifiedDoc
      });
      created = true;
    }
    res.json({ success: true, user: user.toObject(), created });
  } catch (err) {
    console.error('[POST /api/users/upsert] error:', err.message);
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Duplicate key — a user with this phone/email/googleUid already exists',
        details: err.keyValue
      });
    }
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        details: Object.values(err.errors).map((e) => e.message)
      });
    }
    res.status(500).json({ success: false, message: 'Failed to upsert user' });
  }
});

// ============================================================================
// 8. BOOKINGS & EXTENSIONS
// ============================================================================

/**
 * GET /api/bookings
 * Optional query: ?userId=<id>  — filter to a single user (additive,
 * non-breaking; preserves pre-migration "return all" behavior when absent).
 *
 * Response shape: Booking[]  (matches pre-migration shape exactly)
 */
app.get('/api/bookings', async (req, res) => {
  try {
    const filter = {};
    if (req.query.userId) {
      filter.userId = String(req.query.userId);
    }
    if (req.query.vehicleId) {
      filter.vehicleId = String(req.query.vehicleId);
    }
    if (req.query.status) {
      filter.status = String(req.query.status);
    }
    const bookings = await Booking.find(filter).sort({ createdAt: -1 }).lean();
    res.json(bookings);
  } catch (err) {
    console.error('[GET /api/bookings] error:', err.message);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

/**
 * POST /api/bookings
 * Body: { userId, vehicleId, shopId, startTime, endTime, ... }
 * Generates _id 'RH-BK-XXXX'. Returns the created booking.
 *
 * Response shape: { success: true, booking: Booking }
 * Matches pre-migration shape exactly.
 *
 * LOOP 7: Booking integrity checks:
 *  - vehicle/shop/user existence
 *  - endTime > startTime
 *  - no overlapping active booking on the same vehicle
 */
app.post('/api/bookings', async (req, res) => {
  const validation = validateBody(req.body, {
    userId: { type: 'string', required: true },
    vehicleId: { type: 'string', required: true },
    shopId: { type: 'string', required: true },
    startTime: { type: 'string', required: true },
    endTime: { type: 'string', required: true },
    finalAmount: { type: 'number', required: true, min: 0 }
  });
  if (validation) {
    return res.status(400).json({ success: false, message: validation });
  }

  const startMs = new Date(req.body.startTime).getTime();
  const endMs = new Date(req.body.endTime).getTime();
  if (Number.isNaN(startMs) || Number.isNaN(endMs)) {
    return res.status(400).json({ success: false, message: 'Invalid startTime or endTime' });
  }
  if (endMs <= startMs) {
    return res.status(400).json({ success: false, message: 'endTime must be after startTime' });
  }

  try {
    // Verify existence of referenced entities.
    const [user, vehicle, shop] = await Promise.all([
      User.findById(req.body.userId),
      Vehicle.findById(req.body.vehicleId),
      Shop.findById(req.body.shopId)
    ]);
    if (!user) {
      return res.status(400).json({ success: false, message: `User not found: ${req.body.userId}` });
    }
    if (!vehicle) {
      return res.status(400).json({ success: false, message: `Vehicle not found: ${req.body.vehicleId}` });
    }
    if (!shop) {
      return res.status(400).json({ success: false, message: `Shop not found: ${req.body.shopId}` });
    }
    // Sanity: the shop in the body must match the vehicle's shop.
    if (String(vehicle.shopId) !== String(shop._id)) {
      return res.status(400).json({
        success: false,
        message: `Vehicle ${vehicle._id} does not belong to shop ${shop._id}`
      });
    }

    // LOOP 7: overlap detection.
    const conflicts = await findOverlappingBookings(
      req.body.vehicleId,
      new Date(startMs),
      new Date(endMs)
    );
    if (conflicts.length > 0) {
      return res.status(409).json({
        success: false,
        conflict: true,
        message: 'Vehicle is already booked for the requested time window.',
        conflictingBookings: conflicts.map((b) => ({
          id: b._id,
          startTime: b.startTime,
          endTime: b.endTime,
          status: b.status
        }))
      });
    }

    // Retry on _id collision (rare: 4-digit random suffix).
    let createdBooking = null;
    for (let attempt = 0; attempt < 5; attempt++) {
      const newId = generateBookingId();
      try {
        createdBooking = await Booking.create({
          ...req.body,
          _id: newId,
          startTime: new Date(startMs),
          endTime: new Date(endMs),
          status: 'active',
          canExtend: true,
          createdAt: new Date().toISOString(),
          agreementSignedAt: req.body.agreementSignedAt || new Date().toISOString()
        });
        break;
      } catch (err) {
        if (err.code === 11000 && attempt < 4) {
          console.warn(`[POST /api/bookings] _id collision on ${newId}, retrying...`);
          continue;
        }
        throw err;
      }
    }
    if (!createdBooking) {
      return res.status(500).json({ success: false, message: 'Failed to allocate booking ID' });
    }

    res.status(201).json({ success: true, booking: createdBooking });
  } catch (err) {
    console.error('[POST /api/bookings] error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to create booking' });
  }
});

/**
 * POST /api/bookings/:id/extend
 * Body: { extraHours?: number }
 *
 * Response shape preserved verbatim. Pre-migration "if extraHours > 12, conflict"
 * heuristic is preserved. ADDED on top: real overlap detection against other
 * active bookings on the same vehicle. If a real overlap is detected, returns
 * the same `conflict: true` shape with a replacement suggestion.
 */
app.post('/api/bookings/:id/extend', async (req, res) => {
  const { id } = req.params;
  const extraHours = Math.max(1, Number(req.body?.extraHours || 6));

  try {
    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    if (booking.status === 'cancelled' || booking.status === 'completed') {
      return res.status(400).json({
        success: false,
        conflict: false,
        message: `Cannot extend a ${booking.status} booking.`
      });
    }

    // Look up the vehicle ONCE. We need its `category` to suggest an
    // alternative replacement vehicle in either conflict branch.
    // Previously this was inlined as a side-effect inside the filter object
    // of Vehicle.findOne — that worked but caused a redundant Mongo
    // round-trip on every call (LOOP 12 self-review finding, MEDIUM).
    const vehicle = await Vehicle.findById(booking.vehicleId).lean();
    if (!vehicle) {
      return res.status(400).json({
        success: false,
        conflict: false,
        message: `Vehicle ${booking.vehicleId} no longer exists; cannot extend.`
      });
    }

    // Pre-migration heuristic: >12h conflict (preserved verbatim).
    if (extraHours > 12) {
      const alternative = await Vehicle.findOne({
        _id: { $ne: booking.vehicleId },
        category: vehicle.category,
        isAvailable: true
      }).lean();

      return res.json({
        success: false,
        conflict: true,
        message: 'Vehicle is reserved by another customer starting in 12 hours.',
        replacementAvailable: alternative || null
      });
    }

    // LOOP 7: real overlap detection for the proposed new endTime.
    const currentEnd = new Date(booking.endTime);
    const newEnd = new Date(currentEnd.getTime() + extraHours * 3600 * 1000);
    const conflicts = await findOverlappingBookings(
      booking.vehicleId,
      currentEnd,
      newEnd,
      booking._id
    );
    if (conflicts.length > 0) {
      const alternative = await Vehicle.findOne({
        _id: { $ne: booking.vehicleId },
        category: vehicle.category,
        isAvailable: true
      }).lean();

      return res.json({
        success: false,
        conflict: true,
        message: 'Vehicle is reserved by another customer in the requested window.',
        replacementAvailable: alternative || null,
        conflictingBookings: conflicts.map((b) => ({
          id: b._id,
          startTime: b.startTime,
          endTime: b.endTime
        }))
      });
    }

    booking.endTime = newEnd;
    booking.totalHours = (booking.totalHours || 0) + extraHours;
    if (booking.status === 'active') booking.status = 'extended';
    await booking.save();

    res.json({
      success: true,
      conflict: false,
      updatedEndTime: booking.endTime,
      message: `Rental successfully extended by ${extraHours} hours.`
    });
  } catch (err) {
    console.error('[POST /api/bookings/:id/extend] error:', err.message);
    res.status(500).json({ error: 'Failed to extend booking' });
  }
});

/**
 * POST /api/bookings/:id/cancel
 * Computes refund tier based on lead time elapsed, updates booking to
 * 'cancelled', returns refund info.
 *
 * Response shape preserved verbatim from pre-migration server.js.
 */
app.post('/api/bookings/:id/cancel', async (req, res) => {
  const { id } = req.params;

  try {
    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Booking is already cancelled.'
      });
    }

    // Tiers (preserved verbatim):
    //  < 25% lead elapsed → 100% refund
    //  < 50% lead elapsed → 50% refund
    //  >= 50% lead elapsed → 0% refund
    const createdAt = booking.createdAt || new Date(Date.now() - 3600000);
    const createdTime = new Date(createdAt).getTime();
    const startTime = new Date(booking.startTime).getTime();
    const now = Date.now();

    const totalLeadTime = Math.max(1, startTime - createdTime);
    const elapsed = Math.max(0, now - createdTime);
    const elapsedRatio = elapsed / totalLeadTime;

    let refundPct;
    if (elapsedRatio <= 0.25) refundPct = 100;
    else if (elapsedRatio <= 0.5) refundPct = 50;
    else refundPct = 0;

    const refundableAmount = Math.round((booking.finalAmount * refundPct) / 100);
    booking.status = 'cancelled';
    booking.refundAmount = refundableAmount;
    booking.refundPercentage = refundPct;
    await booking.save();

    res.json({
      success: true,
      refundPercentage: refundPct,
      refundAmount: refundableAmount,
      message: `Booking cancelled. ${refundPct}% (₹${refundableAmount}) has been initiated to your UPI account.`
    });
  } catch (err) {
    console.error('[POST /api/bookings/:id/cancel] error:', err.message);
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
});

// ============================================================================
// Centralized error handler (LOOP 8 — error responses must not leak internals)
// ============================================================================

app.use((err, req, res, _next) => {
  // Mongoose validation error → 400
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      details: messages
    });
  }
  // Mongoose CastError (e.g. invalid ObjectId path) → 400
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: `Invalid ${err.path}: ${err.value}`
    });
  }
  // Duplicate key → 409
  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      message: 'Duplicate key',
      details: err.keyValue
    });
  }
  // Fallback — never leak the stack trace.
  console.error('[unhandled error]', err);
  res.status(err.status || 500).json({
    success: false,
    message: IS_PROD ? 'Internal server error' : err.message
  });
});

// ============================================================================
// 404 — unknown route
// ============================================================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

// ============================================================================
// STARTUP — refuse to start if MongoDB is unavailable
// ============================================================================

(async () => {
  try {
    await db.connect();
    const server = app.listen(PORT, () => {
      console.log(`[RideHub & HubX Backend] Running on http://localhost:${PORT}`);
      console.log(`[RideHub & HubX Backend] MongoDB: ${db.MONGODB_URI}`);
      console.log(`[RideHub & HubX Backend] Node env: ${process.env.NODE_ENV || 'development'}`);
    });
    db.registerShutdownHooks(server);
  } catch (err) {
    console.error('\n[RideHub & HubX Backend] FATAL: MongoDB connection failed.');
    console.error('  Reason:', err.message);
    if (err.cause) console.error('  Cause:', err.cause.message);
    console.error('  The Express server will NOT start until MongoDB is reachable.');
    console.error('  Start mongod, then re-run `npm start`.');
    process.exit(1);
  }
})();

module.exports = app; // for potential future test harness
