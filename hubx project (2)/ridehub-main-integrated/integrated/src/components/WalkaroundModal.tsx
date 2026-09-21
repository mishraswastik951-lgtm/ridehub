import React, { useState } from 'react';
import { X, CheckCircle2, ShieldCheck, Video, Play, Pause, RotateCw } from 'lucide-react';
import { Vehicle } from '../types';

interface WalkaroundModalProps {
  vehicle: Vehicle;
  onClose: () => void;
}

export const WalkaroundModal: React.FC<WalkaroundModalProps> = ({ vehicle, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [selectedAngle, setSelectedAngle] = useState<'360' | 'odometer' | 'tyres' | 'engine'>('360');

  const videoSrc = vehicle.videoWalkaround || 'https://assets.mixkit.co/videos/preview/mixkit-motorcycle-parked-on-a-city-street-42512-large.mp4';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(20, 23, 26, 0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 780,
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-lg)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--color-border)'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Video size={18} color="var(--color-brand)" />
              <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Digital Walkaround Inspection</h3>
              <span className="badge badge-trust" style={{ fontSize: '0.72rem' }}>
                Verified Handover State
              </span>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--color-ink-muted)', marginTop: '0.2rem' }}>
              {vehicle.name} ({vehicle.year}) • Recorded 3 days ago by shop technician
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '0.4rem',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--color-ink-muted)'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Video Canvas Container */}
        <div style={{ position: 'relative', backgroundColor: '#000000', aspectRatio: '16 / 9' }}>
          <video
            src={videoSrc}
            autoPlay
            loop
            muted
            playsInline
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />

          {/* Watermark badge */}
          <div
            style={{
              position: 'absolute',
              top: '1rem',
              left: '1rem',
              backgroundColor: 'rgba(20, 23, 26, 0.8)',
              color: '#FFFFFF',
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-pill)',
              fontSize: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              backdropFilter: 'blur(4px)'
            }}
          >
            <RotateCw size={13} className="spin-slow" />
            <span>360° Walkaround Cam • Timestamp Verified</span>
          </div>
        </div>

        {/* Angle Tabs */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            backgroundColor: 'var(--color-canvas-subtle)',
            borderBottom: '1px solid var(--color-border)'
          }}
        >
          {[
            { id: '360', label: 'Exterior 360° Profile' },
            { id: 'odometer', label: 'Odometer & Fuel Level' },
            { id: 'tyres', label: 'Tyre Tread & Brakes' },
            { id: 'engine', label: 'Engine & Exhaust Health' }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedAngle(tab.id as any)}
              style={{
                fontSize: '0.78rem',
                padding: '0.35rem 0.75rem',
                borderRadius: 'var(--radius-pill)',
                backgroundColor: selectedAngle === tab.id ? 'var(--color-brand)' : '#FFFFFF',
                color: selectedAngle === tab.id ? '#FFFFFF' : 'var(--color-ink-muted)',
                border: '1px solid var(--color-border)'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Inspection Checklist */}
        <div style={{ padding: '1.25rem 1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem' }}>
              <CheckCircle2 size={16} color="var(--color-trust)" />
              <span>Zero Pre-existing Body Dents</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem' }}>
              <CheckCircle2 size={16} color="var(--color-trust)" />
              <span>Full Tank Handover Certified</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem' }}>
              <CheckCircle2 size={16} color="var(--color-trust)" />
              <span>Brakes & ABS Tested (100%)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem' }}>
              <CheckCircle2 size={16} color="var(--color-trust)" />
              <span>2 Sanitized Helmets Attached</span>
            </div>
          </div>

          <div
            style={{
              marginTop: '1rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTop: '1px solid var(--color-border)',
              paddingTop: '0.9rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-ink-muted)', fontSize: '0.78rem' }}>
              <ShieldCheck size={16} color="var(--color-trust)" />
              <span>HubX Deposit Protection: No deductions without video proof match.</span>
            </div>
            <button
              type="button"
              className="btn btn-primary"
              onClick={onClose}
              style={{ padding: '0.5rem 1.2rem', fontSize: '0.85rem' }}
            >
              Done & Return
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
