import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  MessageSquare,
  Wrench,
  Award,
  ArrowLeft,
  Star,
  MapPin,
  Sparkles,
  RefreshCw,
  ThumbsUp
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { analyzeReviewsWithAi } from "../../api/hubxApi";

interface ShopTrustProfilePageProps {
  shopId?: string;
  onBack: () => void;
}

export const ShopTrustProfilePage: React.FC<ShopTrustProfilePageProps> = ({ shopId = "shop-1", onBack }) => {
  const { shops } = useApp();
  const shop = shops.find((s) => s.id === shopId) || shops[0];

  const [reviewAnalysis, setReviewAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runAnalysis = async () => {
    setLoading(true);
    try {
      const res = await analyzeReviewsWithAi(shop.name, shop.reviews);
      setReviewAnalysis(res);
    } catch {
      // Ignored
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runAnalysis();
  }, [shop.name]);

  const breakdown = shop.trustBreakdown || {
    honesty: 99.4,
    vehicleCondition: 98.6,
    punctuality: 99.1,
    communication: 99.8
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#E4DDD1]">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#16181F] hover:bg-[#F3EEE6] bg-white px-3.5 py-2 rounded-[8px] border border-[#E4DDD1] cursor-pointer"
        >
          <ArrowLeft size={14} /> Back
        </button>

        <span className="text-xs font-bold text-[#1B7A4E] bg-[#EBF7F0] border border-[#2E9E6B]/30 px-3 py-1 rounded-[4px] flex items-center gap-1.5">
          <ShieldCheck size={14} /> Certified HubX Partner Hub
        </span>
      </div>

      {/* Main Shop Header Card */}
      <div className="bg-white rounded-[12px] p-6 sm:p-8 border border-[#E4DDD1] shadow-[0_2px_8px_rgba(15,31,61,0.06)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="eyebrow-label block">VERIFIED COMMUNITY AUDIT PROFILE</span>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#16181F]">
            {shop.name}
          </h1>
          <p className="text-xs text-[#5B6070] flex items-center gap-1.5">
            <MapPin size={13} className="text-[#2456D6]" /> {shop.address}, {shop.city}
          </p>
        </div>

        <div className="bg-[#FAF7F2] p-5 rounded-[10px] border border-[#E4DDD1] text-center shrink-0 w-full sm:w-auto">
          <span className="text-[11px] font-bold text-[#5B6070] uppercase block mb-1">Overall Trust Score</span>
          <div className="font-heading font-black text-3xl text-[#1B7A4E] tabular-nums">
            {shop.trust.overall}/10
          </div>
          <span className="text-[11px] text-[#5B6070] block mt-0.5">
            Based on {shop.trust.reviewCount} customer audits
          </span>
        </div>
      </div>

      {/* 4 Pillars Breakdown Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-[10px] border border-[#E4DDD1] space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-bold text-[#1B7A4E]">
            <ShieldCheck size={16} />
            <span>Deposit Honesty</span>
          </div>
          <div className="font-heading font-extrabold text-2xl text-[#16181F] tabular-nums">
            {breakdown.honesty}%
          </div>
          <p className="text-[11px] text-[#5B6070]">
            Zero unfair damage deductions in 400+ verified bookings.
          </p>
        </div>

        <div className="bg-white p-5 rounded-[10px] border border-[#E4DDD1] space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-bold text-[#2456D6]">
            <Wrench size={16} />
            <span>Mechanical Condition</span>
          </div>
          <div className="font-heading font-extrabold text-2xl text-[#16181F] tabular-nums">
            {breakdown.vehicleCondition}%
          </div>
          <p className="text-[11px] text-[#5B6070]">
            15-day multi-point brake and engine safety certification.
          </p>
        </div>

        <div className="bg-white p-5 rounded-[10px] border border-[#E4DDD1] space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-bold text-[#0F1F3D]">
            <Clock size={16} />
            <span>On-Time Handover</span>
          </div>
          <div className="font-heading font-extrabold text-2xl text-[#16181F] tabular-nums">
            {breakdown.punctuality}%
          </div>
          <p className="text-[11px] text-[#5B6070]">
            99.1% keys ready within 3 minutes of scheduled arrival.
          </p>
        </div>

        <div className="bg-white p-5 rounded-[10px] border border-[#E4DDD1] space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-bold text-[#E8A317]">
            <MessageSquare size={16} />
            <span>Response & Clarity</span>
          </div>
          <div className="font-heading font-extrabold text-2xl text-[#16181F] tabular-nums">
            {breakdown.communication}%
          </div>
          <p className="text-[11px] text-[#5B6070]">
            Average customer chat response under 2.5 minutes.
          </p>
        </div>
      </div>

      {/* Gemini Review Intelligence Card */}
      <div className="bg-white rounded-[12px] p-6 sm:p-8 border border-[#E4DDD1] shadow-[0_2px_8px_rgba(15,31,61,0.06)] space-y-5">
        <div className="flex items-center justify-between border-b border-[#E4DDD1] pb-4">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-[6px] bg-[#FAF7F2] text-[#2456D6] border border-[#E4DDD1]">
              <Sparkles size={16} />
            </span>
            <div>
              <h3 className="font-heading font-bold text-base text-[#16181F]">
                Gemini AI Customer Review Synthesis
              </h3>
              <p className="text-xs text-[#5B6070]">
                Live NLP analysis of customer feedback and deposit return experiences
              </p>
            </div>
          </div>

          <button
            onClick={runAnalysis}
            disabled={loading}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-[6px] border border-[#E4DDD1] bg-[#FAF7F2] hover:bg-[#F3EEE6] cursor-pointer"
          >
            <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
            <span>Re-analyze</span>
          </button>
        </div>

        {reviewAnalysis && (
          <div className="space-y-4">
            <div className="p-4 bg-[#FAF7F2] rounded-[8px] border border-[#E4DDD1] text-xs leading-relaxed text-[#16181F]">
              <strong className="block mb-1 font-bold text-[#0F1F3D]">Synthesis Summary:</strong>
              {reviewAnalysis.aiSummary}
            </div>

            {reviewAnalysis.extractedKeyTopics && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-[#5B6070] uppercase">Extracted Key Themes</span>
                <div className="flex flex-wrap gap-2">
                  {reviewAnalysis.extractedKeyTopics.map((topic: any, idx: number) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-[4px] bg-white border border-[#E4DDD1] text-xs font-medium text-[#16181F] flex items-center gap-1.5"
                    >
                      <ThumbsUp size={11} className="text-[#1B7A4E]" />
                      <span>{topic.topic} ({topic.count})</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
