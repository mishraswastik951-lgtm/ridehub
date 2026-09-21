import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { Role } from "../../types";
import confetti from "canvas-confetti";
import { 
  User as UserIcon, 
  Store, 
  Mail, 
  Phone, 
  Lock, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight
} from "lucide-react";
import { sendOtp, verifyOtp as verifyBackendOtp } from "../../api/hubxApi";

interface AuthPageProps {
  onNavigate: (route: string) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onNavigate }) => {
  const { loginUser, verifyOtp, currentUser, switchUser, users, signInWithGoogle } = useApp();
  const [selectedRole, setSelectedRole] = useState<Role>("customer");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState("1234");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email || !phone) {
      setErrorMessage("Both Email and Phone Number are strictly required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = loginUser(email, phone, selectedRole, name);
      if (!res.success) {
        setErrorMessage(res.message || "Failed to proceed with this phone number.");
        setIsSubmitting(false);
        return;
      }

      // Also trigger backend OTP service
      await sendOtp({ channel: "phone", phone, email });
      setIsOtpStep(true);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to dispatch OTP code.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyAndLogin = async () => {
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const backendCheck = await verifyBackendOtp({ channel: "phone", phone, email, otp: otpCode });
      if (!backendCheck.verified && !verifyOtp(otpCode)) {
        setErrorMessage("Invalid OTP. Enter 1234 or your 6-digit sandbox code.");
        setIsSubmitting(false);
        return;
      }

      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      setTimeout(() => {
        onNavigate(selectedRole === "customer" ? "/explore" : "/dashboard");
      }, 800);
    } catch (err: any) {
      setErrorMessage(err.message || "Verification failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleAuth = async () => {
    setErrorMessage("");
    const res = await signInWithGoogle();
    if (!res.success) {
      setErrorMessage(res.error || "Google sign-in could not be completed.");
      return;
    }
    confetti({ particleCount: 60, spread: 50 });
    setTimeout(() => {
      onNavigate("/explore");
    }, 600);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-11 h-11 rounded-[8px] bg-[#0F1F3D] text-white flex items-center justify-center mx-auto shadow-xs">
          <Lock size={20} />
        </div>
        <span className="eyebrow-label block">ACCOUNT AUTHENTICATION</span>
        <h1 className="font-heading font-bold text-2xl text-[#16181F]">
          {isOtpStep ? "Enter OTP Code" : "Sign In to RideHub"}
        </h1>
        <p className="text-xs text-[#5B6070]">
          {isOtpStep ? `Sandbox OTP sent to ${phone}` : "One Phone Number = One Identity Audit Standard"}
        </p>
      </div>

      {/* Role Picker */}
      {!isOtpStep && (
        <div className="grid grid-cols-2 gap-2 bg-[#FAF7F2] p-1 rounded-[8px] border border-[#E4DDD1]">
          <button
            type="button"
            onClick={() => setSelectedRole("customer")}
            className={`py-2 rounded-[6px] text-xs font-semibold transition-colors duration-150 flex items-center justify-center gap-1.5 cursor-pointer ${
              selectedRole === "customer"
                ? "bg-[#0F1F3D] text-white"
                : "text-[#5B6070] hover:text-[#16181F]"
            }`}
          >
            <UserIcon size={14} />
            <span>Customer</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedRole("shopkeeper")}
            className={`py-2 rounded-[6px] text-xs font-semibold transition-colors duration-150 flex items-center justify-center gap-1.5 cursor-pointer ${
              selectedRole === "shopkeeper"
                ? "bg-[#0F1F3D] text-white"
                : "text-[#5B6070] hover:text-[#16181F]"
            }`}
          >
            <Store size={14} />
            <span>HubX Operator</span>
          </button>
        </div>
      )}

      {/* Main Auth Card */}
      <div className="bg-white rounded-[12px] p-6 border border-[#E4DDD1] shadow-[0_1px_2px_rgba(15,31,61,0.06)] space-y-4">
        {errorMessage && (
          <div className="p-3 bg-red-50 border border-[#C8432F] rounded-[6px] text-xs text-[#C8432F] flex items-center gap-2">
            <AlertCircle size={15} />
            <span>{errorMessage}</span>
          </div>
        )}

        {!isOtpStep ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            {/* Google OAuth Option */}
            <button
              type="button"
              onClick={handleGoogleAuth}
              className="w-full py-2.5 bg-white hover:bg-[#FAF7F2] text-[#16181F] font-semibold text-xs rounded-[8px] border border-[#E4DDD1] flex items-center justify-center gap-2.5 transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="flex items-center gap-3 my-2">
              <div className="flex-1 h-px bg-[#E4DDD1]" />
              <span className="text-[11px] text-[#5B6070] uppercase font-bold">Or with SMS OTP</span>
              <div className="flex-1 h-px bg-[#E4DDD1]" />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#16181F]">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E4DDD1] rounded-[4px] text-xs font-medium text-[#16181F] focus:outline-none focus:border-[#0F1F3D]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#16181F]">
                Email Address <span className="text-[#C8432F]">*</span>
              </label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5B6070]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full pl-8 pr-3 py-2 bg-[#FAF7F2] border border-[#E4DDD1] rounded-[4px] text-xs font-medium text-[#16181F] focus:outline-none focus:border-[#0F1F3D]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#16181F]">
                Indian Phone Number <span className="text-[#C8432F]">*</span>
              </label>
              <div className="relative">
                <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5B6070]" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full pl-8 pr-3 py-2 bg-[#FAF7F2] border border-[#E4DDD1] rounded-[4px] text-xs font-medium text-[#16181F] focus:outline-none focus:border-[#0F1F3D] tabular-nums"
                />
              </div>
            </div>

            {/* Amber Single Key CTA Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-[#E8A317] hover:bg-[#D99614] text-[#0F1F3D] font-heading font-bold text-sm rounded-[8px] transition-colors duration-200 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? "Sending OTP..." : "Send Verification OTP Code"}
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="p-3 bg-[#FAF7F2] border border-[#E4DDD1] rounded-[6px] text-xs text-[#5B6070]">
              Enter the OTP code sent to your phone (Use sandbox code <strong className="text-[#16181F]">1234</strong>)
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#16181F]">OTP Code</label>
              <input
                type="text"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                className="w-full px-3 py-2.5 bg-[#FAF7F2] border border-[#E4DDD1] rounded-[4px] text-base font-mono font-bold text-center tracking-widest text-[#16181F] focus:outline-none focus:border-[#0F1F3D] tabular-nums"
              />
            </div>

            <button
              onClick={handleVerifyAndLogin}
              disabled={isSubmitting}
              className="w-full py-3 bg-[#0F1F3D] hover:bg-[#0A1529] text-white font-heading font-bold text-sm rounded-[8px] transition-colors duration-200 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <CheckCircle2 size={16} />
              <span>{isSubmitting ? "Verifying..." : "Verify OTP & Sign In"}</span>
            </button>

            <button
              onClick={() => setIsOtpStep(false)}
              className="w-full text-xs text-[#5B6070] hover:text-[#16181F] font-medium text-center cursor-pointer"
            >
              ← Edit Phone Number
            </button>
          </div>
        )}
      </div>

      {/* Switch Mock User Quick Selector */}
      <div className="bg-[#FAF7F2] p-4 rounded-[8px] border border-[#E4DDD1] space-y-2 text-xs">
        <span className="font-semibold text-[#16181F] block">Quick Sandbox Persona Switcher:</span>
        <div className="grid grid-cols-2 gap-2">
          {users.map((u) => (
            <button
              key={u.id}
              onClick={() => {
                switchUser(u.id);
                onNavigate(u.role === "customer" ? "/explore" : "/dashboard");
              }}
              className={`p-2 rounded-[6px] text-left border transition-colors cursor-pointer ${
                currentUser.id === u.id
                  ? "bg-[#0F1F3D] text-white border-[#0F1F3D]"
                  : "bg-white text-[#16181F] border-[#E4DDD1] hover:bg-[#F3EEE6]"
              }`}
            >
              <p className="font-semibold text-xs leading-tight">{u.name}</p>
              <p className="text-[10px] opacity-75 capitalize">{u.role}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
