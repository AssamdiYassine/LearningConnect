import React, { ReactNode } from "react";
import WaveDivider from "./wave-divider";

interface HeroSectionProps {
  title: string | ReactNode;
  subtitle?: string | ReactNode;
  imageUrl?: string;
  children?: ReactNode;
  className?: string;
  align?: "left" | "center" | "right";
  wave?: boolean;
  waveColor?: string;
  gradient?: boolean;
  height?: "small" | "medium" | "large";
  withPattern?: boolean;
}

export default function HeroSection({
  title,
  subtitle,
  imageUrl,
  children,
  className = "",
  align = "center",
  wave = true,
  waveColor = "#ffffff",
  gradient = true,
  height = "medium",
  withPattern = false,
}: HeroSectionProps) {
  const getHeight = () => {
    switch (height) {
      case "small":
        return "min-h-[300px] lg:min-h-[350px]";
      case "large":
        return "min-h-[600px] lg:min-h-[700px]";
      default:
        return "min-h-[400px] lg:min-h-[500px]";
    }
  };

  const alignClass = {
    left: "text-left items-start",
    center: "text-center items-center",
    right: "text-right items-end",
  }[align];

  const bgClass = gradient
    ? "bg-gradient-to-br from-primary via-primary/90 to-primary/80"
    : "bg-gradient-to-br from-[#1D2B6C] via-[#5F8BFF] to-[#7A6CFF]";

  return (
    <section
      className={`relative ${getHeight()} flex flex-col justify-center ${
        withPattern ? "bg-grid" : ""
      } ${bgClass} py-16 overflow-hidden ${className}`}
    >
      {imageUrl && (
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center z-0 opacity-20"
          style={{ backgroundImage: `url(${imageUrl})` }}
        />
      )}

      <div className="container-wide relative z-10 px-4 sm:px-6 md:px-8 lg:px-12">
        <div
          className={`flex flex-col ${alignClass} gap-4 max-w-4xl mx-auto`}
        >
          {typeof title === "string" ? (
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white">
              {title}
            </h1>
          ) : (
            title
          )}

          {subtitle && typeof subtitle === "string" ? (
            <p className="mt-2 text-xl md:text-2xl text-white/80 max-w-3xl mx-auto">
              {subtitle}
            </p>
          ) : (
            subtitle
          )}

          {children && <div className="mt-8">{children}</div>}
        </div>
      </div>

      {wave && <WaveDivider color={waveColor} />}

      {/* Decorative elements - blobs */}
      <div className="shape-blob w-96 h-96 -top-24 -left-24 from-white/10 to-white/5"></div>
      <div className="shape-blob w-96 h-96 bottom-0 right-0 translate-x-1/2 translate-y-1/3 from-white/10 to-white/5"></div>
    </section>
  );
}