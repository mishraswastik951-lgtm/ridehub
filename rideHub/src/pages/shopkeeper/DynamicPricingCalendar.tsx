import React, { useState } from "react";
import {
  Calendar as CalendarIcon,
  Sparkles,
  TrendingUp,
  SlidersHorizontal,
  CheckCircle2,
  Info,
  ArrowLeft
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { formatINR } from "../../utils/formatters";

interface DynamicPricingCalendarProps {
  onBack?: () => void;
}

export const DynamicPricingCalendar: React.FC<DynamicPricingCalendarProps> = ({ onBack }) => {
  const { vehicles, shops, addToast, updateShopDynamicPricing } = useApp();
  const shop = shops[0];
  const shopVehicles = vehicles.filter((v) => v.shopId === shop.id);

  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(shopVehicles[0]?.id || "veh-1");
  const [autoWeekendSurge, setAutoWeekendSurge] = useState(true);
  const [autoWeatherSurge, setAutoWeatherSurge] = useState(true);

  const selectedVehicle = shopVehicles.find((v) => v.id === selectedVehicleId) || shopVehicles[0] || vehicles[0];

  const days = [
    { day: "Mon", date: "22 Sep", isWeekend: false, surge: 0, reason: "Standard Base Demand" },
    { day: "Tue", date: "23 Sep", isWeekend: false, surge: 0, reason: "Standard Base Demand" },
    { day: "Wed", date: "24 Sep", isWeekend: false, surge: 0, reason: "Standard Base Demand" },
    { day: "Thu", date: "25 Sep", isWeekend: false, surge: 20, reason: "Pre-weekend Influx" },
    { day: "Fri", date: "26 Sep", isWeekend: false, surge: 50, reason: "Evening Leisure Influx" },
    { day: "Sat", date: "27 Sep", isWeekend: true, surge: autoWeekendSurge ? 80 : 0, reason: "Peak Weekend Getaways" },
    { day: "Sun", date: "28 Sep", isWeekend: true, surge: autoWeekendSurge ? 70 : 0, reason: "Sunday Coastal Tour" },
  ];

  const handleSaveCalendar = () => {
    updateShopDynamicPricing(shop.id, selectedVehicle.id, selectedVehicle.pricePerDay + 80, "AI Dynamic Calendar Surges Applied");
    addToast({
      type: "success",
      title: "Pricing Calendar Synchronized",
      message: `Weekly rate adjustments published across RideHub for ${selectedVehicle.model}.`,
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#E4DDD1]">
        <div>
          {onBack && (
            <button
              onClick={onBack}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#16181F] hover:bg-[#F3EEE6] bg-white px-3 py-1.5 rounded-[8px] border border-[#E4DDD1] mb-2 cursor-pointer"
            >
              <ArrowLeft size={14} /> Back to Control Desk
            </button>
          )}
          <div className="inline-flex items-center gap-1.5 bg-[#E8A317]/15 border border-[#E8A317]/40 px-2.5 py-0.5 rounded-[4px] text-[11px] font-bold text-[#0F1F3D]">
            <Sparkles size={12} className="text-[#E8A317]" />
            <span>Gemini AI Dynamic Pricing Calendar</span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#16181F] mt-1">
            7-Day Predictive Pricing Calendar
          </h1>
          <p className="text-xs text-[#5B6070] mt-0.5">
            Automated weather, tourist surge, and local occupancy rate adjustments for {shop.name}
          </p>
        </div>

        <button
          onClick={handleSaveCalendar}
          className="px-5 py-2.5 bg-[#0F1F3D] hover:bg-[#0A1529] text-white font-heading font-bold text-xs rounded-[8px] transition-colors cursor-pointer shadow-xs"
        >
          Publish Weekly Schedule
        </button>
      </div>

      {/* Vehicle Selector Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {shopVehicles.map((v) => (
          <button
            key={v.id}
            onClick={() => setSelectedVehicleId(v.id)}
            className={`px-4 py-2 rounded-[8px] text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              selectedVehicle.id === v.id
                ? "bg-[#0F1F3D] text-white"
                : "bg-white text-[#5B6070] border border-[#E4DDD1] hover:bg-[#F3EEE6]"
            }`}
          >
            <span>{v.model}</span>
            <span className="opacity-75 ml-1.5">({formatINR(v.pricePerDay)}/d)</span>
          </button>
        ))}
      </div>

      {/* 7-Day Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-7 gap-3">
        {days.map((item) => {
          const projectedRate = selectedVehicle.pricePerDay + item.surge;
          return (
            <div
              key={item.day}
              className={`p-4 rounded-[10px] border transition-all flex flex-col justify-between ${
                item.isWeekend
                  ? "bg-[#FAF7F2] border-[#E8A317]/60 shadow-[0_2px_8px_rgba(232,163,23,0.1)]"
                  : "bg-white border-[#E4DDD1]"
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-xs text-[#5B6070]">
                  <span className="font-heading font-bold text-sm text-[#16181F]">{item.day}</span>
                  <span className="text-[11px]">{item.date}</span>
                </div>

                <div className="mt-3">
                  <span className="text-[10px] text-[#5B6070] uppercase font-bold block">Live Rate</span>
                  <strong className="font-heading font-extrabold text-xl text-[#0F1F3D] tabular-nums">
                    {formatINR(projectedRate)}
                  </strong>
                </div>

                {item.surge > 0 ? (
                  <span className="inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-[4px] bg-[#EBF7F0] text-[#1B7A4E] border border-[#2E9E6B]/20">
                    +{formatINR(item.surge)} Surge
                  </span>
                ) : (
                  <span className="inline-block mt-2 text-[10px] font-semibold px-2 py-0.5 rounded-[4px] bg-[#FAF7F2] text-[#5B6070] border border-[#E4DDD1]">
                    Base Rate
                  </span>
                )}
              </div>

              <p className="text-[10px] text-[#5B6070] mt-4 pt-2 border-t border-[#E4DDD1] leading-tight">
                {item.reason}
              </p>
            </div>
          );
        })}
      </div>

      {/* Automated Surge Controls */}
      <div className="bg-white rounded-[12px] p-6 border border-[#E4DDD1] shadow-xs space-y-4">
        <h3 className="font-heading font-bold text-sm text-[#16181F] flex items-center gap-2">
          <SlidersHorizontal size={15} className="text-[#2456D6]" />
          <span>Dynamic Surge Policy Rules</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <label className="flex items-start gap-3 p-3 bg-[#FAF7F2] rounded-[8px] border border-[#E4DDD1] cursor-pointer">
            <input
              type="checkbox"
              checked={autoWeekendSurge}
              onChange={(e) => setAutoWeekendSurge(e.target.checked)}
              className="accent-[#0F1F3D] w-4 h-4 mt-0.5"
            />
            <div>
              <strong className="text-[#16181F] block font-semibold">Automatic Weekend Surge (+25% to +35%)</strong>
              <span className="text-[#5B6070] text-[11px]">
                Applies peak Friday-Sunday rates when regional occupancy crosses 75%.
              </span>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3 bg-[#FAF7F2] rounded-[8px] border border-[#E4DDD1] cursor-pointer">
            <input
              type="checkbox"
              checked={autoWeatherSurge}
              onChange={(e) => setAutoWeatherSurge(e.target.checked)}
              className="accent-[#0F1F3D] w-4 h-4 mt-0.5"
            />
            <div>
              <strong className="text-[#16181F] block font-semibold">Open-Meteo Weather Surge Multiplier</strong>
              <span className="text-[#5B6070] text-[11px]">
                Automatically discounts two-wheelers during monsoon showers and boosts clear sky leisure rates.
              </span>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
};
