import React, { useEffect, useState } from 'react';
import {
  Compass,
  ShieldCheck,
  Award,
  Sparkles,
  User as UserIcon,
  Store,
  Clock,
  Menu,
  X,
  FileCheck2,
  CloudSun
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Header: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    currentUser,
    switchRole,
    setIsAuthModalOpen,
    activeBooking,
    weather
  } = useApp();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isCustomer = currentUser.role === 'customer';

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        backgroundColor: isScrolled ? 'rgba(250, 248, 244, 0.94)' : 'var(--color-canvas)',
        backdropFilter: isScrolled ? 'blur(10px)' : 'none',
        borderBottom: isScrolled ? '1px solid var(--color-border)' : '1px solid transparent',
        transition: 'padding var(--transition-normal), background-color var(--transition-normal), border-color var(--transition-normal)',
        paddingTop: isScrolled ? '0.65rem' : '1.25rem',
        paddingBottom: isScrolled ? '0.65rem' : '1.25rem'
      }}
    >
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        {/* Left: Brand Logo & Weather Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <button
            type="button"
            onClick={() => setCurrentView('landing')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              padding: 0,
              background: 'transparent'
            }}
          >
            {/* Editorial Brand Mark */}
            <div
              style={{
                width: isScrolled ? 34 : 40,
                height: isScrolled ? 34 : 40,
                backgroundColor: 'var(--color-brand)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                transition: 'all var(--transition-normal)'
              }}
            >
              <Compass size={isScrolled ? 20 : 22} strokeWidth={2.3} />
            </div>

            <div style={{ textAlign: 'left' }}>
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: isScrolled ? '1.35rem' : '1.6rem',
                  fontWeight: 800,
                  letterSpacing: '-0.03em',
                  color: 'var(--color-ink)',
                  display: 'block',
                  lineHeight: 1
                }}
              >
                RideHub
              </span>
              <span
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 600,
                  letterSpacing: '0.06em',
                  color: 'var(--color-accent)',
                  textTransform: 'uppercase'
                }}
              >
                Local Rentals & HubX
              </span>
            </div>
          </button>

          {/* Live Open-Meteo Weather Widget */}
          {weather && (
            <div
              className="badge badge-outline"
              style={{
                display: 'none',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.75rem',
                backgroundColor: 'var(--color-canvas-subtle)',
                padding: '0.25rem 0.6rem'
              }}
              id="header-weather-pill"
            >
              <CloudSun size={14} color="var(--color-accent)" />
              <span style={{ fontWeight: 600 }}>{weather.city}:</span>
              <span className="tabular-nums">{Math.round(weather.temperatureC)}°C</span>
              <span style={{ opacity: 0.7 }}>• {weather.condition}</span>
            </div>
          )}
        </div>

        {/* Center: Desktop Navigation Links */}
        <nav
          style={{
            display: 'none',
            alignItems: 'center',
            gap: '1.25rem'
          }}
          className="desktop-nav"
        >
          {isCustomer ? (
            <>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setCurrentView('search')}
                style={{
                  fontWeight: currentView === 'search' ? 700 : 500,
                  color: currentView === 'search' ? 'var(--color-brand)' : 'var(--color-ink-muted)',
                  fontSize: '0.9rem'
                }}
              >
                Browse Fleet
              </button>

              <button
                type="button"
                className="btn-ghost"
                onClick={() => setCurrentView('how_it_works')}
                style={{
                  fontWeight: currentView === 'how_it_works' ? 700 : 500,
                  color: currentView === 'how_it_works' ? 'var(--color-brand)' : 'var(--color-ink-muted)',
                  fontSize: '0.9rem'
                }}
              >
                How It Works
              </button>

              <button
                type="button"
                className="btn-ghost"
                onClick={() => setCurrentView('rewards_wallet')}
                style={{
                  fontWeight: currentView === 'rewards_wallet' ? 700 : 500,
                  color: currentView === 'rewards_wallet' ? 'var(--color-brand)' : 'var(--color-ink-muted)',
                  fontSize: '0.9rem'
                }}
              >
                Rewards & Hotel Vouchers
              </button>

              <button
                type="button"
                className="btn-ghost"
                onClick={() => setCurrentView('contact_support')}
                style={{
                  fontWeight: currentView === 'contact_support' ? 700 : 500,
                  color: currentView === 'contact_support' ? 'var(--color-brand)' : 'var(--color-ink-muted)',
                  fontSize: '0.9rem'
                }}
              >
                Help & Support
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setCurrentView('shop_ai_dashboard')}
                style={{
                  fontWeight: currentView === 'shop_ai_dashboard' ? 700 : 500,
                  color: currentView === 'shop_ai_dashboard' ? 'var(--color-brand)' : 'var(--color-ink-muted)',
                  fontSize: '0.9rem'
                }}
              >
                AI Insights & Demand
              </button>

              <button
                type="button"
                className="btn-ghost"
                onClick={() => setCurrentView('dynamic_pricing_calendar')}
                style={{
                  fontWeight: currentView === 'dynamic_pricing_calendar' ? 700 : 500,
                  color: currentView === 'dynamic_pricing_calendar' ? 'var(--color-brand)' : 'var(--color-ink-muted)',
                  fontSize: '0.9rem'
                }}
              >
                Weekly Pricing Calendar
              </button>

              <button
                type="button"
                className="btn-ghost"
                onClick={() => setCurrentView('shop_listings')}
                style={{
                  fontWeight: currentView === 'shop_listings' ? 700 : 500,
                  color: currentView === 'shop_listings' ? 'var(--color-brand)' : 'var(--color-ink-muted)',
                  fontSize: '0.9rem'
                }}
              >
                Manage Vehicles
              </button>

              <button
                type="button"
                className="btn-ghost"
                onClick={() => setCurrentView('shop_subscription')}
                style={{
                  fontWeight: currentView === 'shop_subscription' ? 700 : 500,
                  color: currentView === 'shop_subscription' ? 'var(--color-brand)' : 'var(--color-ink-muted)',
                  fontSize: '0.9rem'
                }}
              >
                HubX Subscription
              </button>
            </>
          )}
        </nav>

        {/* Right: Actions, Role Switcher, Points, Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Active Booking Prompt */}
          {activeBooking && isCustomer && (
            <button
              type="button"
              onClick={() => setCurrentView('active_rental')}
              className="badge badge-accent"
              style={{
                cursor: 'pointer',
                padding: '0.35rem 0.75rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                border: 'none'
              }}
            >
              <Clock size={14} />
              <span>Active Ride ({activeBooking.id})</span>
            </button>
          )}

          {/* Document Verification Badge/Trigger */}
          {isCustomer && (
            <button
              type="button"
              onClick={() => setCurrentView('verification')}
              className={currentUser.isVerified ? 'badge badge-trust' : 'badge badge-accent'}
              style={{
                cursor: 'pointer',
                padding: '0.35rem 0.75rem',
                fontSize: '0.78rem',
                fontWeight: 600,
                border: 'none'
              }}
              title="Digital Driving Licence & ID Verification"
            >
              {currentUser.isVerified ? (
                <>
                  <FileCheck2 size={14} />
                  <span>ID Verified</span>
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  <span>Verify ID (+150 pts)</span>
                </>
              )}
            </button>
          )}

          {/* Points Pill */}
          {isCustomer && (
            <button
              type="button"
              onClick={() => setCurrentView('rewards_wallet')}
              className="badge badge-brand"
              style={{
                cursor: 'pointer',
                padding: '0.35rem 0.75rem',
                fontSize: '0.8rem',
                fontWeight: 700,
                border: 'none'
              }}
            >
              <Award size={14} />
              <span className="tabular-nums">{currentUser.rewardPoints} pts</span>
            </button>
          )}

          {/* Role Switcher Pill: Customer vs HubX Shopkeeper */}
          <div
            style={{
              backgroundColor: 'var(--color-canvas-subtle)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-pill)',
              padding: '0.2rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.2rem'
            }}
          >
            <button
              type="button"
              onClick={() => switchRole('customer')}
              style={{
                fontSize: '0.78rem',
                fontWeight: isCustomer ? 700 : 500,
                padding: '0.25rem 0.75rem',
                borderRadius: 'var(--radius-pill)',
                backgroundColor: isCustomer ? 'var(--color-brand)' : 'transparent',
                color: isCustomer ? '#FFFFFF' : 'var(--color-ink-muted)',
                transition: 'all var(--transition-fast)'
              }}
            >
              Customer
            </button>
            <button
              type="button"
              onClick={() => switchRole('shopkeeper')}
              style={{
                fontSize: '0.78rem',
                fontWeight: !isCustomer ? 700 : 500,
                padding: '0.25rem 0.75rem',
                borderRadius: 'var(--radius-pill)',
                backgroundColor: !isCustomer ? 'var(--color-accent)' : 'transparent',
                color: !isCustomer ? '#FFFFFF' : 'var(--color-ink-muted)',
                transition: 'all var(--transition-fast)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem'
              }}
            >
              <Store size={13} />
              <span>HubX Shop</span>
            </button>
          </div>

          {/* Auth / Account Profile Button */}
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setIsAuthModalOpen(true)}
            style={{
              padding: '0.45rem 0.85rem',
              fontSize: '0.85rem',
              gap: '0.4rem'
            }}
          >
            <UserIcon size={15} />
            <span className="hide-on-mobile">
              {currentUser.fullName.split(' ')[0]}
            </span>
          </button>

          {/* Mobile Hamburger Toggle */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="mobile-menu-btn"
            style={{
              display: 'none',
              padding: '0.5rem',
              color: 'var(--color-ink)'
            }}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div
          style={{
            borderTop: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-canvas)',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}
        >
          {isCustomer ? (
            <>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setCurrentView('search');
                  setIsMobileMenuOpen(false);
                }}
              >
                Browse Fleet
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setCurrentView('verification');
                  setIsMobileMenuOpen(false);
                }}
              >
                Document Verification (+150 pts)
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setCurrentView('rewards_wallet');
                  setIsMobileMenuOpen(false);
                }}
              >
                Rewards & Hotel Vouchers
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setCurrentView('how_it_works');
                  setIsMobileMenuOpen(false);
                }}
              >
                How It Works
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setCurrentView('shop_ai_dashboard');
                  setIsMobileMenuOpen(false);
                }}
              >
                AI Insights & Demand
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setCurrentView('dynamic_pricing_calendar');
                  setIsMobileMenuOpen(false);
                }}
              >
                Weekly Pricing Calendar
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setCurrentView('shop_listings');
                  setIsMobileMenuOpen(false);
                }}
              >
                Manage Vehicles
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setCurrentView('shop_subscription');
                  setIsMobileMenuOpen(false);
                }}
              >
                HubX Subscription
              </button>
            </>
          )}
        </div>
      )}

      {/* Style block for responsive display helpers */}
      <style>{`
        @media (min-width: 900px) {
          .desktop-nav { display: flex !important; }
          #header-weather-pill { display: inline-flex !important; }
        }
        @media (max-width: 899px) {
          .mobile-menu-btn { display: inline-flex !important; }
        }
      `}</style>
    </header>
  );
};
