import React from "react";
import { motion } from "motion/react";

interface GlowCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: "pink" | "purple" | "green" | "none";
  onClick?: () => void;
  id?: string;
}

export default function GlowCard({
  children,
  className = "",
  glowColor = "none",
  onClick,
  id
}: GlowCardProps) {
  const getGlowStyles = () => {
    switch (glowColor) {
      case "pink":
        return "hover:shadow-[0_0_25px_rgba(255,79,216,0.15)] border-[#FF4FD8]/20 focus-within:border-[#FF4FD8]/40";
      case "purple":
        return "hover:shadow-[0_0_25px_rgba(168,85,247,0.15)] border-[#A855F7]/20 focus-within:border-[#A855F7]/40";
      case "green":
        return "hover:shadow-[0_0_25px_rgba(200,255,90,0.2)] border-[#C8FF5A]/20 focus-within:border-[#C8FF5A]/40";
      default:
        return "border-[#ffffff]/5 hover:border-[#ffffff]/10";
    }
  };

  return (
    <motion.div
      id={id}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      onClick={onClick}
      className={`bg-[#111111] backdrop-blur-md border rounded-2xl p-4 transition-all duration-300 ${getGlowStyles()} ${
        onClick ? "cursor-pointer active:bg-[#151515]" : ""
      } ${className}`}
    >
      {children}
    </motion.div>
  );
}
