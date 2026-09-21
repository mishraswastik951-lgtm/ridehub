/**
 * User model.
 *
 * `_id` is declared as String to preserve the existing slug-style identifiers
 * used throughout the codebase (e.g. 'user_cust_1', 'user_shop_1'). The
 * frontend hardcodes these defaults, so switching to ObjectId would silently
 * break the demo's initial selected user/vehicle/shop. See MIGRATION_REPORT.md
 * for the full rationale.
 *
 * Schema mirrors the User TypeScript interface in src/types/index.ts and the
 * in-memory seed in backend/server.js (pre-migration).
 */

const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    fullName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      // Set when the user has gone through email-OTP verification.
      index: true
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      // RideHub business rule: 1 phone number -> 1 identity. Enforced at DB
      // level via unique index (also enforced client-side in AuthModal.tsx).
      index: true
    },
    role: {
      type: String,
      enum: ['customer', 'shopkeeper', 'admin'],
      default: 'customer',
      required: true,
      index: true
    },
    isVerified: { type: Boolean, default: false },
    rewardPoints: { type: Number, default: 0, min: 0 },
    authMethod: {
      type: String,
      enum: ['phone_otp', 'email_otp', 'google'],
      default: null
    },
    googleUid: {
      type: String,
      // NOTE: do NOT default to null. MongoDB's sparse unique index skips
      // MISSING fields but indexes NULL fields as values, so a default of
      // null causes "duplicate key { googleUid: null }" on the 2nd user.
      // Leaving this without a default means the field is omitted entirely
      // when not provided, and the sparse index skips it as intended.
      index: { unique: true, sparse: true }
    },
    googleAvatar: { type: String, default: null },
    isEmailVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false },
    verifiedDoc: {
      // Embedded subdoc — matches the User type from src/types/index.ts.
      // Keeping this inline (not a separate verifications collection) for
      // two reasons: (1) preserves the exact API contract where /api/verify-license
      // returns verifiedDoc data inline on the user; (2) avoids creating a
      // collection with no current reader. A standalone verifications audit
      // collection is documented as a deferred enhancement.
      type: {
        type: String,
        default: null
      },
      number: { type: String, default: null },
      name: { type: String, default: null },
      dob: { type: String, default: null },
      expiry: { type: String, default: null },
      category: { type: String, default: null },
      issuingRTO: { type: String, default: null }
    }
  },
  {
    _id: false, // we manage _id ourselves (string slug)
    timestamps: true,
    // Strict mode rejects unknown fields. Important so a stray field in
    // req.body cannot accidentally add columns to the collection.
    strict: true
  }
);

module.exports = mongoose.model('User', UserSchema, 'users');
