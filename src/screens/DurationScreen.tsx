import { useState, useEffect, ChangeEvent } from "react";
import { ChevronLeft, ChevronRight, Sparkles, Clock } from "lucide-react";
import { motion } from "motion/react";
import GlowCard from "../components/GlowCard";

interface DurationScreenProps {
  onNext: (duration: string) => void;
  onBack: () => void;
  savedDuration: string;
}

export default function DurationScreen({ onNext, onBack, savedDuration }: DurationScreenProps) {
  // Parsing helpers
  const parseDurationToSeconds = (durStr: string): number => {
    if (!durStr) return 45;
    const clean = durStr.toLowerCase().trim();
    
    let sec = 0;
    let min = 0;
    
    const minRegex = /(\d+)\s*(m|min|minute|minutes)/i;
    const secRegex = /(\d+)\s*(s|sec|second|seconds)/i;
    
    const minMatch = clean.match(minRegex);
    if (minMatch) {
      min = parseInt(minMatch[1], 10);
    }
    
    // Remove minutes component before matching seconds to avoid duplicated matches
    const cleanWithoutMin = clean.replace(minRegex, "");
    const secMatch = cleanWithoutMin.match(secRegex);
    if (secMatch) {
      sec = parseInt(secMatch[1], 10);
    } else if (!minMatch) {
      // Old school seconds or raw number parsing fallback
      const rawVal = parseInt(clean, 10);
      if (!isNaN(rawVal)) return rawVal;
    }
    
    const total = min * 60 + sec;
    return total >= 10 ? total : 45;
  };

  const getSecondsFromValue = (x: number): number => {
    if (x <= 50) {
      return 10 + x; // 10s to 60s
    }
    if (x <= 90) {
      return 60 + (x - 50) * 15; // 1m to 11m (step 15s)
    }
    return 660 + (x - 90) * 60; // 11m to 59m (step 1m)
  };

  const getValueFromSeconds = (secs: number): number => {
    if (secs <= 60) {
      return Math.max(0, Math.min(50, secs - 10));
    }
    if (secs <= 660) {
      const x = Math.round((secs - 60) / 15) + 50;
      return Math.max(50, Math.min(90, x));
    }
    const x = Math.round((secs - 660) / 60) + 90;
    return Math.max(90, Math.min(138, x));
  };

  const formatSecondsToReadable = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds} Seconds`;
    }
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    if (sec === 0) {
      return `${min} ${min === 1 ? "Minute" : "Minutes"}`;
    }
    return `${min} ${min === 1 ? "Minute" : "Minutes"} ${sec} ${sec === 1 ? "Second" : "Seconds"}`;
  };

  // Convert saved duration to secondary value state
  const initialSeconds = parseDurationToSeconds(savedDuration);
  const initialSliderValue = getValueFromSeconds(initialSeconds);

  const [sliderValue, setSliderValue] = useState<number>(initialSliderValue);
  const [currentSeconds, setCurrentSeconds] = useState<number>(initialSeconds);

  // Sync internal state with slider change
  const handleSliderChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setSliderValue(val);
    setCurrentSeconds(getSecondsFromValue(val));
  };

  const readableDuration = formatSecondsToReadable(currentSeconds);

  // Determine dynamic highlight colors based on values (ranges)
  const isShortValue = currentSeconds < 60;
  const isMidValue = currentSeconds >= 60 && currentSeconds < 600;

  // Percentage of track filled for styling linear-gradient
  const percentage = (sliderValue / 138) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col flex-1 pb-16"
    >
      {/* Header Controls */}
      <div className="flex items-center gap-1 mb-6 text-xs font-mono text-[#A1A1AA]">
        <button onClick={onBack} className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer">
          <ChevronLeft size={16} />
          <span>BACK</span>
        </button>
        <span className="text-white/20">/</span>
        <span className="text-white font-mono uppercase tracking-wider">Step 1 of 2</span>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-normal font-sans tracking-tight text-white mb-2">
          Select Content Duration
        </h2>
        <p className="text-sm text-[#A1A1AA] font-sans">
          Choose exactly how long your content should be.
        </p>
      </div>

      {/* Main Premium Interactive Slider Panel */}
      <div className="mb-6">
        <GlowCard
          id="duration-interactive-panel"
          glowColor={isShortValue ? "pink" : isMidValue ? "purple" : "green"}
          className="p-6 bg-[#111111]/85 border border-white/5 rounded-2xl flex flex-col justify-center items-center text-center space-y-6 relative overflow-hidden"
        >
          {/* Real-time formatted readout with premium typography */}
          <div className="flex flex-col items-center select-none py-4">
            <span className="text-[10px] uppercase font-mono tracking-widest text-[#A1A1AA]/50 mb-1.5 flex items-center gap-1">
              <Clock size={11} className="text-[#A855F7]" />
              <span>Target Length Limit</span>
            </span>
            <span className="text-3xl font-normal font-sans tracking-tight text-white flex items-baseline gap-1">
              <span className="font-extrabold text-[#C8FF5A]">
                {readableDuration.split(" ")[0]}
              </span>{" "}
              {readableDuration.split(" ")[1]}{" "}
              {readableDuration.split(" ").slice(2).map((part, idx) => {
                const isNum = !isNaN(parseInt(part));
                return (
                  <span
                    key={idx}
                    className={`ml-1 ${isNum ? "font-extrabold text-[#C8FF5A]" : "text-white font-normal"}`}
                  >
                    {part}
                  </span>
                );
              })}
            </span>
          </div>

          {/* Precision slider interface */}
          <div className="w-full space-y-3 px-2">
            <input
              id="duration-range-slider"
              type="range"
              min="0"
              max="138"
              value={sliderValue}
              onChange={handleSliderChange}
              style={{
                background: `linear-gradient(to right, #C8FF5A 0%, #A855F7 ${percentage}%, rgba(255,255,255,0.08) ${percentage}%, rgba(255,255,255,0.08) 100%)`
              }}
              className="w-full h-1.5 rounded-lg appearance-none cursor-ew-resize outline-none transition-all duration-150 relative"
            />

            {/* Custom slider ticks and bounds */}
            <div className="flex justify-between items-center text-[10px] font-mono text-[#A1A1AA]/40 tracking-wider">
              <span>10s</span>
              <div className="flex items-center gap-4">
                <span className={sliderValue >= 50 ? "text-[#C8FF5A]/72 font-bold" : ""}>1m</span>
                <span className={sliderValue >= 82 ? "text-[#A855F7]/72 font-bold" : ""}>5m</span>
                <span className={sliderValue >= 109 ? "text-[#A855F7]/72 font-bold" : ""}>30m</span>
              </div>
              <span>59m</span>
            </div>
          </div>
        </GlowCard>
      </div>

      {/* Agnostic Content Duration Disclaimer Layout */}
      <div className="mb-8">
        <div className="p-5 rounded-2xl bg-[#111111] border border-white/5 space-y-4">
          <div className="flex items-center gap-1.5 text-xs font-mono text-[#C8FF5A]/90 uppercase tracking-wider text-left">
            <Sparkles size={13} className="text-[#C8FF5A]" />
            <span>Content-Agnostic Duration</span>
          </div>
          <p className="text-xs text-[#A1A1AA] leading-relaxed text-left font-sans">
            Duration defines content length only. The system never limits style, objective, or platform fit based on length. Any objective can run at any speed.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-left text-[11px] leading-relaxed font-sans">
            <div className="p-3.5 bg-black/40 rounded-xl border border-white/[0.03]">
              <span className="font-bold text-white block mb-1.5">A 15-Second video can be:</span>
              <span className="text-[#A1A1AA] block leading-normal font-sans">
                Storytelling • Problem → Solution → CTA • Educational • Brutal Truth • Roast • Luxury • Motivational • Personal Story
              </span>
            </div>
            <div className="p-3.5 bg-black/40 rounded-xl border border-white/[0.03]">
              <span className="font-bold text-white block mb-1.5">A 10-Minute video can also be:</span>
              <span className="text-[#A1A1AA] block leading-normal font-sans">
                Storytelling • Problem → Solution → CTA • Educational • Brutal Truth • Roast • Luxury • Motivational • Personal Story
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <motion.button
        id="duration-continue-cta"
        whileTap={{ scale: 0.96 }}
        onClick={() => onNext(readableDuration)}
        className="w-full mt-auto py-4 px-6 rounded-2xl bg-white text-black font-bold font-sans flex items-center justify-center gap-2 hover:brightness-115 active:scale-[0.98] transition-all shadow-lg cursor-pointer"
      >
        <span>Continue</span>
        <ChevronRight size={18} />
      </motion.button>
    </motion.div>
  );
}
