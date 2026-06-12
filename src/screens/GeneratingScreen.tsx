import { useEffect, useState } from "react";
import { Brain, Cpu, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface GeneratingScreenProps {
  onComplete: () => void;
}

export default function GeneratingScreen({ onComplete }: GeneratingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [thoughtIndex, setThoughtIndex] = useState(0);

  const aiThoughts = [
    "Training your content strategy...",
    "Scanning competitive hook matrices...",
    "Building core story arc & psychological hinges...",
    "Optimizing retention and pattern interrupts...",
    "Blending voice registers and learned style nodes...",
    "Finalizing thumbnail visual concepts...",
    "Injecting viral metadata tags..."
  ];

  useEffect(() => {
    // Progress bar ticking
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            onComplete();
          }, 400);
          return 100;
        }
        const step = Math.floor(Math.random() * 12) + 4;
        return Math.min(prev + step, 100);
      });
    }, 450);

    // Dynamic creator thoughts cycling
    const thoughtTimer = setInterval(() => {
      setThoughtIndex((prev) => (prev + 1) % aiThoughts.length);
    }, 2000);

    return () => {
      clearInterval(timer);
      clearInterval(thoughtTimer);
    };
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-[#050505] flex flex-col justify-between items-center px-6 py-12"
    >
      {/* Top watermark stats */}
      <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#555] uppercase tracking-widest mt-10">
        <Cpu size={12} className="animate-pulse" />
        <span>NANNU NEURAL LINK v3.1</span>
      </div>

      {/* Center glowing animation container */}
      <div className="flex flex-col items-center justify-center w-full max-w-sm text-center">
        {/* Futuristic glowing neural ring */}
        <div className="relative mb-10">
          {/* Outer pink glow loop */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="w-32 h-32 rounded-full border border-[#FF4FD8]/20 border-t-[#FF4FD8] filter blur-[2px] shadow-[0_0_50px_rgba(255,79,216,0.15)]"
          />

          {/* Inner violet counter loop */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
            className="absolute inset-2 rounded-full border border-[#A855F7]/15 border-b-[#A855F7] filter blur-[1px] shadow-[0_0_30px_rgba(168,85,247,0.15)]"
          />

          {/* Core center brain pulse icon */}
          <div className="absolute inset-4 rounded-full bg-[#111111] border border-white/5 flex items-center justify-center">
            <motion.div
              animate={{ scale: [0.9, 1.1, 0.9] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <Brain size={32} className="text-[#FF4FD8]" />
            </motion.div>
          </div>
        </div>

        {/* Progress Percentage */}
        <h3 className="text-4xl font-black font-sans tracking-tight text-white mb-2">
          {progress}%
        </h3>

        {/* Action thought subtitle */}
        <div className="h-6 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={thoughtIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="text-xs font-mono text-[#C8FF5A] tracking-wider uppercase flex items-center gap-1.5"
            >
              <Sparkles size={12} className="shrink-0" />
              <span>{aiThoughts[thoughtIndex]}</span>
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom Loading Bar */}
      <div className="w-full max-w-xs mb-10 flex flex-col gap-2">
        {/* Loading track */}
        <div className="w-full h-1 bg-[#111111] rounded-full overflow-hidden border border-white/5">
          <motion.div
            className="h-full bg-gradient-to-r from-[#FF4FD8] via-[#A855F7] to-[#C8FF5A]"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Estimator timer details */}
        <div className="flex items-center justify-between text-[10px] font-mono text-[#A1A1AA]">
          <span>ESTIMATED WAIT</span>
          <span className="text-[#555]">
            ~0:0{Math.max(0, Math.ceil(3 - (progress / 33)))}s
          </span>
        </div>
      </div>
    </motion.div>
  );
}
