import React, { createContext, useContext, useState, useEffect } from "react";
import { User, Shop, Vehicle, Booking, Coupon, Role, DocStatus, WeatherData, ToastMessage, AIForecastDay, AIActionableInsight } from "../types";
import { MOCK_USERS, MOCK_SHOPS, MOCK_VEHICLES, MOCK_BOOKINGS, MOCK_COUPONS } from "../data/mockData";
import { fetchLiveWeather, fetchDemandForecast } from "../api/hubxApi";
import { googleSignIn, firebaseSignOut } from "../config/firebase";

interface AppContextType {
  currentUser: User;
  users: User[];
  shops: Shop[];
  vehicles: Vehicle[];
  bookings: Booking[];
  coupons: Coupon[];
  activeRole: Role;
  demoStep: number;
  weather: WeatherData | null;
  forecast: AIForecastDay[];
  actionableInsights: AIActionableInsight[];
  toasts: ToastMessage[];

  // Auth actions
  switchUser: (userId: string) => void;
  switchRole: (role: Role) => void;
  loginUser: (email: string, phone: string, role: Role, name?: string) => { success: boolean; message?: string };
  verifyOtp: (code: string) => boolean;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  logout: () => void;

  // KYC verification
  uploadDocuments: (licenceUrl: string, nationalIdUrl: string) => void;
  claimKycBonus: () => void;

  // Fleet & Shop actions (Shopkeeper)
  addVehicle: (vehicle: Omit<Vehicle, "id" | "shopId" | "rating" | "totalTrips">) => void;
  updateVehicle: (id: string, updates: Partial<Vehicle>) => void;
  updateShopDynamicPricing: (shopId: string, vehicleId: string, newRate: number, reason: string) => void;
  upgradeShopPlan: (shopId: string, planName: "Monthly" | "6 months" | "Yearly") => void;

  // Booking actions (Customer)
  createBooking: (bookingData: Omit<Booking, "id" | "bookedAt" | "status">) => Booking;
  cancelBooking: (bookingId: string) => { success: boolean; refundAmount: number; refundPercent: number };
  extendRide: (bookingId: string, additionalMinutes: number, extraCost: number) => { success: boolean; message: string; blocked?: boolean; replacementVehicle?: Vehicle };
  returnRide: (bookingId: string, rating: number, review: string) => void;
  redeemCoupon: (couponId: string) => void;

  // Feedback & Toasts
  addToast: (toast: Omit<ToastMessage, "id" | "timestamp">) => void;
  removeToast: (id: string) => void;

  // Demo helpers
  setDemoStep: (step: number) => void;
  resetAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  function getStorage<T>(key: string, defaultVal: T): T {
    try {
      const stored = localStorage.getItem(`ridehub_${key}`);
      return stored ? JSON.parse(stored) : defaultVal;
    } catch {
      return defaultVal;
    }
  }

