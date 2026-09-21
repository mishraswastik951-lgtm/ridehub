import React from "react";
import { ImageAngle } from "../../types/ai";

interface SilhouetteOverlayProps {
  vehicleType: string; // scooty | bike | car
  angle: ImageAngle;
}

export const SilhouetteOverlay: React.FC<SilhouetteOverlayProps> = ({ vehicleType, angle }) => {
  const isCar = vehicleType.toLowerCase().includes("car");
  const isBike = vehicleType.toLowerCase().includes("bike") || vehicleType.toLowerCase().includes("bullet") || vehicleType.toLowerCase().includes("himalayan");
  
  // Angle-specific guides
  const guideText = {
    front: "Align front wheel & headlamp inside guide box",
    rear: "Align tail lamp & number plate inside guide box",
    left: "Capture full side profile from handle to rear tire",
    right: "Capture full side profile showing exhaust & body panels",
    dashboard: "Focus closely on odometer reading & fuel gauge",
    closeup: "Focus closely on pre-existing scratch, dent, or component",
  }[angle];

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-between p-6 z-10">
      {/* Target framing box */}
      <div className="w-full h-full border-2 border-dashed border-amber-400/60 rounded-2xl flex items-center justify-center relative bg-black/10 backdrop-blur-[1px]">
        {/* Silhouette SVG overlay */}
        <svg className="w-3/4 h-3/4 opacity-25 text-white stroke-current fill-none" viewBox="0 0 100 100">
          {angle === "dashboard" ? (
            <circle cx="50" cy="50" r="35" strokeWidth="2" strokeDasharray="4 4" />
          ) : isCar ? (
            <path d="M 10 60 Q 20 40 40 35 L 60 35 Q 80 40 90 60 L 90 75 L 10 75 Z" strokeWidth="2" />
          ) : (
            <path d="M 20 70 Q 25 40 45 40 L 65 45 Q 80 45 85 70 M 30 70 A 10 10 0 1 1 30 70.1 M 75 70 A 10 10 0 1 1 75 70.1" strokeWidth="2" />
          )}
        </svg>

        {/* Corner alignment markers */}
        <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-amber-400" />
        <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-amber-400" />
        <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-amber-400" />
        <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-amber-400" />
      </div>

      {/* Guidance text badge */}
      <div className="mt-3 bg-[#0F1F3D]/90 text-white text-xs px-4 py-1.5 rounded-full backdrop-blur-md shadow-lg border border-amber-400/30 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
        <span>{guideText}</span>
      </div>
    </div>
  );
};
