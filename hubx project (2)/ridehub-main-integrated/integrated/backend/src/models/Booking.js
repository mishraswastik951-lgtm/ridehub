/**
 * Booking model.
 *
 * `_id` is String to preserve the 'RH-BK-XXXX' display format (e.g. 'RH-BK-9281').
 * The frontend uses booking IDs in URLs and toast messages; switching to
 * ObjectId would force frontend changes. We generate the same format on insert.
 *
 * Denormalized snapshots `vehicleName` and `shopName` are kept inline because
 * the existing API contract returns them as part of the booking object (see
 * GET /api/bookings response in pre-migration server.js).
 *
 * `status` and `canExtend` match the Booking type in src/types/index.ts.
 */

const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    userId: {
      type: String,
      ref: 'User',
      required: true,
      index: true
    },
    vehicleId: {
      type: String,
      ref: 'Vehicle',
      required: true,
      index: true
    },
    // Snapshot fields — preserved at booking-creation time so historical
    // receipts remain stable even if the vehicle/shop is later renamed.
    vehicleName: { type: String, required: true },
    shopId: {
      type: String,
      ref: 'Shop',
      required: true,
      index: true
    },
    shopName: { type: String, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    totalHours: { type: Number, required: true, min: 1 },
    basePrice: { type: Number, required: true, min: 0 },
    dynamicAdjustment: { type: Number, default: 0 },
    surgeReasons: { type: [String], default: [] },
    securityDeposit: { type: Number, required: true, min: 0 },
    taxesAndGst: { type: Number, required: true, min: 0 },
    pointsDiscount: { type: Number, default: 0, min: 0 },
    finalAmount: { type: Number, required: true, min: 0 },
    upiRef: { type: String, default: null },
    status: {
      type: String,
      enum: ['upcoming', 'active', 'extended', 'completed', 'cancelled'],
      default: 'upcoming',
      required: true,
      index: true
    },
    canExtend: { type: Boolean, default: true },
    pickupLocation: { type: String, default: null },
    refundAmount: { type: Number, default: 0, min: 0 },
    refundPercentage: { type: Number, default: 0, min: 0, max: 100 },
    agreementSignedAt: { type: Date, default: null }
  },
  {
    _id: false,
    timestamps: true, // adds createdAt, updatedAt
    strict: true
  }
);

// Compound index for the two most common booking queries:
//   - "show me a user's bookings" (used by GET /api/bookings?userId=...)
//   - "show me a user's active bookings" (filter by status)
BookingSchema.index(
  { userId: 1, status: 1, startTime: -1 },
  { name: 'user_bookings_status' }
);

// Compound index for overlap detection (LOOP 7 — booking integrity).
// Used by the server-side check `Booking.find({ vehicleId, status: { $in: [...active] },
// startTime: { $lt: newEnd }, endTime: { $gt: newStart } })` before allowing
// an extension or new booking on the same vehicle.
BookingSchema.index(
  { vehicleId: 1, startTime: 1, endTime: 1 },
  { name: 'vehicle_overlap_lookup' }
);

module.exports = mongoose.model('Booking', BookingSchema, 'bookings');
