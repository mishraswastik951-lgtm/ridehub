/**
 * Shop model (HubX partner stores).
 *
 * `_id` is String to preserve slug-style identifiers ('shop_1', 'shop_2', ...)
 * used throughout the codebase. The frontend hardcodes 'shop_1' as the initial
 * selected shop (AppContext.tsx:103), so switching to ObjectId would break the
 * demo's default selection.
 *
 * Trust breakdown is embedded (4 small numeric fields) — matches the Shop type
 * in src/types/index.ts and avoids an unnecessary extra collection.
 */

const mongoose = require('mongoose');

const TrustBreakdownSchema = new mongoose.Schema(
  {
    honesty: { type: Number, default: 99.2, min: 0, max: 100 },
    vehicleCondition: { type: Number, default: 97.5, min: 0, max: 100 },
    punctuality: { type: Number, default: 98.4, min: 0, max: 100 },
    communication: { type: Number, default: 99.0, min: 0, max: 100 }
  },
  { _id: false }
);

const ShopSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    ownerId: {
      type: String,
      ref: 'User',
      required: true,
      index: true
    },
    name: { type: String, required: true, trim: true },
    address: { type: String, required: true },
    city: { type: String, default: 'Bengaluru', index: true },
    // NOTE: Keeping flat lat/lng (not GeoJSON Point) to preserve the exact
    // API contract returned by GET /api/vehicles (which spreads the shop object
    // verbatim into vehicle responses). A GeoJSON field + 2dsphere index can
    // be added later when a "shops near me" query is actually needed; for now
    // it would be a dead index. See DEFERRED_COLLECTIONS.md.
    lat: { type: Number, required: true, min: -90, max: 90 },
    lng: { type: Number, required: true, min: -180, max: 180 },
    isHubX: { type: Boolean, default: true },
    hubxPlan: { type: String, default: '1-Month Free Trial' },
    trialDaysRemaining: { type: Number, default: 30, min: 0 },
    trustScore: { type: Number, default: 4.8, min: 0, max: 5 },
    trustBreakdown: { type: TrustBreakdownSchema, default: () => ({}) },
    totalBookings: { type: Number, default: 0, min: 0 },
    activeVehicles: { type: Number, default: 0, min: 0 },
    badge: { type: String, default: null }
  },
  {
    _id: false,
    timestamps: true,
    strict: true
  }
);

module.exports = mongoose.model('Shop', ShopSchema, 'shops');
