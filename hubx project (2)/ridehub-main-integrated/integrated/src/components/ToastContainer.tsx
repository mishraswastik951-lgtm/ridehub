import React from 'react';
import { CheckCircle2, AlertCircle, Info, XCircle, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        right: '1.5rem',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.65rem',
        maxWidth: 380,
        width: 'calc(100vw - 3rem)',
        pointerEvents: 'none'
      }}
    >
      {toasts.map((toast) => {
        let icon = <CheckCircle2 size={18} color="var(--color-trust)" />;
        let borderColor = 'var(--color-trust)';
        let bgAccent = 'var(--color-trust-light)';

        if (toast.type === 'warning') {
          icon = <AlertCircle size={18} color="var(--color-surge)" />;
          borderColor = 'var(--color-surge)';
          bgAccent = 'var(--color-surge-light)';
        } else if (toast.type === 'error') {
          icon = <XCircle size={18} color="#D32F2F" />;
          borderColor = '#D32F2F';
          bgAccent = '#FFEBEE';
        } else if (toast.type === 'info') {
          icon = <Info size={18} color="var(--color-brand)" />;
          borderColor = 'var(--color-brand)';
          bgAccent = 'var(--color-brand-light)';
        }

        return (
          <div
            key={toast.id}
            style={{
              pointerEvents: 'auto',
              backgroundColor: '#FFFFFF',
              borderLeft: `4px solid ${borderColor}`,
              borderRadius: 'var(--radius-sm)',
              boxShadow: 'var(--shadow-dropdown)',
              padding: '0.85rem 1rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
              position: 'relative',
              overflow: 'hidden',
              animation: 'slideInToast 250ms var(--ease-editorial)'
            }}
          >
            <div style={{ marginTop: '0.1rem', flexShrink: 0 }}>{icon}</div>

            <div style={{ flex: 1 }}>
              <h5 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--color-ink)', marginBottom: '0.15rem' }}>
                {toast.title}
              </h5>
              <p style={{ fontSize: '0.78rem', color: 'var(--color-ink-muted)', lineHeight: 1.4 }}>
                {toast.message}
              </p>
            </div>

            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              style={{
                color: 'var(--color-ink-faint)',
                padding: '0.1rem',
                background: 'none',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <X size={15} />
            </button>

            {/* Auto dismiss progress indicator */}
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                height: 2,
                backgroundColor: borderColor,
                animation: 'shrinkProgress 4500ms linear forwards'
              }}
            />
          </div>
        );
      })}

      <style>{`
        @keyframes slideInToast {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes shrinkProgress {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};
