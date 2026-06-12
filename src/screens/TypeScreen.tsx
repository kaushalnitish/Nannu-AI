import { useState } from "react";
import { ChevronLeft, Sparkles, Video, BookOpen, Layers, Camera, ListOrdered, Smile } from "lucide-react";
import { motion } from "motion/react";
import GlowCard from "../components/GlowCard";

interface TypeScreenProps {
  onGenerate: (type: string) => void;
  onBack: () => void;
  savedType: string;
}

export default function TypeScreen({ onGenerate, onBack, savedType }: TypeScreenProps) {
  const types = [
    { name: "Talking Head", icon: Video, color: "#FF4FD8", desc: "Aesthetic lens focus, bold headers, raw punchy lines" },
    { name: "Storytelling", icon: BookOpen, color: "#A855F7", desc: "Hero journey, vulnerability curve, filmic transition cues" },
    { name: "Carousel", icon: Layers, color: "#C8FF5A", desc: "10-slide high retention swipe graphic concepts & hooks" },
    { name: "POV", icon: Camera, color: "#FF4FD8", desc: "First-person immersive view, relatable commentary text bubble" },
    { name: "List Style", icon: ListOrdered, color: "#A855F7", desc: "Curated value resources, fast pacing, rapid sequence ticks" },
    { name: "Opinion", icon: Smile, color: "#C8FF5A", desc: "Unpopular perspective, spicy pattern interrupt, comments driver" }
  ];

  const [selected, setSelected] = useState(savedType || "Talking Head");

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col flex-1 pb-24"
    >
      {/* Header Controls */}
      <div className="flex items-center gap-1 mb-6 text-xs font-mono text-[#A1A1AA]">
        <button onClick={onBack} className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer">
          <ChevronLeft size={16} />
          <span>BACK</span>
        </button>
        <span className="text-white/20">/</span>
        <span className="text-white">STEP 2 OF 2</span>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-bold font-sans tracking-tight text-white mb-2">
          Select Content Format
        </h2>
        <p className="text-sm text-[#A1A1AA] font-sans">
          Nannu AI optimizes hook mechanics per format structural limits.
        </p>
      </div>

      {/* Grid of Large Cards */}
      <div className="grid grid-cols-2 gap-3.5 mb-8">
        {types.map((t) => {
          const Icon = t.icon;
          const isActive = selected === t.name;

          return (
            <div key={t.name} onClick={() => setSelected(t.name)}>
              <GlowCard
                id={`type-card-${t.name.replace(" ", "-")}`}
                glowColor={isActive ? "pink" : "none"}
                className={`h-40 flex flex-col justify-between p-4.5 transition-all duration-300 relative ${
                  isActive
                    ? "bg-[#FF4FD8]/5 border-[#FF4FD8]/50 shadow-[0_0_15px_rgba(255,79,216,0.1)]"
                    : "bg-[#111111]/80 border-white/5"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className="p-2 rounded-xl transition-all duration-300 border border-white/5"
                      style={{
                        backgroundColor: isActive ? `${t.color}15` : "rgba(255,255,255,0.02)",
                        color: isActive ? t.color : "#A1A1AA"
                      }}
                    >
                      <Icon size={18} />
                    </div>
                    {isActive && (
                      <span className="text-[10px] font-mono text-[#FF4FD8] font-bold">READY</span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-white mb-1">{t.name}</h3>
                  <p className="text-[10px] text-[#A1A1AA]/75 leading-relaxed font-sans">
                    {t.desc}
                  </p>
                </div>

                {isActive && (
                  <motion.div
                    layoutId="type-active-indicator"
                    className="absolute inset-0 rounded-2xl border-2 border-[#FF4FD8] pointer-events-none"
                  />
                )}
              </GlowCard>
            </div>
          );
        })}
      </div>

      {/* Bottom CTA to generate */}
      <motion.button
        id="type-generate-cta"
        whileTap={{ scale: 0.96 }}
        onClick={() => onGenerate(selected)}
        className="w-full mt-auto py-4 px-6 rounded-2xl bg-[#C8FF5A] text-black font-bold font-sans flex items-center justify-center gap-2 hover:brightness-110 shadow-[0_0_20px_rgba(200,255,90,0.3)] transition-all duration-300"
      >
        <span>Generate AI Script</span>
        <Sparkles size={18} />
      </motion.button>
    </motion.div>
  );
}
