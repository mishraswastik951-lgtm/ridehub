import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { formatINR, formatDate } from "../../utils/formatters";
import confetti from "canvas-confetti";
import { 
  Coins, 
  Hotel, 
  Sparkles, 
  Copy, 
  Check, 
  Tag
} from "lucide-react";

export const RewardsPage: React.FC = () => {
  const { currentUser, coupons, redeemCoupon } = useApp();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyCode = (couponId: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(couponId);
    confetti({ particleCount: 30, spread: 40, origin: { y: 0.7 } });
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="pb-4 border-b border-[#E4DDD1]">
        <span className="eyebrow-label block mb-1">CUSTOMER LOYALTY & PARTNER PERKS</span>
        <h1 className="font-heading font-bold text-2xl sm:text-3xl text-[#16181F]">
          Rewards & Hotel Vouchers
        </h1>
        <p className="text-xs sm:text-sm text-[#5B6070] mt-1">
          Earn points on every HubX verified rental and redeem exclusive stay discounts from certified hotel partners.
        </p>
      </div>

      {/* Points Balance Banner - Solid Navy with Amber Badge */}
      <div className="bg-[#0F1F3D] rounded-[12px] p-6 sm:p-8 text-white border border-[#0A1529] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-[8px] bg-[#0A1529] flex items-center justify-center text-[#E8A317]">
            <Coins size={28} />
          </div>
          <div>
            <span className="text-xs text-[#B5C4E0] font-semibold uppercase tracking-wider block">
              RideHub Points Balance
            </span>
            <div className="font-heading font-extrabold text-3xl sm:text-4xl text-white tabular-nums flex items-baseline gap-2">
              <span>{currentUser.points}</span>
              <span className="text-xs font-bold text-[#0F1F3D] bg-[#E8A317] px-2 py-0.5 rounded-[4px] uppercase tracking-wider">
                POINTS ACTIVE
              </span>
            </div>
            <p className="text-xs text-[#B5C4E0] mt-1 tabular-nums">
              Equivalent to {formatINR(currentUser.points)} in checkout booking discounts (up to 20% per reservation).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-[#0A1529] p-3.5 rounded-[8px] border border-white/10 text-xs">
          <Sparkles className="text-[#E8A317] shrink-0" size={18} />
          <div>
            <strong className="block text-white font-semibold">HubX Loyalty Rate:</strong>
            <span className="text-[#B5C4E0] tabular-nums">1 pt per ₹10 spent at certified garages</span>
          </div>
        </div>
      </div>

      {/* Hotel Coupons Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Hotel className="text-[#2456D6]" size={18} />
            <h3 className="font-heading font-bold text-lg text-[#16181F]">
              Unlocked Partner Hotel Vouchers
            </h3>
          </div>
          <span className="text-xs font-semibold text-[#5B6070] tabular-nums">
            {coupons.filter(c => c.status === "active").length} Active Vouchers
          </span>
        </div>

        {coupons.length === 0 ? (
          <div className="bg-white rounded-[12px] p-8 text-center border border-[#E4DDD1]">
            <Hotel size={36} className="mx-auto text-[#5B6070] mb-2" />
            <h4 className="font-heading font-bold text-base text-[#16181F]">No Hotel Coupons Unlocked Yet</h4>
            <p className="text-xs text-[#5B6070] mt-1">Complete a ride with any HubX garage to unlock partner hotel discounts!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {coupons.map((coupon) => {
              const isUsed = coupon.status === "used";
              return (
                <div
                  key={coupon.id}
                  className={`bg-white rounded-[12px] p-5 border transition-all duration-200 flex flex-col justify-between ${
                    isUsed 
                      ? "border-[#E4DDD1] opacity-50 bg-[#FAF7F2]" 
                      : "border-[#E4DDD1] shadow-[0_1px_2px_rgba(15,31,61,0.06)] hover:-translate-y-0.5 hover:shadow-[0_4px_10px_rgba(15,31,61,0.08)]"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#5B6070] uppercase tracking-wider flex items-center gap-1">
                        <Tag size={12} className="text-[#2456D6]" /> Hotel Partner
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-[4px] ${
                        isUsed ? "bg-[#FAF7F2] text-[#5B6070] border border-[#E4DDD1]" : "bg-[#EBF7F0] text-[#1B7A4E]"
                      }`}>
                        {isUsed ? "REDEEMED" : "ACTIVE"}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-heading font-bold text-base text-[#16181F]">
                        {coupon.hotel}
                      </h4>
                      <p className="text-xs font-bold text-[#2456D6] mt-1">
                        {coupon.discountText}
                      </p>
                      <p className="text-[11px] text-[#5B6070] mt-0.5 tabular-nums">
                        Min. booking value: {formatINR(coupon.minBookingValue)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-[#E4DDD1] space-y-2">
                    <div className="flex items-center justify-between bg-[#FAF7F2] p-2 rounded-[6px] border border-[#E4DDD1]">
                      <code className="text-xs font-bold text-[#0F1F3D] font-mono tracking-wider">
                        {coupon.code}
                      </code>
                      <button
                        onClick={() => handleCopyCode(coupon.id, coupon.code)}
                        className="text-xs font-bold text-[#2456D6] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        {copiedId === coupon.id ? <Check size={14} className="text-[#1B7A4E]" /> : <Copy size={14} />}
                        <span>{copiedId === coupon.id ? "Copied" : "Copy"}</span>
                      </button>
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-[#5B6070]">
                      <span className="tabular-nums">Expires {formatDate(coupon.expiresAt)}</span>
                      {!isUsed && (
                        <button
                          onClick={() => redeemCoupon(coupon.id)}
                          className="text-[#5B6070] hover:text-[#16181F] font-semibold cursor-pointer"
                        >
                          Mark as Used
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
