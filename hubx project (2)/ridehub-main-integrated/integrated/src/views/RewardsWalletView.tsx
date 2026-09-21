import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Award,
  Sparkles,
  Gift,
  Copy,
  Check,
  ShieldCheck,
  Lock,
  Unlock,
  Building,
  ArrowRight,
  Zap
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const RewardsWalletView: React.FC = () => {
  const { currentUser, coupons, unlockCoupon, setCurrentView, addToast } = useApp();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);

    addToast({
      type: 'success',
      title: 'Coupon Code Copied',
      message: `${code} copied to clipboard. Apply at hotel checkout.`
    });
  };

  const handleUnlock = (couponId: string) => {
    unlockCoupon(couponId);
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#E8623A', '#1F4B3F', '#2E7D5B']
      });
    } catch (e) {}
  };

  return (
    <div style={{ backgroundColor: 'var(--color-canvas)', minHeight: '85vh', padding: '3.5rem 0 6rem 0' }}>
      <div className="container" style={{ maxWidth: 840 }}>
        {/* Wallet Overview Card */}
        <div
          className="card"
          style={{
            padding: '2.5rem',
            backgroundColor: 'var(--color-brand)',
            color: '#FAF8F4',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-lg)',
            marginBottom: '3rem',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#BAC4C0', fontWeight: 700 }}>
                  RideHub Rider Rewards
                </span>
                <h1 style={{ color: '#FAF8F4', fontSize: 'clamp(2rem, 4vw, 2.75rem)', margin: '0.2rem 0' }}>
                  Points & Hotel Perks
                </h1>
                <span style={{ fontSize: '0.85rem', color: '#D4DBD7' }}>
                  Linked to {currentUser.phone} • {currentUser.fullName}
                </span>
              </div>

              {/* Total Balance */}
              <div style={{ textAlign: 'right', backgroundColor: 'rgba(255, 255, 255, 0.1)', padding: '1rem 1.5rem', borderRadius: 'var(--radius-md)', backdropFilter: 'blur(6px)' }}>
                <span style={{ fontSize: '0.75rem', color: '#D4DBD7', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Available Balance
                </span>
                <div className="tabular-nums" style={{ fontFamily: 'var(--font-display)', fontSize: '2.4rem', fontWeight: 800, color: '#FAF8F4' }}>
                  {currentUser.rewardPoints}
                </div>
                <span style={{ fontSize: '0.78rem', color: 'var(--color-accent)', fontWeight: 600 }}>
                  Worth up to ₹{currentUser.rewardPoints} off
                </span>
              </div>
            </div>

            {/* How points work rule banner */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.15)',
                paddingTop: '1.25rem',
                fontSize: '0.85rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <Zap size={16} color="var(--color-accent)" />
                <span>Earn 1 Point per ₹10 spent on HubX rides</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <Sparkles size={16} color="var(--color-accent)" />
                <span>+150 Points on Digital ID Verification</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <Gift size={16} color="var(--color-accent)" />
                <span>Unlocks Partner Hotel Luxury Vouchers</span>
              </div>
            </div>
          </div>
        </div>

        {/* Hotel Sponsorship Vouchers Section */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
            <div>
              <div className="badge badge-accent" style={{ marginBottom: '0.35rem' }}>
                <Building size={13} />
                <span>Hospitality Sponsor Network</span>
              </div>
              <h2 style={{ fontSize: '1.8rem', letterSpacing: '-0.02em' }}>
                Partner Hotel Vouchers
              </h2>
              <p style={{ color: 'var(--color-ink-muted)', fontSize: '0.9rem' }}>
                Completed HubX rides unlock exclusive discounts at partner luxury resorts and backpacker stays.
              </p>
            </div>
          </div>

          {/* Vouchers Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
            {coupons.map((cpn) => {
              const isUnlocked = cpn.isUnlocked;

              return (
                <div
                  key={cpn.id}
                  className="card"
                  style={{
                    padding: '1.75rem',
                    backgroundColor: '#FFFFFF',
                    border: isUnlocked ? '1.5px solid var(--color-trust)' : '1px solid var(--color-border)',
                    position: 'relative',
                    transition: 'all var(--transition-normal)'
                  }}
                >
                  {/* Top row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--color-ink-faint)', fontWeight: 600 }}>
                        {cpn.partnerName}
                      </span>
                      <h3 style={{ fontSize: '1.25rem', marginTop: '0.15rem' }}>{cpn.hotelName}</h3>
                    </div>

                    <span
                      className={isUnlocked ? 'badge badge-trust' : 'badge badge-outline'}
                      style={{ fontSize: '0.72rem' }}
                    >
                      {isUnlocked ? 'Unlocked & Ready' : 'Locked Reward'}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--color-brand)', marginBottom: '0.5rem' }}>
                    {cpn.discountText}
                  </p>

                  <p style={{ fontSize: '0.8rem', color: 'var(--color-ink-muted)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                    {cpn.terms}
                  </p>

                  {/* Coupon Code Block */}
                  {isUnlocked ? (
                    <div
                      style={{
                        backgroundColor: 'var(--color-canvas)',
                        border: '1px dashed var(--color-trust)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '0.75rem 1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div>
                        <span style={{ fontSize: '0.68rem', color: 'var(--color-ink-faint)', textTransform: 'uppercase', display: 'block' }}>
                          Promo Voucher Code
                        </span>
                        <span style={{ fontFamily: 'monospace', fontSize: '1rem', fontWeight: 800, color: 'var(--color-brand)' }}>
                          {cpn.couponCode}
                        </span>
                      </div>

                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => handleCopy(cpn.couponCode)}
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.78rem' }}
                      >
                        {copiedCode === cpn.couponCode ? (
                          <>
                            <Check size={14} color="var(--color-trust)" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy size={14} />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    <div
                      style={{
                        backgroundColor: 'var(--color-canvas-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '0.85rem 1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.82rem', color: 'var(--color-ink-muted)' }}>
                        <Lock size={15} />
                        <span>Requires 1 completed HubX ride</span>
                      </div>

                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => handleUnlock(cpn.id)}
                        style={{ padding: '0.4rem 0.85rem', fontSize: '0.78rem' }}
                      >
                        <Unlock size={14} />
                        <span>Unlock Perk</span>
                      </button>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '0.85rem', borderTop: '1px solid var(--color-border)', fontSize: '0.75rem', color: 'var(--color-ink-faint)' }}>
                    <span>Valid through: {cpn.validTill}</span>
                    <span>Direct partner redemption</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
