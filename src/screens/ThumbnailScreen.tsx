import { useState } from "react";
import { ChevronLeft, LayoutGrid, Image, ClipboardCheck, Heading } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import GlowCard from "../components/GlowCard";
import { trackCopyAction } from "../utils/preferences";

interface ThumbnailScreenProps {
  thumbnails: {
    title: string;
    description: string;
  }[];
  onBack: () => void;
  prompt?: string;
  mood?: string;
  contentType?: string;
}

export default function ThumbnailScreen({
  thumbnails,
  onBack,
  prompt = "",
  mood = "Confident 😎",
  contentType = "Talking Head"
}: ThumbnailScreenProps) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [copied, setCopied] = useState<string | null>(null);

  const mockCovers = [
    "from-[#FF4FD8]/20 via-[#111111] to-[#050505]",
    "from-[#A855F7]/20 via-[#111111] to-[#050505]",
    "from-[#C8FF5A]/10 via-[#111111] to-[#050505]"
  ];

  const triggerCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      trackCopyAction({ prompt, mood, contentType });
      setTimeout(() => setCopied(null), 1500);
    }).catch(() => {
      setCopied(key);
      trackCopyAction({ prompt, mood, contentType });
      setTimeout(() => setCopied(null), 1500);
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="flex flex-col flex-1 pb-24"
    >
      {/* Header controls */}
      <div className="flex items-center gap-1 mb-5 text-xs font-mono text-[#A1A1AA]">
        <button onClick={onBack} className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer">
          <ChevronLeft size={16} />
          <span>BACK TO SCRIPT</span>
        </button>
      </div>

      <div className="mb-5">
        <h2 className="text-2xl font-black font-sans tracking-tight text-white uppercase">Thumbnail Ideas</h2>
        <p className="text-xs text-[#A1A1AA] font-sans">
          Click concepts to reveal high-retention layout details and typography tricks.
        </p>
      </div>

      {/* Visual Cover Carousel Showcase (Luxury Design-vibe) */}
      <div className="relative h-64 mb-6 rounded-2xl overflow-hidden border border-white/5 bg-[#111111] select-none p-6 flex flex-col justify-between">
        {/* Glowing background gradient reflecting active design choice */}
        <div className={`absolute inset-0 bg-gradient-to-b ${mockCovers[selectedIdx % mockCovers.length]} pointer-events-none transition-all duration-700`} />

        {/* Custom luxury watermark elements */}
        <div className="relative flex justify-between items-center text-[8px] font-mono tracking-widest text-[#A1A1AA]/50 uppercase">
          <span>NANNU DESIGN SYSTEM ⚡</span>
          <span>CONCEPT #{selectedIdx + 1}</span>
        </div>

        {/* Huge mock layout overlay */}
        <div className="relative text-left my-auto px-4 py-3 border-l-2 border-[#C8FF5A] z-10 bg-black/35 backdrop-blur-sm rounded-r-xl">
          <span className="text-[9px] font-mono text-[#C8FF5A] tracking-widest uppercase font-semibold block mb-1">
            ON-SCREEN TEXT
          </span>
          <h3 className="text-xl font-bold font-sans tracking-tight text-white leading-snug uppercase">
            {thumbnails[selectedIdx]?.title || "How to get clients with 0 followers"}
          </h3>
        </div>

        {/* Action tags */}
        <div className="relative flex justify-between items-center text-[10px] font-mono text-[#A1A1AA] z-10">
          <span className="bg-black/50 px-2 py-1 rounded border border-white/5">
            STYLE: ADVANCED GLOW
          </span>
          <span className="text-white/40">RATIO: 9:16</span>
        </div>
      </div>

      {/* Concepts Selector Cards */}
      <div className="flex flex-col gap-3">
        {thumbnails.map((t, idx) => {
          const isActive = selectedIdx === idx;
          const isCopied = copied === `title-${idx}`;

          return (
            <div
              key={idx}
              onClick={() => setSelectedIdx(idx)}
              className="w-full text-left"
            >
              <GlowCard
                id={`thumb-concept-card-${idx}`}
                glowColor={isActive ? "green" : "none"}
                className={`p-4.5 transition-all duration-300 relative ${
                  isActive
                    ? "bg-[#111111] border-[#C8FF5A]/45 shadow-[0_0_15px_rgba(200,255,90,0.06)]"
                    : "bg-[#111111]/70 border-white/5 active:bg-[#111111]"
                }`}
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`p-2 rounded-lg transition-colors duration-300 ${
                        isActive ? "bg-[#C8FF5A]/10 text-[#C8FF5A]" : "bg-white/5 text-[#A1A1AA]"
                      }`}
                    >
                      <LayoutGrid size={15} />
                    </div>
                    <span className="text-xs font-mono uppercase tracking-wider text-[#A1A1AA]">
                      Layout Concept {idx + 1}
                    </span>
                  </div>

                  {/* Copy hook button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerCopy(t.title, `title-${idx}`);
                    }}
                    className="p-1 px-2 rounded-md bg-white/5 hover:bg-white/10 text-[10px] font-mono text-[#A1A1AA] hover:text-white transition-colors"
                  >
                    {isCopied ? "COPIED!" : "COPY TEXT"}
                  </button>
                </div>

                <h4 className="text-sm font-bold text-white mb-2 leading-snug">
                  "{t.title}"
                </h4>

                <p className="text-xs text-[#A1A1AA]/80 leading-relaxed font-sans pl-1.5 border-l border-white/10">
                  {t.description}
                </p>

                {isActive && (
                  <motion.div
                    layoutId="thumb-active-dot"
                    className="absolute top-4.5 right-4.5 w-2 h-2 bg-[#C8FF5A] rounded-full"
                    style={{ boxShadow: "0 0 10px #C8FF5A" }}
                  />
                )}
              </GlowCard>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
