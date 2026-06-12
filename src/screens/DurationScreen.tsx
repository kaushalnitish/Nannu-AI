import { useState, useEffect } from "react";
import { ChevronLeft, Sparkles, Clock, ArrowRight, Video, BookOpen, Layers, Camera, ListOrdered, Smile, MessageCircle, User, Award, DollarSign, Zap, Mic, Play, HelpCircle } from "lucide-react";
import { motion } from "motion/react";
import GlowCard from "../components/GlowCard";

interface DurationScreenProps {
  onBack: () => void;
  onGenerate: (type: string) => void;
  savedDuration: string;
  onDurationChange: (dur: string) => void;
  savedContentType: string;
  onContentTypeChange: (type: string) => void;
  savedMood: string;
  onMoodChange: (mood: string) => void;
  prompt: string;
}

const DURATION_POINTS = [
  "15 Seconds",
  "30 Seconds",
  "45 Seconds",
  "60 Seconds",
  "90 Seconds",
  "3 Minutes",
  "5 Minutes"
];

// Helper to get nearest index
const getDurationIndex = (durStr: string): number => {
  if (!durStr) return 2; // Default to 45s
  const index = DURATION_POINTS.findIndex(p => p.toLowerCase().includes(durStr.toLowerCase().split(" ")[0]));
  return index !== -1 ? index : 2;
};

