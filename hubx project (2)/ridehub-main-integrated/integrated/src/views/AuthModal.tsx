import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  ShieldCheck,
  Phone,
  Mail,
  ArrowRight,
  UserCheck,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Smartphone
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { sendOtp, verifyOtp, googleSignIn } from '../services/api';

type AuthStep = 'details' | 'otp' | 'google_loading';
type OtpChannel = 'phone' | 'email';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, currentUser, updateUserProfile, switchRole, addToast } = useApp();

  const [role, setRole] = useState<'customer' | 'shopkeeper'>('customer');
  const [fullName, setFullName] = useState(currentUser.fullName || '');
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [email, setEmail] = useState(currentUser.email || '');

  // Auth step & OTP state
  const [step, setStep] = useState<AuthStep>('details');
  const [otpChannel, setOtpChannel] = useState<OtpChannel>('phone');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(30);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [serverOtp, setServerOtp] = useState(''); // Demo: store the server-returned OTP
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Enforce 1-phone-number-1-identity mock registry
  const EXISTING_PHONES = ['+91 99999 88888', '+91 91111 22222'];

  // OTP countdown timer
  useEffect(() => {
    let interval: any;
    if (step === 'otp' && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  if (!isAuthModalOpen) return null;

  // ─── Send OTP via backend ──────────────────────────────────────────────
  const handleSendOtp = async (channel: OtpChannel) => {
    setErrorMsg('');

    if (channel === 'phone' && (!phone || phone.replace(/\D/g, '').length < 10)) {
      setErrorMsg('Please enter a valid 10-digit mobile phone number.');
      return;
    }

    if (channel === 'email' && (!email || !email.includes('@'))) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (!fullName || fullName.trim().length < 2) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    // Check duplicate phone number restriction
    if (channel === 'phone' && EXISTING_PHONES.includes(phone.trim())) {
      setErrorMsg('This phone number is already linked to another verified identity. Under RideHub Trust Rules, 1 Phone = 1 Identity.');
      return;
    }

    setIsLoading(true);
    setOtpChannel(channel);

    try {
      const result = await sendOtp({
        channel,
        phone: channel === 'phone' ? phone : undefined,
        email: channel === 'email' ? email : undefined
      });

      if (result.success) {
        setStep('otp');
        setTimer(30);
        setOtpDigits(['', '', '', '', '', '']);

        // Store the demo OTP for auto-fill convenience
        if (result.otp) {
          setServerOtp(result.otp);
          // Auto-fill OTP after a brief delay for demo
          setTimeout(() => {
            setOtpDigits(result.otp!.split(''));
          }, 800);
        }

        addToast({
          type: 'info',
          title: `OTP Sent via ${channel === 'phone' ? 'SMS' : 'Email'}`,
          message: result.message
        });
      } else {
        setErrorMsg(result.message);
      }
    } catch (err) {
      setErrorMsg('Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Verify OTP ────────────────────────────────────────────────────────
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const enteredOtp = otpDigits.join('');
    setErrorMsg('');

    if (enteredOtp.length < 6) {
      setErrorMsg('Please enter the complete 6-digit OTP.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await verifyOtp({
        channel: otpChannel,
        phone: otpChannel === 'phone' ? phone : undefined,
        email: otpChannel === 'email' ? email : undefined,
        otp: enteredOtp
      });

      if (result.verified) {
        // Mark the appropriate channel as verified
        if (otpChannel === 'phone') setIsPhoneVerified(true);
        if (otpChannel === 'email') setIsEmailVerified(true);

        // Complete the sign-in
        completeAuth(otpChannel === 'phone' ? 'phone_otp' : 'email_otp');
      } else {
        setErrorMsg(result.message || 'Invalid OTP. Please try again.');
      }
    } catch (err) {
      setErrorMsg('Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Google Sign-In via Firebase ───────────────────────────────────────
  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    setStep('google_loading');
    setIsLoading(true);

    try {
      const result = await googleSignIn();

      if (result.success && result.user) {
        // Auto-fill from Google profile
        const gUser = result.user;
        setFullName(gUser.displayName || '');
        setEmail(gUser.email || '');
        setIsEmailVerified(true);

        // Complete auth with Google profile data
        updateUserProfile({
          fullName: gUser.displayName || fullName || (role === 'customer' ? 'Aditya Sharma' : 'Metro Mobility Hub'),
          email: gUser.email || email,
          phone: phone || '',
          role,
          authMethod: 'google',
          googleAvatar: gUser.photoURL || undefined,
          isEmailVerified: true
        });

        switchRole(role);
        setIsAuthModalOpen(false);
        setStep('details');

        addToast({
          type: 'success',
          title: 'Signed in with Google',
          message: `Welcome, ${gUser.displayName || 'User'}! Signed in as ${role === 'customer' ? 'Customer' : 'HubX Shopkeeper'}.`
        });
      } else {
        setErrorMsg(result.error || 'Google Sign-In failed. Please try again.');
        setStep('details');
      }
    } catch (err) {
      setErrorMsg('Google Sign-In failed. Please try again.');
      setStep('details');
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Complete authentication ───────────────────────────────────────────
  const completeAuth = (authMethod: 'phone_otp' | 'email_otp' | 'google') => {
    updateUserProfile({
      fullName: fullName || (role === 'customer' ? 'Aditya Sharma' : 'Metro Mobility Hub'),
      email,
      phone,
      role,
      authMethod,
      isPhoneVerified: authMethod === 'phone_otp' ? true : isPhoneVerified,
      isEmailVerified: authMethod === 'email_otp' ? true : isEmailVerified
    });

    switchRole(role);
    setIsAuthModalOpen(false);
    setStep('details');

    addToast({
      type: 'success',
      title: 'Identity Verified & Signed In',
      message: `Welcome to RideHub as ${role === 'customer' ? 'Customer' : 'HubX Shopkeeper'}. Verified via ${authMethod === 'phone_otp' ? 'Phone OTP' : authMethod === 'email_otp' ? 'Email OTP' : 'Google'}.`
    });
  };

  // ─── OTP digit input handler ───────────────────────────────────────────
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    if (value && !/^\d$/.test(value)) return;

    const next = [...otpDigits];
    next[index] = value;
    setOtpDigits(next);

    // Auto advance focus
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtpDigits(pasted.split(''));
      otpInputRefs.current[5]?.focus();
    }
  };

  // ─── Resend OTP ────────────────────────────────────────────────────────
  const handleResendOtp = async () => {
    setTimer(30);
    setOtpDigits(['', '', '', '', '', '']);
    await handleSendOtp(otpChannel);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(20, 23, 26, 0.7)',
        backdropFilter: 'blur(8px)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        animation: 'fadeIn 0.25s ease-out'
      }}
      onClick={() => { setIsAuthModalOpen(false); setStep('details'); }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 500,
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.05)',
          border: '1px solid var(--color-border)',
          animation: 'slideUp 0.3s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ─── Header ──────────────────────────────────────────────── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.5rem 1.5rem 1.25rem 1.5rem',
            borderBottom: '1px solid var(--color-border)',
            background: 'linear-gradient(135deg, #f8faf9 0%, #faf8f4 100%)'
          }}
        >
          <div>
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.35rem',
                fontWeight: 700,
                color: 'var(--color-ink)',
                display: 'block'
              }}
            >
              {step === 'details' ? 'Access RideHub' : step === 'otp' ? 'Verify Your Identity' : 'Signing in with Google...'}
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-ink-muted)' }}>
              {step === 'details'
                ? 'Choose your preferred sign-in method'
                : step === 'otp'
                ? `Enter the 6-digit code sent via ${otpChannel === 'phone' ? 'SMS' : 'email'}`
                : 'Please complete the Google popup'}
            </span>
          </div>

          <button
            type="button"
            onClick={() => { setIsAuthModalOpen(false); setStep('details'); }}
            style={{
              color: 'var(--color-ink-faint)',
              background: 'none',
              width: 36,
              height: 36,
              borderRadius: 'var(--radius-pill)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f0f0f0'; e.currentTarget.style.color = 'var(--color-ink)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--color-ink-faint)'; }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '1.5rem' }}>
          {/* ─── Error Message ────────────────────────────────────── */}
          {errorMsg && (
            <div
              style={{
                backgroundColor: '#FEF2F2',
                color: '#DC2626',
                padding: '0.7rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.82rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.5rem',
                marginBottom: '1rem',
                border: '1px solid #FECACA',
                animation: 'fadeIn 0.2s ease-out'
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════
              STEP 1: DETAILS FORM
          ═══════════════════════════════════════════════════════════ */}
          {step === 'details' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>

              {/* Role Selection Tabs */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.35rem',
                  backgroundColor: '#F3F4F6',
                  padding: '0.3rem',
                  borderRadius: 'var(--radius-md)'
                }}
              >
                <button
                  type="button"
                  onClick={() => setRole('customer')}
                  style={{
                    padding: '0.6rem',
                    fontSize: '0.85rem',
                    fontWeight: role === 'customer' ? 700 : 500,
                    backgroundColor: role === 'customer' ? '#FFFFFF' : 'transparent',
                    color: role === 'customer' ? 'var(--color-brand)' : 'var(--color-ink-muted)',
                    borderRadius: '8px',
                    boxShadow: role === 'customer' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    border: 'none',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer'
                  }}
                >
                  🏍️ Customer Rider
                </button>

                <button
                  type="button"
                  onClick={() => setRole('shopkeeper')}
                  style={{
                    padding: '0.6rem',
                    fontSize: '0.85rem',
                    fontWeight: role === 'shopkeeper' ? 700 : 500,
                    backgroundColor: role === 'shopkeeper' ? '#FFFFFF' : 'transparent',
                    color: role === 'shopkeeper' ? 'var(--color-accent)' : 'var(--color-ink-muted)',
                    borderRadius: '8px',
                    boxShadow: role === 'shopkeeper' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    border: 'none',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer'
                  }}
                >
                  🏪 Shopkeeper (HubX)
                </button>
              </div>

              {/* ─── Google Sign-In Button (Primary CTA) ──────────── */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.7rem',
                  width: '100%',
                  padding: '0.85rem 1rem',
                  backgroundColor: '#FFFFFF',
                  border: '1.5px solid #E5E7EB',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  color: '#374151',
                  cursor: isLoading ? 'wait' : 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                    e.currentTarget.style.borderColor = '#D1D5DB';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';
                  e.currentTarget.style.borderColor = '#E5E7EB';
                }}
              >
                {/* Google "G" Logo */}
                <svg width="20" height="20" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
                <span>Continue with Google</span>
              </button>

              {/* ─── Divider ──────────────────────────────────────── */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ flex: 1, height: 1, backgroundColor: '#E5E7EB' }} />
                <span style={{ fontSize: '0.75rem', color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  or verify with OTP
                </span>
                <div style={{ flex: 1, height: 1, backgroundColor: '#E5E7EB' }} />
              </div>

              {/* ─── Name Field ───────────────────────────────────── */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--color-ink)' }}>
                  {role === 'customer' ? 'Full Legal Name' : 'Shop / Business Name'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={role === 'customer' ? 'e.g. Aditya Sharma' : 'e.g. Metro Mobility Rentals'}
                  className="input-field"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>

              {/* ─── Phone + Email Fields ─────────────────────────── */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--color-ink)' }}>
                    Mobile Number
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      className="input-field"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      style={{ width: '100%', paddingRight: '2.5rem' }}
                    />
                    {isPhoneVerified ? (
                      <CheckCircle2 size={16} style={{ position: 'absolute', right: 12, top: 12, color: '#16A34A' }} />
                    ) : (
                      <Phone size={16} style={{ position: 'absolute', right: 12, top: 12, color: 'var(--color-ink-faint)' }} />
                    )}
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--color-ink)' }}>
                    Email Address
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="email"
                      placeholder="aditya@example.com"
                      className="input-field"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{ width: '100%', paddingRight: '2.5rem' }}
                    />
                    {isEmailVerified ? (
                      <CheckCircle2 size={16} style={{ position: 'absolute', right: 12, top: 12, color: '#16A34A' }} />
                    ) : (
                      <Mail size={16} style={{ position: 'absolute', right: 12, top: 12, color: 'var(--color-ink-faint)' }} />
                    )}
                  </div>
                </div>
              </div>

              {/* Trust Notice */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={15} color="var(--color-trust)" />
                <span style={{ fontSize: '0.72rem', color: 'var(--color-ink-muted)' }}>
                  1 Phone = 1 Identity. Bank-grade 256-bit encryption for all KYC data.
                </span>
              </div>

              {/* ─── OTP Action Buttons ───────────────────────────── */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                <button
                  type="button"
                  onClick={() => handleSendOtp('phone')}
                  disabled={isLoading}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    padding: '0.8rem',
                    backgroundColor: 'var(--color-brand)',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: isLoading ? 'wait' : 'pointer',
                    transition: 'all 0.2s ease',
                    opacity: isLoading ? 0.7 : 1
                  }}
                  onMouseEnter={(e) => { if (!isLoading) e.currentTarget.style.opacity = '0.9'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.opacity = isLoading ? '0.7' : '1'; }}
                >
                  {isLoading ? <Loader2 size={16} className="spin" /> : <Smartphone size={16} />}
                  <span>Phone OTP</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSendOtp('email')}
                  disabled={isLoading}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    padding: '0.8rem',
                    backgroundColor: 'var(--color-accent)',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: isLoading ? 'wait' : 'pointer',
                    transition: 'all 0.2s ease',
                    opacity: isLoading ? 0.7 : 1
                  }}
                  onMouseEnter={(e) => { if (!isLoading) e.currentTarget.style.opacity = '0.9'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.opacity = isLoading ? '0.7' : '1'; }}
                >
                  {isLoading ? <Loader2 size={16} className="spin" /> : <Mail size={16} />}
                  <span>Email OTP</span>
                </button>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════
              STEP 2: OTP VERIFICATION
          ═══════════════════════════════════════════════════════════ */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

              {/* OTP Channel Badge */}
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.4rem 1rem',
                    backgroundColor: otpChannel === 'phone' ? '#EFF6FF' : '#FFF7ED',
                    color: otpChannel === 'phone' ? '#2563EB' : '#EA580C',
                    borderRadius: 'var(--radius-pill)',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    marginBottom: '0.5rem'
                  }}
                >
                  {otpChannel === 'phone' ? <Smartphone size={14} /> : <Mail size={14} />}
                  <span>{otpChannel === 'phone' ? 'Phone Verification' : 'Email Verification'}</span>
                </div>

                <p style={{ fontSize: '0.85rem', color: 'var(--color-ink-muted)', marginBottom: '0.15rem' }}>
                  Enter the 6-digit code sent to
                </p>
                <strong style={{ color: 'var(--color-ink)', fontSize: '0.95rem' }}>
                  {otpChannel === 'phone' ? phone : email}
                </strong>
              </div>

              {/* 6-Digit OTP Boxes */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                {otpDigits.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { otpInputRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    onPaste={index === 0 ? handleOtpPaste : undefined}
                    style={{
                      width: 48,
                      height: 56,
                      textAlign: 'center',
                      fontSize: '1.5rem',
                      fontWeight: 700,
                      borderRadius: '10px',
                      border: digit ? '2px solid var(--color-brand)' : '1.5px solid #D1D5DB',
                      backgroundColor: digit ? '#F0FDF4' : '#FAFAFA',
                      color: 'var(--color-ink)',
                      transition: 'all 0.2s ease',
                      outline: 'none',
                      caretColor: 'var(--color-brand)'
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--color-brand)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(31,75,63,0.15)'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = digit ? 'var(--color-brand)' : '#D1D5DB'; e.currentTarget.style.boxShadow = 'none'; }}
                  />
                ))}
              </div>

              {/* Demo OTP hint */}
              {serverOtp && (
                <div style={{
                  textAlign: 'center',
                  fontSize: '0.72rem',
                  color: '#9CA3AF',
                  backgroundColor: '#F9FAFB',
                  padding: '0.4rem 0.75rem',
                  borderRadius: '6px',
                  border: '1px dashed #E5E7EB'
                }}>
                  🧪 Demo Mode — OTP auto-filled: <strong style={{ color: '#6B7280', fontFamily: 'monospace' }}>{serverOtp}</strong>
                </div>
              )}

              {/* Timer & Resend */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem' }}>
                <span style={{ color: 'var(--color-ink-muted)' }}>
                  {timer > 0 ? (
                    <>⏱️ Resend in <strong>{timer}s</strong></>
                  ) : (
                    <span style={{ color: '#DC2626' }}>Code expired</span>
                  )}
                </span>
                <button
                  type="button"
                  disabled={timer > 0}
                  onClick={handleResendOtp}
                  style={{
                    color: timer === 0 ? 'var(--color-accent)' : 'var(--color-ink-faint)',
                    background: 'none',
                    fontWeight: 600,
                    cursor: timer === 0 ? 'pointer' : 'default',
                    border: 'none',
                    fontSize: '0.82rem',
                    transition: 'color 0.2s ease'
                  }}
                >
                  Resend OTP
                </button>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => { setStep('details'); setErrorMsg(''); }}
                  style={{ flex: 1, padding: '0.8rem' }}
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isLoading}
                  style={{ flex: 2, padding: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                >
                  {isLoading ? (
                    <Loader2 size={16} className="spin" />
                  ) : (
                    <UserCheck size={16} />
                  )}
                  <span>Verify & Sign In</span>
                </button>
              </div>

              {/* Switch to other OTP channel */}
              <button
                type="button"
                onClick={() => handleSendOtp(otpChannel === 'phone' ? 'email' : 'phone')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-ink-muted)',
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  textAlign: 'center',
                  padding: '0.25rem',
                  textDecoration: 'underline',
                  textUnderlineOffset: '2px'
                }}
              >
                {otpChannel === 'phone' ? 'Verify via Email OTP instead' : 'Verify via Phone OTP instead'}
              </button>
            </form>
          )}

          {/* ═══════════════════════════════════════════════════════════
              STEP 3: GOOGLE LOADING STATE
          ═══════════════════════════════════════════════════════════ */}
          {step === 'google_loading' && (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 'var(--radius-pill)',
                  backgroundColor: '#F3F4F6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.5rem auto'
                }}
              >
                <Loader2 size={32} className="spin" style={{ color: '#4285F4' }} />
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem', color: 'var(--color-ink)' }}>
                Connecting to Google...
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-ink-muted)', maxWidth: 320, margin: '0 auto' }}>
                A Google Sign-In popup should have opened. Please complete the sign-in process there.
              </p>

              <button
                type="button"
                onClick={() => { setStep('details'); setIsLoading(false); }}
                style={{
                  marginTop: '1.5rem',
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-ink-muted)',
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                Cancel and go back
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ─── Animations ──────────────────────────────────────────── */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
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
