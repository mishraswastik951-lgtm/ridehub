import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Vehicle,
  Shop,
  Booking,
  User,
  SponsorCoupon,
  WeatherData,
  AIForecastDay,
  AIActionableInsight
} from '../types';
import { INITIAL_SHOPS, INITIAL_VEHICLES, INITIAL_COUPONS } from '../data/mockData';
import { fetchLiveWeather } from '../services/api';
import { trainModelFromCSV } from '../utils/aiForecasting';

export interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'info' | 'error';
  title: string;
  message: string;
  timestamp: number;
}

export type ViewName =
  | 'landing'
  | 'search'
  | 'vehicle_detail'
  | 'verification'
  | 'booking_flow'
  | 'rental_agreement'
  | 'active_rental'
  | 'cancellation'
  | 'rewards_wallet'
  | 'shop_listings'
  | 'shop_subscription'
  | 'shop_ai_dashboard'
  | 'dynamic_pricing_calendar'
  | 'shop_trust_profile'
  | 'how_it_works'
  | 'privacy_policy'
  | 'terms_conditions'
  | 'contact_support';

interface AppContextType {
  // Navigation & View
  currentView: ViewName;
  setCurrentView: (view: ViewName) => void;
  selectedVehicleId: string | null;
  setSelectedVehicleId: (id: string | null) => void;
  selectedShopId: string | null;
  setSelectedShopId: (id: string | null) => void;

  // Active User & Role
  currentUser: User;
  switchRole: (role: 'customer' | 'shopkeeper') => void;
  updateUserProfile: (updates: Partial<User>) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;

  // Inventory & Fleet
  vehicles: Vehicle[];
  shops: Shop[];
  addVehicle: (vehicle: Omit<Vehicle, 'id' | 'rating' | 'trips'>) => void;
  toggleVehicleAvailability: (id: string) => void;
  updateVehicleBasePrice: (id: string, price: number) => void;

  // Bookings & Rental lifecycle
  bookings: Booking[];
  activeBooking: Booking | null;
  createBooking: (booking: Omit<Booking, 'id' | 'status' | 'canExtend'>) => string;
  extendBooking: (bookingId: string, extraHours: number) => { success: boolean; conflict?: boolean; message: string };
  cancelBooking: (bookingId: string) => { refundPct: number; refundAmount: number };

  // Rewards & Sponsor Coupons
  coupons: SponsorCoupon[];
  unlockCoupon: (couponId: string) => void;
  redeemPoints: (points: number) => number;

  // Live Weather & AI Demand Intelligence
  weather: WeatherData | null;
  aiForecast: AIForecastDay[];
  aiInsights: AIActionableInsight[];
  isAITraining: boolean;
  loadKaggleDataset: (datasetType: 'urban' | 'goa' | 'custom', customCsvText?: string) => Promise<void>;

  // Shopkeeper HubX Subscription
  hubxTrialDaysLeft: number;
  currentHubxPlan: string;
  setHubxPlan: (planName: string) => void;

  // Toasts
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id' | 'timestamp'>) => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation
  const [currentView, setCurrentView] = useState<ViewName>('landing');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>('veh_scooty_1');
  const [selectedShopId, setSelectedShopId] = useState<string | null>('shop_1');

