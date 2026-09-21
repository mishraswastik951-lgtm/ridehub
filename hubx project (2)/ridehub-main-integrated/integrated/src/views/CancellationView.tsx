import React, { useState } from 'react';
import {
  ArrowLeft,
  AlertCircle,
  Clock,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const CancellationView: React.FC = () => {
  const { activeBooking, cancelBooking, setCurrentView, vehicles } = useApp();

  const [selectedTierWindow, setSelectedTierWindow] = useState<'tier1' | 'tier2' | 'tier3'>('tier1');
  const [cancelReason, setCancelReason] = useState('Change of travel schedule');
  const [isCancelled, setIsCancelled] = useState(false);
  const [refundSummary, setRefundSummary] = useState<{ refundPct: number; refundAmount: number } | null>(null);

  const booking = activeBooking;
  const vehicle = booking ? vehicles.find((v) => v.id === booking.vehicleId) : vehicles[0];

  const bookingAmount = booking?.finalAmount || 1613;

  // Tier simulation mapping:
  // Tier 1: Elapsed < 25% -> 100%
  // Tier 2: Elapsed < 50% -> 50%
  // Tier 3: Elapsed >= 50% -> 0%
  const currentRefundPct = selectedTierWindow === 'tier1' ? 100 : selectedTierWindow === 'tier2' ? 50 : 0;
  const currentRefundAmount = Math.round((bookingAmount * currentRefundPct) / 100);

  const handleConfirmCancellation = () => {
    if (booking) {
      const res = cancelBooking(booking.id);
      setRefundSummary({
        refundPct: currentRefundPct,
        refundAmount: currentRefundAmount
      });
      setIsCancelled(true);
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--color-canvas)', minHeight: '85vh', padding: '3.5rem 0 6rem 0' }}>
      <div className="container" style={{ maxWidth: 740 }}>
        {/* Navigation back */}
        <button
          type="button"
          onClick={() => setCurrentView('active_rental')}
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
          <span>Back to Active Rental</span>
        </button>

        <div
          className="card"
          style={{
            padding: '2.5rem',
            backgroundColor: '#FFFFFF',
            boxShadow: 'var(--shadow-lg)'
          }}
        >
          {!isCancelled ? (
            <div>
              <div style={{ marginBottom: '1.75rem' }}>
                <span className="badge badge-surge" style={{ marginBottom: '0.4rem' }}>
                  Cancellation Policy
                </span>
                <h2 style={{ fontSize: '1.75rem', margin: '0.3rem 0' }}>
                  Cancellation & Refund Calculator
                </h2>
                <p style={{ color: 'var(--color-ink-muted)', fontSize: '0.9rem' }}>
                  Refund tiers are calculated strictly from the time elapsed between booking confirmation and your scheduled pickup.
                </p>
              </div>

              {/* Visual Refund Tier Stepper Indicator */}
              <div
                style={{
                  backgroundColor: 'var(--color-canvas)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.5rem',
                  marginBottom: '2rem'
                }}
              >
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-ink-faint)', fontWeight: 700, display: 'block', marginBottom: '1rem' }}>
                  Lead-Time Elapsed Windows (RideHub Rules):
                </span>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                  {/* Tier 1 */}
                  <div
                    onClick={() => setSelectedTierWindow('tier1')}
                    style={{
                      padding: '1rem 0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      border: selectedTierWindow === 'tier1' ? '2px solid var(--color-trust)' : '1px solid var(--color-border)',
                      backgroundColor: selectedTierWindow === 'tier1' ? 'var(--color-trust-light)' : '#FFFFFF',
                      cursor: 'pointer',
                      textAlign: 'center'
                    }}
                  >
                    <span className="badge badge-trust" style={{ fontSize: '0.72rem', marginBottom: '0.4rem' }}>
                      First 25% Time
                    </span>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-trust)' }}>
                      100%
                    </div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--color-ink-muted)' }}>
                      Full Refund Window
                    </span>
                  </div>

                  {/* Tier 2 */}
                  <div
                    onClick={() => setSelectedTierWindow('tier2')}
                    style={{
                      padding: '1rem 0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      border: selectedTierWindow === 'tier2' ? '2px solid var(--color-accent)' : '1px solid var(--color-border)',
                      backgroundColor: selectedTierWindow === 'tier2' ? 'var(--color-accent-light)' : '#FFFFFF',
                      cursor: 'pointer',
                      textAlign: 'center'
                    }}
                  >
                    <span className="badge badge-accent" style={{ fontSize: '0.72rem', marginBottom: '0.4rem' }}>
                      Up to 50% Time
                    </span>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-accent)' }}>
                      50%
                    </div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--color-ink-muted)' }}>
                      Partial Refund Window
                    </span>
                  </div>

                  {/* Tier 3 */}
                  <div
                    onClick={() => setSelectedTierWindow('tier3')}
                    style={{
                      padding: '1rem 0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      border: selectedTierWindow === 'tier3' ? '2px solid var(--color-surge)' : '1px solid var(--color-border)',
                      backgroundColor: selectedTierWindow === 'tier3' ? 'var(--color-surge-light)' : '#FFFFFF',
                      cursor: 'pointer',
                      textAlign: 'center'
                    }}
                  >
                    <span className="badge badge-surge" style={{ fontSize: '0.72rem', marginBottom: '0.4rem' }}>
                      After 50% Time
                    </span>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-surge)' }}>
                      0%
                    </div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--color-ink-muted)' }}>
                      Non-refundable
                    </span>
                  </div>
                </div>
              </div>

              {/* Exact Calculation Box */}
              <div
                style={{
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.5rem',
                  marginBottom: '2rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-ink-faint)' }}>Total Paid Amount</span>
                  <div className="tabular-nums" style={{ fontWeight: 700, fontSize: '1.1rem' }}>
                    ₹{bookingAmount}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-ink-muted)' }}>
                    Vehicle: {vehicle?.name}
                  </span>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-ink-faint)' }}>Estimated Refund to UPI</span>
                  <div className="tabular-nums" style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 800, color: currentRefundPct > 0 ? 'var(--color-trust)' : 'var(--color-surge)' }}>
                    ₹{currentRefundAmount}
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: currentRefundPct > 0 ? 'var(--color-trust)' : 'var(--color-surge)' }}>
                    ({currentRefundPct}% Refundable)
                  </span>
                </div>
              </div>

              {/* Reason Selector */}
              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                  Reason for Cancellation
                </label>
                <select
                  className="input-field"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                >
                  <option value="Change of travel schedule">Change of travel schedule</option>
                  <option value="Found alternative transportation">Found alternative transportation</option>
                  <option value="Weather / Rain forecast">Weather / Rain forecast</option>
                  <option value="Booked wrong vehicle by mistake">Booked wrong vehicle by mistake</option>
                  <option value="Other emergency">Other emergency</option>
                </select>
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'space-between' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setCurrentView('active_rental')}
                >
                  Keep Rental Active
                </button>

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleConfirmCancellation}
                  style={{ backgroundColor: '#C62828', borderColor: '#C62828' }}
                >
                  Confirm Cancellation & Process Refund
                </button>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 'var(--radius-pill)',
                  backgroundColor: 'var(--color-trust-light)',
                  color: 'var(--color-trust)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem auto'
                }}
              >
                <CheckCircle2 size={32} />
              </div>

              <span className="badge badge-trust" style={{ fontSize: '0.82rem', marginBottom: '0.5rem' }}>
                Booking Cancelled
              </span>

              <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>
                Refund of ₹{refundSummary?.refundAmount} Initiated
              </h2>

              <p style={{ color: 'var(--color-ink-muted)', fontSize: '0.9rem', maxWidth: 440, margin: '0 auto 1.75rem auto' }}>
                According to the {refundSummary?.refundPct}% tier, the amount has been credited back to your linked UPI account ({booking?.upiRef || 'ICICI UPI'}).
              </p>

              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setCurrentView('search')}
              >
                Return to Search Fleet
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
