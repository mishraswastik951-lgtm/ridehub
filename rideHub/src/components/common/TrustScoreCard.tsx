import React from "react";
import { TrustScore } from "../../types";
import { ShieldCheck, Star, ThumbsUp, Wrench, Clock, MessageSquare, Info } from "lucide-react";

interface TrustScoreCardProps {
  trust: TrustScore;
  isHubX?: boolean;
  compact?: boolean;
}

export const TrustScoreCard: React.FC<TrustScoreCardProps> = ({ trust, isHubX = true, compact = false }) => {
  const categories = [
    { label: "Deposit & Claims Honesty", score: trust.honesty, icon: ThumbsUp, color: "bg-[#1B7A4E]" },
    { label: "Fleet Maintenance Condition", score: trust.condition, icon: Wrench, color: "bg-[#2456D6]" },
    { label: "Punctuality & Handover Time", score: trust.punctuality, icon: Clock, color: "bg-[#0F1F3D]" },
    { label: "Shop Communication", score: trust.communication, icon: MessageSquare, color: "bg-[#5B6070]" },
  ];

  if (compact) {
    return (
      <div className="flex items-center gap-1.5 bg-[#EBF7F0] text-[#1B7A4E] px-2.5 py-1 rounded-[4px] border border-[#C3E7D3]">
        <ShieldCheck size={14} className="text-[#1B7A4E]" />
        <span className="font-bold text-xs tabular-nums">{trust.overall.toFixed(1)}/10</span>
        <span className="text-[10px] text-[#1B7A4E] font-medium tabular-nums">({trust.reviewCount} trips)</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[12px] p-5 border border-[#E4DDD1] shadow-[0_1px_2px_rgba(15,31,61,0.06)]">
      <div className="flex items-center justify-between pb-4 border-b border-[#E4DDD1]">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-heading font-bold text-base text-[#16181F]">Community Trust Score</h4>
            {isHubX && (
              <span className="bg-[#E8A317] text-[#0F1F3D] text-[10px] font-black px-2 py-0.5 rounded-[4px] uppercase tracking-wider">
                HUBX CERTIFIED
              </span>
            )}
          </div>
          <p className="text-xs text-[#5B6070] mt-0.5">
            Verified aggregate rating from {trust.reviewCount} customer rentals
          </p>
        </div>

        <div className="text-right">
          <div className="flex items-baseline gap-1">
            <span className="font-heading font-extrabold text-3xl text-[#1B7A4E] tabular-nums">
              {trust.overall.toFixed(1)}
            </span>
            <span className="text-sm font-semibold text-[#5B6070]">/10</span>
          </div>
          <div className="flex items-center gap-0.5 text-[#E8A317] justify-end">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={12} className="fill-[#E8A317]" />
            ))}
          </div>
        </div>
      </div>

      {/* 4 Trust Criteria Bars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const percentage = (cat.score / 10) * 100;
          return (
            <div key={cat.label} className="bg-[#FAF7F2] p-3 rounded-[8px] border border-[#E4DDD1]">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <div className="flex items-center gap-1.5 text-[#16181F] font-medium">
                  <Icon size={13} className="text-[#5B6070]" />
                  <span>{cat.label}</span>
                </div>
                <span className="font-bold text-[#16181F] tabular-nums">{cat.score.toFixed(1)}</span>
              </div>
              <div className="w-full h-1.5 bg-[#E4DDD1] rounded-[2px] overflow-hidden">
                <div 
                  className={`h-full ${cat.color} rounded-[2px]`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-[#E4DDD1] flex items-center justify-between text-[11px] text-[#5B6070]">
        <span className="flex items-center gap-1">
          <Info size={12} /> 100% deposit dispute-free guarantee backed by HubX
        </span>
        <span className="font-semibold text-[#2456D6] hover:underline cursor-pointer">
          Inspection Standards
        </span>
      </div>
    </div>
  );
};
