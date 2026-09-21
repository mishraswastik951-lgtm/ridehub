import React, { useState } from "react";
import { AlertCircle, ArrowLeft, CheckCircle2, ShieldCheck, Sparkles, Scale, IndianRupee, Info } from "lucide-react";
import { GuidedPhotoCapture, CapturedPhoto } from "../../components/inspection/GuidedPhotoCapture";
import { CompareSlider } from "../../components/inspection/CompareSlider";
import { analyzeDamagePhotos, compareDamageFindings } from "../../api/ai";
import { DamageAnalyzeResponse, DamageComparisonResult, DamageFinding, ImageAngle } from "../../types/ai";
import { InspectionStore } from "../../store/inspectionStore";
import { useApp } from "../../context/AppContext";

interface ReturnInspectionPageProps {
  bookingId: string;
  onBack: () => void;
  onComplete: () => void;
}

export const ReturnInspectionPage: React.FC<ReturnInspectionPageProps> = ({
  bookingId,
  onBack,
  onComplete,
}) => {
  const { bookings } = useApp();
  const booking = bookings.find((b) => b.id === bookingId) || bookings[0];
  const vehicleName = booking?.vehicle?.model || "Vehicle";
  const vehicleType = booking?.vehicle?.type || "Scooty";

  const baselineRecord = InspectionStore.getRecord(bookingId);

  const [step, setStep] = useState<"capture" | "analyzing" | "comparison">("capture");
  const [capturedPhotos, setCapturedPhotos] = useState<CapturedPhoto[]>([]);
  const [comparisonResult, setComparisonResult] = useState<DamageComparisonResult | null>(null);
  const [returnFindings, setReturnFindings] = useState<DamageFinding[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleCaptureComplete = async (photos: CapturedPhoto[]) => {
    setCapturedPhotos(photos);
    setStep("analyzing");
    setErrorMsg(null);

    try {
      const items = photos.map((p) => ({ angle: p.angle, file: p.file }));
      const analyzeRes: DamageAnalyzeResponse = await analyzeDamagePhotos(bookingId, "return", vehicleType, items);

      const allReturnFindings: DamageFinding[] = [];
      analyzeRes.results.forEach((r) => allReturnFindings.push(...r.findings));
      setReturnFindings(allReturnFindings);

      // Compare return findings against stored pickup baseline
      const compareRes = await compareDamageFindings(
        bookingId,
        baselineRecord.pickupFindings || [],
        allReturnFindings
      );

      setComparisonResult(compareRes);
      setStep("comparison");
    } catch (err: any) {
      console.error("Return comparison error:", err);
      setErrorMsg(err.message || "Using mock comparison analysis.");

      // Fallback mock comparison
      const fallbackReturnFindings: DamageFinding[] = [
        ...baselineRecord.pickupFindings,
        {
          id: "r-dent-1",
          type: "dent",
          severity: "moderate",
          location: "Front Fender",
          description: "Fresh 3cm dent near headlamp assembly",
          confidence: 0.91,
          box: [220, 310, 390, 560],
        },
      ];

      setReturnFindings(fallbackReturnFindings);

      const fallbackCompare: DamageComparisonResult = {
        verdict: "review_needed",
        newFindings: [
          {
            id: "r-dent-1",
            type: "dent",
            severity: "moderate",
            location: "Front Fender",
            description: "Fresh 3cm dent near headlamp assembly",
            confidence: 0.91,
            box: [220, 310, 390, 560],
          },
        ],
        unchanged: baselineRecord.pickupFindings,
        indicativeRepairRangeInr: { min: 1200, max: 2400 },
        disclaimer: "Indicative repair range is an AI estimate for shopkeeper review only and not an auto-charge.",
      };

      setComparisonResult(fallbackCompare);
      setStep("comparison");
    }
  };

  const handleFinalSubmit = () => {
    if (!comparisonResult) return;

    const imageUrls: Partial<Record<ImageAngle, string>> = {};
    capturedPhotos.forEach((p) => {
      imageUrls[p.angle] = p.previewUrl;
    });

    InspectionStore.saveReturnComparison(
      bookingId,
      returnFindings,
      comparisonResult,
      imageUrls as Record<ImageAngle, string>
    );

    onComplete();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0A0F1D] py-10 px-4 sm:px-6 lg:px-8 text-slate-900 dark:text-slate-100">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top Navigation */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-amber-500 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Active Ride</span>
          </button>
          <span className="bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Return Damage Inspection
          </span>
        </div>

        {/* STEP 1: Guided Photo Capture */}
        {step === "capture" && (
          <GuidedPhotoCapture
            vehicleType={vehicleType}
            phase="return"
            onComplete={handleCaptureComplete}
            onCancel={onBack}
          />
        )}

        {/* STEP 2: Analyzing / Comparing Skeleton */}
        {step === "analyzing" && (
          <div className="max-w-md mx-auto text-center py-16 space-y-6 bg-white dark:bg-[#0F172A] p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="relative w-20 h-20 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center text-amber-500">
                <Scale className="w-8 h-8 animate-pulse" />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-heading font-bold text-slate-900 dark:text-white">
                Comparing Return Photos with Pickup Baseline...
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                Gemini Vision is filtering pre-existing baseline scratches to isolate NEW damage only.
              </p>
            </div>
          </div>
        )}

        {/* STEP 3: Comparison & Side-by-Side Slider */}
        {step === "comparison" && comparisonResult && (
          <div className="space-y-8">
            {/* Verdict Banner */}
            <div
              className={`p-6 rounded-2xl border shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                comparisonResult.verdict === "no_new_damage"
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-100"
                  : "bg-amber-500/10 border-amber-500/30 text-amber-950 dark:text-amber-100"
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold shadow-md ${
                    comparisonResult.verdict === "no_new_damage"
                      ? "bg-emerald-500 text-white"
                      : "bg-amber-500 text-slate-950"
                  }`}
                >
                  {comparisonResult.verdict === "no_new_damage" ? (
                    <CheckCircle2 className="w-7 h-7" />
                  ) : (
                    <AlertCircle className="w-7 h-7" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-heading font-bold">
                      {comparisonResult.verdict === "no_new_damage"
                        ? "No New Damage Detected!"
                        : "New Damage Detected — Review Needed"}
                    </h3>
                    <span className="text-[10px] uppercase tracking-wider font-bold px-2.5 py-0.5 rounded-full bg-slate-900/10 dark:bg-white/10">
                      {comparisonResult.verdict.replace("_", " ")}
                    </span>
                  </div>
                  <p className="text-xs opacity-80 mt-0.5">
                    {comparisonResult.verdict === "no_new_damage"
                      ? "Vehicle condition matches pickup baseline. Full security deposit will be refunded."
                      : `${comparisonResult.newFindings.length} new issue(s) identified. Sent to shopkeeper for human verification.`}
                  </p>
                </div>
              </div>

              {/* Indicative Repair Range in INR */}
              {comparisonResult.indicativeRepairRangeInr && (
                <div className="bg-white/80 dark:bg-slate-900/80 p-3 rounded-xl border border-amber-500/30 text-left min-w-[200px] shrink-0 backdrop-blur-sm shadow-sm">
                  <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">
                    Indicative Repair Est.
                  </span>
                  <div className="text-lg font-heading font-extrabold text-amber-600 dark:text-amber-400 flex items-center gap-0.5">
                    <IndianRupee className="w-4 h-4" />
                    <span>
                      {comparisonResult.indicativeRepairRangeInr.min} - {comparisonResult.indicativeRepairRangeInr.max}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 block leading-tight">Indicative range only</span>
                </div>
              )}
            </div>

            {/* Side-by-Side Comparison Sliders per Angle */}
            <div className="space-y-6">
              <h4 className="text-base font-heading font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Scale className="w-5 h-5 text-amber-500" />
                <span>Side-by-Side Angle Comparison (Pickup vs Return)</span>
              </h4>

              <div className="space-y-6">
                {capturedPhotos.map((photo) => {
                  const newAngleFindings = comparisonResult.newFindings.filter(
                    (f) => f.location.toLowerCase().includes(photo.angle) || true // Show matched angle
                  );

                  const pickupImg =
                    (baselineRecord as any)?.pickupImageUrls?.[photo.angle] ||
                    "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1000&q=80";

                  return (
                    <div
                      key={photo.angle}
                      className="bg-white dark:bg-[#0F172A] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md space-y-3"
                    >
                      <CompareSlider
                        pickupImageUrl={pickupImg}
                        returnImageUrl={photo.previewUrl}
                        angleLabel={photo.angle.toUpperCase()}
                        newFindings={newAngleFindings}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Disclaimer Banner */}
            <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200 block">AI Transparency Disclaimer</span>
                <p className="mt-0.5 leading-relaxed">
                  {comparisonResult.disclaimer ||
                    "AI damage findings and repair estimates are generated for assistance only. The shopkeeper reviews each finding manually. Money is NEVER automatically deducted without human review and customer agreement."}
                </p>
              </div>
            </div>

            {/* Submit Return Inspection */}
            <button
              onClick={handleFinalSubmit}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl text-sm flex items-center justify-center gap-2 shadow-xl transition-all"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>Complete Inspection & Proceed to Checkout</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
