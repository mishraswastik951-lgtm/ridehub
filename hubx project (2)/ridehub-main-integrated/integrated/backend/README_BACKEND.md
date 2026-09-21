# RideHub & HubX Backend Architecture & Linking Guide

This document outlines the architecture, database schema, UPI integration, and connection process between the RideHub frontend application and the backend API server.

---

## 1. Quick Start

### Starting the Backend Server
```bash
cd backend
npm install
npm start
```
The server will boot on `http://localhost:5000`.

### Environment Configuration
Create a `.env` in the `backend/` directory if needed:
```env
PORT=5000
UPI_MERCHANT_VPA=ridehub@icici
UPI_MERCHANT_NAME=RideHub Rentals
DATABASE_URL=./ridehub.sqlite
NODE_ENV=development
```

---

## 2. API Endpoints & Capabilities

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Service status and timestamp |
| `GET` | `/api/weather` | Live Open-Meteo weather data (Bengaluru/custom coordinates), WMO codes, and 2-wheeler weather suitability score |
| `POST` | `/api/verify-license` | Driving licence, Aadhaar, and Government ID format validation and OCR data extraction |
| `POST` | `/api/upi/generate` | Generates standard NPCI UPI Intent URI (`upi://pay?...`) and deep links for Google Pay, PhonePe, and Paytm |
| `GET` | `/api/ai/forecast` | AI Demand forecasting model trained on historical Kaggle vehicle rental dataset with pricing recommendations |
| `GET` | `/api/vehicles` | Filterable list of vehicles (by category, price, trust score) |
| `POST` | `/api/vehicles` | Adds a new vehicle to a shop's fleet |
| `GET` | `/api/bookings` | Returns all active and historical bookings |
| `POST` | `/api/bookings` | Creates a new booking with dynamic price record |
| `POST` | `/api/bookings/:id/extend` | Extends a rental duration; detects slot conflicts and suggests nearby HubX alternative vehicles |
| `POST` | `/api/bookings/:id/cancel` | Evaluates lead-time refund tier (100% / 50% / 0%) and calculates instant refund amount |

---

## 3. Relational Database Schema

The relational schema is defined in [`schema.sql`](file:///backend/schema.sql) and is compatible with SQLite and PostgreSQL:
- **`users`**: Customer & Shopkeeper accounts, verification status, and one-phone-number uniqueness constraint.
- **`shops`**: Shopkeeper stores with 4-pillar Trust Score (`honesty_rate`, `condition_rate`, `punctuality_rate`, `communication_rate`) and HubX subscription tier.
- **`vehicles`**: Scooties, bikes, cars, base daily rates, specifications, and availability.
- **`verifications`**: Auditable identity document records.
- **`bookings`**: Booking duration, dynamic breakdown, and UPI transaction tracking.
- **`rental_extensions`**: Extra hours and replacement records.
- **`sponsor_coupons`**: Hotel partner coupons (Taj, Marriott, Zostel, Treebo).

---

## 4. Frontend & Backend Seamless Linking

The frontend in `src/services/api.ts` connects to `http://localhost:5000` when the backend is running. If the backend is offline or running standalone in a browser sandbox, the frontend automatically falls back to an in-memory client-side engine with identical mathematical forecasting models and live Open-Meteo weather fetching.
