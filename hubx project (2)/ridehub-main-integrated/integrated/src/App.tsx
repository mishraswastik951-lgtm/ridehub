import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Preloader } from './components/Preloader';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ToastContainer } from './components/ToastContainer';
import { AuthModal } from './views/AuthModal';

// Views
import { LandingView } from './views/LandingView';
import { SearchView } from './views/SearchView';
import { VehicleDetailView } from './views/VehicleDetailView';
import { VerificationView } from './views/VerificationView';
import { BookingFlowView } from './views/BookingFlowView';
import { RentalAgreementView } from './views/RentalAgreementView';
import { ActiveRentalView } from './views/ActiveRentalView';
import { CancellationView } from './views/CancellationView';
import { RewardsWalletView } from './views/RewardsWalletView';
import { ShopkeeperListingsView } from './views/ShopkeeperListingsView';
import { ShopkeeperSubscriptionView } from './views/ShopkeeperSubscriptionView';
import { ShopkeeperAIDashboardView } from './views/ShopkeeperAIDashboardView';
import { DynamicPricingCalendarView } from './views/DynamicPricingCalendarView';
import { ShopTrustProfileView } from './views/ShopTrustProfileView';
import { HowItWorksView } from './views/HowItWorksView';
import { PrivacyPolicyView } from './views/PrivacyPolicyView';
import { TermsAndConditionsView } from './views/TermsAndConditionsView';
import { ContactSupportView } from './views/ContactSupportView';

const MainAppContent: React.FC = () => {
  const { currentView } = useApp();
  const [preloaderDone, setPreloaderDone] = useState(false);

  // Dynamic View Routing
  const renderCurrentView = () => {
    switch (currentView) {
      case 'landing':
        return <LandingView />;
      case 'search':
        return <SearchView />;
      case 'vehicle_detail':
        return <VehicleDetailView />;
      case 'verification':
        return <VerificationView />;
      case 'booking_flow':
        return <BookingFlowView />;
      case 'rental_agreement':
        return <RentalAgreementView />;
      case 'active_rental':
        return <ActiveRentalView />;
      case 'cancellation':
        return <CancellationView />;
      case 'rewards_wallet':
        return <RewardsWalletView />;
      case 'shop_listings':
        return <ShopkeeperListingsView />;
      case 'shop_subscription':
        return <ShopkeeperSubscriptionView />;
      case 'shop_ai_dashboard':
        return <ShopkeeperAIDashboardView />;
      case 'dynamic_pricing_calendar':
        return <DynamicPricingCalendarView />;
      case 'shop_trust_profile':
        return <ShopTrustProfileView />;
      case 'how_it_works':
        return <HowItWorksView />;
      case 'privacy_policy':
        return <PrivacyPolicyView />;
      case 'terms_conditions':
        return <TermsAndConditionsView />;
      case 'contact_support':
        return <ContactSupportView />;
      default:
        return <LandingView />;
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: 'var(--color-canvas)'
      }}
    >
      {/* 118-Frame Seamless Canvas Preloader */}
      {!preloaderDone && <Preloader onComplete={() => setPreloaderDone(true)} />}

      {/* Sticky Editorial Header with Role Switcher */}
      <Header />

      {/* Main View Area */}
      <main style={{ flex: 1 }}>{renderCurrentView()}</main>

      {/* Editorial Footer with Company Legal Links */}
      <Footer />

      {/* Stacking Toast Notification Manager */}
      <ToastContainer />

      {/* Phone OTP Auth Modal with 1-Phone Rule */}
      <AuthModal />
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}

export default App;
