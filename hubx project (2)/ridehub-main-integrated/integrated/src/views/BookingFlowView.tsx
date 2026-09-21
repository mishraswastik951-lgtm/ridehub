import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Calendar,
  Clock,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  QrCode,
  Smartphone,
  CreditCard,
  Sparkles,
  Printer,
  Download,
  FileCheck,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { generateUPILink, UPIGeneratedResult } from '../services/api';

export const BookingFlowView: React.FC = () => {
  const {
    selectedVehicleId,
    vehicles,
    shops,
    currentUser,
    setCurrentView,
    createBooking,
    redeemPoints
  } = useApp();

  const vehicle = vehicles.find((v) => v.id === selectedVehicleId) || vehicles[0];
  const shop = shops.find((s) => s.id === vehicle.shopId) || shops[0];

  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Schedule
  const [pickupDate, setPickupDate] = useState('2026-09-22');
  const [pickupTime, setPickupTime] = useState('10:00');
  const [rentalDays, setRentalDays] = useState(2);
  const [deliveryOption, setDeliveryOption] = useState<'self' | 'doorstep'>('self');

  // Step 2: Pricing & Points Redemption
  const [usePoints, setUsePoints] = useState(false);
  const pointsDiscount = usePoints ? Math.min(currentUser.rewardPoints, 300) : 0; // ₹1 per pt, cap ₹300

  const dynamicAdj = vehicle.dynamicAdjustment || 0;
  const dailyRate = vehicle.basePrice + dynamicAdj;
  const subtotal = dailyRate * rentalDays;
  const deliveryFee = deliveryOption === 'doorstep' ? 200 : 0;
  const taxable = subtotal + deliveryFee - pointsDiscount;
  const gst = Math.round(taxable * 0.18);
  const securityDeposit = vehicle.securityDeposit;
  const finalTotal = taxable + gst + securityDeposit;

  // Step 3: UPI Payment
  const [upiData, setUpiData] = useState<UPIGeneratedResult | null>(null);
  const [selectedUpiApp, setSelectedUpiApp] = useState<'qr' | 'gpay' | 'phonepe' | 'paytm'>('qr');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [createdBookingId, setCreatedBookingId] = useState<string>('');

  useEffect(() => {
    // Generate authentic UPI link & QR
    generateUPILink({
      amount: finalTotal,
      bookingId: `RH-BK-${Math.floor(1000 + Math.random() * 9000)}`
    }).then((data) => setUpiData(data));
  }, [finalTotal]);

  const handleExecutePayment = () => {
    setIsProcessingPayment(true);

    setTimeout(() => {
      setIsProcessingPayment(false);

      if (usePoints) {
        redeemPoints(pointsDiscount);
      }

      const bookingId = createBooking({
        userId: currentUser.id,
        vehicleId: vehicle.id,
        vehicleName: vehicle.name,
        shopId: shop.id,
        shopName: shop.name,
        startTime: new Date(`${pickupDate}T${pickupTime}`).toISOString(),
        endTime: new Date(new Date(`${pickupDate}T${pickupTime}`).getTime() + rentalDays * 86400000).toISOString(),
        totalHours: rentalDays * 24,
        basePrice: vehicle.basePrice,
        dynamicAdjustment: dynamicAdj,
        surgeReasons: vehicle.surgeReasons || [],
        securityDeposit: vehicle.securityDeposit,
        taxesAndGst: gst,
        finalAmount: finalTotal,
        upiRef: `UPI-TXN-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        pickupLocation: deliveryOption === 'doorstep' ? 'Doorstep Delivery' : shop.address
      });

      setCreatedBookingId(bookingId);
      setActiveStep(4);

      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.5 },
          colors: ['#1F4B3F', '#E8623A', '#2E7D5B']
        });
      } catch (e) {}
    }, 2000);
  };

  return (
    <div style={{ backgroundColor: 'var(--color-canvas)', minHeight: '88vh', padding: '2.5rem 0 6rem 0' }}>
      <div className="container" style={{ maxWidth: 840 }}>
        {/* Stepper Progress Indicator */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
            {[
              { num: 1, label: 'Schedule' },
              { num: 2, label: 'Price Breakdown' },
              { num: 3, label: 'UPI Payment' },
              { num: 4, label: 'Digital Agreement' }
            ].map((s) => (
              <div
                key={s.num}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.85rem',
                  fontWeight: activeStep === s.num ? 700 : 500,
                  color: activeStep >= s.num ? 'var(--color-brand)' : 'var(--color-ink-faint)'
                }}
              >
                <div
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 'var(--radius-pill)',
                    backgroundColor: activeStep >= s.num ? 'var(--color-brand)' : 'var(--color-border)',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 700
                  }}
                >
                  {activeStep > s.num ? '✓' : s.num}
                </div>
                <span>{s.label}</span>
              </div>
            ))}
          </div>

          {/* Animated Stepper Track */}
          <div style={{ height: 4, backgroundColor: 'var(--color-border)', borderRadius: 2, overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${((activeStep - 1) / 3) * 100}%`,
                backgroundColor: 'var(--color-brand)',
                transition: 'width var(--transition-smooth)'
              }}
            />
          </div>
        </div>

        {/* =========================================================================
            STEP 1: SCHEDULE & PICKUP
            ========================================================================= */}
        {activeStep === 1 && (
          <div className="card" style={{ padding: '2.5rem', backgroundColor: '#FFFFFF', boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1.25rem' }}>
              <img
                src={vehicle.image}
                alt={vehicle.name}
                style={{ width: 84, height: 60, objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
              />
              <div>
                <h3 style={{ fontSize: '1.3rem', margin: 0 }}>{vehicle.name}</h3>
                <span style={{ fontSize: '0.82rem', color: 'var(--color-ink-muted)' }}>
                  Shop: {shop.name} • {shop.address}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                    Pickup Date
                  </label>
                  <input
                    type="date"
                    value={pickupDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                    className="input-field"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                    Pickup Time
                  </label>
                  <input
                    type="time"
                    value={pickupTime}
                    onChange={(e) => setPickupTime(e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                  Rental Duration
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                  {[1, 2, 3, 7].map((days) => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => setRentalDays(days)}
                      style={{
                        padding: '0.75rem',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.85rem',
                        fontWeight: rentalDays === days ? 700 : 500,
                        backgroundColor: rentalDays === days ? 'var(--color-brand)' : 'var(--color-canvas)',
                        color: rentalDays === days ? '#FFFFFF' : 'var(--color-ink)',
                        border: '1px solid var(--color-border)'
                      }}
                    >
                      {days === 7 ? '7 Days (Weekly Discount)' : `${days} ${days === 1 ? 'Day' : 'Days'}`}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                  Handover Mode
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => setDeliveryOption('self')}
                    style={{
                      padding: '1rem',
                      borderRadius: 'var(--radius-sm)',
                      border: deliveryOption === 'self' ? '2px solid var(--color-brand)' : '1px solid var(--color-border)',
                      backgroundColor: deliveryOption === 'self' ? 'var(--color-brand-light)' : '#FFFFFF',
                      textAlign: 'left',
                      fontWeight: 600
                    }}
                  >
                    <div style={{ color: 'var(--color-brand)', marginBottom: '0.2rem' }}>Self-Pickup at Shop</div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--color-ink-muted)' }}>
                      Free • {shop.name}
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryOption('doorstep')}
                    style={{
                      padding: '1rem',
                      borderRadius: 'var(--radius-sm)',
                      border: deliveryOption === 'doorstep' ? '2px solid var(--color-brand)' : '1px solid var(--color-border)',
                      backgroundColor: deliveryOption === 'doorstep' ? 'var(--color-brand-light)' : '#FFFFFF',
                      textAlign: 'left',
                      fontWeight: 600
                    }}
                  >
                    <div style={{ color: 'var(--color-brand)', marginBottom: '0.2rem' }}>Doorstep Delivery (+₹200)</div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--color-ink-muted)' }}>
                      Staff brings vehicle to your address
                    </div>
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setActiveStep(2)}
                  style={{ padding: '0.85rem 2rem' }}
                >
                  <span>Review Price Breakdown</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            STEP 2: TRANSPARENT PRICE BREAKDOWN & POINTS REDEMPTION
            ========================================================================= */}
        {activeStep === 2 && (
          <div className="card" style={{ padding: '2.5rem', backgroundColor: '#FFFFFF', boxShadow: 'var(--shadow-lg)' }}>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '0.35rem' }}>Transparent Price Breakdown</h3>
            <p style={{ color: 'var(--color-ink-muted)', fontSize: '0.88rem', marginBottom: '2rem' }}>
              All dynamic adjustment factors are itemized transparently. No surprise surge at checkout.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.92rem' }}>
                <span style={{ color: 'var(--color-ink-muted)' }}>
                  Vehicle Base Rate (₹{vehicle.basePrice} × {rentalDays} days)
                </span>
                <span className="tabular-nums" style={{ fontWeight: 600 }}>₹{vehicle.basePrice * rentalDays}</span>
              </div>

              {dynamicAdj > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.92rem', color: 'var(--color-surge)' }}>
                  <div>
                    <span>Dynamic Demand Adjustment</span>
                    <div style={{ fontSize: '0.75rem', opacity: 0.85 }}>
                      Reason: {vehicle.surgeReasons?.join(', ') || 'Weekend city peak demand'}
                    </div>
                  </div>
                  <span className="tabular-nums" style={{ fontWeight: 700 }}>+₹{dynamicAdj * rentalDays}</span>
                </div>
              )}

              {deliveryFee > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.92rem', color: 'var(--color-ink-muted)' }}>
                  <span>Doorstep Handover Fee</span>
                  <span className="tabular-nums">₹{deliveryFee}</span>
                </div>
              )}

              {/* Loyalty points toggle */}
              <div
                style={{
                  backgroundColor: 'var(--color-brand-light)',
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Sparkles size={16} color="var(--color-brand)" />
                  <div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-brand)' }}>
                      Redeem Loyalty Points ({currentUser.rewardPoints} available)
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-ink-muted)', display: 'block' }}>
                      Apply up to ₹300 discount on this ride
                    </span>
                  </div>
                </div>

                <input
                  type="checkbox"
                  checked={usePoints}
                  onChange={(e) => setUsePoints(e.target.checked)}
                  style={{ accentColor: 'var(--color-brand)', width: 18, height: 18, cursor: 'pointer' }}
                />
              </div>

              {usePoints && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.92rem', color: 'var(--color-trust)' }}>
                  <span>Points Discount Applied</span>
                  <span className="tabular-nums" style={{ fontWeight: 700 }}>-₹{pointsDiscount}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.92rem', color: 'var(--color-ink-muted)' }}>
                <span>Government GST (18%)</span>
                <span className="tabular-nums">₹{gst}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.92rem', color: 'var(--color-trust)' }}>
                <div>
                  <span style={{ fontWeight: 600 }}>Refundable Security Deposit</span>
                  <span style={{ fontSize: '0.75rem', display: 'block', color: 'var(--color-ink-faint)' }}>
                    Returned to UPI upon drop-off inspection
                  </span>
                </div>
                <span className="tabular-nums" style={{ fontWeight: 700 }}>₹{securityDeposit}</span>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderTop: '2px solid var(--color-border)',
                  paddingTop: '1rem',
                  marginTop: '0.5rem',
                  fontSize: '1.2rem',
                  fontWeight: 800,
                  color: 'var(--color-ink)'
                }}
              >
                <span>Total Payable via UPI</span>
                <span className="tabular-nums" style={{ color: 'var(--color-brand)' }}>
                  ₹{finalTotal}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setActiveStep(1)}
              >
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>

              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setActiveStep(3)}
                style={{ padding: '0.85rem 2rem' }}
              >
                <span>Proceed to UPI Payment</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            STEP 3: MOCK UPI PAYMENT PORTAL (WITH REAL UPI DEEP LINKS & DYNAMIC QR)
            ========================================================================= */}
        {activeStep === 3 && (
          <div className="card" style={{ padding: '2.5rem', backgroundColor: '#FFFFFF', boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <span className="badge badge-brand" style={{ marginBottom: '0.5rem' }}>
                Instant UPI Intent Portal
              </span>
              <h3 style={{ fontSize: '1.6rem', marginBottom: '0.25rem' }}>Pay ₹{finalTotal} via UPI</h3>
              <p style={{ color: 'var(--color-ink-muted)', fontSize: '0.85rem' }}>
                Scan with any UPI app or click a direct app link below
              </p>
            </div>

            {/* UPI QR Code Container */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                backgroundColor: 'var(--color-canvas)',
                padding: '1.75rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.75rem',
                border: '1px solid var(--color-border)'
              }}
            >
              {upiData?.qrDataUrl ? (
                <img
                  src={upiData.qrDataUrl}
                  alt="Live UPI QR Code"
                  style={{
                    width: 220,
                    height: 220,
                    borderRadius: 'var(--radius-sm)',
                    boxShadow: 'var(--shadow-sm)',
                    marginBottom: '1rem'
                  }}
                />
              ) : (
                <div className="skeleton" style={{ width: 220, height: 220, marginBottom: '1rem' }} />
              )}

              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--color-ink-faint)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Merchant VPA
                </span>
                <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-brand)' }}>
                  ridehub@icici
                </div>
              </div>

              {/* Real UPI Intent Link for Mobile testing */}
              {upiData?.intentUrl && (
                <a
                  href={upiData.intentUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    marginTop: '0.85rem',
                    fontSize: '0.78rem',
                    color: 'var(--color-accent)',
                    textDecoration: 'underline',
                    fontWeight: 600
                  }}
                >
                  Open in Mobile UPI App (Deep Link)
                </a>
              )}
            </div>

            {/* Quick App Direct Tabs */}
            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.5rem', textAlign: 'center' }}>
                Simulate Direct App Intent
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setSelectedUpiApp('gpay')}
                  style={{
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    border: selectedUpiApp === 'gpay' ? '2px solid var(--color-brand)' : '1px solid var(--color-border)',
                    backgroundColor: selectedUpiApp === 'gpay' ? 'var(--color-brand-light)' : '#FFFFFF',
                    fontSize: '0.85rem',
                    fontWeight: 600
                  }}
                >
                  Google Pay
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedUpiApp('phonepe')}
                  style={{
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    border: selectedUpiApp === 'phonepe' ? '2px solid var(--color-brand)' : '1px solid var(--color-border)',
                    backgroundColor: selectedUpiApp === 'phonepe' ? 'var(--color-brand-light)' : '#FFFFFF',
                    fontSize: '0.85rem',
                    fontWeight: 600
                  }}
                >
                  PhonePe
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedUpiApp('paytm')}
                  style={{
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    border: selectedUpiApp === 'paytm' ? '2px solid var(--color-brand)' : '1px solid var(--color-border)',
                    backgroundColor: selectedUpiApp === 'paytm' ? 'var(--color-brand-light)' : '#FFFFFF',
                    fontSize: '0.85rem',
                    fontWeight: 600
                  }}
                >
                  Paytm UPI
                </button>
              </div>
            </div>

            {/* Simulated Payment Verification Action */}
            <button
              type="button"
              className="btn btn-primary"
              disabled={isProcessingPayment}
              onClick={handleExecutePayment}
              style={{ width: '100%', padding: '1rem', fontSize: '1.05rem' }}
            >
              {isProcessingPayment ? (
                <>
                  <Clock size={18} className="spin" />
                  <span>Awaiting Bank Confirmation...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={18} />
                  <span>Authorize & Simulate UPI Success (₹{finalTotal})</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* =========================================================================
            STEP 4: DIGITAL RENTAL AGREEMENT & RECEIPT
            ========================================================================= */}
        {activeStep === 4 && (
          <div className="card" style={{ padding: '2.5rem', backgroundColor: '#FFFFFF', boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <span className="badge badge-trust" style={{ marginBottom: '0.5rem' }}>
                  Booking Confirmed & Bound
                </span>
                <h3 style={{ fontSize: '1.6rem', margin: 0 }}>Digital Rental Agreement</h3>
                <span style={{ fontSize: '0.82rem', color: 'var(--color-ink-muted)' }}>
                  Booking ID: {createdBookingId || 'RH-BK-9281'} • Generated {new Date().toLocaleDateString()}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => window.print()}
                  style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem' }}
                >
                  <Printer size={15} />
                  <span>Print</span>
                </button>
              </div>
            </div>

            {/* Structured Card Agreement Summary */}
            <div
              style={{
                backgroundColor: 'var(--color-canvas)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: '1.75rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem',
                fontSize: '0.88rem',
                marginBottom: '2rem'
              }}
            >
              {/* Part 1: Parties */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1.25rem' }}>
                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--color-ink-faint)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Renter (Customer)
                  </span>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-ink)' }}>
                    {currentUser.fullName}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--color-ink-muted)' }}>
                    Phone: {currentUser.phone}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--color-trust)', fontWeight: 600 }}>
                    Licence: {currentUser.verifiedDoc?.number || 'KA-05-2021-0089421 (Verified)'}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--color-ink-faint)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Shopkeeper (Lessor)
                  </span>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-ink)' }}>
                    {shop.name}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--color-ink-muted)' }}>
                    {shop.address}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--color-brand)', fontWeight: 600 }}>
                    HubX Trust Score: {shop.trustScore} ★
                  </div>
                </div>
              </div>

              {/* Part 2: Vehicle & Handover */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1.25rem' }}>
                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--color-ink-faint)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Vehicle Handover
                  </span>
                  <div style={{ fontWeight: 700 }}>{vehicle.name} ({vehicle.year})</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--color-ink-muted)' }}>
                    Transmission: {vehicle.transmission} • {vehicle.fuelType}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--color-ink-muted)' }}>
                    Condition: Certified Walkaround Inspected
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--color-ink-faint)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Duration & Return Window
                  </span>
                  <div style={{ fontWeight: 700 }}>{rentalDays * 24} Hours ({rentalDays} Days)</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--color-ink-muted)' }}>
                    Start: {pickupDate} at {pickupTime}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--color-ink-muted)' }}>
                    Handover Location: {deliveryOption === 'doorstep' ? 'Doorstep Delivery' : shop.address}
                  </div>
                </div>
              </div>

              {/* Part 3: Deposit & Deduction Rules */}
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--color-ink-faint)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Standard HubX Deposit Policy
                </span>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-ink-muted)', marginTop: '0.35rem', lineHeight: 1.5 }}>
                  The security deposit of ₹{securityDeposit} is held in escrow. Under HubX rules, deductions are strictly restricted to verifiable damage exceeding normal wear and tear, validated against before/after video records. Refund is initiated within 2 hours of handover.
                </p>
              </div>
            </div>

            {/* Next Steps Buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setCurrentView('rental_agreement')}
              >
                <FileCheck size={16} />
                <span>View Fullscreen Agreement</span>
              </button>

              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setCurrentView('active_rental')}
                style={{ padding: '0.85rem 1.8rem' }}
              >
                <span>Go to Active Rental Dashboard</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
