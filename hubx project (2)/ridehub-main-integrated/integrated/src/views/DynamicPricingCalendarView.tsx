import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Sparkles,
  TrendingUp,
  Sliders,
  SlidersHorizontal,
  CheckCircle2,
  Info,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const DynamicPricingCalendarView: React.FC = () => {
  const { vehicles, shops, addToast } = useApp();
  const shop = shops[0];
  const shopVehicles = vehicles.filter((v) => v.shopId === shop.id);

  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(shopVehicles[0]?.id || 'veh_scooty_1');
  const [autoWeekendSurge, setAutoWeekendSurge] = useState(true);
  const [autoWeatherSurge, setAutoWeatherSurge] = useState(true);
  const [autoScarcitySurge, setAutoScarcitySurge] = useState(true);

  const selectedVehicle = shopVehicles.find((v) => v.id === selectedVehicleId) || shopVehicles[0];

  // Calendar days for the coming week
  const days = [
    { day: 'Mon', date: '22 Sep', isWeekend: false, surge: 0, reason: 'Standard Base' },
    { day: 'Tue', date: '23 Sep', isWeekend: false, surge: 0, reason: 'Standard Base' },
    { day: 'Wed', date: '24 Sep', isWeekend: false, surge: 0, reason: 'Standard Base' },
    { day: 'Thu', date: '25 Sep', isWeekend: false, surge: 20, reason: 'Pre-weekend Influx' },
    { day: 'Fri', date: '26 Sep', isWeekend: false, surge: 50, reason: 'Evening Leisure Rush' },
    { day: 'Sat', date: '27 Sep', isWeekend: true, surge: autoWeekendSurge ? 80 : 0, reason: 'Peak Weekend Getaways' },
    { day: 'Sun', date: '28 Sep', isWeekend: true, surge: autoWeekendSurge ? 70 : 0, reason: 'Sunday Outings' }
  ];

  const handleSaveCalendar = () => {
    addToast({
      type: 'success',
      title: 'Pricing Calendar Synchronized',
      message: `Weekly rate adjustments published across RideHub for ${selectedVehicle.name}.`
    });
  };

  return (
    <div style={{ backgroundColor: 'var(--color-canvas)', minHeight: '85vh', padding: '3rem 0 6rem 0' }}>
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div className="badge badge-surge" style={{ marginBottom: '0.4rem' }}>
              Dynamic Pricing Engine
            </div>
            <h1 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', margin: 0 }}>
              Weekly Pricing Calendar
            </h1>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-ink-muted)' }}>
              Visualize automated day-by-day dynamic adjustments for {shop.name}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSaveCalendar}
            >
              <span>Publish Weekly Adjustments</span>
            </button>
          </div>
        </div>

        {/* Vehicle Selector Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.75rem', marginBottom: '2rem' }}>
          {shopVehicles.map((veh) => (
            <button
              key={veh.id}
              type="button"
              onClick={() => setSelectedVehicleId(veh.id)}
              style={{
                padding: '0.65rem 1.1rem',
                borderRadius: 'var(--radius-pill)',
                fontSize: '0.85rem',
                fontWeight: selectedVehicleId === veh.id ? 700 : 500,
                backgroundColor: selectedVehicleId === veh.id ? 'var(--color-brand)' : '#FFFFFF',
                color: selectedVehicleId === veh.id ? '#FFFFFF' : 'var(--color-ink)',
                border: '1px solid var(--color-border)',
                whiteSpace: 'nowrap',
                transition: 'all var(--transition-fast)'
              }}
            >
              {veh.name} (Base ₹{veh.basePrice})
            </button>
          ))}
        </div>

        {/* Calendar Grid */}
        <div
          className="card"
          style={{
            padding: '2rem',
            backgroundColor: '#FFFFFF',
            boxShadow: 'var(--shadow-md)',
            marginBottom: '2.5rem'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', margin: 0 }}>
                Adjusted Rates for {selectedVehicle.name}
              </h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-ink-muted)' }}>
                Base Rate: ₹{selectedVehicle.basePrice}/day • Auto-updated based on demand forecast
              </span>
            </div>
          </div>

          {/* 7-Day Calendar Strip */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: '0.75rem'
            }}
          >
            {days.map((item, idx) => {
              const finalRate = selectedVehicle.basePrice + item.surge;

              return (
                <div
                  key={idx}
                  style={{
                    backgroundColor: item.isWeekend ? 'var(--color-surge-light)' : 'var(--color-canvas)',
                    border: item.isWeekend ? '1.5px solid var(--color-surge)' : '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.25rem 0.85rem',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: 170
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: item.isWeekend ? 'var(--color-surge)' : 'var(--color-ink)' }}>
                      {item.day}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--color-ink-muted)', marginBottom: '0.85rem' }}>
                      {item.date}
                    </div>

                    <div className="tabular-nums" style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-brand)' }}>
                      ₹{finalRate}
                    </div>

                    {item.surge > 0 ? (
                      <span className="badge badge-surge" style={{ fontSize: '0.68rem', marginTop: '0.35rem' }}>
                        +₹{item.surge} Surge
                      </span>
                    ) : (
                      <span className="badge badge-outline" style={{ fontSize: '0.68rem', marginTop: '0.35rem' }}>
                        Base Rate
                      </span>
                    )}
                  </div>

                  <span style={{ fontSize: '0.68rem', color: 'var(--color-ink-faint)', marginTop: '0.75rem', lineHeight: 1.2 }}>
                    {item.reason}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic Pricing Engine Automation Rules */}
        <div
          className="card"
          style={{
            padding: '2rem',
            backgroundColor: '#FFFFFF',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem' }}>
            Automated Surge & Multiplier Rules
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem',
                backgroundColor: 'var(--color-canvas)',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer'
              }}
            >
              <div>
                <strong style={{ fontSize: '0.9rem', display: 'block' }}>Weekend Leisure Surge (+₹70)</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-ink-muted)' }}>
                  Applies automatically on Saturdays & Sundays based on Kaggle demand uplift.
                </span>
              </div>
              <input
                type="checkbox"
                checked={autoWeekendSurge}
                onChange={(e) => setAutoWeekendSurge(e.target.checked)}
                style={{ accentColor: 'var(--color-brand)', width: 18, height: 18 }}
              />
            </label>

            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem',
                backgroundColor: 'var(--color-canvas)',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer'
              }}
            >
              <div>
                <strong style={{ fontSize: '0.9rem', display: 'block' }}>Low Inventory Scarcity (+₹50)</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-ink-muted)' }}>
                  Triggers when only 1 or 2 vehicles remain in your shop category.
                </span>
              </div>
              <input
                type="checkbox"
                checked={autoScarcitySurge}
                onChange={(e) => setAutoScarcitySurge(e.target.checked)}
                style={{ accentColor: 'var(--color-brand)', width: 18, height: 18 }}
              />
            </label>

            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem',
                backgroundColor: 'var(--color-canvas)',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer'
              }}
            >
              <div>
                <strong style={{ fontSize: '0.9rem', display: 'block' }}>Clear Weather Leisure Factor (+₹30)</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-ink-muted)' }}>
                  Linked to Open-Meteo satellite feed; boosts two-wheeler leisure rentals on sunny days.
                </span>
              </div>
              <input
                type="checkbox"
                checked={autoWeatherSurge}
                onChange={(e) => setAutoWeatherSurge(e.target.checked)}
                style={{ accentColor: 'var(--color-brand)', width: 18, height: 18 }}
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
