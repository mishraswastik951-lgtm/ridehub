import React, { useState } from 'react';
import {
  Plus,
  Car,
  CheckCircle2,
  AlertCircle,
  Edit2,
  Trash2,
  Sliders,
  DollarSign,
  TrendingUp,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { VehicleCategory } from '../types';

export const ShopkeeperListingsView: React.FC = () => {
  const {
    vehicles,
    shops,
    addVehicle,
    toggleVehicleAvailability,
    updateVehicleBasePrice
  } = useApp();

  const shop = shops[0]; // Active shopkeeper's shop
  const shopVehicles = vehicles.filter((v) => v.shopId === shop.id);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState<number>(0);

  // New vehicle form state
  const [newVehicle, setNewVehicle] = useState({
    name: '',
    category: 'scooty' as VehicleCategory,
    brand: '',
    year: 2024,
    fuelType: 'Petrol',
    transmission: 'Automatic',
    mileage: '50 kmpl',
    basePrice: 500,
    securityDeposit: 1500,
    image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1200&q=80',
    features: ['ABS', 'Helmets Included'],
    locationName: `${shop.address} (In-Store)`
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addVehicle({
      ...newVehicle,
      shopId: shop.id,
      isAvailable: true,
      dynamicAdjustment: 0,
      surgeReasons: []
    });
    setIsAddModalOpen(false);
  };

  return (
    <div style={{ backgroundColor: 'var(--color-canvas)', minHeight: '85vh', padding: '3rem 0 6rem 0' }}>
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div className="badge badge-brand" style={{ marginBottom: '0.4rem' }}>
              Fleet Management
            </div>
            <h1 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', margin: 0 }}>
              Vehicle Fleet & Inventory
            </h1>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-ink-muted)' }}>
              Managing listings for {shop.name} ({shopVehicles.length} vehicles active)
            </span>
          </div>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setIsAddModalOpen(true)}
            style={{ padding: '0.75rem 1.5rem', gap: '0.5rem' }}
          >
            <Plus size={18} />
            <span>List New Vehicle</span>
          </button>
        </div>

        {/* Fleet Table */}
        <div
          className="card"
          style={{
            backgroundColor: '#FFFFFF',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-md)'
          }}
        >
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--color-canvas-subtle)', borderBottom: '1px solid var(--color-border)' }}>
                  <th style={{ padding: '1rem 1.25rem', fontWeight: 600, color: 'var(--color-ink-muted)' }}>Vehicle Model</th>
                  <th style={{ padding: '1rem 1.25rem', fontWeight: 600, color: 'var(--color-ink-muted)' }}>Category</th>
                  <th style={{ padding: '1rem 1.25rem', fontWeight: 600, color: 'var(--color-ink-muted)' }}>Base Daily Rate</th>
                  <th style={{ padding: '1rem 1.25rem', fontWeight: 600, color: 'var(--color-ink-muted)' }}>Security Deposit</th>
                  <th style={{ padding: '1rem 1.25rem', fontWeight: 600, color: 'var(--color-ink-muted)' }}>Status</th>
                  <th style={{ padding: '1rem 1.25rem', fontWeight: 600, color: 'var(--color-ink-muted)' }}>Trips</th>
                  <th style={{ padding: '1rem 1.25rem', fontWeight: 600, color: 'var(--color-ink-muted)', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {shopVehicles.map((veh) => (
                  <tr key={veh.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    {/* Vehicle Info */}
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                        <img
                          src={veh.image}
                          alt={veh.name}
                          style={{ width: 56, height: 40, objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
                        />
                        <div>
                          <strong style={{ display: 'block', color: 'var(--color-ink)' }}>{veh.name}</strong>
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-ink-muted)' }}>
                            {veh.brand} • {veh.year} • {veh.transmission}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <span className="badge badge-outline" style={{ textTransform: 'capitalize' }}>
                        {veh.category}
                      </span>
                    </td>

                    {/* Base Daily Rate with Inline Edit */}
                    <td style={{ padding: '1rem 1.25rem' }}>
                      {editingPriceId === veh.id ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <input
                            type="number"
                            value={tempPrice}
                            onChange={(e) => setTempPrice(Number(e.target.value))}
                            className="input-field"
                            style={{ width: 90, padding: '0.35rem 0.5rem' }}
                          />
                          <button
                            type="button"
                            className="btn btn-primary"
                            onClick={() => {
                              updateVehicleBasePrice(veh.id, tempPrice);
                              setEditingPriceId(null);
                            }}
                            style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem' }}
                          >
                            Save
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span className="tabular-nums" style={{ fontWeight: 700, color: 'var(--color-brand)', fontSize: '0.95rem' }}>
                            ₹{veh.basePrice}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingPriceId(veh.id);
                              setTempPrice(veh.basePrice);
                            }}
                            style={{ background: 'none', color: 'var(--color-ink-faint)', padding: '0.2rem' }}
                            title="Edit rate"
                          >
                            <Edit2 size={13} />
                          </button>
                        </div>
                      )}
                    </td>

                    {/* Deposit */}
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <span className="tabular-nums">₹{veh.securityDeposit}</span>
                    </td>

                    {/* Status Toggle */}
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <button
                        type="button"
                        onClick={() => toggleVehicleAvailability(veh.id)}
                        className={veh.isAvailable ? 'badge badge-trust' : 'badge badge-surge'}
                        style={{ cursor: 'pointer', border: 'none' }}
                      >
                        {veh.isAvailable ? '● Available' : '● Maintenance / Out'}
                      </button>
                    </td>

                    {/* Completed Trips */}
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <span className="tabular-nums" style={{ fontWeight: 600 }}>{veh.trips}</span>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={() => toggleVehicleAvailability(veh.id)}
                        style={{
                          fontSize: '0.78rem',
                          color: 'var(--color-brand)',
                          background: 'none',
                          fontWeight: 600,
                          textDecoration: 'underline'
                        }}
                      >
                        {veh.isAvailable ? 'Mark Reserved' : 'Make Available'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add New Vehicle Modal */}
      {isAddModalOpen && (
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
          onClick={() => setIsAddModalOpen(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 580,
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              padding: '2rem',
              boxShadow: 'var(--shadow-dropdown)',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.4rem', margin: 0 }}>List New Fleet Vehicle</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-ink-muted)' }}>
                  Add to HubX partner inventory
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                style={{ background: 'none', color: 'var(--color-ink-faint)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Vehicle Name / Model
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Royal Enfield Classic 350 Reborn"
                  value={newVehicle.name}
                  onChange={(e) => setNewVehicle({ ...newVehicle, name: e.target.value })}
                  className="input-field"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Category
                  </label>
                  <select
                    value={newVehicle.category}
                    onChange={(e) => setNewVehicle({ ...newVehicle, category: e.target.value as VehicleCategory })}
                    className="input-field"
                  >
                    <option value="scooty">Scooty</option>
                    <option value="bike">Motorcycle (Bike)</option>
                    <option value="car">Car / Compact SUV</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Manufacturer Brand
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Royal Enfield, Honda, Ather"
                    value={newVehicle.brand}
                    onChange={(e) => setNewVehicle({ ...newVehicle, brand: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Base Daily Rate (₹)
                  </label>
                  <input
                    type="number"
                    required
                    min={200}
                    value={newVehicle.basePrice}
                    onChange={(e) => setNewVehicle({ ...newVehicle, basePrice: Number(e.target.value) })}
                    className="input-field"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Security Deposit (₹)
                  </label>
                  <input
                    type="number"
                    required
                    min={500}
                    value={newVehicle.securityDeposit}
                    onChange={(e) => setNewVehicle({ ...newVehicle, securityDeposit: Number(e.target.value) })}
                    className="input-field"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Transmission
                  </label>
                  <input
                    type="text"
                    value={newVehicle.transmission}
                    onChange={(e) => setNewVehicle({ ...newVehicle, transmission: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Mileage / Range
                  </label>
                  <input
                    type="text"
                    value={newVehicle.mileage}
                    onChange={(e) => setNewVehicle({ ...newVehicle, mileage: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Photo URL
                </label>
                <input
                  type="url"
                  value={newVehicle.image}
                  onChange={(e) => setNewVehicle({ ...newVehicle, image: e.target.value })}
                  className="input-field"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ padding: '0.75rem 1.5rem' }}
                >
                  Publish Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
