export type VehicleType = "scooty" | "bike" | "car";

export type Role = "customer" | "shopkeeper";

export type DocStatus = "Not Uploaded" | "Under Review" | "Verified" | "Rejected";

export interface VerifiedDocument {
  type: string;
  number: string;
  name: string;
  dob: string;
  expiry: string;
  category: string;
  issuingRTO?: string;
}

export interface User {
  id: string;
  role: Role;
  name: string;
  fullName?: string;
  email: string;
  phone: string;
  docsStatus: DocStatus;
  points: number;
  rewardPoints?: number;
  avatarUrl?: string;
  googleAvatar?: string;
  drivingLicenceUrl?: string;
  nationalIdUrl?: string;
  kycBonusClaimed?: boolean;
  verifiedDoc?: VerifiedDocument;
  authMethod?: "phone_otp" | "email_otp" | "google";
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  kycStatus?: "unverified" | "verified" | "rejected" | "pending";
  kycRejectionReason?: string;
  honestyScore?: number;
}

export interface TrustScore {
  overall: number; // out of 10 or 5.0
  honesty: number; // deposit & damage dispute fairness rate (e.g. 99.4%)
  condition: number; // mechanical condition check rate
  punctuality: number; // on-time handover percentage
  communication: number; // response time & clarity
  reviewCount: number;
}

export interface TrustBreakdown {
  honesty: number;
  vehicleCondition: number;
  punctuality: number;
  communication: number;
}

export type SubscriptionPlanName = "Monthly" | "6 months" | "Yearly";

export interface ShopPlan {
  name: SubscriptionPlanName;
  price: number; // in INR
  trialEndsAt: string; // ISO string
  isActive: boolean;
}

export interface Shop {
  id: string;
  ownerId: string;
  name: string;
  tagline: string;
  city: string;
  address: string;
  lat: number;
  lng: number;
  distanceKm: number;
  isHubX: boolean;
  trust: TrustScore;
  trustBreakdown?: TrustBreakdown;
  plan?: ShopPlan;
  images: string[];
  features: string[];
  totalBookings?: number;
  activeVehicles?: number;
  badge?: string;
  reviews: { author: string; rating: number; comment: string; date: string }[];
}

export interface Vehicle {
  id: string;
  shopId: string;
  shopName?: string;
  type: VehicleType;
  model: string;
  name?: string; // alias for model
  brand: string;
  year: number;
  fuel: string;
  fuelType?: string;
  mileage: string;
  transmission: string;
  condition: "Mint" | "Good" | "Fair";
  damageNotes: string;
  accessories: string[];
  videoUrl: string;
  videoWalkaround?: string;
  images: string[];
  image?: string; // thumbnail alias
  pricePerHour: number;
  pricePerDay: number;
  basePrice?: number;
  deposit: number;
  securityDeposit?: number;
  available: boolean;
  isAvailable?: boolean;
  dynamicPriceTag?: string;
  dynamicAdjustment?: number;
  surgeReasons?: string[];
  rating: number;
  totalTrips: number;
  trips?: number;
  locationName?: string;
}

export type BookingStatus = "upcoming" | "active" | "extended" | "completed" | "cancelled";

export interface Booking {
  id: string;
  vehicleId: string;
  vehicle?: Vehicle;
  shopId: string;
  shop?: Shop;
  customerId: string;
  customerName: string;
  customerPhone: string;
  bookedAt: string; // ISO string
  pickupAt: string; // ISO string
  returnAt: string; // ISO string
  isHourly: boolean;
  hours: number;
  days: number;
  delivery: boolean; // Self pickup or Doorstep delivery
  deliveryAddress?: string;
  baseAmount: number;
  deliveryFee: number;
  bookingFee: number;
  deposit: number;
  discountPointsUsed: number;
  discountAmount: number;
  total: number;
  status: BookingStatus;
  isExtended?: boolean;
  extendedMinutes?: number;
  canExtend?: boolean;
  paymentMethod: "UPI" | "Card" | "NetBanking";
  agreementSigned: boolean;
  upiRef?: string;
  refundAmount?: number;
  refundPercentage?: number;
  ratingGiven?: number;
  reviewGiven?: string;
}

export interface Coupon {
  id: string;
  hotel: string;
  hotelLogo?: string;
  discountText: string;
  code: string;
  minBookingValue: number;
  status: "active" | "used" | "expired";
  expiresAt: string;
  unlockedByRideId: string;
}

export interface WeatherData {
  city: string;
  lat?: number;
  lng?: number;
  temperatureC: number;
  humidityPct: number;
  windSpeedKmH: number;
  weatherCode: number;
  condition: string;
  isFavorableForTwoWheelers: boolean;
  weatherSurgeMultiplier: number;
  forecastDaily?: any;
}

export interface AIForecastDay {
  date: string;
  dayName: string;
  isWeekend: boolean;
  tempCelsius: number;
  scootyDemand: number;
  bikeDemand: number;
  carDemand: number;
  totalFleetUtilizationPct: number;
  recommendedSurgeMultiplier: number;
  competitorAvgPriceScooty: number;
  competitorAvgPriceBike: number;
  competitorAvgPriceCar: number;
}

export interface AIActionableInsight {
  type: "high_priority" | "fleet_optimization" | "weather_opportunity" | "pricing" | "competitor";
  targetVehicle: string;
  title: string;
  message: string;
  estimatedRevenueImpact: string;
}

export interface SearchFilters {
  vehicleType: string;
  location: string;
  lat?: number;
  lng?: number;
  pickupDate: string;
  pickupTime: string;
  returnDate: string;
  returnTime: string;
  durationHours: number;
  searchQuery: string;
}

export interface ToastMessage {
  id: string;
  type: "success" | "warning" | "info" | "error";
  title: string;
  message: string;
  timestamp: number;
}
