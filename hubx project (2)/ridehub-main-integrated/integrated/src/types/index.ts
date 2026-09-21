export type VehicleCategory = 'scooty' | 'bike' | 'car';

export interface Vehicle {
  id: string;
  shopId: string;
  name: string;
  category: VehicleCategory;
  brand: string;
  year: number;
  fuelType: string;
  transmission: string;
  mileage: string;
  basePrice: number;
  securityDeposit: number;
  rating: number;
  trips: number;
  isAvailable: boolean;
  image: string;
  videoWalkaround?: string;
  features: string[];
  locationName: string;
  dynamicAdjustment?: number;
  surgeReasons?: string[];
}

export interface TrustBreakdown {
  honesty: number;        // Deposit & damage dispute fairness rate (e.g. 99.4%)
  vehicleCondition: number;// Certified mechanical condition check
  punctuality: number;    // On-time handover percentage
  communication: number;  // Avg response time rating
}

export interface Shop {
  id: string;
  name: string;
  ownerId: string;
  address: string;
  city: string;
  lat: number;
  lng: number;
  isHubX: boolean;
  hubxPlan: string;
  trialDaysRemaining: number;
  trustScore: number;
  trustBreakdown: TrustBreakdown;
  totalBookings: number;
  activeVehicles: number;
  badge: string;
}

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
  fullName: string;
  email: string;
  phone: string;
  role: 'customer' | 'shopkeeper';
  isVerified: boolean;
  rewardPoints: number;
  verifiedDoc?: VerifiedDocument;
  authMethod?: 'phone_otp' | 'email_otp' | 'google';
  googleAvatar?: string;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
}

export interface Booking {
  id: string;
  userId: string;
  vehicleId: string;
  vehicleName: string;
  shopId: string;
  shopName: string;
  startTime: string;
  endTime: string;
  totalHours: number;
  basePrice: number;
  dynamicAdjustment: number;
  surgeReasons: string[];
  securityDeposit: number;
  taxesAndGst: number;
  finalAmount: number;
  upiRef: string;
  status: 'upcoming' | 'active' | 'extended' | 'completed' | 'cancelled';
  canExtend: boolean;
  pickupLocation: string;
  refundAmount?: number;
  refundPercentage?: number;
  agreementSignedAt?: string;
}

export interface SponsorCoupon {
  id: string;
  partnerName: string;
  hotelName: string;
  discountText: string;
  couponCode: string;
  validTill: string;
  isUnlocked: boolean;
  unlockedAt?: string;
  tagline: string;
  terms: string;
}

export interface WeatherData {
  city: string;
  temperatureC: number;
  humidityPct: number;
  windSpeedKmH: number;
  weatherCode: number;
  condition: string;
  isFavorableForTwoWheelers: boolean;
  weatherSurgeMultiplier: number;
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
  type: 'high_priority' | 'fleet_optimization' | 'weather_opportunity';
  targetVehicle: string;
  title: string;
  message: string;
}

export interface HubXSubscriptionPlan {
  id: string;
  name: string;
  tagline: string;
  pricePerMonth: number;
  billedPeriodText: string;
  savingsBadge?: string;
  isPopular?: boolean;
  features: string[];
}
