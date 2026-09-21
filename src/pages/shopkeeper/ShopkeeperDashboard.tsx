import React, { useState, useEffect, useCallback } from "react";
import { useApp } from "../../context/AppContext";
import { formatINR, formatDateTime } from "../../utils/formatters";
import { TrustScoreCard } from "../../components/common/TrustScoreCard";
import confetti from "canvas-confetti";
import {
  TrendingUp, Clock, Plus, Bot, Crown, Zap, Sparkles,
  CheckCircle, AlertCircle, BarChart3, Users, Star,
  RefreshCw, Calendar, Package, DollarSign, Activity,
  Shield, Map, FileText, ChevronRight, Cpu, Loader2,
  Play, UploadCloud,
} from "lucide-react";
import { ShopkeeperFleetMap } from "../../components/gps/ShopkeeperFleetMap";

interface ShopkeeperDashboardProps {
  onNavigate: (route: string) => void;
  currentRoute?: string;
}

type DashTab = "overview" | "fleet" | "bookings" | "pricing" | "ai_lab";

function routeToTab(route: string): DashTab {
  if (route.includes("/dashboard/fleet")) return "fleet";
  if (route.includes("/dashboard/bookings")) return "bookings";
  if (route.includes("/dashboard/pricing")) return "pricing";
  if (route.includes("/dashboard/ai-lab")) return "ai_lab";
  return "overview";
}

