# RideHub Implementation Steps

This document outlines the step-by-step roadmap to build the **RideHub** frontend web application based on the complete specification in [`idea.md`](file:///c:/Users/kunjs/Downloads/rideHub/idea.md).

---

## Phase 1: Project Setup & Design System Foundation
- [ ] **1.1 Initialize Vite + React (TypeScript) Application**
  - Scaffold React + TS + TailwindCSS / Vanilla CSS utilities with fast HMR.
  - Install dependencies: `lucide-react` (icons), `canvas-confetti` (rewards/booking celebrations), `leaflet` / `react-leaflet` (interactive map discovery).
- [ ] **1.2 Design System & Theme Setup**
  - Colors: Navy (`#0F1F3D`), Electric Blue (`#2F6BFF`), Mint/Green (`#4CBB8A`), Soft Background (`#F5F8FF`), Card Surface (`#FFFFFF`).
  - Typography: Google Fonts (`Poppins` for headings, `Inter` for body).
  - Component Tokens: 16px rounded cards, glassmorphism headers, responsive tabs, standard Indian Rupee formatting helper (`₹1,50,000`).

---

## Phase 2: State Management & Mock Data Store (LocalStorage-backed)
- [ ] **2.1 Global Context / Store Architecture**
  - **Auth State:** Active user (Role: Customer vs. Shopkeeper), phone deduplication, session persistence, mock OTP validator.
  - **Shop & Fleet Data:** 5+ rich pre-seeded Indian rental shops with HubX badges, Trust Scores (Honesty, Condition, Punctuality, Communication), dynamic pricing tags, vehicle walkaround videos, damage notes, availability status.
  - **Bookings & Rides State:** Upcoming, Active, and Past bookings with live countdown timers, extension tracking, and late fees.
  - **Rewards & Wallet:** Points balance, transaction history, sponsored Hotel Coupon wallet (Active / Used / Expired).
  - **HubX Subscription State:** Shopkeeper plans (Monthly ₹499, 6-Months ₹2,499, Yearly ₹4,499), 30-day free trial countdown.

---

## Phase 3: Customer Discovery & Booking Experience
- [ ] **3.1 Landing Page (`/`)**
  - Hero banner with quick search by vehicle type (scooty, bike, car), city/area selector.
  - Value proposition ("Every ride, one hub", paperless digital KYC, instant extensions).
  - HubX shopkeeper promotion teaser & sponsor hotels spotlight.
- [ ] **3.2 Authentication & Role Selector (`/auth`)**
  - Compulsory Email + Phone input with duplicate phone validation.
  - Simulated 4-digit OTP verification screen.
  - Role switcher (Customer / Shopkeeper) with quick demo switcher for hackathon judges.
- [ ] **3.3 Explore & Map Discovery (`/explore`)**
  - Split view / Toggle: Interactive Leaflet Map with custom markers + Shop & Vehicle cards.
  - Filters: Vehicle type (scooty/bike/car), price slider, HubX-only, minimum Trust Score rating.
- [ ] **3.4 Shop Profile & Trust Breakdown (`/shop/:id`)**
  - Shop header with HubX badge, verified mark, distance.
  - Community Trust Score breakdown widget (4 progress bars: Honesty, Vehicle condition, Punctuality, Communication).
  - Fleet listing for this shop with real-time availability.
- [ ] **3.5 Vehicle Detail Page (`/vehicle/:id`)**
  - Video walkaround player (mock 15-30s vehicle clip/preview).
  - Specs grid: Fuel, mileage, year, accessories (helmets, phone mount), existing damage notes.
  - Dynamic pricing reason badge ("Weekend Rate", "Festival Surge", "Monsoon Offer").
  - Clear hourly/daily rates + refundable deposit breakdown.
- [ ] **3.6 Multi-Step Booking & Mock UPI Checkout (`/book/:vehicleId`)**
  - Step 1: Date & time selection (Hourly vs Daily calculator).
  - Step 2: Pickup method (Self pickup vs. Premium Doorstep Delivery for +₹149).
  - Step 3: Points discount redemption slider (capped at 20% of booking).
  - Step 4: Digital Rental Agreement preview & digital sign.
  - Step 5: Mock UPI Gateway with simulated QR code / UPI ID payment, instant confirmation & celebratory animation.

---

## Phase 4: Document Verification (Paperless DigiLocker Mock) (`/verify`)
- [ ] **4.1 Document Upload Screen**
  - Driving Licence and National ID photo upload dropzone with live preview.
  - Status badges: *Not Uploaded*, *Under Review*, *Verified*, *Rejected*.
  - Instant simulated AI verification with bonus loyalty points award modal (+100 points).

---

## Phase 5: Active Ride Management & Cancellation Engine
- [ ] **5.1 Active Ride Live Hub (`/rides/:id`)**
  - Real-time countdown timer to return deadline.
  - **Instant Ride Extension (+1 hr, +2 hrs, +1 day):**
    - Automatic conflict check (blocks extension if another customer reserved it next & recommends alternative vehicle).
    - Instant mock UPI payment for extension.
  - **Late Fee Warning Simulation:** Overdue alert with calculated penalty fee if not returned on time.
  - **Return Vehicle Flow:** Inspection checklist, deposit refund calculation, points reward credit, review prompt.
- [ ] **5.2 Mathematical Cancellation & Refund Engine**
  - Visual 3-tier timeline bar (`100% refund` within first 25% time, `50% refund` within 50%, `0% refund` after).
  - Interactive "You are here" slider showing exact elapsed time and calculated ₹ refund.
- [ ] **5.3 Rewards & Hotel Deals Hub (`/rewards`)**
  - Loyalty points balance & tier badge.
  - Hotel partner coupons unlocked on completing HubX rides (e.g., "Flat 25% off Ginger Hotels", "₹1,000 off Taj Vivanta").
  - One-click copy coupon code & mark as used.

---

## Phase 6: Shopkeeper HubX & AI Dashboard
- [ ] **6.1 HubX Subscription & Onboarding (`/hubx`, `/hubx/signup`)**
  - Pricing cards (Monthly, 6-Month, Yearly) with 1-month Free Trial badge.
  - Shop onboarding wizard (Shop name, GPS coordinates, GST/business details).
- [ ] **6.2 Shopkeeper Dashboard Overview (`/dashboard`)**
  - KPI metric cards: Today's Bookings, Total Revenue (₹), Active Rides, Fleet Utilization %.
  - Recent activity feed & quick action shortcuts.
- [ ] **6.3 Fleet Management (`/dashboard/vehicles`)**
  - Add / edit vehicle modal with walkaround video URL, pricing, specs, damage log.
  - Real-time vehicle toggle (Available / In Service / Rented).
- [ ] **6.4 Bookings Manager (`/dashboard/bookings`)**
  - Filter tabs: Upcoming, Active, Completed, Cancelled.
  - Customer verification badge check and rental agreement download/view.
- [ ] **6.5 Shopkeeper AI Insights & Dynamic Pricing (`/dashboard/insights`)**
  - *Clearly labeled "Sample data"*.
  - Best & Worst performing fleet analytics (ROI, maintenance frequency).
  - Demand forecast graph (Festival demand, weekend projections).
  - Dynamic Pricing Suggestion engine with "Accept Suggested Price" button.
  - Trust Score diagnostic panel with actionable tips to boost shop rating.
- [ ] **6.6 Subscription & Billing Management (`/dashboard/subscription`)**
  - Trial days remaining countdown banner.
  - Plan upgrade / renewal flow with invoice download.

---

## Phase 7: Demo Mode & Polish
- [ ] **7.1 5-Tap Hackathon Interactive Demo Tour**
  - Quick floating demo controller to instantly walk judges through the 5 key taps:
    1. Shopkeeper trial signup.
    2. Customer search & video walkaround.
    3. KYC verification & mock UPI booking.
    4. Mid-ride extension & hotel coupon reward unlock.
    5. Shopkeeper AI dashboard & dynamic pricing.
- [ ] **7.2 Responsive & Visual Polish**
  - Smooth glassmorphism, micro-interactions, responsive mobile + desktop views.
  - Sound effects / haptics feedback simulation for notifications & payments.
