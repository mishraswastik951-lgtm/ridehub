# RideHub: Product Idea and Frontend Specification

> **Slogan:** Every ride, one hub. | **Closing line:** Ride more. Worry less.
> **Status:** Hackathon project. Frontend first, with all data mocked.

---

## 1. Summary

RideHub is a rental platform for **scooties, bikes, and cars** that brings nearby rental shops onto one app.

- **Customers** browse vehicles with videos and full details, verify documents digitally, book, extend time mid-ride with instant payment, and earn rewards.
- **Shopkeepers** host their shop through a subscription called **HubX** (1 month free). They get a HubX label, priority listing, and an AI dashboard.
- **Money** comes from HubX subscriptions, hotel sponsorships, premium delivery, and a small booking fee.

## 2. Problems Being Solved

1. Renting involves heavy paperwork and manual document checks.
2. Customers cannot compare shops, prices, or vehicle condition, and cannot judge trust.
3. Extending a rental means calling the shop and paying later, which causes disputes and late returns.
4. Small shops have no digital presence, no pricing guidance, and no repeat customers.

## 3. Users and Roles

| Role | Goal |
|---|---|
| **Customer** | Find a trustworthy ride fast, rent with minimal paperwork, extend easily, get fair refunds, earn rewards. |
| **Shopkeeper (HubX)** | Get bookings, manage vehicles, price smartly, build a trust score, grow revenue. |

## 4. Global Rules

- **Currency:** Indian rupees only. Use the ₹ symbol and Indian number format (₹1,50,000). Never use $.
- **Data:** All data is mocked. Label every AI-driven number or chart as **"Sample data"**. Numbers must be internally consistent (revenue = bookings x price).
- **No invented statistics** in the UI. Use clearly labeled sample values.
- **Login:** email and phone are compulsory. One phone number can be linked to only one ID.
- **Languages:** English for the demo.

---

## 5. Features

### 5.1 Accounts and Login
- Sign up with **email + phone (both compulsory)**, verified with a mock OTP.
- **One phone = one ID.** Show a clear error if the phone is already linked to an account.
- Choose a role at sign-up: Customer or Shopkeeper.
- One shopkeeper account can manage multiple shops.

### 5.2 Discovery: Shops and Vehicles
- Explore page with a **list + map** view of nearby shops.
- Filters: vehicle type (scooty / bike / car), price, availability, trust score, HubX-only.
- Shop card: name, distance, HubX badge, trust score, starting price.
- **Vehicle detail page:**
  - Short **walkaround video** (15-30 seconds)
  - Model, year, fuel type, mileage
  - Condition and any existing damage
  - Helmet / accessories included
  - Price per hour and per day, and deposit
  - Availability calendar and pickup location
- **Dynamic price tag** showing why the price is what it is (for example "Weekend rate", "Festival demand", "Monsoon special").

### 5.3 Community Trust Score
Shown on every shop and shop card.
- Overall score out of 10, built from four parts: **Honesty** (deposit and damage disputes), **Vehicle condition**, **Punctuality**, **Communication**.
- Show the four sub-scores as bars, plus a few review snippets and badges (for example "Verified shop", "HubX").
- Customers can filter and sort by trust score.

### 5.4 Digital Documents (Paperless)
- Upload **driving licence** and **ID** (photo upload, mocked).
- Status chips: Not uploaded, Under review, Verified, Rejected.
- Verify once and reuse for every booking.
- Auto-generated **digital rental agreement** shown at booking.
- Bonus points for completing verification.

### 5.5 Booking Flow (multi-step)
1. Select date and time (hourly / daily).
2. Choose delivery: **Self pickup** or **Premium delivery** (extra ₹).
3. Review price breakdown: rental, booking fee, delivery, deposit, points discount, total.
4. Confirm document status and agreement.
5. Pay with a **mock UPI** screen, then show confirmation.

### 5.6 Active Ride and Adjustable Timing
- Live **countdown timer** and ride status.
- **Extend time** button with quick options (+1 hour, +2 hours, +1 day) and instant mock UPI payment.
- If the vehicle is already booked by someone else, **block the extension** and offer a replacement vehicle.
- If time runs out without payment, show an automatic **late fee** notice.
- Return flow: return confirmation, points credited, and a review prompt.

### 5.7 Cancellation and Refund
Refund depends on the share of time between booking and pickup that has passed when the customer cancels.

| When the customer cancels | Refund |
|---|---|
| Within the first 25% of the time before pickup | 100% |
| Within 50% of the time before pickup | 50% |
| After that, up to pickup | 0% |

*Example: booked 4 days before pickup. Cancel on day 1 = full refund. By day 2 = half. After that = none.*

Formula: `elapsed = (now - bookedAt) / (pickupAt - bookedAt)`. If `elapsed <= 0.25` then 100%. If `elapsed <= 0.5` then 50%. Otherwise 0%.

UI: a horizontal timeline bar (green / blue / grey) with a "you are here" marker, and a confirm dialog showing the exact refund in ₹.

### 5.8 Rewards, Points and Hotel Coupons
- **Points:** earned on rentals from **HubX-labeled shops** (illustrative: 1 point per ₹10 spent). Bonus points for document verification.
- **Redeem:** points become a discount at checkout, with a cap (illustrative: up to 20% of the booking).
- **Hotel sponsorship:** after **completing a HubX ride**, the customer unlocks discount **coupons from sponsor hotels**.
- Rewards page: points balance, history, coupon wallet (active / used / expired).

