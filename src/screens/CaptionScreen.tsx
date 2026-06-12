import { useState } from "react";
import { ChevronLeft, Copy, ClipboardCheck, Sparkles, Smile, RefreshCw, Layers } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import GlowCard from "../components/GlowCard";
import { trackCopyAction } from "../utils/preferences";

interface CaptionScreenProps {
  captions: string[];
  onBack: () => void;
  onModify: (mode: "shorten" | "viral" | "standard") => void;
  isModifying: boolean;
  prompt?: string;
  mood?: string;
  contentType?: string;
}

export default function CaptionScreen({
  captions,
  onBack,
  onModify,
  isModifying,
  prompt = "",
  mood = "Confident 😎",
  contentType = "Talking Head"
}: CaptionScreenProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(captions[activeIdx] || "").then(() => {
      setCopied(true);
      trackCopyAction({ prompt, mood, contentType });
      setTimeout(() => setCopied(false), 1800);
    }).catch(() => {
      setCopied(true);
      trackCopyAction({ prompt, mood, contentType });
      setTimeout(() => setCopied(false), 1800);
    });
  };

  const handleModeChange = (mode: "shorten" | "viral" | "standard", index: number) => {
    setActiveIdx(index);
    onModify(mode);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col flex-1 pb-24"
    >
      {/* Header controls */}
      <div className="flex items-center gap-1 mb-5 text-xs font-mono text-[#A1A1AA]">
        <button onClick={onBack} className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer">
          <ChevronLeft size={16} />
          <span>BACK TO SCRIPT</span>
        </button>
      </div>

      <div className="mb-4">
        <h2 className="text-2xl font-black font-sans tracking-tight text-white uppercase">Viral Captions</h2>
        <p className="text-xs text-[#A1A1AA] font-sans">
          Nannu’s AI captions feature highly optimized line-breaks and engagement triggers.
        </p>
      </div>

      {/* Slide switcher / Selector */}
      <div className="flex gap-2 mb-4">
        {["Standard Concept", "Curiosity Loop", "Viral Slang"].map((label, idx) => (
          <button
            key={idx}
            onClick={() => setActiveIdx(idx)}
            className={`flex-1 py-2 rounded-xl text-[10px] font-bold font-mono uppercase border transition-all duration-300 ${
              activeIdx === idx
                ? "bg-[#C8FF5A]/15 border-[#C8FF5A] text-[#C8FF5A] shadow-[0_0_10px_rgba(200,255,90,0.1)]"
                : "bg-[#111111] border-white/5 text-[#A1A1AA] hover:text-white"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Main caption container */}
      <GlowCard glowColor="pink" className="p-5.5 bg-[#111111]/90 border-white/5 relative mb-6 min-h-[170px] flex flex-col justify-between">
        <div className="flex items-center justify-between text-[10px] font-mono text-[#555] mb-2">
          <span>CAPTION OUTPUT</span>
          <Smile size={14} className="text-[#FF4FD8]" />
        </div>

        <div className="h-full relative overflow-hidden flex-1 flex py-2">
          <AnimatePresence mode="wait">
            <motion.p
              key={activeIdx + isModifying.toString()}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="text-sm font-sans text-white leading-relaxed whitespace-pre-line"
            >
              {isModifying ? "Optimizing narrative parameters..." : captions[activeIdx] || "No caption loaded."}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Copy Button */}
        <motion.button
          id="caption-copy-btn"
          whileTap={{ scale: 0.95 }}
          onClick={handleCopy}
          className="w-full mt-4 py-3 rounded-xl bg-white/5 border border-white/5 font-sans font-bold text-xs flex items-center justify-center gap-2 text-white hover:bg-white/10 transition-colors"
        >
          {copied ? <ClipboardCheck size={14} className="text-[#C8FF5A]" /> : <Copy size={13} />}
          <span>{copied ? "COPIED TO CLIPBOARD!" : "COPY CAPTION"}</span>
        </motion.button>
      </GlowCard>

      {/* Caption modifier action panels */}
      <div>
        <h4 className="text-xs font-mono text-[#A1A1AA] uppercase tracking-wider mb-3">
          Tweak with AI Modifiers
        </h4>

        <div className="flex flex-col gap-3">
          {/* Make Viral Option */}
          <div
            onClick={() => handleModeChange("viral", activeIdx)}
            className="flex items-center justify-between p-4 bg-[#111111]/90 rounded-2xl border border-white/5 hover:border-[#FF4FD8]/20 cursor-pointer transition-all duration-300"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[#FF4FD8]/10 text-[#FF4FD8]">
                <Sparkles size={16} />
              </div>
              <div className="text-left">
                <h5 className="text-sm font-bold text-white">Make Viral</h5>
                <p className="text-[10px] text-[#A1A1AA]">Inject highly engaging slang, emoji hooks, & tags</p>
              </div>
            </div>
            <RefreshCw size={14} className={`text-white/30 ${isModifying && activeIdx === 1 ? "animate-spin" : ""}`} />
          </div>

          {/* Shorten Option */}
          <div
            onClick={() => handleModeChange("shorten", activeIdx)}
            className="flex items-center justify-between p-4 bg-[#111111]/90 rounded-2xl border border-white/5 hover:border-[#A855F7]/20 cursor-pointer transition-all duration-300"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[#A855F7]/10 text-[#A855F7]">
                <Layers size={16} />
              </div>
              <div className="text-left">
                <h5 className="text-sm font-bold text-white">Shorten Caption</h5>
                <p className="text-[10px] text-[#A1A1AA]">Trim the fluff, optimize layout for Reels preview window</p>
              </div>
            </div>
            <RefreshCw size={14} className={`text-white/30 ${isModifying && activeIdx === 0 ? "animate-spin" : ""}`} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
