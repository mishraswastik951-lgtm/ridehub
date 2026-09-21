-- =============================================================================
-- RIDEHUB & HUBX RELATIONAL DATABASE SCHEMA (SQLite / PostgreSQL compatible)
-- =============================================================================

-- 1. USERS & PROFILES
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT UNIQUE NOT NULL, -- Enforces 1 phone number -> 1 identity
    role TEXT CHECK(role IN ('customer', 'shopkeeper', 'admin')) DEFAULT 'customer',
    is_verified INTEGER DEFAULT 0,
    reward_points INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. SHOPS (HubX Partner Stores)
CREATE TABLE IF NOT EXISTS shops (
    id TEXT PRIMARY KEY,
    owner_id TEXT NOT NULL,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL DEFAULT 'Bengaluru',
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    is_hubx INTEGER DEFAULT 1,
    hubx_tier TEXT CHECK(hubx_tier IN ('trial', 'monthly', 'half_yearly', 'yearly')) DEFAULT 'trial',
    hubx_trial_expiry TIMESTAMP,
    -- 4-Pillar Trust Score Composite
    trust_score REAL DEFAULT 4.8,
    honesty_rate REAL DEFAULT 99.2,         -- Deposit & damage dispute fairness rate
    condition_rate REAL DEFAULT 97.5,       -- Vehicle mechanical condition rating
    punctuality_rate REAL DEFAULT 98.4,     -- On-time handover percentage
    communication_rate REAL DEFAULT 99.0,   -- Response time & messaging clarity
    FOREIGN KEY (owner_id) REFERENCES users(id)
);

-- 3. VEHICLES (Scooty, Bike, Car)
CREATE TABLE IF NOT EXISTS vehicles (
    id TEXT PRIMARY KEY,
    shop_id TEXT NOT NULL,
    name TEXT NOT NULL,
    category TEXT CHECK(category IN ('scooty', 'bike', 'car')) NOT NULL,
    brand TEXT NOT NULL,
    model_year INTEGER NOT NULL,
    transmission TEXT DEFAULT 'Automatic',
    fuel_type TEXT DEFAULT 'Petrol',
    mileage_kmpl REAL NOT NULL,
    base_daily_price INTEGER NOT NULL,
    security_deposit INTEGER NOT NULL DEFAULT 1500,
    image_url TEXT NOT NULL,
    walkaround_video_url TEXT,
    is_available INTEGER DEFAULT 1,
    location_name TEXT NOT NULL,
    rating REAL DEFAULT 4.85,
    FOREIGN KEY (shop_id) REFERENCES shops(id)
);

-- 4. DIGITAL DOCUMENT VERIFICATIONS
CREATE TABLE IF NOT EXISTS verifications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    doc_type TEXT CHECK(doc_type IN ('driving_licence', 'aadhaar', 'passport', 'voter_id')) NOT NULL,
    doc_number TEXT NOT NULL,
    extracted_name TEXT NOT NULL,
    extracted_dob TEXT NOT NULL,
    extracted_expiry TEXT,
    extracted_category TEXT,
    status TEXT CHECK(status IN ('pending', 'verified', 'rejected')) DEFAULT 'verified',
    verified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    bonus_points_awarded INTEGER DEFAULT 150,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 5. BOOKINGS & AGREEMENTS
CREATE TABLE IF NOT EXISTS bookings (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    vehicle_id TEXT NOT NULL,
    shop_id TEXT NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    total_days INTEGER NOT NULL,
    base_price INTEGER NOT NULL,
    dynamic_adjustment INTEGER DEFAULT 0,
    surge_reasons TEXT, -- JSON breakdown of reasons (weather, weekend, demand)
    security_deposit INTEGER NOT NULL,
    taxes_and_gst INTEGER NOT NULL,
    points_discount INTEGER DEFAULT 0,
    final_amount INTEGER NOT NULL,
    upi_transaction_id TEXT,
    payment_status TEXT CHECK(payment_status IN ('pending', 'completed', 'failed', 'refunded')) DEFAULT 'completed',
    rental_status TEXT CHECK(rental_status IN ('upcoming', 'active', 'extended', 'completed', 'cancelled')) DEFAULT 'upcoming',
    refund_amount INTEGER DEFAULT 0,
    refund_tier_percentage INTEGER DEFAULT 0,
    agreement_signed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
    FOREIGN KEY (shop_id) REFERENCES shops(id)
);

-- 6. RENTAL EXTENSIONS
CREATE TABLE IF NOT EXISTS rental_extensions (
    id TEXT PRIMARY KEY,
    booking_id TEXT NOT NULL,
    extra_hours INTEGER NOT NULL,
    extension_amount INTEGER NOT NULL,
    upi_ref TEXT NOT NULL,
    extended_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status TEXT CHECK(status IN ('approved', 'conflict_rejected')) DEFAULT 'approved',
    replacement_offered_vehicle_id TEXT,
    FOREIGN KEY (booking_id) REFERENCES bookings(id)
);

-- 7. REWARDS & HOTEL SPONSOR COUPONS
CREATE TABLE IF NOT EXISTS sponsor_coupons (
    id TEXT PRIMARY KEY,
    partner_name TEXT NOT NULL,
    hotel_name TEXT NOT NULL,
    discount_text TEXT NOT NULL,
    coupon_code TEXT NOT NULL,
    valid_till DATE NOT NULL,
    is_unlocked INTEGER DEFAULT 0,
    unlocked_at TIMESTAMP
);

-- 8. REVIEWS & DISPUTES
CREATE TABLE IF NOT EXISTS reviews (
    id TEXT PRIMARY KEY,
    booking_id TEXT NOT NULL,
    shop_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    rating REAL NOT NULL,
    comment TEXT,
    honesty_rating INTEGER DEFAULT 5,
    condition_rating INTEGER DEFAULT 5,
    punctuality_rating INTEGER DEFAULT 5,
    communication_rating INTEGER DEFAULT 5,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
