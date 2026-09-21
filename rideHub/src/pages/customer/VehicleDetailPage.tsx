import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { formatINR } from "../../utils/formatters";
import { TrustScoreCard } from "../../components/common/TrustScoreCard";
import { WalkaroundModal } from "../../components/common/WalkaroundModal";
import { 
  Fuel, 
  Gauge, 
  Calendar, 
  CheckCircle2, 
  ArrowLeft, 
  ChevronRight, 
  Package, 
  Wrench, 
  Camera, 
  Truck,
  Video,
  Play
} from "lucide-react";

interface VehicleDetailPageProps {
  vehicleId: string;
  onBack: () => void;
  onBook: (vehicleId: string) => void;
  onSelectShop: (shopId: string) => void;
}

export const VehicleDetailPage: React.FC<VehicleDetailPageProps> = ({
  vehicleId,
  onBack,
  onBook,
  onSelectShop,
}) => {
  const { vehicles, shops } = useApp();
  const vehicle = vehicles.find((v) => v.id === vehicleId) || vehicles[0];
  const shop = shops.find((s) => s.id === vehicle.shopId) || shops[0];
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [isWalkaroundOpen, setIsWalkaroundOpen] = useState(false);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-semibold text-[#16181F] hover:bg-[#F3EEE6] bg-white px-3.5 py-2 rounded-[8px] border border-[#E4DDD1] transition-colors duration-200 cursor-pointer shadow-[0_1px_2px_rgba(15,31,61,0.06)]"
      >
        <ArrowLeft size={14} />
        <span>Back to Fleet Directory</span>
      </button>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Photos Gallery & Specs (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Photo Display */}
          <div className="bg-[#F3EEE6] rounded-[12px] overflow-hidden border border-[#E4DDD1] shadow-[0_1px_2px_rgba(15,31,61,0.06)] relative">
            <div className="relative aspect-16/10 bg-[#FAF7F2]">
              <img
                src={vehicle.images[selectedImageIdx] || vehicle.images[0]}
                alt={vehicle.model}
                className="w-full h-full object-cover"
              />

              {vehicle.dynamicPriceTag && (
                <div className="absolute top-4 left-4 bg-[#0F1F3D] text-white text-xs font-bold px-3 py-1 rounded-[4px]">
                  <span>{vehicle.dynamicPriceTag}</span>
                </div>
              )}

              {/* 360 Walkaround Overlay Trigger */}
              <button
                type="button"
                onClick={() => setIsWalkaroundOpen(true)}
                className="absolute bottom-4 right-4 bg-[#0F1F3D]/90 hover:bg-[#0F1F3D] text-white px-3.5 py-2 rounded-[8px] text-xs font-bold flex items-center gap-2 backdrop-blur-xs border border-white/15 cursor-pointer shadow-md transition-transform active:scale-95"
              >
                <Play size={14} className="fill-[#E8A317] text-[#E8A317]" />
                <span>360° Digital Inspection Walkaround</span>
              </button>
            </div>

            {/* Photo selector thumbnails */}
            {vehicle.images.length > 1 && (
              <div className="p-3 bg-white flex items-center justify-between border-t border-[#E4DDD1]">
                <div className="flex items-center gap-2">
                  {vehicle.images.map((img, idx) => (
                    <button
                      key={img}
                      onClick={() => setSelectedImageIdx(idx)}
                      className={`w-12 h-9 rounded-[4px] overflow-hidden border-2 transition-colors cursor-pointer ${
                        selectedImageIdx === idx ? "border-[#0F1F3D]" : "border-[#E4DDD1] opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img src={img} alt="Thumb" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
                <span className="text-[11px] text-[#5B6070] flex items-center gap-1 font-medium">
                  <Camera size={12} /> {vehicle.images.length} Inspected Photos
                </span>
              </div>
            )}
          </div>

          {/* Vehicle Specs Breakdown */}
          <div className="bg-white rounded-[12px] p-6 sm:p-8 border border-[#E4DDD1] shadow-[0_1px_2px_rgba(15,31,61,0.06)] space-y-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#5B6070] uppercase tracking-wider mb-1">
                <span>{vehicle.brand}</span>
                <span>•</span>
                <span>Year {vehicle.year}</span>
                <span>•</span>
                <span className="text-[#2456D6] font-semibold">{vehicle.transmission}</span>
              </div>
              <h1 className="font-heading font-bold text-2xl sm:text-3xl text-[#16181F]">
                {vehicle.model}
              </h1>
            </div>

            {/* Specs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-[8px] bg-[#FAF7F2] border border-[#E4DDD1]">
                <span className="text-[11px] text-[#5B6070] font-semibold flex items-center gap-1">
                  <Fuel size={12} className="text-[#2456D6]" /> Fuel Type
                </span>
                <p className="font-bold text-sm text-[#16181F] mt-1">{vehicle.fuel}</p>
              </div>

              <div className="p-3.5 rounded-[8px] bg-[#FAF7F2] border border-[#E4DDD1]">
                <span className="text-[11px] text-[#5B6070] font-semibold flex items-center gap-1">
                  <Gauge size={12} className="text-[#2456D6]" /> Fuel Mileage
                </span>
                <p className="font-bold text-sm text-[#16181F] mt-1">{vehicle.mileage}</p>
              </div>

              <div className="p-3.5 rounded-[8px] bg-[#EBF7F0] border border-[#C3E7D3]">
                <span className="text-[11px] text-[#1B7A4E] font-semibold flex items-center gap-1">
                  <CheckCircle2 size={12} className="text-[#1B7A4E]" /> Condition
                </span>
                <p className="font-bold text-sm text-[#1B7A4E] mt-1">{vehicle.condition} Rated</p>
              </div>

              <div className="p-3.5 rounded-[8px] bg-[#FAF7F2] border border-[#E4DDD1]">
                <span className="text-[11px] text-[#5B6070] font-semibold flex items-center gap-1">
                  <Calendar size={12} className="text-[#2456D6]" /> Model Year
                </span>
                <p className="font-bold text-sm text-[#16181F] mt-1 tabular-nums">{vehicle.year}</p>
              </div>
            </div>

            {/* Pre-existing Inspection Transparency */}
            <div className="p-4 rounded-[8px] bg-[#FAF7F2] border border-[#E4DDD1] space-y-1.5">
              <div className="flex items-center gap-2 text-[#16181F] font-bold text-xs">
                <Wrench size={14} className="text-[#2456D6]" />
                <span>Pre-Rental Inspection Transparency Log</span>
              </div>
              <p className="text-xs text-[#5B6070] leading-relaxed">
                {vehicle.damageNotes}
              </p>
              <p className="text-[11px] text-[#1B7A4E] font-medium">
                All pre-existing scratch markings are timestamped in the rental agreement to protect your security deposit.
              </p>
            </div>

            {/* Included Accessories */}
            <div className="space-y-2.5">
              <h4 className="font-heading font-bold text-sm text-[#16181F] flex items-center gap-1.5">
                <Package size={15} className="text-[#2456D6]" />
                <span>Included Gear & Accessories</span>
              </h4>
              <div className="flex flex-wrap gap-2">
                {vehicle.accessories.map((acc) => (
                  <span
                    key={acc}
                    className="bg-[#FAF7F2] border border-[#E4DDD1] text-[#16181F] px-2.5 py-1 rounded-[4px] text-xs font-medium flex items-center gap-1.5"
                  >
                    <CheckCircle2 size={12} className="text-[#1B7A4E]" />
                    <span>{acc}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Shop Profile & Community Trust Card */}
          <div className="bg-white rounded-[12px] p-6 sm:p-8 border border-[#E4DDD1] shadow-[0_1px_2px_rgba(15,31,61,0.06)] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[6px] bg-[#0F1F3D] text-white font-bold flex items-center justify-center text-base">
                  {shop.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-heading font-bold text-base text-[#16181F]">
                      {shop.name}
                    </h3>
                    {shop.isHubX && (
                      <span className="bg-[#E8A317] text-[#0F1F3D] text-[10px] font-black px-2 py-0.5 rounded-[4px] uppercase tracking-wider">
                        HubX Partner
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#5B6070]">{shop.address}</p>
                </div>
              </div>
              <button
                onClick={() => onSelectShop(shop.id)}
                className="text-xs font-semibold text-[#2456D6] hover:underline cursor-pointer"
              >
                View Hub →
              </button>
            </div>

            <TrustScoreCard trust={shop.trust} isHubX={shop.isHubX} />
          </div>
        </div>

        {/* Right Column: Pricing & Booking Action (5 cols) */}
        <div className="lg:col-span-5 sticky top-24 space-y-5">
          <div className="bg-white rounded-[12px] p-6 sm:p-7 border border-[#E4DDD1] shadow-[0_1px_2px_rgba(15,31,61,0.06)] space-y-5">
            {/* Rates */}
            <div className="space-y-1">
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-medium text-[#5B6070]">Hourly Rate</span>
                <div className="flex items-baseline gap-1">
                  <span className="font-heading font-bold text-2xl text-[#16181F] tabular-nums">
                    {formatINR(vehicle.pricePerHour)}
                  </span>
                  <span className="text-xs text-[#5B6070]">/hr</span>
                </div>
              </div>

              <div className="flex items-baseline justify-between pt-2 border-t border-[#E4DDD1]">
                <span className="text-xs font-medium text-[#5B6070]">24-Hour Daily Plan</span>
                <div className="flex items-baseline gap-1">
                  <span className="font-heading font-bold text-xl text-[#1B7A4E] tabular-nums">
                    {formatINR(vehicle.pricePerDay)}
                  </span>
                  <span className="text-xs text-[#5B6070]">/day</span>
                </div>
              </div>
            </div>

            {/* Area Delivery Notice Box */}
            <div className="p-3.5 rounded-[6px] bg-[#FAF7F2] border border-[#E4DDD1] space-y-1 text-xs">
              <div className="flex items-center gap-1.5 text-[#2456D6] font-semibold">
                <Truck size={13} />
                <span>Doorstep Area Delivery Available</span>
              </div>
              <p className="text-[11px] text-[#5B6070]">
                Choose garage pickup (Free) or doorstep delivery to your area (from +₹99) dynamically calculated at checkout.
              </p>
            </div>

            {/* Deposit & Perks */}
            <div className="p-4 rounded-[6px] bg-[#FAF7F2] border border-[#E4DDD1] text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-[#5B6070]">Refundable Security Deposit:</span>
                <strong className="text-[#16181F] tabular-nums">{formatINR(vehicle.deposit)}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5B6070]">Fuel Policy:</span>
                <strong className="text-[#16181F]">Same-to-Same level</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5B6070]">Loyalty Points Earned:</span>
                <strong className="text-[#0F1F3D] tabular-nums">+{Math.floor(vehicle.pricePerDay / 10)} pts (HubX)</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5B6070]">Hotel Sponsor Perks:</span>
                <strong className="text-[#1B7A4E]">Taj Vivanta & Ginger Coupons</strong>
              </div>
            </div>

            {/* Book Now Button: Single Key Amber CTA on this screen */}
            <button
              onClick={() => onBook(vehicle.id)}
              className="w-full py-3.5 bg-[#E8A317] hover:bg-[#D99614] text-[#0F1F3D] font-heading font-bold text-sm rounded-[8px] transition-colors duration-200 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Book This Vehicle Now</span>
              <ChevronRight size={16} />
            </button>

            <p className="text-center text-[11px] text-[#5B6070]">
              Instant confirmation • Paperless digital KYC • Guaranteed deposit refund
            </p>
          </div>
        </div>
      </div>

      {/* 360 Walkaround Modal */}
      {isWalkaroundOpen && (
        <WalkaroundModal vehicle={vehicle} onClose={() => setIsWalkaroundOpen(false)} />
      )}
    </div>
  );
};
