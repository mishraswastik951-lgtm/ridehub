import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { formatINR } from "../../utils/formatters";
import confetti from "canvas-confetti";
import { 
  Store, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  Crown, 
  Clock, 
  ChevronRight
} from "lucide-react";

interface HubXLandingPageProps {
  onNavigate: (route: string) => void;
}

export const HubXLandingPage: React.FC<HubXLandingPageProps> = ({ onNavigate }) => {
  const { switchRole, upgradeShopPlan, shops } = useApp();
  const [selectedPlan, setSelectedPlan] = useState<"Monthly" | "6 months" | "Yearly">("Yearly");
  const [shopName, setShopName] = useState("Royal MotoHub Rentals");
  const [shopCity, setShopCity] = useState("Panaji, Goa");
  const [trialStarted, setTrialStarted] = useState(false);
  const [activeTab, setActiveTab] = useState<"pricing" | "onboarding">("pricing");

  const plans = [
    {
      name: "Monthly" as const,
      price: 499,
      billed: "billed monthly",
      savings: null,
      desc: "For seasonal shops starting out with online reservations.",
      features: [
        "HubX Verified badge on map & search",
        "AI Demand forecasting analytics",
        "Dynamic pricing recommender",
        "Digital paperless agreements & KYC",
        "Standard customer support",
      ],
    },
    {
      name: "6 months" as const,
      price: 2499,
      billed: "₹416/mo (billed ₹2,499 semi-annually)",
      savings: "SAVE 17%",
      badge: "MOST POPULAR",
      desc: "Built for busy tourist season peaks across Goa.",
      features: [
        "Everything in Monthly plan",
        "Priority map ranking (3x search views)",
        "Zero deposit dispute protection",
        "Direct instant customer leads",
        "Doorstep delivery fleet management",
      ],
    },
    {
      name: "Yearly" as const,
      price: 4499,
      billed: "₹375/mo (billed ₹4,499 annually)",
      savings: "SAVE 25%",
      badge: "BEST VALUE",
      desc: "Complete digital fleet OS for maximum revenue & repeat tourists.",
      features: [
        "Everything in 6-Month plan",
        "#1 Top-tier search algorithm priority",
        "Sponsor Hotel Coupon network (Taj, Ginger)",
        "Automated festival demand surge pricing",
        "Dedicated HubX Partner Growth Manager",
        "Free 30-Day trial included (₹0 today)",
      ],
    },
  ];

  const handleStartTrial = () => {
    switchRole("shopkeeper");
    upgradeShopPlan(shops[0]?.id || "shop-1", selectedPlan);
    setTrialStarted(true);
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } });
    setTimeout(() => {
      onNavigate("/dashboard");
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#0F1F3D] text-white py-14 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-7xl mx-auto relative z-10 space-y-16">
        {/* Top Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 bg-[#0A1529] border border-white/10 px-3.5 py-1 rounded-[4px] text-xs font-bold text-white">
            <Crown size={14} className="text-[#E8A317]" />
            <span>HUBX GARAGE OPERATING SUITE • 30-DAY TRIAL</span>
          </div>

          <h1 className="font-heading font-extrabold text-3xl sm:text-5xl lg:text-6xl tracking-tight leading-tight text-white">
            Transform your fleet into a high-margin operation.
          </h1>

          <p className="text-[#B5C4E0] text-sm sm:text-base max-w-2xl mx-auto font-normal leading-relaxed">
            Eliminate paperwork disputes, automate dynamic pricing during peak tourist seasons, and connect directly with verified renters.
          </p>

          {/* Quick Toggle between Plans & Direct Onboarding */}
          <div className="pt-2 flex justify-center">
            <div className="bg-[#0A1529] p-1 rounded-[6px] border border-white/10 inline-flex items-center gap-2">
              <button
                onClick={() => setActiveTab("pricing")}
                className={`px-4 py-2 rounded-[4px] text-xs font-semibold transition-colors duration-150 cursor-pointer ${
                  activeTab === "pricing"
                    ? "bg-[#2456D6] text-white"
                    : "text-[#B5C4E0] hover:text-white"
                }`}
              >
                1. Select HubX Plan
              </button>
              <button
                onClick={() => setActiveTab("onboarding")}
                className={`px-4 py-2 rounded-[4px] text-xs font-semibold transition-colors duration-150 cursor-pointer ${
                  activeTab === "onboarding"
                    ? "bg-[#2456D6] text-white"
                    : "text-[#B5C4E0] hover:text-white"
                }`}
              >
                2. Activate Free 30-Day Trial
              </button>
            </div>
          </div>
        </div>

        {/* View 1: Pricing Cards Matrix */}
        {activeTab === "pricing" && (
          <div className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
              {plans.map((p) => {
                const isSelected = selectedPlan === p.name;
                return (
                  <div
                    key={p.name}
                    onClick={() => setSelectedPlan(p.name)}
                    className={`rounded-[12px] p-7 transition-colors duration-200 flex flex-col justify-between relative cursor-pointer ${
                      isSelected
                        ? "bg-[#0A1529] border-2 border-[#E8A317] shadow-sm"
                        : "bg-[#0A1529]/60 border border-white/10 hover:border-white/20"
                    }`}
                  >
                    {p.badge && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#E8A317] text-[#0F1F3D] text-[10px] font-black px-3 py-0.5 rounded-[4px] uppercase tracking-wider flex items-center gap-1">
                        <Sparkles size={11} />
                        <span>{p.badge}</span>
                      </div>
                    )}

                    <div className="space-y-5">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-heading font-bold text-xl text-white">{p.name}</h3>
                          <p className="text-xs text-[#B5C4E0] mt-1">{p.desc}</p>
                        </div>
                        {p.savings && (
                          <span className="bg-[#132A24] text-[#2E9E6B] border border-[#1E4D38] text-[10px] font-bold px-2 py-0.5 rounded-[4px]">
                            {p.savings}
                          </span>
                        )}
                      </div>

                      <div className="pt-2">
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-heading font-extrabold text-4xl text-white tabular-nums">
                            {formatINR(p.price)}
                          </span>
                        </div>
                        <p className="text-xs text-[#B5C4E0] mt-1 tabular-nums">{p.billed}</p>
                      </div>

                      <div className="p-3 rounded-[6px] bg-[#0F1F3D] border border-white/10 text-xs text-[#2E9E6B] flex items-center gap-2">
                        <Clock size={14} className="shrink-0 text-[#2E9E6B]" />
                        <span><strong>30-Day Free Evaluation:</strong> Pay ₹0 today</span>
                      </div>

                      <div className="pt-4 border-t border-white/10 space-y-3 text-xs text-[#B5C4E0]">
                        {p.features.map((f) => (
                          <div key={f} className="flex items-start gap-2.5">
                            <CheckCircle2 size={15} className="text-[#2E9E6B] shrink-0 mt-0.5" />
                            <span className="leading-snug">{f}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-8">
                      {/* Amber Key CTA Button */}
                      <button
                        onClick={() => {
                          setSelectedPlan(p.name);
                          setActiveTab("onboarding");
                        }}
                        className={`w-full py-3 rounded-[8px] font-heading font-bold text-xs transition-colors duration-200 flex items-center justify-center gap-2 cursor-pointer ${
                          isSelected
                            ? "bg-[#E8A317] hover:bg-[#D99614] text-[#0F1F3D]"
                            : "bg-[#1E2D4A] hover:bg-[#2A3C62] text-white"
                        }`}
                      >
                        <span>Choose {p.name} & Activate Trial</span>
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Metrics Section */}
            <div className="rounded-[12px] bg-[#0A1529] border border-white/10 p-8 sm:p-10">
              <div className="text-center max-w-xl mx-auto mb-8">
                <h3 className="font-heading font-bold text-xl text-white">Why Fleet Operators Join HubX</h3>
                <p className="text-xs text-[#B5C4E0] mt-1">Verified benchmarks across Goa and hill-town rental networks</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
                <div className="p-6 rounded-[8px] bg-[#0F1F3D] border border-white/10">
                  <div className="text-3xl font-extrabold text-[#2E9E6B] tabular-nums">+38%</div>
                  <p className="font-bold text-sm text-white mt-1">Revenue Improvement</p>
                  <p className="text-xs text-[#B5C4E0] mt-1">From automated AI weekend surge pricing</p>
                </div>

                <div className="p-6 rounded-[8px] bg-[#0F1F3D] border border-white/10">
                  <div className="text-3xl font-extrabold text-white tabular-nums">0%</div>
                  <p className="font-bold text-sm text-white mt-1">Deposit Disputes</p>
                  <p className="text-xs text-[#B5C4E0] mt-1">Protected by digital inspection agreement</p>
                </div>

                <div className="p-6 rounded-[8px] bg-[#0F1F3D] border border-white/10">
                  <div className="text-3xl font-extrabold text-[#E8A317] tabular-nums">100%</div>
                  <p className="font-bold text-sm text-white mt-1">Paperless Check-in</p>
                  <p className="text-xs text-[#B5C4E0] mt-1">Verified DigiLocker KYC straight to dashboard</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View 2: Onboarding Form */}
        {activeTab === "onboarding" && (
          <div className="max-w-2xl mx-auto bg-[#0A1529] rounded-[12px] p-8 border border-white/10 shadow-sm space-y-6">
            <div className="border-b border-white/10 pb-4 flex items-center justify-between">
              <div>
                <h3 className="font-heading font-bold text-xl text-white">HubX Operator Registration</h3>
                <p className="text-xs text-[#B5C4E0] mt-0.5">Selected Plan: <strong className="text-white">{selectedPlan}</strong> (30-Day Free Trial)</p>
              </div>
              <button
                onClick={() => setActiveTab("pricing")}
                className="text-xs font-semibold text-[#B5C4E0] hover:text-white"
              >
                Change Plan
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-white">Garage / Trade Name</label>
                <input
                  type="text"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  placeholder="e.g. Royal MotoHub Rentals"
                  className="w-full px-3.5 py-2.5 bg-[#0F1F3D] border border-white/10 rounded-[4px] text-xs font-medium text-white focus:outline-none focus:border-[#E8A317]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-white">Operating City & Area</label>
                <input
                  type="text"
                  value={shopCity}
                  onChange={(e) => setShopCity(e.target.value)}
                  placeholder="e.g. Panaji / Calangute / Airport"
                  className="w-full px-3.5 py-2.5 bg-[#0F1F3D] border border-white/10 rounded-[4px] text-xs font-medium text-white focus:outline-none focus:border-[#E8A317]"
                />
              </div>

              <div className="p-4 rounded-[8px] bg-[#0F1F3D] border border-white/10 space-y-1 text-xs text-[#B5C4E0]">
                <div className="flex items-center gap-2 font-bold text-white">
                  <ShieldCheck size={16} className="text-[#2E9E6B]" />
                  <span>Free Trial Guarantee</span>
                </div>
                <p>
                  Your 30-day evaluation trial begins immediately. Upload vehicles, test AI dynamic pricing, and accept live bookings with ₹0 charged today.
                </p>
              </div>

              {/* Single Key Amber CTA Button */}
              <button
                onClick={handleStartTrial}
                className="w-full py-3.5 bg-[#E8A317] hover:bg-[#D99614] text-[#0F1F3D] font-heading font-bold text-sm rounded-[8px] transition-colors duration-200 cursor-pointer flex items-center justify-center gap-2"
              >
                {trialStarted ? (
                  <span>Launching HubX Dashboard...</span>
                ) : (
                  <>
                    <Store size={17} />
                    <span>Activate Free 30-Day Trial & Enter Dashboard</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
