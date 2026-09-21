import React, { useState } from "react";
import { AppProvider, useApp } from "./context/AppContext";
import { Navbar } from "./components/common/Navbar";
import { ToastContainer } from "./components/common/ToastContainer";
import { LandingPage } from "./pages/customer/LandingPage";
import { ExplorePage } from "./pages/customer/ExplorePage";
import { VehicleDetailPage } from "./pages/customer/VehicleDetailPage";
import { BookingFlowPage } from "./pages/customer/BookingFlowPage";
import { VerificationPage } from "./pages/customer/VerificationPage";
import { ActiveRidesPage } from "./pages/customer/ActiveRidesPage";
import { RewardsPage } from "./pages/customer/RewardsPage";
import { AuthPage } from "./pages/customer/AuthPage";
import { HubXLandingPage } from "./pages/shopkeeper/HubXLandingPage";
import { ShopkeeperDashboard } from "./pages/shopkeeper/ShopkeeperDashboard";
import { PickupInspectionPage } from "./pages/customer/PickupInspectionPage";
import { ReturnInspectionPage } from "./pages/customer/ReturnInspectionPage";
import { InspectionReviewPage } from "./pages/shopkeeper/InspectionReviewPage";
import { LiveTrackingPage } from "./pages/customer/LiveTrackingPage";
import { AgreementPage } from "./pages/customer/AgreementPage";
import { DynamicPricingCalendar } from "./pages/shopkeeper/DynamicPricingCalendar";
import { ShopTrustProfilePage } from "./pages/shopkeeper/ShopTrustProfilePage";
import { AiAssistantDrawer } from "./components/ai/AiAssistantDrawer";

