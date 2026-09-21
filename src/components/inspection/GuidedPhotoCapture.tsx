import React, { useState } from "react";
import { Camera, Upload, AlertTriangle, CheckCircle, RefreshCw, ChevronRight, Loader2 } from "lucide-react";
import { ImageAngle, QualityCheckResult } from "../../types/ai";
import { SilhouetteOverlay } from "./SilhouetteOverlay";

export interface CapturedPhoto {
  angle: ImageAngle;
  file: File;
  previewUrl: string;
  quality: QualityCheckResult;
}

interface GuidedPhotoCaptureProps {
  vehicleType: string;
  phase: "pickup" | "return";
  onComplete: (photos: CapturedPhoto[]) => void;
  onCancel?: () => void;
}

// Client-side image preprocessing utility for resizing and quality checks
async function processAndResizeImage(
  file: File,
  maxWidth = 1600,
  maxHeight = 1600,
  quality = 0.8
): Promise<{ processedFile: File; dataUrl: string; qualityCheck: QualityCheckResult }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Could not get canvas context"));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        const imageData = ctx.getImageData(0, 0, width, height);
        const qualityCheck = evaluateImageQuality(imageData);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Canvas blob creation failed"));
              return;
            }
            const processedFile = new File([blob], file.name.replace(/\.[^/.]+$/, ".jpg"), {
              type: "image/jpeg",
              lastModified: Date.now(),
            });
            const dataUrl = canvas.toDataURL("image/jpeg", quality);
            resolve({ processedFile, dataUrl, qualityCheck });
          },
          "image/jpeg",
          quality
        );
      };
      img.onerror = () => reject(new Error("Failed to load image element"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

function evaluateImageQuality(imageData: ImageData): QualityCheckResult {
  const data = imageData.data;
  let totalBrightness = 0;
  const pixelCount = data.length / 4;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    totalBrightness += 0.299 * r + 0.587 * g + 0.114 * b;
  }
  const brightness = Math.round(totalBrightness / pixelCount);

  let sumDiff = 0;
  const width = imageData.width;
  const height = imageData.height;

  for (let y = 0; y < height; y += 4) {
    for (let x = 1; x < width - 1; x += 4) {
      const idx = (y * width + x) * 4 + 1;
      const left = data[idx - 4];
      const right = data[idx + 4];
      const center = data[idx];
      const lap = Math.abs(2 * center - left - right);
      sumDiff += lap;
    }
  }

  const sampleCount = (height / 4) * (width / 4);
  const blurScore = sumDiff / (sampleCount || 1);

  return {
    isDark: brightness < 45,
    isBlurred: blurScore < 8,
    brightness,
    score: Math.min(100, Math.round(blurScore * 5)),
  };
}

const ANGLES: Array<{ key: ImageAngle; label: string; req: boolean }> = [
  { key: "front", label: "Front View", req: true },
  { key: "rear", label: "Rear View", req: true },
  { key: "left", label: "Left Side", req: true },
  { key: "right", label: "Right Side", req: true },
  { key: "dashboard", label: "Dashboard / Odometer", req: true },
  { key: "closeup", label: "Pre-existing / Specific Spot", req: false },
];

// Generates a realistic vehicle illustration with damage markers on HTML5 Canvas for offline demo testing
function createSampleImageBlob(angleLabel: string, vehicleType: string): Promise<File> {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    canvas.width = 1000;
    canvas.height = 750;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      // Dark studio gradient background
      const bgGradient = ctx.createLinearGradient(0, 0, 1000, 750);
      bgGradient.addColorStop(0, "#0F172A");
      bgGradient.addColorStop(1, "#1E293B");
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, 1000, 750);

      // Floor grid line
      ctx.strokeStyle = "#334155";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 550);
      ctx.lineTo(1000, 550);
      ctx.stroke();

      // Vehicle Body Graphic Outline
      ctx.fillStyle = "#38BDF8";
      ctx.strokeStyle = "#0284C7";
      ctx.lineWidth = 6;
      ctx.beginPath();

      if (vehicleType.toLowerCase().includes("car")) {
        // Car silhouette
        ctx.roundRect(150, 320, 700, 200, 40);
        ctx.fill();
        ctx.stroke();
        // Cabin
        ctx.fillStyle = "#1E293B";
        ctx.beginPath();
        ctx.moveTo(300, 320);
        ctx.lineTo(400, 200);
        ctx.lineTo(650, 200);
        ctx.lineTo(720, 320);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else {
        // Scooty / Bike silhouette
        ctx.beginPath();
        ctx.arc(300, 520, 60, 0, Math.PI * 2); // Front wheel
        ctx.arc(700, 520, 60, 0, Math.PI * 2); // Rear wheel
        ctx.fillStyle = "#334155";
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#E8A317";
        ctx.beginPath();
        ctx.roundRect(280, 340, 440, 140, 30); // Main body
        ctx.fill();
        ctx.stroke();
      }

      // Pre-existing scratch/dent visualization mark
      if (angleLabel.toLowerCase().includes("right") || angleLabel.toLowerCase().includes("front")) {
        ctx.strokeStyle = "#EF4444";
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(480, 400);
        ctx.lineTo(540, 430);
        ctx.lineTo(510, 460);
        ctx.stroke();

        ctx.fillStyle = "#EF4444";
        ctx.font = "bold 16px sans-serif";
        ctx.fillText("Scratch / Dent Area", 510, 385);
      }

      // Title Banner Header
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 32px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`${vehicleType.toUpperCase()} — ${angleLabel.toUpperCase()}`, 500, 70);

      ctx.fillStyle = "#E8A317";
      ctx.font = "bold 18px sans-serif";
      ctx.fillText("RIDEHUB AI INSPECTION SAMPLE FRAME", 500, 105);

      // Framing box guide lines
      ctx.strokeStyle = "rgba(245, 158, 11, 0.4)";
      ctx.setLineDash([12, 12]);
      ctx.strokeRect(50, 130, 900, 570);
      ctx.setLineDash([]);
    }

    canvas.toBlob((blob) => {
      const file = new File([blob || new Blob()], `${angleLabel}_sample.jpg`, { type: "image/jpeg" });
      resolve(file);
    }, "image/jpeg");
  });
}

