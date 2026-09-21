import React, { useState } from "react";
import { Sliders, Zap, AlertTriangle, WifiOff, Clock, RefreshCw, X } from "lucide-react";

interface GpsDemoPanelProps {
  speedMultiplier: number;
  onSetSpeedMultiplier: (speed: number) => void;
  isDelayed: boolean;
  onToggleDelay: () => void;
  isGpsLost: boolean;
  onToggleSignalDrop: () => void;
  isOverdue: boolean;
  onToggleOverdue: () => void;
  onReset: () => void;
}

export const GpsDemoPanel: React.FC<GpsDemoPanelProps> = ({
  speedMultiplier,
  onSetSpeedMultiplier,
  isDelayed,
  onToggleDelay,
  isGpsLost,
  onToggleSignalDrop,
  isOverdue,
  onToggleOverdue,
  onReset,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-[9999] pointer-events-auto">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="px-3.5 py-2.5 bg-[#0F1F3D] hover:bg-[#0A1529] text-[#E8A317] border border-[#E8A317]/50 rounded-[20px] text-xs font-bold shadow-xl flex items-center gap-2 cursor-pointer transition-transform hover:scale-105"
        >
          <Sliders size={16} />
          <span>GPS Demo Panel</span>
        </button>
      ) : (
        <div className="bg-[#0F1F3D] text-white rounded-[12px] p-4 max-w-xs w-full shadow-2xl border border-[#1C2C4E] space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#1C2C4E]">
            <div className="flex items-center gap-2">
              <Sliders size={16} className="text-[#E8A317]" />
              <h4 className="font-heading font-bold text-xs text-white">Live GPS Simulation Controls</h4>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-[#B5C4E0] hover:text-white cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* Speed Multipliers */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-[#B5C4E0] uppercase">Movement Speed</span>
            <div className="grid grid-cols-3 gap-1.5">
              {[1, 2, 5].map((speed) => (
                <button
                  key={speed}
                  onClick={() => onSetSpeedMultiplier(speed)}
                  className={`py-1 text-xs font-bold rounded-[4px] transition-colors ${
                    speedMultiplier === speed
                      ? "bg-[#E8A317] text-[#0F1F3D]"
                      : "bg-[#0A1529] text-[#B5C4E0] hover:bg-[#1C2C4E]"
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>

          {/* Simulation Toggles */}
          <div className="space-y-1.5 text-xs">
            <button
              onClick={onToggleDelay}
              className={`w-full py-1.5 px-3 rounded-[6px] font-bold flex items-center justify-between transition-colors ${
                isDelayed ? "bg-[#E8A317] text-[#0F1F3D]" : "bg-[#0A1529] text-[#B5C4E0] hover:bg-[#1C2C4E]"
              }`}
            >
              <span className="flex items-center gap-1.5">
                <AlertTriangle size={13} />
                <span>Trigger Delay (+12m)</span>
              </span>
              <span>{isDelayed ? "ON" : "OFF"}</span>
            </button>

            <button
              onClick={onToggleSignalDrop}
              className={`w-full py-1.5 px-3 rounded-[6px] font-bold flex items-center justify-between transition-colors ${
                isGpsLost ? "bg-[#C8432F] text-white" : "bg-[#0A1529] text-[#B5C4E0] hover:bg-[#1C2C4E]"
              }`}
            >
              <span className="flex items-center gap-1.5">
                <WifiOff size={13} />
                <span>Drop GPS Signal</span>
              </span>
              <span>{isGpsLost ? "ON" : "OFF"}</span>
            </button>

            <button
              onClick={onToggleOverdue}
              className={`w-full py-1.5 px-3 rounded-[6px] font-bold flex items-center justify-between transition-colors ${
                isOverdue ? "bg-[#C8432F] text-white" : "bg-[#0A1529] text-[#B5C4E0] hover:bg-[#1C2C4E]"
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Clock size={13} />
                <span>Force Overdue State</span>
              </span>
              <span>{isOverdue ? "ON" : "OFF"}</span>
            </button>
          </div>

          <button
            onClick={onReset}
            className="w-full py-1.5 bg-[#1C2C4E] hover:bg-[#2A3F6C] text-xs font-bold text-white rounded-[6px] flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <RefreshCw size={13} />
            <span>Reset Simulation</span>
          </button>
        </div>
      )}
    </div>
  );
};
