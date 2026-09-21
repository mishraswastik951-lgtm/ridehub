import React from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  MessageSquare,
  Wrench,
  Award,
  ArrowLeft,
  Star,
  MapPin
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ShopTrustProfileView: React.FC = () => {
  const { selectedShopId, shops, vehicles, setCurrentView, setSelectedVehicleId } = useApp();

  const shop = shops.find((s) => s.id === selectedShopId) || shops[0];
  const shopVehicles = vehicles.filter((v) => v.shopId === shop.id);

  return (
    <div style={{ backgroundColor: 'var(--color-canvas)', minHeight: '85vh', padding: '3rem 0 6rem 0' }}>
      <div className="container" style={{ maxWidth: 900 }}>
        {/* Back Link */}
        <button
          type="button"
          onClick={() => setCurrentView('search')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: 'var(--color-ink)',
            fontSize: '0.88rem',
            fontWeight: 600,
            marginBottom: '1.75rem',
            background: 'none'
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Search</span>
        </button>

        {/* Shop Header Card */}
        <div
          className="card"
          style={{
            padding: '2.5rem',
            backgroundColor: '#FFFFFF',
            boxShadow: 'var(--shadow-md)',
            marginBottom: '2.5rem'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '2rem', marginBottom: '2rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                <span className="badge badge-trust" style={{ fontSize: '0.8rem' }}>
                  ★ {shop.badge}
                </span>
                <span className="badge badge-brand" style={{ fontSize: '0.8rem' }}>
                  HubX Partner Since 2023
                </span>
              </div>
              <h1 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', margin: '0.2rem 0' }}>
                {shop.name}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-ink-muted)', fontSize: '0.9rem' }}>
                <MapPin size={16} />
                <span>{shop.address}, {shop.city}</span>
              </div>
            </div>

            {/* Big Composite Trust Score */}
            <div
              style={{
                backgroundColor: 'var(--color-trust-light)',
                border: '1.5px solid #C8E6C9',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem 2rem',
                textAlign: 'center'
              }}
            >
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-trust)', fontWeight: 700 }}>
                Composite Trust Index
              </span>
              <div className="tabular-nums" style={{ fontFamily: 'var(--font-display)', fontSize: '2.8rem', fontWeight: 800, color: 'var(--color-trust)', lineHeight: 1.1 }}>
                {shop.trustScore.toFixed(1)}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-ink-muted)' }}>
                Based on {shop.totalBookings} audited rentals
              </span>
            </div>
          </div>

          {/* 4 Pillars Breakdown Deep Dive */}
          <div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem' }}>
              4-Pillar Trust Verification Record
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {/* Pillar 1: Honesty */}
              <div style={{ backgroundColor: 'var(--color-canvas)', padding: '1.25rem', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-trust)', fontWeight: 700 }}>
                    <ShieldCheck size={18} />
                    <span>Honesty (Dispute Rate)</span>
                  </div>
                  <span className="tabular-nums" style={{ fontWeight: 800, color: 'var(--color-trust)', fontSize: '1.1rem' }}>
                    {shop.trustBreakdown.honesty}%
                  </span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-ink-muted)', lineHeight: 1.4 }}>
                  Zero unjustified deductions in 800+ completed rides. All damage claims must match before/after walkaround video proof.
                </p>
              </div>

              {/* Pillar 2: Vehicle Condition */}
              <div style={{ backgroundColor: 'var(--color-canvas)', padding: '1.25rem', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-brand)', fontWeight: 700 }}>
                    <Wrench size={18} />
                    <span>Mechanical Condition</span>
                  </div>
                  <span className="tabular-nums" style={{ fontWeight: 800, color: 'var(--color-brand)', fontSize: '1.1rem' }}>
                    {shop.trustBreakdown.vehicleCondition}%
                  </span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-ink-muted)', lineHeight: 1.4 }}>
                  Mandatory 15-day certified maintenance audit on brakes, engine oil, tyre treads, and combi-ABS electronics.
                </p>
              </div>

              {/* Pillar 3: Punctuality */}
              <div style={{ backgroundColor: 'var(--color-canvas)', padding: '1.25rem', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-brand)', fontWeight: 700 }}>
                    <Clock size={18} />
                    <span>Punctuality</span>
                  </div>
                  <span className="tabular-nums" style={{ fontWeight: 800, color: 'var(--color-brand)', fontSize: '1.1rem' }}>
                    {shop.trustBreakdown.punctuality}%
                  </span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-ink-muted)', lineHeight: 1.4 }}>
                  Vehicle washed, full tank certified, and keys ready within 3 minutes of scheduled pickup time.
                </p>
              </div>

              {/* Pillar 4: Communication */}
              <div style={{ backgroundColor: 'var(--color-canvas)', padding: '1.25rem', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-brand)', fontWeight: 700 }}>
                    <MessageSquare size={18} />
                    <span>Communication</span>
                  </div>
                  <span className="tabular-nums" style={{ fontWeight: 800, color: 'var(--color-brand)', fontSize: '1.1rem' }}>
                    {shop.trustBreakdown.communication}%
                  </span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-ink-muted)', lineHeight: 1.4 }}>
                  Instant digital agreement confirmation and emergency chat response under 2.5 minutes on average.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Fleet Listings for this shop */}
        <div style={{ marginBottom: '2.5rem' }}>
          <h3 style={{ fontSize: '1.3rem', marginBottom: '1.25rem' }}>
            Vehicles Listed by {shop.name} ({shopVehicles.length})
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
            {shopVehicles.map((veh) => (
              <div
                key={veh.id}
                className="card card-hoverable"
                style={{ padding: '1rem', backgroundColor: '#FFFFFF', cursor: 'pointer' }}
                onClick={() => {
                  setSelectedVehicleId(veh.id);
                  setCurrentView('vehicle_detail');
                }}
              >
                <img
                  src={veh.image}
                  alt={veh.name}
                  style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 'var(--radius-sm)', marginBottom: '0.75rem' }}
                />
                <h4 style={{ fontSize: '1rem', margin: '0 0 0.2rem 0' }}>{veh.name}</h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--color-ink-muted)' }}>{veh.transmission}</span>
                  <span className="tabular-nums" style={{ fontWeight: 700, color: 'var(--color-brand)' }}>
                    ₹{veh.basePrice}/day
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
