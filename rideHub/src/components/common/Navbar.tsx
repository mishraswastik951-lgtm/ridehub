import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { 
  Bike, 
  MapPin, 
  Shield, 
  Gift, 
  Store, 
  Menu, 
  X, 
  Sparkles,
  FileCheck2,
  Clock,
  ArrowRightLeft,
  CheckCircle2
} from "lucide-react";

interface NavbarProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentRoute, onNavigate }) => {
  const { currentUser, activeRole, switchRole, bookings } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const activeRidesCount = bookings.filter(b => b.status === "active").length;

  const navLinks = activeRole === "customer" ? [
    { label: "Explore & Map", route: "/explore", icon: MapPin },
    { label: "Verify KYC", route: "/verify", icon: FileCheck2, badge: currentUser.docsStatus === "Verified" ? "Verified" : "+150 pts" },
    { label: "My Rides", route: "/rides", icon: Clock, badge: activeRidesCount > 0 ? `${activeRidesCount} Active` : undefined },
    { label: "Rewards & Hotels", route: "/rewards", icon: Gift, badge: `${currentUser.points} pts` },
  ] : [
    { label: "Overview", route: "/dashboard", icon: Store },
    { label: "Fleet Inventory", route: "/dashboard/fleet", icon: Bike },
    { label: "Live Bookings", route: "/dashboard/bookings", icon: Clock },
    { label: "AI Dynamic Pricing", route: "/dashboard/pricing", icon: Sparkles, badge: "AI" },
    { label: "Gemini AI Lab", route: "/dashboard/ai-lab", icon: Sparkles, badge: "NEW" },
    { label: "HubX Plans & Trial", route: "/hubx", icon: Shield, badge: "30D Free" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#E4DDD1]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo & Crafted Brand Seal */}
          <div className="flex items-center gap-4">
            <div 
              onClick={() => onNavigate(activeRole === "customer" ? "/" : "/dashboard")}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <img
                src="/logo.svg"
                alt="RideHub Logo"
                className="h-9 w-auto object-contain"
              />
              {activeRole === "shopkeeper" ? (
                <span className="bg-[#E8A317] text-[#0F1F3D] text-[10px] font-black px-2 py-0.5 rounded-[4px] tracking-wider uppercase">
                  HUBX PARTNER
                </span>
              ) : (
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-[#5B6070] bg-[#F3EEE6] border border-[#E4DDD1] px-2 py-0.5 rounded-[4px]">
                  <CheckCircle2 size={12} className="text-[#2E9E6B]" /> Verified Fleet
                </span>
              )}
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = link.route === "/dashboard"
                ? currentRoute === "/dashboard"
                : currentRoute.startsWith(link.route);
              return (
                <button
                  key={link.label}
                  onClick={() => onNavigate(link.route)}
                  className={`px-3.5 py-2 rounded-[8px] text-sm font-medium transition-all duration-200 ease-out flex items-center gap-2 cursor-pointer ${
                    isActive
                      ? "bg-[#0F1F3D] text-white font-semibold"
                      : "text-[#5B6070] hover:text-[#16181F] hover:bg-[#F3EEE6]"
                  }`}
                >
                  <Icon size={15} />
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-[4px] ${
                      isActive 
                        ? "bg-[#E8A317] text-[#0F1F3D]" 
                        : link.badge.includes("Active")
                        ? "bg-[#E8A317] text-[#0F1F3D]"
                        : "bg-[#F3EEE6] text-[#16181F] border border-[#E4DDD1]"
                    }`}>
                      {link.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Buttons: Role Switcher & Profile */}
          <div className="hidden md:flex items-center gap-3">
            {/* Boutique Role Switcher */}
            <button
              onClick={() => {
                const nextRole = activeRole === "customer" ? "shopkeeper" : "customer";
                switchRole(nextRole);
                onNavigate(nextRole === "shopkeeper" ? "/dashboard" : "/");
              }}
              className="bg-transparent hover:bg-[#F3EEE6] text-[#16181F] border border-[#E4DDD1] text-xs font-semibold px-3 py-2 rounded-[8px] transition-colors duration-200 ease-out flex items-center gap-2 cursor-pointer"
            >
              <ArrowRightLeft size={13} className="text-[#2456D6]" />
              <span>Switch to <strong className="capitalize">{activeRole === "customer" ? "Shopkeeper" : "Customer"}</strong></span>
            </button>

            {/* Profile Pill */}
            <div 
              onClick={() => onNavigate("/auth")}
              className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 bg-[#FAF7F2] hover:bg-[#F3EEE6] border border-[#E4DDD1] rounded-[8px] cursor-pointer transition-colors duration-200 ease-out"
            >
              <img
                src={currentUser.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"}
                alt={currentUser.name}
                className="w-7 h-7 rounded-[4px] object-cover border border-[#E4DDD1]"
              />
              <div className="text-left">
                <p className="text-xs font-semibold text-[#16181F] leading-tight max-w-[90px] truncate">
                  {currentUser.name}
                </p>
                <p className="text-[10px] text-[#5B6070] leading-none tabular-nums">
                  {currentUser.phone}
                </p>
              </div>
            </div>
          </div>

          {/* Mobile Menu Trigger */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-[8px] border border-[#E4DDD1] text-[#16181F] hover:bg-[#F3EEE6] cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E4DDD1] bg-white px-4 pt-3 pb-6 space-y-2">
          <div className="pb-3 border-b border-[#E4DDD1] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <img
                src={currentUser.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"}
                alt={currentUser.name}
                className="w-8 h-8 rounded-[4px] object-cover border border-[#E4DDD1]"
              />
              <div>
                <p className="text-sm font-semibold text-[#16181F]">{currentUser.name}</p>
                <p className="text-xs text-[#5B6070] tabular-nums">{currentUser.phone}</p>
              </div>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 bg-[#FAF7F2] border border-[#E4DDD1] text-[#0F1F3D] rounded-[4px] uppercase">
              {activeRole}
            </span>
          </div>

          <div className="space-y-1 pt-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = currentRoute === link.route;
              return (
                <button
                  key={link.label}
                  onClick={() => {
                    onNavigate(link.route);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-[8px] text-sm font-medium ${
                    isActive 
                      ? "bg-[#0F1F3D] text-white" 
                      : "text-[#16181F] hover:bg-[#F3EEE6]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon size={17} />
                    <span>{link.label}</span>
                  </div>
                  {link.badge && (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-[4px] bg-[#E8A317] text-[#0F1F3D]">
                      {link.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-[#E4DDD1]">
            <button
              onClick={() => {
                const nextRole = activeRole === "customer" ? "shopkeeper" : "customer";
                switchRole(nextRole);
                onNavigate(nextRole === "shopkeeper" ? "/dashboard" : "/");
                setMobileMenuOpen(false);
              }}
              className="w-full py-2.5 text-center text-xs font-bold bg-[#FAF7F2] hover:bg-[#F3EEE6] text-[#0F1F3D] border border-[#E4DDD1] rounded-[8px]"
            >
              Switch Role to {activeRole === "customer" ? "Shopkeeper HubX" : "Customer Portal"}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
