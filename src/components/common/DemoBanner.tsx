import React from "react";
import { useApp } from "../../context/AppContext";
import { ShieldCheck, Zap, Bike, Car, Play, CheckCircle2, RotateCcw } from "lucide-react";

interface DemoBannerProps {
  onNavigate: (route: string) => void;
}

export const DemoBanner: React.FC<DemoBannerProps> = ({ onNavigate }) => {
  const { demoStep, setDemoStep, activeRole, switchRole, resetAllData } = useApp();

  const steps = [
    {
      step: 1,
      title: "1. Shopkeeper Free Trial",
      subtitle: "Sign up & start 1-mo HubX trial",
      role: "shopkeeper" as const,
      route: "/hubx",
    },
    {
      step: 2,
      title: "2. Search & Walkaround",
      subtitle: "Map view & 15s vehicle video",
      role: "customer" as const,
      route: "/explore",
    },
    {
      step: 3,
      title: "3. Paperless KYC & Mock UPI",
      subtitle: "Digital docs & booking flow",
      role: "customer" as const,
      route: "/verify",
    },
    {
      step: 4,
      title: "4. Live Ride & Hotel Reward",
      subtitle: "Extend time & unlock coupons",
      role: "customer" as const,
      route: "/rides",
    },
    {
      step: 5,
      title: "5. Shop AI & Dynamic Pricing",
      subtitle: "AI demand forecast & trust scores",
      role: "shopkeeper" as const,
      route: "/dashboard/insights",
    },
  ];

  const handleStepClick = (s: typeof steps[0]) => {
    setDemoStep(s.step);
    if (activeRole !== s.role) {
      switchRole(s.role);
    }
    onNavigate(s.route);
  };

  return (
    <div className="bg-[#0F1F3D] text-white border-b border-blue-900/50 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-2 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        {/* Left: Hackathon 5-Tap Switcher Label */}
        <div className="flex items-center gap-2">
          <span className="bg-[#2F6BFF] text-white font-bold px-2 py-0.5 rounded text-[11px] uppercase tracking-wider flex items-center gap-1 shadow-sm">
            <Zap size={12} className="fill-white" /> 5-Tap Demo
          </span>
          <span className="text-slate-300 hidden sm:inline">
            Click any step to jump the interactive hackathon flow:
          </span>
        </div>

        {/* Middle: 5 Tap Buttons */}
        <div className="flex items-center gap-1 overflow-x-auto max-w-full pb-1 md:pb-0 custom-scrollbar">
          {steps.map((s) => {
            const isActive = demoStep === s.step;
            return (
              <button
                key={s.step}
                onClick={() => handleStepClick(s)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer text-left ${
                  isActive
                    ? "bg-[#2F6BFF] text-white ring-2 ring-blue-400 shadow-sm"
                    : "bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white"
                }`}
              >
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  isActive ? "bg-white text-[#2F6BFF]" : "bg-slate-700 text-slate-300"
                }`}>
                  {s.step}
                </span>
                <span className="font-semibold">{s.title.split(". ")[1]}</span>
              </button>
            );
          })}
        </div>

        {/* Right: Quick Role Toggle & Reset */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => switchRole(activeRole === "customer" ? "shopkeeper" : "customer")}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded border border-slate-700 transition cursor-pointer flex items-center gap-1"
          >
            Role: <strong className="text-[#4CBB8A] capitalize">{activeRole}</strong>
          </button>
          <button
            onClick={resetAllData}
            title="Reset Mock Data"
            className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded transition cursor-pointer"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
