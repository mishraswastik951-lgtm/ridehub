export interface LatLng {
  lat: number;
  lng: number;
}

export interface RiderInfo {
  name: string;
  phone: string;
  rating: number;
  photoUrl: string;
  vehicleRegNo: string;
  tripsCount: number;
}

export interface FleetVehicle {
  id: string;
  model: string;
  regNo: string;
  type: "scooty" | "bike" | "car";
  status: "on_ride" | "on_delivery" | "idle" | "overdue";
  batteryFuel: number; // percentage
  speedKmh: number;
  currentLat: number;
  currentLng: number;
  heading: number;
  customerName?: string;
  customerPhone?: string;
  customerVerified: boolean;
  timeLeftMinutes?: number;
  lastUpdateText: string;
  shopName: string;
  route: LatLng[];
}

export interface FleetAlert {
  id: string;
  vehicleId: string;
  vehicleModel: string;
  regNo: string;
  type: "overdue" | "geofence" | "offline";
  severity: "high" | "medium" | "low";
  message: string;
  timestamp: string;
}

export const GOA_DEMO_CITY = {
  name: "Panaji & Calangute, Goa",
  center: { lat: 15.518, lng: 73.792 },
  zoom: 13,
  sampleLabel: "Sample data (Goa Live GPS)",
};

// Delivery route: From Shop in Panaji (15.4989, 73.8278) to Customer Address in Calangute (15.5435, 73.7553)
export const DELIVERY_ROUTE_POINTS: LatLng[] = [
  { lat: 15.4989, lng: 73.8278 }, // Shop Hub - Panaji EDC Complex
  { lat: 15.5034, lng: 73.8221 }, // Mandovi Bridge North
  { lat: 15.5112, lng: 73.8145 }, // Porvorim Junction
  { lat: 15.5204, lng: 73.8052 }, // Sangolda Bypass
  { lat: 15.5298, lng: 73.7932 }, // Saligao Church Corner
  { lat: 15.5365, lng: 73.7789 }, // Chogm Road Entry
  { lat: 15.5412, lng: 73.7668 }, // Calangute Mall St.
  { lat: 15.5435, lng: 73.7553 }, // Customer Delivery Point - Calangute Beach Road
];

// Active Ride route: Coastal loop around Calangute - Baga - Anjuna
export const ACTIVE_RIDE_ROUTE_POINTS: LatLng[] = [
  { lat: 15.5435, lng: 73.7553 }, // Calangute Start
  { lat: 15.5498, lng: 73.7532 }, // Baga Road
  { lat: 15.5562, lng: 73.7511 }, // Baga Creek Bridge
  { lat: 15.5684, lng: 73.7442 }, // Anjuna Hill Road
  { lat: 15.5781, lng: 73.7405 }, // Anjuna Beach Corner
  { lat: 15.5695, lng: 73.7558 }, // Arpora Junction Return
  { lat: 15.5543, lng: 73.7621 }, // Calangute Circle Return Point (Shop / Geofence Center)
];

export const MOCK_RIDER_INFO: RiderInfo = {
  name: "Ramesh Naik",
  phone: "+91 98221 44512",
  rating: 4.9,
  photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
  vehicleRegNo: "GA-03-X-4892",
  tripsCount: 142,
};

export const MOCK_FLEET_VEHICLES: FleetVehicle[] = [
  {
    id: "veh-fleet-1",
    model: "Honda Activa 6G (2024)",
    regNo: "GA-03-X-4892",
    type: "scooty",
    status: "on_delivery",
    batteryFuel: 88,
    speedKmh: 34,
    currentLat: 15.5204,
    currentLng: 73.8052,
    heading: 315,
    customerName: "Aarav Sharma",
    customerPhone: "+91 90765 43210",
    customerVerified: true,
    timeLeftMinutes: 12,
    lastUpdateText: "2 seconds ago",
    shopName: "Coastal Scoots Hub - Panaji",
    route: DELIVERY_ROUTE_POINTS,
  },
  {
    id: "veh-fleet-2",
    model: "Royal Enfield Hunter 350",
    regNo: "GA-01-E-7721",
    type: "bike",
    status: "on_ride",
    batteryFuel: 65,
    speedKmh: 48,
    currentLat: 15.5562,
    currentLng: 73.7511,
    heading: 340,
    customerName: "Priya Patel",
    customerPhone: "+91 98765 12345",
    customerVerified: true,
    timeLeftMinutes: 145,
    lastUpdateText: "Just now",
    shopName: "Coastal Scoots Hub - Panaji",
    route: ACTIVE_RIDE_ROUTE_POINTS,
  },
  {
    id: "veh-fleet-3",
    model: "Yamaha Aerox 155",
    regNo: "GA-03-Z-9912",
    type: "scooty",
    status: "overdue",
    batteryFuel: 22,
    speedKmh: 0,
    currentLat: 15.5781,
    currentLng: 73.7405,
    heading: 90,
    customerName: "Vikram Singh",
    customerPhone: "+91 91122 33445",
    customerVerified: true,
    timeLeftMinutes: -22,
    lastUpdateText: "1 minute ago",
    shopName: "Goa Wheelers - Calangute",
    route: ACTIVE_RIDE_ROUTE_POINTS,
  },
  {
    id: "veh-fleet-4",
    model: "TVS Jupiter 125",
    regNo: "GA-07-K-3341",
    type: "scooty",
    status: "idle",
    batteryFuel: 100,
    speedKmh: 0,
    currentLat: 15.4989,
    currentLng: 73.8278,
    heading: 0,
    customerVerified: false,
    lastUpdateText: "5 minutes ago",
    shopName: "Coastal Scoots Hub - Panaji",
    route: [],
  },
  {
    id: "veh-fleet-5",
    model: "Mahindra Thar 4x4 Convertible",
    regNo: "GA-03-C-1001",
    type: "car",
    status: "on_ride",
    batteryFuel: 74,
    speedKmh: 52,
    currentLat: 15.5112,
    currentLng: 73.8145,
    heading: 210,
    customerName: "Rahul Kapoor",
    customerPhone: "+91 98989 77777",
    customerVerified: true,
    timeLeftMinutes: 85,
    lastUpdateText: "Just now",
    shopName: "Goa Wheelers - Calangute",
    route: DELIVERY_ROUTE_POINTS,
  },
];

export const MOCK_FLEET_ALERTS: FleetAlert[] = [
  {
    id: "alert-1",
    vehicleId: "veh-fleet-3",
    vehicleModel: "Yamaha Aerox 155",
    regNo: "GA-03-Z-9912",
    type: "overdue",
    severity: "high",
    message: "Vehicle return deadline passed by 22 minutes. Customer unreachable via automated SMS.",
    timestamp: "22 mins ago",
  },
  {
    id: "alert-2",
    vehicleId: "veh-fleet-2",
    vehicleModel: "Royal Enfield Hunter 350",
    regNo: "GA-01-E-7721",
    type: "geofence",
    severity: "medium",
    message: "Vehicle approached 15 km North Goa coastal perimeter boundary.",
    timestamp: "8 mins ago",
  },
  {
    id: "alert-3",
    vehicleId: "veh-fleet-4",
    vehicleModel: "Honda Activa 6G",
    regNo: "GA-07-A-1102",
    type: "offline",
    severity: "low",
    message: "Tracker heartbeat silent for 15 minutes at Panaji Hub station.",
    timestamp: "15 mins ago",
  },
];
