import React, { useState } from 'react';
import {
  Compass,
  Search,
  ShieldCheck,
  Zap,
  Sparkles,
  ArrowRight,
  Video,
  Clock,
  CheckCircle2,
  Calendar,
  MapPin,
  Flame,
  Award,
  ChevronRight,
  Gift
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TrustScoreBadge } from '../components/TrustScoreBadge';
import { DynamicPricingTooltip } from '../components/DynamicPricingTooltip';
import { WalkaroundModal } from '../components/WalkaroundModal';
import { Vehicle, VehicleCategory } from '../types';

export const LandingView: React.FC = () => {
  const {
    vehicles,
    shops,
    setCurrentView,
    setSelectedVehicleId,
    setSelectedShopId,
    switchRole,
    weather
  } = useApp();

  const [activeCategory, setActiveCategory] = useState<VehicleCategory>('scooty');
  const [activeWalkaroundVehicle, setActiveWalkaroundVehicle] = useState<Vehicle | null>(null);
  const [searchLocation, setSearchLocation] = useState('Indiranagar, Bengaluru');
  const [selectedDays, setSelectedDays] = useState(2);

  // Filter vehicles by category for hero & showcase
  const categoryVehicles = vehicles.filter((v) => v.category === activeCategory);
  const featuredVehicles = vehicles.slice(0, 6);

  return (
    <div style={{ backgroundColor: 'var(--color-canvas)', overflowX: 'hidden' }}>
      {/* =========================================================================
          1. ASYMMETRICAL EDITORIAL HERO SECTION
          ========================================================================= */}
      <section style={{ paddingTop: 'clamp(3rem, 6vw, 5.5rem)', paddingBottom: 'clamp(4rem, 8vw, 6rem)' }}>
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: 'clamp(2.5rem, 5vw, 5rem)',
              alignItems: 'center'
            }}
          >
            {/* Left Column: Editorial Statement & Category Morph Tabs */}
            <div>
              {/* Trust Tag */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  backgroundColor: 'var(--color-brand-light)',
                  color: 'var(--color-brand)',
                  padding: '0.35rem 0.85rem',
                  borderRadius: 'var(--radius-pill)',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  marginBottom: '1.5rem'
                }}
              >
                <ShieldCheck size={16} strokeWidth={2.4} />
                <span>Verified Independent Shops • Zero Deposit Disputes</span>
              </div>

              {/* Bold Editorial Headline */}
              <h1 style={{ marginBottom: '1.25rem', letterSpacing: '-0.03em' }}>
                Rent a scooter down the street in under two minutes.
              </h1>

              {/* Specific, Non-Generic Copy */}
              <p
                style={{
                  fontSize: '1.15rem',
                  color: 'var(--color-ink-muted)',
                  lineHeight: 1.6,
                  maxWidth: 520,
                  marginBottom: '2rem'
                }}
              >
                No paperwork, no phone calls, and no haggling over security deposits. Digital licence verification in under 30 seconds, backed by HubX community trust scores.
              </p>

              {/* Interactive Category Selector with Smooth Underline */}
              <div style={{ marginBottom: '2.5rem' }}>
                <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-ink-faint)', fontWeight: 700, marginBottom: '0.65rem' }}>
                  Select Vehicle Category
                </div>

                <div
                  style={{
                    display: 'inline-flex',
                    backgroundColor: 'var(--color-canvas-subtle)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-pill)',
                    padding: '0.3rem',
                    gap: '0.25rem'
                  }}
                >
                  {(['scooty', 'bike', 'car'] as VehicleCategory[]).map((cat) => {
                    const isSelected = activeCategory === cat;
                    const labels: Record<VehicleCategory, string> = {
                      scooty: 'Scooties (110–125cc & EV)',
                      bike: 'Motorcycles (350cc+)',
                      car: 'Cars & Compact SUVs'
                    };

                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setActiveCategory(cat)}
                        style={{
                          padding: '0.55rem 1.1rem',
                          fontSize: '0.85rem',
                          fontWeight: isSelected ? 700 : 500,
                          borderRadius: 'var(--radius-pill)',
                          backgroundColor: isSelected ? 'var(--color-brand)' : 'transparent',
                          color: isSelected ? '#FFFFFF' : 'var(--color-ink-muted)',
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'all var(--transition-fast)'
                        }}
                      >
                        {labels[cat]}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Proof Points & Micro Stats */}
              <div
                style={{
                  display: 'flex',
                  gap: '2.5rem',
                  borderTop: '1px solid var(--color-border)',
                  paddingTop: '1.75rem'
                }}
              >
                <div>
                  <span className="tabular-nums" style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-ink)', display: 'block' }}>
                    140+
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-ink-muted)' }}>Verified Local Shops</span>
                </div>

                <div>
                  <span className="tabular-nums" style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-trust)', display: 'block' }}>
                    99.4%
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-ink-muted)' }}>Deposit Refund Rate</span>
                </div>

                <div>
                  <span className="tabular-nums" style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-accent)', display: 'block' }}>
                    &lt; 30s
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-ink-muted)' }}>Digital ID Check</span>
                </div>
              </div>
            </div>

            {/* Right Column: Live Search Widget Offset Card */}
            <div style={{ position: 'relative' }}>
              <div
                className="card"
                style={{
                  padding: '2rem',
                  backgroundColor: '#FFFFFF',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-lg)',
                  border: '1px solid var(--color-border)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.35rem', margin: 0 }}>Find Nearby Ride</h3>
                    <p style={{ fontSize: '0.82rem', color: 'var(--color-ink-muted)', marginTop: '0.2rem' }}>
                      Real-time inventory from HubX partner shops
                    </p>
                  </div>
                  <span className="badge badge-brand" style={{ fontSize: '0.75rem' }}>
                    Live Hubs
                  </span>
                </div>

                {/* Search Form */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                  {/* Location Picker */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-ink)', marginBottom: '0.4rem' }}>
                      Pickup Area / Neighborhood
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        value={searchLocation}
                        onChange={(e) => setSearchLocation(e.target.value)}
                        className="input-field"
                        placeholder="e.g. Indiranagar, Koramangala, HSR"
                      />
                      <MapPin size={16} style={{ position: 'absolute', right: 12, top: 12, color: 'var(--color-ink-muted)' }} />
                    </div>
                  </div>

                  {/* Dates & Duration */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-ink)', marginBottom: '0.4rem' }}>
                        Pickup Time
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type="text"
                          readOnly
                          value="Today, 10:00 AM"
                          className="input-field"
                          style={{ backgroundColor: 'var(--color-canvas-subtle)', cursor: 'pointer' }}
                        />
                        <Calendar size={15} style={{ position: 'absolute', right: 10, top: 12, color: 'var(--color-ink-muted)' }} />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-ink)', marginBottom: '0.4rem' }}>
                        Duration
                      </label>
                      <select
                        className="input-field"
                        value={selectedDays}
                        onChange={(e) => setSelectedDays(Number(e.target.value))}
                      >
                        <option value={1}>24 Hours (1 Day)</option>
                        <option value={2}>48 Hours (Weekend)</option>
                        <option value={3}>3 Days</option>
                        <option value={7}>1 Week (Discounted)</option>
                      </select>
                    </div>
                  </div>

                  {/* Featured Category Preview Card inside widget */}
                  {categoryVehicles[0] && (
                    <div
                      style={{
                        backgroundColor: 'var(--color-canvas-subtle)',
                        borderRadius: 'var(--radius-md)',
                        padding: '0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.85rem',
                        border: '1px solid var(--color-border)'
                      }}
                    >
                      <img
                        src={categoryVehicles[0].image}
                        alt={categoryVehicles[0].name}
                        style={{ width: 72, height: 52, objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <h4 style={{ fontSize: '0.88rem', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {categoryVehicles[0].name}
                          </h4>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
                          <span className="tabular-nums" style={{ fontWeight: 700, color: 'var(--color-brand)', fontSize: '0.9rem' }}>
                            ₹{categoryVehicles[0].basePrice + (categoryVehicles[0].dynamicAdjustment || 0)}/day
                          </span>
                          <span style={{ fontSize: '0.72rem', color: 'var(--color-ink-muted)' }}>
                            • {categoryVehicles[0].locationName}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Submit CTA */}
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => setCurrentView('search')}
                    style={{ width: '100%', padding: '0.85rem', fontSize: '1rem', marginTop: '0.5rem' }}
                  >
                    <Search size={17} />
                    <span>Search Available Fleet ({categoryVehicles.length} Nearby)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. FEATURED FLEET SHOWCASE WITH DYNAMIC PRICING & TRUST SCORES
          ========================================================================= */}
      <section style={{ backgroundColor: '#FFFFFF', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }} className="section-padding">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div className="badge badge-accent" style={{ marginBottom: '0.5rem' }}>
                <Flame size={13} />
                <span>Popular Vehicles Near You</span>
              </div>
              <h2 style={{ letterSpacing: '-0.02em' }}>Available for Instant Pickup</h2>
              <p style={{ color: 'var(--color-ink-muted)', fontSize: '1rem', marginTop: '0.35rem' }}>
                Every vehicle includes 15-day mechanical audit logs, sanitized helmets, and insurance coverage.
              </p>
            </div>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setCurrentView('search')}
              style={{ gap: '0.4rem' }}
            >
              <span>View All Fleet ({vehicles.length})</span>
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Cards Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '1.75rem'
            }}
          >
            {featuredVehicles.map((veh) => {
              const shop = shops.find((s) => s.id === veh.shopId) || shops[0];
              const finalPrice = veh.basePrice + (veh.dynamicAdjustment || 0);

              return (
                <div
                  key={veh.id}
                  className="card card-hoverable"
                  style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
                  onClick={() => {
                    setSelectedVehicleId(veh.id);
                    setCurrentView('vehicle_detail');
                  }}
                >
                  {/* Image Container with Dynamic Badge & Video button */}
                  <div style={{ position: 'relative', aspectRatio: '16 / 10', overflow: 'hidden' }}>
                    <img
                      src={veh.image}
                      alt={veh.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform var(--transition-normal)'
                      }}
                    />

                    {/* Category Pill */}
                    <div style={{ position: 'absolute', top: 12, left: 12 }}>
                      <span className="badge" style={{ backgroundColor: 'rgba(20, 23, 26, 0.8)', color: '#FFFFFF', backdropFilter: 'blur(4px)' }}>
                        {veh.category.toUpperCase()}
                      </span>
                    </div>

                    {/* Walkaround Video Trigger */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveWalkaroundVehicle(veh);
                      }}
                      style={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        backgroundColor: 'rgba(255, 255, 255, 0.92)',
                        color: 'var(--color-ink)',
                        borderRadius: 'var(--radius-pill)',
                        padding: '0.3rem 0.65rem',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        border: 'none',
                        boxShadow: 'var(--shadow-sm)'
                      }}
                    >
                      <Video size={13} color="var(--color-brand)" />
                      <span>Walkaround</span>
                    </button>

                    {/* Dynamic Pricing Tag overlay */}
                    <div style={{ position: 'absolute', bottom: 10, left: 12 }}>
                      <DynamicPricingTooltip
                        basePrice={veh.basePrice}
                        dynamicAdjustment={veh.dynamicAdjustment}
                        surgeReasons={veh.surgeReasons}
                      />
                    </div>
                  </div>

                  {/* Body Content */}
                  <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <div>
                        <h3 style={{ fontSize: '1.15rem', margin: 0 }}>{veh.name}</h3>
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-ink-muted)' }}>
                          {veh.brand} • {veh.year} • {veh.transmission}
                        </span>
                      </div>
                    </div>

                    {/* Shop and Trust Score Breakdown */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem', marginBottom: '0.85rem' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-ink-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160 }}>
                        {shop.name}
                      </span>
                      <TrustScoreBadge
                        score={shop.trustScore}
                        breakdown={shop.trustBreakdown}
                        onViewShopProfile={() => {
                          setSelectedShopId(shop.id);
                          setCurrentView('shop_trust_profile');
                        }}
                      />
                    </div>

                    {/* Features checklist */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '1.25rem' }}>
                      {veh.features.slice(0, 2).map((feat, idx) => (
                        <span
                          key={idx}
                          style={{
                            fontSize: '0.72rem',
                            backgroundColor: 'var(--color-canvas-subtle)',
                            color: 'var(--color-ink-muted)',
                            padding: '0.2rem 0.5rem',
                            borderRadius: 'var(--radius-sm)'
                          }}
                        >
                          {feat}
                        </span>
                      ))}
                    </div>

                    {/* Footer Row: Price & Book CTA */}
                    <div
                      style={{
                        marginTop: 'auto',
                        borderTop: '1px solid var(--color-border)',
                        paddingTop: '0.9rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
                          <span className="tabular-nums" style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-brand)' }}>
                            ₹{finalPrice}
                          </span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--color-ink-muted)' }}>/ day</span>
                        </div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--color-ink-faint)' }}>
                          ₹{veh.securityDeposit} refundable deposit
                        </span>
                      </div>

                      <button
                        type="button"
                        className="btn btn-primary"
                        style={{ padding: '0.55rem 1rem', fontSize: '0.85rem' }}
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. HOW DIGITAL VERIFICATION WORKS TEASER
          ========================================================================= */}
      <section className="section-padding">
        <div className="container">
          <div style={{ maxWidth: 640, marginBottom: '3.5rem' }}>
            <div className="badge badge-brand" style={{ marginBottom: '0.75rem' }}>
              <Zap size={13} />
              <span>Zero Counter Waiting</span>
            </div>
            <h2 style={{ letterSpacing: '-0.02em' }}>
              Upload your licence once. Ride anywhere across our shop network.
            </h2>
            <p style={{ color: 'var(--color-ink-muted)', fontSize: '1.05rem', marginTop: '0.5rem' }}>
              Our automated optical verification cross-references state transport databases in seconds. No shopkeeper keeps your original physical documents.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
            <div className="card" style={{ padding: '2rem' }}>
              <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-brand-light)', color: 'var(--color-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.2rem' }}>1</span>
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Snap Your Driving Licence</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-ink-muted)', lineHeight: 1.6 }}>
                Upload front and back photo. Our automated OCR extracts your name, licence category (MCWG/LMV), and validity in real time.
              </p>
            </div>

            <div className="card" style={{ padding: '2rem' }}>
              <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-accent-light)', color: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.2rem' }}>2</span>
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Earn +150 Welcome Points</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-ink-muted)', lineHeight: 1.6 }}>
                Completing identity verification instantly credits 150 loyalty points to your wallet, redeemable on your very first ride.
              </p>
            </div>

            <div className="card" style={{ padding: '2rem' }}>
              <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-trust-light)', color: 'var(--color-trust)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.2rem' }}>3</span>
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Digital Agreement & Handover</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-ink-muted)', lineHeight: 1.6 }}>
                A structured digital agreement card is created. Walk into the shop, show your QR pass, inspect the walkaround video, and drive away.
              </p>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setCurrentView('verification')}
              style={{ padding: '0.85rem 2rem', fontSize: '1rem' }}
            >
              <span>Try 30-Second Verification Flow</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. HOTEL SPONSOR REWARDS TEASER
          ========================================================================= */}
      <section style={{ backgroundColor: 'var(--color-brand)', color: '#FAF8F4' }} className="section-padding">
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '3rem',
              alignItems: 'center'
            }}
          >
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  padding: '0.35rem 0.75rem',
                  borderRadius: 'var(--radius-pill)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  marginBottom: '1.25rem'
                }}
              >
                <Gift size={14} color="var(--color-accent)" />
                <span>RideHub Hospitality Network</span>
              </div>

              <h2 style={{ color: '#FAF8F4', letterSpacing: '-0.02em', marginBottom: '1.25rem' }}>
                Complete a ride. Unlock luxury hotel vouchers across India.
              </h2>

              <p style={{ color: '#D4DBD7', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '2rem' }}>
                Every verified ride earns points (1 pt per ₹10 spent) and unlocks satisfying partner coupons from Taj Hotels, Marriott Bonvoy, Zostel, and Treebo.
              </p>

              <button
                type="button"
                className="btn btn-accent"
                onClick={() => setCurrentView('rewards_wallet')}
                style={{ padding: '0.85rem 1.8rem', fontSize: '0.95rem' }}
              >
                <span>View Partner Coupons</span>
                <ArrowRight size={16} />
              </button>
            </div>

            {/* Teaser Coupon Card Preview */}
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: 'var(--radius-lg)',
                padding: '2rem',
                backdropFilter: 'blur(8px)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#D4DBD7' }}>
                  Featured Partner Perk
                </span>
                <span className="badge" style={{ backgroundColor: 'var(--color-accent)', color: '#FFFFFF' }}>
                  25% Off
                </span>
              </div>

              <h3 style={{ color: '#FAF8F4', fontSize: '1.4rem', marginBottom: '0.5rem' }}>
                Taj West End & Resorts
              </h3>
              <p style={{ color: '#BAC4C0', fontSize: '0.88rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                25% Off luxury stays with complimentary artisan welcome beverages for all RideHub riders with 300+ loyalty points.
              </p>

              <div
                style={{
                  border: '1px dashed rgba(255, 255, 255, 0.3)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.85rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: 'rgba(0, 0, 0, 0.2)'
                }}
              >
                <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '1rem', letterSpacing: '0.08em', color: '#FAF8F4' }}>
                  TAJ-RIDEHUB-25
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentView('rewards_wallet')}
                  style={{ color: 'var(--color-accent)', fontSize: '0.8rem', fontWeight: 600, background: 'none' }}
                >
                  Unlock in Wallet →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. SHOPKEEPER HUBX SUBSCRIPTION INVITATION
          ========================================================================= */}
      <section className="section-padding">
        <div className="container">
          <div
            className="card"
            style={{
              padding: 'clamp(2rem, 5vw, 4rem)',
              backgroundColor: 'var(--color-canvas-subtle)',
              border: '1px solid var(--color-border)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '2.5rem',
              alignItems: 'center'
            }}
          >
            <div>
              <span className="badge badge-brand" style={{ marginBottom: '0.75rem' }}>
                For Vehicle Rental Owners
              </span>
              <h2 style={{ letterSpacing: '-0.02em', marginBottom: '1rem' }}>
                Turn your rental shop into a high-yield mobility business with HubX.
              </h2>
              <p style={{ color: 'var(--color-ink-muted)', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                Join HubX on a 1-month free trial. Get AI demand forecasts, dynamic pricing calendars, priority search rank, and protection against frivolous deposit disputes.
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.88rem' }}>
                  <CheckCircle2 size={16} color="var(--color-trust)" />
                  <span>1-Month Free Trial</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.88rem' }}>
                  <CheckCircle2 size={16} color="var(--color-trust)" />
                  <span>AI Dynamic Pricing Tool</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.88rem' }}>
                  <CheckCircle2 size={16} color="var(--color-trust)" />
                  <span>Verified Honest Shop Badge</span>
                </div>
              </div>

              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  switchRole('shopkeeper');
                  setCurrentView('shop_subscription');
                }}
                style={{ padding: '0.85rem 1.8rem' }}
              >
                <span>Explore HubX Plans & AI Dashboard</span>
                <ArrowRight size={16} />
              </button>
            </div>

            {/* Quick Preview of AI Analytics */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 'var(--radius-md)',
                padding: '1.5rem',
                boxShadow: 'var(--shadow-md)',
                border: '1px solid var(--color-border)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-ink-muted)', fontWeight: 700 }}>
                  Live AI Recommendation Preview
                </span>
                <span className="badge badge-surge" style={{ fontSize: '0.7rem' }}>
                  Demand +28%
                </span>
              </div>

              <div style={{ backgroundColor: 'var(--color-canvas)', padding: '1rem', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--color-brand)' }}>
                <strong style={{ fontSize: '0.92rem', color: 'var(--color-ink)', display: 'block', marginBottom: '0.25rem' }}>
                  Weekend Activa 6G Surge Opportunity
                </strong>
                <p style={{ fontSize: '0.82rem', color: 'var(--color-ink-muted)', lineHeight: 1.4 }}>
                  "Kaggle regression model shows weekend demand at 185 units. Competitors in Indiranagar have raised base rates to ₹520. Recommended: +₹70/day."
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--color-ink-muted)' }}>
                  Fleet Utilization Forecast:
                </span>
                <span className="tabular-nums" style={{ fontWeight: 700, color: 'var(--color-trust)' }}>
                  91% Peak
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Walkaround Modal */}
      {activeWalkaroundVehicle && (
        <WalkaroundModal
          vehicle={activeWalkaroundVehicle}
          onClose={() => setActiveWalkaroundVehicle(null)}
        />
      )}
    </div>
  );
};
