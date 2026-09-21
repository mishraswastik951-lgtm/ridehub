import React from "react";
import type { Vehicle } from "../../types";
import { formatINR } from "../../utils/formatters";
import {
  Fuel,
  Gauge,
  ShieldCheck,
  ChevronRight,
  Bike,
  Car,
  MapPin
} from "lucide-react";

interface VehicleCardProps {
  vehicle: Vehicle;
  onSelect: (vehicleId: string) => void;
  onQuickBook?: (vehicleId: string) => void;
}

export const VehicleCard: React.FC<VehicleCardProps> = ({ vehicle, onSelect, onQuickBook }) => {
  return (
    <div className="bg-white rounded-[12px] overflow-hidden border border-[#E4DDD1] shadow-[0_1px_2px_rgba(15,31,61,0.06)] hover:-translate-y-0.5 hover:shadow-[0_4px_10px_rgba(15,31,61,0.08)] transition-all duration-200 ease-out flex flex-col group">
      {/* Media Image Thumbnail */}
      <div className="relative aspect-16/10 overflow-hidden bg-[#F3EEE6]">
        <img
          src={vehicle.images[0]}
          alt={vehicle.model}
          className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-103"
          loading="lazy"
        />

        {/* Dynamic Pricing Tag / Seasonal Tag */}
        {vehicle.dynamicPriceTag && (
          <div className="absolute top-3 left-3 bg-[#0F1F3D] text-white px-2.5 py-1 rounded-[4px] text-[11px] font-semibold tracking-wide">
            {vehicle.dynamicPriceTag}
          </div>
        )}

        {/* Vehicle Type Icon Badge */}
        <div className="absolute top-3 right-3 bg-white border border-[#E4DDD1] text-[#0F1F3D] p-1.5 rounded-[4px]">
          {vehicle.type === "car" ? <Car size={15} /> : <Bike size={15} />}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Shop name & verified trips */}
          <div className="flex items-center justify-between text-xs text-[#5B6070] mb-1.5">
            <span className="truncate font-medium flex items-center gap-1">
              <MapPin size={12} className="text-[#2456D6] shrink-0" />
              {vehicle.shopName || "Nearby Partner Hub"}
            </span>
            <span className="font-semibold text-[#1B7A4E] shrink-0 flex items-center gap-1 tabular-nums">
              <ShieldCheck size={13} /> {vehicle.rating} ({vehicle.totalTrips} trips)
            </span>
          </div>

          <h3
            onClick={() => onSelect(vehicle.id)}
            className="font-heading font-bold text-base text-[#16181F] group-hover:text-[#2456D6] transition-colors duration-200 cursor-pointer line-clamp-1"
          >
            {vehicle.model}
          </h3>

          {/* Quick Specs Chips - 4px radius */}
          <div className="flex flex-wrap items-center gap-2 mt-2.5 text-[11px] text-[#5B6070]">
            <span className="bg-[#FAF7F2] border border-[#E4DDD1] px-2 py-0.5 rounded-[4px] flex items-center gap-1">
              <Fuel size={11} /> {vehicle.fuel}
            </span>
            <span className="bg-[#FAF7F2] border border-[#E4DDD1] px-2 py-0.5 rounded-[4px] flex items-center gap-1">
              <Gauge size={11} /> {vehicle.mileage}
            </span>
            <span className="bg-[#EBF7F0] border border-[#C3E7D3] text-[#1B7A4E] px-2 py-0.5 rounded-[4px] font-medium">
              {vehicle.condition} Condition
            </span>
          </div>
        </div>

        {/* Price & Action Row */}
        <div className="mt-4 pt-3 border-t border-[#E4DDD1] flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="font-heading font-bold text-lg text-[#16181F] tabular-nums">
                {formatINR(vehicle.pricePerHour)}
              </span>
              <span className="text-xs text-[#5B6070] font-normal">/hr</span>
              <span className="text-xs text-[#5B6070] ml-1 tabular-nums">
                ({formatINR(vehicle.pricePerDay)}/day)
              </span>
            </div>
            <p className="text-[11px] text-[#5B6070] tabular-nums">
              Deposit: {formatINR(vehicle.deposit)} (Refundable)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onSelect(vehicle.id)}
              className="px-3 py-1.5 text-xs font-semibold text-[#16181F] bg-transparent hover:bg-[#F3EEE6] border border-[#E4DDD1] rounded-[8px] transition-colors duration-200 cursor-pointer"
            >
              Details
            </button>
            <button
              onClick={() => onQuickBook ? onQuickBook(vehicle.id) : onSelect(vehicle.id)}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#2456D6] hover:bg-[#1B44AE] rounded-[8px] transition-colors duration-200 cursor-pointer flex items-center gap-1"
            >
              <span>Book</span>
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};