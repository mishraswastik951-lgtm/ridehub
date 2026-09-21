import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { formatINR } from "../../utils/formatters";
import confetti from "canvas-confetti";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Truck, 
  ShieldCheck, 
  Coins, 
  CheckCircle2, 
  ArrowLeft, 
  QrCode, 
  ChevronRight,
  Info,
  KeyRound,
  Check
} from "lucide-react";
import { TransparentPreloader } from "../../components/common/TransparentPreloader";
import { generateUPILink, UPIGeneratedResult } from "../../api/hubxApi";

interface BookingFlowPageProps {
  vehicleId: string;
  onBack: () => void;
  onBookingComplete: (bookingId: string) => void;
  onGoToVerify: () => void;
}

interface DeliveryZone {
  id: string;
  name: string;
  distanceRange: string;
  surcharge: number;
  popularSpots: string;
}

const DELIVERY_ZONES: DeliveryZone[] = [
  { id: "local", name: "Local Hub Vicinity", distanceRange: "Within 3 km of garage", surcharge: 99, popularSpots: "Panaji Central, Miramar, City Hotels" },
  { id: "coastal", name: "Coastal Beach Belt", distanceRange: "3 - 10 km from garage", surcharge: 180, popularSpots: "Calangute, Candolim, Baga, Anjuna" },
  { id: "extended", name: "Extended North/South", distanceRange: "10 - 25 km from garage", surcharge: 290, popularSpots: "Arambol, Morjim, Mandrem, Margao" },
  { id: "airport", name: "Airport & Transit Gateway", distanceRange: "25+ km from garage", surcharge: 450, popularSpots: "Dabolim (GOI), Mopa (GOX) Terminal" },
];