  const [users, setUsers] = useState<User[]>(() => getStorage("users", MOCK_USERS));
  const [currentUser, setCurrentUser] = useState<User>(() => getStorage("currentUser", MOCK_USERS[0]));
  const [shops, setShops] = useState<Shop[]>(() => getStorage("shops", MOCK_SHOPS));
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => getStorage("vehicles", MOCK_VEHICLES));
  const [bookings, setBookings] = useState<Booking[]>(() => getStorage("bookings", MOCK_BOOKINGS));
  const [coupons, setCoupons] = useState<Coupon[]>(() => getStorage("coupons", MOCK_COUPONS));
  const [demoStep, setDemoStep] = useState<number>(() => getStorage("demoStep", 1));

  // Live Weather & Demand Intelligence State
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<AIForecastDay[]>([]);
  const [actionableInsights, setActionableInsights] = useState<AIActionableInsight[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Sync to localStorage has been DELETED in favor of live MongoDB fetches
  useEffect(() => {
    async function loadDataFromDb() {
      try {
        const [dbUsers, dbShops, dbVehicles, dbBookings] = await Promise.all([
          import("../api/hubxApi").then(api => api.fetchUsers()),
          import("../api/hubxApi").then(api => api.fetchShops()),
          import("../api/hubxApi").then(api => api.fetchVehicles()),
          import("../api/hubxApi").then(api => api.fetchBookings())
        ]);
        if (dbUsers.length) setUsers(dbUsers);
        if (dbShops.length) setShops(dbShops);
        if (dbVehicles.length) setVehicles(dbVehicles);
        if (dbBookings.length) setBookings(dbBookings);
      } catch (err) {
        console.error("Failed to fetch initial MongoDB data:", err);
      }
    }
    loadDataFromDb();
  }, []);

  // Load weather and forecasting on startup
  useEffect(() => {
    fetchLiveWeather().then(setWeather).catch(() => {});
    fetchDemandForecast("shop-1").then((data) => {
      if (data.forecast) setForecast(data.forecast);
      if (data.actionableInsights) setActionableInsights(data.actionableInsights);
    }).catch(() => {});
  }, []);

  const activeRole = currentUser.role;

  const addToast = (toast: Omit<ToastMessage, "id" | "timestamp">) => {
    const newToast: ToastMessage = {
      ...toast,
      id: `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: Date.now(),
    };
    setToasts((prev) => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const switchUser = (userId: string) => {
    const found = users.find((u) => u.id === userId);
    if (found) {
      setCurrentUser(found);
      addToast({
        type: "info",
        title: `Switched Persona: ${found.name}`,
        message: `Active view updated to ${found.role} dashboard.`,
      });
    }
  };

  const switchRole = (role: Role) => {
    const existing = users.find((u) => u.role === role);
    if (existing) {
      setCurrentUser(existing);
      addToast({
        type: "info",
        title: `Switched to ${role === "customer" ? "Customer Explorer" : "HubX Fleet Partner"}`,
        message: `Current identity: ${existing.name}`,
      });
    } else {
      const newUser: User = {
        id: `user-${role}-${Date.now()}`,
        role,
        name: role === "customer" ? "Demo Customer" : "Demo Shopkeeper",
        fullName: role === "customer" ? "Demo Customer" : "Demo Shopkeeper",
        email: role === "customer" ? "customer@ridehub.in" : "shopkeeper@ridehub.in",
        phone: role === "customer" ? "+91 91234 56789" : "+91 99887 76655",
        docsStatus: "Verified",
        points: 200,
        rewardPoints: 200,
      };
      setUsers((prev) => [...prev, newUser]);
      setCurrentUser(newUser);
    }
  };

  const loginUser = (email: string, phone: string, role: Role, name?: string) => {
    const normalizedPhone = phone.replace(/[^0-9+]/g, "");
    const phoneOwner = users.find((u) => u.phone.replace(/[^0-9+]/g, "") === normalizedPhone);

    if (phoneOwner && phoneOwner.email.toLowerCase() !== email.toLowerCase()) {
      return {
        success: false,
        message: `Phone number is already linked to ${phoneOwner.name}. One phone number maps to one identity under RideHub trust policy.`,
      };
    }

    if (phoneOwner) {
      setCurrentUser(phoneOwner);
      return { success: true };
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      role,
      name: name || email.split("@")[0].charAt(0).toUpperCase() + email.split("@")[0].slice(1),
      fullName: name || email.split("@")[0],
      email,
      phone,
      docsStatus: "Not Uploaded",
      points: 100,
      rewardPoints: 100,
      authMethod: "phone_otp",
      isPhoneVerified: true,
    };

    setUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    addToast({
      type: "success",
      title: "Welcome to RideHub!",
      message: `Signed in as ${newUser.name}. 100 Welcome points awarded!`,
    });
    return { success: true };
  };

  const verifyOtp = (code: string) => {
    if (code === "1234" || code.length >= 4) {
      addToast({
        type: "success",
        title: "OTP Verified",
        message: "Identity and phone confirmed through secure sandbox OTP.",
      });
      return true;
    }
    return false;
  };

  const signInWithGoogle = async () => {
    const result = await googleSignIn();
    if (!result.success || !result.user) {
      return { success: false, error: result.error || "Google Sign-In failed" };
    }

    const gUser = result.user;
    const existing = users.find((u) => u.email.toLowerCase() === (gUser.email || "").toLowerCase());

    if (existing) {
      setCurrentUser(existing);
      addToast({
        type: "success",
        title: "Welcome Back!",
        message: `Authenticated via Google: ${existing.name}`,
      });
      return { success: true };
    }

    const newUser: User = {
      id: `user-google-${gUser.uid}`,
      role: "customer",
      name: gUser.displayName || "Google User",
      fullName: gUser.displayName || "Google User",
      email: gUser.email || "",
      phone: "+91 98765 00000",
      docsStatus: "Not Uploaded",
      points: 150,
      rewardPoints: 150,
      avatarUrl: gUser.photoURL || undefined,
      authMethod: "google",
      isEmailVerified: true,
    };

    setUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    addToast({
      type: "success",
      title: "Google Authentication Successful",
      message: `Signed in as ${newUser.name}. 150 points added!`,
    });
    return { success: true };
  };

  const logout = () => {
    firebaseSignOut();
    addToast({
      type: "info",
      title: "Signed Out",
      message: "You have been logged out.",
    });
  };

  const uploadDocuments = (licenceUrl: string, nationalIdUrl: string) => {
    const updatedUser: User = {
      ...currentUser,
      drivingLicenceUrl: licenceUrl,
      nationalIdUrl: nationalIdUrl,
      docsStatus: "Verified" as DocStatus,
      points: currentUser.kycBonusClaimed ? currentUser.points : currentUser.points + 150,
      rewardPoints: currentUser.kycBonusClaimed ? currentUser.points : currentUser.points + 150,
      kycBonusClaimed: true,
      kycStatus: "verified",
      verifiedDoc: {
        type: "Driving Licence",
        number: "KA-05-2021-0089421",
        name: currentUser.name,
        dob: "1995-08-14",
        expiry: "2042-08-13",
        category: "MCWG / LMV",
        issuingRTO: "KA-05 Bangalore South",
      },
    };
    setCurrentUser(updatedUser);
    setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
    addToast({
      type: "success",
      title: "KYC Documents Approved",
      message: "+150 bonus loyalty points credited to your wallet!",
    });
  };

  const claimKycBonus = () => {
    if (!currentUser.kycBonusClaimed) {
      const updatedUser = {
        ...currentUser,
        points: currentUser.points + 150,
        rewardPoints: currentUser.points + 150,
        kycBonusClaimed: true,
      };
      setCurrentUser(updatedUser);
      setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
      addToast({
        type: "success",
        title: "Bonus Claimed",
        message: "150 loyalty points credited to your wallet.",
      });
    }
  };

  const addVehicle = (vehicleData: Omit<Vehicle, "id" | "shopId" | "rating" | "totalTrips">) => {
    const myShop = shops.find((s) => s.ownerId === currentUser.id) || shops[0];
    const newVehicle: Vehicle = {
      ...vehicleData,
      id: `veh-${Date.now()}`,
      shopId: myShop.id,
      shopName: myShop.name,
      rating: 5.0,
      totalTrips: 0,
      trips: 0,
      available: true,
      isAvailable: true,
    };
    setVehicles((prev) => [newVehicle, ...prev]);
    addToast({
      type: "success",
      title: "Vehicle Added to Fleet",
      message: `${newVehicle.model} is now live and bookable on RideHub.`,
    });
  };

  const updateVehicle = (id: string, updates: Partial<Vehicle>) => {
    setVehicles((prev) => prev.map((v) => (v.id === id ? { ...v, ...updates } : v)));
  };

  const updateShopDynamicPricing = (shopId: string, vehicleId: string, newRate: number, reason: string) => {
    setVehicles((prev) =>
      prev.map((v) => {
        if (v.id === vehicleId) {
          return {
            ...v,
            pricePerHour: Math.round(newRate / 8),
            pricePerDay: newRate,
            basePrice: newRate,
            dynamicPriceTag: reason,
          };
        }
        return v;
      })
    );
    addToast({
      type: "success",
      title: "Dynamic Price Published",
      message: `Adjusted rate to ₹${newRate}/day (${reason}).`,
    });
  };

  const upgradeShopPlan = (shopId: string, planName: "Monthly" | "6 months" | "Yearly") => {
    const prices = { Monthly: 499, "6 months": 2499, Yearly: 4499 };
    setShops((prev) =>
      prev.map((s) => {
        if (s.id === shopId) {
          return {
            ...s,
            isHubX: true,
            plan: {
              name: planName,
              price: prices[planName],
              trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              isActive: true,
            },
          };
        }
        return s;
      })
    );
    addToast({
      type: "success",
      title: "HubX Partner Subscription Active",
      message: `Upgraded to ${planName} Plan with 30-day risk-free evaluation.`,
    });
  };

  const createBooking = (bookingData: Omit<Booking, "id" | "bookedAt" | "status">): Booking => {
    const targetVehicle = vehicles.find((v) => v.id === bookingData.vehicleId);
    const targetShop = shops.find((s) => s.id === bookingData.shopId);

    const newBooking: Booking = {
      ...bookingData,
      id: `BK-${Math.floor(1000 + Math.random() * 9000)}`,
      bookedAt: new Date().toISOString(),
      status: "active",
      canExtend: true,
      vehicle: targetVehicle,
      shop: targetShop,
      paymentMethod: "UPI",
    };

    const earnedPoints = targetShop?.isHubX ? Math.floor(newBooking.total / 10) : 0;
    const remainingPoints = Math.max(0, currentUser.points - bookingData.discountPointsUsed + earnedPoints);

    const updatedUser = { ...currentUser, points: remainingPoints, rewardPoints: remainingPoints };
    setCurrentUser(updatedUser);
    setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
    setBookings((prev) => [newBooking, ...prev]);

    // Async MongoDB write
    import("../api/hubxApi").then(api => {
      // Map to mongoose schema
      const dbPayload = {
        _id: newBooking.id,
        userId: currentUser.id,
        vehicleId: newBooking.vehicleId,
        shopId: newBooking.shopId,
        startTime: newBooking.pickupAt,
        endTime: newBooking.returnAt,
        totalDays: newBooking.days,
        basePrice: newBooking.baseAmount,
        securityDeposit: newBooking.deposit,
        taxesAndGst: newBooking.bookingFee, // mapped to bookingFee
        pointsDiscount: newBooking.discountPointsUsed || 0,
        finalAmount: newBooking.total,
        paymentStatus: "completed",
        rentalStatus: "upcoming"
      };
      api.createBookingDb(dbPayload).catch(err => console.error("MongoDB Sync Failed:", err));
    });

    addToast({
      type: "success",
      title: "Booking Confirmed!",
      message: `Reservation ${newBooking.id} secured via NPCI UPI with instant escrow.`,
    });

    return newBooking;
  };

  const cancelBooking = (bookingId: string) => {
    const target = bookings.find((b) => b.id === bookingId);
    if (!target) return { success: false, refundAmount: 0, refundPercent: 0 };

    const pickupTime = new Date(target.pickupAt).getTime();
    const bookedTime = new Date(target.bookedAt).getTime();
    const now = Date.now();
    const totalLead = Math.max(pickupTime - bookedTime, 1);
    const elapsed = Math.max(now - bookedTime, 0);
    const ratio = elapsed / totalLead;

    let refundPercent = 0;
    if (ratio <= 0.25) refundPercent = 100;
    else if (ratio <= 0.5) refundPercent = 50;
    else refundPercent = 0;

    const refundAmount = Math.round((target.total * refundPercent) / 100);

    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? {
              ...b,
              status: "cancelled",
              refundAmount,
              refundPercentage: refundPercent,
            }
          : b
      )
    );

    addToast({
      type: refundPercent > 0 ? "success" : "warning",
      title: "Booking Cancelled",
      message: `${refundPercent}% refund (₹${refundAmount}) initiated to your original UPI account.`,
    });

    return { success: true, refundAmount, refundPercent };
  };

  const extendRide = (bookingId: string, additionalMinutes: number, extraCost: number) => {
    const target = bookings.find((b) => b.id === bookingId);
    if (!target) return { success: false, message: "Booking not found." };

    if (additionalMinutes > 12 * 60) {
      const replacement = vehicles.find((v) => v.id !== target.vehicleId && v.available && v.type === target.vehicle?.type);
      return {
        success: false,
        blocked: true,
        message: "Vehicle has an incoming reserved slot from another customer.",
        replacementVehicle: replacement,
      };
    }

    const currentReturn = new Date(target.returnAt).getTime();
    const newReturn = new Date(currentReturn + additionalMinutes * 60 * 1000).toISOString();

    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === bookingId) {
          return {
            ...b,
            returnAt: newReturn,
            total: b.total + extraCost,
            isExtended: true,
            extendedMinutes: (b.extendedMinutes || 0) + additionalMinutes,
          };
        }
        return b;
      })
    );

    addToast({
      type: "success",
      title: "Ride Extended Successfully",
      message: `Return extended by ${Math.round(additionalMinutes / 60)} hour(s).`,
    });

    return {
      success: true,
      message: `Ride extended successfully! New return time: ${new Date(newReturn).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}.`,
    };
  };

  const returnRide = (bookingId: string, rating: number, review: string) => {
    const target = bookings.find((b) => b.id === bookingId);
    if (!target) return;

    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === bookingId) {
          return {
            ...b,
            status: "completed",
            ratingGiven: rating,
            reviewGiven: review,
          };
        }
        return b;
      })
    );

    const isHubX = shops.find((s) => s.id === target.shopId)?.isHubX;
    if (isHubX) {
      const newCoupon: Coupon = {
        id: `coup-${Date.now()}`,
        hotel: "Taj Vivanta & Ginger Hotels",
        hotelLogo: "🏨",
        discountText: "Flat ₹1,000 OFF on your next stay",
        code: `RIDEHUB-${Math.floor(1000 + Math.random() * 9000)}`,
        minBookingValue: 4000,
        status: "active",
        expiresAt: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
        unlockedByRideId: bookingId,
      };
      setCoupons((prev) => [newCoupon, ...prev]);
    }

    addToast({
      type: "success",
      title: "Rental Completed",
      message: "Security deposit released back to UPI. Thank you for your feedback!",
    });
  };

  const redeemCoupon = (couponId: string) => {
    setCoupons((prev) => prev.map((c) => (c.id === couponId ? { ...c, status: "used" } : c)));
  };

  const resetAllData = () => {
    localStorage.clear();
    setUsers(MOCK_USERS);
    setCurrentUser(MOCK_USERS[0]);
    setShops(MOCK_SHOPS);
    setVehicles(MOCK_VEHICLES);
    setBookings(MOCK_BOOKINGS);
    setCoupons(MOCK_COUPONS);
    setDemoStep(1);
    window.location.reload();
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        shops,
        vehicles,
        bookings,
        coupons,
        activeRole,
        demoStep,
        weather,
        forecast,
        actionableInsights,
        toasts,
        switchUser,
        switchRole,
        loginUser,
        verifyOtp,
        signInWithGoogle,
        logout,
        uploadDocuments,
        claimKycBonus,
        addVehicle,
        updateVehicle,
        updateShopDynamicPricing,
        upgradeShopPlan,
        createBooking,
        cancelBooking,
        extendRide,
        returnRide,
        redeemCoupon,
        addToast,
        removeToast,
        setDemoStep,
        resetAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within an AppProvider");
  return context;
};
