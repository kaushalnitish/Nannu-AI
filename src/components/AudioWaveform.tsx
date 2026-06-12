import { useEffect, useState } from "react";
import { motion } from "motion/react";

interface AudioWaveformProps {
  isAnimating: boolean;
  color?: string;
  numberOfBars?: number;
}

export default function AudioWaveform({
  isAnimating,
  color = "#FF4FD8",
  numberOfBars = 18
}: AudioWaveformProps) {
  const [heights, setHeights] = useState<number[]>([]);

  useEffect(() => {
    // Generate initial flat heights
    setHeights(Array(numberOfBars).fill(6));
  }, [numberOfBars]);

  useEffect(() => {
    if (!isAnimating) {
      setHeights(Array(numberOfBars).fill(6));
      return;
    }

    const interval = setInterval(() => {
      setHeights(
        Array.from({ length: numberOfBars }, () =>
          Math.floor(Math.random() * 26) + 6
        )
      );
    }, 120);

    return () => clearInterval(interval);
  }, [isAnimating, numberOfBars]);

  return (
    <div className="flex items-center justify-between h-12 w-full px-2 bg-black/40 rounded-xl overflow-hidden border border-white/5">
      <div className="flex items-center justify-center gap-1.5 w-full h-8">
        {heights.map((h, i) => (
          <motion.div
            key={i}
            animate={{ height: `${h}px` }}
            transition={{ type: "spring", stiffness: 350, damping: 15 }}
            style={{
              backgroundColor: color,
              width: "3px",
              borderRadius: "4px",
              boxShadow: isAnimating ? `0 0 10px ${color}` : "none",
              opacity: isAnimating ? 0.9 : 0.4
            }}
          />
        ))}
      </div>
    </div>
  );
}
