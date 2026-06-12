import { useState, useEffect } from "react";
import { Sparkles, Brain, ArrowRight, Mic, X, Layers, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import GlowCard from "../components/GlowCard";
// @ts-ignore
import creatorsAvatar from "../assets/images/creators_avatar_1781198383827.jpg";

const HeroBannerCard = () => {
  const imageUrl = "https://www.image2url.com/r2/default/images/1781201112490-ba80772d-7ecd-4508-b5c0-e6dae68ce1d0.png";

  return (
    <div className="w-full mb-5 relative">
      <div 
        id="hero-banner-card"
        className="relative bg-white rounded-[16px] sm:rounded-[20px] shadow-sm border border-neutral-200/50 overflow-hidden w-full flex flex-col h-[94px] sm:h-[104px] transition-all duration-300 hover:shadow-md"
      >
        {/* Label top center header band – "FOR YOU" above the creator image */}
        <div className="w-full bg-white flex items-center justify-center py-1.5 border-b border-neutral-100 shrink-0 select-none">
          <span className="text-[10px] uppercase font-semibold text-[#8B5CF6] tracking-[0.2em] font-sans whitespace-nowrap">
            FOR YOU
          </span>
        </div>
        
        {/* Creator group image occupying almost the entire remaining banner height with face-priority cropping */}
        <div className="w-full flex-1 relative overflow-hidden bg-white select-none">
          <img
            src={imageUrl}
            alt="Nannu AI Creator Community"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-[center_35%]"
          />
        </div>
      </div>
    </div>
  );
};

interface WelcomeScreenProps {
  onStartCreation: (promptText: string, selDuration?: string, selFormat?: string, selMood?: string) => void;
  savedPrompt: string;
  language: string;
  onLanguageChange: (lang: string) => void;
  savedDuration: string;
  onDurationChange: (dur: string) => void;
  savedContentType: string;
  onContentTypeChange: (type: string) => void;
  savedMood: string;
  onMoodChange: (mood: string) => void;
}

export default function WelcomeScreen({
  onStartCreation,
  savedPrompt,
  language,
  onLanguageChange,
  savedDuration,
  onDurationChange,
  savedContentType,
  onContentTypeChange,
  savedMood,
  onMoodChange
}: WelcomeScreenProps) {
  const [prompt, setPrompt] = useState(savedPrompt || "");
  const [greeting, setGreeting] = useState("Good Evening Nannu 👋");
  const [isTipsOpen, setIsTipsOpen] = useState(false);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  useEffect(() => {
    // Dynamic premium greeting based on hour of standard local time
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting("Good Morning Nannu ☀️");
    } else if (hour < 17) {
      setGreeting("Good Afternoon Nannu ⚡");
    } else {
      setGreeting("Good Evening Nannu 👋");
    }
  }, []);

  const suggestions = [
    { title: "AI Business", prompt: "How AI is quietly stealing 9-to-5 corporate jobs in 2026" },
    { title: "Personal Brand", prompt: "The 3-stage visual hack to look like a 10M founder instantly" },
    { title: "Storytelling", prompt: "How my worst public design failure actually saved my startup budget" },
    { title: "Money", prompt: "The underhanded method I used to land my first client with zero follow list" },
    { title: "Motivation", prompt: "Why coding clean on the first draft is destroying your execution speed" },
  ];

  const handleSuggestClick = (sPrompt: string) => {
    setPrompt(sPrompt);
  };

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    onStartCreation(prompt, savedDuration, savedContentType, savedMood);
  };

  const durationPresets = [
    { value: "15 Seconds", shortVal: "15s Short" },
    { value: "45 Seconds", shortVal: "45s Standard" },
    { value: "90 Seconds", shortVal: "90s Detailed" },
    { value: "5 Minutes", shortVal: "5m Long-form" }
  ];

  const formatPresets = [
    { name: "Talking Head", icon: "🎙️" },
    { name: "Storytelling", icon: "📖" },
    { name: "POV", icon: "🎥" },
    { name: "Carousel", icon: "📱" },
    { name: "Opinion", icon: "💬" },
    { name: "List Style", icon: "📊" }
  ];

  const moodPresets = [
    { name: "Confident 😎" },
    { name: "Savage 🌶️" },
    { name: "Storyteller 📖" },
    { name: "Inspirational ✨" }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="flex flex-col flex-1 pb-24"
    >
      {/* Top Brand Banner */}
      <div className="flex items-center justify-between mb-8 mt-2">
        <div className="flex items-center gap-2">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-[#FF4FD8] to-[#A855F7] shadow-[0_0_15px_rgba(255,79,216,0.3)]">
            <Brain size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-wider text-white font-mono uppercase">NANNU AI</h1>
            <p className="text-[10px] text-[#A1A1AA]">Your Personal AI Content Brain</p>
          </div>
        </div>
        
        <button
          id="voice-training-tips-btn"
          onClick={() => setIsTipsOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 text-[10px] font-mono text-[#D8B4FE] font-semibold tracking-wide shadow-sm hover:shadow-[0_0_10px_rgba(168,85,247,0.15)] cursor-pointer"
        >
          <Sparkles size={12} className="text-[#FF4FD8] animate-pulse" />
          <span>VOICE TIPS</span>
        </button>
      </div>

      {/* Greeting Heading */}
      <div className="mb-4 text-left">
        <h2 className="text-xl font-bold font-sans tracking-tight text-white mb-1">
          {greeting}
        </h2>
        <p className="text-xs text-[#A1A1AA] font-sans">
          Ready to synthesize? Specify your core content focus below:
        </p>
      </div>

      {/* Premium Compact Hero Banner (Apple/Linear Style) */}
      <HeroBannerCard />

      {/* Large Glowing Input Box */}
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-[#FF4FD8] to-[#A855F7] rounded-2xl blur opacity-30 group-focus-within:opacity-60 transition duration-300" />
        <GlowCard id="home-topic-input-container" glowColor="pink" className="relative mb-6 flex flex-col p-5 bg-[#090909]/95 border-white/20 shadow-[0_4px_30px_rgba(255,79,216,0.15)]">
          <div className="flex items-center justify-between mb-3 text-xs font-mono text-white/90">
            <span className="font-bold tracking-wider uppercase text-[#FF4FD8]">Topic Input Focus</span>
            <Sparkles size={14} className="text-[#FF4FD8] animate-pulse" />
          </div>

          <textarea
            id="prompt-textbox"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="How I got my first high-paying marketing client in 48 hours..."
            className="bg-transparent text-white text-base font-medium font-sans leading-relaxed resize-none h-28 focus:outline-none border-none placeholder-[#A1A1AA] active:border-none focus:ring-0 p-0"
          />

          <div className="flex justify-between items-center text-[10px] font-mono text-[#A1A1AA] mt-2 border-t border-white/5 pt-2">
            <span>Make this complete and specific</span>
            <span className="font-bold">{prompt.length} / 250 characters</span>
          </div>
        </GlowCard>
      </div>

      {/* Target Generation Language */}
      <div className="mb-6">
        <h3 className="text-xs font-mono text-white font-bold uppercase tracking-wider mb-2.5">
          Brain Output Dialect
        </h3>
        <div className="flex bg-[#090909]/95 p-1.5 rounded-xl border border-white/20 font-sans shadow-lg">
          {[
            { id: "English", label: "English", flag: "🇺🇸" },
            { id: "Hindi", label: "हिंदी (Hindi)", flag: "🇮🇳" },
            { id: "Hinglish", label: "Hinglish", flag: "🗣️" }
          ].map((lang) => {
            const isActive = language === lang.id;
            return (
              <button
                id={`lang-btn-${lang.id.toLowerCase()}`}
                key={lang.id}
                onClick={() => onLanguageChange(lang.id)}
                className={`flex-1 py-1.5 text-xs font-extrabold rounded-lg transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer ${
                  isActive
                    ? "bg-[#FF4FD8] text-white shadow-[0_0_15px_rgba(255,79,216,0.4)] scale-102"
                    : "text-white/75 hover:text-white hover:bg-white/5"
                }`}
              >
                <span className="text-sm select-none">{lang.flag}</span>
                <span>{lang.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Suggestion Chips */}
      <div className="mb-6">
        <p className="text-xs font-mono text-white font-bold uppercase tracking-wider mb-2.5">
          Suggested Spark Topics
        </p>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((item, index) => (
            <button
              id={`suggest-chip-${index}`}
              key={index}
              onClick={() => handleSuggestClick(item.prompt)}
              className={`text-xs px-3.5 py-2 rounded-full border transition-all duration-300 font-sans cursor-pointer font-medium ${
                prompt === item.prompt
                  ? "bg-[#FF4FD8] border-[#FF4FD8] text-white shadow-[0_0_15px_rgba(255,79,216,0.35)]"
                  : "bg-[#090909]/95 border-white/20 text-white hover:bg-white/10 hover:border-white/40"
              }`}
            >
              {item.title}
            </button>
          ))}
        </div>
      </div>

      {/* Generating/Continue Button */}
      <motion.button
        id="home-continue-cta"
        disabled={!prompt.trim()}
        whileTap={{ scale: 0.96 }}
        onClick={handleGenerate}
        className={`w-full py-4 px-6 rounded-2xl font-bold tracking-wide font-sans shadow-lg flex items-center justify-center gap-2 transition-all duration-300 ${
          prompt.trim()
            ? "bg-[#C8FF5A] text-black shadow-[0_0_20px_rgba(200,255,90,0.3)] hover:brightness-110 cursor-pointer"
            : "bg-white/5 border border-white/5 text-[#A1A1AA]/50 cursor-not-allowed"
        }`}
      >
        <span>Continue</span>
        <ArrowRight size={18} />
      </motion.button>

      {/* Analyzer Divider */}
      <div className="flex items-center my-6 select-none">
        <div className="flex-1 h-px bg-white/5" />
        <span className="px-3 text-[9px] font-mono text-[#555] tracking-widest uppercase">OR STUDY WINNING VIDEOS</span>
        <div className="flex-1 h-px bg-white/5" />
      </div>

      {/* Analyze Competitor CTA */}
      <motion.button
        id="home-analyze-creator-cta"
        whileTap={{ scale: 0.97 }}
        onClick={() => {
          window.location.hash = "#/analyze";
        }}
        className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#FF4FD8]/10 to-[#A855F7]/10 border border-[#FF4FD8]/25 text-[#FF4FD8] font-bold tracking-wide font-sans hover:from-[#FF4FD8]/15 hover:to-[#A855F7]/15 transition-all text-xs flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(255,79,216,0.05)] cursor-pointer"
      >
        <Sparkles size={14} className="text-[#FF4FD8] animate-pulse" />
        <span>Analyze Creator → Convert To My Style</span>
      </motion.button>

      {/* Voice Training Tips Modal Overlay */}
      <AnimatePresence>
        {isTipsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsTipsOpen(false)}
              className="absolute inset-0 bg-[#000000]/85 backdrop-blur-md"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-white/10 bg-[#111111]/95 p-6 shadow-[0_0_50px_rgba(168,85,247,0.15)] backdrop-blur-md z-10"
            >
              {/* Colored Glow Ornaments */}
              <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-[#A855F7]/15 blur-3xl pointer-events-none" />
              <div className="absolute -left-20 -bottom-20 h-40 w-40 rounded-full bg-[#FF4FD8]/10 blur-3xl pointer-events-none" />

              {/* Close Button Button */}
              <button
                id="close-tips-modal-btn"
                onClick={() => setIsTipsOpen(false)}
                className="absolute right-4 top-4 rounded-lg p-1.5 text-[#A1A1AA] hover:bg-white/5 hover:text-white transition-all cursor-pointer"
              >
                <X size={16} />
              </button>

              {/* Title Header */}
              <div className="flex items-center gap-2.5 mb-5 select-none">
                <div className="p-2.5 rounded-xl bg-gradient-to-tr from-[#FF4FD8] to-[#A855F7] shadow-[0_0_10px_rgba(255,79,216,0.2)] flex items-center justify-center">
                  <Mic size={16} className="text-white" />
                </div>
                <div>
                  <h4 className="text-xs font-mono tracking-wider text-white uppercase font-bold">VOICE CLONE SYSTEM</h4>
                  <p className="text-[10px] text-[#A1A1AA] font-sans">How Nannu AI inflects your real voice style</p>
                </div>
              </div>

              {/* Content Explanation Stack */}
              <div className="space-y-3 mb-6">
                
                {/* Rule 1 */}
                <div className="p-3 rounded-xl bg-[#090909] border border-white/5 flex gap-3 items-start">
                  <span className="text-sm select-none p-0.5">🎙️</span>
                  <div>
                    <h5 className="text-xs font-semibold text-white font-sans mb-0.5">
                      Vocal Sync Training
                    </h5>
                    <p className="text-[10px] text-[#A1A1AA] leading-relaxed">
                      Go to <strong className="text-white font-medium">Profile &gt; Train Voice</strong> to upload template audio or record your voice. It computes a custom sync scorecard.
                    </p>
                  </div>
                </div>

                {/* Rule 2 */}
                <div className="p-3 rounded-xl bg-[#090909] border border-white/5 flex gap-3 items-start">
                  <span className="text-sm select-none p-0.5">📖</span>
                  <div>
                    <h5 className="text-xs font-semibold text-white font-sans mb-0.5">
                      Storytelling Phrasing
                    </h5>
                    <p className="text-[10px] text-[#A1A1AA] leading-relaxed">
                      Active <span className="text-[#C8FF5A] font-bold font-mono">Personal Storytelling</span> vocabulary to force emotional first-person narratives full of high-stakes hooks and raw triumphs.
                    </p>
                  </div>
                </div>

                {/* Rule 3 */}
                <div className="p-3 rounded-xl bg-[#090909] border border-white/5 flex gap-3 items-start">
                  <span className="text-sm select-none p-0.5">🌶️</span>
                  <div>
                    <h5 className="text-xs font-semibold text-white font-sans mb-0.5">
                      Vibe Tone Modulators
                    </h5>
                    <p className="text-[10px] text-[#A1A1AA] leading-relaxed">
                      Toggle multiple mood inflections like <strong className="text-[#FF4FD8] font-medium">Roast</strong>, <strong className="text-[#A855F7] font-medium">Brutal</strong>, or <strong className="text-[#C8FF5A] font-medium">Realist</strong> to blend their respective speech characteristics.
                    </p>
                  </div>
                </div>

                {/* Rule 4 */}
                <div className="p-3 rounded-xl bg-[#090909] border border-white/5 flex gap-3 items-start">
                  <span className="text-sm select-none p-0.5">🗣️</span>
                  <div>
                    <h5 className="text-xs font-semibold text-white font-sans mb-0.5">
                      Bilingual Dialect Sync
                    </h5>
                    <p className="text-[10px] text-[#A1A1AA] leading-relaxed">
                      Control localized slang density effortlessly with real-time Romanized English-Hindi mix thresholds.
                    </p>
                  </div>
                </div>

              </div>

              {/* Practical CTAs */}
              <div className="flex flex-col gap-2">
                <button
                  id="go-to-trainer-cta"
                  onClick={() => {
                    setIsTipsOpen(false);
                    window.location.hash = "#/voice";
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#FF4FD8] to-[#A855F7] text-white text-xs font-bold font-sans shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Open Voice Trainer Now</span>
                  <ArrowRight size={14} />
                </button>
                <button
                  id="close-tips-under-cta"
                  onClick={() => setIsTipsOpen(false)}
                  className="w-full py-2 text-center text-[10px] font-mono text-[#A1A1AA] hover:text-white transition-all cursor-pointer"
                >
                  DISMISS
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
