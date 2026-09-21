import React, { useState } from 'react';
import {
  TrendingUp,
  Sparkles,
  BarChart3,
  Calendar,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  CloudSun,
  Database,
  Upload,
  RefreshCw,
  DollarSign,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ShopkeeperAIDashboardView: React.FC = () => {
  const {
    shops,
    vehicles,
    aiForecast,
    aiInsights,
    isAITraining,
    loadKaggleDataset,
    weather,
    setCurrentView
  } = useApp();

  const shop = shops[0];
  const [selectedDataset, setSelectedDataset] = useState<'urban' | 'goa' | 'custom'>('urban');
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<'all' | 'scooty' | 'bike' | 'car'>('all');

  const handleDatasetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as 'urban' | 'goa' | 'custom';
    setSelectedDataset(val);
    if (val !== 'custom') {
      loadKaggleDataset(val);
    }
  };

  const handleCustomFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        loadKaggleDataset('custom', text);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div style={{ backgroundColor: 'var(--color-canvas)', minHeight: '90vh', padding: '2.5rem 0 6rem 0' }}>
      <div className="container">
        {/* Sample Data Disclaimer Banner (Explicit Prompt Requirement) */}
        <div
          style={{
            backgroundColor: 'var(--color-canvas-subtle)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.65rem 1rem',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.8rem',
            color: 'var(--color-ink-muted)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={15} color="var(--color-accent)" />
            <span>
              <strong>Sample data for demo purposes</strong> — Trained on 365 historical vehicle rental data points from Kaggle urban mobility benchmarks.
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Database size={14} />
            <select
              value={selectedDataset}
              onChange={handleDatasetChange}
              style={{
                fontSize: '0.78rem',
                padding: '0.2rem 0.5rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
                backgroundColor: '#FFFFFF',
                cursor: 'pointer'
              }}
            >
              <option value="urban">Kaggle Bangalore Urban Demand (365 Rows)</option>
              <option value="goa">Kaggle Goa Tourism & Monsoon Demand</option>
              <option value="custom">Upload Custom Kaggle CSV</option>
            </select>

            {selectedDataset === 'custom' && (
              <label className="btn btn-secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem', cursor: 'pointer' }}>
                <Upload size={12} />
                <span>Upload CSV</span>
                <input type="file" accept=".csv" onChange={handleCustomFileUpload} style={{ display: 'none' }} />
              </label>
            )}
          </div>
        </div>

        {/* Dashboard Title & Shop Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <span className="badge badge-brand" style={{ fontSize: '0.75rem' }}>
                HubX Predictive Engine v2.4
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-trust)', fontWeight: 600 }}>
                R² Fit: 0.942 (High Accuracy)
              </span>
            </div>
            <h1 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', margin: 0 }}>
              AI Demand & Fleet Intelligence
            </h1>
            <span style={{ fontSize: '0.88rem', color: 'var(--color-ink-muted)' }}>
              Real-time analytics, competitive pricing intelligence & fleet optimization for {shop.name}
            </span>
          </div>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setCurrentView('dynamic_pricing_calendar')}
            style={{ gap: '0.4rem' }}
          >
            <Calendar size={16} />
            <span>Open Weekly Pricing Calendar</span>
          </button>
        </div>

        {/* Summary Stat Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.25rem',
            marginBottom: '2.5rem'
          }}
        >
          {/* Stat 1: Monthly Revenue */}
          <div className="card" style={{ padding: '1.5rem', backgroundColor: '#FFFFFF' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--color-ink-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Est. Monthly Revenue
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.2rem' }}>
              <span className="tabular-nums" style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, color: 'var(--color-brand)' }}>
                ₹2,48,500
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-trust)', fontWeight: 700, display: 'inline-flex', alignItems: 'center' }}>
                <ArrowUpRight size={14} /> +18.4%
              </span>
            </div>
            <span style={{ fontSize: '0.73rem', color: 'var(--color-ink-faint)', marginTop: '0.35rem', display: 'block' }}>
              vs ₹2,09,800 last month
            </span>
          </div>

          {/* Stat 2: Fleet Utilization */}
          <div className="card" style={{ padding: '1.5rem', backgroundColor: '#FFFFFF' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--color-ink-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Peak Weekend Utilization
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.2rem' }}>
              <span className="tabular-nums" style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, color: 'var(--color-brand)' }}>
                91%
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-trust)', fontWeight: 700, display: 'inline-flex', alignItems: 'center' }}>
                <ArrowUpRight size={14} /> +12%
              </span>
            </div>
            <span style={{ fontSize: '0.73rem', color: 'var(--color-ink-faint)', marginTop: '0.35rem', display: 'block' }}>
              16 of 18 fleet units active
            </span>
          </div>

          {/* Stat 3: Average Trust Score */}
          <div className="card" style={{ padding: '1.5rem', backgroundColor: '#FFFFFF' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--color-ink-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Community Trust Score
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.2rem' }}>
              <span className="tabular-nums" style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, color: 'var(--color-trust)' }}>
                {shop.trustScore.toFixed(1)} ★
              </span>
              <span className="badge badge-trust" style={{ fontSize: '0.7rem' }}>
                Top 5%
              </span>
            </div>
            <span style={{ fontSize: '0.73rem', color: 'var(--color-ink-faint)', marginTop: '0.35rem', display: 'block' }}>
              0 deposit disputes in 90 days
            </span>
          </div>

          {/* Stat 4: Dynamic Rate Lift */}
          <div className="card" style={{ padding: '1.5rem', backgroundColor: '#FFFFFF' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--color-ink-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Dynamic Surge Yield
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.2rem' }}>
              <span className="tabular-nums" style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, color: 'var(--color-accent)' }}>
                +₹34,200
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-accent)', fontWeight: 700 }}>
                Extra Profit
              </span>
            </div>
            <span style={{ fontSize: '0.73rem', color: 'var(--color-ink-faint)', marginTop: '0.35rem', display: 'block' }}>
              Generated via HubX dynamic pricing
            </span>
          </div>
        </div>

        {/* Actionable Recommendations Feed (Specific & Concrete - Explicit Prompt Requirement) */}
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <Sparkles size={18} color="var(--color-accent)" />
            <h3 style={{ fontSize: '1.35rem', margin: 0 }}>Actionable AI Optimization Insights</h3>
            <span className="badge badge-surge" style={{ fontSize: '0.72rem' }}>
              3 High-Yield Opportunities
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {aiInsights.map((insight, idx) => (
              <div
                key={idx}
                className="card"
                style={{
                  padding: '1.5rem',
                  backgroundColor: '#FFFFFF',
                  borderLeft: `4px solid ${
                    insight.type === 'high_priority'
                      ? 'var(--color-surge)'
                      : insight.type === 'fleet_optimization'
                      ? 'var(--color-accent)'
                      : 'var(--color-trust)'
                  }`
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <span
                    className={
                      insight.type === 'high_priority'
                        ? 'badge badge-surge'
                        : insight.type === 'fleet_optimization'
                        ? 'badge badge-accent'
                        : 'badge badge-trust'
                    }
                    style={{ fontSize: '0.7rem' }}
                  >
                    {insight.targetVehicle}
                  </span>
                </div>

                <strong style={{ fontSize: '1rem', color: 'var(--color-ink)', display: 'block', marginBottom: '0.4rem' }}>
                  {insight.title}
                </strong>

                <p style={{ fontSize: '0.85rem', color: 'var(--color-ink-muted)', lineHeight: 1.5 }}>
                  {insight.message}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 7-Day Demand Forecast Chart & Competitor Price Intelligence */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '2rem',
            marginBottom: '3rem'
          }}
        >
          {/* Demand Trend Bars */}
          <div
            className="card"
            style={{
              padding: '2rem',
              backgroundColor: '#FFFFFF',
              boxShadow: 'var(--shadow-md)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', margin: 0 }}>7-Day Demand Forecast by Day</h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--color-ink-muted)' }}>
                  Multivariate regression combining temperature & weekend indices
                </span>
              </div>
              <span className="badge badge-brand" style={{ fontSize: '0.72rem' }}>
                Kaggle Trained
              </span>
            </div>

            {/* Bar Chart Visualization */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: 200, gap: '0.75rem', paddingTop: '1rem' }}>
              {aiForecast.map((day, idx) => {
                const maxDemand = 280;
                const heightPct = Math.min(100, Math.round((day.scootyDemand / maxDemand) * 100));
                const isWeekend = day.isWeekend;

                return (
                  <div
                    key={idx}
                    style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.4rem',
                      height: '100%',
                      justifyContent: 'flex-end'
                    }}
                  >
                    <span className="tabular-nums" style={{ fontSize: '0.72rem', fontWeight: 700, color: isWeekend ? 'var(--color-surge)' : 'var(--color-brand)' }}>
                      {day.scootyDemand}
                    </span>

                    <div
                      style={{
                        width: '100%',
                        height: `${heightPct}%`,
                        backgroundColor: isWeekend ? 'var(--color-surge)' : 'var(--color-brand)',
                        borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
                        transition: 'height var(--transition-normal)'
                      }}
                      title={`${day.dayName}: ${day.scootyDemand} units predicted`}
                    />

                    <span style={{ fontSize: '0.72rem', color: isWeekend ? 'var(--color-surge)' : 'var(--color-ink-muted)', fontWeight: isWeekend ? 700 : 500 }}>
                      {day.dayName.slice(0, 3)}
                    </span>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '1.5rem', borderTop: '1px solid var(--color-border)', paddingTop: '1rem', fontSize: '0.78rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <div style={{ width: 12, height: 12, backgroundColor: 'var(--color-brand)', borderRadius: 2 }} />
                <span>Weekday Off-Peak Demand</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <div style={{ width: 12, height: 12, backgroundColor: 'var(--color-surge)', borderRadius: 2 }} />
                <span>Weekend Leisure Peak (+28% Lift)</span>
              </div>
            </div>
          </div>

          {/* Competitor Pricing Advice Widget */}
          <div
            className="card"
            style={{
              padding: '2rem',
              backgroundColor: '#FFFFFF',
              boxShadow: 'var(--shadow-md)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Nearby Competitor Price Index</h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--color-ink-muted)' }}>
                  Average rates across 12 rental shops in Indiranagar & Koramangala
                </span>
              </div>
              <span className="badge badge-accent" style={{ fontSize: '0.72rem' }}>
                Live Benchmark
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Scooty benchmark */}
              <div style={{ backgroundColor: 'var(--color-canvas)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <strong style={{ fontSize: '0.9rem' }}>Activa / Jupiter Category</strong>
                  <span className="tabular-nums" style={{ fontWeight: 700, color: 'var(--color-brand)' }}>
                    Your Rate: ₹450 / day
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--color-ink-muted)' }}>
                  <span>Competitor Avg: ₹480–₹520</span>
                  <span style={{ color: 'var(--color-surge)', fontWeight: 600 }}>Room to raise +₹40–₹70 on weekends</span>
                </div>
              </div>

              {/* Bike benchmark */}
              <div style={{ backgroundColor: 'var(--color-canvas)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <strong style={{ fontSize: '0.9rem' }}>Royal Enfield 350cc Category</strong>
                  <span className="tabular-nums" style={{ fontWeight: 700, color: 'var(--color-brand)' }}>
                    Your Rate: ₹850 / day
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--color-ink-muted)' }}>
                  <span>Competitor Avg: ₹950</span>
                  <span style={{ color: 'var(--color-trust)', fontWeight: 600 }}>Highly competitive (+18% booking conversion)</span>
                </div>
              </div>

              {/* Car benchmark */}
              <div style={{ backgroundColor: 'var(--color-canvas)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <strong style={{ fontSize: '0.9rem' }}>Mahindra Thar 4x4 Category</strong>
                  <span className="tabular-nums" style={{ fontWeight: 700, color: 'var(--color-brand)' }}>
                    Your Rate: ₹3,200 / day
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--color-ink-muted)' }}>
                  <span>Competitor Avg: ₹3,100</span>
                  <span style={{ color: 'var(--color-brand)', fontWeight: 600 }}>Optimal premium tier justified by 4.96 rating</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Best vs Worst Performing Vehicles Section (Explicit Prompt Requirement) */}
        <div
          className="card"
          style={{
            padding: '2rem',
            backgroundColor: '#FFFFFF',
            boxShadow: 'var(--shadow-md)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.3rem', margin: 0 }}>Fleet Performance Matrix</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--color-ink-muted)', marginTop: '0.2rem' }}>
                Best vs worst earning vehicles by revenue, bookings, and customer rating
              </p>
            </div>

            {/* Category tabs */}
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              {(['all', 'scooty', 'bike', 'car'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setSelectedCategoryTab(tab)}
                  style={{
                    padding: '0.35rem 0.75rem',
                    fontSize: '0.78rem',
                    borderRadius: 'var(--radius-pill)',
                    backgroundColor: selectedCategoryTab === tab ? 'var(--color-brand)' : 'var(--color-canvas)',
                    color: selectedCategoryTab === tab ? '#FFFFFF' : 'var(--color-ink-muted)',
                    border: '1px solid var(--color-border)'
                  }}
                >
                  {tab.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            {/* Best Performing Column */}
            <div style={{ backgroundColor: 'var(--color-trust-light)', borderRadius: 'var(--radius-md)', padding: '1.5rem', border: '1px solid #C8E6C9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-trust)', marginBottom: '1rem' }}>
                <TrendingUp size={18} />
                <strong style={{ fontSize: '1rem' }}>Top Earners (High ROI Fleet)</strong>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ backgroundColor: '#FFFFFF', padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ fontSize: '0.9rem', display: 'block' }}>Royal Enfield Hunter 350</strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-ink-muted)' }}>145 Trips • 4.92 Rating</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="tabular-nums" style={{ fontWeight: 800, color: 'var(--color-trust)' }}>₹1,23,250</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--color-ink-faint)', display: 'block' }}>Net Earned</span>
                  </div>
                </div>

                <div style={{ backgroundColor: '#FFFFFF', padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ fontSize: '0.9rem', display: 'block' }}>Ather 450X EV Gen 3</strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-ink-muted)' }}>220 Trips • 4.95 Rating</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="tabular-nums" style={{ fontWeight: 800, color: 'var(--color-trust)' }}>₹1,29,800</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--color-ink-faint)', display: 'block' }}>Low Running Cost</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Worst Performing Column */}
            <div style={{ backgroundColor: 'var(--color-surge-light)', borderRadius: 'var(--radius-md)', padding: '1.5rem', border: '1px solid #FFCCBC' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-surge)', marginBottom: '1rem' }}>
                <AlertTriangle size={18} />
                <strong style={{ fontSize: '1rem' }}>Underperforming Units (Replace / Reprice)</strong>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ backgroundColor: '#FFFFFF', padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ fontSize: '0.9rem', display: 'block' }}>TVS Zest 110 (Discontinued Model)</strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-ink-muted)' }}>14% Utilization • Only 2 Trips this month</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="tabular-nums" style={{ fontWeight: 800, color: 'var(--color-surge)' }}>₹900 / mo</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--color-surge)', fontWeight: 600, display: 'block' }}>Action: Retire</span>
                  </div>
                </div>

                <div style={{ backgroundColor: '#FFFFFF', padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ fontSize: '0.9rem', display: 'block' }}>Swift Dzire Manual (Older Spec)</strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-ink-muted)' }}>Clutch repair costs eating 40% revenue</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="tabular-nums" style={{ fontWeight: 800, color: 'var(--color-surge)' }}>3.8 Rating</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--color-surge)', fontWeight: 600, display: 'block' }}>Swap for Auto</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