export default function DurationScreen({
  onBack,
  onGenerate,
  savedDuration,
  onDurationChange,
  savedContentType,
  onContentTypeChange,
  savedMood,
  onMoodChange,
  prompt
}: DurationScreenProps) {
  // Snapping Slider State
  const [sliderIndex, setSliderIndex] = useState<number>(getDurationIndex(savedDuration));

  // Sync state updates
  useEffect(() => {
    onDurationChange(DURATION_POINTS[sliderIndex]);
  }, [sliderIndex]);

  // Curated list of all 13 Content Formats with icons and descriptions
  const formats = [
    { name: "Talking Head", emoji: "🎙️", color: "#FF4FD8", desc: "Aesthetic focus, bold headers, raw punchy lines" },
    { name: "Storytelling", emoji: "📖", color: "#A855F7", desc: "Hero journey, vulnerability curve, filmic cues" },
    { name: "POV", emoji: "🎥", color: "#C8FF5A", desc: "First-person immersive view, relatable commentary bubble" },
    { name: "Carousel", emoji: "📱", color: "#3B82F6", desc: "10-slide high retention swipe graphic concepts" },
    { name: "Opinion", emoji: "💬", color: "#10B981", desc: "Unpopular perspective, spicy pattern interrupt" },
    { name: "Educational", emoji: "💡", color: "#F59E0B", desc: "Step-by-step breakdown, high value density" },
    { name: "List Style", emoji: "📊", color: "#EF4444", desc: "Curated value resources, rapid sequence ticks" },
    { name: "Case Study", emoji: "🔍", color: "#EC4899", desc: "Before/after stats, direct evidence, teardowns" },
    { name: "Personal Brand", emoji: "🤝", color: "#6366F1", desc: "Unfiltered lesson, founder mindset shifts" },
    { name: "Authority Building", emoji: "👑", color: "#8B5CF6", desc: "Credibility cues, expert high-status language" },
    { name: "Product Pitch", emoji: "💸", color: "#C8FF5A", desc: "Problem, bottleneck, solution, call to action" },
    { name: "Viral Hook", emoji: "🔥", color: "#FF4FD8", desc: "Instant pattern interrupt, high-pacing split" },
    { name: "Podcast Style", emoji: "🎧", color: "#3B82F6", desc: "Conversational audio, micro-mic simulation" }
  ];

  // List of all 17 Creator Tones
  const tones = [
    { name: "Confident 😎", style: "border-emerald-500/20 hover:border-emerald-500/40 text-emerald-300" },
    { name: "Funny 😂", style: "border-yellow-500/20 hover:border-yellow-500/40 text-yellow-300" },
    { name: "Emotional 🥺", style: "border-sky-500/20 hover:border-sky-500/40 text-sky-300" },
    { name: "Motivational ⚡", style: "border-amber-500/20 hover:border-amber-500/40 text-amber-300" },
    { name: "Inspirational ✨", style: "border-fuchsia-500/20 hover:border-fuchsia-500/40 text-fuchsia-300" },
    { name: "Storyteller 📖", style: "border-purple-500/20 hover:border-purple-500/40 text-purple-300" },
    { name: "Savage 🌶️", style: "border-rose-500/20 hover:border-rose-500/40 text-rose-300" },
    { name: "Roast 🔥", style: "border-red-500/20 hover:border-red-500/40 text-red-300" },
    { name: "Educational 💡", style: "border-teal-500/20 hover:border-teal-500/40 text-teal-300" },
    { name: "Luxury 💎", style: "border-indigo-500/20 hover:border-indigo-500/40 text-indigo-300" },
    { name: "Casual 👟", style: "border-neutral-500/20 hover:border-neutral-500/40 text-neutral-300" },
    { name: "High Energy 🚀", style: "border-orange-500/20 hover:border-orange-500/40 text-orange-300" },
    { name: "Authority ⚖️", style: "border-blue-500/20 hover:border-blue-500/40 text-blue-300" },
    { name: "Friendly 🤝", style: "border-green-500/20 hover:border-green-500/40 text-green-300" },
    { name: "Controversial 💥", style: "border-red-500/30 hover:border-red-500/50 text-red-400" },
    { name: "Deep 🧠", style: "border-violet-500/20 hover:border-violet-500/40 text-violet-300" },
    { name: "Reflective 💭", style: "border-pink-500/20 hover:border-pink-500/40 text-pink-300" }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col flex-1 pb-24 font-sans"
    >
      {/* Step Progress Top Header */}
      <div className="flex items-center justify-between mb-5 text-xs font-mono text-[#A1A1AA]">
        <button onClick={onBack} className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer font-bold select-none">
          <ChevronLeft size={16} />
          <span>BACK</span>
        </button>
        <span className="text-[#A855F7] font-bold uppercase tracking-widest bg-[#A855F7]/10 px-2.5 py-1 rounded-full border border-[#A855F7]/20 select-none">
          STEP 2 OF 2
        </span>
      </div>

      {/* Screen Lead Title */}
      <div className="mb-5 text-left">
        <h2 className="text-xl font-bold font-sans tracking-tight text-white mb-1">
          Creator Configuration
        </h2>
        <p className="text-xs text-[#A1A1AA]">
          Tune the format pacing, tone delivery, and duration framework.
        </p>
      </div>

      {/* In-context Topic Preview Banner (Apple/Linear style) */}
      <div className="mb-6 p-4 rounded-xl bg-white/[0.02] border border-white/5 flex gap-3 items-center select-none text-left">
        <div className="p-2 rounded-lg bg-[#FF4FD8]/10 text-[#FF4FD8] shrink-0">
          <Sparkles size={16} className="animate-pulse" />
        </div>
        <div className="overflow-hidden">
          <span className="text-[9px] font-mono uppercase tracking-widest text-white/40 block">Tuning Topic Focus</span>
          <span className="text-xs text-white/90 font-medium truncate block mt-0.5">
            "{prompt || "Custom Topic Generation"}"
          </span>
        </div>
      </div>

      {/* SECTION 1: DURATION CONTROL (Snapping Slider) */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2 select-none">
          <h3 className="text-xs font-mono text-white/80 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Clock size={13} className="text-[#C8FF5A]" />
            <span>Target Duration</span>
          </h3>
          <span className="text-xs font-mono font-bold text-[#C8FF5A] bg-[#C8FF5A]/10 border border-[#C8FF5A]/20 px-2.5 py-0.5 rounded-full shadow-[0_0_10px_rgba(200,255,90,0.1)]">
            {DURATION_POINTS[sliderIndex]}
          </span>
        </div>

        <GlowCard id="config-duration-slider-card" glowColor="green" className="p-5.5 bg-[#0e0e0e]/95 border-white/10 rounded-xl relative overflow-hidden flex flex-col justify-center">
          <div className="w-full space-y-4">
            <input
              id="duration-snapping-slider"
              type="range"
              min="0"
              max="6"
              step="1"
              value={sliderIndex}
              onChange={(e) => setSliderIndex(parseInt(e.target.value, 10))}
              style={{
                background: `linear-gradient(to right, #C8FF5A 0%, #A855F7 ${(sliderIndex / 6) * 100}%, rgba(255,255,255,0.06) ${(sliderIndex / 6) * 100}%, rgba(255,255,255,0.06) 100%)`
              }}
              className="w-full h-2 rounded-lg appearance-none cursor-ew-resize outline-none transition-all duration-150"
            />

            {/* Custom slider snapping points marks */}
            <div className="flex justify-between items-center text-[9px] font-mono font-bold text-white/30 tracking-wider">
              {DURATION_POINTS.map((pt, idx) => {
                const isActive = idx === sliderIndex;
                const matchesSaved = pt === savedDuration;
                return (
                  <span
                    key={idx}
                    className={`transition-colors duration-200 select-none ${
                      isActive 
                        ? "text-[#C8FF5A] font-black scale-105" 
                        : matchesSaved 
                        ? "text-white/60" 
                        : "hover:text-white/50"
                    }`}
                  >
                    {pt.replace(" Seconds", "s").replace(" Minutes", "m")}
                  </span>
                );
              })}
            </div>
          </div>
        </GlowCard>
      </div>

      {/* SECTION 2: CONTENT FORMAT (13 Curated Formats) */}
      <div className="mb-6">
        <h3 className="text-xs font-mono text-white/80 font-bold uppercase tracking-wider mb-2.5 flex items-center gap-1.5 select-none">
          <Layers size={13} className="text-[#FF4FD8]" />
          <span>Content Format ({formats.length})</span>
        </h3>

        {/* Dense scrolling list or grid of formats */}
        <div className="grid grid-cols-1 select-none gap-2 max-h-[220px] overflow-y-auto pr-1.5 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {formats.map((fmt) => {
            const isSelected = savedContentType === fmt.name;
            return (
              <button
                id={`format-btn-${fmt.name.toLowerCase().replace(" ", "-")}`}
                key={fmt.name}
                type="button"
                onClick={() => onContentTypeChange(fmt.name)}
                className={`w-full text-left p-3 rounded-xl border transition-all duration-300 flex items-center justify-between cursor-pointer ${
                  isSelected
                    ? "bg-[#FF4FD8]/10 border-[#FF4FD8] shadow-[0_0_12px_rgba(255,79,216,0.15)]"
                    : "bg-[#111111]/80 border-white/5 hover:border-white/10 hover:bg-[#151515]"
                }`}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-lg select-none shrink-0 border border-white/5">
                    {fmt.emoji}
                  </div>
                  <div className="overflow-hidden">
                    <h4 className="text-xs font-bold text-white tracking-wide">{fmt.name}</h4>
                    <p className="text-[10px] text-[#A1A1AA] truncate mt-0.5 leading-tight">{fmt.desc}</p>
                  </div>
                </div>
                {isSelected && (
                  <span className="text-[9px] font-mono text-[#FF4FD8] font-bold bg-[#FF4FD8]/10 px-1.5 py-0.5 rounded border border-[#FF4FD8]/25 shrink-0 ml-1">
                    ACTIVE
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION 3: TONE & DELIVERY (17 Tones) */}
      <div className="mb-8">
        <h3 className="text-xs font-mono text-white/80 font-bold uppercase tracking-wider mb-2.5 flex items-center gap-1.5 select-none">
          <Smile size={13} className="text-violet-400" />
          <span>Tone & Delivery Mood ({tones.length})</span>
        </h3>

        <div className="flex flex-wrap gap-1.5 select-none max-h-[160px] overflow-y-auto pr-1">
          {tones.map((t) => {
            const isSelected = savedMood === t.name;
            return (
              <button
                id={`tone-pill-${t.name.split(" ")[0].toLowerCase()}`}
                key={t.name}
                type="button"
                onClick={() => onMoodChange(t.name)}
                className={`text-[10px] px-3 py-1.5 rounded-lg border transition-all duration-300 font-sans font-semibold cursor-pointer ${
                  isSelected
                    ? "bg-white text-black border-white font-extrabold shadow-[0_0_15px_rgba(255,255,255,0.4)] scale-102"
                    : `bg-[#111111]/60 border-white/5 ${t.style}`
                }`}
              >
                {t.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main ACTION BUTTON: GENERATE AI SCRIPT */}
      <motion.button
        id="format-generate-cta"
        whileTap={{ scale: 0.96 }}
        onClick={() => onGenerate(savedContentType)}
        className="w-full mt-auto py-4 px-6 rounded-2xl bg-[#C8FF5A] text-black font-extrabold font-sans flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all duration-300 shadow-[0_0_25px_rgba(200,255,90,0.35)] cursor-pointer"
      >
        <span>Generate AI Script</span>
        <Sparkles size={18} className="animate-pulse" />
      </motion.button>
    </motion.div>
  );
}
