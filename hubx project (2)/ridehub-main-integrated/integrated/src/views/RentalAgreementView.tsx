import React from 'react';
import { ArrowLeft, Printer, ShieldCheck, CheckCircle2, FileText, Download } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const RentalAgreementView: React.FC = () => {
  const { activeBooking, currentUser, setCurrentView, vehicles, shops } = useApp();

  const booking = activeBooking;
  const vehicle = booking ? vehicles.find((v) => v.id === booking.vehicleId) : vehicles[0];
  const shop = booking ? shops.find((s) => s.id === booking.shopId) : shops[0];

  return (
    <div style={{ backgroundColor: 'var(--color-canvas)', minHeight: '85vh', padding: '3rem 0 6rem 0' }}>
      <div className="container" style={{ maxWidth: 800 }}>
        {/* Top bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <button
            type="button"
            onClick={() => setCurrentView('active_rental')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: 'var(--color-ink)',
              fontSize: '0.9rem',
              fontWeight: 600,
              background: 'none'
            }}
          >
            <ArrowLeft size={16} />
            <span>Back to Active Ride</span>
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => window.print()}
            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
          >
            <Printer size={15} />
            <span>Print Official Agreement</span>
          </button>
        </div>

        {/* Structured Agreement Card */}
        <div
          className="card"
          style={{
            padding: '3rem',
            backgroundColor: '#FFFFFF',
            boxShadow: 'var(--shadow-lg)'
          }}
        >
          {/* Header */}
          <div style={{ borderBottom: '2px solid var(--color-ink)', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-accent)', fontWeight: 700 }}>
                  Official RideHub Digital Contract
                </span>
                <h1 style={{ fontSize: '2rem', margin: '0.3rem 0' }}>Rental & Escrow Agreement</h1>
                <span style={{ fontSize: '0.82rem', color: 'var(--color-ink-muted)' }}>
                  Standard Indian Motor Vehicle Lease Summary • Section 65 IT Act Compliant
                </span>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span className="badge badge-trust" style={{ fontSize: '0.8rem' }}>
                  Digitally Signed & Valid
                </span>
                <div style={{ fontFamily: 'monospace', fontWeight: 700, marginTop: '0.4rem', color: 'var(--color-ink)' }}>
                  {booking?.id || 'RH-BK-9281'}
                </div>
              </div>
            </div>
          </div>

          {/* Section 1: Parties to Agreement */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.75rem', color: 'var(--color-brand)' }}>
              1. Designated Parties
            </h3>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1.5rem',
                backgroundColor: 'var(--color-canvas)',
                padding: '1.25rem',
                borderRadius: 'var(--radius-sm)'
              }}
            >
              <div>
                <strong style={{ fontSize: '0.9rem', display: 'block', marginBottom: '0.2rem' }}>
                  Lessor / Partner Shop
                </strong>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-ink)' }}>{shop?.name}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--color-ink-muted)' }}>{shop?.address}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--color-brand)', marginTop: '0.2rem' }}>
                  HubX Verified Honest Partner (Rating: {shop?.trustScore} ★)
                </div>
              </div>

              <div>
                <strong style={{ fontSize: '0.9rem', display: 'block', marginBottom: '0.2rem' }}>
                  Lessee / Verified Rider
                </strong>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-ink)' }}>{currentUser.fullName}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--color-ink-muted)' }}>Phone: {currentUser.phone}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--color-trust)', marginTop: '0.2rem' }}>
                  Licence: {currentUser.verifiedDoc?.number || 'KA-05-2021-0089421 (Verified)'}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Vehicle & Condition Records */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.75rem', color: 'var(--color-brand)' }}>
              2. Vehicle & Handover Baseline
            </h3>
            <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-ink-faint)' }}>Make & Model</span>
                  <div style={{ fontWeight: 600 }}>{vehicle?.name} ({vehicle?.year})</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-ink-faint)' }}>Category</span>
                  <div style={{ fontWeight: 600, textTransform: 'capitalize' }}>{vehicle?.category}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-ink-faint)' }}>Fuel / Transmission</span>
                  <div style={{ fontWeight: 600 }}>{vehicle?.fuelType} • {vehicle?.transmission}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-ink-faint)' }}>Rental Period</span>
                  <div style={{ fontWeight: 600 }}>{booking?.totalHours || 24} Hours Duration</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--color-trust)', backgroundColor: 'var(--color-trust-light)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)' }}>
                <CheckCircle2 size={16} />
                <span>360° Walkaround Inspection Video recorded & timestamped at key handover.</span>
              </div>
            </div>
          </div>

          {/* Section 3: Financials & Deposit Terms */}
          <div style={{ marginBottom: '2.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.75rem', color: 'var(--color-brand)' }}>
              3. Security Deposit Escrow & Dispute Rules
            </h3>
            <div style={{ fontSize: '0.85rem', color: 'var(--color-ink-muted)', lineHeight: 1.6 }}>
              <p style={{ marginBottom: '0.5rem' }}>
                • <strong>Deposit Escrow:</strong> The security deposit of ₹{vehicle?.securityDeposit || 1000} is held safely in escrow by RideHub.
              </p>
              <p style={{ marginBottom: '0.5rem' }}>
                • <strong>Damage Deductions:</strong> No deduction shall be permitted for normal mechanical wear or pre-existing blemishes noted in the digital walkaround video. Any claim requires photographic and video evidence comparison.
              </p>
              <p>
                • <strong>Refund Timeline:</strong> Deposit release is triggered within 2 hours of post-ride vehicle inspection.
              </p>
            </div>
          </div>

          {/* Signatures */}
          <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1.75rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-ink-faint)', textTransform: 'uppercase' }}>
                  Lessor Digital Verification
                </span>
                <div style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--color-brand)', marginTop: '0.5rem' }}>
                  [DIGITALLY SIGNED BY HUBX PARTNER]
                </div>
                <span style={{ fontSize: '0.72rem', color: 'var(--color-ink-muted)' }}>
                  Apex Mobility • Verified Merchant
                </span>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-ink-faint)', textTransform: 'uppercase' }}>
                  Lessee Digital Confirmation
                </span>
                <div style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--color-brand)', marginTop: '0.5rem' }}>
                  [OTP AUTHENTICATED: {currentUser.phone}]
                </div>
                <span style={{ fontSize: '0.72rem', color: 'var(--color-ink-muted)' }}>
                  Aditya Sharma • Sarathi DL Verified
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
