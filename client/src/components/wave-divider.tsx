import React from "react";

interface WaveDividerProps {
  color?: string;
  height?: number;
  position?: "top" | "bottom";
  className?: string;
}

export default function WaveDivider({
  color = "#ffffff",
  height = 60,
  position = "bottom",
  className = "",
}: WaveDividerProps) {
  const isTop = position === "top";
  
  return (
    <div
      className={`absolute left-0 right-0 w-full overflow-hidden leading-[0] ${
        isTop ? "top-0 rotate-180" : "bottom-0"
      } ${className}`}
      style={{ height: `${height}px` }}
    >
      <svg
        className="relative block w-full h-full"
        viewBox="0 24 150 28"
        preserveAspectRatio="none"
        shapeRendering="auto"
        fill={color}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <path
            id="gentle-wave"
            d="M-160 44c30 0 58-18 88-18s58 18 88 18 58-18 88-18 58 18 88 18v44h-352z"
          />
        </defs>
        <g className="moving-waves">
          <use
            xlinkHref="#gentle-wave"
            x="48"
            y="0"
            className="animate-wave-1"
            style={{ opacity: 0.7 }}
          />
          <use
            xlinkHref="#gentle-wave"
            x="48"
            y="3"
            className="animate-wave-2"
            style={{ opacity: 0.5 }}
          />
          <use
            xlinkHref="#gentle-wave"
            x="48"
            y="5"
            className="animate-wave-3"
            style={{ opacity: 0.3 }}
          />
          <use
            xlinkHref="#gentle-wave"
            x="48"
            y="7"
            className="animate-wave-4"
            style={{ opacity: 0.6 }}
          />
        </g>
      </svg>
    </div>
  );
}