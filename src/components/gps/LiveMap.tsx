import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { LatLng, FleetVehicle } from "../../config/gpsConfig";

interface LiveMapProps {
  center?: LatLng;
  zoom?: number;
  shopLocation?: LatLng;
  shopName?: string;
  destinationLocation?: LatLng;
  destinationName?: string;
  vehicleLocation?: LatLng;
  vehicleHeading?: number;
  vehicleType?: "scooty" | "bike" | "car";
  vehicleModel?: string;
  traveledPath?: LatLng[];
  remainingPath?: LatLng[];
  geofenceCenter?: LatLng;
  geofenceRadiusMeters?: number;
  fleetVehicles?: FleetVehicle[];
  selectedFleetVehicleId?: string;
  onSelectFleetVehicle?: (vehicle: FleetVehicle) => void;
  height?: string;
  isGpsLost?: boolean;
}

export const LiveMap: React.FC<LiveMapProps> = ({
  center = { lat: 15.518, lng: 73.792 },
  zoom = 13,
  shopLocation,
  shopName = "Panaji Hub Station",
  destinationLocation,
  destinationName = "Customer Drop Location",
  vehicleLocation,
  vehicleHeading = 0,
  vehicleType = "scooty",
  vehicleModel,
  traveledPath = [],
  remainingPath = [],
  geofenceCenter,
  geofenceRadiusMeters = 5000,
  fleetVehicles = [],
  selectedFleetVehicleId,
  onSelectFleetVehicle,
  height = "100%",
  isGpsLost = false,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});
  const polylinesRef = useRef<{ traveled?: L.Polyline; remaining?: L.Polyline }>({});
  const geofenceCircleRef = useRef<L.Circle | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false,
    }).setView([center.lat, center.lng], zoom);

    // Muted OpenStreetMap Tile Layer matching Ivory Palette
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
    }).addTo(map);

    // Add zoom control at top right
    L.control.zoom({ position: "topright" }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update Shop Marker
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !shopLocation) return;

    const key = "shop_marker";
    if (markersRef.current[key]) {
      markersRef.current[key].setLatLng([shopLocation.lat, shopLocation.lng]);
    } else {
      const iconHtml = `
        <div class="flex items-center gap-1.5 bg-[#0F1F3D] text-white text-[11px] font-bold px-2.5 py-1 rounded-[6px] border border-[#0A1529] shadow-md whitespace-nowrap">
          <span class="w-2 h-2 rounded-full bg-[#2E9E6B]"></span>
          <span>${shopName}</span>
        </div>
      `;
      const icon = L.divIcon({
        html: iconHtml,
        className: "custom-leaflet-marker",
        iconSize: [140, 30],
        iconAnchor: [70, 15],
      });

      const marker = L.marker([shopLocation.lat, shopLocation.lng], { icon }).addTo(map);
      markersRef.current[key] = marker;
    }
  }, [shopLocation, shopName]);

  // Update Destination Marker
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !destinationLocation) return;

    const key = "destination_marker";
    if (markersRef.current[key]) {
      markersRef.current[key].setLatLng([destinationLocation.lat, destinationLocation.lng]);
    } else {
      const iconHtml = `
        <div class="relative flex items-center justify-center">
          <div class="absolute w-8 h-8 bg-[#E8A317]/30 rounded-full animate-ping"></div>
          <div class="relative flex items-center gap-1.5 bg-[#E8A317] text-[#0F1F3D] text-[11px] font-extrabold px-2.5 py-1 rounded-[6px] border border-[#0F1F3D] shadow-md whitespace-nowrap">
            <span>📍 ${destinationName}</span>
          </div>
        </div>
      `;
      const icon = L.divIcon({
        html: iconHtml,
        className: "custom-leaflet-marker",
        iconSize: [150, 36],
        iconAnchor: [75, 18],
      });

      const marker = L.marker([destinationLocation.lat, destinationLocation.lng], { icon }).addTo(map);
      markersRef.current[key] = marker;
    }
  }, [destinationLocation, destinationName]);

  // Update Main Moving Vehicle Marker
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !vehicleLocation) return;

    const key = "main_vehicle_marker";
    const vehicleIconSymbol = vehicleType === "car" ? "🚗" : vehicleType === "bike" ? "🏍️" : "🛵";

    const iconHtml = `
      <div class="relative transition-all duration-700 ease-out flex items-center justify-center">
        <div class="w-10 h-10 rounded-full bg-[#2456D6] text-white flex items-center justify-center border-2 border-white shadow-lg text-lg transform transition-transform duration-500" style="transform: rotate(${vehicleHeading}deg);">
          ${vehicleIconSymbol}
        </div>
        ${
          vehicleModel
            ? `<div class="absolute -bottom-6 bg-[#0F1F3D] text-white text-[10px] font-bold px-2 py-0.5 rounded-[4px] shadow whitespace-nowrap">${vehicleModel}</div>`
            : ""
        }
      </div>
    `;

    const icon = L.divIcon({
      html: iconHtml,
      className: "custom-vehicle-marker",
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });

    if (markersRef.current[key]) {
      markersRef.current[key].setLatLng([vehicleLocation.lat, vehicleLocation.lng]);
      markersRef.current[key].setIcon(icon);
    } else {
      const marker = L.marker([vehicleLocation.lat, vehicleLocation.lng], { icon }).addTo(map);
      markersRef.current[key] = marker;
    }

    // Pan smoothly if bounds allow
    if (!fleetVehicles.length) {
      map.panTo([vehicleLocation.lat, vehicleLocation.lng], { animate: true, duration: 0.8 });
    }
  }, [vehicleLocation, vehicleHeading, vehicleType, vehicleModel, fleetVehicles.length]);

  // Update Route Polylines
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Traveled Solid Line
    if (traveledPath.length > 1) {
      const points = traveledPath.map((p) => [p.lat, p.lng] as [number, number]);
      if (polylinesRef.current.traveled) {
        polylinesRef.current.traveled.setLatLngs(points);
      } else {
        polylinesRef.current.traveled = L.polyline(points, {
          color: "#0F1F3D",
          weight: 4.5,
          opacity: 0.95,
        }).addTo(map);
      }
    }

    // Remaining Dotted Line
    if (remainingPath.length > 1) {
      const points = remainingPath.map((p) => [p.lat, p.lng] as [number, number]);
      if (polylinesRef.current.remaining) {
        polylinesRef.current.remaining.setLatLngs(points);
      } else {
        polylinesRef.current.remaining = L.polyline(points, {
          color: "#2456D6",
          weight: 4,
          dashArray: "8, 8",
          opacity: 0.85,
        }).addTo(map);
      }
    }
  }, [traveledPath, remainingPath]);

  // Update Geofence Circle
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !geofenceCenter) return;

    if (geofenceCircleRef.current) {
      geofenceCircleRef.current.setLatLng([geofenceCenter.lat, geofenceCenter.lng]);
    } else {
      geofenceCircleRef.current = L.circle([geofenceCenter.lat, geofenceCenter.lng], {
        radius: geofenceRadiusMeters,
        color: "#2456D6",
        weight: 2,
        dashArray: "6, 6",
        fillColor: "#2456D6",
        fillOpacity: 0.07,
      }).addTo(map);
    }
  }, [geofenceCenter, geofenceRadiusMeters]);

  // Update Shopkeeper Fleet Vehicles Markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !fleetVehicles.length) return;

    fleetVehicles.forEach((v) => {
      const key = `fleet_${v.id}`;
      const isSelected = selectedFleetVehicleId === v.id;

      let badgeBg = "bg-[#2456D6]"; // on_ride
      if (v.status === "on_delivery") badgeBg = "bg-[#E8A317] text-[#0F1F3D]";
      else if (v.status === "idle") badgeBg = "bg-[#5B6070]";
      else if (v.status === "overdue") badgeBg = "bg-[#C8432F] animate-pulse";

      const iconSymbol = v.type === "car" ? "🚗" : v.type === "bike" ? "🏍️" : "🛵";

      const iconHtml = `
        <div class="relative flex flex-col items-center cursor-pointer">
          <div class="w-8 h-8 rounded-full ${badgeBg} text-white flex items-center justify-center border-2 ${
        isSelected ? "border-[#0F1F3D] scale-125 shadow-xl ring-4 ring-[#2456D6]/30" : "border-white shadow-md"
      } text-sm transform transition-all duration-300">
            ${iconSymbol}
          </div>
          <div class="bg-[#0F1F3D] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-[3px] mt-0.5 shadow whitespace-nowrap">
            ${v.regNo}
          </div>
        </div>
      `;

      const icon = L.divIcon({
        html: iconHtml,
        className: "custom-fleet-marker",
        iconSize: [36, 48],
        iconAnchor: [18, 24],
      });

      if (markersRef.current[key]) {
        markersRef.current[key].setLatLng([v.currentLat, v.currentLng]);
        markersRef.current[key].setIcon(icon);
      } else {
        const marker = L.marker([v.currentLat, v.currentLng], { icon }).addTo(map);
        marker.on("click", () => onSelectFleetVehicle?.(v));
        markersRef.current[key] = marker;
      }
    });
  }, [fleetVehicles, selectedFleetVehicleId, onSelectFleetVehicle]);

  return (
    <div className="relative w-full overflow-hidden rounded-[12px] border border-[#E4DDD1] bg-[#FAF7F2]" style={{ height }}>
      {/* Map Element */}
      <div
        ref={mapContainerRef}
        className="w-full h-full z-0 map-ivory-filter"
        style={{ minHeight: "350px" }}
      />

      {/* GPS Signal Lost Overlay Banner */}
      {isGpsLost && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[500] bg-[#C8432F] text-white px-4 py-2 rounded-[8px] text-xs font-bold shadow-lg flex items-center gap-2 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
          <span>Reconnecting GPS Telemetry Signal...</span>
        </div>
      )}

      {/* Sample Data Watermark Badge */}
      <div className="absolute bottom-2 right-2 z-[400] bg-[#0F1F3D]/80 backdrop-blur-xs text-white text-[10px] font-medium px-2 py-0.5 rounded-[4px] border border-white/20 pointer-events-none">
        Sample data • Goa Live GPS
      </div>
    </div>
  );
};
