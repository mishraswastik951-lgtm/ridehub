import React, { useState } from 'react';
import { Sparkles, TrendingUp, Info } from 'lucide-react';

interface DynamicPricingTooltipProps {
  basePrice: number;
  dynamicAdjustment?: number;
  surgeReasons?: string[];
  weatherFactor?: string;
}

export const DynamicPricingTooltip: React.FC<DynamicPricingTooltipProps> = ({
  basePrice,
  dynamicAdjustment = 0,
  surgeReasons = [],
  weatherFactor
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const finalPrice = basePrice + dynamicAdjustment;
  const hasAdjustment = dynamicAdjustment !== 0;

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={hasAdjustment ? 'badge badge-surge' : 'badge badge-outline'}
        style={{
          cursor: 'pointer',
          padding: '0.2rem 0.55rem',
          fontSize: '0.75rem',
          fontWeight: 600,
          gap: '0.35rem'
        }}
        title="Click to view transparent pricing breakdown"
      >
        {hasAdjustment ? (
          <>
            <TrendingUp size={13} strokeWidth={2.2} />
            <span>Dynamic Rate (+₹{dynamicAdjustment})</span>
          </>
        ) : (
          <>
            <Sparkles size={13} strokeWidth={2.2} />
            <span>Base Shop Rate</span>
          </>
        )}
        <Info size={12} strokeWidth={2} style={{ opacity: 0.7 }} />
      </button>

      {isOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            bottom: 'calc(100% + 8px)',
            left: 0,
            width: 280,
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-dropdown)',
            border: '1px solid var(--color-border)',
            padding: '0.9rem',
            zIndex: 100,
            fontSize: '0.82rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--color-ink)' }}>
              Transparent Pricing Breakdown
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--color-ink-muted)' }}>HubX Engine</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', borderTop: '1px solid var(--color-border)', paddingTop: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-ink-muted)' }}>
              <span>Shop Base Daily Rate</span>
              <span className="tabular-nums" style={{ color: 'var(--color-ink)', fontWeight: 600 }}>
                ₹{basePrice}
              </span>
            </div>

            {hasAdjustment ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-surge)' }}>
                  <span>Dynamic Adjustment</span>
                  <span className="tabular-nums" style={{ fontWeight: 700 }}>
                    +₹{dynamicAdjustment}
                  </span>
                </div>

                {surgeReasons.length > 0 && (
                  <div style={{ backgroundColor: 'var(--color-surge-light)', padding: '0.4rem 0.5rem', borderRadius: 'var(--radius-sm)', marginTop: '0.2rem' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-surge)', marginBottom: '0.2rem' }}>
                      Factors influencing this rate:
                    </div>
                    {surgeReasons.map((reason, idx) => (
                      <div key={idx} style={{ fontSize: '0.73rem', color: 'var(--color-ink)', lineHeight: 1.3 }}>
                        • {reason}
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <p style={{ fontSize: '0.73rem', color: 'var(--color-trust)', marginTop: '0.2rem' }}>
                Standard off-peak pricing applies. No weekend or high-demand adjustments active.
              </p>
            )}

            {weatherFactor && (
              <div style={{ fontSize: '0.72rem', color: 'var(--color-ink-muted)' }}>
                Weather condition: {weatherFactor}
              </div>
            )}

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                borderTop: '1px solid var(--color-border)',
                paddingTop: '0.4rem',
                marginTop: '0.2rem',
                fontWeight: 700,
                color: 'var(--color-ink)'
              }}
            >
              <span>Current Total / Day</span>
              <span className="tabular-nums" style={{ color: 'var(--color-brand)', fontSize: '0.95rem' }}>
                ₹{finalPrice}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
