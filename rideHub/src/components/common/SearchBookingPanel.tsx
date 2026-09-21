import React, { useState, useEffect, useRef } from "react";
import { 
  Compass, 
  Bike, 
  Car, 
  MapPin, 
  Search, 
  Clock, 
  Crosshair, 
  Map, 
  Truck
} from "lucide-react";
import { LocationMapPickerModal } from "./LocationMapPickerModal";
import { useApp } from "../../context/AppContext";

interface SearchBookingPanelProps {
  onSearch: (filters: {
    vehicleType: string;
    location: string;
    pickupDate: string;
    pickupTime: string;
    returnDate: string;
    returnTime: string;
    durationHours: number;
    searchQuery: string;
  }) => void;
  defaultVehicleType?: string;
  defaultLocation?: string;
  className?: string;
}

export const SearchBookingPanel: React.FC<SearchBookingPanelProps> = ({
  onSearch,
  defaultVehicleType = "all",
  defaultLocation = "Panaji, Goa",
  className = "",
}) => {
  const { vehicles } = useApp();

  // Categories
  const [selectedType, setSelectedType] = useState<string>(defaultVehicleType);

  // Location State
  const [location, setLocation] = useState<string>(defaultLocation);
  const [locationSubtext, setLocationSubtext] = useState<string>("Panaji Waterfront & City Promenade, Goa");
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState<boolean>(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState<boolean>(false);
  const [isDetectingGps, setIsDetectingGps] = useState<boolean>(false);
  const [gpsDetected, setGpsDetected] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Timings State
  const today = new Date();
  const todayIso = today.toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const tomorrowIso = tomorrow.toISOString().split("T")[0];

  const [pickupDate, setPickupDate] = useState<string>(todayIso);
  const [pickupTime, setPickupTime] = useState<string>("10:00 AM");
  const [returnDate, setReturnDate] = useState<string>(tomorrowIso);
  const [returnTime, setReturnTime] = useState<string>("10:00 AM");
  const [durationHours, setDurationHours] = useState<number>(24);

  // Keyword query
  const [searchQuery, setSearchQuery] = useState<string>("");

  const popularLocations = [
    { name: "Panaji Central Hub", area: "Panaji Waterfront & City Promenade", tag: "City Center" },
    { name: "Calangute Beach Hub", area: "Calangute - Baga Main Road, North Goa", tag: "Beach Zone" },
    { name: "Baga Beach Strip", area: "Tito's Lane, Baga, North Goa", tag: "Coastline" },
    { name: "Goa Dabolim Airport (GOI)", area: "Airport Road, Vasco da Gama", tag: "Airport Hub" },
    { name: "Mopa Airport (GOX)", area: "Manohar International Airport, Pernem", tag: "North Airport" },
    { name: "Candolim Beach Road", area: "Fort Aguada Rd, Candolim", tag: "Resort Belt" },
    { name: "Madgaon Railway Station", area: "Margao City Center, South Goa", tag: "Transit Hub" },
    { name: "Anjuna & Vagator Hub", area: "Vagator Beach Rd, Anjuna", tag: "North Coast" },
  ];

  const timeSlots = [
    "07:00 AM", "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
    "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM",
    "07:00 PM", "08:00 PM", "09:00 PM", "10:00 PM"
  ];

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsLocationDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Format readable dates
  const formatDisplayDate = (isoStr: string) => {
    if (!isoStr) return "";
    const d = new Date(`${isoStr}T00:00:00`);
    return d.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  };

  // Quick duration helper
  const handleQuickDuration = (hours: number) => {
    setDurationHours(hours);
    const pickupTimestamp = new Date(`${pickupDate}T00:00:00`).getTime();
    const returnTimestamp = pickupTimestamp + hours * 60 * 60 * 1000;
    const newReturnIso = new Date(returnTimestamp).toISOString().split("T")[0];
    setReturnDate(newReturnIso);
  };

  // GPS Auto-detect handler
  const handleGpsAutoDetect = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDetectingGps(true);
    setGpsDetected(false);

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        () => {
          setIsDetectingGps(false);
          setGpsDetected(true);
          setLocation("Panaji Waterfront Hub");
          setLocationSubtext("Auto-detected via GPS: Near Miramar Beach, Goa");
          setTimeout(() => setGpsDetected(false), 3000);
        },
        () => {
          setTimeout(() => {
            setIsDetectingGps(false);
            setGpsDetected(true);
            setLocation("Panaji Central Hub");
            setLocationSubtext("Auto-detected via GPS: Goa Promenade Area");
            setTimeout(() => setGpsDetected(false), 3000);
          }, 600);
        },
        { timeout: 4000 }
      );
    } else {
      setTimeout(() => {
        setIsDetectingGps(false);
        setGpsDetected(true);
        setLocation("Panaji Central Hub");
        setLocationSubtext("Panaji City Center");
      }, 500);
    }
  };

  // Matching vehicles count badge
  const matchingCount = vehicles.filter((v) => {
    const matchesType = selectedType === "all" || v.type === selectedType;
    const matchesQuery =
      v.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.shopName && v.shopName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesQuery;
  }).length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      vehicleType: selectedType,
      location,
      pickupDate,
      pickupTime,
      returnDate,
      returnTime,
      durationHours,
      searchQuery,
    });
  };

  return (
    <div className={`bg-white rounded-[12px] p-5 sm:p-7 text-[#16181F] border border-[#E4DDD1] shadow-[0_1px_2px_rgba(15,31,61,0.06)] relative z-20 ${className}`}>
      {/* 1. Category Tabs Row */}
      <div className="flex items-center gap-2 pb-5 border-b border-[#E4DDD1] overflow-x-auto">
        {[
          { id: "all", label: "All Fleet", icon: Compass },
          { id: "scooty", label: "Scooties (Activa, Ather)", icon: Bike },
          { id: "bike", label: "Motorcycles (Hunter, Duke)", icon: Bike },
          { id: "car", label: "Cars & SUVs (Thar, Brezza)", icon: Car },
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = selectedType === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedType(tab.id)}
              className={`px-3.5 py-2 rounded-[6px] text-xs sm:text-sm font-semibold transition-colors duration-200 ease-out flex items-center gap-2 cursor-pointer shrink-0 ${
                isSelected
                  ? "bg-[#0F1F3D] text-white"
                  : "bg-[#FAF7F2] hover:bg-[#F3EEE6] text-[#16181F] border border-[#E4DDD1]"
              }`}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 2. Form Grid */}
      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch">
          {/* Card A: Location Selector (4 cols on desktop) */}
          <div className="lg:col-span-4 relative" ref={dropdownRef}>
            <div className="h-full p-3.5 bg-[#FAF7F2] border border-[#E4DDD1] rounded-[8px] flex flex-col justify-between space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#5B6070] flex items-center gap-1.5">
                  <MapPin size={13} className="text-[#2456D6]" /> Pickup Location
                </span>
                <button
                  type="button"
                  onClick={() => setIsMapModalOpen(true)}
                  className="text-[#2456D6] hover:text-[#1B44AE] font-semibold text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Map size={13} />
                  <span>Map Picker</span>
                </button>
              </div>

              <div className="relative flex items-center">
                <input
                  type="text"
                  value={location}
                  onChange={(e) => {
                    setLocation(e.target.value);
                    setLocationSubtext("Custom Location");
                    setIsLocationDropdownOpen(true);
                  }}
                  onFocus={() => setIsLocationDropdownOpen(true)}
                  placeholder="Enter hub, beach, or area..."
                  className="w-full bg-transparent text-sm sm:text-base font-heading font-bold text-[#16181F] pr-16 focus:outline-none placeholder:text-[#5B6070]/60"
                />

                {/* GPS Button inside input */}
                <button
                  type="button"
                  onClick={handleGpsAutoDetect}
                  title="Detect my current GPS location"
                  className={`absolute right-0 px-2 py-0.5 rounded-[4px] text-[10px] font-bold transition-colors duration-200 flex items-center gap-1 cursor-pointer shrink-0 ${
                    isDetectingGps
                      ? "bg-[#E8A317] text-[#0F1F3D]"
                      : gpsDetected
                      ? "bg-[#EBF7F0] text-[#1B7A4E] border border-[#C3E7D3]"
                      : "bg-[#F3EEE6] hover:bg-[#E4DDD1] text-[#16181F] border border-[#E4DDD1]"
                  }`}
                >
                  <Crosshair size={10} className={isDetectingGps ? "animate-spin" : ""} />
                  <span>{isDetectingGps ? "GPS..." : gpsDetected ? "Located" : "GPS"}</span>
                </button>
              </div>

              <p className="text-[11px] text-[#5B6070] truncate font-normal">
                {locationSubtext}
              </p>
            </div>

            {/* Location Suggestions Dropdown */}
            {isLocationDropdownOpen && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-[8px] shadow-lg border border-[#E4DDD1] p-2 z-50 max-h-64 overflow-y-auto">
                <div className="flex items-center justify-between px-3 py-1 text-[10px] font-bold text-[#5B6070] uppercase tracking-wider border-b border-[#E4DDD1]">
                  <span>Verified Hubs</span>
                  <span className="text-[#2456D6]">8 Areas</span>
                </div>

                <div className="py-1 space-y-1">
                  {popularLocations
                    .filter(
                      (l) =>
                        l.name.toLowerCase().includes(location.toLowerCase()) ||
                        l.area.toLowerCase().includes(location.toLowerCase())
                    )
                    .map((item) => (
                      <div
                        key={item.name}
                        onClick={() => {
                          setLocation(item.name);
                          setLocationSubtext(item.area);
                          setIsLocationDropdownOpen(false);
                        }}
                        className="px-3 py-2 rounded-[6px] hover:bg-[#FAF7F2] transition-colors duration-150 cursor-pointer flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <MapPin size={13} className="text-[#2456D6] shrink-0" />
                          <div>
                            <p className="font-semibold text-[#16181F]">{item.name}</p>
                            <p className="text-[11px] text-[#5B6070]">{item.area}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-semibold bg-[#FAF7F2] border border-[#E4DDD1] text-[#5B6070] px-1.5 py-0.5 rounded-[4px]">
                          {item.tag}
                        </span>
                      </div>
                    ))}
                </div>

                <div className="pt-2 border-t border-[#E4DDD1]">
                  <button
                    type="button"
                    onClick={() => {
                      setIsLocationDropdownOpen(false);
                      setIsMapModalOpen(true);
                    }}
                    className="w-full py-1.5 text-center text-xs font-semibold text-[#2456D6] hover:bg-[#FAF7F2] rounded-[6px] transition-colors duration-150 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Map size={13} />
                    <span>Open Interactive Map Selector</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Card B: Rental Dates & Timings (5 cols on desktop) */}
          <div className="lg:col-span-5 p-3.5 bg-[#FAF7F2] border border-[#E4DDD1] rounded-[8px] flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#5B6070] flex items-center gap-1.5">
                <Clock size={13} className="text-[#2456D6]" /> Rental Dates & Timing
              </span>
              <span className="text-[10px] font-bold bg-[#EBF7F0] border border-[#C3E7D3] text-[#1B7A4E] px-2 py-0.5 rounded-[4px] tabular-nums">
                {durationHours} Hours ({Math.round(durationHours / 24) >= 1 ? `${Math.round(durationHours / 24)} Day(s)` : `${durationHours}h`})
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-0.5">
              {/* Pickup Segment */}
              <div className="bg-white p-2.5 rounded-[6px] border border-[#E4DDD1] space-y-1">
                <span className="text-[10px] font-bold text-[#5B6070] uppercase tracking-wider block">
                  Pick-up
                </span>
                <div className="space-y-1">
                  <input
                    type="date"
                    value={pickupDate}
                    min={todayIso}
                    onChange={(e) => setPickupDate(e.target.value)}
                    className="w-full bg-transparent text-xs font-bold text-[#16181F] focus:outline-none cursor-pointer tabular-nums"
                  />
                  <select
                    value={pickupTime}
                    onChange={(e) => setPickupTime(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#E4DDD1] rounded-[4px] text-[11px] font-semibold text-[#16181F] px-1.5 py-1 focus:outline-none cursor-pointer tabular-nums"
                  >
                    {timeSlots.map((slot) => (
                      <option key={`pickup-${slot}`} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Drop-off Segment */}
              <div className="bg-white p-2.5 rounded-[6px] border border-[#E4DDD1] space-y-1">
                <span className="text-[10px] font-bold text-[#5B6070] uppercase tracking-wider block">
                  Drop-off
                </span>
                <div className="space-y-1">
                  <input
                    type="date"
                    value={returnDate}
                    min={pickupDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    className="w-full bg-transparent text-xs font-bold text-[#16181F] focus:outline-none cursor-pointer tabular-nums"
                  />
                  <select
                    value={returnTime}
                    onChange={(e) => setReturnTime(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#E4DDD1] rounded-[4px] text-[11px] font-semibold text-[#16181F] px-1.5 py-1 focus:outline-none cursor-pointer tabular-nums"
                  >
                    {timeSlots.map((slot) => (
                      <option key={`return-${slot}`} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Card C: Search Query & Key CTA Button (3 cols on desktop) */}
          <div className="lg:col-span-3 p-3.5 bg-[#FAF7F2] border border-[#E4DDD1] rounded-[8px] flex flex-col justify-between space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#5B6070] flex items-center gap-1.5">
              <Search size={13} className="text-[#5B6070]" /> Model or Hub
            </span>

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g. Thar, Activa, Hunter..."
              className="w-full bg-white px-2.5 py-1.5 border border-[#E4DDD1] rounded-[4px] text-xs font-medium text-[#16181F] placeholder:text-[#5B6070]/60 focus:outline-none focus:border-[#2456D6]"
            />

            {/* Amber Single Key CTA Button */}
            <button
              type="submit"
              className="w-full py-2.5 bg-[#E8A317] hover:bg-[#D99614] text-[#0F1F3D] font-heading font-bold text-sm rounded-[8px] transition-colors duration-200 ease-out flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Find Available Rides</span>
              <span className="bg-[#0F1F3D]/15 text-[#0F1F3D] text-xs px-1.5 py-0.2 rounded-[4px] tabular-nums font-bold">
                {matchingCount}
              </span>
            </button>
          </div>
        </div>

        {/* 3. Bottom Row: Quick Duration Presets & Doorstep Area Note */}
        <div className="pt-3 border-t border-[#E4DDD1] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-[11px] font-bold text-[#5B6070] uppercase tracking-wider shrink-0 mr-1">
              Quick Duration:
            </span>
            {[
              { label: "4 Hours", hours: 4 },
              { label: "8 Hours", hours: 8 },
              { label: "1 Day (24h)", hours: 24 },
              { label: "2 Days", hours: 48 },
              { label: "3 Days", hours: 72 },
              { label: "1 Week", hours: 168 },
            ].map((chip) => {
              const isSelected = durationHours === chip.hours;
              return (
                <button
                  key={chip.hours}
                  type="button"
                  onClick={() => handleQuickDuration(chip.hours)}
                  className={`px-2.5 py-1 rounded-[4px] text-xs font-semibold transition-colors duration-200 cursor-pointer shrink-0 tabular-nums ${
                    isSelected
                      ? "bg-[#0F1F3D] text-white"
                      : "bg-[#FAF7F2] hover:bg-[#F3EEE6] text-[#16181F] border border-[#E4DDD1]"
                  }`}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>

          <div className="text-xs text-[#5B6070] flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[#2456D6] font-medium">
              <Truck size={13} /> Doorstep delivery available
            </span>
            <span className="text-[#E4DDD1]">|</span>
            <span className="tabular-nums font-medium text-[#16181F]">
              {formatDisplayDate(pickupDate)} → {formatDisplayDate(returnDate)}
            </span>
          </div>
        </div>
      </form>

      {/* Google Map Picker Modal */}
      <LocationMapPickerModal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        currentLocation={location}
        onSelectLocation={(selectedLoc) => {
          setLocation(selectedLoc);
          setLocationSubtext("Selected via Map Selector");
        }}
      />
    </div>
  );
};
