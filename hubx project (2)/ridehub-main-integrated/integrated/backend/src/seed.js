/**
 * Idempotent seeder for RideHub MongoDB.
 *
 * Two modes:
 *   - `npm run seed`        (default) — Upsert seed records with $setOnInsert.
 *                            NEVER overwrites existing records or their fields.
 *                            Safe to run repeatedly; running it twice is a no-op
 *                            for the second pass.
 *   - `npm run seed:force`  (--reset) — Delete ONLY the seed _ids, then re-insert.
 *                            Non-seed records (e.g. bookings created via the API)
 *                            are NOT touched.
 *
 * Seed data is extracted verbatim from the pre-migration in-memory arrays in
 * backend/server.js, with one integrity fix: `user_shop_2` was referenced by
 * shop_2's ownerId but did not exist in the original in-memory users array
 * (LOOP 5 — orphaned reference). We add it as a minimal stub to preserve
 * referential integrity without changing the public-facing data.
 *
 * The frontend mockData.ts has MORE shops/vehicles/coupons/plans than the
 * backend seed. That is by design — those extras are frontend-only concerns
 * (no backend endpoint exists for them today) and are NOT seeded.
 *
 * Run:
 *   node src/seed.js           # default mode
 *   node src/seed.js --reset   # force mode
 */

require('dotenv').config();

const mongoose = require('mongoose');
const db = require('./config/db');
const User = require('./models/User');
const Shop = require('./models/Shop');
const Vehicle = require('./models/Vehicle');
const Booking = require('./models/Booking');

// ─────────────────────────────────────────────────────────────────────────────
// SEED DATA — single source of truth
// ─────────────────────────────────────────────────────────────────────────────

const SEED_USERS = [
  {
    _id: 'user_cust_1',
    fullName: 'Aditya Sharma',
    phone: '+91 98765 43210',
    email: 'aditya.sharma@example.com',
    role: 'customer',
    isVerified: true,
    rewardPoints: 480,
    authMethod: 'phone_otp',
    isPhoneVerified: true,
    isEmailVerified: false,
    verifiedDoc: {
      type: 'Driving Licence',
      number: 'KA0520210089421',
      name: 'Aditya Sharma',
      dob: '1995-08-14',
      expiry: '2042-08-13',
      category: 'LMV / MCWG',
      issuingRTO: 'KA-05 Jayanagar / Bangalore South'
    }
  },
  {
    _id: 'user_shop_1',
    fullName: 'Rajesh Motors & Rentals',
    phone: '+91 98450 11223',
    email: 'contact@rajeshrentals.in',
    role: 'shopkeeper',
    isVerified: true,
    rewardPoints: 1250,
    authMethod: 'phone_otp',
    isPhoneVerified: true,
    isEmailVerified: false
  },
  // Integrity fix: referenced as ownerId by shop_2 in the original in-memory
  // seed but never created. Adding as a minimal stub so the foreign-key-style
  // reference resolves. No public-facing behavior change.
  {
    _id: 'user_shop_2',
    fullName: 'GreenWheels Koramangala Owner',
    phone: '+91 98450 99887',
    email: 'owner@greenwheels.in',
    role: 'shopkeeper',
    isVerified: true,
    rewardPoints: 0,
    authMethod: 'phone_otp',
    isPhoneVerified: true,
    isEmailVerified: false
  }
];

const SEED_SHOPS = [
  {
    _id: 'shop_1',
    name: 'Apex Mobility Indiranagar',
    ownerId: 'user_shop_1',
    address: '100 Feet Road, Indiranagar, Bengaluru',
    city: 'Bengaluru',
    lat: 12.9784,
    lng: 77.6408,
    isHubX: true,
    hubxPlan: 'Yearly Plan (Active)',
    trialDaysRemaining: 0,
    trustScore: 4.92,
    trustBreakdown: {
      honesty: 99.4,
      vehicleCondition: 98.6,
      punctuality: 99.1,
      communication: 99.8
    },
    totalBookings: 842,
    activeVehicles: 18,
    badge: 'Verified Honest Shop'
  },
  {
    _id: 'shop_2',
    name: 'GreenWheels Koramangala',
    ownerId: 'user_shop_2',
    address: '5th Block, Koramangala, Bengaluru',
    city: 'Bengaluru',
    lat: 12.9352,
    lng: 77.6245,
    isHubX: true,
    hubxPlan: '1-Month Free Trial',
    trialDaysRemaining: 18,
    trustScore: 4.84,
    trustBreakdown: {
      honesty: 98.8,
      vehicleCondition: 97.4,
      punctuality: 98.0,
      communication: 99.2
    },
    totalBookings: 512,
    activeVehicles: 12,
    badge: 'HubX Prime Partner'
  }
];

