import React from 'react';
import {
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Zap,
  TrendingUp,
  Award,
  Store,
  ArrowRight,
  FileCheck2,
  Lock,
  Clock
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const HowItWorksView: React.FC = () => {
  const { setCurrentView, switchRole } = useApp();

  return (
    <div style={{ backgroundColor: 'var(--color-canvas)', minHeight: '85vh', padding: '3.5rem 0 6rem 0' }}>
      <div className="container" style={{ maxWidth: 880 }}>
        {/* Navigation back */}
        <button
          type="button"
          onClick={() => setCurrentView('landing')}
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
          <span>Return to Home</span>
        </button>

        {/* Editorial Narrative Header */}
        <div style={{ marginBottom: '3.5rem' }}>
          <span className="badge badge-brand" style={{ marginBottom: '0.75rem' }}>
            The RideHub Standard
          </span>
          <h1 style={{ fontSize: 'clamp(2rem, 4.5vw, 3.2rem)', letterSpacing: '-0.03em', marginBottom: '1rem' }}>
            How RideHub Works
          </h1>
          <p style={{ color: 'var(--color-ink-muted)', fontSize: '1.2rem', lineHeight: 1.6, maxWidth: 680 }}>
            We replaced paper contracts, cash deposit disputes, and endless phone calls with a fast, verified digital rental network.
          </p>
        </div>

        {/* Step-by-Step Customer Journey */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginBottom: '4rem' }}>
          <div className="card" style={{ padding: '2.5rem', backgroundColor: '#FFFFFF' }}>
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
              <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-brand)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.3rem', flexShrink: 0 }}>
                1
              </div>
              <div>
                <h3 style={{ fontSize: '1.35rem', marginBottom: '0.4rem' }}>
                  Browse & Discover Verified Independent Shops
                </h3>
                <p style={{ color: 'var(--color-ink-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                  Search scooters, performance motorcycles, or cars within walking distance. Every shop listing displays its independently audited 4-pillar Trust Score (Honesty, Vehicle Condition, Punctuality, Communication) and 360° walkaround inspection videos.
                </p>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: '2.5rem', backgroundColor: '#FFFFFF' }}>
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
              <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-accent)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.3rem', flexShrink: 0 }}>
                2
              </div>
              <div>
                <h3 style={{ fontSize: '1.35rem', marginBottom: '0.4rem' }}>
                  30-Second Digital Document Verification
                </h3>
                <p style={{ color: 'var(--color-ink-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                  Upload your Driving Licence once. Our optical engine cross-checks the national transport registry in seconds. No shopkeeper ever retains your physical documents, and you instantly unlock +150 loyalty welcome points.
                </p>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: '2.5rem', backgroundColor: '#FFFFFF' }}>
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
              <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-trust)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.3rem', flexShrink: 0 }}>
                3
              </div>
              <div>
                <h3 style={{ fontSize: '1.35rem', marginBottom: '0.4rem' }}>
                  Transparent Pricing & Escrow Deposit Protection
                </h3>
                <p style={{ color: 'var(--color-ink-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                  See every surge and discount factor itemized transparently. Security deposits are held in safe escrow—deductions are strictly prohibited unless verified against the timestamped before/after video record.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* The 4-Pillar Trust Index Explained */}
        <div
          className="card"
          style={{
            padding: '2.5rem',
            backgroundColor: '#FFFFFF',
            marginBottom: '4rem',
            border: '1.5px solid var(--color-trust)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--color-trust)' }}>
            <ShieldCheck size={20} />
            <span style={{ fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              The Core Engine
            </span>
          </div>

          <h2 style={{ fontSize: '1.8rem', letterSpacing: '-0.02em', marginBottom: '1rem' }}>
            How the Community Trust Score is Computed
          </h2>

          <p style={{ color: 'var(--color-ink-muted)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2rem' }}>
            Unlike generic 5-star review widgets that can be faked, the RideHub Trust Score is an algorithmic composite of four audited operational metrics:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            <div>
              <strong style={{ fontSize: '1rem', color: 'var(--color-ink)', display: 'block', marginBottom: '0.3rem' }}>
                1. Honesty Index
              </strong>
              <p style={{ fontSize: '0.82rem', color: 'var(--color-ink-muted)', lineHeight: 1.5 }}>
                Measures deposit refund disputes. Shops with even 1 unjustified claim lose their "Verified Honest" badge.
              </p>
            </div>

            <div>
              <strong style={{ fontSize: '1rem', color: 'var(--color-ink)', display: 'block', marginBottom: '0.3rem' }}>
                2. Mechanical Health
              </strong>
              <p style={{ fontSize: '0.82rem', color: 'var(--color-ink-muted)', lineHeight: 1.5 }}>
                Tracks bi-weekly certified maintenance audits on tyres, combi-brakes, batteries, and engine oil.
              </p>
            </div>

            <div>
              <strong style={{ fontSize: '1rem', color: 'var(--color-ink)', display: 'block', marginBottom: '0.3rem' }}>
                3. Punctuality
              </strong>
              <p style={{ fontSize: '0.82rem', color: 'var(--color-ink-muted)', lineHeight: 1.5 }}>
                Measures on-time key handovers within 3 minutes of the customer's scheduled arrival.
              </p>
            </div>

            <div>
              <strong style={{ fontSize: '1rem', color: 'var(--color-ink)', display: 'block', marginBottom: '0.3rem' }}>
                4. Communication
              </strong>
              <p style={{ fontSize: '0.82rem', color: 'var(--color-ink-muted)', lineHeight: 1.5 }}>
                Measures response time in the in-app roadside chat (platform average: 2.5 minutes).
              </p>
            </div>
          </div>
        </div>

        {/* CTA banner */}
        <div
          style={{
            backgroundColor: 'var(--color-brand)',
            borderRadius: 'var(--radius-lg)',
            padding: '3rem 2.5rem',
            color: '#FAF8F4',
            textAlign: 'center'
          }}
        >
          <h2 style={{ color: '#FAF8F4', fontSize: '2rem', marginBottom: '0.75rem' }}>
            Ready to experience a modern rental?
          </h2>
          <p style={{ color: '#D4DBD7', maxWidth: 460, margin: '0 auto 2rem auto', fontSize: '1rem' }}>
            Browse local scooters, bikes, and cars near your location with instant digital approval.
          </p>

          <button
            type="button"
            className="btn btn-accent"
            onClick={() => setCurrentView('search')}
            style={{ padding: '0.9rem 2.2rem', fontSize: '1.05rem' }}
          >
            <span>Explore Nearby Fleet</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
