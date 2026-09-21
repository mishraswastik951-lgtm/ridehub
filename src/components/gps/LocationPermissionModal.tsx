import React, { useState } from "react";
import { MapPin, ShieldCheck, Search, Navigation, CheckCircle2, AlertCircle } from "lucide-react";
import { GOA_DEMO_CITY } from "../../config/gpsConfig";

interface LocationPermissionModalProps {
  isOpen: boolean;
  onAllow: (location: { lat: number; lng: number; address: string }) => void;
  onClose: () => void;
}

export const LocationPermissionModal: React.FC<LocationPermissionModalProps> = ({
  isOpen,
  onAllow,
  onClose,
}) => {
  const [permissionState, setPermissionState] = useState<"prompt" | "denied">("prompt");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAddress, setSelectedAddress] = useState("Calangute Beach Road, Goa");
  const [selectedCoords, setSelectedCoords] = useState(GOA_DEMO_CITY.center);

  if (!isOpen) return null;

  const mockAddresses = [
    { name: "Calangute Beach Road, North Goa", lat: 15.5435, lng: 73.7553 },
    { name: "Panaji EDC Complex, Central Goa", lat: 15.4989, lng: 73.8278 },
    { name: "Baga Creek Road, Arpora, Goa", lat: 15.5562, lng: 73.7511 },
    { name: "Mopa International Airport (GOX)", lat: 15.7651, lng: 73.8662 },
    { name: "Dabolim Airport Terminal (GOI)", lat: 15.3808, lng: 73.8314 },
  ];

  const filteredAddresses = mockAddresses.filter((a) =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRequestBrowserLocation = () => {
    // Simulate browser geolocation API
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => {
          onAllow({
            lat: GOA_DEMO_CITY.center.lat,
            lng: GOA_DEMO_CITY.center.lng,
            address: "Current Geolocation (Panaji, Goa)",
          });
        },
        () => {
          // If denied
          setPermissionState("denied");
        },
        { timeout: 2000 }
      );
    } else {
      setPermissionState("denied");
    }
  };

  const handleSelectManualAddress = (item: { name: string; lat: number; lng: number }) => {
    setSelectedAddress(item.name);
    setSelectedCoords({ lat: item.lat, lng: item.lng });
    onAllow({ lat: item.lat, lng: item.lng, address: item.name });
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-[12px] p-6 max-w-md w-full space-y-5 border border-[#E4DDD1] shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#FAF7F2] border border-[#2456D6] text-[#2456D6] flex items-center justify-center">
            <Navigation size={20} />
          </div>
          <div>
            <h3 className="font-heading font-bold text-base text-[#16181F]">
              Location Access & GPS Safety
            </h3>
            <p className="text-xs text-[#5B6070]">
              RideHub uses location data for doorstep vehicle delivery and geofence safety monitoring.
            </p>
          </div>
        </div>

        {permissionState === "prompt" ? (
          <div className="space-y-4">
            <div className="p-3.5 rounded-[8px] bg-[#FAF7F2] border border-[#E4DDD1] space-y-2 text-xs text-[#5B6070]">
              <div className="flex items-center gap-2 text-[#16181F] font-semibold">
                <ShieldCheck size={16} className="text-[#2E9E6B]" />
                <span>What is tracked & why:</span>
              </div>
              <ul className="list-disc pl-5 space-y-1">
                <li>Real-time ETA for doorstep vehicle delivery rider</li>
                <li>Geofence boundary alerts during active self-drive rides</li>
                <li>Roadside emergency assistance dispatch location</li>
              </ul>
            </div>

            <div className="space-y-2">
              <button
                onClick={handleRequestBrowserLocation}
                className="w-full py-3 bg-[#2456D6] hover:bg-[#1B44AE] text-white font-heading font-bold text-xs uppercase tracking-wider rounded-[8px] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <MapPin size={16} />
                <span>Allow Precise GPS Location</span>
              </button>

              <button
                onClick={() => setPermissionState("denied")}
                className="w-full py-2.5 bg-white border border-[#E4DDD1] hover:bg-[#FAF7F2] text-[#5B6070] font-heading font-bold text-xs rounded-[8px] transition-colors cursor-pointer"
              >
                Deny & Pick Location Manually on Map
              </button>
            </div>
          </div>
        ) : (
          /* Denied Fallback: Draggable Pin / Search Address */
          <div className="space-y-4">
            <div className="p-3 rounded-[8px] bg-[#FFF8E6] border border-[#E8A317] text-[#0F1F3D] text-xs flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0 text-[#E8A317]" />
              <span>Location permission denied. Please search or pick your address below:</span>
            </div>

            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5B6070]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Goa areas (Panaji, Calangute, Airport)..."
                className="w-full pl-9 pr-3 py-2.5 text-xs border border-[#E4DDD1] rounded-[8px] focus:outline-none focus:border-[#0F1F3D]"
              />
            </div>

            <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
              {filteredAddresses.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSelectManualAddress(item)}
                  className="p-2.5 rounded-[6px] bg-[#FAF7F2] hover:bg-[#F3EEE6] border border-[#E4DDD1] text-xs flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-[#2456D6]" />
                    <span className="font-medium text-[#16181F]">{item.name}</span>
                  </div>
                  <span className="text-[10px] font-bold text-[#2456D6]">Select</span>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 bg-[#FAF7F2] border border-[#E4DDD1] text-[#16181F] font-bold text-xs rounded-[8px]"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
