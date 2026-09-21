import React, { useState } from "react";
import { X, CheckCircle2, ShieldCheck, Video, RotateCw } from "lucide-react";
import { Vehicle } from "../../types";

interface WalkaroundModalProps {
  vehicle: Vehicle;
  onClose: () => void;
}

export const WalkaroundModal: React.FC<WalkaroundModalProps> = ({ vehicle, onClose }) => {
  const [selectedAngle, setSelectedAngle] = useState<"360" | "odometer" | "tyres" | "engine">("360");

  const videoSrc =
    vehicle.videoWalkaround ||
    vehicle.videoUrl ||
    "https://assets.mixkit.co/videos/preview/mixkit-motorcycle-parked-on-a-city-street-42512-large.mp4";

  return (
    <div
      className="fixed inset-0 bg-[#0A1529]/80 backdrop-blur-xs z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl bg-white rounded-[12px] overflow-hidden border border-[#E4DDD1] shadow-[0_12px_40px_rgba(15,31,61,0.25)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E4DDD1] bg-[#FAF7F2]">
          <div>
            <div className="flex items-center gap-2">
              <Video size={18} className="text-[#2456D6]" />
              <h3 className="font-heading font-bold text-base text-[#16181F]">
                Digital Walkaround Inspection
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-[#EBF7F0] text-[#1B7A4E] rounded-[4px] border border-[#2E9E6B]/30">
                Certified Handover
              </span>
            </div>
            <p className="text-xs text-[#5B6070] mt-0.5">
              {vehicle.model} ({vehicle.year}) • Recorded by certified hub technician
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-[6px] text-[#5B6070] hover:text-[#16181F] hover:bg-[#F3EEE6] cursor-pointer"
            aria-label="Close walkaround modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Video Canvas Container */}
        <div className="relative bg-black aspect-video">
          <video
            src={videoSrc}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          />

          <div className="absolute top-3 left-3 bg-[#0F1F3D]/85 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 backdrop-blur-xs border border-white/10">
            <RotateCw size={12} className="animate-spin" />
            <span>360° Walkaround View • Timestamp Verified</span>
          </div>
        </div>

        {/* Angle Selector */}
        <div className="flex gap-2 px-6 py-3 bg-[#FAF7F2] border-b border-[#E4DDD1] overflow-x-auto">
          {[
            { id: "360", label: "Exterior 360° Profile" },
            { id: "odometer", label: "Odometer & Fuel Level" },
            { id: "tyres", label: "Tyre Tread & Brakes" },
            { id: "engine", label: "Engine & Exhaust Health" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedAngle(tab.id as any)}
              className={`text-xs font-medium px-3 py-1.5 rounded-[6px] whitespace-nowrap cursor-pointer transition-colors ${
                selectedAngle === tab.id
                  ? "bg-[#0F1F3D] text-white"
                  : "bg-white text-[#5B6070] border border-[#E4DDD1] hover:bg-[#F3EEE6]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Checklist & Guarantee Footer */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-2 text-[#16181F]">
              <CheckCircle2 size={16} className="text-[#1B7A4E] shrink-0" />
              <span>Zero Pre-existing Body Dents or Hidden Defects</span>
            </div>
            <div className="flex items-center gap-2 text-[#16181F]">
              <CheckCircle2 size={16} className="text-[#1B7A4E] shrink-0" />
              <span>Tank / Battery Handover Level Certified</span>
            </div>
            <div className="flex items-center gap-2 text-[#16181F]">
              <CheckCircle2 size={16} className="text-[#1B7A4E] shrink-0" />
              <span>Brakes & ABS Hydraulics Safety Checked</span>
            </div>
            <div className="flex items-center gap-2 text-[#16181F]">
              <CheckCircle2 size={16} className="text-[#1B7A4E] shrink-0" />
              <span>Sanitized ISI Certified Helmets Included</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#E4DDD1]">
            <div className="flex items-center gap-2 text-xs text-[#5B6070]">
              <ShieldCheck size={16} className="text-[#1B7A4E] shrink-0" />
              <span>HubX Escrow Rule: No unfair damage deduction without walkaround video proof.</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2 bg-[#0F1F3D] hover:bg-[#0A1529] text-white font-heading font-semibold text-xs rounded-[8px] transition-colors cursor-pointer"
            >
              Done & Return
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
