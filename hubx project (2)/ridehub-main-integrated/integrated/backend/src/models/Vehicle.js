/**
 * Vehicle model (scooties, bikes, cars).
 *
 * `_id` is String to preserve slug identifiers ('veh_scooty_1', 'veh_bike_1',
 * ...). The frontend hardcodes 'veh_scooty_1' as the initial selected vehicle
 * (AppContext.tsx:102), so switching to ObjectId would break the demo's
 * default selection on first load.
 *
 * `mileage` is kept as String (e.g. "50 kmpl", "110 km/charge") because the
 * frontend displays the unit alongside the number. Converting to a numeric
 * field would lose the unit and force a frontend type change.
 */

const mongoose = require('mongoose');

const VehicleSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    shopId: {
      type: String,
      ref: 'Shop',
      required: true,
      index: true
    },
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['scooty', 'bike', 'car'],
      required: true,
      index: true
    },
    brand: { type: String, required: true, trim: true },
    year: { type: Number, required: true, min: 1990, max: 2100 },
    fuelType: { type: String, default: 'Petrol' },
    transmission: { type: String, default: 'Automatic' },
    mileage: { type: String, default: null },
    basePrice: {
      type: Number,
      required: true,
      min: 0,
      index: true
    },
    securityDeposit: { type: Number, default: 1500, min: 0 },
    rating: { type: Number, default: 4.85, min: 0, max: 5 },
    trips: { type: Number, default: 0, min: 0 },
    isAvailable: { type: Boolean, default: true, index: true },
    image: { type: String, default: null },
    videoWalkaround: { type: String, default: null },
    features: { type: [String], default: [] },
    locationName: { type: String, default: null },
    // Dynamic-pricing fields. These are mutable via /api/vehicles (POST) today;
    // we preserve them on the vehicle doc so re-seeding doesn't overwrite.
    dynamicAdjustment: { type: Number, default: 0 },
    surgeReasons: { type: [String], default: [] }
  },
  {
    _id: false,
    timestamps: true,
    strict: true
  }
);

// Compound index supporting the most common search pattern:
//   filter by category + availability + price ceiling.
// Matches the existing GET /api/vehicles handler's filter logic.
VehicleSchema.index(
  { category: 1, isAvailable: 1, basePrice: 1 },
  { name: 'vehicle_search_compound' }
);

module.exports = mongoose.model('Vehicle', VehicleSchema, 'vehicles');