### 5.9 HubX for Shopkeepers
- **Subscription is required** to host a shop on the platform.
- **1 month free trial** for every new shopkeeper (show trial days left).
- Plans: **Monthly, 6 months, Yearly**, with longer plans cheaper per month.
- Illustrative prices (to be finalized): Monthly ₹499, 6 months ₹2,499, Yearly ₹4,499.
- HubX benefits: HubX label, priority listing, rewards program access, AI dashboard, premium delivery eligibility.

### 5.10 Shopkeeper Dashboard
- **Overview:** today's bookings, revenue (₹), active rides, fleet utilization.
- **Vehicles:** list, add / edit, upload one walkaround video, set price.
- **Bookings:** upcoming, active, past, with status and customer verification state.
- **Subscription:** current plan, trial days left, upgrade / switch plan.

### 5.11 AI Features (mocked, labeled "Sample data")
1. **Shopkeeper AI dashboard:** best and worst vehicles (bookings, rating, ₹ revenue), demand forecast by season, weekend and festival, and plain-language suggestions (for example "Add one more Royal Enfield").
2. **Dynamic pricing:** shows factors (weekday / weekend, season, festival, advance booking, vehicles left), a suggested price band, and an accept button.
3. **Community trust score:** as in 5.3, with a shopkeeper-side view of how to improve it.
4. *Optional:* licence OCR preview and before/after damage comparison (UI only).

---

## 6. Screens and Routes

**Public / Customer**
| Route | Screen |
|---|---|
| `/` | Landing (hero, how it works, features, HubX teaser) |
| `/auth` | Login / sign up / OTP |
| `/explore` | Shop and vehicle discovery (list + map) |
| `/shop/:id` | Shop profile with trust score and vehicles |
| `/vehicle/:id` | Vehicle detail with video |
| `/book/:vehicleId` | Multi-step booking and mock payment |
| `/verify` | Document upload and status |
| `/rides` | My rides (upcoming, active, past) |
| `/rides/:id` | Ride detail: timer, extend time, cancel, return |
| `/rewards` | Points and coupon wallet |
| `/profile` | Account details |

**Shopkeeper**
| Route | Screen |
|---|---|
| `/hubx` | HubX landing and plans |
| `/hubx/signup` | Shop registration and trial start |
| `/dashboard` | Overview |
| `/dashboard/vehicles` | Fleet management |
| `/dashboard/bookings` | Bookings |
| `/dashboard/insights` | AI insights, dynamic pricing, trust score |
| `/dashboard/subscription` | Plan and billing |

---

## 7. Suggested Data Models

```ts
type VehicleType = "scooty" | "bike" | "car";

interface User { id; role: "customer" | "shopkeeper"; name; email; phone; docsStatus; points }
interface Shop { id; ownerId; name; location; distanceKm; isHubX; trust: TrustScore; plan?: Plan }
interface TrustScore { overall; honesty; condition; punctuality; communication }
interface Vehicle { id; shopId; type: VehicleType; model; year; fuel; mileage; condition; damageNotes;
                    accessories; videoUrl; pricePerHour; pricePerDay; deposit; available }
interface Booking { id; vehicleId; customerId; bookedAt; pickupAt; returnAt; delivery: boolean;
                    total; status: "upcoming" | "active" | "completed" | "cancelled" }
interface Extension { bookingId; extraMinutes; amount; paidAt }
interface Coupon { id; hotel; discountText; status: "active" | "used" | "expired"; unlockedBy }
interface Plan { name: "Monthly" | "6 months" | "Yearly"; price; trialEndsAt }
```

## 8. Business Rules Summary
- One phone number maps to one ID.
- Shopkeepers need an active plan or trial to appear in listings.
- Refund tiers: 100% / 50% / 0% (section 5.7).
- Extensions are blocked if the vehicle has a next booking.
- Points and hotel coupons apply only to **HubX-labeled** shops.
- Dynamic price is computed from day type, season / festival, advance time, and availability.

## 9. Business Model
| Stream | Who pays |
|---|---|
| HubX subscription (monthly / 6 months / yearly) | Shopkeepers, after the 1 month free trial |
| Hotel sponsorship | Hotels, for coupon placement |
| Premium delivery | Customers |
| Booking fee | Customers, per booking |

## 10. Design Direction
- **Brand:** navy `#0F1F3D`, electric blue `#2F6BFF`, green `#4CBB8A` (positive states only), soft background `#F5F8FF`. Follow the 60-30-10 rule.
- **Type:** Poppins for headings, Inter for body. Echo the logo's light + bold contrast in headlines.
- **Style:** rounded cards (16px), soft shadows, one rounded line icon set, flat vehicle illustrations, mobile-first layout.
- **Logo:** use the provided RideHub logo with a transparent background.

## 11. Demo Flow (5 taps)
1. Shopkeeper signs up and starts the free trial.
2. Customer searches on the map and opens a vehicle with video.
3. Customer verifies documents and books with mock UPI.
4. Customer extends the ride with instant payment and earns points and a hotel coupon.
5. Finish on the shopkeeper's AI dashboard, dynamic pricing, and trust score.

## 12. Out of Scope for the Frontend (mocked)
Real payments, real licence verification (DigiLocker), real OTP, real hotel deals, live GPS, delivery logistics.

## 13. Open Decisions (fill in before final)
- Final HubX plan prices and discount percentages.
- Points earn rate, redemption value, and discount cap.
- Deposit rules and late-fee amount.
- Refund rule for very short-notice bookings (for example free cancellation within 10-15 minutes of booking).
- Share of renters who stay in hotels (validate with a survey before claiming it).