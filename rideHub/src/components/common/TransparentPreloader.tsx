import React from "react";

interface TransparentPreloaderProps {
  size?: "sm" | "md" | "lg";
  label?: string;
  subtext?: string;
  fullscreen?: boolean;
}

export const TransparentPreloader: React.FC<TransparentPreloaderProps> = ({
  size = "md",
  label = "Finding verified vehicles...",
  subtext,
  fullscreen = false,
}) => {
  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-28 h-28",
    lg: "w-40 h-40",
  };

  const content = (
    <div className="flex flex-col items-center justify-center text-center p-6 select-none">
      <div className="relative flex items-center justify-center">
        {/* Animated Transparent WebP from ezgif sequence */}
        <img
          src="/ridehub-preloader.webp"
          alt="RideHub Loading Animation"
          className={`${sizeClasses[size]} object-contain drop-shadow-xs`}
        />
      </div>

      {label && (
        <p className="mt-4 font-heading font-semibold text-[#16181F] text-base tracking-tight">
          {label}
        </p>
      )}

      {subtext && (
        <p className="mt-1 text-xs text-[#5B6070] max-w-xs font-normal">
          {subtext}
        </p>
      )}
    </div>
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#FAF7F2]/90 backdrop-blur-none">
        <div className="bg-white border border-[#E4DDD1] rounded-xl shadow-md p-8 max-w-sm w-full mx-4">
          {content}
        </div>
      </div>
    );
  }

  return content;
};
