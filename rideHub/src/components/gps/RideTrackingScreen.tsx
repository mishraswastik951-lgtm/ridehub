import React, { useState } from "react";
import { 
  ArrowLeft, 
  Clock, 
  Navigation, 
  AlertTriangle, 
  Share2, 
  PlusCircle, 
  ShieldCheck,
  Compass,
  Gauge,
  Check,
  Copy
} from "lucide-react";
import { LiveMap } from "./LiveMap";
import { ACTIVE_RIDE_ROUTE_POINTS, GOA_DEMO_CITY } from "../../config/gpsConfig";
import { useMockMovement } from "../../hooks/useMockMovement";

interface RideTrackingScreenProps {
  onBack: () => void;
  onExtendRideClick: () => void;
  demoOptions?: {
    speedMultiplier?: number;
    isOverdue?: boolean;
    isGpsLost?: boolean;
  };
}

export const RideTrackingScreen: React.FC<RideTrackingScreenProps> = ({
  onBack,
  onExtendRideClick,
  demoOptions,
}) => {
  const movement = useMockMovement({
    route: ACTIVE_RIDE_ROUTE_POINTS,
    speedMultiplier: demoOptions?.speedMultiplier || 1,
    initialEtaMinutes: 145, // ~2 hours 25 mins remaining
    initialDistanceKm: 18.2,
  });

  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [liveLocationEnabled, setLiveLocationEnabled] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);

  const isOverdue = demoOptions?.isOverdue || movement.isOverdue;
  const isNearEnd = movement.etaMinutes <= 15 && !isOverdue;

  // Speedometer angle calculation (-120deg to +120deg)
  const remainingHours = Math.floor(movement.etaMinutes / 60);
  const remainingMins = movement.etaMinutes % 60;
  const needleAngle = Math.min(120, Math.max(-120, ((180 - movement.etaMinutes) / 180) * 240 - 120));

  const handleCopyLink = () => {
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="relative w-full h-[calc(100vh-64px)] min-h-[600px] bg-[#FAF7F2] overflow-hidden flex flex-col">
      {/* Top Overlay Controls & Stats Bar */}
      <div className="absolute top-4 left-4 right-4 z-[400] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pointer-events-none">
        <button
          onClick={onBack}
          className="pointer-events-auto bg-[#0F1F3D] hover:bg-[#0A1529] text-white px-3.5 py-2 rounded-[8px] text-xs font-bold shadow-md flex items-center gap-1.5 self-start transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>Back to Ride Dashboard</span>
        </button>

        {/* Small Live Stats Bar */}
        <div className="pointer-events-auto bg-white/95 backdrop-blur-xs border border-[#E4DDD1] shadow-md p-2.5 rounded-[12px] flex items-center justify-around gap-4 text-xs">
          <div className="flex items-center gap-2">
            <Compass size={16} className="text-[#2456D6]" />
            <div>
              <span className="text-[10px] text-[#5B6070] block uppercase font-bold">Traveled</span>
              <span className="font-heading font-extrabold text-[#16181F] tabular-nums">
                {movement.distanceTravelledKm} km
              </span>
            </div>
          </div>

          <div className="w-[1px] h-6 bg-[#E4DDD1]"></div>

          <div className="flex items-center gap-2">
            <Clock size={16} className="text-[#E8A317]" />
            <div>
              <span className="text-[10px] text-[#5B6070] block uppercase font-bold">Time Left</span>
              <span className="font-heading font-extrabold text-[#16181F] tabular-nums">
                {remainingHours}h {remainingMins}m
              </span>
            </div>
          </div>

          <div className="w-[1px] h-6 bg-[#E4DDD1]"></div>

          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2E9E6B] animate-pulse"></span>
            <span className="font-bold text-[#1B7A4E] text-[11px]">Geofence Safe</span>
          </div>
        </div>
      </div>

      {/* Main Map with Vehicle, Trail & Geofence Circle */}
      <div className="flex-1 w-full relative">
        <LiveMap
          center={ACTIVE_RIDE_ROUTE_POINTS[0]}
          zoom={13}
          shopLocation={ACTIVE_RIDE_ROUTE_POINTS[ACTIVE_RIDE_ROUTE_POINTS.length - 1]}
          shopName="Calangute Return Station"
          vehicleLocation={movement.currentPos}
          vehicleHeading={movement.heading}
          vehicleType="bike"
          vehicleModel="Royal Enfield Hunter 350 (GA-01-E-7721)"
          traveledPath={movement.traveledPath}
          remainingPath={movement.remainingPath}
          geofenceCenter={ACTIVE_RIDE_ROUTE_POINTS[ACTIVE_RIDE_ROUTE_POINTS.length - 1]}
          geofenceRadiusMeters={5000}
          height="100%"
          isGpsLost={movement.isGpsLost}
        />
      </div>

      {/* Bottom Sheet - Speedometer Ride Timer & Controls */}
      <div className="z-[500] bg-white border-t border-[#E4DDD1] rounded-t-[16px] shadow-[0_-4px_20px_rgba(15,31,61,0.12)] p-5 space-y-4">
        {/* Overdue Warning Alert Banner */}
        {isOverdue && (
          <div className="p-4 rounded-[10px] bg-[#FFF5F5] border border-[#C8432F] text-[#C8432F] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-sm">
            <div className="flex items-start gap-2.5">
              <AlertTriangle size={20} className="shrink-0 mt-0.5 text-[#C8432F]" />
              <div>
                <h5 className="font-bold text-sm">Ride Return Time Overdue!</h5>
                <p className="text-[#5B6070] mt-0.5">
                  The scheduled return window has passed. Extend your rental time now to prevent overdue penalty charges.
                </p>
              </div>
            </div>
            <button
              onClick={onExtendRideClick}
              className="w-full sm:w-auto px-4 py-2.5 bg-[#C8432F] hover:bg-[#A83422] text-white font-bold text-xs rounded-[8px] transition-colors shrink-0 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <PlusCircle size={15} />
              <span>Extend Time Now</span>
            </button>
          </div>
        )}

        {/* 15 Mins Left Nudge Banner */}
        {isNearEnd && (
          <div className="p-3.5 rounded-[10px] bg-[#FFF8E6] border border-[#E8A317] text-[#0F1F3D] flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-[#E8A317]" />
              <span className="font-bold">15 minutes remaining before return deadline!</span>
            </div>
            <button
              onClick={onExtendRideClick}
              className="px-3 py-1.5 bg-[#0F1F3D] text-white font-bold text-[11px] rounded-[6px]"
            >
              Extend
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          {/* Speedometer Gauge Dial Widget */}
          <div className="flex flex-col items-center justify-center p-3 bg-[#FAF7F2] rounded-[12px] border border-[#E4DDD1]">
            <span className="eyebrow-label block mb-1">RIDE TIMER SPEEDOMETER</span>
            <div className="relative w-36 h-20 overflow-hidden flex items-end justify-center">
              <div className="w-32 h-32 rounded-full border-[10px] border-[#E4DDD1] border-b-transparent border-l-transparent transform -rotate-45"></div>
              {/* Needle */}
              <div
                className="absolute bottom-0 w-1 h-14 bg-[#0F1F3D] origin-bottom transition-transform duration-700 ease-out"
                style={{ transform: `rotate(${needleAngle}deg)` }}
              >
                <div className="w-3 h-3 rounded-full bg-[#E8A317] -ml-1 -mt-1 border border-white"></div>
              </div>
            </div>
            <div className="text-center mt-1">
              <span className="font-heading font-extrabold text-xl text-[#16181F] tabular-nums">
                {remainingHours}h {remainingMins}m
              </span>
              <span className="text-[10px] text-[#5B6070] block">Remaining Duration</span>
            </div>
          </div>

          {/* Details & Telemetry Card */}
          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-[8px] bg-[#FAF7F2] border border-[#E4DDD1] space-y-1.5">
              <div className="flex items-center justify-between text-[#5B6070]">
                <span>Allowed Boundary:</span>
                <span className="font-bold text-[#16181F]">5 km Coastal Radius</span>
              </div>
              <div className="flex items-center justify-between text-[#5B6070]">
                <span>Speed Telemetry:</span>
                <span className="font-bold text-[#16181F] tabular-nums">38 km/h</span>
              </div>
              <div className="flex items-center justify-between text-[#5B6070]">
                <span>Return Station:</span>
                <span className="font-bold text-[#16181F]">Calangute Main Hub</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-2 bg-[#EBF7F1] border border-[#2E9E6B]/40 rounded-[8px] text-[11px] text-[#1B7A4E]">
              <div className="flex items-center gap-1.5">
                <ShieldCheck size={14} />
                <span className="font-semibold">GPS Telemetry Encrypted</span>
              </div>
              <span>24/7 Roadside Assistance</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 flex flex-col justify-center">
            <button
              onClick={onExtendRideClick}
              className="w-full py-3 bg-[#E8A317] hover:bg-[#D99614] text-[#0F1F3D] font-heading font-extrabold text-xs uppercase tracking-wider rounded-[8px] transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs"
            >
              <PlusCircle size={16} />
              <span>Extend Rental Duration</span>
            </button>

            <button
              onClick={() => setShareModalOpen(true)}
              className="w-full py-2.5 bg-white border border-[#E4DDD1] hover:bg-[#FAF7F2] text-[#16181F] font-heading font-bold text-xs rounded-[8px] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Share2 size={14} />
              <span>Share Live Location Link</span>
            </button>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {shareModalOpen && (
        <div className="fixed inset-0 z-[1000] bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-[12px] p-6 max-w-sm w-full space-y-4 border border-[#E4DDD1]">
            <h3 className="font-heading font-bold text-base text-[#16181F]">Share Live Ride Location</h3>
            <p className="text-xs text-[#5B6070]">
              Send your real-time vehicle position to friends or family for roadside safety monitoring.
            </p>

            <div className="flex items-center justify-between p-3 bg-[#FAF7F2] rounded-[8px] border border-[#E4DDD1] text-xs">
              <span>Enable Public Live Link:</span>
              <button
                onClick={() => setLiveLocationEnabled((prev) => !prev)}
                className={`w-10 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
                  liveLocationEnabled ? "bg-[#2E9E6B]" : "bg-[#E4DDD1]"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    liveLocationEnabled ? "translate-x-5" : "translate-x-0"
                  }`}
                ></div>
              </button>
            </div>

            {liveLocationEnabled && (
              <div className="p-2.5 bg-[#FAF7F2] rounded-[8px] border border-[#E4DDD1] flex items-center justify-between gap-2 text-xs">
                <span className="truncate text-[#2456D6] font-mono text-[11px]">
                  https://ridehub.in/ride/live-ga01e7721
                </span>
                <button
                  onClick={handleCopyLink}
                  className="px-2.5 py-1 bg-[#0F1F3D] text-white font-bold rounded-[4px] text-[11px] shrink-0 flex items-center gap-1"
                >
                  {copiedLink ? <Check size={12} /> : <Copy size={12} />}
                  <span>{copiedLink ? "Copied!" : "Copy"}</span>
                </button>
              </div>
            )}

            <button
              onClick={() => setShareModalOpen(false)}
              className="w-full py-2.5 bg-[#FAF7F2] border border-[#E4DDD1] text-[#16181F] font-bold text-xs rounded-[8px]"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