export const BookingFlowPage: React.FC<BookingFlowPageProps> = ({
  vehicleId,
  onBack,
  onBookingComplete,
  onGoToVerify,
}) => {
  const { vehicles, shops, currentUser, createBooking } = useApp();
  const vehicle = vehicles.find((v) => v.id === vehicleId) || vehicles[0];
  const shop = shops.find((s) => s.id === vehicle.shopId) || shops[0];

  // Steps: 1: Config, 2: Delivery & Points, 3: Agreement, 4: Mock UPI, 5: Handover Confirmation
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Rental Config
  const [isHourly, setIsHourly] = useState<boolean>(true);
  const [durationHours, setDurationHours] = useState<number>(4);
  const [durationDays, setDurationDays] = useState<number>(1);
  const [deliveryOption, setDeliveryOption] = useState<"self" | "doorstep">("self");
  const [selectedZone, setSelectedZone] = useState<DeliveryZone>(DELIVERY_ZONES[0]);
  const [deliveryAddress, setDeliveryAddress] = useState<string>("Near Candolim Beach Road, North Goa");
  const [usePoints, setUsePoints] = useState<boolean>(false);
  const [agreementChecked, setAgreementChecked] = useState<boolean>(true);
  const [gpsConsentChecked, setGpsConsentChecked] = useState<boolean>(true);
  const [mockUpiId, setMockUpiId] = useState<string>(
    currentUser.phone ? `${currentUser.phone.replace(/[^0-9]/g, '')}@okhdfcbank` : "tourist@upi"
  );
  const [upiResult, setUpiResult] = useState<UPIGeneratedResult | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [confirmedBookingId, setConfirmedBookingId] = useState<string>("");

  // Price Computations (must be declared before the useEffect that reads totalPayable)
  const baseRental = isHourly ? vehicle.pricePerHour * durationHours : vehicle.pricePerDay * durationDays;
  const deliveryFee = deliveryOption === "doorstep" ? selectedZone.surcharge : 0;
  const bookingFee = 30;
  const deposit = vehicle.deposit;

  // Points Cap Rule (Max 20% discount on base rental)
  const maxAllowedDiscount = Math.floor(baseRental * 0.20);
  const pointsToRedeem = usePoints ? Math.min(currentUser.points, maxAllowedDiscount) : 0;
  const totalPayable = baseRental + deliveryFee + bookingFee + deposit - pointsToRedeem;

  // Generate NPCI UPI QR whenever arriving at step 4
  React.useEffect(() => {
    if (currentStep === 4) {
      generateUPILink({
        amount: totalPayable,
        bookingId: `RH-${Math.floor(1000 + Math.random() * 9000)}`,
        payeeVpa: "ridehub@icici",
        payeeName: "RideHub Rentals",
      }).then(setUpiResult).catch(() => {});
    }
  }, [currentStep, totalPayable]);

  const handlePayAndConfirm = () => {
    setIsProcessingPayment(true);
    setTimeout(() => {
      setIsProcessingPayment(false);
      
      const newBooking = createBooking({
        vehicleId: vehicle.id,
        shopId: shop.id,
        customerId: currentUser.id,
        customerName: currentUser.name,
        customerPhone: currentUser.phone,
        pickupAt: new Date().toISOString(),
        returnAt: new Date(Date.now() + (isHourly ? durationHours * 60 : durationDays * 24 * 60) * 60 * 1000).toISOString(),
        isHourly,
        hours: isHourly ? durationHours : 0,
        days: !isHourly ? durationDays : 0,
        delivery: deliveryOption === "doorstep",
        deliveryAddress: deliveryOption === "doorstep" ? `${selectedZone.name} - ${deliveryAddress}` : undefined,
        baseAmount: baseRental,
        deliveryFee,
        bookingFee,
        deposit,
        discountPointsUsed: pointsToRedeem,
        discountAmount: pointsToRedeem,
        total: totalPayable,
        paymentMethod: "UPI",
        agreementSigned: true,
      });

      setConfirmedBookingId(newBooking.id);
      setCurrentStep(5);

      confetti({
        particleCount: 90,
        spread: 60,
        origin: { y: 0.6 },
      });
    }, 1400);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#E4DDD1]">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#16181F] hover:bg-[#F3EEE6] bg-white px-3 py-1.5 rounded-[8px] border border-[#E4DDD1] transition-colors duration-200"
        >
          <ArrowLeft size={14} /> Back
        </button>
        <div className="text-right">
          <span className="text-[11px] text-[#5B6070] font-normal uppercase tracking-wider block">Reservation Target</span>
          <h3 className="font-heading font-bold text-sm text-[#16181F]">{vehicle.model} • {shop.name}</h3>
        </div>
      </div>

      {/* Stepper Wizard Bar */}
      {currentStep < 5 && (
        <div className="bg-white rounded-[12px] p-3 border border-[#E4DDD1] shadow-[0_1px_2px_rgba(15,31,61,0.06)] flex items-center justify-between overflow-x-auto">
          {[
            { num: 1, label: "1. Duration" },
            { num: 2, label: "2. Area Delivery" },
            { num: 3, label: "3. Agreement" },
            { num: 4, label: "4. UPI Payment" },
          ].map((s) => {
            const isCurrent = currentStep === s.num;
            const isDone = currentStep > s.num;
            return (
              <div
                key={s.num}
                onClick={() => isDone && setCurrentStep(s.num)}
                className={`flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-[6px] transition-colors duration-200 ${
                  isCurrent
                    ? "bg-[#0F1F3D] text-white"
                    : isDone
                    ? "text-[#1B7A4E] bg-[#EBF7F0] cursor-pointer"
                    : "text-[#5B6070]"
                }`}
              >
                <span>{isDone ? "✓" : s.num}</span>
                <span className="hidden sm:inline">{s.label.split(". ")[1]}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Digital KYC Warning */}
      {currentUser.docsStatus !== "Verified" && currentStep < 5 && (
        <div className="p-4 rounded-[8px] bg-[#FAF7F2] border border-[#E4DDD1] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-xs text-[#16181F]">
            <Info size={16} className="text-[#2456D6] shrink-0" />
            <div>
              <strong className="font-semibold text-[#16181F]">DigiLocker Verification Recommended:</strong>
              <p className="text-[#5B6070]">You can preview booking now. Original ID will be verified digitally before vehicle handover.</p>
            </div>
          </div>
          <button
            onClick={onGoToVerify}
            className="text-xs font-semibold bg-[#FAF7F2] hover:bg-[#F3EEE6] text-[#2456D6] border border-[#2456D6] px-3 py-1.5 rounded-[6px] shrink-0 cursor-pointer"
          >
            Verify Driving Licence (+150 pts)
          </button>
        </div>
      )}

      {/* Main Step Box */}
      <div className="bg-white rounded-[12px] p-6 sm:p-8 border border-[#E4DDD1] shadow-[0_1px_2px_rgba(15,31,61,0.06)] space-y-6">
        {/* Step 1: Duration Selector */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <span className="eyebrow-label block mb-1">STEP 01 / 04</span>
              <h2 className="font-heading font-bold text-xl text-[#16181F]">
                Select Rental Duration & Schedule
              </h2>
            </div>

            {/* Hourly vs Daily Toggle */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setIsHourly(true)}
                className={`p-4 rounded-[8px] border text-left transition-colors duration-200 cursor-pointer ${
                  isHourly
                    ? "border-[#0F1F3D] bg-[#FAF7F2]"
                    : "border-[#E4DDD1] hover:border-[#D6CDC0]"
                }`}
              >
                <Clock className={isHourly ? "text-[#0F1F3D]" : "text-[#5B6070]"} size={20} />
                <h4 className="font-heading font-bold text-sm text-[#16181F] mt-2">Hourly Slab</h4>
                <p className="text-xs text-[#5B6070] mt-0.5 tabular-nums">{formatINR(vehicle.pricePerHour)}/hr for quick beach trips</p>
              </button>

              <button
                onClick={() => setIsHourly(false)}
                className={`p-4 rounded-[8px] border text-left transition-colors duration-200 cursor-pointer ${
                  !isHourly
                    ? "border-[#0F1F3D] bg-[#FAF7F2]"
                    : "border-[#E4DDD1] hover:border-[#D6CDC0]"
                }`}
              >
                <Calendar className={!isHourly ? "text-[#0F1F3D]" : "text-[#5B6070]"} size={20} />
                <h4 className="font-heading font-bold text-sm text-[#16181F] mt-2">24-Hour Day Slab</h4>
                <p className="text-xs text-[#5B6070] mt-0.5 tabular-nums">{formatINR(vehicle.pricePerDay)}/day (Standard Daily)</p>
              </button>
            </div>

            {/* Slider or Day Selector */}
            {isHourly ? (
              <div className="space-y-3 p-4 bg-[#FAF7F2] rounded-[8px] border border-[#E4DDD1]">
                <div className="flex justify-between items-center text-sm font-semibold">
                  <span className="text-[#16181F]">Selected Hours:</span>
                  <span className="font-heading font-bold text-lg text-[#0F1F3D] tabular-nums">{durationHours} Hours</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="12"
                  step="1"
                  value={durationHours}
                  onChange={(e) => setDurationHours(parseInt(e.target.value))}
                  className="w-full accent-[#0F1F3D] cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-[#5B6070]">
                  <span>Minimum 2 hours</span>
                  <span>Maximum 12 hours (switch to daily above 12h)</span>
                </div>
              </div>
            ) : (
              <div className="space-y-3 p-4 bg-[#FAF7F2] rounded-[8px] border border-[#E4DDD1]">
                <div className="flex justify-between items-center text-sm font-semibold">
                  <span className="text-[#16181F]">Rental Days:</span>
                  <span className="font-heading font-bold text-lg text-[#0F1F3D] tabular-nums">{durationDays} Day(s)</span>
                </div>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 5, 7].map((days) => (
                    <button
                      key={days}
                      onClick={() => setDurationDays(days)}
                      className={`px-3.5 py-1.5 rounded-[6px] text-xs font-semibold transition-colors duration-150 cursor-pointer tabular-nums ${
                        durationDays === days ? "bg-[#0F1F3D] text-white" : "bg-white border border-[#E4DDD1] text-[#16181F]"
                      }`}
                    >
                      {days} {days === 1 ? "Day" : "Days"}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => setCurrentStep(2)}
              className="w-full py-3 bg-[#0F1F3D] hover:bg-[#0A1529] text-white font-heading font-semibold text-sm rounded-[8px] transition-colors duration-200 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Continue to Area Delivery & Surcharges</span>
              <ChevronRight size={15} />
            </button>
          </div>
        )}

        {/* Step 2: Area Delivery Surcharges & Points */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <span className="eyebrow-label block mb-1">STEP 02 / 04</span>
              <h2 className="font-heading font-bold text-xl text-[#16181F]">
                Pickup Method & Area Delivery Fee
              </h2>
            </div>

            {/* Self Pickup vs Doorstep Delivery Choice */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                onClick={() => setDeliveryOption("self")}
                className={`p-4 rounded-[8px] border transition-colors duration-200 cursor-pointer ${
                  deliveryOption === "self" ? "border-[#0F1F3D] bg-[#FAF7F2]" : "border-[#E4DDD1]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-heading font-bold text-sm text-[#16181F]">Self Garage Pickup</span>
                  <span className="text-[11px] font-bold text-[#1B7A4E] bg-[#EBF7F0] px-2 py-0.5 rounded-[4px]">FREE</span>
                </div>
                <p className="text-xs text-[#5B6070] mt-1.5">Pick up directly from {shop.name} ({shop.address})</p>
              </div>

              <div
                onClick={() => setDeliveryOption("doorstep")}
                className={`p-4 rounded-[8px] border transition-colors duration-200 cursor-pointer ${
                  deliveryOption === "doorstep" ? "border-[#0F1F3D] bg-[#FAF7F2]" : "border-[#E4DDD1]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-heading font-bold text-sm text-[#16181F]">Doorstep Area Delivery</span>
                  <span className="text-[11px] font-bold text-[#0F1F3D] bg-[#E8A317] px-2 py-0.5 rounded-[4px] tabular-nums">
                    From +₹99
                  </span>
                </div>
                <p className="text-xs text-[#5B6070] mt-1.5">Delivered directly to your resort, villa, or airport</p>
              </div>
            </div>

            {/* Dynamic Area Delivery Surcharge Selector */}
            {deliveryOption === "doorstep" && (
              <div className="p-4 bg-[#FAF7F2] rounded-[8px] border border-[#E4DDD1] space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#16181F] flex items-center gap-1.5 uppercase tracking-wider">
                    <Truck size={14} className="text-[#2456D6]" /> Select Destination Area & Distance Zone
                  </label>
                  <span className="text-[11px] text-[#5B6070]">Dynamic area surcharge applies</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {DELIVERY_ZONES.map((zone) => {
                    const isSelected = selectedZone.id === zone.id;
                    return (
                      <div
                        key={zone.id}
                        onClick={() => setSelectedZone(zone)}
                        className={`p-3 rounded-[6px] border transition-colors duration-150 cursor-pointer text-left ${
                          isSelected
                            ? "bg-white border-[#0F1F3D] shadow-xs"
                            : "bg-white/60 border-[#E4DDD1] hover:bg-white"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-heading font-bold text-xs text-[#16181F]">{zone.name}</span>
                          <span className="font-heading font-bold text-xs text-[#0F1F3D] tabular-nums">
                            +{formatINR(zone.surcharge)}
                          </span>
                        </div>
                        <p className="text-[10px] text-[#5B6070] mt-0.5">{zone.distanceRange}</p>
                        <p className="text-[10px] text-[#16181F] font-medium mt-1 truncate">
                          Spots: {zone.popularSpots}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="space-y-1 pt-1">
                  <label className="text-[11px] font-semibold text-[#5B6070]">Specific Resort Name or Street Address:</label>
                  <input
                    type="text"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="e.g. Heritage Village Resort, Arossim Beach"
                    className="w-full px-3 py-2 bg-white border border-[#E4DDD1] rounded-[4px] text-xs font-medium text-[#16181F] focus:outline-none focus:border-[#0F1F3D]"
                  />
                </div>
              </div>
            )}

            {/* RideHub Points Discount Slider */}
            <div className="p-4 bg-[#FAF7F2] rounded-[8px] border border-[#E4DDD1] space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Coins className="text-[#E8A317]" size={16} />
                  <span className="font-heading font-bold text-xs text-[#16181F]">RideHub Loyalty Points</span>
                </div>
                <span className="text-xs font-bold text-[#0F1F3D] bg-[#E8A317] px-2 py-0.5 rounded-[4px] tabular-nums">
                  Balance: {currentUser.points} Pts
                </span>
              </div>
              <p className="text-[11px] text-[#5B6070]">
                Redeem points for an instant deduction (maximum 20% of base rental = max {formatINR(maxAllowedDiscount)}).
              </p>
              <label className="flex items-center gap-2 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={usePoints}
                  onChange={(e) => setUsePoints(e.target.checked)}
                  className="accent-[#0F1F3D] w-4 h-4 rounded-[2px]"
                />
                <span className="text-xs font-medium text-[#16181F] tabular-nums">
                  Redeem {Math.min(currentUser.points, maxAllowedDiscount)} points to deduct {formatINR(Math.min(currentUser.points, maxAllowedDiscount))}
                </span>
              </label>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentStep(1)}
                className="px-4 py-2.5 bg-transparent hover:bg-[#F3EEE6] text-[#16181F] font-semibold text-xs rounded-[8px] border border-[#E4DDD1]"
              >
                Back
              </button>
              <button
                onClick={() => setCurrentStep(3)}
                className="flex-1 py-3 bg-[#0F1F3D] hover:bg-[#0A1529] text-white font-heading font-semibold text-sm rounded-[8px] transition-colors duration-200 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Continue to Rental Agreement</span>
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Digital Rental Agreement & Telemetry Consent */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <span className="eyebrow-label block mb-1">STEP 03 / 04</span>
              <h2 className="font-heading font-bold text-xl text-[#16181F]">
                Digital Self-Drive Rental Contract
              </h2>
            </div>

            <div className="p-4 bg-[#FAF7F2] rounded-[8px] border border-[#E4DDD1] text-xs space-y-2.5 font-mono text-[#5B6070] max-h-56 overflow-y-auto">
              <div className="flex justify-between border-b border-[#E4DDD1] pb-2 font-bold text-[#16181F]">
                <span>CONTRACT #RH-AGR-{Date.now().toString().slice(-6)}</span>
                <span className="text-[#1B7A4E]">DIGITALLY VERIFIED</span>
              </div>
              <p><strong>Operator Hub:</strong> {shop.name} ({shop.address})</p>
              <p><strong>Customer:</strong> {currentUser.name} | Phone: {currentUser.phone}</p>
              <p><strong>Vehicle Model:</strong> {vehicle.model} ({vehicle.year}) | Fuel: {vehicle.fuel}</p>
              <p><strong>Pre-trip Condition:</strong> {vehicle.condition} | Pre-existing notes: {vehicle.damageNotes}</p>
              <p><strong>Area Delivery:</strong> {deliveryOption === "doorstep" ? `${selectedZone.name} (${deliveryAddress})` : "Self Pickup at Garage"}</p>
              <p><strong>Security Deposit:</strong> {formatINR(deposit)} protected by RideHub escrow; released upon key handover.</p>
            </div>

            <div className="space-y-3">
              <label className="flex items-start gap-2.5 cursor-pointer bg-[#FAF7F2] p-3.5 rounded-[8px] border border-[#E4DDD1]">
                <input
                  type="checkbox"
                  checked={agreementChecked}
                  onChange={(e) => setAgreementChecked(e.target.checked)}
                  className="accent-[#0F1F3D] w-4 h-4 rounded-[2px] mt-0.5"
                />
                <span className="text-xs font-medium text-[#16181F]">
                  I acknowledge the RideHub Rental Terms, agree to follow local traffic regulations, and confirm I hold a valid Driving Licence.
                </span>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer bg-[#FAF7F2] p-3.5 rounded-[8px] border border-[#E4DDD1]">
                <input
                  type="checkbox"
                  checked={gpsConsentChecked}
                  onChange={(e) => setGpsConsentChecked(e.target.checked)}
                  className="accent-[#0F1F3D] w-4 h-4 rounded-[2px] mt-0.5"
                />
                <span className="text-xs font-medium text-[#16181F]">
                  I consent to live GPS telemetry during the rental period for doorstep delivery rider tracking, roadside assistance, and geofence safety monitoring.
                </span>
              </label>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentStep(2)}
                className="px-4 py-2.5 bg-transparent hover:bg-[#F3EEE6] text-[#16181F] font-semibold text-xs rounded-[8px] border border-[#E4DDD1]"
              >
                Back
              </button>
              <button
                disabled={!agreementChecked || !gpsConsentChecked}
                onClick={() => setCurrentStep(4)}
                className="flex-1 py-3 bg-[#0F1F3D] hover:bg-[#0A1529] disabled:opacity-50 text-white font-heading font-semibold text-sm rounded-[8px] transition-colors duration-200 flex items-center justify-center gap-2 cursor-pointer tabular-nums"
              >
                <span>Proceed to Payment ({formatINR(totalPayable)})</span>
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Transparent Mock UPI Checkout */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="text-center space-y-1">
              <span className="eyebrow-label block mb-1">STEP 04 / 04</span>
              <h2 className="font-heading font-bold text-xl text-[#16181F]">
                Authorized UPI Checkout
              </h2>
              <p className="text-xs text-[#5B6070]">
                Instant Indian UPI settlement with immediate booking confirmation
              </p>
            </div>

            {/* Price Breakdown Bill */}
            <div className="p-4 bg-[#FAF7F2] rounded-[8px] border border-[#E4DDD1] space-y-2 text-xs">
              <div className="flex justify-between text-[#5B6070]">
                <span>Base Vehicle Rental ({isHourly ? `${durationHours} hrs` : `${durationDays} day(s)`}):</span>
                <span className="text-[#16181F] tabular-nums font-medium">{formatINR(baseRental)}</span>
              </div>

              {deliveryOption === "doorstep" && (
                <div className="flex justify-between text-[#16181F] font-medium bg-white p-2 rounded-[4px] border border-[#E4DDD1]">
                  <span className="flex items-center gap-1 text-[#2456D6]">
                    <Truck size={13} /> Area Delivery Surcharge ({selectedZone.name}):
                  </span>
                  <span className="text-[#16181F] tabular-nums font-bold">+{formatINR(selectedZone.surcharge)}</span>
                </div>
              )}

              <div className="flex justify-between text-[#5B6070]">
                <span>Platform Operational Fee:</span>
                <span className="text-[#16181F] tabular-nums font-medium">+{formatINR(bookingFee)}</span>
              </div>

              <div className="flex justify-between text-[#5B6070]">
                <span>Refundable Security Deposit:</span>
                <span className="text-[#1B7A4E] tabular-nums font-semibold">{formatINR(deposit)} (100% Refundable)</span>
              </div>

              {pointsToRedeem > 0 && (
                <div className="flex justify-between text-[#0F1F3D] font-semibold bg-[#E8A317]/15 p-1.5 rounded-[4px]">
                  <span>Loyalty Points Discount ({pointsToRedeem} pts):</span>
                  <span className="tabular-nums">-{formatINR(pointsToRedeem)}</span>
                </div>
              )}

              <div className="flex justify-between text-base font-bold text-[#16181F] pt-2 border-t border-[#E4DDD1]">
                <span>Total Payable Now:</span>
                <span className="text-[#0F1F3D] tabular-nums font-extrabold">{formatINR(totalPayable)}</span>
              </div>
            </div>

            {/* Authentic NPCI UPI QR & Intent Deep Links */}
            <div className="p-5 bg-white rounded-[10px] border border-[#E4DDD1] space-y-4">
              <div className="flex flex-col sm:flex-row items-center gap-5 justify-between">
                <div className="space-y-1.5 text-center sm:text-left">
                  <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#1B7A4E] bg-[#EBF7F0] px-2 py-0.5 rounded-[4px]">
                    <ShieldCheck size={13} />
                    <span>NPCI UPI Intent Verified</span>
                  </div>
                  <h4 className="font-heading font-bold text-sm text-[#16181F]">
                    Scan QR Code to Pay via Any UPI App
                  </h4>
                  <p className="text-xs text-[#5B6070] max-w-xs">
                    Works natively on Google Pay, PhonePe, Paytm, BHIM, and Cred with zero processing surcharge.
                  </p>
                  <div className="pt-2 flex flex-wrap gap-2 justify-center sm:justify-start">
                    {upiResult && (
                      <>
                        <a
                          href={upiResult.gpayLink}
                          className="px-3 py-1.5 bg-[#FAF7F2] hover:bg-[#F3EEE6] text-[#0F1F3D] border border-[#E4DDD1] text-[11px] font-bold rounded-[6px] transition-colors"
                        >
                          Google Pay
                        </a>
                        <a
                          href={upiResult.phonepeLink}
                          className="px-3 py-1.5 bg-[#FAF7F2] hover:bg-[#F3EEE6] text-[#0F1F3D] border border-[#E4DDD1] text-[11px] font-bold rounded-[6px] transition-colors"
                        >
                          PhonePe
                        </a>
                        <a
                          href={upiResult.paytmLink}
                          className="px-3 py-1.5 bg-[#FAF7F2] hover:bg-[#F3EEE6] text-[#0F1F3D] border border-[#E4DDD1] text-[11px] font-bold rounded-[6px] transition-colors"
                        >
                          Paytm
                        </a>
                      </>
                    )}
                  </div>
                </div>

                {/* QR Code Container */}
                <div className="p-2.5 bg-[#FAF7F2] rounded-[8px] border border-[#E4DDD1] shrink-0 text-center">
                  {upiResult?.qrDataUrl ? (
                    <img
                      src={upiResult.qrDataUrl}
                      alt="UPI Payment QR Code"
                      className="w-36 h-36 mx-auto rounded-[4px]"
                    />
                  ) : (
                    <div className="w-36 h-36 flex items-center justify-center text-xs text-[#5B6070]">
                      Generating QR...
                    </div>
                  )}
                  <span className="text-[10px] font-mono text-[#5B6070] block mt-1">
                    UPI ID: ridehub@icici
                  </span>
                </div>
              </div>

              {/* VPA Input */}
              <div className="pt-3 border-t border-[#E4DDD1] space-y-1.5">
                <label className="text-xs font-bold text-[#16181F] flex items-center gap-1.5">
                  <QrCode size={14} className="text-[#0F1F3D]" />
                  <span>Or enter your UPI ID (VPA) for payment request:</span>
                </label>
                <input
                  type="text"
                  value={mockUpiId}
                  onChange={(e) => setMockUpiId(e.target.value)}
                  placeholder="e.g. 9876543210@okhdfcbank"
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E4DDD1] rounded-[4px] text-xs font-mono font-medium text-[#16181F] focus:outline-none focus:border-[#0F1F3D]"
                />
              </div>
            </div>

            {isProcessingPayment ? (
              <div className="py-8">
                <TransparentPreloader 
                  size="md" 
                  label="Authorizing UPI & Securing Vehicle..." 
                  subtext="Locking vehicle calendar with shop partner..." 
                />
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCurrentStep(3)}
                  className="px-4 py-3 bg-transparent hover:bg-[#F3EEE6] text-[#16181F] font-semibold text-xs rounded-[8px] border border-[#E4DDD1]"
                >
                  Back
                </button>
                {/* Single Key Amber CTA on this screen */}
                <button
                  onClick={handlePayAndConfirm}
                  className="flex-1 py-3.5 bg-[#E8A317] hover:bg-[#D99614] text-[#0F1F3D] font-heading font-bold text-base rounded-[8px] transition-colors duration-200 flex items-center justify-center gap-2 cursor-pointer tabular-nums"
                >
                  <CheckCircle2 size={18} />
                  <span>Pay {formatINR(totalPayable)} & Confirm Booking</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step 5: Crafted Key-Handover Confirmation Animation */}
        {currentStep === 5 && (
          <div className="space-y-6 text-center py-4">
            {/* Key Handover Visual */}
            <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
              <div className="w-24 h-24 rounded-full bg-[#EBF7F0] border-2 border-[#1B7A4E] flex items-center justify-center animate-pulse">
                <KeyRound size={42} className="text-[#1B7A4E] -rotate-45" />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-[#0F1F3D] text-white p-2 rounded-full shadow-md">
                <Check size={16} />
              </div>
            </div>

            <div>
              <div className="verified-seal mb-2">
                <CheckCircle2 size={13} /> RESERVATION CONFIRMED #RH-{confirmedBookingId.slice(-6).toUpperCase()}
              </div>
              <h2 className="font-heading font-bold text-2xl sm:text-3xl text-[#16181F]">
                Key Handover Authorized!
              </h2>
              <p className="text-sm text-[#5B6070] max-w-md mx-auto mt-2">
                {deliveryOption === "doorstep" 
                  ? `Your vehicle will be delivered to ${selectedZone.name} (${deliveryAddress}).`
                  : `Your vehicle is ready for pickup at ${shop.name}.`}
              </p>
            </div>

            {/* Handover Details Pass */}
            <div className="max-w-md mx-auto bg-[#FAF7F2] p-4 rounded-[8px] border border-[#E4DDD1] text-xs text-left space-y-2">
              <div className="flex justify-between">
                <span className="text-[#5B6070]">Vehicle:</span>
                <strong className="text-[#16181F]">{vehicle.model}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5B6070]">Garage Partner:</span>
                <strong className="text-[#16181F]">{shop.name}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5B6070]">Total Paid (UPI):</span>
                <strong className="text-[#1B7A4E] tabular-nums">{formatINR(totalPayable)}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5B6070]">Security Deposit:</span>
                <strong className="text-[#16181F] tabular-nums">{formatINR(deposit)} (100% Refundable)</strong>
              </div>
            </div>

            {/* Key Action */}
            <button
              onClick={() => onBookingComplete(confirmedBookingId)}
              className="w-full max-w-md mx-auto py-3.5 bg-[#0F1F3D] hover:bg-[#0A1529] text-white font-heading font-bold text-sm rounded-[8px] transition-colors duration-200 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>View Active Ride Meter & Live Extension</span>
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
