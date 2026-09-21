import React from "react";
import { ArrowLeft, Printer, ShieldCheck, CheckCircle2, FileText, Download } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { formatINR } from "../../utils/formatters";

interface AgreementPageProps {
  bookingId?: string;
  onBack: () => void;
}

export const AgreementPage: React.FC<AgreementPageProps> = ({ bookingId = "BK-1001", onBack }) => {
  const { bookings, currentUser, vehicles, shops } = useApp();
  const booking = bookings.find((b) => b.id === bookingId) || bookings[0];
  const vehicle = booking?.vehicle || vehicles.find((v) => v.id === booking?.vehicleId) || vehicles[0];
  const shop = booking?.shop || shops.find((s) => s.id === booking?.shopId) || shops[0];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      {/* Top Bar Actions */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#16181F] hover:bg-[#F3EEE6] bg-white px-3.5 py-2 rounded-[8px] border border-[#E4DDD1] cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>Back to Ride Dashboard</span>
        </button>

        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#0F1F3D] hover:bg-[#0A1529] text-white font-heading font-semibold text-xs rounded-[8px] transition-colors cursor-pointer"
        >
          <Printer size={15} />
          <span>Print Official Agreement</span>
        </button>
      </div>

      {/* Printable Structured Agreement Document */}
      <div className="bg-white rounded-[12px] p-8 sm:p-12 border border-[#E4DDD1] shadow-[0_2px_8px_rgba(15,31,61,0.06)] space-y-8 font-sans">
        {/* Document Header */}
        <div className="border-b-2 border-[#0F1F3D] pb-6 flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <span className="text-[11px] font-bold text-[#2456D6] tracking-wider uppercase block">
              Official RideHub Digital Contract
            </span>
            <h1 className="font-heading font-extrabold text-2xl text-[#16181F] mt-1">
              Self-Drive Motor Vehicle Rental Agreement
            </h1>
            <p className="text-xs text-[#5B6070] mt-0.5">
              Governed under the Indian Motor Vehicles Act, 1988 & Digital IT Act, 2000
            </p>
          </div>

          <div className="text-right sm:text-right">
            <div className="inline-flex items-center gap-1 text-xs font-bold text-[#1B7A4E] bg-[#EBF7F0] border border-[#2E9E6B]/30 px-2.5 py-1 rounded-[4px]">
              <CheckCircle2 size={13} />
              <span>DIGITALLY SIGNED & VERIFIED</span>
            </div>
            <span className="text-[11px] font-mono text-[#5B6070] block mt-1">
              Contract ID: RH-AGR-{booking?.id || "BK-1001"}
            </span>
          </div>
        </div>

        {/* Parties Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          <div className="p-4 bg-[#FAF7F2] rounded-[8px] border border-[#E4DDD1] space-y-1.5">
            <h4 className="font-heading font-bold text-sm text-[#0F1F3D]">
              Part A: Authorized Fleet Operator
            </h4>
            <p className="font-semibold text-[#16181F]">{shop.name}</p>
            <p className="text-[#5B6070]">{shop.address}</p>
            <p className="text-[#5B6070]">Operating City: {shop.city}</p>
            <p className="text-[#1B7A4E] font-medium">HubX Certified Partner ({shop.trust.overall}/10 Trust Score)</p>
          </div>

          <div className="p-4 bg-[#FAF7F2] rounded-[8px] border border-[#E4DDD1] space-y-1.5">
            <h4 className="font-heading font-bold text-sm text-[#0F1F3D]">
              Part B: Verified Renter (Customer)
            </h4>
            <p className="font-semibold text-[#16181F]">{currentUser.name}</p>
            <p className="text-[#5B6070]">Phone: {currentUser.phone}</p>
            <p className="text-[#5B6070]">Email: {currentUser.email}</p>
            <p className="text-[#1B7A4E] font-medium">
              DigiLocker Licence: {currentUser.verifiedDoc?.number || "KA-05-2021-0089421"}
            </p>
          </div>
        </div>

        {/* Vehicle & Rental Term Table */}
        <div className="space-y-3">
          <h4 className="font-heading font-bold text-sm text-[#16181F]">
            1. Vehicle Handover & Term Specification
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-[#E4DDD1] rounded-[6px] overflow-hidden">
              <thead className="bg-[#FAF7F2] border-b border-[#E4DDD1] font-heading font-bold text-[#16181F]">
                <tr>
                  <th className="p-3">Vehicle Details</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Pickup Scheduled</th>
                  <th className="p-3">Return Due</th>
                  <th className="p-3">Fuel Policy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4DDD1]">
                <tr>
                  <td className="p-3 font-semibold text-[#16181F]">{vehicle.model} ({vehicle.year})</td>
                  <td className="p-3 uppercase font-mono">{vehicle.type}</td>
                  <td className="p-3">{booking ? new Date(booking.pickupAt).toLocaleString() : "Today"}</td>
                  <td className="p-3">{booking ? new Date(booking.returnAt).toLocaleString() : "Tomorrow"}</td>
                  <td className="p-3 font-medium text-[#1B7A4E]">Same-to-Same</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Deposit & Financial Terms */}
        <div className="p-4 bg-[#FAF7F2] rounded-[8px] border border-[#E4DDD1] space-y-2 text-xs">
          <h4 className="font-heading font-bold text-sm text-[#0F1F3D]">
            2. Escrow Deposit & Transparent Deduction Terms
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div>
              <span className="text-[#5B6070] block">Refundable Deposit</span>
              <strong className="text-base text-[#16181F] tabular-nums font-bold">
                {formatINR(vehicle.deposit)}
              </strong>
            </div>
            <div>
              <span className="text-[#5B6070] block">Payment Channel</span>
              <strong className="text-base text-[#16181F]">NPCI UPI (Escrow Protected)</strong>
            </div>
            <div>
              <span className="text-[#5B6070] block">Handover Inspection</span>
              <strong className="text-base text-[#1B7A4E]">360° Walkaround Logged</strong>
            </div>
          </div>
          <p className="text-[11px] text-[#5B6070] pt-2 border-t border-[#E4DDD1] leading-relaxed">
            Pre-existing condition record: <em>{vehicle.damageNotes}</em>. Under HubX platform policy, no security deposit deduction may occur for unrecorded scratches without matching digital before-and-after photo inspection logs.
          </p>
        </div>

        {/* Terms Articles */}
        <div className="space-y-3 text-xs text-[#5B6070] leading-relaxed">
          <h4 className="font-heading font-bold text-sm text-[#16181F]">
            3. Standard Operational Covenants
          </h4>
          <ul className="list-disc pl-5 space-y-1">
            <li>The Renter covenants they hold a valid driving licence suitable for {vehicle.model}.</li>
            <li>Subletting or commercial passenger carriage is strictly prohibited under terms of this self-drive contract.</li>
            <li>Rides may be extended directly via the RideHub app prior to expiration, subject to subsequent slot reservations.</li>
            <li>In case of mechanical fault or roadside incident, 24/7 partner helpline is accessible via the customer dashboard.</li>
          </ul>
        </div>

        {/* Digital Signatures */}
        <div className="pt-6 border-t border-[#E4DDD1] grid grid-cols-2 gap-8 text-xs">
          <div>
            <span className="text-[#5B6070] block text-[11px]">Authorized Garage Signature:</span>
            <p className="font-heading font-bold text-sm text-[#0F1F3D] mt-2">{shop.name}</p>
            <span className="text-[10px] text-[#1B7A4E] block mt-0.5">Digitally Approved Handover Certificate</span>
          </div>
          <div>
            <span className="text-[#5B6070] block text-[11px]">Renter Electronic Acceptance:</span>
            <p className="font-heading font-bold text-sm text-[#0F1F3D] mt-2">{currentUser.name}</p>
            <span className="text-[10px] text-[#1B7A4E] block mt-0.5">OTP & DigiLocker Authenticated</span>
          </div>
        </div>
      </div>
    </div>
  );
};
