import React from 'react';
import { Compass, ShieldCheck, Heart, ArrowUpRight, CloudSun } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Footer: React.FC = () => {
  const { setCurrentView, switchRole, weather } = useApp();

  return (
    <footer
      style={{
        backgroundColor: '#14171A', // Brand Ink background
        color: '#FAF8F4',
        borderTop: '1px solid #2B3137',
        marginTop: 'auto'
      }}
    >
      <div className="container" style={{ paddingTop: '5rem', paddingBottom: '3.5rem' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '3rem',
            marginBottom: '4rem'
          }}
        >
          {/* Column 1: Brand & Mission */}
          <div style={{ maxWidth: 320 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem' }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  backgroundColor: 'var(--color-brand)',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF'
                }}
              >
                <Compass size={20} strokeWidth={2.3} />
              </div>
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.5rem',
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                  color: '#FAF8F4'
                }}
              >
                RideHub
              </span>
            </div>

            <p style={{ color: '#A5ACB3', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              Rent a scooter down the street in under two minutes. No paperwork, no phone calls, no cash deposit disputes.
            </p>

            {weather && (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  backgroundColor: '#20262C',
                  padding: '0.4rem 0.8rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.78rem',
                  color: '#D4DBD7'
                }}
              >
                <CloudSun size={15} color="var(--color-accent)" />
                <span>
                  {weather.city}: {Math.round(weather.temperatureC)}°C, {weather.condition}
                </span>
              </div>
            )}
          </div>

          {/* Column 2: Browse Fleet */}
          <div>
            <h4
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.1rem',
                color: '#FAF8F4',
                marginBottom: '1.25rem'
              }}
            >
              Explore Vehicles
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem', color: '#A5ACB3' }}>
              <li>
                <button
                  type="button"
                  onClick={() => setCurrentView('search')}
                  style={{ color: 'inherit', padding: 0, background: 'none' }}
                >
                  Electric & Petrol Scooties
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setCurrentView('search')}
                  style={{ color: 'inherit', padding: 0, background: 'none' }}
                >
                  Touring & Sports Motorcycles
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setCurrentView('search')}
                  style={{ color: 'inherit', padding: 0, background: 'none' }}
                >
                  SUVs & Compact City Cars
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setCurrentView('rewards_wallet')}
                  style={{ color: 'inherit', padding: 0, background: 'none' }}
                >
                  Hotel Sponsor Vouchers
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Shopkeepers & HubX */}
          <div>
            <h4
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.1rem',
                color: '#FAF8F4',
                marginBottom: '1.25rem'
              }}
            >
              For Rental Shops
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem', color: '#A5ACB3' }}>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    switchRole('shopkeeper');
                    setCurrentView('shop_subscription');
                  }}
                  style={{ color: 'var(--color-accent)', padding: 0, background: 'none', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}
                >
                  Join HubX (1-Month Free) <ArrowUpRight size={14} />
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    switchRole('shopkeeper');
                    setCurrentView('shop_ai_dashboard');
                  }}
                  style={{ color: 'inherit', padding: 0, background: 'none' }}
                >
                  AI Demand Forecast Tool
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    switchRole('shopkeeper');
                    setCurrentView('dynamic_pricing_calendar');
                  }}
                  style={{ color: 'inherit', padding: 0, background: 'none' }}
                >
                  Dynamic Pricing Calendar
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setCurrentView('shop_trust_profile')}
                  style={{ color: 'inherit', padding: 0, background: 'none' }}
                >
                  Community Trust Reputation
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Compliance & Legal */}
          <div>
            <h4
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.1rem',
                color: '#FAF8F4',
                marginBottom: '1.25rem'
              }}
            >
              Trust & Legal
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem', color: '#A5ACB3' }}>
              <li>
                <button
                  type="button"
                  onClick={() => setCurrentView('privacy_policy')}
                  style={{ color: 'inherit', padding: 0, background: 'none' }}
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setCurrentView('terms_conditions')}
                  style={{ color: 'inherit', padding: 0, background: 'none' }}
                >
                  Terms & Conditions
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setCurrentView('how_it_works')}
                  style={{ color: 'inherit', padding: 0, background: 'none' }}
                >
                  How Verification Works
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setCurrentView('contact_support')}
                  style={{ color: 'inherit', padding: 0, background: 'none' }}
                >
                  Customer & Roadside Support
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            borderTop: '1px solid #23282D',
            paddingTop: '2rem',
            fontSize: '0.82rem',
            color: '#7D868F'
          }}
        >
          <div>
            © 2026 RideHub Technologies Private Limited. All rights reserved. HubX is a registered business tier of RideHub.
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <ShieldCheck size={15} color="var(--color-trust)" />
              1-Phone-1-Identity Guard
            </span>
            <span>•</span>
            <span>Bengaluru • Goa • Mumbai • Delhi</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
