import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { VehicleCard } from "../../components/common/VehicleCard";
import { TrustScoreCard } from "../../components/common/TrustScoreCard";
import { LocationMapPickerModal } from "../../components/common/LocationMapPickerModal";
import { 
  MapPin, 
  Bike, 
  Search, 
  Layers, 
  Compass,
  Crosshair,
  Map,
  Sparkles
} from "lucide-react";

interface ExplorePageProps {
  onSelectVehicle: (vehicleId: string) => void;
  onSelectShop: (shopId: string) => void;
  onNavigate: (route: string) => void;
}

export const ExplorePage: React.FC<ExplorePageProps> = ({ onSelectVehicle, onSelectShop, onNavigate }) => {
  const { vehicles, shops } = useApp();
  const [selectedType, setSelectedType] = useState<string>("all");
  const [hubXOnly, setHubXOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [minTrustScore, setMinTrustScore] = useState(0);
  const [maxPrice, setMaxPrice] = useState(3000);
  const [viewMode, setViewMode] = useState<"grid" | "split">("split");
  const [activeShopPin, setActiveShopPin] = useState<string | null>(shops[0]?.id || null);

  // Location modal & GPS state
  const [selectedLocation, setSelectedLocation] = useState("Panaji, Goa");
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [isDetectingGps, setIsDetectingGps] = useState(false);

  const filteredVehicles = vehicles.filter((v) => {
    const shop = shops.find((s) => s.id === v.shopId);
    const matchesType = selectedType === "all" || v.type === selectedType;
    const matchesHubX = !hubXOnly || (shop && shop.isHubX);
    const matchesTrust = (shop?.trust.overall || 8) >= minTrustScore;
    const matchesPrice = v.pricePerHour <= maxPrice;
    const matchesSearch =
      v.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (shop && shop.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesType && matchesHubX && matchesTrust && matchesPrice && matchesSearch;
  });

  const selectedShopObj = shops.find((s) => s.id === activeShopPin) || shops[0];

  const handleDetectGps = () => {
    setIsDetectingGps(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        () => {
          setIsDetectingGps(false);
          setSelectedLocation("Panaji Waterfront Hub (GPS)");
        },
        () => {
          setTimeout(() => {
            setIsDetectingGps(false);
            setSelectedLocation("Panaji Central Hub");
          }, 600);
        }
      );
    } else {
      setTimeout(() => {
        setIsDetectingGps(false);
        setSelectedLocation("Panaji Central Hub");
      }, 500);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      {/* Top Header & Search */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[#E4DDD1]">
        <div>
          <span className="eyebrow-label block mb-1">LOCAL FLEET DIRECTORY</span>
          <h1 className="font-heading font-bold text-2xl sm:text-3xl text-[#16181F]">
            Explore Nearby Rides & Hubs
          </h1>
          <p className="text-xs sm:text-sm text-[#5B6070] mt-1">
            Browse verified self-drive scooties, cruisers, and SUVs across audited garages in Goa.
          </p>
        </div>

        {/* View Toggle & Location Picker Trigger */}
        <div className="flex items-center gap-2">
          {/* Location Chip */}
          <button
            onClick={() => setIsMapModalOpen(true)}
            className="bg-white hover:bg-[#FAF7F2] border border-[#E4DDD1] text-[#16181F] px-3.5 py-2 rounded-[8px] text-xs font-semibold transition-colors duration-200 flex items-center gap-1.5 cursor-pointer shadow-[0_1px_2px_rgba(15,31,61,0.06)]"
          >
            <MapPin size={13} className="text-[#2456D6]" />
            <span className="truncate max-w-[140px] sm:max-w-[180px]">{selectedLocation}</span>
            <span className="text-[10px] text-[#2456D6] font-semibold bg-[#FAF7F2] border border-[#E4DDD1] px-1.5 py-0.2 rounded-[4px]">Map</span>
          </button>

          <div className="bg-white p-1 rounded-[8px] border border-[#E4DDD1] flex items-center">
            <button
              onClick={() => setViewMode("split")}
              className={`px-3 py-1.5 rounded-[6px] text-xs font-semibold transition-colors duration-200 cursor-pointer flex items-center gap-1.5 ${
                viewMode === "split" ? "bg-[#0F1F3D] text-white" : "text-[#5B6070] hover:text-[#16181F]"
              }`}
            >
              <Layers size={13} />
              <span>Map + Fleet</span>
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`px-3 py-1.5 rounded-[6px] text-xs font-semibold transition-colors duration-200 cursor-pointer flex items-center gap-1.5 ${
                viewMode === "grid" ? "bg-[#0F1F3D] text-white" : "text-[#5B6070] hover:text-[#16181F]"
              }`}
            >
              <Compass size={13} />
              <span>Grid View</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-[12px] p-4 border border-[#E4DDD1] shadow-[0_1px_2px_rgba(15,31,61,0.06)] space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Vehicle Type Tabs */}
          <div className="flex items-center gap-1.5 bg-[#FAF7F2] p-1 rounded-[6px] border border-[#E4DDD1]">
            {[
              { id: "all", label: "All Fleet" },
              { id: "scooty", label: "Scooties" },
              { id: "bike", label: "Bikes" },
              { id: "car", label: "Cars" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedType(tab.id)}
                className={`px-3 py-1.5 rounded-[4px] text-xs font-semibold transition-colors duration-150 cursor-pointer ${
                  selectedType === tab.id
                    ? "bg-[#0F1F3D] text-white"
                    : "text-[#5B6070] hover:text-[#16181F]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* HubX Verified Switch with Amber Fill */}
          <button
            onClick={() => setHubXOnly(!hubXOnly)}
            className={`px-3 py-1.5 rounded-[6px] text-xs font-bold border transition-colors duration-150 cursor-pointer flex items-center gap-1.5 ${
              hubXOnly
                ? "bg-[#E8A317] border-[#D99614] text-[#0F1F3D]"
                : "bg-[#FAF7F2] border-[#E4DDD1] text-[#5B6070] hover:bg-[#F3EEE6]"
            }`}
          >
            <Sparkles size={13} />
            <span>HubX Certified Only</span>
          </button>

          {/* GPS Locate Button */}
          <button
            onClick={handleDetectGps}
            className="px-3 py-1.5 bg-[#FAF7F2] hover:bg-[#F3EEE6] text-[#16181F] border border-[#E4DDD1] rounded-[6px] text-xs font-semibold transition-colors duration-150 flex items-center gap-1.5 cursor-pointer"
          >
            <Crosshair size={13} className={isDetectingGps ? "animate-spin text-[#2456D6]" : "text-[#5B6070]"} />
            <span>{isDetectingGps ? "Locating..." : "Use GPS"}</span>
          </button>

          {/* Search input */}
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5B6070]" size={14} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search model, garage, or brand..."
              className="w-full pl-8 pr-3 py-1.5 bg-[#FAF7F2] border border-[#E4DDD1] rounded-[6px] text-xs font-medium text-[#16181F] focus:outline-none focus:border-[#0F1F3D]"
            />
          </div>
        </div>

        {/* Sliders: Max Price & Trust Score */}
        <div className="pt-3 border-t border-[#E4DDD1] flex flex-wrap items-center justify-between gap-4 text-xs text-[#5B6070]">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-[#16181F]">Min Trust Score:</span>
            <input
              type="range"
              min="0"
              max="9.5"
              step="0.5"
              value={minTrustScore}
              onChange={(e) => setMinTrustScore(parseFloat(e.target.value))}
              className="accent-[#0F1F3D] cursor-pointer"
            />
            <span className="font-bold text-[#16181F] tabular-nums">{minTrustScore > 0 ? `${minTrustScore}+ / 10` : "Any"}</span>
          </div>

          <div className="text-[#5B6070]">
            Showing <strong className="text-[#16181F] tabular-nums">{filteredVehicles.length}</strong> available rides in {selectedLocation}
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      {viewMode === "split" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Interactive Map Widget */}
          <div className="lg:col-span-5 sticky top-24 space-y-4">
            <div className="bg-[#0F1F3D] rounded-[12px] overflow-hidden border border-[#0A1529] shadow-sm relative aspect-4/3 sm:aspect-square flex flex-col justify-between p-4 text-white">
              {/* Subtle background route sketch */}
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-30 pointer-events-none"
                style={{ backgroundImage: `url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1000&q=80')` }}
              />

              {/* Map Header */}
              <div className="relative z-10 flex items-center justify-between bg-[#0A1529] p-3 rounded-[8px] border border-white/10 text-white">
                <div className="flex items-center gap-2">
                  <MapPin size={15} className="text-[#2E9E6B]" />
                  <span className="text-xs font-semibold">{selectedLocation}</span>
                </div>
                <span className="text-[10px] bg-[#1E2D4A] text-white px-2 py-0.5 rounded-[4px] font-semibold tabular-nums">
                  {shops.length} Active Hubs
                </span>
              </div>

              {/* Interactive Shop Pins on Map */}
              <div className="relative z-10 flex flex-col gap-2 my-auto">
                {shops.map((shop, idx) => {
                  const isSelected = activeShopPin === shop.id;
                  return (
                    <button
                      key={shop.id}
                      onClick={() => setActiveShopPin(shop.id)}
                      className={`text-left p-2.5 rounded-[6px] transition-colors duration-150 cursor-pointer flex items-center justify-between border ${
                        isSelected
                          ? "bg-white text-[#16181F] border-white shadow-sm"
                          : "bg-[#0A1529]/80 text-white border-white/10 hover:bg-[#0A1529]"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-5 h-5 rounded-[4px] flex items-center justify-center text-[10px] font-bold ${
                          shop.isHubX ? "bg-[#E8A317] text-[#0F1F3D]" : "bg-[#1E2D4A] text-white"
                        }`}>
                          {idx + 1}
                        </div>
                        <div>
                          <p className="text-xs font-bold leading-tight">{shop.name}</p>
                          <p className="text-[10px] opacity-75 tabular-nums">{shop.city} • {shop.distanceKm} km away</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] font-bold text-[#1B7A4E] bg-[#EBF7F0] px-1.5 py-0.5 rounded-[4px] tabular-nums">
                          ★ {shop.trust.overall}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Selected Shop Preview Footer */}
              {selectedShopObj && (
                <div className="relative z-10 bg-white rounded-[8px] p-3 border border-[#E4DDD1] text-[#16181F]">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-heading font-bold text-xs">{selectedShopObj.name}</h4>
                      <p className="text-[10px] text-[#5B6070]">{selectedShopObj.address}</p>
                    </div>
                    <button
                      onClick={() => onSelectShop(selectedShopObj.id)}
                      className="bg-[#0F1F3D] hover:bg-[#0A1529] text-white text-[11px] font-semibold px-3 py-1.5 rounded-[6px] transition-colors"
                    >
                      Inspect Garage
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Selected Shop Trust Overview */}
            {selectedShopObj && (
              <TrustScoreCard trust={selectedShopObj.trust} isHubX={selectedShopObj.isHubX} />
            )}
          </div>

          {/* Right Column: Vehicles List Grid */}
          <div className="lg:col-span-7">
            {filteredVehicles.length === 0 ? (
              <div className="bg-white rounded-[12px] p-12 text-center border border-[#E4DDD1]">
                <Bike size={42} className="mx-auto text-[#5B6070] mb-3" />
                <h3 className="font-heading font-bold text-base text-[#16181F]">No vehicles match your search</h3>
                <p className="text-xs text-[#5B6070] mt-1">Try resetting the trust score slider or searching another brand.</p>
                <button
                  onClick={() => {
                    setSelectedType("all");
                    setHubXOnly(false);
                    setSearchQuery("");
                    setMinTrustScore(0);
                  }}
                  className="mt-4 px-4 py-2 bg-[#0F1F3D] text-white text-xs font-semibold rounded-[8px] cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {filteredVehicles.map((vehicle) => (
                  <VehicleCard
                    key={vehicle.id}
                    vehicle={vehicle}
                    onSelect={onSelectVehicle}
                    onQuickBook={(id) => onNavigate(`/book/${id}`)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Full Grid Mode */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredVehicles.map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              onSelect={onSelectVehicle}
              onQuickBook={(id) => onNavigate(`/book/${id}`)}
            />
          ))}
        </div>
      )}

      {/* Google Map Picker Modal */}
      <LocationMapPickerModal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        currentLocation={selectedLocation}
        onSelectLocation={(loc) => setSelectedLocation(loc)}
      />
    </div>
  );
};
