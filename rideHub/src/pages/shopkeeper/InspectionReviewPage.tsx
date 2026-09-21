import React, { useState } from "react";
import { ShieldCheck, AlertCircle, ArrowLeft, CheckCircle2, IndianRupee, MessageSquare, Send, ThumbsUp, XCircle, Edit3 } from "lucide-react";
import { InspectionStore } from "../../store/inspectionStore";
import { InspectionRecord, DamageFinding } from "../../types/ai";
import { useApp } from "../../context/AppContext";

interface InspectionReviewPageProps {
  bookingId: string;
  onBack: () => void;
}

export const InspectionReviewPage: React.FC<InspectionReviewPageProps> = ({
  bookingId,
  onBack,
}) => {
  const { activeRole, bookings } = useApp();
  const booking = bookings.find((b) => b.id === bookingId) || bookings[0];

  const [record, setRecord] = useState<InspectionRecord>(() => InspectionStore.getRecord(bookingId));
  const [deductionAmount, setDeductionAmount] = useState<number>(
    record.shopkeeperDeductionProposal || record.indicativeRepairRangeInr?.min || 500
  );
  const [notes, setNotes] = useState<string>(record.shopkeeperNotes || "");
  const [disputeText, setDisputeText] = useState<string>(record.customerDisputeComment || "");
  const [actionDone, setActionDone] = useState(false);

  const isShopkeeper = activeRole === "shopkeeper";
  const newFindings = record.newFindings || record.returnFindings || [];

  const handleShopkeeperSubmit = () => {
    const updated = InspectionStore.updateShopkeeperReview(
      bookingId,
      deductionAmount,
      notes,
      newFindings.map((f) => f.id)
    );
    setRecord(updated);
    setActionDone(true);
  };

  const handleCustomerResponse = (accept: boolean) => {
    const updated = InspectionStore.updateCustomerResponse(bookingId, accept, disputeText);
    setRecord(updated);
    setActionDone(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0A0F1D] py-10 px-4 sm:px-6 lg:px-8 text-slate-900 dark:text-slate-100">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-amber-500 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>
          <span className="text-xs bg-amber-500/10 border border-amber-500/30 text-amber-500 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
            Status: {record.status.replace("_", " ")}
          </span>
        </div>

        {/* Inspection Overview Header Card */}
        <div className="bg-[#0F1F3D] text-white p-6 rounded-2xl border border-amber-500/30 shadow-xl space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-heading font-bold">Inspection Review — {bookingId}</h2>
                <p className="text-xs text-amber-200/80">Vehicle: {booking.vehicle?.model || "Vehicle"} • Security Deposit: ₹{booking.deposit || 2000}</p>
              </div>
            </div>

            {record.indicativeRepairRangeInr && (
              <div className="bg-slate-900/80 p-3 rounded-xl border border-amber-500/30 text-right">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">AI Suggested Est.</span>
                <span className="text-base font-bold text-amber-400">
                  ₹{record.indicativeRepairRangeInr.min} - ₹{record.indicativeRepairRangeInr.max}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Status Pipeline Visualizer */}
        <div className="bg-white dark:bg-[#0F172A] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-3">
            Inspection Workflow Lifecycle
          </span>
          <div className="flex items-center justify-between text-xs overflow-x-auto pb-2 gap-2">
            {[
              { key: "pickup_photos", label: "Pickup Baseline" },
              { key: "ride", label: "Active Ride" },
              { key: "return_photos", label: "Return Photos" },
              { key: "ai_comparison", label: "AI Compare" },
              { key: "shopkeeper_review", label: "Human Review" },
              { key: "customer_response", label: "Customer Response" },
              { key: "resolved", label: "Resolved" },
            ].map((st, idx) => {
              const isCurrent = record.status === st.key;
              return (
                <div key={st.key} className="flex items-center gap-2 shrink-0">
                  <div
                    className={`px-3 py-1 rounded-full font-bold text-[11px] ${
                      isCurrent
                        ? "bg-amber-500 text-slate-950 ring-2 ring-amber-400/50"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                    }`}
                  >
                    {idx + 1}. {st.label}
                  </div>
                  {idx < 6 && <span className="text-slate-400 text-xs">→</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Findings List */}
        <div className="space-y-4">
          <h3 className="text-base font-heading font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            <span>Detected New Damage Findings ({newFindings.length})</span>
          </h3>

          {newFindings.length === 0 ? (
            <div className="bg-emerald-500/10 border border-emerald-500/30 p-6 rounded-2xl text-center text-emerald-900 dark:text-emerald-100 text-xs font-medium">
              No new damage was found between pickup and return. Vehicle is in good condition!
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {newFindings.map((finding) => (
                <div
                  key={finding.id}
                  className="bg-white dark:bg-[#0F172A] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white capitalize text-sm">
                        {finding.type.replace("_", " ")}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/10 text-amber-500 border border-amber-500/20">
                        {finding.severity}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">{finding.description}</p>
                    <span className="text-[11px] text-slate-500 block">
                      Location: {finding.location} • AI Confidence: {Math.round(finding.confidence * 100)}%
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-emerald-500 font-bold bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20">
                      Verified by Shopkeeper
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Form: Shopkeeper Review (Human in the loop) */}
        {isShopkeeper && (record.status === "shopkeeper_review" || record.status === "ai_comparison") && (
          <div className="bg-white dark:bg-[#0F172A] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-5">
            <h3 className="text-base font-heading font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-amber-500" />
              <span>Shopkeeper Review & Deduction Proposal</span>
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Proposed Deposit Deduction (₹)
                </label>
                <div className="relative max-w-xs">
                  <IndianRupee className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="number"
                    value={deductionAmount}
                    onChange={(e) => setDeductionAmount(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    placeholder="Enter amount in ₹"
                  />
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  AI proposal suggestion: ₹{record.indicativeRepairRangeInr?.min || 500} - ₹{record.indicativeRepairRangeInr?.max || 1500}. AI never deducts money automatically.
                </span>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Shopkeeper Inspection Notes
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  placeholder="Explain damage reason, spare part replacement needed, or zero deduction note..."
                />
              </div>

              <button
                onClick={handleShopkeeperSubmit}
                className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                <Send className="w-4 h-4" />
                <span>Submit Proposal to Customer</span>
              </button>
            </div>
          </div>
        )}

        {/* Action Form: Customer Response / Dispute */}
        {record.status === "customer_response" && (
          <div className="bg-white dark:bg-[#0F172A] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-5">
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-950 dark:text-amber-100 flex items-center justify-between">
              <div>
                <span className="font-bold block text-sm">Shopkeeper Proposed Deduction</span>
                <span>Note: {record.shopkeeperNotes || "Standard damage repair charge"}</span>
              </div>
              <span className="text-xl font-heading font-extrabold text-amber-600 dark:text-amber-400">
                ₹{record.shopkeeperDeductionProposal || 0}
              </span>
            </div>

            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Customer Response
              </span>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => handleCustomerResponse(true)}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-all"
                >
                  <ThumbsUp className="w-4 h-4" />
                  <span>Accept Proposal (Pay ₹{record.shopkeeperDeductionProposal})</span>
                </button>

                <button
                  onClick={() => handleCustomerResponse(false)}
                  className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold py-3 rounded-xl text-xs border border-red-500/30 flex items-center justify-center gap-2 transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Dispute Proposal</span>
                </button>
              </div>

              <textarea
                rows={2}
                value={disputeText}
                onChange={(e) => setDisputeText(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                placeholder="If disputing, explain your reason here (e.g. pre-existing baseline match)..."
              />
            </div>
          </div>
        )}

        {/* Resolved Banner */}
        {record.status === "resolved" && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 p-6 rounded-2xl text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <h4 className="text-lg font-heading font-bold text-emerald-950 dark:text-emerald-100">
              Inspection Resolved
            </h4>
            <p className="text-xs text-emerald-700 dark:text-emerald-300 max-w-sm mx-auto">
              Security deposit accounting finalised and inspection record closed.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