  // Auth State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User>({
    id: 'user_cust_1',
    fullName: 'Aditya Sharma',
    email: 'aditya.sharma@example.com',
    phone: '+91 98765 43210',
    role: 'customer',
    isVerified: true,
    rewardPoints: 340,
    authMethod: 'phone_otp',
    isPhoneVerified: true,
    isEmailVerified: false,
    verifiedDoc: {
      type: 'Driving Licence',
      number: 'KA-05-2021-0089421',
      name: 'Aditya Sharma',
      dob: '1995-08-14',
      expiry: '2042-08-13',
      category: 'MCWG / LMV',
      issuingRTO: 'KA-05 Jayanagar / Bangalore'
    }
  });

  // Fleet & Shops
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    const saved = localStorage.getItem('ridehub_vehicles');
    return saved ? JSON.parse(saved) : INITIAL_VEHICLES;
  });

  const [shops] = useState<Shop[]>(INITIAL_SHOPS);

  // Bookings
  const [bookings, setBookings] = useState<Booking[]>(() => {
    const saved = localStorage.getItem('ridehub_bookings');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'RH-BK-9281',
        userId: 'user_cust_1',
        vehicleId: 'veh_scooty_1',
        vehicleName: 'Honda Activa 6G Premium',
        shopId: 'shop_1',
        shopName: 'Apex Mobility Indiranagar',
        startTime: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
        endTime: new Date(Date.now() + 3600 * 1000 * 20).toISOString(),
        totalHours: 24,
        basePrice: 450,
        dynamicAdjustment: 60,
        surgeReasons: ['Weekend City Leisure Peak (+₹40)', 'Clear Weather (+₹20)'],
        securityDeposit: 1000,
        taxesAndGst: 91,
        finalAmount: 1601,
        upiRef: 'UPI-983021984210',
        status: 'active',
        canExtend: true,
        pickupLocation: '100 Feet Road, Indiranagar, Bengaluru'
      }
    ];
  });

  // Coupons
  const [coupons, setCoupons] = useState<SponsorCoupon[]>(() => {
    const saved = localStorage.getItem('ridehub_coupons');
    return saved ? JSON.parse(saved) : INITIAL_COUPONS;
  });

  // Shopkeeper HubX
  const [hubxTrialDaysLeft] = useState<number>(18);
  const [currentHubxPlan, setCurrentHubxPlan] = useState<string>('Yearly Plan (Active)');

  // Weather & AI
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [aiForecast, setAiForecast] = useState<AIForecastDay[]>([]);
  const [aiInsights, setAiInsights] = useState<AIActionableInsight[]>([]);
  const [isAITraining, setIsAITraining] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (t: Omit<ToastMessage, 'id' | 'timestamp'>) => {
    const id = `toast_${Date.now()}_${Math.random()}`;
    const newToast: ToastMessage = { ...t, id, timestamp: Date.now() };
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  };

  // Initial Weather & AI Load
  useEffect(() => {
    // 1. Fetch live Open-Meteo weather
    fetchLiveWeather().then((w) => setWeather(w));

    // 2. Train AI forecast from local Kaggle dataset
    loadKaggleDataset('urban');
  }, []);

  // Save changes
  useEffect(() => {
    localStorage.setItem('ridehub_vehicles', JSON.stringify(vehicles));
  }, [vehicles]);

  useEffect(() => {
    localStorage.setItem('ridehub_bookings', JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem('ridehub_coupons', JSON.stringify(coupons));
  }, [coupons]);

  const loadKaggleDataset = async (datasetType: 'urban' | 'goa' | 'custom', customCsvText?: string) => {
    setIsAITraining(true);
    let targetPath = '/data/kaggle_vehicle_demand.csv';
    if (datasetType === 'goa') targetPath = '/data/kaggle_goa_tourism_demand.csv';

    try {
      const result = await trainModelFromCSV(
        datasetType === 'custom' && customCsvText ? customCsvText : targetPath,
        datasetType === 'custom'
      );
      setAiForecast(result.forecast);
      setAiInsights(result.insights);
    } catch (err) {
      console.error('Failed training AI model:', err);
    } finally {
      setIsAITraining(false);
    }
  };

  const switchRole = (role: 'customer' | 'shopkeeper') => {
    if (role === 'customer') {
      setCurrentUser({
        id: 'user_cust_1',
        fullName: 'Aditya Sharma',
        email: 'aditya.sharma@example.com',
        phone: '+91 98765 43210',
        role: 'customer',
        isVerified: true,
        rewardPoints: 340,
        authMethod: 'phone_otp',
        isPhoneVerified: true,
        isEmailVerified: false,
        verifiedDoc: {
          type: 'Driving Licence',
          number: 'KA-05-2021-0089421',
          name: 'Aditya Sharma',
          dob: '1995-08-14',
          expiry: '2042-08-13',
          category: 'MCWG / LMV',
          issuingRTO: 'KA-05 Jayanagar / Bangalore'
        }
      });
      setCurrentView('landing');
      addToast({
        type: 'info',
        title: 'Customer Mode Active',
        message: 'You are viewing RideHub as a customer. Browse, verify documents, and book rentals.'
      });
    } else {
      setCurrentUser({
        id: 'user_shop_1',
        fullName: 'Rajesh Motors & Rentals',
        email: 'contact@rajeshrentals.in',
        phone: '+91 98450 11223',
        role: 'shopkeeper',
        isVerified: true,
        rewardPoints: 1250,
        authMethod: 'phone_otp',
        isPhoneVerified: true,
        isEmailVerified: false
      });
      setCurrentView('shop_ai_dashboard');
      addToast({
        type: 'info',
        title: 'HubX Shopkeeper Mode Active',
        message: 'You are in the HubX Shopkeeper portal. Access AI forecasting, dynamic pricing, and fleet management.'
      });
    }
  };

  const updateUserProfile = (updates: Partial<User>) => {
    setCurrentUser((prev) => ({ ...prev, ...updates }));
  };

  const addVehicle = (newV: Omit<Vehicle, 'id' | 'rating' | 'trips'>) => {
    const v: Vehicle = {
      ...newV,
      id: `veh_${Date.now()}`,
      rating: 5.0,
      trips: 0
    };
    setVehicles((prev) => [v, ...prev]);
    addToast({
      type: 'success',
      title: 'Vehicle Listed Successfully',
      message: `${v.name} is now live and searchable on RideHub.`
    });
  };

  const toggleVehicleAvailability = (id: string) => {
    setVehicles((prev) =>
      prev.map((v) => (v.id === id ? { ...v, isAvailable: !v.isAvailable } : v))
    );
  };

  const updateVehicleBasePrice = (id: string, price: number) => {
    setVehicles((prev) =>
      prev.map((v) => (v.id === id ? { ...v, basePrice: price } : v))
    );
  };

  const activeBooking = bookings.find((b) => b.status === 'active') || null;

  const createBooking = (bookingData: Omit<Booking, 'id' | 'status' | 'canExtend'>) => {
    const newId = `RH-BK-${Math.floor(1000 + Math.random() * 9000)}`;
    const newBooking: Booking = {
      ...bookingData,
      id: newId,
      status: 'active',
      canExtend: true,
      agreementSignedAt: new Date().toISOString()
    };

    // Calculate loyalty points earned: 1 point per ₹10 spent
    const earnedPoints = Math.floor(newBooking.finalAmount / 10);
    setCurrentUser((prev) => ({
      ...prev,
      rewardPoints: prev.rewardPoints + earnedPoints
    }));

    setBookings((prev) => [newBooking, ...prev]);
    addToast({
      type: 'success',
      title: 'Booking Confirmed!',
      message: `You earned +${earnedPoints} HubX reward points on this ride.`
    });

    return newId;
  };

  const extendBooking = (bookingId: string, extraHours: number) => {
    // If extension is > 12 hours, simulate next customer slot reservation conflict
    if (extraHours > 12) {
      return {
        success: false,
        conflict: true,
        message: 'This vehicle is reserved by another rider starting at 6:00 PM today.'
      };
    }

    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === bookingId) {
          const currentEnd = new Date(b.endTime);
          currentEnd.setHours(currentEnd.getHours() + extraHours);
          return {
            ...b,
            endTime: currentEnd.toISOString(),
            totalHours: b.totalHours + extraHours
          };
        }
        return b;
      })
    );

    addToast({
      type: 'success',
      title: 'Rental Duration Extended',
      message: `Your rental period has been extended by ${extraHours} hours.`
    });

    return { success: true, message: `Extended by ${extraHours} hours.` };
  };

  const cancelBooking = (bookingId: string) => {
    const target = bookings.find((b) => b.id === bookingId);
    if (!target) return { refundPct: 0, refundAmount: 0 };

    // Cancellation Tier calculation based on lead time elapsed:
    // Cancelled in first 25% of window: 100% refund
    // Cancelled in up to 50% of window: 50% refund
    // After 50%: 0% refund
    const refundPct = 100; // Demo default: within first 25% window
    const refundAmount = Math.round((target.finalAmount * refundPct) / 100);

    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? {
              ...b,
              status: 'cancelled',
              refundAmount,
              refundPercentage: refundPct
            }
          : b
      )
    );

    addToast({
      type: 'warning',
      title: 'Booking Cancelled',
      message: `${refundPct}% refund (₹${refundAmount}) initiated to your UPI account.`
    });

    return { refundPct, refundAmount };
  };

  const unlockCoupon = (couponId: string) => {
    setCoupons((prev) =>
      prev.map((c) =>
        c.id === couponId
          ? { ...c, isUnlocked: true, unlockedAt: new Date().toISOString() }
          : c
      )
    );
    addToast({
      type: 'success',
      title: 'Hotel Sponsor Reward Unlocked!',
      message: 'Your exclusive hospitality voucher is ready to copy and redeem.'
    });
  };

  const redeemPoints = (points: number) => {
    const maxRedeemable = Math.min(points, currentUser.rewardPoints, 500); // 1 pt = ₹1, cap at ₹500
    setCurrentUser((prev) => ({
      ...prev,
      rewardPoints: prev.rewardPoints - maxRedeemable
    }));
    return maxRedeemable;
  };

  const setHubxPlan = (planName: string) => {
    setCurrentHubxPlan(planName);
    addToast({
      type: 'success',
      title: 'HubX Subscription Updated',
      message: `Your shop plan is now set to ${planName}.`
    });
  };

  return (
    <AppContext.Provider
      value={{
        currentView,
        setCurrentView,
        selectedVehicleId,
        setSelectedVehicleId,
        selectedShopId,
        setSelectedShopId,
        currentUser,
        switchRole,
        updateUserProfile,
        isAuthModalOpen,
        setIsAuthModalOpen,
        vehicles,
        shops,
        addVehicle,
        toggleVehicleAvailability,
        updateVehicleBasePrice,
        bookings,
        activeBooking,
        createBooking,
        extendBooking,
        cancelBooking,
        coupons,
        unlockCoupon,
        redeemPoints,
        weather,
        aiForecast,
        aiInsights,
        isAITraining,
        loadKaggleDataset,
        hubxTrialDaysLeft,
        currentHubxPlan,
        setHubxPlan,
        toasts,
        addToast,
        removeToast
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
