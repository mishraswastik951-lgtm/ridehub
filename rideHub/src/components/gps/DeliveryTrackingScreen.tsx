import React, { useState } from "react";
import { 
  ArrowLeft, 
  Phone, 
  MessageSquare, 
  Share2, 
  XCircle, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Key, 
  Play, 
  ChevronUp, 
  ChevronDown,
  AlertTriangle,
  Send,
  Copy,
  Check
} from "lucide-react";
import { LiveMap } from "./LiveMap";
import { DELIVERY_ROUTE_POINTS, MOCK_RIDER_INFO, GOA_DEMO_CITY } from "../../config/gpsConfig";
import { useMockMovement, DeliveryStatusStep } from "../../hooks/useMockMovement";

interface DeliveryTrackingScreenProps {
  onBack: () => void;
  onStartRide: () => void;
  onCancelBooking: () => { refundAmount: number; refundPercent: number };
  demoOptions?: {
    speedMultiplier?: number;
    isDelayed?: boolean;
    isGpsLost?: boolean;
  };
}

export const DeliveryTrackingScreen: React.FC<DeliveryTrackingScreenProps> = ({
  onBack,
  onStartRide,
  onCancelBooking,
  demoOptions,
}) => {
  const movement = useMockMovement({
    route: DELIVERY_ROUTE_POINTS,
    speedMultiplier: demoOptions?.speedMultiplier || 1,
    initialEtaMinutes: 12,
    initialDistanceKm: 5.4,
  });

  const [snapPoint, setSnapPoint] = useState<"peek" | "half" | "full">("half");
  const [showCallModal, setShowCallModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [chatMessages, setChatMessages] = useState<string[]>([
    "Hello! I am on my way with your Honda Activa 6G.",
    "Checking vehicle tyre pressure and fuel before arrival.",
  ]);
  const [chatInput, setChatInput] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);
  const [refundResult, setRefundResult] = useState<{ refundAmount: number; refundPercent: number } | null>(null);

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    setChatMessages((prev) => [...prev, `You: ${chatInput}`]);
    setChatInput("");
    setTimeout(() => {
      setChatMessages((prev) => [...prev, "Rider Ramesh: Got it! Arriving shortly."]);
    }, 1000);
  };

  const handleConfirmCancel = () => {
    const res = onCancelBooking();
    setRefundResult(res);
  };

  const handleCopyShareLink = () => {
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Status Stepper Items
  const steps: { key: DeliveryStatusStep; label: string }[] = [
    { key: "confirmed", label: "Confirmed" },
    { key: "rider_assigned", label: "Rider Assigned" },
    { key: "vehicle_prepared", label: "Vehicle Prepared" },
    { key: "on_the_way", label: "On the Way" },
    { key: "arrived", label: "Arrived" },
    { key: "handover", label: "Handover OTP" },
  ];

  const currentStepIndex = movement.isArrived
    ? 5
    : movement.stepIndex === 0
    ? 1
    : 3;

  return (
    <div className="relative w-full h-[calc(100vh-64px)] min-h-[600px] bg-[#FAF7F2] overflow-hidden flex flex-col">
      {/* Top Floating Bar */}
      <div className="absolute top-4 left-4 right-4 z-[400] flex items-center justify-between pointer-events-none">
        <button
          onClick={onBack}
          className="pointer-events-auto bg-[#0F1F3D] hover:bg-[#0A1529] text-white px-3.5 py-2 rounded-[8px] text-xs font-bold shadow-md flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>Back to Ride</span>
        </button>

        <div className="pointer-events-auto bg-white/95 backdrop-blur-xs border border-[#E4DDD1] shadow-md px-3.5 py-1.5 rounded-[20px] flex items-center gap-2 text-xs font-bold text-[#16181F]">
          <span className="w-2.5 h-2.5 rounded-full bg-[#2E9E6B] animate-pulse"></span>
          <span>{movement.isArrived ? "Rider Has Arrived" : "Doorstep Delivery Live"}</span>
        </div>
      </div>

      {/* Main Fullscreen Map */}
      <div className="flex-1 w-full relative">
        <LiveMap
          center={GOA_DEMO_CITY.center}
          zoom={13}
          shopLocation={DELIVERY_ROUTE_POINTS[0]}
          shopName="Panaji Central Hub"
          destinationLocation={DELIVERY_ROUTE_POINTS[DELIVERY_ROUTE_POINTS.length - 1]}
          destinationName="Calangute Delivery Point"
          vehicleLocation={movement.currentPos}
          vehicleHeading={movement.heading}
          vehicleType="scooty"
          vehicleModel="Honda Activa 6G (GA-03-X-4892)"
          traveledPath={movement.traveledPath}
          remainingPath={movement.remainingPath}
          height="100%"
          isGpsLost={movement.isGpsLost}
        />
      </div>

      {/* Draggable Bottom Sheet */}
      <div
        tabIndex={0}
        role="region"
        aria-label="Delivery Tracking Bottom Sheet"
        className={`absolute bottom-0 left-0 right-0 z-[500] bg-white border-t border-[#E4DDD1] rounded-t-[16px] shadow-[0_-4px_20px_rgba(15,31,61,0.12)] transition-all duration-300 ease-in-out flex flex-col ${
          snapPoint === "peek"
            ? "h-[140px]"
            : snapPoint === "half"
            ? "h-[390px]"
            : "h-[85vh]"
        }`}
      >
        {/* Drag Handle & Snap Controls */}
        <div
          onClick={() =>
            setSnapPoint((prev) =>
              prev === "peek" ? "half" : prev === "half" ? "full" : "peek"
            )
          }
          className="w-full py-2.5 flex items-center justify-center cursor-pointer hover:bg-[#FAF7F2] transition-colors border-b border-[#E4DDD1]/50 rounded-t-[16px]"
        >
          <div className="w-12 h-1.5 rounded-full bg-[#E4DDD1]"></div>
        </div>

        {/* Content Container */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* Delay Warning Banner */}
          {movement.isDelayed && !movement.isArrived && (
            <div className="p-4 rounded-[8px] bg-[#FFF8E6] border border-[#E8A317] text-[#0F1F3D] flex items-start justify-between gap-3 text-xs">
              <div className="flex items-start gap-2.5">
                <AlertTriangle size={18} className="text-[#E8A317] shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-bold">Traffic Delay Detected (+12 mins)</h5>
                  <p className="text-[#5B6070] mt-0.5">Heavy congestion near Sangolda bypass. Delivery ETA updated.</p>
                </div>
              </div>
              <button
                onClick={() => setShowCancelModal(true)}
                className="text-[11px] font-bold text-[#C8432F] underline hover:no-underline cursor-pointer shrink-0"
              >
                Cancel Ride
              </button>
            </div>
          )}

          {/* Arrived State & OTP Handover Card */}
          {movement.isArrived ? (
            <div className="p-5 rounded-[12px] bg-[#0F1F3D] text-white space-y-4 shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-[#E8A317] uppercase tracking-wider block">
                    VEHICLE ARRIVED AT DOORSTEP
                  </span>
                  <h3 className="font-heading font-bold text-lg text-white mt-0.5">
                    Handover 4-Digit Security OTP
                  </h3>
                </div>
                <div className="w-10 h-10 rounded-full bg-[#E8A317] text-[#0F1F3D] flex items-center justify-center font-bold text-lg">
                  <Key size={20} />
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 py-2 bg-[#0A1529] rounded-[8px] border border-[#1C2C4E]">
                <span className="text-xs text-[#B5C4E0]">Share this code with rider:</span>
                <span className="font-heading font-extrabold text-2xl text-[#E8A317] tracking-widest tabular-nums">
                  {movement.otp}
                </span>
              </div>

              <button
                onClick={onStartRide}
                className="w-full py-3 bg-[#2456D6] hover:bg-[#1B44AE] text-white font-heading font-bold text-sm rounded-[8px] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow"
              >
                <Play size={16} />
                <span>Verify OTP & Start Ride</span>
              </button>
            </div>
          ) : (
            /* Large ETA Header */
            <div className="flex items-center justify-between pb-3 border-b border-[#E4DDD1]">
              <div>
                <span className="eyebrow-label block mb-0.5">ESTIMATED DOORSTEP ARRIVAL</span>
                <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#16181F] tabular-nums">
                  Arriving in {movement.etaMinutes} mins
                </h2>
                <p className="text-xs text-[#5B6070] mt-0.5">
                  Rider is <span className="font-bold text-[#16181F] tabular-nums">{movement.distanceRemainingKm} km</span> away from destination
                </p>
              </div>
              <div className="w-12 h-12 rounded-[10px] bg-[#FAF7F2] border border-[#E4DDD1] flex items-center justify-center text-[#2456D6]">
                <Clock size={24} />
              </div>
            </div>
          )}

          {/* Status Stepper */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-[#5B6070] uppercase tracking-wider">
              Delivery Progress
            </h4>
            <div className="flex items-center justify-between relative py-2">
              <div className="absolute top-1/2 left-0 right-0 h-1 bg-[#E4DDD1] -translate-y-1/2 z-0"></div>
              <div
                className="absolute top-1/2 left-0 h-1 bg-[#2456D6] -translate-y-1/2 z-0 transition-all duration-500"
                style={{
                  width: `${(currentStepIndex / (steps.length - 1)) * 100}%`,
                }}
              ></div>

              {steps.map((s, idx) => {
                const isCompleted = idx <= currentStepIndex;
                const isCurrent = idx === currentStepIndex;
                return (
                  <div key={s.key} className="relative z-10 flex flex-col items-center">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                        isCompleted
                          ? "bg-[#2456D6] text-white border-2 border-white shadow"
                          : "bg-white text-[#5B6070] border-2 border-[#E4DDD1]"
                      } ${isCurrent ? "ring-4 ring-[#2456D6]/20 scale-110" : ""}`}
                    >
                      {isCompleted ? "✓" : idx + 1}
                    </div>
                    <span
                      className={`text-[10px] mt-1 font-semibold whitespace-nowrap ${
                        isCurrent ? "text-[#16181F] font-bold" : "text-[#5B6070]"
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Rider Card */}
          <div className="p-4 rounded-[12px] bg-[#FAF7F2] border border-[#E4DDD1] flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src={MOCK_RIDER_INFO.photoUrl}
                alt={MOCK_RIDER_INFO.name}
                className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-xs"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-heading font-bold text-sm text-[#16181F]">
                    {MOCK_RIDER_INFO.name}
                  </h4>
                  <span className="bg-[#E8A317] text-[#0F1F3D] text-[10px] font-extrabold px-1.5 py-0.2 rounded">
                    ★ {MOCK_RIDER_INFO.rating}
                  </span>
                </div>
                <p className="text-xs text-[#5B6070] mt-0.5">
                  Delivering <span className="font-semibold text-[#16181F]">{MOCK_RIDER_INFO.vehicleRegNo}</span>
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowCallModal(true)}
                className="w-9 h-9 rounded-[8px] bg-white border border-[#E4DDD1] hover:bg-[#F3EEE6] text-[#0F1F3D] flex items-center justify-center transition-colors cursor-pointer"
                title="Call Rider"
              >
                <Phone size={16} />
              </button>

              <button
                onClick={() => setShowChatModal(true)}
                className="w-9 h-9 rounded-[8px] bg-white border border-[#E4DDD1] hover:bg-[#F3EEE6] text-[#2456D6] flex items-center justify-center transition-colors cursor-pointer"
                title="Chat with Rider"
              >
                <MessageSquare size={16} />
              </button>
            </div>
          </div>

          {/* Bottom Action Row */}
          <div className="flex items-center justify-between pt-2 border-t border-[#E4DDD1] gap-3">
            <button
              onClick={() => setShowShareModal(true)}
              className="flex-1 py-2.5 bg-white border border-[#E4DDD1] hover:bg-[#FAF7F2] text-[#16181F] font-heading font-bold text-xs rounded-[8px] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Share2 size={14} />
              <span>Share Trip Link</span>
            </button>

            <button
              onClick={() => setShowCancelModal(true)}
              className="py-2.5 px-4 bg-white border border-[#C8432F]/30 hover:bg-[#FFF5F5] text-[#C8432F] font-heading font-bold text-xs rounded-[8px] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <XCircle size={14} />
              <span>Cancel</span>
            </button>
          </div>
        </div>
      </div>

      {/* Call Modal */}
      {showCallModal && (
        <div className="fixed inset-0 z-[1000] bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-[12px] p-6 max-w-sm w-full space-y-4 border border-[#E4DDD1]">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-full bg-[#FAF7F2] border-2 border-[#2456D6] mx-auto overflow-hidden">
                <img src={MOCK_RIDER_INFO.photoUrl} alt="Rider" className="w-full h-full object-cover" />
              </div>
              <h3 className="font-heading font-bold text-lg text-[#16181F]">{MOCK_RIDER_INFO.name}</h3>
              <p className="text-xs text-[#5B6070]">{MOCK_RIDER_INFO.phone}</p>
              <span className="inline-block bg-[#EBF7F1] text-[#1B7A4E] text-xs font-semibold px-2.5 py-0.5 rounded-full">
                Masked Number Protection Active
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowCallModal(false)}
                className="flex-1 py-2.5 bg-[#FAF7F2] border border-[#E4DDD1] text-[#16181F] font-bold text-xs rounded-[8px]"
              >
                Close
              </button>
              <a
                href={`tel:${MOCK_RIDER_INFO.phone}`}
                className="flex-1 py-2.5 bg-[#2E9E6B] hover:bg-[#258257] text-white font-bold text-xs rounded-[8px] text-center flex items-center justify-center gap-1.5"
              >
                <Phone size={14} />
                <span>Call Now</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Chat Modal */}
      {showChatModal && (
        <div className="fixed inset-0 z-[1000] bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-[12px] p-5 max-w-md w-full space-y-3 border border-[#E4DDD1] flex flex-col h-[420px]">
            <div className="flex items-center justify-between pb-3 border-b border-[#E4DDD1]">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#2E9E6B]"></div>
                <h3 className="font-heading font-bold text-sm text-[#16181F]">Chat with {MOCK_RIDER_INFO.name}</h3>
              </div>
              <button onClick={() => setShowChatModal(false)} className="text-[#5B6070] hover:text-[#16181F]">
                <XCircle size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 p-2 bg-[#FAF7F2] rounded-[8px] text-xs">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded-[8px] max-w-[85%] ${
                    msg.startsWith("You:")
                      ? "bg-[#0F1F3D] text-white ml-auto"
                      : "bg-white text-[#16181F] border border-[#E4DDD1]"
                  }`}
                >
                  {msg}
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Type instructions for delivery..."
                className="flex-1 px-3 py-2 text-xs border border-[#E4DDD1] rounded-[6px] focus:outline-none focus:border-[#0F1F3D]"
              />
              <button
                onClick={handleSendMessage}
                className="px-3 py-2 bg-[#2456D6] text-white rounded-[6px] text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Trip Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-[1000] bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-[12px] p-6 max-w-sm w-full space-y-4 border border-[#E4DDD1]">
            <h3 className="font-heading font-bold text-base text-[#16181F]">Share Live Delivery Tracking</h3>
            <p className="text-xs text-[#5B6070]">
              Anyone with this link can view the real-time position of your delivery rider without logging in.
            </p>
            <div className="p-2.5 bg-[#FAF7F2] rounded-[8px] border border-[#E4DDD1] flex items-center justify-between gap-2 text-xs">
              <span className="truncate text-[#2456D6] font-mono text-[11px]">https://ridehub.in/track/live-8f92a1</span>
              <button
                onClick={handleCopyShareLink}
                className="px-2.5 py-1 bg-[#0F1F3D] text-white font-bold rounded-[4px] text-[11px] shrink-0 flex items-center gap-1"
              >
                {copiedLink ? <Check size={12} /> : <Copy size={12} />}
                <span>{copiedLink ? "Copied!" : "Copy"}</span>
              </button>
            </div>
            <button
              onClick={() => setShowShareModal(false)}
              className="w-full py-2.5 bg-[#FAF7F2] border border-[#E4DDD1] text-[#16181F] font-bold text-xs rounded-[8px]"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Cancel Modal with Refund Calculation */}
      {showCancelModal && (
        <div className="fixed inset-0 z-[1000] bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-[12px] p-6 max-w-md w-full space-y-4 border border-[#E4DDD1]">
            <h3 className="font-heading font-bold text-lg text-[#16181F]">Cancel Doorstep Delivery?</h3>
            <p className="text-xs text-[#5B6070]">
              Cancelling during dispatch will apply standard policy refund rules based on time elapsed.
            </p>

            {refundResult ? (
              <div className="p-4 rounded-[8px] bg-[#EBF7F1] border border-[#2E9E6B] text-[#1B7A4E] space-y-2 text-xs">
                <div className="font-bold text-sm">Cancellation Processed</div>
                <p>
                  Refund amount of <span className="font-bold tabular-nums">₹{refundResult.refundAmount}</span> ({refundResult.refundPercent}% refund) has been initiated back to your payment source.
                </p>
                <button
                  onClick={onBack}
                  className="w-full mt-2 py-2 bg-[#0F1F3D] text-white font-bold rounded-[6px]"
                >
                  Return to Dashboard
                </button>
              </div>
            ) : (
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 py-2.5 bg-[#FAF7F2] border border-[#E4DDD1] text-[#16181F] font-bold text-xs rounded-[8px]"
                >
                  Keep Waiting
                </button>
                <button
                  onClick={handleConfirmCancel}
                  className="flex-1 py-2.5 bg-[#C8432F] hover:bg-[#A83422] text-white font-bold text-xs rounded-[8px] cursor-pointer"
                >
                  Confirm Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
