# Deferred Collections — Out-of-Scope for Phase 2 MongoDB Migration

This document lists MongoDB collections that were **considered** during the
Phase 1 analysis but **deliberately NOT created** in the Phase 2 migration, per
the user's instruction:

> "Do NOT create useless collections merely because they were listed."

Each deferred collection has its rationale recorded here so future contributors
understand what was considered, why it was skipped, and what would justify adding
it later.

---

## 1. `reviews`

**Pre-migration status:** Defined in `backend/schema.sql` (lines 129-141). No
backend route reads or writes it. No frontend code references reviews anywhere.

**Why deferred:** No current application code uses it. Creating an empty
collection would be a dead collection.

**When to add:** When a `POST /api/bookings/:id/reviews` and
`GET /api/shops/:id/reviews` endpoint is implemented and a frontend review UI
is built. The Phase 1 analysis already proposed a schema; reuse it.

---

## 2. `subscriptions`

**Pre-migration status:** Frontend `src/data/mockData.ts` exports a static
`HUBX_PLANS` catalog (4 plans). It's a UI-only catalog, not persisted user
state. No backend route exists. The `shops.hubxPlan` string field already
records the shop's current plan name.

**Why deferred:** No backend endpoint would read it today. The shop's
subscription state is captured in `shops.hubxPlan` + `shops.trialDaysRemaining`.

**When to add:** When a `POST /api/subscriptions` (purchase) endpoint is added,
or when subscription history/expiry audit is required. Phase 1 proposed schema
remains valid.

---

## 3. `payments`

**Pre-migration status:** The `/api/upi/generate` endpoint exists in
`server.js` but the frontend does NOT call it (it uses the client-side
`qrcode` library via `generateUPILink()` in `src/services/api.ts:86`). The
booking's `upiRef` string is the only persisted payment trail today.

**Why deferred:** No current reader of a payments collection. Persisting the
generated UPI intent would be a write-only audit collection with no reader.

**When to add:** When a UPI webhook handler is implemented, or when a
"payment history" UI is built. Phase 1 proposed schema remains valid.

---

## 4. `coupons`

**Pre-migration status:** Frontend has `INITIAL_COUPONS` in
`src/data/mockData.ts` (4 sponsor coupons) and persists user unlocks to
`localStorage['ridehub_coupons']`. No backend route exists.

**Why deferred:** The frontend bypasses the backend entirely for coupon state.
Adding a backend collection without a corresponding frontend wiring would be a
dead collection.

**When to add:** When the frontend is migrated to fetch coupons from the
backend (Phase 2 of frontend-backend integration). The Phase 1 proposed schema
remains valid.

---

## 5. `notifications`

**Pre-migration status:** Zero code references notifications anywhere — no
endpoint, no frontend UI, no schema.sql definition.

**Why deferred:** Pure dead collection if added now.

**When to add:** When a notification UI and at least one notification-producing
event (e.g. "booking confirmed" push) is implemented.

---

## 6. `ai_forecast_cache`

**Pre-migration status:** The `/api/ai/forecast` endpoint computes the
forecast on the fly per request. The frontend uses `src/utils/aiForecasting.ts`
which runs `papaparse` against the local Kaggle CSV — it does NOT call the
backend `/api/ai/forecast` endpoint.

**Why deferred:** No current reader of a cached forecast. The compute cost is
negligible (a 7-day loop in memory).

**When to add:** If/when the forecast horizon extends to 30+ days, or when a
cron job pre-warms the cache. The TTL index pattern proposed in Phase 1 remains
valid.

---

## 7. `rental_extensions`

**Pre-migration status:** Defined in `backend/schema.sql` (lines 103-114). The
`/api/bookings/:id/extend` endpoint mutates the booking's `endTime` and
`totalHours` inline; no separate extension audit is recorded. No frontend code
reads extensions as a separate list.

**Why deferred:** No current reader. The booking's `status` field transitions
to `'extended'` when an extension succeeds, providing the only signal the UI
needs today.

**When to add:** When a per-booking audit trail is required (e.g. for dispute
resolution, or for surfacing "you extended this booking 3 times" in the UI).
The Phase 1 proposed schema remains valid.

---

## 8. `verifications` (standalone audit collection)

**Pre-migration status:** Defined in `backend/schema.sql` (lines 60-73). The
`/api/verify-license` endpoint is stateless — it returns a result but doesn't
persist. The user's `verifiedDoc` subdoc on the `User` model carries the
relevant state for the current application.

**Why deferred:** A standalone `verifications` collection with no current
reader would be a dead collection. The verification result IS persisted on the
user (via `User.verifiedDoc`) so the application has the data it needs.

**When to add:** When audit/history of verification attempts matters (e.g.
compliance, repeated verification attempts for the same doc number).

---

## Summary table

| Collection | Status | Rationale | Re-enable trigger |
|---|---|---|---|
| `reviews` | DEFERRED | No endpoint, no UI | Implement review endpoint + UI |
| `subscriptions` | DEFERRED | UI uses static catalog | Implement purchase endpoint |
| `payments` | DEFERRED | Frontend doesn't call /api/upi/generate | Implement webhook or payment history |
| `coupons` | DEFERRED | Frontend uses localStorage + mockData | Migrate frontend to backend coupons |
| `notifications` | DEFERRED | Zero references in code | Implement notification UI |
| `ai_forecast_cache` | DEFERRED | Compute is cheap, frontend uses local CSV | Extend forecast horizon or add cron |
| `rental_extensions` | DEFERRED | Status field suffices for current UI | Need audit trail or extension history UI |
| `verifications` (standalone) | DEFERRED | User.verifiedDoc subdoc suffices | Need per-attempt audit trail |

## Active collections (post-migration)

| Collection | Model file | Pre-migration analog |
|---|---|---|
| `users` | `src/models/User.js` | in-memory `users` array |
| `shops` | `src/models/Shop.js` | in-memory `shops` array |
| `vehicles` | `src/models/Vehicle.js` | in-memory `vehicles` array |
| `bookings` | `src/models/Booking.js` | in-memory `bookings` array |
| `otp_store` | `src/models/Otp.js` | in-memory `otpStore` Map (TTL replaces manual cleanup) |
