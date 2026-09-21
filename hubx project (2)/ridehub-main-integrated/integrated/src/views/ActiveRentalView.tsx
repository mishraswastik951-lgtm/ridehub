import React, { useState, useEffect } from 'react';
import {
  Clock,
  MapPin,
  Calendar,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  PhoneCall,
  RotateCw,
  Sparkles,
  ChevronRight,
  FileCheck2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Vehicle } from '../types';

export const ActiveRentalView: React.FC = () => {
  const {
    activeBooking,
    vehicles,
    shops,
    extendBooking,
    setCurrentView,
    setSelectedVehicleId,
    addToast
  } = useApp();

  const [extensionHours, setExtensionHours] = useState(6);
  const [isExtendModalOpen, setIsExtendModalOpen] = useState(false);
  const [conflictReplacementVehicle, setConflictReplacementVehicle] = useState<Vehicle | null>(null);
  const [conflictMessage, setConflictMessage] = useState('');

  const booking = activeBooking;
  const vehicle = booking ? vehicles.find((v) => v.id === booking.vehicleId) : vehicles[0];
  const shop = booking ? shops.find((s) => s.id === booking.shopId) : shops[0];

  if (!booking) {
    return (
      <div style={{ backgroundColor: 'var(--color-canvas)', minHeight: '80vh', padding: '5rem 0' }}>
        <div className="container" style={{ maxWidth: 500, textAlign: 'center' }}>
          <Clock size={48} color="var(--color-ink-faint)" style={{ margin: '0 auto 1.5rem auto' }} />
          <h2 style={{ marginBottom: '0.5rem' }}>No Active Rentals Found</h2>
          <p style={{ color: 'var(--color-ink-muted)', marginBottom: '2rem' }}>
            You don't have an ongoing ride right now. Browse our fleet of scooters, bikes, and cars nearby.
          </p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setCurrentView('search')}
          >
            Explore Nearby Fleet
          </button>
        </div>
      </div>
    );
  }

  // Calculate remaining time
  const endTimeMs = new Date(booking.endTime).getTime();
  const nowMs = Date.now();
  const diffHours = Math.max(0, Math.round((endTimeMs - nowMs) / (1000 * 3600)));
  const progressPct = Math.min(100, Math.max(15, Math.round(((booking.totalHours - diffHours) / booking.totalHours) * 100)));

  const handleRequestExtension = () => {
    // Attempt extension
    const result = extendBooking(booking.id, extensionHours);

    if (result.conflict) {
      // Find suitable alternative vehicle from nearby HubX shop
      const alternative = vehicles.find((v) => v.id !== vehicle?.id && v.category === vehicle?.category && v.isAvailable) || vehicles[1];
      setConflictReplacementVehicle(alternative);
      setConflictMessage(result.message);
    } else {
      setIsExtendModalOpen(false);
      setConflictReplacementVehicle(null);
    }
  };

  const handleSwitchToReplacement = (repVeh: Vehicle) => {
    setSelectedVehicleId(repVeh.id);
    setIsExtendModalOpen(false);
    setCurrentView('booking_flow');
    addToast({
      type: 'info',
      title: 'Seamless Vehicle Transition',
      message: `Switching reservation to ${repVeh.name} at nearby partner shop.`
    });
  };

  return (
    <div style={{ backgroundColor: 'var(--color-canvas)', minHeight: '85vh', padding: '3rem 0 6rem 0' }}>
      <div className="container" style={{ maxWidth: 840 }}>
        {/* Top Active Status Card */}
        <div
          className="card"
          style={{
            padding: '2rem',
            backgroundColor: '#FFFFFF',
            boxShadow: 'var(--shadow-md)',
            marginBottom: '2rem'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                <span className="badge badge-trust" style={{ fontSize: '0.8rem' }}>
                  ● Active Ride in Progress
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-ink-muted)' }}>
                  Booking ID: {booking.id}
                </span>
              </div>
              <h2 style={{ fontSize: '1.8rem', margin: 0 }}>{vehicle?.name}</h2>
              <span style={{ fontSize: '0.85rem', color: 'var(--color-ink-muted)' }}>
                Rented from: {shop?.name} • {booking.pickupLocation}
              </span>
            </div>

            {/* Time Remaining Pill */}
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-ink-faint)', textTransform: 'uppercase' }}>
                Remaining Rental Window
              </span>
              <div className="tabular-nums" style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 800, color: 'var(--color-brand)' }}>
                {diffHours} Hours
              </div>
              <span style={{ fontSize: '0.78rem', color: 'var(--color-ink-muted)' }}>
                Return by: {new Date(booking.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>

          {/* Ride Progress Bar */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--color-ink-muted)', marginBottom: '0.35rem' }}>
              <span>Ride Started ({new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})</span>
              <span>{progressPct}% Duration Elapsed</span>
              <span>Drop-off Scheduled</span>
            </div>
            <div style={{ height: 8, backgroundColor: 'var(--color-canvas-subtle)', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ width: `${progressPct}%`, height: '100%', backgroundColor: 'var(--color-brand)', borderRadius: 4, transition: 'width 0.4s ease' }} />
            </div>
          </div>

          {/* Quick Actions Bar */}
          <div
            style={{
              display: 'flex',
              gap: '0.75rem',
              flexWrap: 'wrap',
              borderTop: '1px solid var(--color-border)',
              paddingTop: '1.25rem'
            }}
          >
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                setConflictReplacementVehicle(null);
                setConflictMessage('');
                setIsExtendModalOpen(true);
              }}
              style={{ padding: '0.65rem 1.25rem', fontSize: '0.9rem' }}
            >
              <RotateCw size={16} />
              <span>Extend Rental Duration</span>
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setCurrentView('rental_agreement')}
              style={{ padding: '0.65rem 1.25rem', fontSize: '0.9rem' }}
            >
              <FileCheck2 size={16} />
              <span>View Digital Agreement</span>
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setCurrentView('cancellation')}
              style={{ padding: '0.65rem 1.25rem', fontSize: '0.9rem', color: 'var(--color-surge)' }}
            >
              <span>Cancellation & Refunds</span>
            </button>
          </div>
        </div>

        {/* Emergency & Support Card */}
        <div
          className="card"
          style={{
            padding: '1.75rem',
            backgroundColor: '#FFFFFF',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
            alignItems: 'center'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-brand)', marginBottom: '0.35rem' }}>
              <PhoneCall size={18} />
              <strong style={{ fontSize: '1rem' }}>24/7 HubX Roadside Support</strong>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--color-ink-muted)', lineHeight: 1.5 }}>
              Flat tyre, battery drain, or accident? We dispatch a replacement vehicle or technician in under 25 minutes anywhere in Bengaluru.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <a
              href="tel:1800123456"
              className="btn btn-secondary"
              style={{ fontSize: '0.85rem' }}
            >
              Call Roadside Hotline
            </a>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setCurrentView('contact_support')}
              style={{ fontSize: '0.85rem' }}
            >
              Open Support Ticket
            </button>
          </div>
        </div>
      </div>

      {/* Extension Modal Dialog */}
      {isExtendModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(20, 23, 26, 0.7)',
            backdropFilter: 'blur(5px)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
          onClick={() => setIsExtendModalOpen(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 520,
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              padding: '2rem',
              boxShadow: 'var(--shadow-lg)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '1.4rem', marginBottom: '0.35rem' }}>Extend Rental Duration</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-ink-muted)', marginBottom: '1.5rem' }}>
              Keep {vehicle?.name} longer with instant mock payment confirmation.
            </p>

            {/* Conflict State (Vehicle Booked by Next Customer) */}
            {conflictReplacementVehicle ? (
              <div>
                <div
                  style={{
                    backgroundColor: '#FEF3E8',
                    border: '1px solid #F5C6A0',
                    borderRadius: 'var(--radius-sm)',
                    padding: '1rem',
                    color: '#9C4212',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.65rem',
                    marginBottom: '1.5rem'
                  }}
                >
                  <AlertTriangle size={20} style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <strong style={{ fontSize: '0.9rem', display: 'block' }}>
                      Vehicle Reserved by Next Customer
                    </strong>
                    <span style={{ fontSize: '0.82rem', lineHeight: 1.4, display: 'block', marginTop: '0.2rem' }}>
                      {conflictMessage} As part of our HubX Reliability Guarantee, we found an immediate replacement nearby.
                    </span>
                  </div>
                </div>

                {/* Replacement Vehicle Card with 1-Click Rebook */}
                <div
                  style={{
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1rem',
                    backgroundColor: 'var(--color-canvas)',
                    display: 'flex',
                    gap: '1rem',
                    alignItems: 'center',
                    marginBottom: '1.75rem'
                  }}
                >
                  <img
                    src={conflictReplacementVehicle.image}
                    alt={conflictReplacementVehicle.name}
                    style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div className="badge badge-brand" style={{ fontSize: '0.7rem', marginBottom: '0.2rem' }}>
                      Recommended Alternative
                    </div>
                    <strong style={{ fontSize: '0.95rem', display: 'block' }}>
                      {conflictReplacementVehicle.name}
                    </strong>
                    <span style={{ fontSize: '0.78rem', color: 'var(--color-ink-muted)' }}>
                      Available at {conflictReplacementVehicle.locationName}
                    </span>
                    <div style={{ fontWeight: 700, color: 'var(--color-brand)', marginTop: '0.25rem', fontSize: '0.88rem' }}>
                      ₹{conflictReplacementVehicle.basePrice}/day
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setIsExtendModalOpen(false)}
                    style={{ flex: 1 }}
                  >
                    Cancel Extension
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => handleSwitchToReplacement(conflictReplacementVehicle)}
                    style={{ flex: 2 }}
                  >
                    <span>1-Click Switch to Replacement</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <div>
                {/* Normal Extension Flow */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                    Select Additional Hours
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                    {[3, 6, 12, 24].map((hrs) => (
                      <button
                        key={hrs}
                        type="button"
                        onClick={() => setExtensionHours(hrs)}
                        style={{
                          padding: '0.75rem 0.5rem',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.85rem',
                          fontWeight: extensionHours === hrs ? 700 : 500,
                          backgroundColor: extensionHours === hrs ? 'var(--color-brand)' : 'var(--color-canvas)',
                          color: extensionHours === hrs ? '#FFFFFF' : 'var(--color-ink)',
                          border: '1px solid var(--color-border)'
                        }}
                      >
                        +{hrs} hrs
                      </button>
                    ))}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-ink-muted)', marginTop: '0.4rem', display: 'block' }}>
                    Pro-rated rate: ₹{Math.round(((vehicle?.basePrice || 450) / 24) * extensionHours)} additional charge.
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setIsExtendModalOpen(false)}
                    style={{ flex: 1 }}
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleRequestExtension}
                    style={{ flex: 2 }}
                  >
                    Confirm & Extend Duration
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
