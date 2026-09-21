import React, { useState, useEffect } from "react";
import {
  MapPin,
  Clock,
  ShieldCheck,
  Radio,
  ArrowLeft,
  Navigation,
  PhoneCall,
  CheckCircle2,
  Truck,
  Sparkles
} from "lucide-react";
import { useApp } from "../../context/AppContext";

interface LiveTrackingPageProps {
  bookingId?: string;
  onBack: () => void;
}

export const LiveTrackingPage: React.FC<LiveTrackingPageProps> = ({ bookingId = "BK-1001", onBack }) => {
  const { bookings, vehicles, shops } = useApp();
  const booking = bookings.find((b) => b.id === bookingId) || bookings[0];
  const vehicle = booking?.vehicle || vehicles.find((v) => v.id === booking?.vehicleId) || vehicles[0];
  const shop = booking?.shop || shops.find((s) => s.id === booking?.shopId) || shops[0];

  const [etaSeconds, setEtaSeconds] = useState(720); // 12 mins initial
  const [distanceRemaining, setDistanceRemaining] = useState(3800); // 3.8 km
  const [progress, setProgress] = useState(35); // 35% along path
  const [deliveryStatus, setDeliveryStatus] = useState<"assigned" | "en_route" | "arriving" | "delivered">("en_route");

  // Simulated live telemetry movement
  useEffect(() => {
    const timer = setInterval(() => {
      setEtaSeconds((prev) => {
        if (prev <= 10) {
          setDeliveryStatus("delivered");
          return 0;
        }
        if (prev <= 120) setDeliveryStatus("arriving");
        return prev - 5;
      });

      setDistanceRemaining((prev) => Math.max(0, prev - 30));
      setProgress((prev) => Math.min(100, prev + 0.8));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatEta = (seconds: number) => {
    if (seconds <= 0) return "Rider Arrived at Delivery Spot!";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs < 10 ? "0" : ""}${secs}s`;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#16181F] hover:bg-[#F3EEE6] bg-white px-3.5 py-2 rounded-[8px] border border-[#E4DDD1] cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>Back to Active Ride</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1B7A4E] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#1B7A4E]"></span>
          </span>
          <span className="text-xs font-bold text-[#1B7A4E]">
            Live Doorstep Telemetry Feed
          </span>
        </div>
      </div>

      {/* Main Grid: Telemetry Map & Rider Status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Visual Map Simulator (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-[12px] border border-[#E4DDD1] overflow-hidden shadow-[0_2px_8px_rgba(15,31,61,0.06)]">
          <div className="p-4 border-b border-[#E4DDD1] bg-[#FAF7F2] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Truck size={16} className="text-[#2456D6]" />
              <h3 className="font-heading font-bold text-sm text-[#16181F]">
                Doorstep Delivery Rider Route
              </h3>
            </div>
            <span className="text-[11px] font-mono text-[#5B6070]">
              GPS Accuracy: ±3 meters
            </span>
          </div>

          {/* Interactive Simulated Route Track */}
          <div className="relative bg-[#FAF7F2] p-8 aspect-16/10 flex flex-col justify-between overflow-hidden">
            {/* SVG Roads & Animated Rider Track */}
            <svg className="w-full h-full" viewBox="0 0 600 300">
              {/* Road lines */}
              <path
                d="M 60 240 Q 200 200, 320 120 T 540 60"
                stroke="#E4DDD1"
                strokeWidth="14"
                fill="none"
                strokeLinecap="round"
              />
              <path
                d="M 60 240 Q 200 200, 320 120 T 540 60"
                stroke="#0F1F3D"
                strokeWidth="5"
                fill="none"
                strokeDasharray="8 6"
                strokeLinecap="round"
              />

              {/* Shop Origin Pin */}
              <circle cx="60" cy="240" r="10" fill="#0F1F3D" />
              <text x="60" y="270" textAnchor="middle" fill="#0F1F3D" fontSize="11" fontWeight="bold">
                {shop.name.split(" ")[0]} Hub
              </text>

              {/* Customer Destination Pin */}
              <circle cx="540" cy="60" r="12" fill="#1B7A4E" />
              <circle cx="540" cy="60" r="6" fill="#FFFFFF" />
              <text x="540" y="90" textAnchor="middle" fill="#1B7A4E" fontSize="11" fontWeight="bold">
                Your Doorstep
              </text>

              {/* Dynamic Animated Rider Position */}
              <g
                transform={`translate(${60 + ((540 - 60) * (progress / 100))}, ${
                  240 - ((240 - 60) * Math.sin((progress / 100) * (Math.PI / 2)))
                })`}
              >
                <circle cx="0" cy="0" r="18" fill="#E8A317" opacity="0.3" className="animate-ping" />
                <circle cx="0" cy="0" r="12" fill="#E8A317" stroke="#0F1F3D" strokeWidth="2" />
                <text x="0" y="4" textAnchor="middle" fill="#0F1F3D" fontSize="9" fontWeight="bold">
                  🛵
                </text>
              </g>
            </svg>

            {/* Bottom Floating Stats Bar */}
            <div className="bg-white/95 backdrop-blur-xs border border-[#E4DDD1] rounded-[8px] p-3.5 flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-full bg-[#EBF7F0] text-[#1B7A4E]">
                  <Clock size={16} />
                </div>
                <div>
                  <span className="text-[10px] text-[#5B6070] uppercase font-bold block">Estimated Arrival</span>
                  <strong className="text-sm text-[#0F1F3D] tabular-nums font-bold">
                    {formatEta(etaSeconds)}
                  </strong>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-full bg-[#FAF7F2] text-[#2456D6] border border-[#E4DDD1]">
                  <Navigation size={16} />
                </div>
                <div>
                  <span className="text-[10px] text-[#5B6070] uppercase font-bold block">Distance Remaining</span>
                  <strong className="text-sm text-[#0F1F3D] tabular-nums font-bold">
                    {(distanceRemaining / 1000).toFixed(1)} km
                  </strong>
                </div>
              </div>

              <div className="hidden sm:block">
                <span className="text-[10px] text-[#5B6070] uppercase font-bold block">Handover Mode</span>
                <span className="text-xs font-semibold text-[#1B7A4E]">
                  Contactless Key Handover
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Vehicle & Delivery Rider Details (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Delivery Rider Card */}
          <div className="bg-white rounded-[12px] p-5 border border-[#E4DDD1] shadow-[0_2px_8px_rgba(15,31,61,0.06)] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E4DDD1]">
              <span className="text-xs font-bold text-[#5B6070] uppercase">Assigned Hub Rider</span>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-[#EBF7F0] text-[#1B7A4E] rounded-[4px]">
                Verified Pilot
              </span>
            </div>

            <div className="flex items-center gap-3">
              <img
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"
                alt="Rider"
                className="w-12 h-12 rounded-full object-cover border border-[#E4DDD1]"
              />
              <div>
                <h4 className="font-heading font-bold text-sm text-[#16181F]">Ramesh Naik</h4>
                <p className="text-xs text-[#5B6070]">Hub Fleet Marshal • 4.9 ★ (340 deliveries)</p>
              </div>
            </div>

            <a
              href="tel:+919876543210"
              className="w-full py-2.5 bg-[#FAF7F2] hover:bg-[#F3EEE6] text-[#0F1F3D] font-heading font-semibold text-xs rounded-[8px] border border-[#E4DDD1] flex items-center justify-center gap-2 transition-colors"
            >
              <PhoneCall size={14} />
              <span>Call Rider (+91 98765 43210)</span>
            </a>
          </div>

          {/* Reserved Vehicle Summary */}
          <div className="bg-white rounded-[12px] p-5 border border-[#E4DDD1] shadow-[0_2px_8px_rgba(15,31,61,0.06)] space-y-3">
            <span className="text-xs font-bold text-[#5B6070] uppercase block">Vehicle in Transit</span>
            <div className="flex items-center gap-3">
              <img
                src={vehicle.images[0]}
                alt={vehicle.model}
                className="w-16 h-12 object-cover rounded-[6px] border border-[#E4DDD1]"
              />
              <div>
                <h5 className="font-heading font-bold text-sm text-[#16181F]">{vehicle.model}</h5>
                <p className="text-xs text-[#5B6070]">{shop.name}</p>
              </div>
            </div>

            <div className="pt-2 border-t border-[#E4DDD1] text-xs text-[#5B6070] space-y-1">
              <div className="flex justify-between">
                <span>Pre-trip Condition:</span>
                <strong className="text-[#1B7A4E]">{vehicle.condition}</strong>
              </div>
              <div className="flex justify-between">
                <span>Included Gear:</span>
                <strong className="text-[#16181F]">2 ISI Helmets</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