const SEED_VEHICLES = [
  {
    _id: 'veh_scooty_1',
    shopId: 'shop_1',
    name: 'Honda Activa 6G Premium',
    category: 'scooty',
    brand: 'Honda',
    year: 2024,
    fuelType: 'Petrol',
    transmission: 'Automatic',
    mileage: '50 kmpl',
    basePrice: 450,
    securityDeposit: 1000,
    rating: 4.9,
    trips: 184,
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1200&q=80',
    videoWalkaround: 'https://assets.mixkit.co/videos/preview/mixkit-motorcycle-parked-on-a-city-street-42512-large.mp4',
    features: ['Combi-Brake System', 'External Fuel Fill', 'LED Headlamp', 'Helmets Included'],
    locationName: 'Indiranagar Metro (0.4 km)'
  },
  {
    _id: 'veh_scooty_2',
    shopId: 'shop_1',
    name: 'Ather 450X Gen 3 (Electric)',
    category: 'scooty',
    brand: 'Ather',
    year: 2024,
    fuelType: 'Electric',
    transmission: 'Automatic',
    mileage: '110 km/charge',
    basePrice: 590,
    securityDeposit: 1500,
    rating: 4.95,
    trips: 220,
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=1200&q=80',
    videoWalkaround: 'https://assets.mixkit.co/videos/preview/mixkit-motorcycle-parked-on-a-city-street-42512-large.mp4',
    features: ['Touchscreen Navigation', 'Warp Mode 0-40 in 3.3s', 'Portable Fast Charger', 'Reverse Mode'],
    locationName: 'Indiranagar 100ft Rd (0.2 km)'
  },
  {
    _id: 'veh_bike_1',
    shopId: 'shop_1',
    name: 'Royal Enfield Hunter 350 Dapper',
    category: 'bike',
    brand: 'Royal Enfield',
    year: 2024,
    fuelType: 'Petrol',
    transmission: 'Manual 5-Speed',
    mileage: '36 kmpl',
    basePrice: 850,
    securityDeposit: 2500,
    rating: 4.92,
    trips: 145,
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?auto=format&fit=crop&w=1200&q=80',
    videoWalkaround: 'https://assets.mixkit.co/videos/preview/mixkit-motorcycle-parked-on-a-city-street-42512-large.mp4',
    features: ['Dual-channel ABS', 'Tripper Navigation', 'USB Fast Charger', 'Crash Guard + Panniers'],
    locationName: 'Indiranagar BDA Complex (0.6 km)'
  },
  {
    _id: 'veh_bike_2',
    shopId: 'shop_2',
    name: 'Yamaha MT-15 V2 Stealth Black',
    category: 'bike',
    brand: 'Yamaha',
    year: 2024,
    fuelType: 'Petrol',
    transmission: 'Manual 6-Speed',
    mileage: '48 kmpl',
    basePrice: 950,
    securityDeposit: 2500,
    rating: 4.88,
    trips: 98,
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1200&q=80',
    videoWalkaround: 'https://assets.mixkit.co/videos/preview/mixkit-motorcycle-parked-on-a-city-street-42512-large.mp4',
    features: ['Assist & Slipper Clutch', 'USD Front Forks', 'Traction Control', 'Bluetooth Connectivity'],
    locationName: 'Koramangala Sony World (0.3 km)'
  },
  {
    _id: 'veh_car_1',
    shopId: 'shop_1',
    name: 'Hyundai i20 Asta Turbo 1.0',
    category: 'car',
    brand: 'Hyundai',
    year: 2023,
    fuelType: 'Petrol',
    transmission: 'Automatic 7-DCT',
    mileage: '18 kmpl',
    basePrice: 1800,
    securityDeposit: 5000,
    rating: 4.89,
    trips: 76,
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80',
    videoWalkaround: 'https://assets.mixkit.co/videos/preview/mixkit-white-car-traveling-on-a-curved-mountain-road-42674-large.mp4',
    features: ['Sunroof', 'Wireless Apple CarPlay/Android Auto', 'Cruise Control', 'Fastag Preloaded'],
    locationName: 'Indiranagar 12th Main (0.5 km)'
  },
  {
    _id: 'veh_car_2',
    shopId: 'shop_2',
    name: 'Mahindra Thar 4x4 Hard Top',
    category: 'car',
    brand: 'Mahindra',
    year: 2024,
    fuelType: 'Diesel',
    transmission: 'Automatic 4WD',
    mileage: '14 kmpl',
    basePrice: 3200,
    securityDeposit: 8000,
    rating: 4.96,
    trips: 62,
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80',
    videoWalkaround: 'https://assets.mixkit.co/videos/preview/mixkit-white-car-traveling-on-a-curved-mountain-road-42674-large.mp4',
    features: ['Mechanical Locking Diff', 'All-Terrain Tyres', 'Roll Cage', 'Convertible Hardtop'],
    locationName: 'Koramangala 80ft Rd (0.7 km)'
  }
];

