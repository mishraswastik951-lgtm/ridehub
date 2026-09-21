import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  FileCheck2,
  Upload,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Clock,
  Lock,
  Camera,
  RefreshCw
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const VerificationView: React.FC = () => {
  const { currentUser, updateUserProfile, setCurrentView, addToast } = useApp();

  const [docType, setDocType] = useState<'driving_licence' | 'aadhaar'>('driving_licence');
  const [stage, setStage] = useState<'upload' | 'reading' | 'verified'>(
    currentUser.isVerified ? 'verified' : 'upload'
  );

  // Typewriter extraction fields
  const [extractedFields, setExtractedFields] = useState({
    name: '',
    dob: '',
    licenceNumber: '',
    expiryDate: '',
    category: '',
    rto: ''
  });

  const fullTargetData = {
    name: currentUser.fullName || 'Aditya Sharma',
    dob: '14-Aug-1995',
    licenceNumber: 'KA-05-2021-0089421',
    expiryDate: '13-Aug-2042',
    category: 'MCWG (Gear 2W) & LMV (Cars)',
    rto: 'KA-05 Jayanagar RTO, Bengaluru'
  };

  const startOcrSimulation = () => {
    setStage('reading');
    setExtractedFields({
      name: '',
      dob: '',
      licenceNumber: '',
      expiryDate: '',
      category: '',
      rto: ''
    });

    // Populate field by field with realistic delay
    setTimeout(() => {
      setExtractedFields((prev) => ({ ...prev, name: fullTargetData.name }));
    }, 600);

    setTimeout(() => {
      setExtractedFields((prev) => ({ ...prev, dob: fullTargetData.dob }));
    }, 1200);

    setTimeout(() => {
      setExtractedFields((prev) => ({ ...prev, licenceNumber: fullTargetData.licenceNumber }));
    }, 1800);

    setTimeout(() => {
      setExtractedFields((prev) => ({ ...prev, category: fullTargetData.category }));
    }, 2400);

    setTimeout(() => {
      setExtractedFields((prev) => ({
        ...prev,
        expiryDate: fullTargetData.expiryDate,
        rto: fullTargetData.rto
      }));

      // Completed verification
      setStage('verified');
      updateUserProfile({
        isVerified: true,
        rewardPoints: currentUser.rewardPoints + 150,
        verifiedDoc: {
          type: docType === 'driving_licence' ? 'Driving Licence' : 'Aadhaar Card',
          number: fullTargetData.licenceNumber,
          name: fullTargetData.name,
          dob: fullTargetData.dob,
          expiry: fullTargetData.expiryDate,
          category: fullTargetData.category,
          issuingRTO: fullTargetData.rto
        }
      });

      // Celebratory Confetti Animation
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#1F4B3F', '#E8623A', '#2E7D5B', '#FAF8F4']
        });
      } catch (e) {
        // Fallback gracefully
      }

      addToast({
        type: 'success',
        title: 'Identity Verified Successfully',
        message: '+150 Bonus Loyalty Points awarded to your RideHub wallet!'
      });
    }, 3200);
  };

  return (
    <div style={{ backgroundColor: 'var(--color-canvas)', minHeight: '85vh', padding: '3.5rem 0 6rem 0' }}>
      <div className="container" style={{ maxWidth: 760 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div
            className="badge badge-brand"
            style={{
              padding: '0.35rem 0.85rem',
              fontSize: '0.82rem',
              fontWeight: 700,
              marginBottom: '0.85rem'
            }}
          >
            <ShieldCheck size={16} strokeWidth={2.3} />
            <span>Digital KYC & Transport Registry Match</span>
          </div>

          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', letterSpacing: '-0.02em', marginBottom: '0.75rem' }}>
            Digital Document Verification
          </h1>

          <p style={{ color: 'var(--color-ink-muted)', fontSize: '1.05rem', maxWidth: 540, margin: '0 auto' }}>
            Upload your Indian Driving Licence once. Enjoy instant key handovers across our entire HubX partner network with zero physical paperwork.
          </p>
        </div>

        {/* Verification Card */}
        <div
          className="card"
          style={{
            padding: '2.5rem',
            backgroundColor: '#FFFFFF',
            boxShadow: 'var(--shadow-lg)'
          }}
        >
          {/* Document Type Switcher */}
          {stage === 'upload' && (
            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-ink)', marginBottom: '0.65rem' }}>
                Select Document to Verify:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setDocType('driving_licence')}
                  style={{
                    padding: '0.85rem',
                    borderRadius: 'var(--radius-sm)',
                    border: docType === 'driving_licence' ? '2px solid var(--color-brand)' : '1px solid var(--color-border)',
                    backgroundColor: docType === 'driving_licence' ? 'var(--color-brand-light)' : '#FFFFFF',
                    color: docType === 'driving_licence' ? 'var(--color-brand)' : 'var(--color-ink)',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                    <FileCheck2 size={18} />
                    <span>Driving Licence (DL)</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--color-ink-muted)' }}>
                    Sarathi / Parivahan Verified
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setDocType('aadhaar')}
                  style={{
                    padding: '0.85rem',
                    borderRadius: 'var(--radius-sm)',
                    border: docType === 'aadhaar' ? '2px solid var(--color-brand)' : '1px solid var(--color-border)',
                    backgroundColor: docType === 'aadhaar' ? 'var(--color-brand-light)' : '#FFFFFF',
                    color: docType === 'aadhaar' ? 'var(--color-brand)' : 'var(--color-ink)',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                    <ShieldCheck size={18} />
                    <span>Aadhaar Card (UIDAI)</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--color-ink-muted)' }}>
                    Identity & Address Record
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Upload Dropzone */}
          {stage === 'upload' && (
            <div>
              <div
                onClick={startOcrSimulation}
                style={{
                  border: '2px dashed var(--color-border-dark)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '3rem 1.5rem',
                  textAlign: 'center',
                  backgroundColor: 'var(--color-canvas)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-normal)'
                }}
              >
                <div
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 'var(--radius-pill)',
                    backgroundColor: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.25rem auto',
                    boxShadow: 'var(--shadow-sm)',
                    color: 'var(--color-brand)'
                  }}
                >
                  <Upload size={28} />
                </div>

                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.35rem' }}>
                  Click or drag your Driving Licence photo
                </h3>
                <p style={{ color: 'var(--color-ink-muted)', fontSize: '0.88rem', maxWidth: 400, margin: '0 auto 1.5rem auto' }}>
                  Accepts clear PNG, JPG, or PDF scan of front & back. Ensure your licence number and vehicle classes are legible.
                </p>

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    startOcrSimulation();
                  }}
                  style={{ padding: '0.75rem 1.75rem' }}
                >
                  <Camera size={16} />
                  <span>Select Image & Start Optical Scan</span>
                </button>
              </div>

              {/* Bonus Points Pill Notice */}
              <div
                style={{
                  marginTop: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  backgroundColor: 'var(--color-accent-light)',
                  padding: '0.85rem 1.25rem',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--color-accent)'
                }}
              >
                <Sparkles size={18} />
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                  Completion Reward: Instant +150 loyalty points credited toward your next rental discount.
                </span>
              </div>
            </div>
          )}

          {/* Reading / Optical OCR Extraction Simulation */}
          {stage === 'reading' && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 'var(--radius-pill)',
                    backgroundColor: 'var(--color-brand-light)',
                    color: 'var(--color-brand)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1rem auto'
                  }}
                >
                  <RefreshCw size={24} className="spin" />
                </div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.35rem' }}>
                  Reading Document & Verifying with National Registry
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-ink-muted)' }}>
                  Extracting cryptographic identity fields in real-time...
                </p>
              </div>

              {/* Live Typewriter Extraction Panel */}
              <div
                style={{
                  backgroundColor: 'var(--color-canvas)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.5rem',
                  border: '1px solid var(--color-border)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem'
                }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-ink-faint)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Rider Legal Name
                    </span>
                    <div style={{ fontSize: '1rem', fontWeight: 700, minHeight: 24, color: 'var(--color-ink)' }}>
                      {extractedFields.name ? (
                        <span className="typewriter-text">{extractedFields.name}</span>
                      ) : (
                        <div className="skeleton" style={{ width: '70%', height: 18 }} />
                      )}
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-ink-faint)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Date of Birth
                    </span>
                    <div style={{ fontSize: '1rem', fontWeight: 700, minHeight: 24, color: 'var(--color-ink)' }}>
                      {extractedFields.dob ? (
                        <span className="typewriter-text">{extractedFields.dob}</span>
                      ) : (
                        <div className="skeleton" style={{ width: '50%', height: 18 }} />
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-ink-faint)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Licence Registration Number
                    </span>
                    <div style={{ fontSize: '1.05rem', fontWeight: 800, minHeight: 24, color: 'var(--color-brand)', fontFamily: 'monospace' }}>
                      {extractedFields.licenceNumber ? (
                        <span className="typewriter-text">{extractedFields.licenceNumber}</span>
                      ) : (
                        <div className="skeleton" style={{ width: '85%', height: 18 }} />
                      )}
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-ink-faint)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Authorised Vehicle Categories
                    </span>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, minHeight: 24, color: 'var(--color-ink)' }}>
                      {extractedFields.category ? (
                        <span className="typewriter-text">{extractedFields.category}</span>
                      ) : (
                        <div className="skeleton" style={{ width: '60%', height: 18 }} />
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-ink-faint)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Issuing Authority & Validity
                  </span>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-ink-muted)', minHeight: 20 }}>
                    {extractedFields.rto ? (
                      <span>{extractedFields.rto} • Valid until {extractedFields.expiryDate}</span>
                    ) : (
                      <div className="skeleton" style={{ width: '80%', height: 16 }} />
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Verification Success Screen */}
          {stage === 'verified' && (
            <div style={{ textAlign: 'center' }}>
              {/* Animated Drawing Checkmark SVG */}
              <div style={{ width: 84, height: 84, margin: '0 auto 1.5rem auto' }}>
                <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
                  <circle
                    cx="50"
                    cy="50"
                    r="44"
                    fill="#E9F4EF"
                    stroke="#2E7D5B"
                    strokeWidth="4"
                  />
                  <path
                    d="M30 52 L44 66 L70 34"
                    fill="none"
                    stroke="#2E7D5B"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                      strokeDasharray: 100,
                      strokeDashoffset: 0,
                      animation: 'drawCheck 600ms var(--ease-editorial) forwards'
                    }}
                  />
                </svg>
              </div>

              <span className="badge badge-trust" style={{ fontSize: '0.82rem', padding: '0.35rem 0.85rem', marginBottom: '0.75rem' }}>
                Identity Verified & Authenticated
              </span>

              <h2 style={{ fontSize: '1.8rem', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
                You're Clear to Ride Anywhere
              </h2>

              <p style={{ color: 'var(--color-ink-muted)', fontSize: '0.95rem', maxWidth: 460, margin: '0 auto 2rem auto' }}>
                Your licence details have been verified and linked to <strong>{currentUser.phone}</strong>. No shop will retain your physical ID card.
              </p>

              {/* Verified Identity Credential Card */}
              <div
                style={{
                  backgroundColor: 'var(--color-canvas)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.25rem',
                  maxWidth: 440,
                  margin: '0 auto 2rem auto',
                  textAlign: 'left'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-ink-faint)', textTransform: 'uppercase' }}>
                    Sarathi Digital Licence
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-trust)', fontWeight: 700 }}>
                    Active • MCWG / LMV
                  </span>
                </div>
                <strong style={{ fontSize: '1.1rem', display: 'block', color: 'var(--color-ink)' }}>
                  {currentUser.verifiedDoc?.name || fullTargetData.name}
                </strong>
                <span style={{ fontSize: '0.85rem', fontFamily: 'monospace', color: 'var(--color-brand)', fontWeight: 700, display: 'block', marginTop: '0.2rem' }}>
                  {currentUser.verifiedDoc?.number || fullTargetData.licenceNumber}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-ink-muted)', marginTop: '0.4rem', display: 'block' }}>
                  {fullTargetData.rto}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setCurrentView('rewards_wallet')}
                >
                  <span>View Points Wallet</span>
                </button>

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setCurrentView('search')}
                  style={{ padding: '0.85rem 1.8rem' }}
                >
                  <span>Explore & Book Rides</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes drawCheck {
          from { stroke-dashoffset: 100; }
          to { stroke-dashoffset: 0; }
        }
        .spin {
          animation: spinAnimation 1.2s linear infinite;
        }
        @keyframes spinAnimation {
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
