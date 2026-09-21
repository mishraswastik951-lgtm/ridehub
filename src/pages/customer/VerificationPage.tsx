import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import confetti from "canvas-confetti";
import { 
  FileCheck2, 
  Upload, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight,
  Clock,
  Sparkles
} from "lucide-react";
import { TransparentPreloader } from "../../components/common/TransparentPreloader";

interface VerificationPageProps {
  onNavigate: (route: string) => void;
}

export const VerificationPage: React.FC<VerificationPageProps> = ({ onNavigate }) => {
  const { currentUser, uploadDocuments } = useApp();
  const [isVerifying, setIsVerifying] = useState(false);
  const [licenceUploaded, setLicenceUploaded] = useState(!!currentUser.drivingLicenceUrl);
  const [idUploaded, setIdUploaded] = useState(!!currentUser.nationalIdUrl);
  const [licenceFileName, setLicenceFileName] = useState<string>(
    currentUser.drivingLicenceUrl ? "driving_licence_verified.pdf" : ""
  );
  const [idFileName, setIdFileName] = useState<string>(
    currentUser.nationalIdUrl ? "masked_aadhaar_pass.pdf" : ""
  );
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  const licenceInputRef = React.useRef<HTMLInputElement>(null);
  const idInputRef = React.useRef<HTMLInputElement>(null);

  const runVerificationFlow = (lName?: string, iName?: string) => {
    setIsVerifying(true);
    setUploadSuccess(null);
    setTimeout(() => {
      uploadDocuments(
        "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=400&q=80",
        "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=400&q=80"
      );
      setLicenceUploaded(true);
      setIdUploaded(true);
      if (lName) setLicenceFileName(lName);
      if (iName) setIdFileName(iName);
      setIsVerifying(false);
      setUploadSuccess("Documents verified successfully with Sarathi & DigiLocker!");

      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    }, 1200);
  };

  const handleSimulateUpload = () => {
    runVerificationFlow(
      licenceFileName || "driving_licence_verified.pdf",
      idFileName || "masked_aadhaar_pass.pdf"
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "licence" | "id") => {
    const file = e.target.files?.[0];
    if (file) {
      if (type === "licence") {
        setLicenceFileName(file.name);
        setLicenceUploaded(true);
        runVerificationFlow(file.name, idFileName || "masked_aadhaar_pass.pdf");
      } else {
        setIdFileName(file.name);
        setIdUploaded(true);
        runVerificationFlow(licenceFileName || "driving_licence_verified.pdf", file.name);
      }
    }
  };

  const handleDrop = (e: React.DragEvent, type: "licence" | "id") => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (type === "licence") {
        setLicenceFileName(file.name);
        setLicenceUploaded(true);
        runVerificationFlow(file.name, idFileName || "masked_aadhaar_pass.pdf");
      } else {
        setIdFileName(file.name);
        setIdUploaded(true);
        runVerificationFlow(licenceFileName || "driving_licence_verified.pdf", file.name);
      }
    }
  };

  const getStatusChip = () => {
    switch (currentUser.docsStatus) {
      case "Verified":
        return (
          <span className="verified-seal">
            <CheckCircle2 size={13} /> VERIFIED VIA DIGILOCKER
          </span>
        );
      case "Under Review":
        return (
          <span className="bg-[#FAF7F2] text-[#16181F] border border-[#E4DDD1] px-3 py-1 rounded-[4px] text-xs font-semibold flex items-center gap-1.5">
            <Clock size={13} /> Under Review
          </span>
        );
      default:
        return (
          <span className="bg-[#FAF7F2] text-[#5B6070] border border-[#E4DDD1] px-3 py-1 rounded-[4px] text-xs font-medium">
            Pending Upload
          </span>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="eyebrow-label block mb-1">PAPERLESS IDENTITY VERIFICATION</span>
        <h1 className="font-heading font-bold text-2xl sm:text-3xl text-[#16181F]">
          Digital KYC & Licence Audit
        </h1>
        <p className="text-xs sm:text-sm text-[#5B6070]">
          Verify your Indian or International Driving Licence once. Rental shops inspect the verified digital pass without confiscating original cards.
        </p>
      </div>

      {uploadSuccess && (
        <div className="p-4 rounded-[8px] bg-[#EBF7F1] border border-[#2E9E6B] text-[#1B7A4E] text-sm font-medium flex items-center gap-2">
          <CheckCircle2 size={18} />
          <span>{uploadSuccess}</span>
        </div>
      )}

      {/* Bonus Points Banner - Solid Navy with Amber Badge */}
      <div className="p-5 rounded-[12px] bg-[#0F1F3D] border border-[#0A1529] text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-[6px] bg-[#0A1529] flex items-center justify-center text-[#E8A317]">
            <Sparkles size={18} />
          </div>
          <div>
            <h4 className="font-heading font-bold text-sm text-white">KYC Welcome Bonus: +150 Points</h4>
            <p className="text-xs text-[#B5C4E0]">
              Unlock an instant ₹150 credit directly applicable on any vehicle rental.
            </p>
          </div>
        </div>
        {currentUser.docsStatus === "Verified" ? (
          <span className="bg-[#1B7A4E] text-white font-semibold px-3 py-1.5 rounded-[6px] text-xs">
            ✓ 150 Points Credited
          </span>
        ) : (
          <span className="bg-[#E8A317] text-[#0F1F3D] font-bold px-3 py-1 rounded-[4px] text-xs uppercase tracking-wider">
            Claim on Upload
          </span>
        )}
      </div>

      {/* Upload Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Driving Licence Card */}
        <div className="bg-white rounded-[12px] p-6 border border-[#E4DDD1] shadow-[0_1px_2px_rgba(15,31,61,0.06)] space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-heading font-bold text-base text-[#16181F]">
                1. Driving Licence (Front & Back)
              </h3>
              {licenceUploaded && <CheckCircle2 size={16} className="text-[#1B7A4E]" />}
            </div>
            <p className="text-xs text-[#5B6070] mb-4">
              Valid 2-wheeler or 4-wheeler motor vehicle licence issued by Government of India or valid IDP.
            </p>

            <input
              type="file"
              ref={licenceInputRef}
              className="hidden"
              accept="image/*,.pdf"
              onChange={(e) => handleFileChange(e, "licence")}
            />

            <div
              onClick={() => licenceInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, "licence")}
              className="border border-dashed border-[#E4DDD1] hover:border-[#0F1F3D] rounded-[8px] p-6 text-center bg-[#FAF7F2] hover:bg-[#F3EEE6] transition-colors duration-200 cursor-pointer"
            >
              <Upload size={22} className="mx-auto text-[#5B6070] mb-2" />
              <p className="text-xs font-semibold text-[#16181F]">
                {licenceFileName || (licenceUploaded ? "driving_licence_verified.pdf" : "Click or Drop Driving Licence File")}
              </p>
              <p className="text-[10px] text-[#5B6070] mt-1">Supports PNG, JPG, PDF (Up to 5MB)</p>
            </div>
          </div>

          <div className="text-[11px] text-[#5B6070] flex items-center gap-1.5 pt-2 border-t border-[#E4DDD1]">
            <ShieldCheck size={13} className="text-[#1B7A4E]" />
            <span>Encrypted with Sarathi API validation</span>
          </div>
        </div>

        {/* National ID Card */}
        <div className="bg-white rounded-[12px] p-6 border border-[#E4DDD1] shadow-[0_1px_2px_rgba(15,31,61,0.06)] space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-heading font-bold text-base text-[#16181F]">
                2. National ID / Aadhaar / Passport
              </h3>
              {idUploaded && <CheckCircle2 size={16} className="text-[#1B7A4E]" />}
            </div>
            <p className="text-xs text-[#5B6070] mb-4">
              Masked Aadhaar Card, Passport, or Voter ID for verified identity matching.
            </p>

            <input
              type="file"
              ref={idInputRef}
              className="hidden"
              accept="image/*,.pdf"
              onChange={(e) => handleFileChange(e, "id")}
            />

            <div
              onClick={() => idInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, "id")}
              className="border border-dashed border-[#E4DDD1] hover:border-[#0F1F3D] rounded-[8px] p-6 text-center bg-[#FAF7F2] hover:bg-[#F3EEE6] transition-colors duration-200 cursor-pointer"
            >
              <Upload size={22} className="mx-auto text-[#5B6070] mb-2" />
              <p className="text-xs font-semibold text-[#16181F]">
                {idFileName || (idUploaded ? "masked_aadhaar_pass.pdf" : "Click or Drop Identity Document File")}
              </p>
              <p className="text-[10px] text-[#5B6070] mt-1">Supports PNG, JPG, PDF (Up to 5MB)</p>
            </div>
          </div>

          <div className="text-[11px] text-[#5B6070] flex items-center gap-1.5 pt-2 border-t border-[#E4DDD1]">
            <ShieldCheck size={13} className="text-[#1B7A4E]" />
            <span>Redacted Aadhaar number storage</span>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="bg-white rounded-[12px] p-6 border border-[#E4DDD1] shadow-[0_1px_2px_rgba(15,31,61,0.06)] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-xs text-[#5B6070] font-medium block">Verification Status:</span>
          <div className="mt-1">{getStatusChip()}</div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          {currentUser.docsStatus === "Verified" ? (
            <>
              <button
                disabled={isVerifying}
                onClick={handleSimulateUpload}
                className="w-full sm:w-auto px-4 py-2.5 bg-[#FAF7F2] hover:bg-[#F3EEE6] border border-[#E4DDD1] text-[#16181F] font-heading font-medium text-xs rounded-[8px] transition-colors duration-200 cursor-pointer flex items-center justify-center gap-2"
              >
                <FileCheck2 size={14} />
                <span>Re-verify / Upload New Files</span>
              </button>

              <button
                onClick={() => onNavigate("/explore")}
                className="w-full sm:w-auto px-6 py-3 bg-[#0F1F3D] hover:bg-[#0A1529] text-white font-heading font-semibold text-sm rounded-[8px] transition-colors duration-200 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Explore & Reserve Fleet</span>
                <ArrowRight size={15} />
              </button>
            </>
          ) : (
            <button
              disabled={isVerifying}
              onClick={handleSimulateUpload}
              className="w-full sm:w-auto px-6 py-3 bg-[#E8A317] hover:bg-[#D99614] text-[#0F1F3D] font-heading font-bold text-sm rounded-[8px] transition-colors duration-200 cursor-pointer flex items-center justify-center gap-2"
            >
              {isVerifying ? (
                <span>Validating with DigiLocker...</span>
              ) : (
                <>
                  <FileCheck2 size={16} />
                  <span>Simulate Instant DigiLocker Verification (+150 pts)</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {isVerifying && (
        <TransparentPreloader 
          size="md" 
          label="Connecting to DigiLocker..." 
          subtext="Validating licence authorization credentials..." 
          fullscreen={true} 
        />
      )}
    </div>
  );
};
