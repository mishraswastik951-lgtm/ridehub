import React, { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { formatINR, formatDateTime, calculateRefund } from "../../utils/formatters";
import confetti from "canvas-confetti";
import { 
  Clock, 
  PlusCircle, 
  AlertTriangle, 
  CheckCircle2, 
  MapPin, 
  RotateCcw, 
  Star, 
  X,
  CreditCard,
  Gift,
  Gauge
} from "lucide-react";

interface ActiveRidesPageProps {
  onNavigate: (route: string) => void;
  onSelectVehicle: (vehicleId: string) => void;
  currentRoute?: string;
}

export const ActiveRidesPage: React.FC<ActiveRidesPageProps> = ({ onNavigate, onSelectVehicle }) => {
  const { bookings, extendRide, cancelBooking, returnRide, vehicles, shops } = useApp();
  const [now, setNow] = useState(Date.now());
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);

  // Modals state
  const [isExtendModalOpen, setIsExtendModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  
  // Extension config
  const [extendChoice, setExtendChoice] = useState<number>(60); // in mins
  const [extendFeedback, setExtendFeedback] = useState<{ success?: boolean; message?: string; blocked?: boolean; replacementVehicle?: any } | null>(null);

  // Return & Review state
  const [returnRating, setReturnRating] = useState(5);
  const [returnReview, setReturnReview] = useState("Vehicle delivered clean and drove smoothly!");

  // Timer ticker
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const activeBookings = bookings.filter((b) => b.status === "active");
  const pastBookings = bookings.filter((b) => b.status === "completed" || b.status === "cancelled");

  const currentActiveBooking = activeBookings.find((b) => b.id === (selectedBookingId || activeBookings[0]?.id)) || activeBookings[0];
  const activeVehicle = currentActiveBooking ? vehicles.find((v) => v.id === currentActiveBooking.vehicleId) : null;
  const activeShop = currentActiveBooking ? shops.find((s) => s.id === currentActiveBooking.shopId) : null;

  // Countdown timer calculations
  let timeLeftMs = 0;
  let totalDurationMs = 1;
  let isOverdue = false;
  let progressPercent = 0;

  if (currentActiveBooking) {
    const pickupTime = new Date(currentActiveBooking.pickupAt).getTime();
    const returnTime = new Date(currentActiveBooking.returnAt).getTime();
    totalDurationMs = Math.max(returnTime - pickupTime, 1);
    timeLeftMs = returnTime - now;
    isOverdue = timeLeftMs < 0;
    const elapsed = now - pickupTime;
    progressPercent = Math.min(Math.max(elapsed / totalDurationMs, 0), 1);
  }

  const formatCountdown = (ms: number) => {
    if (ms <= 0) return "00:00:00 (Overdue)";
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const mins = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((ms % (1000 * 60)) / 1000);
    return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Speedometer Needle Angle Calculation (-120 deg to +120 deg)
  const needleAngle = -120 + (progressPercent * 240);

  const handleConfirmExtension = () => {
    if (!currentActiveBooking || !activeVehicle) return;
    const hourlyCost = activeVehicle.pricePerHour;
    const calculatedCost = Math.round((extendChoice / 60) * hourlyCost);

    const res = extendRide(currentActiveBooking.id, extendChoice, calculatedCost);
    setExtendFeedback(res);

    if (res.success) {
      confetti({ particleCount: 60, spread: 50, origin: { y: 0.6 } });
      setTimeout(() => {
        setIsExtendModalOpen(false);
        setExtendFeedback(null);
      }, 1600);
    }
  };

  const handleConfirmReturn = () => {
    if (!currentActiveBooking) return;
    returnRide(currentActiveBooking.id, returnRating, returnReview);
    setIsReturnModalOpen(false);
    confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[#E4DDD1]">
        <div>
          <span className="eyebrow-label block mb-1">RIDE TELEMETRY & DISPATCH</span>
          <h1 className="font-heading font-bold text-2xl sm:text-3xl text-[#16181F]">
            My Rides & Active Ride Meter
          </h1>
          <p className="text-xs sm:text-sm text-[#5B6070] mt-1">
            Real-time duration countdown meter, 1-click extension slabs, and automated deposit release.
          </p>
        </div>

        {activeBookings.length > 0 && (
          <div className="verified-seal">
            <CheckCircle2 size={13} /> {activeBookings.length} ACTIVE RENTAL ONGOING
          </div>
        )}
      </div>

      {/* Active Rental Showcase */}
      {currentActiveBooking && activeVehicle && activeShop ? (
        <div className="bg-white rounded-[12px] border border-[#E4DDD1] shadow-[0_1px_2px_rgba(15,31,61,0.06)] overflow-hidden">
          {/* Header Bar */}
          <div className="bg-[#FAF7F2] p-4 sm:p-5 border-b border-[#E4DDD1] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="bg-[#E8A317] text-[#0F1F3D] text-[10px] font-black px-2 py-0.5 rounded-[4px] uppercase tracking-wider">
                HUBX CERTIFIED RIDE
              </span>
              <span className="text-xs font-semibold text-[#16181F]">
                Reservation #{currentActiveBooking.id.slice(-6).toUpperCase()}
              </span>
            </div>

            <div className="text-xs text-[#5B6070]">
              Garage Operator: <strong className="text-[#16181F] font-semibold">{activeShop.name}</strong>
            </div>
          </div>

          <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Speedometer-Style Circular Ride Timer (Left 6 cols) */}
            <div className="lg:col-span-6 flex flex-col items-center justify-center p-6 bg-[#FAF7F2] rounded-[12px] border border-[#E4DDD1]">
              <div className="relative w-64 h-56 flex items-center justify-center select-none">
                {/* Gauge SVG */}
                <svg className="w-full h-full" viewBox="0 0 240 200">
                  {/* Outer ticks */}
                  <circle cx="120" cy="120" r="84" fill="none" stroke="#E4DDD1" strokeWidth="12" strokeDasharray="2 10" />
                  
                  {/* Gauge Arc Track: 240 degrees arc */}
                  <path
                    d="M 45 165 A 84 84 0 1 1 195 165"
                    fill="none"
                    stroke="#E4DDD1"
                    strokeWidth="14"
                    strokeLinecap="round"
                  />

                  {/* Dynamic Progress Arc */}
                  <path
                    d="M 45 165 A 84 84 0 1 1 195 165"
                    fill="none"
                    stroke={isOverdue ? "#C8432F" : "#2456D6"}
                    strokeWidth="14"
                    strokeLinecap="round"
                    strokeDasharray="377"
                    strokeDashoffset={`${377 * (1 - progressPercent)}`}
                    className="transition-all duration-700 ease-out"
                  />

                  {/* Center Hub */}
                  <circle cx="120" cy="120" r="10" fill="#0F1F3D" />
                  <circle cx="120" cy="120" r="4" fill="#FFFFFF" />

                  {/* Speedometer Needle */}
                  <line
                    x1="120"
                    y1="120"
                    x2="120"
                    y2="52"
                    stroke="#0F1F3D"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    transform={`rotate(${needleAngle} 120 120)`}
                    className="transition-transform duration-500 ease-out origin-center"
                  />
                </svg>

                {/* Dial Center Label */}
                <div className="absolute bottom-2 text-center">
                  <span className="text-[10px] font-bold text-[#5B6070] uppercase tracking-widest block">
                    TIME REMAINING
                  </span>
                  <p className="font-heading font-extrabold text-2xl text-[#16181F] tabular-nums tracking-tight mt-0.5">
                    {formatCountdown(timeLeftMs)}
                  </p>
                  <span className="text-[10px] text-[#5B6070] font-medium">
                    Deadline: {formatDateTime(currentActiveBooking.returnAt)}
                  </span>
                </div>
              </div>

              {isOverdue && (
                <div className="mt-3 p-2.5 bg-[#FAF7F2] border border-[#C8432F] rounded-[6px] text-xs text-[#C8432F] flex items-center gap-2">
                  <AlertTriangle size={15} />
                  <span>Rental deadline overdue. Standard ₹150/hr extension fee applies.</span>
                </div>
              )}
            </div>

            {/* Vehicle Details & Action Buttons (Right 6 cols) */}
            <div className="lg:col-span-6 space-y-5">
              <div>
                <span className="eyebrow-label block mb-1">CURRENTLY DEPLOYED VEHICLE</span>
                <h2 className="font-heading font-bold text-2xl sm:text-3xl text-[#16181F]">
                  {activeVehicle.model}
                </h2>
                <p className="text-xs text-[#5B6070] mt-1 flex items-center gap-1.5">
                  <MapPin size={13} className="text-[#2456D6]" />
                  <span>Handover Hub: <strong className="text-[#16181F]">{activeShop.address}</strong></span>
                </p>
              </div>

              {/* Quick Trip Ledger Pass */}
              <div className="p-4 bg-[#FAF7F2] rounded-[8px] border border-[#E4DDD1] space-y-2 text-xs">
                <div className="flex justify-between text-[#5B6070]">
                  <span>Trip Commenced:</span>
                  <strong className="text-[#16181F] font-medium tabular-nums">{formatDateTime(currentActiveBooking.pickupAt)}</strong>
                </div>
                <div className="flex justify-between text-[#5B6070]">
                  <span>Security Deposit Held:</span>
                  <strong className="text-[#1B7A4E] font-semibold tabular-nums">{formatINR(currentActiveBooking.deposit)} (Protected)</strong>
                </div>
                <div className="flex justify-between text-[#5B6070]">
                  <span>Total Paid at Booking:</span>
                  <strong className="text-[#16181F] font-semibold tabular-nums">{formatINR(currentActiveBooking.total)}</strong>
                </div>
                {currentActiveBooking.delivery && (
                  <div className="flex justify-between text-[#2456D6] pt-1 border-t border-[#E4DDD1]">
                    <span>Doorstep Delivery Address:</span>
                    <strong className="text-[#16181F] truncate max-w-[200px]">{currentActiveBooking.deliveryAddress}</strong>
                  </div>
                )}
              </div>

              {/* Action Buttons: Extend, Return, Cancel, AI Inspection */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                {/* Amber Key CTA for Active Screen: Extend Ride */}
                <button
                  onClick={() => setIsExtendModalOpen(true)}
                  className="px-4 py-2.5 bg-[#E8A317] hover:bg-[#D99614] text-[#0F1F3D] font-heading font-bold text-xs sm:text-sm rounded-[8px] transition-colors duration-200 flex items-center gap-2 cursor-pointer"
                >
                  <PlusCircle size={15} />
                  <span>Extend Ride Time (+1hr / +2hr)</span>
                </button>

                {/* AI Damage Inspection Buttons */}
                <button
                  onClick={() => onNavigate(`/rides/${currentActiveBooking.id}/inspect/pickup`)}
                  className="px-4 py-2.5 bg-[#132A24] hover:bg-[#1E4D38] text-[#2E9E6B] border border-[#1E4D38] font-heading font-bold text-xs sm:text-sm rounded-[8px] transition-colors duration-200 flex items-center gap-2 cursor-pointer"
                >
                  <Gauge size={15} />
                  <span>Pickup AI Damage Scan</span>
                </button>

                <button
                  onClick={() => onNavigate(`/rides/${currentActiveBooking.id}/inspect/return`)}
                  className="px-4 py-2.5 bg-[#2456D6] hover:bg-[#1D44AA] text-white font-heading font-bold text-xs sm:text-sm rounded-[8px] transition-colors duration-200 flex items-center gap-2 cursor-pointer"
                >
                  <Gauge size={15} />
                  <span>Return AI Damage Scan</span>
                </button>

                <button
                  onClick={() => setIsReturnModalOpen(true)}
                  className="px-4 py-2.5 bg-[#0F1F3D] hover:bg-[#0A1529] text-white font-heading font-semibold text-xs sm:text-sm rounded-[8px] transition-colors duration-200 flex items-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 size={15} />
                  <span>Complete Return & Refund Deposit</span>
                </button>

                <button
                  onClick={() => setIsCancelModalOpen(true)}
                  className="px-3.5 py-2.5 bg-transparent hover:bg-[#FAF7F2] text-[#5B6070] hover:text-[#16181F] font-semibold text-xs rounded-[8px] border border-[#E4DDD1] transition-colors duration-200 cursor-pointer"
                >
                  <span>Cancellation Matrix</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-[12px] p-12 text-center border border-[#E4DDD1] space-y-3">
          <Clock size={40} className="mx-auto text-[#5B6070]" />
          <h3 className="font-heading font-bold text-lg text-[#16181F]">No Active Rental Found</h3>
          <p className="text-xs text-[#5B6070]">Pick a vehicle from our verified fleet to start your trip with live meter tracking.</p>
          <button
            onClick={() => onNavigate("/explore")}
            className="px-5 py-2.5 bg-[#0F1F3D] text-white font-semibold text-xs rounded-[8px] cursor-pointer"
          >
            Explore Available Fleet
          </button>
        </div>
      )}

      {/* Past / Completed Rides History */}
      <div className="space-y-4 pt-4">
        <span className="eyebrow-label block mb-1">PAST RECORDS</span>
        <h3 className="font-heading font-bold text-xl text-[#16181F]">Rental History & Deposit Slips</h3>

        <div className="space-y-3">
          {pastBookings.map((b) => {
            const v = vehicles.find((veh) => veh.id === b.vehicleId);
            return (
              <div
                key={b.id}
                className="bg-white rounded-[8px] p-4 border border-[#E4DDD1] shadow-[0_1px_2px_rgba(15,31,61,0.06)] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-[6px] flex items-center justify-center font-bold text-xs ${
                    b.status === "completed" ? "bg-[#EBF7F0] text-[#1B7A4E]" : "bg-[#FAF7F2] text-[#C8432F] border border-[#E4DDD1]"
                  }`}>
                    {b.status === "completed" ? "✓" : "✕"}
                  </div>
                  <div>
                    <h4 className="font-heading font-bold text-sm text-[#16181F]">
                      {v?.model || "Rental Vehicle"}
                    </h4>
                    <p className="text-xs text-[#5B6070] tabular-nums">
                      {formatDateTime(b.pickupAt)} • Paid {formatINR(b.total)} • Status: {b.status}
                    </p>
                  </div>
                </div>

                <div className="text-right text-xs">
                  <span className="text-[#1B7A4E] font-semibold tabular-nums block">
                    Deposit {formatINR(b.deposit)} Released
                  </span>
                  <span className="text-[#5B6070] text-[11px]">No Disputes</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Extend Ride Modal */}
      {isExtendModalOpen && currentActiveBooking && activeVehicle && (
        <div className="fixed inset-0 z-50 bg-[#0F1F3D]/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-[12px] max-w-md w-full p-6 border border-[#E4DDD1] shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-[#E4DDD1] pb-3">
              <div className="flex items-center gap-2">
                <PlusCircle size={16} className="text-[#0F1F3D]" />
                <h4 className="font-heading font-bold text-base text-[#16181F]">Extend Ride Duration</h4>
              </div>
              <button
                onClick={() => setIsExtendModalOpen(false)}
                className="text-[#5B6070] hover:text-[#16181F] cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-[#5B6070]">
              Extend your reservation directly with the garage. Pricing is calculated at your base rate of <strong className="text-[#16181F] tabular-nums">{formatINR(activeVehicle.pricePerHour)}/hr</strong>.
            </p>

            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "+1 Hour", mins: 60 },
                { label: "+2 Hours", mins: 120 },
                { label: "+4 Hours", mins: 240 },
              ].map((opt) => (
                <button
                  key={opt.mins}
                  onClick={() => setExtendChoice(opt.mins)}
                  className={`py-2.5 rounded-[6px] text-xs font-semibold border transition-colors cursor-pointer tabular-nums ${
                    extendChoice === opt.mins
                      ? "bg-[#0F1F3D] text-white border-[#0F1F3D]"
                      : "bg-[#FAF7F2] text-[#16181F] border-[#E4DDD1] hover:bg-[#F3EEE6]"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="p-3 bg-[#FAF7F2] rounded-[6px] border border-[#E4DDD1] text-xs flex justify-between">
              <span className="text-[#5B6070]">Extension Charge:</span>
              <strong className="text-[#16181F] font-bold tabular-nums">
                {formatINR(Math.round((extendChoice / 60) * activeVehicle.pricePerHour))}
              </strong>
            </div>

            {extendFeedback && (
              <div className={`p-3 rounded-[6px] text-xs ${
                extendFeedback.success ? "bg-[#EBF7F0] text-[#1B7A4E]" : "bg-red-50 text-[#C8432F]"
              }`}>
                {extendFeedback.message}
              </div>
            )}

            <button
              onClick={handleConfirmExtension}
              className="w-full py-3 bg-[#E8A317] hover:bg-[#D99614] text-[#0F1F3D] font-heading font-bold text-sm rounded-[8px] transition-colors duration-200 cursor-pointer"
            >
              Pay via UPI & Confirm Extension
            </button>
          </div>
        </div>
      )}

      {/* Return Ride Modal */}
      {isReturnModalOpen && currentActiveBooking && (
        <div className="fixed inset-0 z-50 bg-[#0F1F3D]/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-[12px] max-w-md w-full p-6 border border-[#E4DDD1] shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-[#E4DDD1] pb-3">
              <h4 className="font-heading font-bold text-base text-[#16181F]">Confirm Vehicle Handover</h4>
              <button
                onClick={() => setIsReturnModalOpen(false)}
                className="text-[#5B6070] hover:text-[#16181F] cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-[#5B6070]">
              Hand over vehicle keys to the garage operator. Once verified, your deposit of <strong className="text-[#1B7A4E] tabular-nums">{formatINR(currentActiveBooking.deposit)}</strong> will be unlocked immediately.
            </p>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#16181F]">Operator Service Rating:</label>
              <div className="flex items-center gap-1 text-[#E8A317]">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={20}
                    onClick={() => setReturnRating(star)}
                    className={`cursor-pointer ${star <= returnRating ? "fill-[#E8A317]" : "text-[#E4DDD1]"}`}
                  />
                ))}
              </div>
            </div>

            <textarea
              value={returnReview}
              onChange={(e) => setReturnReview(e.target.value)}
              rows={2}
              className="w-full p-2.5 bg-[#FAF7F2] border border-[#E4DDD1] rounded-[6px] text-xs text-[#16181F] focus:outline-none"
              placeholder="Leave brief feedback on fuel, condition, or punctuality..."
            />

            <button
              onClick={handleConfirmReturn}
              className="w-full py-3 bg-[#0F1F3D] hover:bg-[#0A1529] text-white font-heading font-bold text-sm rounded-[8px] transition-colors duration-200 cursor-pointer"
            >
              Confirm Handover & Release Deposit
            </button>
          </div>
        </div>
      )}

      {/* Cancellation Matrix Modal */}
      {isCancelModalOpen && currentActiveBooking && (
        <div className="fixed inset-0 z-50 bg-[#0F1F3D]/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-[12px] max-w-md w-full p-6 border border-[#E4DDD1] shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-[#E4DDD1] pb-3">
              <h4 className="font-heading font-bold text-base text-[#16181F]">HubX Cancellation Policy</h4>
              <button
                onClick={() => setIsCancelModalOpen(false)}
                className="text-[#5B6070] hover:text-[#16181F] cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-3 bg-[#FAF7F2] rounded-[6px] border border-[#E4DDD1] space-y-1.5 text-xs text-[#5B6070]">
              <p>• <strong>100% Refund:</strong> If cancelled within 25% of elapsed trip time.</p>
              <p>• <strong>50% Refund:</strong> If cancelled within 50% of elapsed trip time.</p>
              <p>• <strong>0% Rental Refund:</strong> If cancelled after 50% time elapsed.</p>
              <p className="text-[#1B7A4E] pt-1">✓ <strong>Deposit:</strong> Always 100% returned immediately.</p>
            </div>

            <button
              onClick={() => {
                cancelBooking(currentActiveBooking.id);
                setIsCancelModalOpen(false);
              }}
              className="w-full py-2.5 bg-transparent hover:bg-red-50 text-[#C8432F] font-semibold text-xs rounded-[8px] border border-[#C8432F] transition-colors cursor-pointer"
            >
              Cancel Current Active Booking
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
