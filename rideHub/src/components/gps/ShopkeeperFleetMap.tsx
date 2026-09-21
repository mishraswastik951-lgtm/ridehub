import React, { useState, useEffect } from "react";
import { 
  Search, 
  AlertTriangle, 
  Battery, 
  Gauge, 
  CheckCircle2, 
  Phone, 
  Radio, 
  Power, 
  Flame, 
  Terminal, 
  Lock,
  BellRing,
  ShieldCheck
} from "lucide-react";
import { LiveMap } from "./LiveMap";
import { MOCK_FLEET_VEHICLES, MOCK_FLEET_ALERTS, FleetVehicle, GOA_DEMO_CITY } from "../../config/gpsConfig";

export const ShopkeeperFleetMap: React.FC = () => {
  const [vehicles, setVehicles] = useState<FleetVehicle[]>(MOCK_FLEET_VEHICLES);
  const [selectedVehicle, setSelectedVehicle] = useState<FleetVehicle | null>(vehicles[0]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"map" | "telemetry_logs" | "alerts">("map");

  // God-Level Controls State
  const [mapStyle, setMapStyle] = useState<"ivory" | "satellite" | "heatmap">("ivory");
  const [engineCutoffLocked, setEngineCutoffLocked] = useState<{ [key: string]: boolean }>({});
  const [speedGovernorActive, setSpeedGovernorActive] = useState<{ [key: string]: boolean }>({});
  const [alarmActive, setAlarmActive] = useState<{ [key: string]: boolean }>({});
  const [geofenceRadius, setGeofenceRadius] = useState<number>(5000);
  const [showEngineLockModal, setShowEngineLockModal] = useState<boolean>(false);

  // Live Terminal Log Ticker Packets
  const [logPackets, setLogPackets] = useState<string[]>([
    `[GPS-STREAM 001] GA-03-X-4892 • Lat 15.5204 Lng 73.8052 • Speed: 34 km/h • Battery: 88% • TPMS: 32/34 PSI • Engine: 82°C • NOMINAL`,
    `[GPS-STREAM 002] GA-01-E-7721 • Lat 15.5562 Lng 73.7511 • Speed: 48 km/h • Battery: 65% • TPMS: 31/33 PSI • Engine: 88°C • NOMINAL`,
    `[GPS-STREAM 003] GA-03-Z-9912 • Lat 15.5781 Lng 73.7405 • Speed: 0 km/h • Battery: 22% • Alert: OVERDUE 22 MINS • IGNITION STANDBY`,
  ]);

  // Simulate incoming live telemetry stream every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!selectedVehicle) return;
      const pktId = Math.floor(100 + Math.random() * 900);
      const newPkt = `[GPS-STREAM ${pktId}] ${selectedVehicle.regNo} • Speed: ${selectedVehicle.speedKmh} km/h • Battery: ${selectedVehicle.batteryFuel}% • Lat ${(selectedVehicle.currentLat + (Math.random() - 0.5) * 0.001).toFixed(4)} Lng ${(selectedVehicle.currentLng + (Math.random() - 0.5) * 0.001).toFixed(4)} • Signal 99.8%`;
      setLogPackets((prev) => [newPkt, ...prev.slice(0, 15)]);
    }, 3000);
    return () => clearInterval(interval);
  }, [selectedVehicle]);

  // Filter vehicles
  const filteredVehicles = vehicles.filter((v) => {
    const matchesStatus = statusFilter === "all" || v.status === statusFilter;
    const matchesSearch =
      v.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.regNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.customerName && v.customerName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: FleetVehicle["status"]) => {
    switch (status) {
      case "on_ride":
        return <span className="bg-[#2456D6] text-white px-2 py-0.5 rounded-[4px] text-[10px] font-extrabold uppercase">On Ride</span>;
      case "on_delivery":
        return <span className="bg-[#E8A317] text-[#0F1F3D] px-2 py-0.5 rounded-[4px] text-[10px] font-extrabold uppercase">On Delivery</span>;
      case "idle":
        return <span className="bg-[#5B6070] text-white px-2 py-0.5 rounded-[4px] text-[10px] font-extrabold uppercase">Idle</span>;
      case "overdue":
        return <span className="bg-[#C8432F] text-white px-2 py-0.5 rounded-[4px] text-[10px] font-extrabold uppercase animate-pulse">Overdue</span>;
    }
  };

  const toggleEngineLock = (vehId: string) => {
    setEngineCutoffLocked((prev) => ({ ...prev, [vehId]: !prev[vehId] }));
    setShowEngineLockModal(false);
  };

  const toggleSpeedGovernor = (vehId: string) => {
    setSpeedGovernorActive((prev) => ({ ...prev, [vehId]: !prev[vehId] }));
  };

  const toggleAlarmBeacon = (vehId: string) => {
    setAlarmActive((prev) => ({ ...prev, [vehId]: !prev[vehId] }));
  };

  return (
    <div className="space-y-6">
      {/* Top Banner - God-Level Fleet Command Station */}
      <div className="bg-[#0F1F3D] rounded-[16px] p-6 text-white border border-[#0A1529] shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-[#E8A317] text-[#0F1F3D] text-[10px] font-extrabold px-2.5 py-0.5 rounded-[4px] uppercase tracking-widest flex items-center gap-1">
                <Radio size={12} className="animate-pulse" /> GOD-LEVEL TELEMETRY HUB
              </span>
              <span className="bg-[#132A24] text-[#2E9E6B] border border-[#1E4D38] text-[10px] font-bold px-2 py-0.5 rounded-[4px] flex items-center gap-1">
                <ShieldCheck size={12} /> Live Encrypted Feed
              </span>
            </div>
            <h2 className="font-heading font-extrabold text-2xl text-white">
              Shopkeeper Fleet GPS Command Center
            </h2>
            <p className="text-xs text-[#B5C4E0]">
              Remote ignition immobilizer, 35km/h speed governor lock, TPMS diagnostics, and geofence radar across Goa.
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-1.5 bg-[#0A1529] p-1.5 rounded-[10px] border border-white/10 self-start md:self-auto">
            <button
              onClick={() => setActiveTab("map")}
              className={`px-3.5 py-1.5 rounded-[6px] text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "map"
                  ? "bg-[#2456D6] text-white shadow"
                  : "text-[#B5C4E0] hover:text-white"
              }`}
            >
              <Radio size={14} />
              <span>Command Map ({vehicles.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("telemetry_logs")}
              className={`px-3.5 py-1.5 rounded-[6px] text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "telemetry_logs"
                  ? "bg-[#2456D6] text-white shadow"
                  : "text-[#B5C4E0] hover:text-white"
              }`}
            >
              <Terminal size={14} />
              <span>Live Terminal</span>
            </button>

            <button
              onClick={() => setActiveTab("alerts")}
              className={`px-3.5 py-1.5 rounded-[6px] text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "alerts"
                  ? "bg-[#C8432F] text-white shadow"
                  : "text-[#B5C4E0] hover:text-white"
              }`}
            >
              <AlertTriangle size={14} />
              <span>Alerts ({MOCK_FLEET_ALERTS.length})</span>
            </button>
          </div>
        </div>

        {/* Live Telemetry Ticker Stream Bar */}
        <div className="bg-[#0A1529] rounded-[8px] p-2.5 border border-white/10 font-mono text-[11px] text-[#2E9E6B] flex items-center gap-3 overflow-hidden">
          <span className="shrink-0 bg-[#2E9E6B] text-[#0F1F3D] font-black text-[9px] px-1.5 py-0.5 rounded tracking-widest uppercase flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0F1F3D] animate-ping"></span>
            LIVE FEED
          </span>
          <div className="truncate whitespace-nowrap animate-fade-in">
            {logPackets[0]}
          </div>
        </div>
      </div>

      {activeTab === "map" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Interactive Map (Left 2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            {/* Filter & Map Layer Control Bar */}
            <div className="bg-white rounded-[12px] p-4 border border-[#E4DDD1] shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative flex-1 w-full">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5B6070]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search model, reg number, customer..."
                    className="w-full pl-9 pr-3 py-2 text-xs border border-[#E4DDD1] rounded-[6px] focus:outline-none focus:border-[#0F1F3D]"
                  />
                </div>

                {/* Map Layer Mode Switcher */}
                <div className="flex items-center gap-1 bg-[#FAF7F2] p-1 rounded-[6px] border border-[#E4DDD1] shrink-0 text-xs">
                  <button
                    onClick={() => setMapStyle("ivory")}
                    className={`px-2.5 py-1 rounded-[4px] font-bold text-[11px] transition-colors cursor-pointer ${
                      mapStyle === "ivory" ? "bg-[#0F1F3D] text-white" : "text-[#5B6070]"
                    }`}
                  >
                    Ivory Theme
                  </button>
                  <button
                    onClick={() => setMapStyle("satellite")}
                    className={`px-2.5 py-1 rounded-[4px] font-bold text-[11px] transition-colors cursor-pointer ${
                      mapStyle === "satellite" ? "bg-[#0F1F3D] text-white" : "text-[#5B6070]"
                    }`}
                  >
                    Satellite
                  </button>
                  <button
                    onClick={() => setMapStyle("heatmap")}
                    className={`px-2.5 py-1 rounded-[4px] font-bold text-[11px] transition-colors cursor-pointer ${
                      mapStyle === "heatmap" ? "bg-[#E8A317] text-[#0F1F3D]" : "text-[#5B6070]"
                    }`}
                  >
                    Heatmap
                  </button>
                </div>
              </div>

              {/* Status Filter Chips & Geofence Radius Selector */}
              <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 text-xs">
                <div className="flex items-center gap-1.5">
                  {[
                    { key: "all", label: `All (${vehicles.length})` },
                    { key: "on_ride", label: "On Ride (2)" },
                    { key: "on_delivery", label: "On Delivery (1)" },
                    { key: "idle", label: "Idle (1)" },
                    { key: "overdue", label: "Overdue (1)" },
                  ].map((chip) => (
                    <button
                      key={chip.key}
                      onClick={() => setStatusFilter(chip.key)}
                      className={`px-3 py-1 rounded-[6px] text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                        statusFilter === chip.key
                          ? "bg-[#0F1F3D] text-white"
                          : "bg-[#FAF7F2] text-[#5B6070] border border-[#E4DDD1] hover:bg-[#F3EEE6]"
                      }`}
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1 text-[11px] font-semibold text-[#5B6070] shrink-0">
                  <span>Geofence:</span>
                  <select
                    value={geofenceRadius}
                    onChange={(e) => setGeofenceRadius(parseInt(e.target.value))}
                    className="bg-[#FAF7F2] border border-[#E4DDD1] rounded px-1.5 py-0.5 text-xs text-[#16181F]"
                  >
                    <option value={3000}>3 km City</option>
                    <option value={5000}>5 km Coastal</option>
                    <option value={15000}>15 km North Goa</option>
                    <option value={30000}>30 km State</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Map Container */}
            <div className="h-[520px] relative">
              <LiveMap
                center={GOA_DEMO_CITY.center}
                zoom={12}
                fleetVehicles={filteredVehicles}
                selectedFleetVehicleId={selectedVehicle?.id}
                onSelectFleetVehicle={(v) => setSelectedVehicle(v)}
                geofenceCenter={GOA_DEMO_CITY.center}
                geofenceRadiusMeters={geofenceRadius}
                height="100%"
              />

              {/* Map Floating HUD Overlay for Selected Vehicle */}
              {selectedVehicle && (
                <div className="absolute top-4 left-4 z-[400] bg-[#0F1F3D]/95 text-white p-3 rounded-[10px] border border-white/20 shadow-lg text-xs space-y-1 backdrop-blur-xs">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <span>{selectedVehicle.model}</span>
                    <span className="text-[10px] font-mono text-[#E8A317]">{selectedVehicle.regNo}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-[#B5C4E0]">
                    <span>Speed: <strong className="text-white font-mono tabular-nums">{selectedVehicle.speedKmh} km/h</strong></span>
                    <span>Battery: <strong className="text-[#2E9E6B] font-mono tabular-nums">{selectedVehicle.batteryFuel}%</strong></span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Side Drawer - God-Level Vehicle Control Suite & Telemetry */}
          <div className="space-y-4">
            {selectedVehicle ? (
              <div className="bg-white rounded-[16px] p-5 border border-[#E4DDD1] shadow-lg space-y-5">
                {/* Vehicle Header & Status Badge */}
                <div className="flex items-start justify-between pb-3 border-b border-[#E4DDD1]">
                  <div>
                    <span className="eyebrow-label block mb-0.5">TELEMETRY & REMOTE COMMAND</span>
                    <h3 className="font-heading font-bold text-base text-[#16181F]">
                      {selectedVehicle.model}
                    </h3>
                    <p className="text-xs font-mono font-bold text-[#2456D6] mt-0.5">
                      {selectedVehicle.regNo}
                    </p>
                  </div>
                  {getStatusBadge(selectedVehicle.status)}
                </div>

                {/* GOD-LEVEL REMOTE CONTROL COMMAND BUTTONS */}
                <div className="space-y-2 p-3 bg-[#FAF7F2] rounded-[12px] border border-[#E4DDD1]">
                  <span className="text-[10px] font-extrabold text-[#0F1F3D] uppercase tracking-wider block">
                    ⚡ REMOTE TELEMETRY COMMANDS
                  </span>

                  <div className="grid grid-cols-2 gap-2">
                    {/* Engine Immobilizer / Kill Switch */}
                    <button
                      onClick={() => setShowEngineLockModal(true)}
                      className={`py-2 px-2.5 rounded-[8px] text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs ${
                        engineCutoffLocked[selectedVehicle.id]
                          ? "bg-[#C8432F] text-white"
                          : "bg-white border border-[#E4DDD1] text-[#16181F] hover:bg-[#FFF5F5]"
                      }`}
                    >
                      {engineCutoffLocked[selectedVehicle.id] ? <Lock size={14} /> : <Power size={14} />}
                      <span>{engineCutoffLocked[selectedVehicle.id] ? "Engine Locked" : "Kill Engine"}</span>
                    </button>

                    {/* Speed Governor Lock */}
                    <button
                      onClick={() => toggleSpeedGovernor(selectedVehicle.id)}
                      className={`py-2 px-2.5 rounded-[8px] text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs ${
                        speedGovernorActive[selectedVehicle.id]
                          ? "bg-[#0F1F3D] text-[#E8A317]"
                          : "bg-white border border-[#E4DDD1] text-[#16181F] hover:bg-[#FAF7F2]"
                      }`}
                    >
                      <Gauge size={14} />
                      <span>{speedGovernorActive[selectedVehicle.id] ? "35km/h Limit" : "Speed Lock"}</span>
                    </button>

                    {/* Horn & Beacon Alarm */}
                    <button
                      onClick={() => toggleAlarmBeacon(selectedVehicle.id)}
                      className={`col-span-2 py-2 px-2.5 rounded-[8px] text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs ${
                        alarmActive[selectedVehicle.id]
                          ? "bg-[#E8A317] text-[#0F1F3D] animate-bounce"
                          : "bg-white border border-[#E4DDD1] text-[#16181F] hover:bg-[#FFF8E6]"
                      }`}
                    >
                      <BellRing size={14} />
                      <span>{alarmActive[selectedVehicle.id] ? "🚨 Alarm & Siren Sounding!" : "Trigger Remote Siren Beacon"}</span>
                    </button>
                  </div>
                </div>

                {/* Telemetry Metrics Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-[8px] bg-[#FAF7F2] border border-[#E4DDD1]">
                    <span className="text-[10px] text-[#5B6070] block">Live Speed</span>
                    <div className="flex items-center gap-1.5 mt-0.5 font-bold text-[#16181F] tabular-nums">
                      <Gauge size={14} className="text-[#2456D6]" />
                      <span>{selectedVehicle.speedKmh} km/h</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-[8px] bg-[#FAF7F2] border border-[#E4DDD1]">
                    <span className="text-[10px] text-[#5B6070] block">Odometer</span>
                    <div className="flex items-center gap-1.5 mt-0.5 font-bold text-[#16181F] tabular-nums">
                      <span>14,850 km</span>
                    </div>
                  </div>
                </div>

                {/* Customer Verification State & Actions */}
                {selectedVehicle.customerName ? (
                  <div className="p-3.5 rounded-[10px] bg-[#FAF7F2] border border-[#E4DDD1] space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#5B6070] uppercase">Renter & Identity Audit</span>
                      {selectedVehicle.customerVerified && (
                        <span className="verified-seal text-[10px]">
                          <CheckCircle2 size={11} /> VERIFIED AADHAAR
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#16181F] text-sm">{selectedVehicle.customerName}</span>
                      <a href={`tel:${selectedVehicle.customerPhone}`} className="px-2.5 py-1 bg-[#2456D6] text-white font-bold rounded-[6px] text-[11px] flex items-center gap-1">
                        <Phone size={12} />
                        <span>Call Renter</span>
                      </a>
                    </div>

                    <div className="flex items-center justify-between text-[#5B6070] pt-1 border-t border-[#E4DDD1]">
                      <span>Time Remaining:</span>
                      <span className={`font-bold tabular-nums ${selectedVehicle.timeLeftMinutes! < 0 ? "text-[#C8432F]" : "text-[#16181F]"}`}>
                        {selectedVehicle.timeLeftMinutes! < 0
                          ? `${Math.abs(selectedVehicle.timeLeftMinutes!)}m OVERDUE`
                          : `${selectedVehicle.timeLeftMinutes} mins`}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-[8px] bg-[#FAF7F2] border border-[#E4DDD1] text-xs text-[#5B6070] text-center">
                    Vehicle unassigned at hub station.
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-[12px] p-6 border border-[#E4DDD1] text-center text-xs text-[#5B6070]">
                Click any vehicle marker on the map to open the command suite.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mode 2: Live Terminal Log Stream */}
      {activeTab === "telemetry_logs" && (
        <div className="bg-[#0F1F3D] rounded-[16px] p-6 border border-[#0A1529] shadow-xl text-white space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Terminal size={18} className="text-[#2E9E6B]" />
              <h3 className="font-bold text-sm text-white">Live WebSocket Telemetry Packet Stream</h3>
            </div>
            <span className="text-[10px] bg-[#132A24] text-[#2E9E6B] border border-[#1E4D38] font-bold px-2 py-0.5 rounded">
              300ms Interval Active
            </span>
          </div>

          <div className="bg-[#0A1529] rounded-[10px] p-4 border border-white/10 max-h-[420px] overflow-y-auto space-y-2 text-[11px] text-[#B5C4E0]">
            {logPackets.map((pkt, idx) => (
              <div key={idx} className="p-2 rounded hover:bg-white/5 border-b border-white/5 font-mono">
                <span className="text-[#E8A317] font-bold">{pkt.split(" ")[0]}</span>{" "}
                <span>{pkt.split(" ").slice(1).join(" ")}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mode 3: Fleet Alerts & Incident Command */}
      {activeTab === "alerts" && (
        <div className="bg-white rounded-[16px] p-6 border border-[#E4DDD1] shadow-md space-y-4">
          <h3 className="font-heading font-bold text-base text-[#16181F]">Active Telemetry Alerts & Action Protocol</h3>
          <div className="space-y-3">
            {MOCK_FLEET_ALERTS.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-[12px] border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs ${
                  alert.severity === "high"
                    ? "bg-[#FFF5F5] border-[#C8432F] text-[#C8432F]"
                    : alert.severity === "medium"
                    ? "bg-[#FFF8E6] border-[#E8A317] text-[#0F1F3D]"
                    : "bg-[#FAF7F2] border-[#E4DDD1] text-[#16181F]"
                }`}
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle size={20} className="shrink-0 mt-0.5" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm">{alert.vehicleModel}</span>
                      <span className="font-mono text-[11px] px-1.5 py-0.2 rounded bg-black/10">
                        {alert.regNo}
                      </span>
                    </div>
                    <p className="mt-1 opacity-90">{alert.message}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                  <button
                    onClick={() => setShowEngineLockModal(true)}
                    className="px-3 py-1.5 bg-[#C8432F] text-white font-bold rounded-[6px] text-xs cursor-pointer"
                  >
                    Immobilize Vehicle
                  </button>
                  <a
                    href="tel:+919076543210"
                    className="px-3 py-1.5 bg-[#0F1F3D] text-white font-bold rounded-[6px] text-xs cursor-pointer"
                  >
                    Contact Renter
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Confirmation Modal for Engine Immobilizer / Kill Switch */}
      {showEngineLockModal && selectedVehicle && (
        <div className="fixed inset-0 z-[1000] bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-[16px] p-6 max-w-md w-full space-y-4 border border-[#E4DDD1] shadow-2xl">
            <div className="flex items-center gap-3 text-[#C8432F]">
              <div className="w-10 h-10 rounded-full bg-[#FFF5F5] flex items-center justify-center border border-[#C8432F]">
                <Power size={22} />
              </div>
              <div>
                <h3 className="font-heading font-bold text-lg text-[#16181F]">Emergency Ignition Kill Command</h3>
                <p className="text-xs text-[#5B6070]">{selectedVehicle.model} ({selectedVehicle.regNo})</p>
              </div>
            </div>

            <div className="p-3.5 rounded-[8px] bg-[#FFF5F5] border border-[#C8432F]/40 text-xs text-[#C8432F] space-y-1">
              <span className="font-bold block">Safety Protocol Notice:</span>
              <p>
                Sending this telemetry command will disable the ignition relay. If vehicle is in motion, speed governor will decelerate vehicle safely to 0 km/h before cutoff.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowEngineLockModal(false)}
                className="flex-1 py-2.5 bg-[#FAF7F2] border border-[#E4DDD1] text-[#16181F] font-bold text-xs rounded-[8px]"
              >
                Cancel Command
              </button>
              <button
                onClick={() => toggleEngineLock(selectedVehicle.id)}
                className="flex-1 py-2.5 bg-[#C8432F] hover:bg-[#A83422] text-white font-bold text-xs rounded-[8px] cursor-pointer"
              >
                Confirm Immobilize Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
