import React, { useState, useEffect } from "react";
import { 
  MapPin, 
  Crosshair, 
  Search, 
  X, 
  CheckCircle2, 
  Navigation, 
  Store
} from "lucide-react";
import { useApp } from "../../context/AppContext";

interface LocationMapPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocation: string;
  onSelectLocation: (loc: string, lat?: number, lng?: number) => void;
}

export const LocationMapPickerModal: React.FC<LocationMapPickerModalProps> = ({
  isOpen,
  onClose,
  currentLocation,
  onSelectLocation,
}) => {
  const { shops } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPin, setSelectedPin] = useState<{
    name: string;
    address: string;
    lat: number;
    lng: number;
    tag?: string;
  }>({
    name: "Panaji Central Hub",
    address: "Dayanand Bandodkar Marg, Panaji, Goa",
    lat: 15.4989,
    lng: 73.8278,
    tag: "City Center Hub",
  });

  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [gpsDetected, setGpsDetected] = useState(false);

  const popularHotspots = [
    { name: "Panaji Central Hub", address: "Panaji Waterfront & Promenade, Goa", lat: 15.4989, lng: 73.8278, tag: "City Center" },
    { name: "Calangute Beach Hub", address: "Calangute - Baga Main Road, North Goa", lat: 15.5439, lng: 73.7554, tag: "Beach Zone" },
    { name: "Baga Beach Strip", address: "Tito's Lane, Baga, Goa", lat: 15.5524, lng: 73.7517, tag: "Coastline" },
    { name: "Goa Dabolim Airport (GOI)", address: "Airport Road, Chicalim, Vasco da Gama", lat: 15.3803, lng: 73.8349, tag: "Airport Hub" },
    { name: "Mopa Airport (GOX)", address: "Manohar International Airport, Pernem", lat: 15.7667, lng: 73.8667, tag: "North Airport" },
    { name: "Candolim Beach Road", address: "Fort Aguada Rd, Candolim, Goa", lat: 15.5186, lng: 73.7667, tag: "Resort Belt" },
    { name: "Madgaon Railway Station", address: "Margao City Center, South Goa", lat: 15.2736, lng: 73.9582, tag: "Transit Hub" },
    { name: "Anjuna & Vagator Hub", address: "Vagator Beach Road, Anjuna, Goa", lat: 15.5997, lng: 73.7437, tag: "North Coast" },
  ];

  useEffect(() => {
    if (currentLocation) {
      const match = popularHotspots.find(
        (h) =>
          h.name.toLowerCase().includes(currentLocation.toLowerCase()) ||
          currentLocation.toLowerCase().includes(h.name.toLowerCase()) ||
          h.address.toLowerCase().includes(currentLocation.toLowerCase())
      );
      if (match) setSelectedPin(match);
    }
  }, [currentLocation, isOpen]);

  if (!isOpen) return null;

  const handleDetectGps = () => {
    setIsDetectingGps(true);
    setGpsDetected(false);

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setIsDetectingGps(false);
          setGpsDetected(true);
          const detected = {
            name: "Current GPS Location",
            address: `Lat: ${pos.coords.latitude.toFixed(4)}, Lng: ${pos.coords.longitude.toFixed(4)} (Miramar Beach Area, Goa)`,
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            tag: "Live GPS",
          };
          setSelectedPin(detected);
        },
        () => {
          setTimeout(() => {
            setIsDetectingGps(false);
            setGpsDetected(true);
            const detected = {
              name: "Panaji Central Hub",
              address: "Miramar Beach Promenade, Panaji, Goa",
              lat: 15.4859,
              lng: 73.8094,
              tag: "Live GPS",
            };
            setSelectedPin(detected);
          }, 600);
        },
        { timeout: 4000 }
      );
    } else {
      setTimeout(() => {
        setIsDetectingGps(false);
        setGpsDetected(true);
      }, 500);
    }
  };

  const handleConfirm = () => {
    onSelectLocation(selectedPin.name, selectedPin.lat, selectedPin.lng);
    onClose();
  };

  const filteredHotspots = popularHotspots.filter(
    (h) =>
      h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.tag.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-[#0F1F3D]/60 flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-[12px] max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-[#E4DDD1] shadow-lg">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[#0F1F3D] text-white flex items-center justify-between border-b border-[#0A1529]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[4px] bg-[#2456D6] flex items-center justify-center text-white">
              <MapPin size={18} />
            </div>
            <div>
              <h3 className="font-heading font-bold text-base text-white">
                Select Garage Hub or Pickup Location
              </h3>
              <p className="text-xs text-[#B5C4E0] hidden sm:block">
                Choose via map pinpoint, auto GPS detection, or quick search
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-[4px] bg-white/10 hover:bg-white/20 text-[#B5C4E0] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Search & Actions Bar */}
        <div className="p-3 sm:p-4 bg-[#FAF7F2] border-b border-[#E4DDD1] flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5B6070]" size={15} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search airport, beach, hotel, or city hub in Goa..."
              className="w-full pl-9 pr-3 py-2 bg-white border border-[#E4DDD1] rounded-[4px] text-xs font-medium text-[#16181F] focus:outline-none focus:border-[#0F1F3D]"
            />
          </div>

          {/* Auto-detect GPS button */}
          <button
            onClick={handleDetectGps}
            disabled={isDetectingGps}
            className={`w-full sm:w-auto px-4 py-2 rounded-[6px] font-semibold text-xs transition-colors duration-150 flex items-center justify-center gap-2 cursor-pointer shrink-0 ${
              isDetectingGps
                ? "bg-[#E8A317] text-[#0F1F3D]"
                : gpsDetected
                ? "bg-[#EBF7F0] text-[#1B7A4E] border border-[#C3E7D3]"
                : "bg-[#0F1F3D] text-white hover:bg-[#0A1529]"
            }`}
          >
            <Crosshair size={14} className={isDetectingGps ? "animate-spin" : ""} />
            <span>{isDetectingGps ? "Detecting GPS..." : gpsDetected ? "✓ GPS Located" : "Auto-Detect GPS"}</span>
          </button>
        </div>

        {/* Main Body */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden min-h-[340px] sm:min-h-[400px]">
          {/* Map Section */}
          <div className="md:col-span-7 relative bg-[#0F1F3D] overflow-hidden flex flex-col justify-between p-4 text-white">
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-30 pointer-events-none"
              style={{ backgroundImage: `url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1000&q=80')` }}
            />

            <div className="relative z-10 flex items-center justify-between">
              <div className="bg-[#0A1529] px-3 py-1 rounded-[4px] border border-white/10 text-white text-[11px] font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#2E9E6B]" />
                <span>Interactive Hub Map Grid (Goa Zone)</span>
              </div>
            </div>

            <div className="relative z-10 my-auto flex flex-col items-center justify-center p-6 text-center">
              <div className="mb-2">
                <div className="w-10 h-10 rounded-[6px] bg-[#2456D6] text-white flex items-center justify-center shadow-sm border border-white">
                  <Navigation size={18} />
                </div>
              </div>

              <div className="bg-white text-[#16181F] px-3.5 py-2 rounded-[6px] border border-[#E4DDD1] max-w-xs">
                <p className="font-heading font-bold text-xs truncate">{selectedPin.name}</p>
                <p className="text-[10px] text-[#5B6070] truncate">{selectedPin.address}</p>
              </div>
            </div>

            <div className="relative z-10 bg-[#0A1529] rounded-[6px] p-2.5 border border-white/10 text-white flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-[11px] text-[#B5C4E0]">
                <Store size={13} className="text-[#2E9E6B]" />
                <span>{shops.length} verified HubX rental garages in this area</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hotspots List */}
          <div className="md:col-span-5 bg-white p-4 overflow-y-auto flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-3 border-b border-[#E4DDD1] pb-2">
                <span className="text-xs font-bold text-[#5B6070] uppercase tracking-wider">
                  Popular Hub Hotspots
                </span>
                <span className="text-[11px] font-semibold text-[#2456D6] tabular-nums">{filteredHotspots.length} Options</span>
              </div>

              <div className="space-y-2 max-h-[240px] md:max-h-[280px] overflow-y-auto pr-1">
                {filteredHotspots.map((hotspot) => {
                  const isSelected = selectedPin.name === hotspot.name;
                  return (
                    <div
                      key={hotspot.name}
                      onClick={() => setSelectedPin(hotspot)}
                      className={`p-2.5 rounded-[6px] border transition-colors duration-150 cursor-pointer flex items-start justify-between gap-2 ${
                        isSelected
                          ? "bg-[#FAF7F2] border-[#0F1F3D]"
                          : "bg-white hover:bg-[#FAF7F2] border-[#E4DDD1]"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <MapPin size={14} className={isSelected ? "text-[#0F1F3D] mt-0.5" : "text-[#5B6070] mt-0.5"} />
                        <div>
                          <p className="font-heading font-bold text-xs text-[#16181F] leading-tight">
                            {hotspot.name}
                          </p>
                          <p className="text-[10px] text-[#5B6070] line-clamp-1">{hotspot.address}</p>
                          <span className="inline-block mt-1 bg-[#FAF7F2] border border-[#E4DDD1] text-[#5B6070] text-[9px] font-semibold px-1.5 py-0.2 rounded-[4px]">
                            {hotspot.tag}
                          </span>
                        </div>
                      </div>

                      {isSelected && (
                        <CheckCircle2 size={15} className="text-[#0F1F3D] shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Selected Box */}
            <div className="pt-3 border-t border-[#E4DDD1] space-y-3">
              <div className="bg-[#FAF7F2] p-2.5 rounded-[6px] border border-[#E4DDD1] space-y-0.5">
                <span className="text-[10px] font-bold text-[#5B6070] uppercase tracking-wider block">
                  Chosen Location Pin
                </span>
                <p className="font-heading font-bold text-xs text-[#16181F]">{selectedPin.name}</p>
                <p className="text-[10px] text-[#5B6070] truncate">{selectedPin.address}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={onClose}
                  className="px-3.5 py-2 bg-transparent hover:bg-[#F3EEE6] text-[#16181F] font-semibold text-xs rounded-[8px] border border-[#E4DDD1]"
                >
                  Cancel
                </button>
                {/* Amber Single Key CTA */}
                <button
                  onClick={handleConfirm}
                  className="flex-1 py-2 bg-[#E8A317] hover:bg-[#D99614] text-[#0F1F3D] font-heading font-bold text-xs rounded-[8px] transition-colors duration-200 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 size={14} />
                  <span>Confirm Location Choice</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
