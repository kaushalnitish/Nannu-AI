import { useState } from "react";
import { Search, Heart, Trash2, Calendar, FileText, ChevronRight, Compass } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { LibraryItem } from "../types";
import GlowCard from "../components/GlowCard";

interface LibraryScreenProps {
  libraryList: LibraryItem[];
  onSelect: (item: LibraryItem) => void;
  onToggleFavorite: (id: string) => void;
  onDeleteItem: (id: string) => void;
}

export default function LibraryScreen({
  libraryList,
  onSelect,
  onToggleFavorite,
  onDeleteItem
}: LibraryScreenProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"All" | "Favorites" | "Talking Head" | "Storytelling">("All");

  const filteredItems = libraryList.filter((item) => {
    const matchesSearch = item.prompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.contentType.toLowerCase().includes(searchTerm.toLowerCase());

    if (filter === "Favorites") {
      return matchesSearch && item.isFavorite;
    } else if (filter === "Talking Head") {
      return matchesSearch && item.contentType === "Talking Head";
    } else if (filter === "Storytelling") {
      return matchesSearch && item.contentType === "Storytelling";
    }

    return matchesSearch;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex flex-col flex-1 pb-24"
    >
      {/* Title */}
      <div className="mb-5 mt-1">
        <h2 className="text-2xl font-black font-sans tracking-tight text-white uppercase">Content Library</h2>
        <p className="text-xs text-[#A1A1AA] font-sans">
          All your high-retention brainstorm structures and generated captions.
        </p>
      </div>

      {/* Premium Search input bar */}
      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-[#A1A1AA]">
          <Search size={16} />
        </div>
        <input
          id="library-search-input"
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search prompts or formats..."
          className="w-full pl-11 pr-4 py-3 bg-[#111111]/90 rounded-xl border border-white/5 focus:border-[#FF4FD8]/40 focus:outline-none text-sm text-white placeholder-[#555] transition-all"
        />
      </div>

      {/* Categories chips filter layout */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1 select-none scrollbar-none font-sans">
        {(["All", "Favorites", "Talking Head", "Storytelling"] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`text-xs font-bold leading-none py-2 px-3 rounded-xl border whitespace-nowrap transition-all duration-300 ${
              filter === cat
                ? "bg-[#FF4FD8] border-[#FF4FD8] text-white shadow-[0_0_10px_rgba(255,79,216,0.25)]"
                : "bg-[#111111] border-white/5 text-[#A1A1AA] hover:text-white"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid of historic Library Cards */}
      <div className="flex flex-col gap-3">
        <AnimatePresence mode="popLayout">
          {filteredItems.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-12 flex flex-col items-center justify-center text-center px-6"
            >
              <div className="p-4 rounded-full bg-white/2 mb-4 text-[#A1A1AA]/30 border border-white/5 border-dashed">
                <Compass size={28} />
              </div>
              <p className="text-sm font-sans text-white/50 mb-1">No concepts found</p>
              <p className="text-xs font-sans text-[#555]">
                Adjust your filter tags or try a new search query.
              </p>
            </motion.div>
          ) : (
            filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, delay: index * 0.04 }}
                className="w-full text-left"
              >
                <GlowCard glowColor="none" className="p-4 bg-[#111111]/85 border-white/5 pr-3 relative">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    {/* Format tag badge */}
                    <div className="flex items-center gap-1.5">
                      <FileText size={12} className="text-[#A855F7]" />
                      <span className="text-[10px] font-mono text-[#A855F7] tracking-wider uppercase font-semibold flex items-center">
                        {item.contentType} • {item.duration}
                        <span className="px-1.5 py-0.5 rounded bg-white/5 text-[#FF4FD8] text-[8px] font-black uppercase ml-1.5 leading-none">
                          {item.language || "English"}
                        </span>
                      </span>
                    </div>

                    {/* Meta date */}
                    <span className="text-[9px] font-mono text-[#555]">{item.timestamp}</span>
                  </div>

                  {/* Main prompt title */}
                  <h3
                    onClick={() => onSelect(item)}
                    className="text-sm font-bold text-white mb-3 cursor-pointer hover:text-[#FF4FD8] transition-colors pr-10 line-clamp-2 leading-relaxed"
                  >
                    "{item.prompt}"
                  </h3>

                  {/* Action panels for editing/deanimation */}
                  <div className="flex items-center justify-between border-t border-white/[0.03] pt-2.5">
                    {/* Left: View script link */}
                    <button
                      onClick={() => onSelect(item)}
                      className="flex items-center gap-1 text-[10px] font-mono font-bold text-[#C8FF5A] hover:brightness-110 cursor-pointer"
                    >
                      <span>VIEW FULL SYSTEM</span>
                      <ChevronRight size={12} />
                    </button>

                    {/* Right: Favoriting/trash buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onToggleFavorite(item.id)}
                        className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                          item.isFavorite
                            ? "bg-[#FF4FD8]/10 border-[#FF4FD8]/25 text-[#FF4FD8]"
                            : "bg-white/2 border-white/5 text-[#A1A1AA] hover:text-white"
                        }`}
                      >
                        <Heart size={13} fill={item.isFavorite ? "#FF4FD8" : "none"} />
                      </button>

                      <button
                        onClick={() => onDeleteItem(item.id)}
                        className="p-1.5 rounded-lg bg-white/2 hover:bg-black border border-white/5 text-[#555] hover:text-red-400 transition-colors cursor-pointer"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </GlowCard>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