// The demo booking uses relative time ("4 hours ago" start, "20 hours left" end)
// computed once at seed-time. On re-seed (default mode), the existing booking is
// NOT overwritten, so this relative computation only happens on first seed.
// Use --reset (npm run seed:force) to refresh the demo booking's timestamps.
function buildSeedBooking() {
  const now = Date.now();
  return {
    _id: 'RH-BK-9281',
    userId: 'user_cust_1',
    vehicleId: 'veh_scooty_1',
    vehicleName: 'Honda Activa 6G Premium',
    shopId: 'shop_1',
    shopName: 'Apex Mobility Indiranagar',
    startTime: new Date(now - 3600 * 1000 * 4).toISOString(),
    endTime: new Date(now + 3600 * 1000 * 20).toISOString(),
    totalHours: 24,
    basePrice: 450,
    dynamicAdjustment: 70,
    surgeReasons: ['Weekend City Leisure Peak (+₹40)', 'Sunny Clear Weather (+₹30)'],
    securityDeposit: 1000,
    taxesAndGst: 93,
    pointsDiscount: 0,
    finalAmount: 1613,
    upiRef: 'UPI-983021984210',
    status: 'active',
    canExtend: true,
    pickupLocation: '100 Feet Road, Indiranagar, Bengaluru',
    agreementSignedAt: new Date(now - 3600 * 1000 * 5).toISOString()
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// SEED EXECUTION
// ─────────────────────────────────────────────────────────────────────────────

const FORCE_RESET = process.argv.includes('--reset') || process.argv.includes('--force');

async function resetMode() {
  console.log('[seed] FORCE mode: deleting ONLY seed _ids before re-insert...');
  const seedBooking = buildSeedBooking();
  // Declarative spec — avoids the Object.entries destructuring bug where
  // `Model` ends up being the string key name instead of the model object.
  const modelSpecs = [
    { name: 'User', model: User, ids: SEED_USERS.map((u) => u._id) },
    { name: 'Shop', model: Shop, ids: SEED_SHOPS.map((s) => s._id) },
    { name: 'Vehicle', model: Vehicle, ids: SEED_VEHICLES.map((v) => v._id) },
    { name: 'Booking', model: Booking, ids: [seedBooking._id] }
  ];
  for (const { name, model, ids } of modelSpecs) {
    const r = await model.deleteMany({ _id: { $in: ids } });
    console.log(
      `[seed] ${name}: deleted ${r.deletedCount} seed records (non-seed records untouched)`
    );
  }
}

async function defaultMode() {
  console.log('[seed] DEFAULT mode: upserting seed records with $setOnInsert (existing records untouched)');
}

async function runSeed() {
  await db.connect();
  console.log(`[seed] Connected to: ${db.MONGODB_URI}`);
  console.log(`[seed] Target database: ${mongoose.connection.name}\n`);

  if (FORCE_RESET) await resetMode();
  else await defaultMode();

  // ── Upsert users ──────────────────────────────────────────────────────────
  const userOps = SEED_USERS.map((u) => ({
    updateOne: {
      filter: { _id: u._id },
      upsert: true,
      // $setOnInsert so existing users (including those whose rewardPoints
      // were changed by /api/verify-license bonuses) are NEVER overwritten.
      update: { $setOnInsert: u }
    }
  }));
  const userRes = await User.bulkWrite(userOps, { ordered: false });
  console.log(`[seed] users:    inserted=${userRes.upsertedCount}  matched=${userRes.matchedCount}  modified=${userRes.modifiedCount}`);

  // ── Upsert shops ──────────────────────────────────────────────────────────
  const shopOps = SEED_SHOPS.map((s) => ({
    updateOne: {
      filter: { _id: s._id },
      upsert: true,
      update: { $setOnInsert: s }
    }
  }));
  const shopRes = await Shop.bulkWrite(shopOps, { ordered: false });
  console.log(`[seed] shops:    inserted=${shopRes.upsertedCount}  matched=${shopRes.matchedCount}  modified=${shopRes.modifiedCount}`);

  // ── Upsert vehicles ────────────────────────────────────────────────────────
  const vehicleOps = SEED_VEHICLES.map((v) => ({
    updateOne: {
      filter: { _id: v._id },
      upsert: true,
      update: { $setOnInsert: v }
    }
  }));
  const vehicleRes = await Vehicle.bulkWrite(vehicleOps, { ordered: false });
  console.log(`[seed] vehicles: inserted=${vehicleRes.upsertedCount}  matched=${vehicleRes.matchedCount}  modified=${vehicleRes.modifiedCount}`);

  // ── Upsert the demo booking ────────────────────────────────────────────────
  const seedBooking = buildSeedBooking();
  const bookingRes = await Booking.bulkWrite(
    [
      {
        updateOne: {
          filter: { _id: seedBooking._id },
          upsert: true,
          update: { $setOnInsert: seedBooking }
        }
      }
    ],
    { ordered: false }
  );
  console.log(`[seed] bookings: inserted=${bookingRes.upsertedCount}  matched=${bookingRes.matchedCount}  modified=${bookingRes.modifiedCount}`);

  // ── Final inventory check ──────────────────────────────────────────────────
  const [users, shops, vehicles, bookings] = await Promise.all([
    User.countDocuments(),
    Shop.countDocuments(),
    Vehicle.countDocuments(),
    Booking.countDocuments()
  ]);
  console.log(`\n[seed] Final collection counts:`);
  console.log(`  users:    ${users}`);
  console.log(`  shops:    ${shops}`);
  console.log(`  vehicles: ${vehicles}`);
  console.log(`  bookings: ${bookings}`);

  // Integrity check: are there any vehicles referencing non-existent shops?
  const orphanShops = await Vehicle.aggregate([
    {
      $lookup: {
        from: 'shops',
        localField: 'shopId',
        foreignField: '_id',
        as: 'shop'
      }
    },
    { $match: { 'shop.0': { $exists: false } } },
    { $project: { _id: 1, shopId: 1 } }
  ]);
  if (orphanShops.length > 0) {
    console.warn(`\n[seed] WARN: ${orphanShops.length} vehicles reference non-existent shops:`);
    console.warn(JSON.stringify(orphanShops, null, 2));
  } else {
    console.log(`\n[seed] Integrity check: all vehicles reference valid shops ✓`);
  }

  await db.disconnect();
  console.log('\n[seed] Done.');
}

runSeed().catch((err) => {
  console.error('\n[seed] FAILED:', err.message);
  if (err.cause) console.error('  cause:', err.cause.message);
  db.disconnect().finally(() => process.exit(1));
});
