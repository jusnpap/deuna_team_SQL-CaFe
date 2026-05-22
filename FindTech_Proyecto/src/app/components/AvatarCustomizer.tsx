import React from "react";
import { useApp } from "../context/AppContext";

interface AvatarCustomizerProps {
  size?: "sm" | "lg";
}

export function AvatarCustomizer({ size = "sm" }: AvatarCustomizerProps) {
  const { selectedBorder, selectedAccessory } = useApp();

  const isLg = size === "lg";
  const containerSize = isLg ? "w-28 h-28" : "w-14 h-14";
  const avatarSize = isLg ? "w-24 h-24 text-3xl" : "w-11 h-11 text-base";
  const badgeSize = isLg ? "w-7 h-7" : "w-4 h-4";

  // Class helper for borders
  const getBorderClasses = () => {
    switch (selectedBorder) {
      case "border_gold_pulse":
        return "border-[4px] border-amber-400 animate-pulse shadow-[0_0_12px_rgba(251,191,36,0.8)]";
      case "border_silver":
        return "border-[3px] border-slate-300 shadow-[0_0_8px_rgba(203,213,225,0.6)] bg-gradient-to-r from-slate-100 via-slate-300 to-slate-100";
      case "border_green":
        return "border-[3px] border-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.7)] animate-bounce-short";
      case "border_fire":
        return "border-[4px] border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.9)] animate-fire-pulse";
      case "border_rainbow":
        return "border-[4px] border-transparent bg-origin-border bg-clip-content,border-box bg-gradient-to-r from-red-500 via-orange-400 via-yellow-400 via-green-400 via-blue-500 to-purple-500 animate-gradient-spin";
      default:
        // Default Deuna orange border or clean purple
        return "border-2 border-orange-400";
    }
  };

  // Render accessories - adapted tightly to the circular rim of the avatar!
  const renderAccessory = () => {
    // Tighter alignment positions to hug the top curvature of the avatar circle perfectly
    const starOffset = isLg ? "-bottom-0.5 -right-0.5 w-8 h-8" : "-bottom-0 w-0.5 w-5 h-5";
    const diamondOffset = isLg ? "-bottom-0.5 -right-0.5 w-8 h-8" : "-bottom-0 w-0.5 w-5 h-5";

    switch (selectedAccessory) {
      case "accessory_crown":
        return (
          <div 
            className="absolute left-1/2 -translate-x-1/2 z-10 pointer-events-none animate-bounce-slow flex items-center justify-center"
            style={{ 
              width: isLg ? "80px" : "46px", 
              height: isLg ? "64px" : "37px", 
              top: isLg ? "-20px" : "-11px"
            }}
          >
            <svg viewBox="0 0 100 80" className="w-full h-full drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)]">
              {/* Crown Body (Gold) */}
              <path d="M15 60 L 20 30 L 40 45 L 50 20 L 60 45 L 80 30 L 85 60 Z" fill="#F59E0B" stroke="#D97706" strokeWidth="2" strokeLinejoin="round" />
              {/* Highlight in center peak */}
              <path d="M40 45 L 50 20 L 60 45 Z" fill="#FBBF24" />
              {/* Left peak highlight */}
              <path d="M15 60 L 20 30 L 40 45 Z" fill="#FBBF24" opacity="0.6" />
              {/* Base band */}
              <path d="M15 60 C 15 57, 85 57, 85 60 L 83 66 C 83 68, 17 68, 17 66 Z" fill="#D97706" />
              <rect x="17" y="60" width="66" height="6" rx="1" fill="#D97706" />
              {/* Jewels on base band */}
              <circle cx="28" cy="63" r="2.5" fill="#EF4444" />
              <circle cx="50" cy="63" r="2.5" fill="#3B82F6" />
              <circle cx="72" cy="63" r="2.5" fill="#EF4444" />
              {/* Jewels on peaks */}
              <circle cx="20" cy="27" r="4.5" fill="#FBBF24" stroke="#D97706" strokeWidth="1.5" />
              <circle cx="20" cy="27" r="2.5" fill="#EF4444" />
              <circle cx="50" cy="17" r="5.5" fill="#FBBF24" stroke="#D97706" strokeWidth="1.5" />
              <circle cx="50" cy="17" r="3" fill="#3B82F6" />
              <circle cx="80" cy="27" r="4.5" fill="#FBBF24" stroke="#D97706" strokeWidth="1.5" />
              <circle cx="80" cy="27" r="2.5" fill="#EF4444" />
            </svg>
          </div>
        );
      case "accessory_cowboy":
        return (
          <div 
            className="absolute left-1/2 -translate-x-1/2 z-10 pointer-events-none rotate-[-2deg] flex items-center justify-center"
            style={{ 
              width: isLg ? "90px" : "52px", 
              height: isLg ? "54px" : "31px", 
              top: isLg ? "-25px" : "-14px"
            }}
          >
            <svg viewBox="0 0 100 60" className="w-full h-full drop-shadow-[0_2px_3px_rgba(0,0,0,0.25)]">
              {/* Crown Shadow (Left Side) */}
              <path d="M26 40 C 26 22, 38 12, 50 18 C 50 18, 50 40, 50 40 Z" fill="#78350F" />
              {/* Crown Highlight (Right Side) */}
              <path d="M50 18 C 62 12, 74 22, 74 40 L 50 40 Z" fill="#92400E" />
              {/* Crease depth */}
              <path d="M42 16 C 45 19, 55 19, 58 16 C 65 14, 50 10, 50 10 C 50 10, 35 14, 42 16 Z" fill="#451A03" />
              {/* Red Hat Band */}
              <path d="M25 40 C 35 37, 65 37, 75 40 L 73 43 C 63 40, 37 40, 27 43 Z" fill="#EF4444" />
              {/* Gold Buckle */}
              <rect x="47" y="37" width="6" height="5" rx="1" fill="#F59E0B" />
              {/* Brim (Front curves) */}
              <path d="M5 45 C 15 32, 85 32, 95 45 C 95 45, 80 52, 50 52 C 20 52, 5 45, 5 45 Z" fill="#B45309" stroke="#78350F" strokeWidth="1" />
              {/* Brim inner shadow */}
              <path d="M25 42 C 35 40, 65 40, 75 42 C 80 43, 85 45, 95 45 C 95 45, 80 48, 50 48 C 20 48, 5 45, 5 45 C 15 45, 20 43, 25 42 Z" fill="#92400E" opacity="0.4" />
            </svg>
          </div>
        );
      case "accessory_chef":
        return (
          <div 
            className="absolute left-1/2 -translate-x-1/2 z-10 pointer-events-none flex items-center justify-center"
            style={{ 
              width: isLg ? "76px" : "44px", 
              height: isLg ? "61px" : "35px", 
              top: isLg ? "-34px" : "-20px"
            }}
          >
            <svg viewBox="0 0 100 80" className="w-full h-full drop-shadow-[0_2px_3px_rgba(0,0,0,0.2)]">
              {/* Folds shading */}
              <path d="M30 52 C 16 52, 10 32, 26 24 C 24 10, 44 4, 50 14 C 56 4, 76 10, 74 24 C 90 32, 84 52, 70 52 Z" fill="#F3F4F6" stroke="#D1D5DB" strokeWidth="1.5" />
              {/* Center puffy highlight */}
              <path d="M32 52 C 22 52, 18 36, 30 28 C 30 16, 46 10, 50 18 C 54 10, 70 16, 70 28 C 82 36, 78 52, 68 52 Z" fill="#FFFFFF" />
              {/* Detailing lines (creases) */}
              <path d="M34 52 C 34 40, 42 30, 48 30" fill="none" stroke="#E5E7EB" strokeWidth="1.5" />
              <path d="M66 52 C 66 40, 58 30, 52 30" fill="none" stroke="#E5E7EB" strokeWidth="1.5" />
              <path d="M50 52 V 22" fill="none" stroke="#F3F4F6" strokeWidth="2" />
              {/* Cylindrical Base band */}
              <path d="M28 50 C 28 48, 72 48, 72 50 L 70 66 C 70 68, 30 68, 30 66 Z" fill="#E5E7EB" stroke="#D1D5DB" strokeWidth="1.5" />
              <path d="M30 50 L 70 50" stroke="#9CA3AF" strokeWidth="1.5" />
              <path d="M31 56 L 69 56" stroke="#FFFFFF" strokeWidth="1" />
            </svg>
          </div>
        );
      case "accessory_star":
        return (
          <span className={`absolute ${starOffset} z-10 bg-yellow-400 border border-white rounded-full flex items-center justify-center filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.2)] animate-spin-slow pointer-events-none`}>
            ⭐
          </span>
        );
      case "accessory_diamond":
        return (
          <span className={`absolute ${diamondOffset} z-10 bg-cyan-400 border border-white rounded-full flex items-center justify-center filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.2)] pointer-events-none`}>
            💎
          </span>
        );
      default:
        // Default d! badge
        return (
          <div className={`absolute -bottom-0.5 -right-0.5 ${isLg ? "w-8 h-8 text-xs" : "w-5 h-5 text-[9px]"} rounded-full bg-orange-500 flex items-center justify-center border-2 border-white shadow-sm pointer-events-none z-10`}>
            <span className="text-white font-bold">d!</span>
          </div>
        );
    }
  };

  return (
    <div className={`relative flex items-center justify-center ${containerSize}`}>
      {renderAccessory()}
      <div
        className={`rounded-full bg-gradient-to-br from-purple-100 to-orange-100 flex items-center justify-center font-bold text-purple-900 transition-all duration-300 overflow-hidden ${avatarSize} ${getBorderClasses()}`}
      >
        JN
      </div>
    </div>
  );
}