export const GuidedPhotoCapture: React.FC<GuidedPhotoCaptureProps> = ({
  vehicleType,
  phase,
  onComplete,
  onCancel,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [photos, setPhotos] = useState<Record<string, CapturedPhoto>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingError, setProcessingError] = useState<string | null>(null);

  const currentAngleObj = ANGLES[currentStepIndex];

  const handleFileSelected = async (file: File) => {
    setIsProcessing(true);
    setProcessingError(null);
    try {
      const { processedFile, dataUrl, qualityCheck } = await processAndResizeImage(file);
      const newPhoto: CapturedPhoto = {
        angle: currentAngleObj.key,
        file: processedFile,
        previewUrl: dataUrl,
        quality: qualityCheck,
      };
      setPhotos((prev) => ({ ...prev, [currentAngleObj.key]: newPhoto }));
    } catch (err: any) {
      console.error("Photo processing error:", err);
      setProcessingError(err.message || "Failed to process photo");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUseSamplePhoto = async () => {
    setIsProcessing(true);
    setProcessingError(null);
    try {
      const sampleFile = await createSampleImageBlob(currentAngleObj.label, vehicleType);
      await handleFileSelected(sampleFile);
    } catch (err: any) {
      console.error("Sample photo creation failed:", err);
      setProcessingError("Failed to generate sample photo");
      setIsProcessing(false);
    }
  };

  const handleNext = () => {
    if (currentStepIndex < ANGLES.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      const photoList = Object.values(photos);
      onComplete(photoList);
    }
  };

  const handleRetake = (angleKey: string) => {
    setPhotos((prev) => {
      const updated = { ...prev };
      delete updated[angleKey];
      return updated;
    });
  };

  const currentPhoto = photos[currentAngleObj.key];
  const requiredCaptured = ANGLES.filter((a) => a.req).every((a) => !!photos[a.key]);

  return (
    <div className="max-w-2xl mx-auto space-y-6 bg-white dark:bg-[#0F172A] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl">
      {/* Step Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
            {phase.toUpperCase()} DAMAGE INSPECTION FLOW
          </span>
          <h2 className="text-xl font-heading font-bold text-slate-900 dark:text-white">
            Photo {currentStepIndex + 1} of {ANGLES.length}: {currentAngleObj.label}
          </h2>
        </div>
        <span className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full font-medium">
          {vehicleType}
        </span>
      </div>

      {/* Progress Dots */}
      <div className="flex items-center justify-between gap-1.5 py-2">
        {ANGLES.map((angle, idx) => {
          const isDone = !!photos[angle.key];
          const isCurrent = idx === currentStepIndex;

          return (
            <button
              key={angle.key}
              onClick={() => setCurrentStepIndex(idx)}
              className={`flex-1 h-2 rounded-full transition-all duration-200 cursor-pointer ${
                isCurrent
                  ? "bg-amber-500 scale-y-125 shadow-md"
                  : isDone
                  ? "bg-emerald-500"
                  : "bg-slate-200 dark:bg-slate-700"
              }`}
              title={`${angle.label} (${isDone ? "Done" : "Pending"})`}
            />
          );
        })}
      </div>

      {/* Main Viewfinder / Photo Area */}
      <div className="relative w-full h-[340px] rounded-xl overflow-hidden bg-slate-950 flex flex-col items-center justify-center border border-slate-800">
        {isProcessing ? (
          <div className="flex flex-col items-center justify-center gap-3 text-amber-400">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="text-xs font-semibold text-slate-300">Compressing & analyzing image quality...</span>
          </div>
        ) : currentPhoto ? (
          <div className="relative w-full h-full group">
            <img
              src={currentPhoto.previewUrl}
              alt={currentAngleObj.label}
              className="w-full h-full object-contain"
            />
            {/* Quality Badge Overlay */}
            <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700 text-xs text-white flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Captured ({currentAngleObj.label})</span>
            </div>

            {/* Blur / Light Warning */}
            {(currentPhoto.quality.isBlurred || currentPhoto.quality.isDark) && (
              <div className="absolute bottom-3 left-3 right-3 bg-amber-500/90 text-slate-950 font-medium p-2.5 rounded-lg backdrop-blur-md text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>
                  {currentPhoto.quality.isDark && currentPhoto.quality.isBlurred
                    ? "Photo is dark & slightly blurred. Retake for accurate AI detection."
                    : currentPhoto.quality.isDark
                    ? "Lighting is low. Turn on flash or move to brighter spot."
                    : "Photo appears slightly blurred. Hold steady."}
                </span>
              </div>
            )}

            {/* Retake Overlay Button */}
            <button
              onClick={() => handleRetake(currentAngleObj.key)}
              className="absolute top-3 right-3 bg-slate-900/80 hover:bg-slate-900 text-white p-2 rounded-lg border border-slate-700 text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retake</span>
            </button>
          </div>
        ) : (
          <div className="relative w-full h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
            {/* Vehicle Alignment Silhouette */}
            <SilhouetteOverlay vehicleType={vehicleType} angle={currentAngleObj.key} />

            <div className="z-20 space-y-3">
              <div className="w-14 h-14 mx-auto rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 shadow-inner">
                <Camera className="w-7 h-7" />
              </div>

              <div className="space-y-1">
                <h4 className="text-white font-medium text-sm">Take {currentAngleObj.label} Photo</h4>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Align vehicle within the guide frame. Ensure good lighting and clear focus.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-3 pt-2">
                <label className="cursor-pointer bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-lg transition-all">
                  <Upload className="w-4 h-4" />
                  <span>Choose Photo / Camera</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        handleFileSelected(e.target.files[0]);
                        e.target.value = "";
                      }
                    }}
                  />
                </label>

                <button
                  type="button"
                  onClick={handleUseSamplePhoto}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium px-3.5 py-2 rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Use Sample Photo
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {processingError && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs rounded-xl flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{processingError}</span>
        </div>
      )}

      {/* Navigation Controls */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors font-medium cursor-pointer"
        >
          Cancel Inspection
        </button>

        <div className="flex items-center gap-3">
          {currentStepIndex > 0 && (
            <button
              type="button"
              onClick={() => setCurrentStepIndex((prev) => prev - 1)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              Previous
            </button>
          )}

          {currentStepIndex < ANGLES.length - 1 ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={currentAngleObj.req && !currentPhoto}
              className="bg-[#0F1F3D] hover:bg-[#1A2E54] dark:bg-amber-500 dark:hover:bg-amber-600 dark:text-slate-950 text-white font-bold px-5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              <span>Next Photo</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              disabled={!requiredCaptured}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              <span>Analyze All Photos</span>
              <CheckCircle className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
