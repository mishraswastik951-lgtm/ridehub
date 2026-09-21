import React, { useState, useMemo } from 'react';
import {
  Search,
  SlidersHorizontal,
  ShieldCheck,
  Video,
  CheckCircle2,
  X,
  MapPin,
  Sparkles,
  ArrowUpDown
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TrustScoreBadge } from '../components/TrustScoreBadge';
import { DynamicPricingTooltip } from '../components/DynamicPricingTooltip';
import { WalkaroundModal } from '../components/WalkaroundModal';
import { Vehicle, VehicleCategory } from '../types';

export const SearchView: React.FC = () => {
  const {
    vehicles,
    shops,
    setSelectedVehicleId,
    setSelectedShopId,
    setCurrentView
  } = useApp();

  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [maxPrice, setMaxPrice] = useState<number>(3500);
  const [minTrustScore, setMinTrustScore] = useState<number>(4.5);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recommended' | 'price_low' | 'price_high' | 'trust'>('recommended');
  const [activeWalkaroundVehicle, setActiveWalkaroundVehicle] = useState<Vehicle | null>(null);

  // Filtered and sorted listings
  const filteredVehicles = useMemo(() => {
    return vehicles
      .filter((veh) => {
        const shop = shops.find((s) => s.id === veh.shopId) || shops[0];
        const finalPrice = veh.basePrice + (veh.dynamicAdjustment || 0);

        // Category filter
        if (categoryFilter !== 'all' && veh.category !== categoryFilter) return false;

        // Price filter
        if (finalPrice > maxPrice) return false;

        // Minimum Trust Score filter
        if (shop.trustScore < minTrustScore) return false;

        // Search text query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = veh.name.toLowerCase().includes(q);
          const matchBrand = veh.brand.toLowerCase().includes(q);
          const matchLoc = veh.locationName.toLowerCase().includes(q);
          const matchShop = shop.name.toLowerCase().includes(q);
          if (!matchName && !matchBrand && !matchLoc && !matchShop) return false;
        }

        return true;
      })
      .sort((a, b) => {
        const shopA = shops.find((s) => s.id === a.shopId) || shops[0];
        const shopB = shops.find((s) => s.id === b.shopId) || shops[0];
        const priceA = a.basePrice + (a.dynamicAdjustment || 0);
        const priceB = b.basePrice + (b.dynamicAdjustment || 0);

        if (sortBy === 'price_low') return priceA - priceB;
        if (sortBy === 'price_high') return priceB - priceA;
        if (sortBy === 'trust') return shopB.trustScore - shopA.trustScore;
        return b.rating - a.rating; // recommended default
      });
  }, [vehicles, shops, categoryFilter, maxPrice, minTrustScore, searchQuery, sortBy]);

  return (
    <div style={{ backgroundColor: 'var(--color-canvas)', minHeight: '85vh', paddingBottom: '5rem' }}>
      {/* Search Header Banner */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid var(--color-border)',
          paddingTop: '2.5rem',
          paddingBottom: '2rem'
        }}
      >
        <div className="container">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <h1 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', marginBottom: '0.35rem' }}>
                Browse Available Fleet
              </h1>
              <p style={{ color: 'var(--color-ink-muted)', fontSize: '0.95rem' }}>
                Filter by verified trust scores, category, and transparent dynamic pricing rates.
              </p>
            </div>

            {/* Global Search Bar */}
            <div
              style={{
                display: 'flex',
                gap: '0.75rem',
                flexWrap: 'wrap',
                alignItems: 'center'
              }}
            >
              <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
                <input
                  type="text"
                  placeholder="Search by vehicle model (Activa, Hunter 350, Thar) or locality..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-field"
                  style={{ paddingLeft: '2.5rem' }}
                />
                <Search
                  size={18}
                  style={{ position: 'absolute', left: 12, top: 12, color: 'var(--color-ink-muted)' }}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    style={{ position: 'absolute', right: 12, top: 12, color: 'var(--color-ink-muted)', background: 'none' }}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* Sort Dropdown */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ArrowUpDown size={15} color="var(--color-ink-muted)" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="input-field"
                  style={{ width: 'auto', padding: '0.75rem 1rem' }}
                >
                  <option value="recommended">Top Recommended</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                  <option value="trust">Highest Trust Score</option>
                </select>
              </div>
            </div>

            {/* Quick Category Buttons */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {[
                { id: 'all', label: 'All Fleet' },
                { id: 'scooty', label: 'Scooties (Activa, Ather, Jupiter)' },
                { id: 'bike', label: 'Bikes (Royal Enfield, Yamaha, KTM)' },
                { id: 'car', label: 'Cars (Hyundai, Thar, Nexon EV)' }
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategoryFilter(c.id)}
                  style={{
                    padding: '0.45rem 0.95rem',
                    borderRadius: 'var(--radius-pill)',
                    fontSize: '0.82rem',
                    fontWeight: categoryFilter === c.id ? 700 : 500,
                    backgroundColor: categoryFilter === c.id ? 'var(--color-brand)' : 'var(--color-canvas-subtle)',
                    color: categoryFilter === c.id ? '#FFFFFF' : 'var(--color-ink-muted)',
                    border: '1px solid var(--color-border)',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content: Filters Sidebar + Results Grid */}
      <div className="container" style={{ paddingTop: '2.5rem' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem',
            alignItems: 'flex-start'
          }}
        >
          {/* Filters Sidebar */}
          <div
            className="card"
            style={{
              padding: '1.5rem',
              position: 'sticky',
              top: '5.5rem',
              backgroundColor: '#FFFFFF',
              maxHeight: 'calc(100vh - 7rem)',
              overflowY: 'auto'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}>
                <SlidersHorizontal size={17} color="var(--color-brand)" />
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}>Refine Results</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setCategoryFilter('all');
                  setMaxPrice(3500);
                  setMinTrustScore(4.5);
                  setSearchQuery('');
                }}
                style={{ fontSize: '0.75rem', color: 'var(--color-accent)', background: 'none', fontWeight: 600 }}
              >
                Reset All
              </button>
            </div>

            {/* Filter 1: Minimum Community Trust Score */}
            <div style={{ marginBottom: '1.75rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-ink)' }}>
                  Min Trust Score
                </label>
                <span className="tabular-nums badge badge-trust" style={{ fontWeight: 700 }}>
                  ★ {minTrustScore.toFixed(1)}+
                </span>
              </div>
              <input
                type="range"
                min={4.0}
                max={4.9}
                step={0.1}
                value={minTrustScore}
                onChange={(e) => setMinTrustScore(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--color-trust)' }}
              />
              <span style={{ fontSize: '0.72rem', color: 'var(--color-ink-muted)', marginTop: '0.3rem', display: 'block' }}>
                Filters shops by dispute-free deposit rate and punctuality.
              </span>
            </div>

            {/* Filter 2: Max Daily Budget */}
            <div style={{ marginBottom: '1.75rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-ink)' }}>
                  Max Daily Rate
                </label>
                <span className="tabular-nums" style={{ fontWeight: 700, color: 'var(--color-brand)' }}>
                  ₹{maxPrice} / day
                </span>
              </div>
              <input
                type="range"
                min={400}
                max={3500}
                step={50}
                value={maxPrice}
                onChange={(e) => setMaxPrice(parseInt(e.target.value, 10))}
                style={{ width: '100%', accentColor: 'var(--color-brand)' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--color-ink-faint)', marginTop: '0.2rem' }}>
                <span>₹400</span>
                <span>₹1,500</span>
                <span>₹3,500</span>
              </div>
            </div>

            {/* Filter 3: HubX Partner Status */}
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-ink)', marginBottom: '0.6rem', display: 'block' }}>
                Store Certification
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.82rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input type="checkbox" defaultChecked style={{ accentColor: 'var(--color-brand)' }} />
                  <span>HubX Prime Verified Partners Only</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input type="checkbox" defaultChecked style={{ accentColor: 'var(--color-brand)' }} />
                  <span>Instant Digital Handover</span>
                </label>
              </div>
            </div>
          </div>

          {/* Results Grid (spanning 2 columns on wide screens) */}
          <div style={{ gridColumn: 'span 2' }}>
            {/* Live Count Indicator with Animation */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.92rem', color: 'var(--color-ink)' }}>
                Showing <strong className="tabular-nums" style={{ color: 'var(--color-brand)' }}>{filteredVehicles.length}</strong> matching vehicles
              </div>
              <span style={{ fontSize: '0.78rem', color: 'var(--color-ink-muted)' }}>
                All prices include 15-day certified maintenance checks
              </span>
            </div>

            {filteredVehicles.length === 0 ? (
              <div
                className="card"
                style={{
                  padding: '3.5rem 2rem',
                  textAlign: 'center',
                  backgroundColor: '#FFFFFF'
                }}
              >
                <Sparkles size={36} color="var(--color-accent)" style={{ margin: '0 auto 1rem auto' }} />
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
                  No vehicles free right now with these exact filters
                </h3>
                <p style={{ color: 'var(--color-ink-muted)', fontSize: '0.9rem', maxWidth: 440, margin: '0 auto 1.5rem auto' }}>
                  Try widening your price budget slider or lowering the minimum trust score threshold to view more nearby shops.
                </p>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setCategoryFilter('all');
                    setMaxPrice(3500);
                    setMinTrustScore(4.5);
                    setSearchQuery('');
                  }}
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
                  gap: '1.5rem'
                }}
              >
                {filteredVehicles.map((veh) => {
                  const shop = shops.find((s) => s.id === veh.shopId) || shops[0];
                  const finalPrice = veh.basePrice + (veh.dynamicAdjustment || 0);

                  return (
                    <div
                      key={veh.id}
                      className="card card-hoverable"
                      style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
                      onClick={() => {
                        setSelectedVehicleId(veh.id);
                        setCurrentView('vehicle_detail');
                      }}
                    >
                      {/* Image & Badges */}
                      <div style={{ position: 'relative', aspectRatio: '16 / 10', overflow: 'hidden' }}>
                        <img
                          src={veh.image}
                          alt={veh.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />

                        <div style={{ position: 'absolute', top: 10, left: 10 }}>
                          <span
                            className="badge"
                            style={{ backgroundColor: 'rgba(20, 23, 26, 0.8)', color: '#FFFFFF', fontSize: '0.7rem' }}
                          >
                            {veh.category.toUpperCase()}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveWalkaroundVehicle(veh);
                          }}
                          style={{
                            position: 'absolute',
                            top: 10,
                            right: 10,
                            backgroundColor: 'rgba(255, 255, 255, 0.92)',
                            color: 'var(--color-ink)',
                            borderRadius: 'var(--radius-pill)',
                            padding: '0.25rem 0.6rem',
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            border: 'none'
                          }}
                        >
                          <Video size={12} color="var(--color-brand)" />
                          <span>Walkaround</span>
                        </button>

                        <div style={{ position: 'absolute', bottom: 10, left: 10 }}>
                          <DynamicPricingTooltip
                            basePrice={veh.basePrice}
                            dynamicAdjustment={veh.dynamicAdjustment}
                            surgeReasons={veh.surgeReasons}
                          />
                        </div>
                      </div>

                      {/* Content */}
                      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.2rem' }}>{veh.name}</h3>
                        <span style={{ fontSize: '0.78rem', color: 'var(--color-ink-muted)' }}>
                          {veh.transmission} • {veh.mileage} • {veh.locationName}
                        </span>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.65rem', marginBottom: '1rem' }}>
                          <span style={{ fontSize: '0.78rem', color: 'var(--color-ink-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 140 }}>
                            {shop.name}
                          </span>
                          <TrustScoreBadge
                            score={shop.trustScore}
                            breakdown={shop.trustBreakdown}
                            size="sm"
                            onViewShopProfile={() => {
                              setSelectedShopId(shop.id);
                              setCurrentView('shop_trust_profile');
                            }}
                          />
                        </div>

                        <div
                          style={{
                            marginTop: 'auto',
                            borderTop: '1px solid var(--color-border)',
                            paddingTop: '0.85rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                          }}
                        >
                          <div>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.2rem' }}>
                              <span className="tabular-nums" style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-brand)' }}>
                                ₹{finalPrice}
                              </span>
                              <span style={{ fontSize: '0.75rem', color: 'var(--color-ink-muted)' }}>/ day</span>
                            </div>
                          </div>

                          <button
                            type="button"
                            className="btn btn-primary"
                            style={{ padding: '0.45rem 0.9rem', fontSize: '0.82rem' }}
                          >
                            Details & Rent
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {activeWalkaroundVehicle && (
        <WalkaroundModal
          vehicle={activeWalkaroundVehicle}
          onClose={() => setActiveWalkaroundVehicle(null)}
        />
      )}
    </div>
  );
};
