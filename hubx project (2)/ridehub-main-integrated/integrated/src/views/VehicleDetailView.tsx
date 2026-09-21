import React, { useState } from 'react';
import {
  ArrowLeft,
  ShieldCheck,
  Video,
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  TrendingUp,
  AlertCircle,
  Share2,
  Heart,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TrustScoreBadge } from '../components/TrustScoreBadge';
import { DynamicPricingTooltip } from '../components/DynamicPricingTooltip';
import { WalkaroundModal } from '../components/WalkaroundModal';

export const VehicleDetailView: React.FC = () => {
  const {
    selectedVehicleId,
    vehicles,
    shops,
    setCurrentView,
    setSelectedShopId,
    weather
  } = useApp();

  const [rentalDays, setRentalDays] = useState(2);
  const [includeDelivery, setIncludeDelivery] = useState(false);
  const [isWalkaroundOpen, setIsWalkaroundOpen] = useState(false);

  const vehicle = vehicles.find((v) => v.id === selectedVehicleId) || vehicles[0];
  const shop = shops.find((s) => s.id === vehicle.shopId) || shops[0];

  const dynamicAdj = vehicle.dynamicAdjustment || 0;
  const dailyRate = vehicle.basePrice + dynamicAdj;
  const subtotal = dailyRate * rentalDays;
  const deliveryFee = includeDelivery ? 200 : 0;
  const gst = Math.round((subtotal + deliveryFee) * 0.18);
  const totalPayable = subtotal + deliveryFee + gst + vehicle.securityDeposit;

  return (
    <div style={{ backgroundColor: 'var(--color-canvas)', minHeight: '90vh', paddingBottom: '6rem' }}>
      {/* Back Navigation Bar */}
      <div style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: '#FFFFFF', padding: '1rem 0' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            type="button"
            onClick={() => setCurrentView('search')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              color: 'var(--color-ink)',
              fontSize: '0.9rem',
              fontWeight: 600,
              background: 'none'
            }}
          >
            <ArrowLeft size={18} />
            <span>Back to All Vehicles</span>
          </button>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <span className="badge badge-brand" style={{ fontSize: '0.75rem' }}>
              HubX Verified Fleet
            </span>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: '2.5rem' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '3rem',
            alignItems: 'flex-start'
          }}
        >
          {/* Left Column: Gallery, Video Trigger, Specs & Trust Breakdown */}
          <div>
            {/* Main Photography Card */}
            <div
              className="card"
              style={{
                position: 'relative',
                aspectRatio: '16 / 10',
                overflow: 'hidden',
                marginBottom: '1.25rem'
              }}
            >
              <img
                src={vehicle.image}
                alt={vehicle.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />

              {/* 360 Walkaround Button */}
              <button
                type="button"
                onClick={() => setIsWalkaroundOpen(true)}
                className="btn"
                style={{
                  position: 'absolute',
                  bottom: 16,
                  right: 16,
                  backgroundColor: 'rgba(20, 23, 26, 0.85)',
                  color: '#FFFFFF',
                  padding: '0.5rem 1rem',
                  fontSize: '0.85rem',
                  backdropFilter: 'blur(6px)',
                  boxShadow: 'var(--shadow-md)'
                }}
              >
                <Video size={16} color="var(--color-accent)" />
                <span>Watch Walkaround Video (360°)</span>
              </button>
            </div>

            {/* Title & Shop Row */}
            <div style={{ marginBottom: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span className="badge badge-outline" style={{ textTransform: 'uppercase' }}>
                  {vehicle.category}
                </span>
                <span style={{ fontSize: '0.82rem', color: 'var(--color-ink-muted)' }}>
                  {vehicle.brand} • {vehicle.year} Model
                </span>
              </div>

              <h1 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', marginBottom: '0.65rem' }}>
                {vehicle.name}
              </h1>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <MapPin size={16} color="var(--color-ink-muted)" />
                <span style={{ fontSize: '0.9rem', color: 'var(--color-ink)' }}>
                  {vehicle.locationName}
                </span>
                <span style={{ color: 'var(--color-border-dark)' }}>•</span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedShopId(shop.id);
                    setCurrentView('shop_trust_profile');
                  }}
                  style={{ color: 'var(--color-brand)', fontWeight: 600, fontSize: '0.9rem', background: 'none' }}
                >
                  {shop.name}
                </button>
              </div>
            </div>

            {/* Vehicle Specifications Grid */}
            <div
              className="card"
              style={{
                padding: '1.5rem',
                backgroundColor: '#FFFFFF',
                marginBottom: '2rem'
              }}
            >
              <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem' }}>Technical Specifications</h3>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                  gap: '1rem'
                }}
              >
                <div style={{ backgroundColor: 'var(--color-canvas)', padding: '0.85rem', borderRadius: 'var(--radius-sm)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-ink-muted)', display: 'block' }}>Mileage / Range</span>
                  <strong style={{ fontSize: '0.95rem' }}>{vehicle.mileage}</strong>
                </div>

                <div style={{ backgroundColor: 'var(--color-canvas)', padding: '0.85rem', borderRadius: 'var(--radius-sm)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-ink-muted)', display: 'block' }}>Transmission</span>
                  <strong style={{ fontSize: '0.95rem' }}>{vehicle.transmission}</strong>
                </div>

                <div style={{ backgroundColor: 'var(--color-canvas)', padding: '0.85rem', borderRadius: 'var(--radius-sm)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-ink-muted)', display: 'block' }}>Fuel / Power</span>
                  <strong style={{ fontSize: '0.95rem' }}>{vehicle.fuelType}</strong>
                </div>

                <div style={{ backgroundColor: 'var(--color-canvas)', padding: '0.85rem', borderRadius: 'var(--radius-sm)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-ink-muted)', display: 'block' }}>Completed Trips</span>
                  <strong style={{ fontSize: '0.95rem' }}>{vehicle.trips} rides</strong>
                </div>
              </div>

              {/* Included Equipment */}
              <div style={{ marginTop: '1.25rem', borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
                  Included In-Box Perks:
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {vehicle.features.map((feat, idx) => (
                    <span
                      key={idx}
                      className="badge badge-brand"
                      style={{ fontSize: '0.78rem', padding: '0.3rem 0.65rem' }}
                    >
                      ✓ {feat}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Shop Trust Breakdown Full Panel */}
            <div
              className="card"
              style={{
                padding: '1.75rem',
                backgroundColor: '#FFFFFF'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Community Trust Score</h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--color-ink-muted)', marginTop: '0.2rem' }}>
                    Independently audited 4-pillar record for {shop.name}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="tabular-nums" style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-trust)' }}>
                    {shop.trustScore.toFixed(1)}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-ink-muted)', display: 'block' }}>/ 5.0 Composite</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.3rem' }}>
                    <span style={{ fontWeight: 600 }}>Deposit Honesty</span>
                    <strong style={{ color: 'var(--color-trust)' }}>{shop.trustBreakdown.honesty}%</strong>
                  </div>
                  <div style={{ height: 6, backgroundColor: 'var(--color-canvas)', borderRadius: 3 }}>
                    <div style={{ width: `${shop.trustBreakdown.honesty}%`, height: '100%', backgroundColor: 'var(--color-trust)', borderRadius: 3 }} />
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--color-ink-faint)', marginTop: '0.2rem', display: 'block' }}>
                    Zero frivolous dispute deductions
                  </span>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.3rem' }}>
                    <span style={{ fontWeight: 600 }}>Mechanical Condition</span>
                    <strong style={{ color: 'var(--color-brand)' }}>{shop.trustBreakdown.vehicleCondition}%</strong>
                  </div>
                  <div style={{ height: 6, backgroundColor: 'var(--color-canvas)', borderRadius: 3 }}>
                    <div style={{ width: `${shop.trustBreakdown.vehicleCondition}%`, height: '100%', backgroundColor: 'var(--color-brand)', borderRadius: 3 }} />
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--color-ink-faint)', marginTop: '0.2rem', display: 'block' }}>
                    Bi-weekly certified inspections
                  </span>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.3rem' }}>
                    <span style={{ fontWeight: 600 }}>Punctuality</span>
                    <strong style={{ color: 'var(--color-brand)' }}>{shop.trustBreakdown.punctuality}%</strong>
                  </div>
                  <div style={{ height: 6, backgroundColor: 'var(--color-canvas)', borderRadius: 3 }}>
                    <div style={{ width: `${shop.trustBreakdown.punctuality}%`, height: '100%', backgroundColor: 'var(--color-brand)', borderRadius: 3 }} />
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--color-ink-faint)', marginTop: '0.2rem', display: 'block' }}>
                    Keys ready on scheduled time
                  </span>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.3rem' }}>
                    <span style={{ fontWeight: 600 }}>Communication</span>
                    <strong style={{ color: 'var(--color-brand)' }}>{shop.trustBreakdown.communication}%</strong>
                  </div>
                  <div style={{ height: 6, backgroundColor: 'var(--color-canvas)', borderRadius: 3 }}>
                    <div style={{ width: `${shop.trustBreakdown.communication}%`, height: '100%', backgroundColor: 'var(--color-brand)', borderRadius: 3 }} />
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--color-ink-faint)', marginTop: '0.2rem', display: 'block' }}>
                    Avg reply time &lt; 3 mins
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Dynamic Price Calculation, Schedule Picker & Book Action Card */}
          <div style={{ position: 'sticky', top: '5.5rem' }}>
            <div
              className="card"
              style={{
                padding: '2rem',
                backgroundColor: '#FFFFFF',
                boxShadow: 'var(--shadow-lg)'
              }}
            >
              {/* Daily Rate & Dynamic Badge */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1.25rem' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-ink-muted)' }}>Daily Rental Rate</span>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.3rem' }}>
                    <span className="tabular-nums" style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, color: 'var(--color-brand)' }}>
                      ₹{dailyRate}
                    </span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-ink-muted)' }}>/ 24 hrs</span>
                  </div>
                </div>

                <DynamicPricingTooltip
                  basePrice={vehicle.basePrice}
                  dynamicAdjustment={vehicle.dynamicAdjustment}
                  surgeReasons={vehicle.surgeReasons}
                  weatherFactor={weather?.condition}
                />
              </div>

              {/* Rental Duration Selector */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                    Rental Duration
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.4rem' }}>
                    {[1, 2, 3, 7].map((days) => (
                      <button
                        key={days}
                        type="button"
                        onClick={() => setRentalDays(days)}
                        style={{
                          padding: '0.5rem',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.82rem',
                          fontWeight: rentalDays === days ? 700 : 500,
                          backgroundColor: rentalDays === days ? 'var(--color-brand)' : 'var(--color-canvas-subtle)',
                          color: rentalDays === days ? '#FFFFFF' : 'var(--color-ink)',
                          border: '1px solid var(--color-border)'
                        }}
                      >
                        {days === 7 ? '7 Days (Save 15%)' : `${days} ${days === 1 ? 'Day' : 'Days'}`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Doorstep Delivery Toggle */}
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 0.85rem',
                    backgroundColor: 'var(--color-canvas)',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer'
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block' }}>
                      Doorstep Delivery & Return
                    </span>
                    <span style={{ fontSize: '0.73rem', color: 'var(--color-ink-muted)' }}>
                      Shop staff delivers to your location
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="tabular-nums" style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-brand)' }}>
                      +₹200
                    </span>
                    <input
                      type="checkbox"
                      checked={includeDelivery}
                      onChange={(e) => setIncludeDelivery(e.target.checked)}
                      style={{ accentColor: 'var(--color-brand)', width: 16, height: 16 }}
                    />
                  </div>
                </label>
              </div>

              {/* Transparent Line-Item Breakdown */}
              <div
                style={{
                  backgroundColor: 'var(--color-canvas)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.65rem',
                  fontSize: '0.85rem',
                  marginBottom: '1.75rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-ink-muted)' }}>
                  <span>Base Rate (₹{vehicle.basePrice} × {rentalDays} days)</span>
                  <span className="tabular-nums">₹{vehicle.basePrice * rentalDays}</span>
                </div>

                {dynamicAdj > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-surge)' }}>
                    <span>Dynamic Adjustment (+₹{dynamicAdj}/day)</span>
                    <span className="tabular-nums">+₹{dynamicAdj * rentalDays}</span>
                  </div>
                )}

                {includeDelivery && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-ink-muted)' }}>
                    <span>Doorstep Delivery & Pickup</span>
                    <span className="tabular-nums">₹200</span>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-ink-muted)' }}>
                  <span>GST (18%)</span>
                  <span className="tabular-nums">₹{gst}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-trust)' }}>
                  <span>Refundable Security Deposit</span>
                  <span className="tabular-nums">₹{vehicle.securityDeposit}</span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    borderTop: '1px solid var(--color-border)',
                    paddingTop: '0.75rem',
                    marginTop: '0.35rem',
                    fontWeight: 700,
                    fontSize: '1.05rem',
                    color: 'var(--color-ink)'
                  }}
                >
                  <span>Total Amount Due</span>
                  <span className="tabular-nums" style={{ color: 'var(--color-brand)' }}>
                    ₹{totalPayable}
                  </span>
                </div>
              </div>

              {/* Instant Action CTA */}
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setCurrentView('booking_flow')}
                style={{ width: '100%', padding: '0.95rem', fontSize: '1rem' }}
              >
                <span>Proceed to Instant Booking</span>
                <ChevronRight size={18} />
              </button>

              <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-ink-faint)' }}>
                  Free cancellation with 100% refund in lead time window
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isWalkaroundOpen && (
        <WalkaroundModal
          vehicle={vehicle}
          onClose={() => setIsWalkaroundOpen(false)}
        />
      )}
    </div>
  );
};
