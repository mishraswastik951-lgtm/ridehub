import React, { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { TrustBreakdown } from "../../types";

interface TrustScoreBadgeProps {
  score: number;
  breakdown?: TrustBreakdown;
  size?: "sm" | "md" | "lg";
  onViewShopProfile?: () => void;
}

export const TrustScoreBadge: React.FC<TrustScoreBadgeProps> = ({
  score,
  breakdown = { honesty: 99.2, vehicleCondition: 98.4, punctuality: 98.8, communication: 99.4 },
  size = "md",
  onViewShopProfile,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={`inline-flex items-center gap-1.5 font-bold rounded-[4px] border border-[#1E4D38] bg-[#132A24] text-[#2E9E6B] cursor-pointer transition-colors ${
          size === "sm"
            ? "px-1.5 py-0.5 text-[10px]"
            : size === "lg"
            ? "px-3 py-1 text-sm"
            : "px-2 py-0.5 text-xs"
        }`}
        title="Click to view 4-pillar trust breakdown"
      >
        <ShieldCheck size={size === "sm" ? 12 : size === "lg" ? 16 : 14} />
        <span className="tabular-nums font-extrabold">{score.toFixed(1)}</span>
        <span className="opacity-90 font-medium text-[0.85em]">Trust</span>
      </button>

      {isOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute bottom-[calc(100%+8px)] left-0 w-72 bg-white rounded-[10px] shadow-[0_8px_24px_rgba(15,31,61,0.18)] border border-[#E4DDD1] p-4 z-50 text-xs text-[#16181F] space-y-3"
        >
          <div className="flex items-center justify-between border-b border-[#E4DDD1] pb-2">
            <div className="flex items-center gap-1.5 font-heading font-bold text-[#0F1F3D]">
              <ShieldCheck size={16} className="text-[#2E9E6B]" />
              <span>4-Pillar Trust Index</span>
            </div>
            <span className="text-[10px] font-bold px-1.5 py-0.5 bg-[#EBF7F0] text-[#1B7A4E] rounded-[4px]">
              Verified
            </span>
          </div>

          <div className="space-y-2.5">
            <div>
              <div className="flex justify-between text-[11px] font-medium mb-1">
                <span className="text-[#5B6070]">Deposit & Damage Fairness</span>
                <span className="font-bold text-[#1B7A4E] tabular-nums">{breakdown.honesty}%</span>
              </div>
              <div className="h-1.5 bg-[#FAF7F2] rounded-full overflow-hidden border border-[#E4DDD1]">
                <div className="h-full bg-[#1B7A4E] rounded-full" style={{ width: `${breakdown.honesty}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] font-medium mb-1">
                <span className="text-[#5B6070]">Mechanical Condition</span>
                <span className="font-bold text-[#2456D6] tabular-nums">{breakdown.vehicleCondition}%</span>
              </div>
              <div className="h-1.5 bg-[#FAF7F2] rounded-full overflow-hidden border border-[#E4DDD1]">
                <div className="h-full bg-[#2456D6] rounded-full" style={{ width: `${breakdown.vehicleCondition}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] font-medium mb-1">
                <span className="text-[#5B6070]">Handover Punctuality</span>
                <span className="font-bold text-[#0F1F3D] tabular-nums">{breakdown.punctuality}%</span>
              </div>
              <div className="h-1.5 bg-[#FAF7F2] rounded-full overflow-hidden border border-[#E4DDD1]">
                <div className="h-full bg-[#0F1F3D] rounded-full" style={{ width: `${breakdown.punctuality}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] font-medium mb-1">
                <span className="text-[#5B6070]">Communication & Response</span>
                <span className="font-bold text-[#E8A317] tabular-nums">{breakdown.communication}%</span>
              </div>
              <div className="h-1.5 bg-[#FAF7F2] rounded-full overflow-hidden border border-[#E4DDD1]">
                <div className="h-full bg-[#E8A317] rounded-full" style={{ width: `${breakdown.communication}%` }} />
              </div>
            </div>
          </div>

          {onViewShopProfile && (
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onViewShopProfile();
              }}
              className="w-full py-1.5 bg-[#FAF7F2] hover:bg-[#F3EEE6] text-[#0F1F3D] font-semibold text-[11px] rounded-[6px] border border-[#E4DDD1] cursor-pointer"
            >
              View Full Audit Profile →
            </button>
          )}
        </div>
      )}
    </div>
  );
};
