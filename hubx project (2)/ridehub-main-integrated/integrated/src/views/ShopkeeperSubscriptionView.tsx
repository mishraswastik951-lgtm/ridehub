import React from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  Zap,
  Star,
  Award,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { HUBX_PLANS } from '../data/mockData';

export const ShopkeeperSubscriptionView: React.FC = () => {
  const { hubxTrialDaysLeft, currentHubxPlan, setHubxPlan } = useApp();

  return (
    <div style={{ backgroundColor: 'var(--color-canvas)', minHeight: '85vh', padding: '3rem 0 6rem 0' }}>
      <div className="container">
        {/* Active Trial Countdown Banner */}
        <div
          className="card"
          style={{
            padding: '1.5rem 2rem',
            backgroundColor: 'var(--color-brand)',
            color: '#FAF8F4',
            marginBottom: '3rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 'var(--radius-pill)',
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-accent)'
              }}
            >
              <Clock size={24} />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="badge" style={{ backgroundColor: 'var(--color-accent)', color: '#FFFFFF', fontSize: '0.72rem' }}>
                  HubX Trial Active
                </span>
                <span style={{ fontSize: '0.85rem', color: '#D4DBD7' }}>
                  Current Status: {currentHubxPlan}
                </span>
              </div>
              <h3 style={{ color: '#FAF8F4', fontSize: '1.25rem', margin: '0.2rem 0' }}>
                {hubxTrialDaysLeft} Days Remaining in Your Free Pro Period
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#BAC4C0', margin: 0 }}>
                All premium AI forecasting models, priority search algorithms, and deposit escrow tools are unlocked.
              </p>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-accent"
            onClick={() => setHubxPlan('Annual Fleet Master (Active)')}
            style={{ padding: '0.75rem 1.5rem', fontSize: '0.9rem' }}
          >
            <span>Lock Annual 40% Discount</span>
            <ArrowRight size={16} />
          </button>
        </div>

        {/* Pricing Cards Header */}
        <div style={{ textAlign: 'center', maxWidth: 650, margin: '0 auto 3rem auto' }}>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', letterSpacing: '-0.02em', marginBottom: '0.75rem' }}>
            HubX Shopkeeper Subscription Tiers
          </h1>
          <p style={{ color: 'var(--color-ink-muted)', fontSize: '1rem' }}>
            Transform local walk-in rentals into a verified, high-utilization business with proprietary AI pricing intelligence.
          </p>
          <span style={{ fontSize: '0.78rem', color: 'var(--color-accent)', fontWeight: 600, display: 'inline-block', marginTop: '0.35rem' }}>
            (Illustrative pricing for demo and evaluation purposes)
          </span>
        </div>

        {/* Plans Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1.5rem',
            marginBottom: '4rem'
          }}
        >
          {HUBX_PLANS.map((plan) => {
            const isCurrent = currentHubxPlan.toLowerCase().includes(plan.name.toLowerCase()) || (plan.id === 'trial' && currentHubxPlan.includes('Trial'));

            return (
              <div
                key={plan.id}
                className="card"
                style={{
                  padding: '2rem',
                  backgroundColor: '#FFFFFF',
                  display: 'flex',
                  flexDirection: 'column',
                  border: plan.isPopular ? '2px solid var(--color-brand)' : isCurrent ? '2px solid var(--color-trust)' : '1px solid var(--color-border)',
                  position: 'relative'
                }}
              >
                {/* Popular or Savings Badge */}
                {plan.savingsBadge && (
                  <div style={{ position: 'absolute', top: -12, right: 20 }}>
                    <span className="badge badge-accent" style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                      {plan.savingsBadge}
                    </span>
                  </div>
                )}

                {/* Plan Title & Tagline */}
                <h3 style={{ fontSize: '1.35rem', marginBottom: '0.35rem' }}>{plan.name}</h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--color-ink-muted)', minHeight: 40, lineHeight: 1.4, marginBottom: '1.25rem' }}>
                  {plan.tagline}
                </p>

                {/* Price */}
                <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.3rem' }}>
                    <span className="tabular-nums" style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 800, color: 'var(--color-brand)' }}>
                      ₹{plan.pricePerMonth}
                    </span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-ink-muted)' }}>/ month</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-ink-faint)' }}>
                    {plan.billedPeriodText}
                  </span>
                </div>

                {/* Features List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem', flex: 1 }}>
                  {plan.features.map((feat, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.82rem' }}>
                      <CheckCircle2 size={16} color="var(--color-trust)" style={{ flexShrink: 0, marginTop: 2 }} />
                      <span style={{ color: 'var(--color-ink)', lineHeight: 1.4 }}>{feat}</span>
                    </div>
                  ))}
                </div>

                {/* Action CTA */}
                <button
                  type="button"
                  className={isCurrent ? 'btn btn-secondary' : plan.isPopular ? 'btn btn-primary' : 'btn btn-secondary'}
                  onClick={() => setHubxPlan(`${plan.name} (Active)`)}
                  style={{ width: '100%', padding: '0.75rem', fontSize: '0.88rem' }}
                >
                  {isCurrent ? 'Current Active Plan' : `Switch to ${plan.name}`}
                </button>
              </div>
            );
          })}
        </div>

        {/* Feature Comparison Matrix Table */}
        <div
          className="card"
          style={{
            padding: '2.5rem',
            backgroundColor: '#FFFFFF',
            boxShadow: 'var(--shadow-md)'
          }}
        >
          <h3 style={{ fontSize: '1.35rem', marginBottom: '1.5rem' }}>
            HubX Feature Comparison Matrix
          </h3>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--color-border)', backgroundColor: 'var(--color-canvas-subtle)' }}>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>Benefit / Feature</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Standard Shop</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--color-brand)' }}>HubX Pro Tier</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Verified Honest Shop Label</td>
                  <td style={{ padding: '0.85rem 1rem', color: 'var(--color-ink-muted)' }}>No</td>
                  <td style={{ padding: '0.85rem 1rem', color: 'var(--color-trust)', fontWeight: 700 }}>✓ Included</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Search Result Priority Placement</td>
                  <td style={{ padding: '0.85rem 1rem', color: 'var(--color-ink-muted)' }}>Standard Rank</td>
                  <td style={{ padding: '0.85rem 1rem', color: 'var(--color-brand)', fontWeight: 700 }}>Top Tier (+25% views)</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>AI Demand Forecast & Kaggle Regression</td>
                  <td style={{ padding: '0.85rem 1rem', color: 'var(--color-ink-muted)' }}>Locked</td>
                  <td style={{ padding: '0.85rem 1rem', color: 'var(--color-brand)', fontWeight: 700 }}>✓ Full Dashboard Access</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Dynamic Pricing Calendar & Surge Engine</td>
                  <td style={{ padding: '0.85rem 1rem', color: 'var(--color-ink-muted)' }}>Manual Only</td>
                  <td style={{ padding: '0.85rem 1rem', color: 'var(--color-brand)', fontWeight: 700 }}>✓ Automated Weekly Rules</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Hotel Sponsor Coupon Distribution</td>
                  <td style={{ padding: '0.85rem 1rem', color: 'var(--color-ink-muted)' }}>Excluded</td>
                  <td style={{ padding: '0.85rem 1rem', color: 'var(--color-brand)', fontWeight: 700 }}>✓ Taj & Marriott Coupons</td>
                </tr>
                <tr>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Damage Deposit Dispute Protection</td>
                  <td style={{ padding: '0.85rem 1rem', color: 'var(--color-ink-muted)' }}>None</td>
                  <td style={{ padding: '0.85rem 1rem', color: 'var(--color-trust)', fontWeight: 700 }}>✓ Video Escrow Mediation</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
