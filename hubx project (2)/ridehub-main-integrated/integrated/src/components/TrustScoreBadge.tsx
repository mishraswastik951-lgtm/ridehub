import React, { useState } from 'react';
import { ShieldCheck, Info } from 'lucide-react';
import { TrustBreakdown } from '../types';

interface TrustScoreBadgeProps {
  score: number;
  breakdown: TrustBreakdown;
  showDetailsButton?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onViewShopProfile?: () => void;
}

export const TrustScoreBadge: React.FC<TrustScoreBadgeProps> = ({
  score,
  breakdown,
  showDetailsButton = true,
  size = 'md',
  onViewShopProfile
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="badge badge-trust"
        style={{
          cursor: 'pointer',
          padding: size === 'sm' ? '0.2rem 0.5rem' : size === 'lg' ? '0.45rem 0.9rem' : '0.3rem 0.65rem',
          fontSize: size === 'sm' ? '0.75rem' : size === 'lg' ? '0.9rem' : '0.82rem',
          gap: '0.4rem',
          border: '1px solid rgba(46, 125, 91, 0.25)',
          backgroundColor: '#E9F4EF',
          color: '#2E7D5B',
          fontWeight: 700
        }}
        title="Click to view 4-part community trust breakdown"
      >
        <ShieldCheck size={size === 'sm' ? 14 : size === 'lg' ? 18 : 15} strokeWidth={2.2} />
        <span>{score.toFixed(1)}</span>
        <span style={{ fontWeight: 500, opacity: 0.85, fontSize: '0.75em' }}>Trust Score</span>
      </button>

      {/* Floating 4-Part Trust Breakdown Popover */}
      {isOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            bottom: 'calc(100% + 8px)',
            left: 0,
            width: 290,
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-dropdown)',
            border: '1px solid var(--color-border)',
            padding: '1rem',
            zIndex: 100,
            fontSize: '0.85rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-brand)' }}>
              <ShieldCheck size={16} strokeWidth={2.2} />
              <strong style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem' }}>4-Pillar Trust Index</strong>
            </div>
            <span className="badge badge-trust" style={{ fontSize: '0.7rem' }}>
              Verified Honest
            </span>
          </div>

          <p style={{ color: 'var(--color-ink-muted)', fontSize: '0.75rem', marginBottom: '0.85rem', lineHeight: 1.4 }}>
            Community score calculated from verified rental outcomes, damage deposit fairness, and vehicle inspection logs.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {/* 1. Honesty */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.15rem' }}>
                <span style={{ color: 'var(--color-ink)', fontWeight: 600 }}>Deposit & Damage Honesty</span>
                <span className="tabular-nums" style={{ color: 'var(--color-trust)', fontWeight: 700 }}>
                  {breakdown.honesty}%
                </span>
              </div>
              <div style={{ height: 4, backgroundColor: 'var(--color-canvas-subtle)', borderRadius: 2 }}>
                <div
                  style={{
                    height: '100%',
                    width: `${breakdown.honesty}%`,
                    backgroundColor: 'var(--color-trust)',
                    borderRadius: 2
                  }}
                />
              </div>
            </div>

            {/* 2. Vehicle Condition */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.15rem' }}>
                <span style={{ color: 'var(--color-ink)', fontWeight: 600 }}>Mechanical Condition</span>
                <span className="tabular-nums" style={{ color: 'var(--color-brand)', fontWeight: 700 }}>
                  {breakdown.vehicleCondition}%
                </span>
              </div>
              <div style={{ height: 4, backgroundColor: 'var(--color-canvas-subtle)', borderRadius: 2 }}>
                <div
                  style={{
                    height: '100%',
                    width: `${breakdown.vehicleCondition}%`,
                    backgroundColor: 'var(--color-brand)',
                    borderRadius: 2
                  }}
                />
              </div>
            </div>

            {/* 3. Punctuality */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.15rem' }}>
                <span style={{ color: 'var(--color-ink)', fontWeight: 600 }}>Handover Punctuality</span>
                <span className="tabular-nums" style={{ color: 'var(--color-brand)', fontWeight: 700 }}>
                  {breakdown.punctuality}%
                </span>
              </div>
              <div style={{ height: 4, backgroundColor: 'var(--color-canvas-subtle)', borderRadius: 2 }}>
                <div
                  style={{
                    height: '100%',
                    width: `${breakdown.punctuality}%`,
                    backgroundColor: 'var(--color-brand)',
                    borderRadius: 2
                  }}
                />
              </div>
            </div>

            {/* 4. Communication */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.15rem' }}>
                <span style={{ color: 'var(--color-ink)', fontWeight: 600 }}>Chat & Dispute Clarity</span>
                <span className="tabular-nums" style={{ color: 'var(--color-brand)', fontWeight: 700 }}>
                  {breakdown.communication}%
                </span>
              </div>
              <div style={{ height: 4, backgroundColor: 'var(--color-canvas-subtle)', borderRadius: 2 }}>
                <div
                  style={{
                    height: '100%',
                    width: `${breakdown.communication}%`,
                    backgroundColor: 'var(--color-brand)',
                    borderRadius: 2
                  }}
                />
              </div>
            </div>
          </div>

          {showDetailsButton && onViewShopProfile && (
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onViewShopProfile();
              }}
              style={{
                marginTop: '0.85rem',
                width: '100%',
                padding: '0.45rem',
                fontSize: '0.75rem',
                color: 'var(--color-brand)',
                backgroundColor: 'var(--color-brand-light)',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 600
              }}
            >
              View Full Shop Audit Profile →
            </button>
          )}
        </div>
      )}
    </div>
  );
};
