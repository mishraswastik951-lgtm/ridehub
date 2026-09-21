import React, { useState, useRef } from "react";
import { MoveHorizontal } from "lucide-react";
import { DamageFinding } from "../../types/ai";
import { BoundingBoxCanvas } from "./BoundingBoxCanvas";

interface CompareSliderProps {
  pickupImageUrl: string;
  returnImageUrl: string;
  angleLabel: string;
  newFindings: DamageFinding[];
}

export const CompareSlider: React.FC<CompareSliderProps> = ({
  pickupImageUrl,
  returnImageUrl,
  angleLabel,
  newFindings,
}) => {
  const [sliderPosition, setSliderPosition] = useState(50); // percentage 0 - 100
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    let percentage = (x / rect.width) * 100;
    if (percentage < 0) percentage = 0;
    if (percentage > 100) percentage = 100;
    setSliderPosition(percentage);
  };

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      setSliderPosition((prev) => Math.max(0, prev - 5));
    } else if (e.key === "ArrowRight") {
      setSliderPosition((prev) => Math.min(100, prev + 5));
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
        <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
          Pickup Baseline ({angleLabel})
        </span>
        <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
          Return Photo ({newFindings.length} New Issue{newFindings.length === 1 ? "" : "s"})
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
        </span>
      </div>

      <div
        ref={containerRef}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchMove={handleTouchMove}
        aria-label={`Side-by-side comparison for ${angleLabel}`}
        role="slider"
        aria-valuenow={Math.round(sliderPosition)}
        aria-valuemin={0}
        aria-valuemax={100}
        className="relative w-full h-[320px] sm:h-[400px] overflow-hidden rounded-xl border border-slate-700 bg-slate-900 select-none cursor-ew-resize focus:outline-none focus:ring-2 focus:ring-amber-500"
      >
        {/* Background Image: Return photo with new bounding box overlays */}
        <div className="absolute inset-0 w-full h-full">
          <BoundingBoxCanvas imageUrl={returnImageUrl} findings={newFindings} />
        </div>

        {/* Foreground Image: Pickup photo clipped by slider position */}
        <div
          className="absolute top-0 left-0 bottom-0 overflow-hidden border-r-2 border-white shadow-2xl z-10"
          style={{ width: `${sliderPosition}%` }}
        >
          <div className="absolute top-0 left-0 w-full h-full max-w-none" style={{ width: containerRef.current?.offsetWidth || 600 }}>
            <img
              src={pickupImageUrl}
              alt="Pickup photo"
              className="w-full h-full object-contain bg-slate-900"
            />
          </div>
        </div>

        {/* Draggable Divider Handle */}
        <div
          onMouseDown={handleMouseDown}
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={() => setIsDragging(false)}
          className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize z-20 flex items-center justify-center shadow-lg"
          style={{ left: `${sliderPosition}%` }}
        >
          <div className="w-9 h-9 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-xl border-2 border-white hover:scale-110 active:scale-95 transition-transform">
            <MoveHorizontal className="w-5 h-5" />
          </div>
        </div>
      </div>
    </div>
  );
};