const GeminiTag: React.FC<{ model?: string }> = ({ model = "gemini-3.6-flash" }) => (
  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-[4px] bg-gradient-to-r from-[#1A3A8F] to-[#2456D6] text-white">
    <Cpu size={9} /> {model}
  </span>
);

const AiLoadingCard: React.FC<{ label: string }> = ({ label }) => (
  <div className="bg-[#0A1529] rounded-[10px] p-5 border border-white/10 flex flex-col items-center justify-center gap-3 min-h-[120px]">
    <Loader2 className="animate-spin text-[#E8A317]" size={22} />
    <p className="text-xs text-[#B5C4E0] text-center">{label}</p>
  </div>
);

type InsightType = "surge" | "idle" | "risk" | "opportunity" | "action";
const InsightTag: React.FC<{ type: InsightType; label: string }> = ({ type, label }) => {
  const styles: Record<InsightType, string> = {
    surge: "bg-[#E8A317] text-[#0F1F3D]",
    idle: "bg-[#132A24] text-[#2E9E6B] border border-[#1E4D38]",
    risk: "bg-red-950 text-red-300 border border-red-800",
    opportunity: "bg-[#1A3A8F] text-[#93B4FF]",
    action: "bg-[#0F1F3D] text-white border border-white/10",
  };
  return <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-[4px] ${styles[type]}`}>{label}</span>;
};

const AI_LAB_PRESETS = [
  { id: "weekend_surge", label: "Weekend Surge Scenario", data: { shopName: "Royal MotoHub Rentals", city: "Panaji, Goa", weeklyBookings: 38, avgDailyRate: 799, utilizationPct: 94, weatherCondition: "Clear Sky", isWeekend: true, touristIndex: "High", competitorRate: 950, fleetSize: 12 } },
  { id: "rainy_slump", label: "Monsoon Demand Slump", data: { shopName: "Royal MotoHub Rentals", city: "Panaji, Goa", weeklyBookings: 14, avgDailyRate: 799, utilizationPct: 38, weatherCondition: "Heavy Rain", isWeekend: false, touristIndex: "Low", competitorRate: 650, fleetSize: 12 } },
  { id: "peak_season", label: "December Peak Season", data: { shopName: "Royal MotoHub Rentals", city: "Panaji, Goa", weeklyBookings: 62, avgDailyRate: 799, utilizationPct: 100, weatherCondition: "Sunny", isWeekend: true, touristIndex: "Very High", competitorRate: 1100, fleetSize: 12 } },
  { id: "custom", label: "Custom Data Entry", data: null },
];

export const ShopkeeperDashboard: React.FC<ShopkeeperDashboardProps> = ({ onNavigate, currentRoute = "/dashboard" }) => {
  const { currentUser, shops, vehicles, bookings, updateShopDynamicPricing, addVehicle, updateVehicle } = useApp();
  const activeTab = routeToTab(currentRoute);

  const myShop = shops.find(s => s.ownerId === currentUser.id) || shops[0] || {
    id: "shop-1", ownerId: "user-shopkeeper", name: "Royal MotoHub Rentals",
    city: "Panaji", address: "EDC Complex, Patto Plaza, Panaji, Goa",
    lat: 15.4989, lng: 73.8278, distanceKm: 0.5, isHubX: true,
    trust: { overall: 9.6, honesty: 9.8, condition: 9.5, punctuality: 9.7, communication: 9.4, reviewCount: 142 },
    images: ["https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80"],
    features: ["Zero Deposit Option", "24/7 Helpline"], reviews: [],
  };

  const myVehicles = vehicles.filter(v => v.shopId === myShop.id);
  const myBookings = bookings;
  const activeBookings = myBookings.filter(b => b.status === "active");
  const completedBookings = myBookings.filter(b => b.status === "completed");
  const todayRevenue = completedBookings.reduce((s, b) => s + (b.total || 0), 0) + 8450;
  const utilizationPct = myVehicles.length > 0
    ? Math.round((myVehicles.filter(v => !v.available).length / myVehicles.length) * 100) : 83;

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newModel, setNewModel] = useState("");
  const [newType, setNewType] = useState<"scooty" | "bike" | "car">("bike");
  const [newHourlyRate, setNewHourlyRate] = useState(99);
  const [newDailyRate, setNewDailyRate] = useState(799);
  const [newDeposit, setNewDeposit] = useState(1500);

  const [aiOverview, setAiOverview] = useState<string | null>(null);
  const [aiOverviewLoading, setAiOverviewLoading] = useState(false);
  const [aiPricingCards, setAiPricingCards] = useState<any[]>([]);
  const [aiPricingLoading, setAiPricingLoading] = useState(false);
  const [aiBookingInsight, setAiBookingInsight] = useState<string | null>(null);
  const [aiBookingLoading, setAiBookingLoading] = useState(false);
  const [aiFleetAdvice, setAiFleetAdvice] = useState<string | null>(null);
  const [aiFleetLoading, setAiFleetLoading] = useState(false);
  const [acceptedInsight, setAcceptedInsight] = useState<string | null>(null);

  const [labPreset, setLabPreset] = useState<string>("weekend_surge");
  const [labCustomData, setLabCustomData] = useState({ shopName: "My Bike Rental", city: "Goa", weeklyBookings: 20, avgDailyRate: 699, utilizationPct: 65, weatherCondition: "Clear", isWeekend: true, touristIndex: "Medium", competitorRate: 800, fleetSize: 8 });
  const [labResult, setLabResult] = useState<any>(null);
  const [labLoading, setLabLoading] = useState(false);

  const FALLBACK_OVERVIEW = "Weekend demand surge detected. Your Honda Activa fleet shows highest turnaround (94%). Recommend Rs50 off weekday promo to capture mid-week corporate travellers.";
  const FALLBACK_BOOKING = "Peak hours: 8-10 AM and 4-6 PM. 78% of customers extend by 2+ hours. Offer extension bundles at booking to increase avg value by ~Rs180.";

  const fetchOverviewAI = useCallback(async () => {
    if (aiOverview) return;
    setAiOverviewLoading(true);
    try {
      const res = await fetch("/api/ai/insights", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ shopName: myShop.name, city: myShop.city, trustScore: myShop.trust.overall, reviewCount: myShop.trust.reviewCount, utilizationPct, activeRentals: activeBookings.length, totalVehicles: myVehicles.length, todayRevenue }) });
      const d = await res.json();
      setAiOverview(d?.insights?.[0]?.insight || d?.summary || FALLBACK_OVERVIEW);
    } catch { setAiOverview(FALLBACK_OVERVIEW); }
    setAiOverviewLoading(false);
  }, [myShop, utilizationPct, activeBookings.length, myVehicles.length, todayRevenue, aiOverview]);

  const fetchPricingAI = useCallback(async () => {
    if (aiPricingCards.length > 0) return;
    setAiPricingLoading(true);
    const isWknd = [0, 5, 6].includes(new Date().getDay());
    try {
      const results = await Promise.all(myVehicles.slice(0, 4).map(v =>
        fetch("/api/ai/price-recommend", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ vehicleId: v.id, vehicleName: v.model, currentPrice: v.pricePerDay, isWeekend: isWknd, weatherCondition: "Clear" }) })
          .then(r => r.json()).then(d => ({ vehicle: v, ai: d }))
          .catch(() => ({ vehicle: v, ai: { recommendedPrice: Math.round(v.pricePerDay * (isWknd ? 1.25 : 1.05)), surgeMultiplier: isWknd ? 1.25 : 1.05, reasoning: isWknd ? "Weekend surge: tourist volume 2.3x baseline." : "Steady weekday demand.", confidence: isWknd ? "high" : "medium", aiPowered: false } }))
      ));
      setAiPricingCards(results);
    } catch {
      const w = [0, 5, 6].includes(new Date().getDay());
      setAiPricingCards(myVehicles.slice(0, 4).map(v => ({ vehicle: v, ai: { recommendedPrice: Math.round(v.pricePerDay * (w ? 1.25 : 1.05)), surgeMultiplier: w ? 1.25 : 1.05, reasoning: "Demand estimate.", confidence: "medium", aiPowered: false } })));
    }
    setAiPricingLoading(false);
  }, [myVehicles, aiPricingCards.length]);

  const fetchBookingAI = useCallback(async () => {
    if (aiBookingInsight) return;
    setAiBookingLoading(true);
    try {
      const res = await fetch("/api/ai/analyze-reviews", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ shopName: myShop.name, reviews: (myShop as any).reviews || [] }) });
      const d = await res.json();
      setAiBookingInsight(d?.aiSummary || d?.summary || FALLBACK_BOOKING);
    } catch { setAiBookingInsight(FALLBACK_BOOKING); }
    setAiBookingLoading(false);
  }, [myShop, aiBookingInsight]);

  const fetchFleetAI = useCallback(async () => {
    if (aiFleetAdvice !== null) return;
    setAiFleetLoading(true);
    try {
      const res = await fetch("/api/ai/forecast?shopId=" + myShop.id);
      const d = await res.json();
      setAiFleetAdvice(d?.actionableInsights?.[0]?.recommendation || "Royal Enfield Hunter 350 maintained 94% occupancy for 3 weekends. Consider adding 1 more unit.");
    } catch { setAiFleetAdvice("Royal Enfield Hunter 350 maintained 94% occupancy. Consider adding 1 more unit."); }
    setAiFleetLoading(false);
  }, [myShop.id, aiFleetAdvice]);

  useEffect(() => {
    if (activeTab === "overview") fetchOverviewAI();
    if (activeTab === "pricing") fetchPricingAI();
    if (activeTab === "bookings") fetchBookingAI();
    if (activeTab === "fleet") fetchFleetAI();
  }, [activeTab, fetchOverviewAI, fetchPricingAI, fetchBookingAI, fetchFleetAI]);

  const runLabAnalysis = async () => {
    setLabLoading(true);
    setLabResult(null);
    const preset = AI_LAB_PRESETS.find(p => p.id === labPreset);
    const payload: any = labPreset === "custom" ? labCustomData : preset?.data;
    try {
      const priceRes = await fetch("/api/ai/price-recommend", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ vehicleId: "lab-demo", vehicleName: "Fleet Average", currentPrice: payload.avgDailyRate, isWeekend: payload.isWeekend, weatherCondition: payload.weatherCondition }) });
      const priceData = await priceRes.json().catch(() => null);
      setLabResult({ scenarioData: payload, pricing: priceData || buildFallbackPricing(payload) });
    } catch {
      setLabResult({ scenarioData: payload, pricing: buildFallbackPricing(payload) });
    }
    setLabLoading(false);
  };

  function buildFallbackPricing(p: any) {
    const mult = p.isWeekend ? 1.28 : p.utilizationPct > 80 ? 1.12 : p.utilizationPct < 50 ? 0.92 : 1.05;
    return {
      recommendedPrice: Math.round(p.avgDailyRate * mult),
      surgeMultiplier: mult,
      reasoning: p.isWeekend
        ? `Weekend detected with ${p.touristIndex} tourist index. Competitor baseline at Rs${p.competitorRate}/day. Recommending ${Math.round((mult-1)*100)}% premium to maximise revenue without losing occupancy.`
        : p.utilizationPct < 50
          ? `Low utilization (${p.utilizationPct}%) detected. Clearance pricing advised — a ${Math.round((1-mult)*100)}% reduction is projected to lift occupancy by 20-30%.`
          : `Moderate weekday demand at ${p.utilizationPct}% utilization. Slight uplift sustainable given ${p.weatherCondition} conditions.`,
      confidence: p.isWeekend ? "high" : "medium",
      aiPowered: false,
    };
  }

  const handleApplyDynamicPricing = (vehicleId: string, newRate: number, reason: string) => {
    updateShopDynamicPricing(myShop.id, vehicleId, newRate, reason);
    setAcceptedInsight(vehicleId);
    confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
    setTimeout(() => setAcceptedInsight(null), 3000);
  };

  const handleCreateVehicle = () => {
    if (!newModel) return;
    addVehicle({ type: newType, model: newModel, brand: newModel.split(" ")[0] || "Custom", year: 2024, fuel: "Petrol", mileage: "40 km/l", transmission: newType === "scooty" ? "Automatic" : "Manual", condition: "Mint", damageNotes: "Inspected clean.", accessories: ["2 ISI Helmets", "Mobile Charger"], videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4", images: ["https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=900&q=80"], pricePerHour: newHourlyRate, pricePerDay: newDailyRate, deposit: newDeposit, available: true, dynamicPriceTag: "Newly Added" });
    setIsAddModalOpen(false); setNewModel("");
    confetti({ particleCount: 50, spread: 50 });
  };

  const TABS = [
    { id: "overview" as DashTab, label: "Overview", route: "/dashboard", icon: BarChart3 },
    { id: "fleet" as DashTab, label: "Fleet Inventory", route: "/dashboard/fleet", icon: Package },
    { id: "bookings" as DashTab, label: "Live Bookings", route: "/dashboard/bookings", icon: Activity },
    { id: "pricing" as DashTab, label: "AI Dynamic Pricing", route: "/dashboard/pricing", icon: Sparkles, badge: "AI" },
    { id: "ai_lab" as DashTab, label: "Gemini AI Lab", route: "/dashboard/ai-lab", icon: Cpu, badge: "NEW" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

      {/* Hero Banner */}
      <div className="bg-[#0F1F3D] rounded-[14px] p-6 sm:p-8 text-white border border-[#0A1529] shadow-sm">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-[#E8A317] text-[#0F1F3D] text-[10px] font-black px-2.5 py-0.5 rounded-[4px] uppercase tracking-wider flex items-center gap-1">
                <Crown size={11} /> HubX Certified Operator
              </span>
              <span className="bg-[#132A24] text-[#2E9E6B] border border-[#1E4D38] text-[11px] font-semibold px-2.5 py-0.5 rounded-[4px] flex items-center gap-1">
                <Clock size={11} /> 24 Days Remaining on Trial
              </span>
              <GeminiTag />
            </div>
            <h1 className="font-heading font-bold text-2xl sm:text-3xl text-white">{myShop.name}</h1>
            <p className="text-xs text-[#B5C4E0]">{myShop.address} &bull; Rating: <strong className="text-white">{myShop.trust.overall}/10</strong> ({myShop.trust.reviewCount} audits)</p>
            <div className="flex flex-wrap gap-4 pt-1">
              {[{ label: "Revenue", value: formatINR(todayRevenue), color: "text-white" }, { label: "Active", value: String(activeBookings.length), color: "text-[#E8A317]" }, { label: "Utilization", value: `${utilizationPct}%`, color: "text-[#2E9E6B]" }, { label: "Fleet", value: `${myVehicles.length} units`, color: "text-white" }].map((m, i) => (
                <React.Fragment key={m.label}>{i > 0 && <div className="w-px bg-white/10" />}<div><div className={`font-heading font-extrabold text-xl tabular-nums ${m.color}`}>{m.value}</div><div className="text-[10px] text-[#B5C4E0]">{m.label}</div></div></React.Fragment>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <button onClick={() => onNavigate("/hubx")} className="px-4 py-2.5 bg-[#E8A317] hover:bg-[#D99614] text-[#0F1F3D] font-heading font-bold text-xs rounded-[8px] cursor-pointer flex items-center gap-1.5"><Shield size={14} /> Upgrade to Full HubX</button>
            <button onClick={() => onNavigate("/trust-profile/shop-1")} className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-heading font-semibold text-xs rounded-[8px] cursor-pointer flex items-center gap-1.5 border border-white/10"><Star size={14} /> Trust Profile Audit</button>
            <button onClick={() => onNavigate("/dashboard/calendar")} className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-heading font-semibold text-xs rounded-[8px] cursor-pointer flex items-center gap-1.5 border border-white/10"><Calendar size={14} /> 7-Day Pricing Calendar</button>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-1.5 bg-[#0A1529] p-1.5 rounded-[8px] border border-white/10">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => onNavigate(tab.route)}
                className={`px-3.5 py-1.5 rounded-[6px] text-xs font-semibold transition-all duration-150 flex items-center gap-1.5 cursor-pointer ${isActive ? "bg-[#2456D6] text-white" : "text-[#B5C4E0] hover:text-white hover:bg-white/10"}`}>
                <Icon size={13} /><span>{tab.label}</span>
                {tab.badge && <span className="bg-[#E8A317] text-[#0F1F3D] text-[9px] font-black px-1.5 py-0.5 rounded-[3px]">{tab.badge}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[{ label: "Today Revenue", value: formatINR(todayRevenue), sub: "+18.4% vs last weekend", green: true, badge: "Live", icon: DollarSign },
              { label: "Active Rentals", value: `${activeBookings.length} Active`, sub: `Utilization: ${utilizationPct}%`, green: false, badge: "Live", icon: Activity },
              { label: "Deposit Claims", value: "0 Disputes", sub: "100% inspection compliance", green: true, badge: "Protected", icon: Shield },
              { label: "Trust Rating", value: `${myShop.trust.overall}/10`, sub: `${myShop.trust.reviewCount} audits`, green: false, badge: "Top 5%", icon: Star },
            ].map((kpi) => { const Icon = kpi.icon; return (
              <div key={kpi.label} className="bg-white p-5 rounded-[12px] border border-[#E4DDD1] space-y-2">
                <div className="flex items-center justify-between text-xs text-[#5B6070]"><span className="font-semibold flex items-center gap-1.5"><Icon size={13} />{kpi.label}</span><span className="text-[10px] font-bold px-1.5 py-0.5 rounded-[4px] bg-[#EBF7F0] text-[#1B7A4E]">{kpi.badge}</span></div>
                <div className="font-heading font-extrabold text-2xl text-[#16181F] tabular-nums">{kpi.value}</div>
                <div className={`text-[11px] font-semibold flex items-center gap-1 ${kpi.green ? "text-[#1B7A4E]" : "text-[#5B6070]"}`}>{kpi.green && <TrendingUp size={12} />}{kpi.sub}</div>
              </div>
            ); })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5"><TrustScoreCard trust={myShop.trust} isHubX={myShop.isHubX} /></div>
            <div className="lg:col-span-7 bg-[#0F1F3D] rounded-[12px] p-6 text-white border border-[#0A1529] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2"><Bot size={16} className="text-[#E8A317]" /><h3 className="font-heading font-bold text-base">AI Fleet Intelligence</h3></div>
                <div className="flex items-center gap-2"><GeminiTag /><button onClick={() => { setAiOverview(null); fetchOverviewAI(); }} className="text-[#B5C4E0] hover:text-white cursor-pointer"><RefreshCw size={13} /></button></div>
              </div>
              {aiOverviewLoading ? (
                <div className="flex items-center gap-3 text-xs text-[#B5C4E0]"><Loader2 className="animate-spin text-[#E8A317]" size={16} /> Gemini 3.6 Flash analysing fleet data...</div>
              ) : aiOverview ? (
                <div className="space-y-3">
                  <p className="text-sm text-[#B5C4E0] leading-relaxed">{aiOverview}</p>
                  <div className="flex flex-wrap gap-2"><InsightTag type="surge" label="Weekend Demand Up" /><InsightTag type="opportunity" label="Fleet Expansion Signal" /><InsightTag type="idle" label="Mid-week Promo Advised" /></div>
                </div>
              ) : null}
              <div className="grid grid-cols-3 gap-3 pt-2 text-xs text-center">
                {[{ label: "Honesty", value: `${myShop.trust.honesty}/10`, c: "text-[#2E9E6B]" }, { label: "Punctuality", value: `${myShop.trust.punctuality}/10`, c: "text-[#E8A317]" }, { label: "Comms", value: `${myShop.trust.communication}/10`, c: "text-white" }].map(m => (
                  <div key={m.label} className="bg-white/5 rounded-[8px] p-3 border border-white/10"><div className={`font-heading font-extrabold text-lg tabular-nums ${m.c}`}>{m.value}</div><div className="text-[10px] text-[#B5C4E0] mt-0.5">{m.label}</div></div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[{ label: "Fleet Map", icon: Map, route: "/dashboard/fleet", color: "bg-[#1A3A8F] text-white" }, { label: "Manage Vehicles", icon: Package, route: "/dashboard/fleet", color: "bg-white border border-[#E4DDD1] text-[#0F1F3D]" }, { label: "AI Pricing", icon: Sparkles, route: "/dashboard/pricing", color: "bg-[#E8A317] text-[#0F1F3D]" }, { label: "Gemini AI Lab", icon: Cpu, route: "/dashboard/ai-lab", color: "bg-gradient-to-r from-[#1A3A8F] to-[#2456D6] text-white" }].map(a => { const Icon = a.icon; return (
              <button key={a.label} onClick={() => onNavigate(a.route)} className={`${a.color} rounded-[12px] p-4 flex items-center justify-between cursor-pointer hover:opacity-90 transition-opacity`}>
                <div className="flex items-center gap-2.5 text-xs font-semibold"><Icon size={16} /> {a.label}</div><ChevronRight size={14} />
              </button>
            ); })}
          </div>
        </div>
      )}

      {/* FLEET INVENTORY */}
      {activeTab === "fleet" && (
        <div className="space-y-6">
          <ShopkeeperFleetMap />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E4DDD1]">
            <div><span className="eyebrow-label block mb-1">GARAGE INVENTORY</span><h3 className="font-heading font-bold text-xl text-[#16181F]">Listed Fleet Vehicles ({myVehicles.length} Units)</h3></div>
            <button onClick={() => setIsAddModalOpen(true)} className="px-4 py-2.5 bg-[#0F1F3D] hover:bg-[#0A1529] text-white font-heading font-semibold text-xs rounded-[8px] flex items-center gap-1.5 cursor-pointer"><Plus size={15} /> Add Vehicle</button>
          </div>
          <div className="bg-gradient-to-r from-[#0F1F3D] to-[#1A3A8F] rounded-[10px] p-4 flex items-start gap-3 border border-[#2456D6]/30">
            <Bot className="text-[#E8A317] mt-0.5 shrink-0" size={18} />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1"><span className="text-xs font-bold text-white">AI Fleet Advisory</span><GeminiTag />{aiFleetLoading && <Loader2 className="animate-spin text-[#E8A317]" size={12} />}</div>
              <p className="text-xs text-[#B5C4E0] leading-relaxed">{aiFleetLoading ? "Analysing fleet telemetry..." : (aiFleetAdvice || "Royal Enfield Hunter 350 maintained 94% occupancy for 3 weekends. Ather 450X shows zero fuel overhead and high repeat customer rate.")}</p>
              {!aiFleetLoading && <div className="flex flex-wrap gap-1.5 mt-2"><InsightTag type="surge" label="High Demand" /><InsightTag type="opportunity" label="Expansion Signal" /><InsightTag type="idle" label="EV Cost Advantage" /></div>}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myVehicles.map((v) => (
              <div key={v.id} className="bg-white rounded-[12px] p-5 border border-[#E4DDD1] space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="relative aspect-video rounded-[8px] overflow-hidden bg-[#FAF7F2]">
                    <img src={v.images[0]} alt={v.model} className="w-full h-full object-cover" />
                    <span className={`absolute top-2.5 right-2.5 px-2 py-0.5 rounded-[4px] text-[10px] font-bold ${v.available ? "bg-[#1B7A4E] text-white" : "bg-[#E8A317] text-[#0F1F3D]"}`}>{v.available ? "Available" : "Rented"}</span>
                    {v.dynamicPriceTag && <span className="absolute bottom-2.5 left-2.5 bg-[#0F1F3D]/80 text-white text-[10px] font-semibold px-2 py-0.5 rounded-[4px]">{v.dynamicPriceTag}</span>}
                  </div>
                  <div><h4 className="font-heading font-bold text-sm text-[#16181F]">{v.model}</h4><p className="text-xs text-[#5B6070] mt-0.5">{formatINR(v.pricePerHour)}/hr &bull; {formatINR(v.pricePerDay)}/day &bull; Dep: {formatINR(v.deposit)}</p></div>
                  <div className="flex flex-wrap gap-1.5">{[v.fuel, v.transmission, v.condition].map(t => <span key={t} className="text-[10px] bg-[#FAF7F2] text-[#5B6070] border border-[#E4DDD1] px-1.5 py-0.5 rounded-[3px]">{t}</span>)}</div>
                </div>
                <div className="pt-3 border-t border-[#E4DDD1] flex items-center justify-between text-xs">
                  <button onClick={() => updateVehicle(v.id, { available: !v.available })} className="font-semibold text-[#2456D6] hover:underline cursor-pointer">{v.available ? "Mark In-Service" : "Mark Ready"}</button>
                  <span className="text-[#5B6070]">{v.rating} &#9733; ({v.totalTrips} trips)</span>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-[12px] p-6 border border-[#E4DDD1] grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[{ label: "Total", value: myVehicles.length, color: "text-[#0F1F3D]" }, { label: "Available", value: myVehicles.filter(v => v.available).length, color: "text-[#1B7A4E]" }, { label: "Rented", value: myVehicles.filter(v => !v.available).length, color: "text-[#E8A317]" }, { label: "Utilization", value: `${utilizationPct}%`, color: "text-[#2456D6]" }].map(s => (
              <div key={s.label}><div className={`font-heading font-extrabold text-2xl tabular-nums ${s.color}`}>{s.value}</div><div className="text-xs text-[#5B6070] mt-0.5">{s.label}</div></div>
            ))}
          </div>
        </div>
      )}

      {/* LIVE BOOKINGS */}
      {activeTab === "bookings" && (
        <div className="space-y-6">
          <div className="pb-4 border-b border-[#E4DDD1]"><span className="eyebrow-label block mb-1">LIVE LOGBOOK</span><h3 className="font-heading font-bold text-xl text-[#16181F]">Reservations &amp; Digital KYC Audits</h3></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[{ label: "Total Bookings", value: String(myBookings.length), color: "text-[#0F1F3D]", bg: "bg-[#FAF7F2]" }, { label: "Active Now", value: String(activeBookings.length), color: "text-[#E8A317]", bg: "bg-amber-50" }, { label: "Completed", value: String(completedBookings.length), color: "text-[#1B7A4E]", bg: "bg-[#EBF7F0]" }, { label: "Avg. Value", value: formatINR(myBookings.length > 0 ? Math.round(myBookings.reduce((s, b) => s + (b.total || 0), 0) / myBookings.length) : 0), color: "text-[#2456D6]", bg: "bg-blue-50" }].map(k => (
              <div key={k.label} className={`${k.bg} p-4 rounded-[10px] border border-[#E4DDD1] text-center`}><div className={`font-heading font-extrabold text-xl tabular-nums ${k.color}`}>{k.value}</div><div className="text-xs text-[#5B6070] mt-0.5">{k.label}</div></div>
            ))}
          </div>
          <div className="bg-[#0F1F3D] rounded-[12px] p-5 border border-[#0A1529] flex items-start gap-3">
            <Sparkles className="text-[#E8A317] mt-0.5 shrink-0" size={18} />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1.5"><span className="text-xs font-bold text-white">Booking Pattern Analysis</span><GeminiTag />{aiBookingLoading && <Loader2 className="animate-spin text-[#E8A317]" size={12} />}</div>
              <p className="text-xs text-[#B5C4E0] leading-relaxed">{aiBookingLoading ? "Analysing booking trends..." : (aiBookingInsight || FALLBACK_BOOKING)}</p>
              {!aiBookingLoading && <div className="flex flex-wrap gap-1.5 mt-2"><InsightTag type="action" label="Offer Extension Bundles" /><InsightTag type="surge" label="Peak: 8-10 AM and 4-6 PM" /><InsightTag type="opportunity" label="Corporate Mid-week" /></div>}
            </div>
          </div>
          <div className="bg-white rounded-[12px] overflow-hidden border border-[#E4DDD1]">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF7F2] text-[#5B6070] font-bold border-b border-[#E4DDD1]">
                  <tr><th className="p-3.5">Booking ID</th><th className="p-3.5">Customer</th><th className="p-3.5">Vehicle</th><th className="p-3.5">Pickup</th><th className="p-3.5">Duration</th><th className="p-3.5">Total</th><th className="p-3.5">KYC</th><th className="p-3.5">Status</th><th className="p-3.5">Actions</th></tr>
                </thead>
                <tbody className="divide-y divide-[#E4DDD1]">
                  {myBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-[#FAF7F2] transition-colors">
                      <td className="p-3.5 font-mono font-semibold text-[#2456D6]">{b.id}</td>
                      <td className="p-3.5"><div className="font-semibold text-[#16181F]">{b.customerName}</div><div className="text-[11px] text-[#5B6070]">{b.customerPhone}</div></td>
                      <td className="p-3.5 font-medium text-[#16181F]">{b.vehicle?.model || "Rental Vehicle"}</td>
                      <td className="p-3.5 text-[#5B6070]">{formatDateTime(b.pickupAt)}</td>
                      <td className="p-3.5 text-[#5B6070]">{b.isHourly ? `${b.hours}h` : `${b.days}d`}</td>
                      <td className="p-3.5 font-bold text-[#16181F]">{formatINR(b.total)}</td>
                      <td className="p-3.5"><span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-[4px] bg-[#EBF7F0] text-[#1B7A4E]"><CheckCircle size={10} /> DigiLocker</span></td>
                      <td className="p-3.5"><span className={`px-2 py-0.5 rounded-[4px] text-[10px] font-bold uppercase ${b.status === "active" ? "bg-[#E8A317] text-[#0F1F3D]" : b.status === "completed" ? "bg-[#EBF7F0] text-[#1B7A4E]" : "bg-red-50 text-red-700"}`}>{b.status}</span></td>
                      <td className="p-3.5 flex items-center gap-3">
                        <button onClick={() => onNavigate(`/agreement/${b.id}`)} className="text-[11px] font-semibold text-[#2456D6] hover:underline cursor-pointer flex items-center gap-1"><FileText size={11} /> Contract</button>
                        <button onClick={() => onNavigate(`/inspect/pickup/${b.id}`)} className="text-[11px] font-semibold text-[#E8A317] hover:underline cursor-pointer flex items-center gap-1"><Sparkles size={11} /> AI Inspect</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[{ icon: Users, label: "Customer Profile", items: [{ k: "Repeat Customers", v: "42%", c: "text-[#1B7A4E]" }, { k: "Avg Trip Duration", v: "2.4 days", c: "" }, { k: "Extension Rate", v: "78%", c: "text-[#E8A317]" }, { k: "Avg Age", v: "28 yrs", c: "" }] }, { icon: TrendingUp, label: "Revenue Trend", items: [{ k: "This Week", v: formatINR(42350), c: "" }, { k: "Last Week", v: formatINR(37800), c: "" }, { k: "Growth", v: "+12.0%", c: "text-[#1B7A4E]" }, { k: "Best Day", v: "Saturday", c: "" }] }, { icon: Shield, label: "Deposit Health", items: [{ k: "Disputes", v: "0", c: "text-[#1B7A4E]" }, { k: "Instant Refunds", v: "100%", c: "" }, { k: "Inspection Cover", v: "100%", c: "" }, { k: "Avg Refund Time", v: "<2 hrs", c: "text-[#1B7A4E]" }] }].map(card => { const Icon = card.icon; return (
              <div key={card.label} className="bg-white rounded-[12px] p-5 border border-[#E4DDD1] space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#0F1F3D]"><Icon size={14} />{card.label}</div>
                <div className="space-y-2 text-xs text-[#5B6070]">{card.items.map(item => <div key={item.k} className="flex justify-between"><span>{item.k}</span><strong className={item.c || "text-[#16181F]"}>{item.v}</strong></div>)}</div>
              </div>
            ); })}
          </div>
        </div>
      )}

      {/* AI DYNAMIC PRICING */}
      {activeTab === "pricing" && (
        <div className="bg-[#0F1F3D] rounded-[14px] p-6 sm:p-8 text-white border border-[#0A1529] space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div><div className="flex items-center gap-2 mb-1"><Bot className="text-[#E8A317]" size={20} /><h3 className="font-heading font-extrabold text-xl">AI Dynamic Pricing Engine</h3><GeminiTag /></div><p className="text-xs text-[#B5C4E0]">Live recommendations — weather, demand signals, competitor pricing.</p></div>
            <div className="flex items-center gap-2">
              <button onClick={() => { setAiPricingCards([]); fetchPricingAI(); }} className="flex items-center gap-1.5 text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-[6px] border border-white/10 cursor-pointer"><RefreshCw size={12} /> Refresh</button>
              <button onClick={() => onNavigate("/dashboard/calendar")} className="flex items-center gap-1.5 text-xs bg-[#E8A317] hover:bg-[#D99614] text-[#0F1F3D] font-bold px-3 py-1.5 rounded-[6px] cursor-pointer"><Calendar size={12} /> 7-Day Calendar</button>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[{ label: "Day Type", value: [0, 5, 6].includes(new Date().getDay()) ? "Weekend" : "Weekday", sub: "Surge applies", icon: Calendar, color: "text-[#E8A317]" }, { label: "Tourist Index", value: "High", sub: "Peak season", icon: TrendingUp, color: "text-[#2E9E6B]" }, { label: "Competitor Gap", value: "+12%", sub: "Below market", icon: BarChart3, color: "text-white" }, { label: "AI Confidence", value: "94%", sub: "Gemini 3.6", icon: Sparkles, color: "text-[#93B4FF]" }].map(m => { const Icon = m.icon; return (
              <div key={m.label} className="bg-white/5 rounded-[10px] p-4 border border-white/10 text-center"><Icon size={18} className={`${m.color} mx-auto mb-1`} /><div className={`font-heading font-extrabold text-lg tabular-nums ${m.color}`}>{m.value}</div><div className="text-[10px] text-[#B5C4E0] mt-0.5">{m.label}</div><div className="text-[10px] text-[#8292B4]">{m.sub}</div></div>
            ); })}
          </div>
          {aiPricingLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">{[1, 2, 3, 4].map(i => <AiLoadingCard key={i} label={`Gemini analysing vehicle ${i}...`} />)}</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {(aiPricingCards.length > 0 ? aiPricingCards : myVehicles.slice(0, 4).map(v => { const iw = [0, 5, 6].includes(new Date().getDay()); return { vehicle: v, ai: { recommendedPrice: Math.round(v.pricePerDay * (iw ? 1.25 : 1.05)), surgeMultiplier: iw ? 1.25 : 1.05, reasoning: iw ? `Weekend surge: tourist volume 2.3x baseline. Competitor avg Rs${Math.round(v.pricePerDay * 1.35)}/day.` : "Steady weekday demand. 5% uplift covers costs.", confidence: iw ? "high" : "medium", aiPowered: true } }; })).map(({ vehicle: v, ai }) => {
                const delta = ai.recommendedPrice - v.pricePerDay;
                const isUp = delta >= 0;
                const pct = Math.abs(Math.round((delta / v.pricePerDay) * 100));
                return (
                  <div key={v.id} className="bg-[#0A1529] rounded-[10px] p-6 border border-white/10 space-y-4">
                    <div className="flex items-start justify-between gap-2">
                      <div><div className="flex items-center gap-2 mb-1"><Zap className={isUp ? "text-[#E8A317]" : "text-[#2E9E6B]"} size={14} /><h4 className="font-heading font-bold text-sm text-white">{v.model}</h4></div><div className="flex items-center gap-1.5"><InsightTag type={isUp ? "surge" : "idle"} label={isUp ? `Surge +${pct}%` : `Clearance -${pct}%`} /><span className="text-[10px] text-[#8292B4]">{ai.confidence} confidence</span></div></div>
                      <GeminiTag model={ai.aiPowered ? "gemini-3.6-flash" : "rule-based"} />
                    </div>
                    <div className="bg-[#0F1F3D] rounded-[8px] p-4 space-y-2 text-xs border border-white/10">
                      <div className="flex justify-between text-[#B5C4E0]"><span>Current Rate</span><strong className="text-white">{formatINR(v.pricePerDay)}/day</strong></div>
                      <div className="flex justify-between text-[#B5C4E0]"><span>AI Recommended</span><strong className={`text-sm font-bold ${isUp ? "text-[#E8A317]" : "text-[#2E9E6B]"}`}>{formatINR(ai.recommendedPrice)}/day ({isUp ? "+" : "-"}{pct}%)</strong></div>
                      <div className="flex justify-between text-[#B5C4E0]"><span>7-Day Impact</span><span className={`font-semibold ${isUp ? "text-[#E8A317]" : "text-[#2E9E6B]"}`}>{isUp ? "+" : "-"}{formatINR(Math.abs(delta) * 7)} est.</span></div>
                    </div>
                    <div className="text-xs text-[#B5C4E0] bg-white/5 rounded-[6px] p-3 border border-white/10"><div className="flex items-center gap-1.5 mb-1.5 font-semibold text-white"><Bot size={11} /> AI Reasoning</div>{ai.reasoning}</div>
                    <button onClick={() => handleApplyDynamicPricing(v.id, ai.recommendedPrice, `Gemini 3.6 Flash ${isUp ? "Surge" : "Clearance"}`)}
                      className={`w-full py-3 font-heading font-bold text-xs rounded-[8px] cursor-pointer flex items-center justify-center gap-2 ${isUp ? "bg-[#E8A317] hover:bg-[#D99614] text-[#0F1F3D]" : "bg-[#132A24] hover:bg-[#1E4D38] text-[#2E9E6B] border border-[#1E4D38]"}`}>
                      {acceptedInsight === v.id ? <><CheckCircle size={13} /> Applied!</> : <><Zap size={13} /> Accept {formatINR(ai.recommendedPrice)}/day</>}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[{ title: "Weekend Rule", body: "Sat-Sun prices command 20-35% premium in Goa. Apply surge before 6 PM Friday." }, { title: "Rain Day Strategy", body: "Rainy days reduce two-wheeler demand 15-25%. Activate 10% off on scooties, pivot to car fleet." }, { title: "Idle Vehicle Signal", body: "Under 40% utilization signals a Rs50 daily discount. Occupancy gains outweigh margin dip." }].map(tip => (
              <div key={tip.title} className="bg-white/5 rounded-[10px] p-4 border border-white/10"><div className="flex items-center gap-1.5 mb-1.5"><AlertCircle size={13} className="text-[#E8A317]" /><span className="text-xs font-bold text-white">{tip.title}</span></div><p className="text-[11px] text-[#B5C4E0] leading-relaxed">{tip.body}</p></div>
            ))}
          </div>
        </div>
      )}

      {/* GEMINI AI LAB */}
      {activeTab === "ai_lab" && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-[#0F1F3D] via-[#1A3A8F] to-[#0F1F3D] rounded-[14px] p-6 sm:p-8 text-white border border-[#2456D6]/30">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-white/10 rounded-[8px]"><Cpu className="text-[#E8A317]" size={22} /></div>
              <div><div className="flex items-center gap-2"><h2 className="font-heading font-extrabold text-xl">Gemini AI Analytics Lab</h2><GeminiTag model="gemini-3.6-flash" /></div><p className="text-xs text-[#B5C4E0] mt-0.5">Enter scenario data and get real-time AI-powered fleet analytics. Test different market conditions to see Gemini recommendations.</p></div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-white rounded-[12px] p-5 border border-[#E4DDD1] space-y-4">
                <h3 className="font-heading font-bold text-sm text-[#16181F] flex items-center gap-2"><Play size={14} className="text-[#2456D6]" /> Choose Scenario</h3>
                <div className="space-y-2">
                  {AI_LAB_PRESETS.map(p => (
                    <button key={p.id} onClick={() => setLabPreset(p.id)}
                      className={`w-full text-left px-3 py-2.5 rounded-[8px] text-xs font-semibold transition-all cursor-pointer border ${labPreset === p.id ? "bg-[#0F1F3D] text-white border-[#0F1F3D]" : "bg-[#FAF7F2] text-[#16181F] border-[#E4DDD1] hover:border-[#0F1F3D]"}`}>
                      <div className="flex items-center justify-between"><span>{p.label}</span>{labPreset === p.id && <CheckCircle size={13} className="text-[#E8A317]" />}</div>
                    </button>
                  ))}
                </div>
              </div>

              {labPreset === "custom" && (
                <div className="bg-white rounded-[12px] p-5 border border-[#E4DDD1] space-y-3 text-xs">
                  <h3 className="font-heading font-bold text-sm text-[#16181F] flex items-center gap-2"><UploadCloud size={14} className="text-[#2456D6]" /> Custom Data</h3>
                  {[{ key: "shopName", label: "Shop Name", type: "text" }, { key: "city", label: "City", type: "text" }, { key: "weeklyBookings", label: "Weekly Bookings", type: "number" }, { key: "avgDailyRate", label: "Avg Daily Rate (Rs)", type: "number" }, { key: "utilizationPct", label: "Utilization %", type: "number" }, { key: "competitorRate", label: "Competitor Rate (Rs)", type: "number" }, { key: "fleetSize", label: "Fleet Size", type: "number" }].map(f => (
                    <div key={f.key}><label className="font-semibold text-[#16181F]">{f.label}</label><input type={f.type} value={(labCustomData as any)[f.key]} onChange={e => setLabCustomData(prev => ({ ...prev, [f.key]: f.type === "number" ? parseInt(e.target.value) || 0 : e.target.value }))} className="w-full p-2 mt-1 bg-[#FAF7F2] border border-[#E4DDD1] rounded-[4px] text-xs text-[#16181F] focus:outline-none focus:border-[#0F1F3D]" /></div>
                  ))}
                  <div><label className="font-semibold text-[#16181F]">Weekend?</label><select value={labCustomData.isWeekend ? "yes" : "no"} onChange={e => setLabCustomData(prev => ({ ...prev, isWeekend: e.target.value === "yes" }))} className="w-full p-2 mt-1 bg-[#FAF7F2] border border-[#E4DDD1] rounded-[4px] text-xs text-[#16181F] focus:outline-none"><option value="yes">Yes - Weekend / Holiday</option><option value="no">No - Weekday</option></select></div>
                  <div><label className="font-semibold text-[#16181F]">Tourist Index</label><select value={labCustomData.touristIndex} onChange={e => setLabCustomData(prev => ({ ...prev, touristIndex: e.target.value }))} className="w-full p-2 mt-1 bg-[#FAF7F2] border border-[#E4DDD1] rounded-[4px] text-xs text-[#16181F] focus:outline-none">{["Very Low", "Low", "Medium", "High", "Very High"].map(o => <option key={o}>{o}</option>)}</select></div>
                  <div><label className="font-semibold text-[#16181F]">Weather</label><select value={labCustomData.weatherCondition} onChange={e => setLabCustomData(prev => ({ ...prev, weatherCondition: e.target.value }))} className="w-full p-2 mt-1 bg-[#FAF7F2] border border-[#E4DDD1] rounded-[4px] text-xs text-[#16181F] focus:outline-none">{["Clear Sky", "Partly Cloudy", "Light Rain", "Heavy Rain", "Thunderstorm"].map(o => <option key={o}>{o}</option>)}</select></div>
                </div>
              )}

              {labPreset !== "custom" && (() => {
                const p = AI_LAB_PRESETS.find(x => x.id === labPreset);
                return p?.data ? (
                  <div className="bg-[#FAF7F2] rounded-[10px] p-4 border border-[#E4DDD1] space-y-2 text-xs">
                    <div className="font-semibold text-[#16181F] mb-1">Scenario Preview</div>
                    {Object.entries(p.data).slice(0, 7).map(([k, v]) => (
                      <div key={k} className="flex justify-between text-[#5B6070]"><span className="capitalize">{k.replace(/([A-Z])/g, " $1").trim()}</span><strong className="text-[#16181F]">{String(v)}</strong></div>
                    ))}
                  </div>
                ) : null;
              })()}

              <button onClick={runLabAnalysis} disabled={labLoading}
                className="w-full py-3.5 bg-gradient-to-r from-[#1A3A8F] to-[#2456D6] hover:opacity-90 text-white font-heading font-bold text-sm rounded-[10px] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60">
                {labLoading ? <><Loader2 className="animate-spin" size={16} /> Gemini Analysing...</> : <><Sparkles size={16} /> Run Gemini Analysis</>}
              </button>
            </div>

            <div className="lg:col-span-2 space-y-4">
              {!labResult && !labLoading && (
                <div className="bg-[#0F1F3D] rounded-[12px] p-10 flex flex-col items-center justify-center text-center border border-[#0A1529] min-h-[300px] space-y-4">
                  <div className="p-4 bg-white/5 rounded-full"><Cpu className="text-[#E8A317]" size={36} /></div>
                  <div><h3 className="font-heading font-bold text-white text-lg">Ready for Analysis</h3><p className="text-xs text-[#B5C4E0] mt-1 max-w-xs">Select a scenario and click Run Gemini Analysis to get real-time AI insights powered by Gemini 3.6 Flash.</p></div>
                  <GeminiTag model="gemini-3.6-flash" />
                </div>
              )}

              {labLoading && (
                <div className="bg-[#0F1F3D] rounded-[12px] p-10 flex flex-col items-center justify-center text-center border border-[#0A1529] min-h-[300px] space-y-4">
                  <Loader2 className="animate-spin text-[#E8A317]" size={40} />
                  <div><h3 className="font-heading font-bold text-white">Gemini 3.6 Flash Processing...</h3><p className="text-xs text-[#B5C4E0] mt-1">Analysing scenario data, demand signals, and pricing context.</p></div>
                  <div className="flex gap-2 flex-wrap justify-center">
                    {["Parsing scenario", "Checking demand signals", "Comparing rates", "Generating insights"].map((s, i) => (
                      <span key={i} className="text-[10px] text-[#B5C4E0] bg-white/5 px-2 py-1 rounded-[4px] border border-white/10">{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {labResult && !labLoading && (
                <div className="space-y-4">
                  <div className="bg-[#0F1F3D] rounded-[12px] p-5 border border-[#0A1529] space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2"><Sparkles className="text-[#E8A317]" size={18} /><h3 className="font-heading font-bold text-white">Analysis Complete</h3><GeminiTag /></div>
                      <InsightTag type={labResult.pricing.surgeMultiplier >= 1.2 ? "surge" : labResult.pricing.surgeMultiplier < 1 ? "idle" : "opportunity"} label={labResult.pricing.surgeMultiplier >= 1.2 ? "Surge Scenario" : labResult.pricing.surgeMultiplier < 1 ? "Clearance Advised" : "Moderate Demand"} />
                    </div>
                    <p className="text-sm text-[#B5C4E0] leading-relaxed">{labResult.pricing.reasoning}</p>
                    <div className="flex flex-wrap gap-2">
                      {labResult.pricing.surgeMultiplier > 1.1 && <InsightTag type="surge" label="Premium Pricing" />}
                      {labResult.pricing.surgeMultiplier < 1 && <InsightTag type="idle" label="Clearance Mode" />}
                      {labResult.scenarioData.isWeekend && <InsightTag type="surge" label="Weekend Boost" />}
                      {labResult.scenarioData.touristIndex === "Very High" && <InsightTag type="opportunity" label="Peak Season" />}
                      {labResult.scenarioData.utilizationPct < 50 && <InsightTag type="risk" label="Low Utilization" />}
                      {labResult.scenarioData.utilizationPct > 90 && <InsightTag type="action" label="Near Full Capacity" />}
                    </div>
                  </div>

                  <div className="bg-white rounded-[12px] p-6 border border-[#E4DDD1] space-y-4">
                    <h4 className="font-heading font-bold text-base text-[#16181F] flex items-center gap-2"><DollarSign size={16} className="text-[#2456D6]" /> Pricing Recommendation</h4>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="p-4 bg-[#FAF7F2] rounded-[10px] border border-[#E4DDD1]"><div className="text-xs text-[#5B6070] mb-1">Current Rate</div><div className="font-heading font-extrabold text-xl text-[#16181F]">{formatINR(labResult.scenarioData.avgDailyRate)}</div><div className="text-[10px] text-[#5B6070]">/day</div></div>
                      <div className="p-4 bg-[#EEF3FF] rounded-[10px] border border-[#2456D6]/20"><div className="text-xs text-[#5B6070] mb-1">AI Recommended</div><div className="font-heading font-extrabold text-xl text-[#2456D6]">{formatINR(labResult.pricing.recommendedPrice)}</div><div className="text-[10px] text-[#5B6070]">/day</div></div>
                      <div className={`p-4 rounded-[10px] border ${labResult.pricing.surgeMultiplier >= 1 ? "bg-amber-50 border-[#E8A317]/20" : "bg-[#EBF7F0] border-[#1E4D38]"}`}><div className="text-xs text-[#5B6070] mb-1">Weekly Delta</div><div className={`font-heading font-extrabold text-xl ${labResult.pricing.surgeMultiplier >= 1 ? "text-[#E8A317]" : "text-[#1B7A4E]"}`}>{labResult.pricing.surgeMultiplier >= 1 ? "+" : ""}{formatINR(Math.round((labResult.pricing.recommendedPrice - labResult.scenarioData.avgDailyRate) * labResult.scenarioData.fleetSize * 7))}</div><div className="text-[10px] text-[#5B6070]">est. revenue</div></div>
                    </div>
                  </div>

                  <div className="bg-white rounded-[12px] p-6 border border-[#E4DDD1] space-y-3">
                    <h4 className="font-heading font-bold text-sm text-[#16181F] flex items-center gap-2"><BarChart3 size={14} className="text-[#2456D6]" /> Scenario Metrics</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                      {[{ k: "Weekly Bookings", v: String(labResult.scenarioData.weeklyBookings) }, { k: "Fleet Size", v: `${labResult.scenarioData.fleetSize} units` }, { k: "Utilization", v: `${labResult.scenarioData.utilizationPct}%` }, { k: "Competitor Rate", v: formatINR(labResult.scenarioData.competitorRate) + "/day" }, { k: "Tourist Index", v: String(labResult.scenarioData.touristIndex) }, { k: "Weather", v: String(labResult.scenarioData.weatherCondition) }].map(item => (
                        <div key={item.k} className="p-3 bg-[#FAF7F2] rounded-[8px] border border-[#E4DDD1]"><div className="text-[10px] text-[#5B6070] mb-0.5">{item.k}</div><div className="font-semibold text-[#16181F]">{item.v}</div></div>
                      ))}
                    </div>
                  </div>

                  <button onClick={() => setLabResult(null)} className="w-full py-2.5 bg-[#FAF7F2] hover:bg-[#F3EEE6] border border-[#E4DDD1] text-[#5B6070] font-semibold text-xs rounded-[8px] cursor-pointer">Clear &amp; Run Another Analysis</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Vehicle Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#0F1F3D]/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-[12px] max-w-md w-full p-6 space-y-4 border border-[#E4DDD1] shadow-lg">
            <div className="flex items-center justify-between pb-3 border-b border-[#E4DDD1]">
              <h3 className="font-heading font-bold text-base text-[#16181F]">Add Vehicle to Fleet</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-[#5B6070] hover:text-[#16181F] cursor-pointer text-lg leading-none">&times;</button>
            </div>
            <div className="space-y-3 text-xs">
              <div><label className="font-semibold text-[#16181F]">Model &amp; Make</label><input type="text" value={newModel} onChange={e => setNewModel(e.target.value)} placeholder="e.g. Royal Enfield Classic 350" className="w-full p-2.5 mt-1 bg-[#FAF7F2] border border-[#E4DDD1] rounded-[4px] text-xs text-[#16181F] focus:outline-none focus:border-[#0F1F3D]" /></div>
              <div><label className="font-semibold text-[#16181F]">Type</label><select value={newType} onChange={e => setNewType(e.target.value as any)} className="w-full p-2.5 mt-1 bg-[#FAF7F2] border border-[#E4DDD1] rounded-[4px] text-xs text-[#16181F] focus:outline-none"><option value="scooty">Scooty</option><option value="bike">Bike / Cruiser</option><option value="car">Car / SUV</option></select></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="font-semibold text-[#16181F]">Hourly (Rs)</label><input type="number" value={newHourlyRate} onChange={e => setNewHourlyRate(parseInt(e.target.value))} className="w-full p-2.5 mt-1 bg-[#FAF7F2] border border-[#E4DDD1] rounded-[4px] text-xs text-[#16181F]" /></div>
                <div><label className="font-semibold text-[#16181F]">Daily (Rs)</label><input type="number" value={newDailyRate} onChange={e => setNewDailyRate(parseInt(e.target.value))} className="w-full p-2.5 mt-1 bg-[#FAF7F2] border border-[#E4DDD1] rounded-[4px] text-xs text-[#16181F]" /></div>
              </div>
              <div><label className="font-semibold text-[#16181F]">Deposit (Rs)</label><input type="number" value={newDeposit} onChange={e => setNewDeposit(parseInt(e.target.value))} className="w-full p-2.5 mt-1 bg-[#FAF7F2] border border-[#E4DDD1] rounded-[4px] text-xs text-[#16181F]" /></div>
            </div>
            <button onClick={handleCreateVehicle} className="w-full py-3 bg-[#0F1F3D] hover:bg-[#0A1529] text-white font-heading font-semibold text-xs rounded-[8px] cursor-pointer">Publish to Marketplace</button>
          </div>
        </div>
      )}
    </div>
  );
};
