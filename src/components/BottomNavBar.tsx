import { Sparkles, PlusCircle, Layers, UserCircle } from "lucide-react";
import { motion } from "motion/react";

interface BottomNavBarProps {
  activeTab: "home" | "create" | "library" | "profile";
  onTabChange: (tab: "home" | "create" | "library" | "profile") => void;
}

export default function BottomNavBar({ activeTab, onTabChange }: BottomNavBarProps) {
  const tabs = [
    { id: "home" as const, label: "Home", icon: Sparkles },
    { id: "create" as const, label: "Create", icon: PlusCircle },
    { id: "library" as const, label: "Library", icon: Layers },
    { id: "profile" as const, label: "Profile", icon: UserCircle },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#050505]/80 backdrop-blur-xl border-t border-white/5 px-6 pb-6 pt-3 select-none">
      <div className="max-w-md mx-auto flex justify-between items-center bg-[#111111]/95 px-4 py-2.5 rounded-full border border-white/5 shadow-[0_-10px_30px_rgba(0,0,0,0.8)]">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              id={`tab-btn-${tab.id}`}
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="relative flex flex-col items-center justify-center py-1 px-3 transition-colors duration-200 outline-none focus:outline-none"
              style={{ WebkitTapHighlightColor: "transparent" }}
            >
              {isActive && (
                <motion.div
                  layoutId="active-indicator"
                  className="absolute inset-0 bg-[#ffffff]/5 rounded-full -z-10"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}

              <Icon
                size={22}
                className={`transition-all duration-300 ${
                  isActive
                    ? "text-[#FF4FD8] scale-110 drop-shadow-[0_0_8px_rgba(255,79,216,0.6)]"
                    : "text-[#A1A1AA] hover:text-white"
                }`}
              />

              <span
                className={`text-[10px] mt-1 font-sans transition-all duration-300 tracking-wide ${
                  isActive ? "text-white font-medium" : "text-[#A1A1AA]"
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
