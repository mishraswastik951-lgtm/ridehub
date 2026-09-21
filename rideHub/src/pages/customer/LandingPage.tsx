import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { formatINR } from "../../utils/formatters";
import { VehicleCard } from "../../components/common/VehicleCard";
import { SearchBookingPanel } from "../../components/common/SearchBookingPanel";
import { 
  ShieldCheck, 
  ArrowRight, 
  Clock, 
  Gift, 
  FileCheck2, 
  CheckCircle2, 
  Store,
  Truck,
  MapPin
} from "lucide-react";

interface LandingPageProps {
  onNavigate: (route: string) => void;
  onSelectVehicle: (vehicleId: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, onSelectVehicle }) => {
  const { vehicles, switchRole } = useApp();
  const [selectedType, setSelectedType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeLocation, setActiveLocation] = useState("Panaji, Goa");

  const filteredVehicles = vehicles.filter((v) => {
    const matchesType = selectedType === "all" || v.type === selectedType;
    const matchesQuery =
      v.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.shopName && v.shopName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesQuery;
  }).slice(0, 4);

  const handleSearchSubmit = (filters: {
    vehicleType: string;
    location: string;
    pickupDate: string;
    pickupTime: string;
    returnDate: string;
    returnTime: string;
    durationHours: number;
    searchQuery: string;
  }) => {
    setSelectedType(filters.vehicleType);
    setSearchQuery(filters.searchQuery);
    setActiveLocation(filters.location);
    onNavigate("/explore");
  };

  return (
    <div className="space-y-20 pb-24">
      {/* 1. Hero Section - Solid Navy with Editorial Route Line & White Logo */}
      <section className="relative overflow-hidden bg-[#0F1F3D] text-white pt-16 pb-28 px-4 sm:px-6 lg:px-8">
        {/* Hand-drawn Dotted Route Line Background Decoration */}
        <svg 
          className="absolute inset-0 w-full h-full pointer-events-none opacity-20" 
          viewBox="0 0 1200 600" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            d="M -50 450 C 200 380, 250 150, 480 220 C 700 280, 850 100, 1050 180 C 1150 220, 1250 160, 1300 200" 
            stroke="#FFFFFF" 
            strokeWidth="2.5" 
            strokeDasharray="6 8" 
          />
          <circle cx="480" cy="220" r="5" fill="#E8A317" />
          <circle cx="850" cy="100" r="5" fill="#FFFFFF" />
          <circle cx="1050" cy="180" r="6" fill="#2456D6" />
        </svg>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            {/* Eyebrow Label with wide letter-spacing */}
            <div className="inline-flex items-center gap-2 bg-[#0A1529] border border-[#1E2D4A] px-3 py-1 rounded-[4px]">
              <span className="eyebrow-label-dark">
                VERIFIED LOCAL OPERATOR NETWORK • GOA & DEHRADUN
              </span>
            </div>

            <h1 className="font-heading font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-none text-white">
              Every ride, one hub.
            </h1>

            <p className="text-[#B5C4E0] text-base sm:text-lg max-w-2xl mx-auto font-normal leading-relaxed">
              Compare rental garages across Goa, inspect transparent fleet pricing, check in paperlessly via DigiLocker, and book with guaranteed deposit protection.
            </p>
          </div>

          {/* Search & Booking Panel */}
          <div className="mt-10 max-w-5xl mx-auto">
            <SearchBookingPanel
              onSearch={handleSearchSubmit}
              defaultVehicleType={selectedType}
              defaultLocation={activeLocation}
            />
          </div>

          {/* Solid Value Badges */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-[#B5C4E0]">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-[#2E9E6B]" /> Paperless DigiLocker Check-in
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-[#2E9E6B]" /> Guaranteed Security Deposit Return
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-[#2E9E6B]" /> 1-Click UPI Mid-Ride Extensions
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-[#2E9E6B]" /> Area Doorstep Delivery with Transparent Fee
            </span>
          </div>
        </div>
      </section>

      {/* 2. Featured Verified Fleet Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pb-4 border-b border-[#E4DDD1]">
          <div>
            <span className="eyebrow-label block mb-1">
              INSPECTED LOCAL FLEET
            </span>
            <h2 className="font-heading font-bold text-2xl sm:text-3xl text-[#16181F]">
              Available Vehicles Near You
            </h2>
          </div>
          <button
            onClick={() => onNavigate("/explore")}
            className="text-sm font-semibold text-[#2456D6] hover:text-[#1B44AE] flex items-center gap-1.5 cursor-pointer"
          >
            <span>Explore all on map</span>
            <ArrowRight size={15} />
          </button>
        </div>

        {/* Fleet Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredVehicles.map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              onSelect={onSelectVehicle}
              onQuickBook={(id) => onNavigate(`/book/${id}`)}
            />
          ))}
        </div>
      </section>

      {/* 3. Human-Crafted Asymmetric Editorial Layout: "How RideHub Works" */}
      <section className="bg-[#F3EEE6] py-18 border-y border-[#E4DDD1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <span className="eyebrow-label block mb-1">
                STANDARDS & ARCHITECTURE
              </span>
              <h2 className="font-heading font-bold text-2xl sm:text-4xl text-[#16181F]">
                How we solved Indian self-drive rental friction.
              </h2>
            </div>
            <p className="text-sm text-[#5B6070] max-w-md">
              No physical ID retention, no cash deposit haggling, and no hidden terms. A direct contract between verified customers and audited shops.
            </p>
          </div>

          {/* Asymmetric Offset Grid with Oversized Numerals (01, 02, 03, 04) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* 01: Wide Editorial Card (7 cols) */}
            <div className="lg:col-span-7 bg-white p-8 rounded-[12px] border border-[#E4DDD1] shadow-[0_1px_2px_rgba(15,31,61,0.06)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-heading font-extrabold text-4xl sm:text-5xl text-[#E4DDD1] tabular-nums">
                    01
                  </span>
                  <div className="verified-seal">
                    <CheckCircle2 size={12} /> Paperless Standard
                  </div>
                </div>
                <h3 className="font-heading font-bold text-xl sm:text-2xl text-[#16181F] mt-4">
                  Paperless DigiLocker Verification
                </h3>
                <p className="text-sm text-[#5B6070] mt-3 leading-relaxed">
                  Verify your Driving Licence and Government ID securely through digital KYC before leaving your hotel. Local shops inspect the verified digital credential without confiscating your original Aadhaar or Passport.
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-[#E4DDD1] flex items-center justify-between text-xs text-[#5B6070]">
                <span className="flex items-center gap-1.5 font-medium text-[#16181F]">
                  <FileCheck2 size={14} className="text-[#2456D6]" /> Zero paper photocopy required
                </span>
                <span className="font-semibold text-[#1B7A4E] bg-[#EBF7F0] px-2 py-0.5 rounded-[4px]">
                  Bonus +150 Points on Completion
                </span>
              </div>
            </div>

            {/* 02: Narrow Editorial Card (5 cols) */}
            <div className="lg:col-span-5 bg-white p-8 rounded-[12px] border border-[#E4DDD1] shadow-[0_1px_2px_rgba(15,31,61,0.06)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-heading font-extrabold text-4xl sm:text-5xl text-[#E4DDD1] tabular-nums">
                    02
                  </span>
                  <ShieldCheck size={20} className="text-[#1B7A4E]" />
                </div>
                <h3 className="font-heading font-bold text-xl text-[#16181F] mt-4">
                  Audited Community Trust Score
                </h3>
                <p className="text-sm text-[#5B6070] mt-3 leading-relaxed">
                  Every shop operates with an immutable public score measuring deposit return promptness, vehicle maintenance, and punctuality.
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-[#E4DDD1]">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#5B6070]">Shop Honest Rating</span>
                  <span className="font-heading font-bold text-[#1B7A4E] tabular-nums">9.8 / 10 Average</span>
                </div>
              </div>
            </div>

            {/* 03: Narrow Editorial Card (5 cols) */}
            <div className="lg:col-span-5 bg-white p-8 rounded-[12px] border border-[#E4DDD1] shadow-[0_1px_2px_rgba(15,31,61,0.06)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-heading font-extrabold text-4xl sm:text-5xl text-[#E4DDD1] tabular-nums">
                    03
                  </span>
                  <Clock size={20} className="text-[#2456D6]" />
                </div>
                <h3 className="font-heading font-bold text-xl text-[#16181F] mt-4">
                  1-Click Mid-Ride UPI Extension
                </h3>
                <p className="text-sm text-[#5B6070] mt-3 leading-relaxed">
                  Stuck in beach traffic or want to watch the sunset at Chapora Fort? Extend your rental duration by 1 hour, 2 hours, or a full day directly in the web app via instant UPI.
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-[#E4DDD1] flex items-center justify-between text-xs text-[#5B6070]">
                <span>No phone calls or penalty arguments</span>
                <span className="font-medium text-[#16181F]">Fixed hourly slab</span>
              </div>
            </div>

            {/* 04: Wide Editorial Card (7 cols) */}
            <div className="lg:col-span-7 bg-white p-8 rounded-[12px] border border-[#E4DDD1] shadow-[0_1px_2px_rgba(15,31,61,0.06)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-heading font-extrabold text-4xl sm:text-5xl text-[#E4DDD1] tabular-nums">
                    04
                  </span>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#2456D6] bg-[#FAF7F2] border border-[#E4DDD1] px-2 py-0.5 rounded-[4px]">
                    <Truck size={13} /> Transparent Area Surcharges
                  </div>
                </div>
                <h3 className="font-heading font-bold text-xl sm:text-2xl text-[#16181F] mt-4">
                  Doorstep Area Delivery Calculation
                </h3>
                <p className="text-sm text-[#5B6070] mt-3 leading-relaxed">
                  Want the scooty or SUV delivered right to your villa in Anjuna or MOPA airport terminal? We calculate transparent, distance-based area delivery fees so you see the exact cost before confirming.
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-[#E4DDD1] grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 bg-[#FAF7F2] rounded-[4px] border border-[#E4DDD1]">
                  <p className="text-[#5B6070] text-[10px] uppercase font-bold">Local Hub Radius</p>
                  <p className="font-heading font-bold text-[#16181F] mt-0.5 tabular-nums">+₹99</p>
                </div>
                <div className="p-2 bg-[#FAF7F2] rounded-[4px] border border-[#E4DDD1]">
                  <p className="text-[#5B6070] text-[10px] uppercase font-bold">Coastal Belt</p>
                  <p className="font-heading font-bold text-[#16181F] mt-0.5 tabular-nums">+₹179</p>
                </div>
                <div className="p-2 bg-[#FAF7F2] rounded-[4px] border border-[#E4DDD1]">
                  <p className="text-[#5B6070] text-[10px] uppercase font-bold">Airport Zone</p>
                  <p className="font-heading font-bold text-[#16181F] mt-0.5 tabular-nums">+₹449</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Fleet Owner Callout - Solid Navy with White Logo & Amber Key CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-[12px] bg-[#0F1F3D] border border-[#0A1529] p-8 sm:p-12 text-white shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl space-y-4">
            <div className="flex items-center gap-2">
              <span className="bg-[#E8A317] text-[#0F1F3D] text-[10px] font-black px-2 py-0.5 rounded-[4px] uppercase tracking-wider">
                HUBX OPERATOR DESK
              </span>
              <span className="text-xs text-[#B5C4E0]">For Garage & Fleet Owners</span>
            </div>

            <h2 className="font-heading font-bold text-2xl sm:text-3xl lg:text-4xl text-white leading-tight">
              List your fleet on HubX with a 30-day evaluation trial.
            </h2>

            <p className="text-[#B5C4E0] text-sm leading-relaxed">
              Connect your vehicles with verified tourists. Gain access to demand telemetry, automated digital agreement logging, and guaranteed dispute protection.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              {/* Amber CTA with Navy text */}
              <button
                onClick={() => {
                  switchRole("shopkeeper");
                  onNavigate("/hubx");
                }}
                className="bg-[#E8A317] hover:bg-[#D99614] text-[#0F1F3D] font-heading font-bold px-6 py-3 rounded-[8px] transition-colors duration-200 cursor-pointer flex items-center gap-2 text-sm"
              >
                <Store size={17} />
                <span>Start Free 30-Day Trial</span>
              </button>

              <button
                onClick={() => {
                  switchRole("shopkeeper");
                  onNavigate("/dashboard");
                }}
                className="bg-transparent hover:bg-white/10 text-white font-semibold px-5 py-3 rounded-[8px] transition-colors duration-200 border border-white/20 text-sm cursor-pointer"
              >
                Inspect Shopkeeper Dashboard
              </button>
            </div>
          </div>

          {/* Metric Box with Tabular Numbers */}
          <div className="w-full md:w-80 bg-[#0A1529] rounded-[8px] p-5 border border-white/10 text-xs space-y-3 shrink-0">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="font-semibold text-white">Operational Benchmarks</span>
              <span className="text-[10px] text-[#B5C4E0]">Sample data</span>
            </div>
            <div className="space-y-2.5">
              <div className="flex justify-between text-[#B5C4E0]">
                <span>Fleet Utilization:</span>
                <strong className="text-white tabular-nums font-semibold">88.4% (+32%)</strong>
              </div>
              <div className="flex justify-between text-[#B5C4E0]">
                <span>Deposit Disputes:</span>
                <strong className="text-[#2E9E6B] font-semibold">0 Recorded Disputes</strong>
              </div>
              <div className="flex justify-between text-[#B5C4E0]">
                <span>Average Monthly Revenue:</span>
                <strong className="text-white tabular-nums font-bold">{formatINR(148500)}</strong>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
