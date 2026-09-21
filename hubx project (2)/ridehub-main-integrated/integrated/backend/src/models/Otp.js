/**
 * OTP model.
 *
 * Replaces the in-memory `otpStore` Map in the pre-migration server.js.
 *
 * Design:
 *  - `_id` is the lookup key in the form `${channel}:${identifier}` (e.g.
 *    "phone:+91 98765 43210" or "email:aditya@example.com"). This matches
 *    the pre-migration in-memory keying exactly.
 *  - `otpHash` is an HMAC-SHA256 hex digest of the OTP using
 *    OTP_HASH_SECRET. We never store plaintext. In dev mode the plaintext
 *    is still RETURNED in the API response so the frontend's auto-fill
 *    keeps working; the on-disk copy is always hashed.
 *  - `attempts` counts failed verification tries. After 5 attempts, the
 *    record is considered exhausted and the next verify will refuse.
 *  - `expiresAt` drives a MongoDB TTL index — the record auto-deletes 5
 *    minutes after creation, replacing the manual cleanup loop in the
 *    pre-migration code.
 *
 * Why a separate collection vs. embedding on User:
 *   - OTPs are short-lived transient state. Mixing them with the long-lived
 *     User document would force rewrites of the user record on every OTP
 *     send/verify, which loses purpose and complicates auditing.
 */

const mongoose = require('mongoose');

const OtpSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    otpHash: { type: String, required: true },
    channel: {
      type: String,
      enum: ['phone', 'email'],
      required: true
    },
    attempts: { type: Number, default: 0, min: 0, max: 5 },
    // TTL index: MongoDB background job deletes this doc at expiresAt.
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }
    }
  },
  {
    _id: false,
    // No timestamps — we already have expiresAt. createdAt would be redundant
    // (it equals expiresAt - OTP_TTL_SECONDS).
    timestamps: false,
    strict: true
  }
);

module.exports = mongoose.model('Otp', OtpSchema, 'otp_store');
