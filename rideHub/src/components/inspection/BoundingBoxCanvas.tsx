import React from "react";
import { DamageFinding } from "../../types/ai";

interface BoundingBoxCanvasProps {
  imageUrl: string;
  findings: DamageFinding[];
  confidenceMin?: number; // Defaults to 0.6
  onSelectFinding?: (finding: DamageFinding) => void;
  selectedFindingId?: string;
}

export const BoundingBoxCanvas: React.FC<BoundingBoxCanvasProps> = ({
  imageUrl,
  findings,
  confidenceMin = 0.6,
  onSelectFinding,
  selectedFindingId,
}) => {
  return (
    <div className="relative w-full h-auto overflow-hidden rounded-xl bg-slate-900 border border-slate-700 group">
      {/* Target Image */}
      <img
        src={imageUrl}
        alt="Vehicle Inspection Photo"
        className="w-full h-auto object-contain max-h-[420px] mx-auto select-none"
      />

      {/* SVG Overlay for Bounding Boxes */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1000 1000" preserveAspectRatio="none">
        {findings.map((finding) => {
          const [ymin, xmin, ymax, xmax] = finding.box;
          const width = Math.max(xmax - xmin, 20);
          const height = Math.max(ymax - ymin, 20);

          const isLowConfidence = finding.confidence < confidenceMin;
          const isSelected = selectedFindingId === finding.id;

          // Severity colors
          let strokeColor = "#F59E0B"; // Amber minor
          let fillColor = "rgba(245, 158, 11, 0.15)";
          if (finding.severity === "moderate") {
            strokeColor = "#F97316"; // Orange moderate
            fillColor = "rgba(249, 115, 22, 0.2)";
          } else if (finding.severity === "severe") {
            strokeColor = "#EF4444"; // Red severe
            fillColor = "rgba(239, 68, 68, 0.25)";
          }

          if (isLowConfidence) {
            strokeColor = "#A855F7"; // Purple for possible/uncertain
            fillColor = "rgba(168, 85, 247, 0.15)";
          }

          return (
            <g key={finding.id} className="pointer-events-auto cursor-pointer" onClick={() => onSelectFinding?.(finding)}>
              {/* Bounding box rectangle */}
              <rect
                x={xmin}
                y={ymin}
                width={width}
                height={height}
                fill={fillColor}
                stroke={strokeColor}
                strokeWidth={isSelected ? "14" : "8"}
                strokeDasharray={isLowConfidence ? "16 10" : undefined}
                rx="8"
                className="transition-all duration-200"
              />

              {/* Tag Label at Top Left of Box */}
              <g transform={`translate(${xmin}, ${Math.max(ymin - 35, 10)})`}>
                <rect
                  x="0"
                  y="0"
                  width={Math.min(width * 2.5, 320)}
                  height="34"
                  fill={strokeColor}
                  rx="6"
                />
                <text
                  x="10"
                  y="22"
                  fill="#FFFFFF"
                  fontSize="20"
                  fontWeight="bold"
                  fontFamily="sans-serif"
                >
                  {isLowConfidence ? "❓ Possible: " : ""}{finding.type.replace("_", " ").toUpperCase()} ({Math.round(finding.confidence * 100)}%)
                </text>
              </g>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