const AppContent: React.FC = () => {
  const [currentRoute, setCurrentRoute] = useState<string>("/");
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("veh-1");
  const [selectedShopId, setSelectedShopId] = useState<string>("shop-1");
  const { activeRole } = useApp();

  const handleNavigate = (route: string) => {
    setCurrentRoute(route);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSelectVehicle = (vehicleId: string) => {
    setSelectedVehicleId(vehicleId);
    handleNavigate(`/vehicle/${vehicleId}`);
  };

  const handleSelectShop = (shopId: string) => {
    setSelectedShopId(shopId);
    handleNavigate("/explore");
  };

  const getBookingIdFromRoute = (route: string) => {
    const parts = route.split("/");
    if (route.includes("/inspect/")) return parts[2] || "BK-1001";
    if (route.includes("/inspections/")) return parts[3] || "BK-1001";
    if (route.includes("/tracking/")) return parts[2] || "BK-1001";
    if (route.includes("/agreement/")) return parts[2] || "BK-1001";
    if (route.includes("/trust-profile/")) return parts[2] || "shop-1";
    return "BK-1001";
  };

  return (
    <div className="min-h-screen flex flex-col bg-paper-grain text-[#16181F] relative">
      {/* Main Navbar */}
      <Navbar currentRoute={currentRoute} onNavigate={handleNavigate} />

      {/* Page Routing Switcher */}
      <main className="flex-1">
        {currentRoute === "/" && (
          <LandingPage
            onNavigate={handleNavigate}
            onSelectVehicle={handleSelectVehicle}
          />
        )}

        {currentRoute === "/explore" && (
          <ExplorePage
            onSelectVehicle={handleSelectVehicle}
            onSelectShop={handleSelectShop}
            onNavigate={handleNavigate}
          />
        )}

        {currentRoute.startsWith("/vehicle/") && (
          <VehicleDetailPage
            vehicleId={selectedVehicleId}
            onBack={() => handleNavigate("/explore")}
            onBook={(id) => handleNavigate(`/book/${id}`)}
            onSelectShop={handleSelectShop}
          />
        )}

        {currentRoute.startsWith("/book/") && (
          <BookingFlowPage
            vehicleId={selectedVehicleId}
            onBack={() => handleNavigate(`/vehicle/${selectedVehicleId}`)}
            onBookingComplete={(bookingId) => handleNavigate(`/tracking/${bookingId}`)}
            onGoToVerify={() => handleNavigate("/verify")}
          />
        )}

        {currentRoute === "/verify" && (
          <VerificationPage onNavigate={handleNavigate} />
        )}

        {/* Live Doorstep Delivery Tracking Route */}
        {currentRoute.startsWith("/tracking/") && (
          <LiveTrackingPage
            bookingId={getBookingIdFromRoute(currentRoute)}
            onBack={() => handleNavigate("/rides")}
          />
        )}

        {/* Official Printable Rental Agreement Route */}
        {currentRoute.startsWith("/agreement/") && (
          <AgreementPage
            bookingId={getBookingIdFromRoute(currentRoute)}
            onBack={() => handleNavigate("/rides")}
          />
        )}

        {/* Shopkeeper Trust & Community Audit Route */}
        {currentRoute.startsWith("/trust-profile/") && (
          <ShopTrustProfilePage
            shopId={getBookingIdFromRoute(currentRoute)}
            onBack={() => handleNavigate("/explore")}
          />
        )}

        {/* Shopkeeper Dynamic Pricing Calendar Route */}
        {currentRoute === "/dashboard/calendar" && (
          <DynamicPricingCalendar onBack={() => handleNavigate("/dashboard")} />
        )}

        {/* Pickup Inspection Route */}
        {currentRoute.includes("/inspect/pickup") && (
          <PickupInspectionPage
            bookingId={getBookingIdFromRoute(currentRoute)}
            onBack={() => handleNavigate("/rides")}
            onComplete={() => handleNavigate("/rides")}
          />
        )}

        {/* Return Inspection Route */}
        {currentRoute.includes("/inspect/return") && (
          <ReturnInspectionPage
            bookingId={getBookingIdFromRoute(currentRoute)}
            onBack={() => handleNavigate("/rides")}
            onComplete={() => handleNavigate(`/dashboard/inspections/${getBookingIdFromRoute(currentRoute)}`)}
          />
        )}

        {/* Shopkeeper Human-in-the-loop Inspection Review Route */}
        {currentRoute.includes("/inspections/") && !currentRoute.includes("/inspect/") && (
          <InspectionReviewPage
            bookingId={getBookingIdFromRoute(currentRoute)}
            onBack={() => handleNavigate("/dashboard")}
          />
        )}

        {currentRoute.startsWith("/rides") && !currentRoute.includes("/inspect/") && (
          <ActiveRidesPage
            currentRoute={currentRoute}
            onNavigate={handleNavigate}
            onSelectVehicle={handleSelectVehicle}
          />
        )}

        {currentRoute === "/rewards" && <RewardsPage />}

        {currentRoute === "/auth" && <AuthPage onNavigate={handleNavigate} />}

        {currentRoute === "/hubx" && (
          <HubXLandingPage onNavigate={handleNavigate} />
        )}

        {currentRoute.startsWith("/dashboard") && !currentRoute.includes("/inspections/") && currentRoute !== "/dashboard/calendar" && (
          <ShopkeeperDashboard
            currentRoute={currentRoute}
            onNavigate={handleNavigate}
          />
        )}
      </main>

      {/* Floating AI Chat Assistant Drawer */}
      <AiAssistantDrawer />

      {/* Global Toast Notifications */}
      <ToastContainer />

      {/* Footer - Solid Navy */}
      <footer className="bg-[#0F1F3D] text-white py-14 border-t border-[#0A1529] mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <img src="/logo-white.svg" alt="RideHub Logo" className="h-9 w-auto" />
              </div>
              <p className="text-xs text-[#B5C4E0] leading-relaxed">
                Every ride, one hub. Multi-shop self-drive network across Goa and hill towns with verified fleets, paperless digital KYC, and guaranteed deposit return.
              </p>
              <div className="pt-1">
                <span className="inline-block text-[11px] font-semibold text-[#2E9E6B] bg-[#132A24] border border-[#1E4D38] px-2.5 py-0.5 rounded-sm">
                  Ride more. Worry less.
                </span>
              </div>
            </div>

            <div className="text-xs space-y-2.5">
              <h5 className="font-heading font-bold text-white uppercase tracking-wider text-xs">Customer Directory</h5>
              <p className="text-[#B5C4E0] hover:text-white cursor-pointer transition-colors" onClick={() => handleNavigate("/explore")}>Browse All Vehicles</p>
              <p className="text-[#B5C4E0] hover:text-white cursor-pointer transition-colors" onClick={() => handleNavigate("/verify")}>DigiLocker Verification</p>
              <p className="text-[#B5C4E0] hover:text-white cursor-pointer transition-colors" onClick={() => handleNavigate("/rides")}>Active Ride Meter</p>
              <p className="text-[#B5C4E0] hover:text-white cursor-pointer transition-colors" onClick={() => handleNavigate("/agreement/BK-1001")}>Print Rental Contract</p>
              <p className="text-[#B5C4E0] hover:text-white cursor-pointer transition-colors" onClick={() => handleNavigate("/rewards")}>Partner Hotel Perks</p>
            </div>

            <div className="text-xs space-y-2.5">
              <h5 className="font-heading font-bold text-white uppercase tracking-wider text-xs">Fleet Partner Hub</h5>
              <p className="text-[#B5C4E0] hover:text-white cursor-pointer transition-colors" onClick={() => handleNavigate("/hubx")}>HubX 30-Day Evaluation</p>
              <p className="text-[#B5C4E0] hover:text-white cursor-pointer transition-colors" onClick={() => handleNavigate("/dashboard")}>Partner Control Desk</p>
              <p className="text-[#B5C4E0] hover:text-white cursor-pointer transition-colors" onClick={() => handleNavigate("/dashboard/calendar")}>AI Dynamic Pricing Calendar</p>
              <p className="text-[#B5C4E0] hover:text-white cursor-pointer transition-colors" onClick={() => handleNavigate("/trust-profile/shop-1")}>4-Pillar Trust Audit</p>
            </div>

            <div className="text-xs space-y-2.5">
              <h5 className="font-heading font-bold text-white uppercase tracking-wider text-xs">Studio Standards</h5>
              <p className="text-[#B5C4E0]">All pricing in Indian Rupee (<span className="tabular-nums">₹</span>)</p>
              <p className="text-[#B5C4E0]">Fleet inspected by certified local partners</p>
              <p className="text-[#B5C4E0]">Zero paper deposits or physical identity holding</p>
              <p className="text-[#B5C4E0]">UPI escrow protection with instantaneous release</p>
            </div>
          </div>

          <div className="pt-8 border-t border-[#1C2C4E] text-xs text-[#8292B4] flex flex-col sm:flex-row items-center justify-between gap-3">
            <span>© 2026 RideHub Technologies. Handcrafted for reliable Indian self-drive mobility.</span>
            <span className="font-medium text-[#B5C4E0]">Panaji • Calangute • Bengaluru • Indiranagar</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
