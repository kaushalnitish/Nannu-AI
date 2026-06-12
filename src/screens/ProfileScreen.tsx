import React, { useState, useEffect } from "react";
import { 
  Sparkles, Brain, Award, BarChart3, Fingerprint, Calendar, Sun, Moon, Eye, 
  TrendingUp, User, Settings, Sliders, ChevronRight, ArrowLeft, Upload, 
  BookOpen, Plus, Heart, Trash2, CheckCircle, Copy, AlertCircle, FileText, 
  MessageSquare, UserPlus, Info, Compass, HelpCircle, Save, Check
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import GlowCard from "../components/GlowCard";
import { getSavedPreferenceProfile, savePreferenceProfile, PreferenceProfile, getAnalyticsEvents, clearAnalyticsEvents, logAnalyticsEvent } from "../utils/preferences";
import { getSavedLibrary, deleteLibraryItem, toggleFavoriteItem, getSavedVoiceSettings, saveVoiceSettings } from "../utils/mockData";
import { LibraryItem, VoiceSettings } from "../types";

interface ProfileScreenProps {
  scriptsCount: number;
  voiceSyncScore: number;
  theme: "dark" | "light";
  onToggleTheme: () => void;
  initialSection?: string | null;
  onClearInitialSection?: () => void;
  onSelectScript?: (item: LibraryItem) => void;
}

interface TrainingPreferences {
  pastScripts: string[];
  pastCaptions: string[];
  writingExamples: string[];
  favoriteCreators: string[];
  customInstructions: string;
  personalVocabulary: string[];
  preferredSentenceStyle: string;
}

const DEFAULT_TRAINING: TrainingPreferences = {
  pastScripts: [],
  pastCaptions: [],
  writingExamples: ["Focus on the gap between actions. Speak with low punctuation. Build leverage."],
  favoriteCreators: ["Ali Abdaal", "Alex Hormozi", "Dan Koe"],
  customInstructions: "Adopt a confident, first-person narrative with no generic introductions.",
  personalVocabulary: ["reframe", "leverage", "paradigm", "sovereign", "feedback loop"],
  preferredSentenceStyle: "Punchy & short sentence clusters"
};

export default function ProfileScreen({
  scriptsCount,
  voiceSyncScore,
  theme,
  onToggleTheme,
  initialSection = null,
  onClearInitialSection,
  onSelectScript
}: ProfileScreenProps) {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Library items for Saved Scripts section
  const [localLibraryList, setLocalLibraryList] = useState<LibraryItem[]>([]);

  // States for user profile
  const [creatorName, setCreatorName] = useState("Nitish Kaushal");
  const [creatorBio, setCreatorBio] = useState("Digital SaaS Entrepreneur & High-Retention Video Producer");
  const [creatorHandle, setCreatorHandle] = useState("@nitish_design");
  const [creatorEmail, setCreatorEmail] = useState("kaushalnitish001@gmail.com");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState(false);

  // States for Nannu Training
  const [trainingPrefs, setTrainingPrefs] = useState<TrainingPreferences>(DEFAULT_TRAINING);
  const [newCreatorInput, setNewCreatorInput] = useState("");
  const [newVocabInput, setNewVocabInput] = useState("");
  const [scriptPasteInput, setScriptPasteInput] = useState("");
  const [captionPasteInput, setCaptionPasteInput] = useState("");
  const [examplePasteInput, setExamplePasteInput] = useState("");
  const [trainingFeedback, setTrainingFeedback] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [writingSampleTab, setWritingSampleTab] = useState<"upload" | "script" | "caption">("upload");
  const [isAdvancedCollapsibleOpen, setIsAdvancedCollapsibleOpen] = useState(false);

  const [stats, setStats] = useState({
    scriptsGenerated: 0,
    practiceSessions: 0,
    totalPracticeSeconds: 0,
    draftsSaved: 0,
    currentStreak: 0
  });

  const formatSeconds = (totalSeconds: number) => {
    if (totalSeconds === 0) return "0s";
    if (totalSeconds < 60) return `${totalSeconds}s`;
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
  };

  useEffect(() => {
    try {
      const generated = parseInt(localStorage.getItem("nannu_scripts_generated_count") || "0", 10);
      const practiceCount = parseInt(localStorage.getItem("nannu_practice_sessions_count") || "0", 10);
      const practiceSecs = parseInt(localStorage.getItem("nannu_practice_sessions_duration") || "0", 10);
      const savedCount = getSavedLibrary().length;
      const streak = parseInt(localStorage.getItem("nannu_practice_streak") || "1", 10);

      setStats({
        scriptsGenerated: Math.max(generated, savedCount),
        practiceSessions: practiceCount,
        totalPracticeSeconds: practiceSecs,
        draftsSaved: savedCount,
        currentStreak: practiceCount > 0 ? streak : 0
      });
    } catch (e) {
      console.warn("Storage stats lookup failed", e);
    }
  }, [activeSection]);

  // Local state for developer diagnostics and analytics logs
  const [analyticsEvents, setAnalyticsEvents] = useState<any[]>([]);

  useEffect(() => {
    if (activeSection === "settings") {
      setAnalyticsEvents(getAnalyticsEvents());
    }
  }, [activeSection]);

  const handleClearLogs = () => {
    clearAnalyticsEvents();
    setAnalyticsEvents([]);
    logAnalyticsEvent("Analytics Cleared", { byUser: true });
  };

  // Load preferences and data elements
  useEffect(() => {
    setLocalLibraryList(getSavedLibrary());
    
    const saved = localStorage.getItem("nannu_training_preferences");
    if (saved) {
      try {
        setTrainingPrefs({ ...DEFAULT_TRAINING, ...JSON.parse(saved) });
      } catch (e) {
        console.warn("Error decoding custom builder preferences", e);
      }
    }

    if (initialSection) {
      setActiveSection(initialSection);
    }
  }, [initialSection]);

  const saveTrainingSettings = (updated: TrainingPreferences) => {
    setTrainingPrefs(updated);
    localStorage.setItem("nannu_training_preferences", JSON.stringify(updated));
    
    // Also sync to voice compatibility parameters silently
    const vSettings = getSavedVoiceSettings();
    vSettings.vocabulary = updated.personalVocabulary.join(", ") || vSettings.vocabulary;
    vSettings.lastTrained = "Just trained via Profile center";
    vSettings.voiceSyncScore = Math.min(99, vSettings.voiceSyncScore + 1);
    saveVoiceSettings(vSettings);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDropFile = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      setTrainingFeedback(`Analyzing uploaded file "${file.name}"...`);
      
      setTimeout(() => {
        // Mock parsing the script
        const updated = {
          ...trainingPrefs,
          pastScripts: [...trainingPrefs.pastScripts, `Parsed transcript from file: ${file.name} (Simulated style pattern synced)`]
        };
        saveTrainingSettings(updated);
        setTrainingFeedback(`Successfully parsed and integrated style nodes from ${file.name}!`);
        setTimeout(() => setTrainingFeedback(null), 3000);
      }, 1500);
    }
  };

  const handleAddCreatorInspiration = () => {
    if (newCreatorInput.trim()) {
      const updated = {
        ...trainingPrefs,
        favoriteCreators: [...trainingPrefs.favoriteCreators, newCreatorInput.trim()]
      };
      saveTrainingSettings(updated);
      setNewCreatorInput("");
    }
  };

  const handleRemoveCreatorInspiration = (idxToRemove: number) => {
    const updated = {
      ...trainingPrefs,
      favoriteCreators: trainingPrefs.favoriteCreators.filter((_, idx) => idx !== idxToRemove)
    };
    saveTrainingSettings(updated);
  };

  const handleAddVocabWord = () => {
    if (newVocabInput.trim()) {
      const updated = {
        ...trainingPrefs,
        personalVocabulary: [...trainingPrefs.personalVocabulary, newVocabInput.trim().toLowerCase()]
      };
      saveTrainingSettings(updated);
      setNewVocabInput("");
    }
  };

  const handleRemoveVocabWord = (idxToRemove: number) => {
    const updated = {
      ...trainingPrefs,
      personalVocabulary: trainingPrefs.personalVocabulary.filter((_, idx) => idx !== idxToRemove)
    };
    saveTrainingSettings(updated);
  };

  const handlePasteScriptSubmit = () => {
    if (scriptPasteInput.trim()) {
      const updated = {
        ...trainingPrefs,
        pastScripts: [...trainingPrefs.pastScripts, scriptPasteInput.trim()]
      };
      saveTrainingSettings(updated);
      setScriptPasteInput("");
      setTrainingFeedback("Past script submitted! Nannu AI has integrated this structural flow.");
      setTimeout(() => setTrainingFeedback(null), 3000);
    }
  };

  const handlePasteCaptionSubmit = () => {
    if (captionPasteInput.trim()) {
      const updated = {
        ...trainingPrefs,
        pastCaptions: [...trainingPrefs.pastCaptions, captionPasteInput.trim()]
      };
      saveTrainingSettings(updated);
      setCaptionPasteInput("");
      setTrainingFeedback("Caption integrated! Vocabulary & hashtag patterns updated.");
      setTimeout(() => setTrainingFeedback(null), 3000);
    }
  };

  const handlePasteExampleSubmit = () => {
    if (examplePasteInput.trim()) {
      const updated = {
        ...trainingPrefs,
        writingExamples: [...trainingPrefs.writingExamples, examplePasteInput.trim()]
      };
      saveTrainingSettings(updated);
      setExamplePasteInput("");
      setTrainingFeedback("Writing example locked! Replicating key sentence vectors.");
      setTimeout(() => setTrainingFeedback(null), 3000);
    }
  };

  const handleRemoveExample = (idxToRemove: number) => {
    const updated = {
      ...trainingPrefs,
      writingExamples: trainingPrefs.writingExamples.filter((_, idx) => idx !== idxToRemove)
    };
    saveTrainingSettings(updated);
  };

  // Profile preferences
  const profilePref = getSavedPreferenceProfile();
  const topTones = Object.entries(profilePref.preferredTones)
    .filter(([_, weight]) => weight > 0)
    .sort((a, b) => b[1] - a[1]);

  const topStyles = Object.entries(profilePref.preferredStyle)
    .filter(([_, weight]) => weight > 0)
    .sort((a, b) => b[1] - a[1]);

  // Handles favorite and delete from Saved Scripts drawer helper
  const handleToggleFavLocal = (id: string) => {
    const updated = toggleFavoriteItem(id);
    setLocalLibraryList(updated);
  };

  const handleDeleteLocal = (id: string) => {
    const updated = deleteLibraryItem(id);
    setLocalLibraryList(updated);
  };

  const handleSaveProfileInfo = () => {
    setIsEditingProfile(false);
    setProfileSuccessMsg(true);
    setTimeout(() => setProfileSuccessMsg(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex flex-col flex-1 pb-24"
    >
      {/* 1. Header or breadcrumb top segment */}
      <AnimatePresence mode="wait">
        {activeSection !== null ? (
          <motion.div
            key="sub-header"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="flex items-center gap-3 mb-6 mt-1"
          >
            <button
              onClick={() => {
                setActiveSection(null);
                if (onClearInitialSection) onClearInitialSection();
              }}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white cursor-pointer transition-colors"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <span className="text-[9px] font-mono text-[#FF4FD8] uppercase tracking-widest block">
                Nitish's Studio settings
              </span>
              <h2 className="text-xl font-black font-sans uppercase text-white tracking-tight">
                {activeSection === "profile" && "Creator Profile"}
                {activeSection === "settings" && "Account Settings"}
                {activeSection === "preferences" && "Content Preferences"}
                {activeSection === "train" && "Train Nannu AI"}
                {activeSection === "scripts" && "Saved Drafts Vault"}
                {activeSection === "stats" && "Usage Analytics"}
              </h2>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="main-header"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 mt-1"
          >
            <h2 className="text-2xl font-black font-sans tracking-tight text-white uppercase">
              Creator Hub
            </h2>
            <p className="text-xs text-[#A1A1AA] font-sans">
              Calibrate and teach Nannu your exact voice, style, and vocabulary behaviors.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main routing switcher rendering */}
      <AnimatePresence mode="wait">
        {/* Null view: Showcase Profile Category Cards */}
        {activeSection === null && (
          <motion.div
            key="menu-index"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="space-y-4"
          >
            {/* Header branding avatar summary banner */}
            <GlowCard glowColor="pink" className="p-5 bg-[#111111]/95 border-white/5/65 text-left flex items-center justify-between relative overflow-hidden">
              <div className="absolute -top-12 -right-12 w-28 h-28 bg-[#FF4FD8]/10 filter blur-3xl rounded-full" />
              <div className="flex items-center gap-4 relative z-10">
                <div className="relative shrink-0">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#FF4FD8] via-[#A855F7] to-[#C8FF5A] p-0.5 shadow-md">
                    <div className="w-full h-full rounded-full bg-[#050505] flex items-center justify-center font-bold text-xs text-white uppercase font-sans">
                      {creatorName.split(" ").map(n=>n[0]).join("")}
                    </div>
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-[#C8FF5A] text-black text-[7.5px] font-mono font-bold px-1.5 py-0.5 rounded-full border border-black uppercase scale-90">
                    Pro
                  </div>
                </div>
                <div className="font-sans text-left">
                  <h3 className="text-base font-bold text-white mb-0.5 leading-none">{creatorName}</h3>
                  <p className="text-[10px] text-[#A1A1AA] font-mono leading-none">{creatorHandle}</p>
                  <div className="inline-flex items-center gap-1 mt-2.5 bg-white/5 py-1 px-3.5 rounded-full border border-white/5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C8FF5A] animate-pulse" />
                    <span className="text-[8.5px] font-mono text-white tracking-widest uppercase">SYD-4 CORE ACTIVE</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setActiveSection("profile")}
                className="text-[10px] font-mono font-bold text-[#FF4FD8] bg-white/5 hover:bg-white/10 transition-colors py-1 px-2.5 rounded-md border border-white/5 cursor-pointer"
              >
                EDIT
              </button>
            </GlowCard>

            {/* Sub-menu grid index items block */}
            <div className="space-y-3">
              {/* Profile Card */}
              <button
                onClick={() => setActiveSection("profile")}
                className="w-full text-left focus:outline-none transition-transform active:scale-[0.99] block"
              >
                <GlowCard glowColor="none" className="p-4 bg-[#111111]/90 border-white/5 hover:border-white/10 flex items-center justify-between cursor-pointer transition-all">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-[#FF4FD8]/10 text-[#FF4FD8]">
                      <User size={18} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Creator Profile</h4>
                      <p className="text-[10px] text-[#A1A1AA] mt-0.5">Manage handle, identity, bio description and avatar tags.</p>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-[#A1A1AA]" />
                </GlowCard>
              </button>

              {/* Account Settings */}
              <button
                onClick={() => setActiveSection("settings")}
                className="w-full text-left focus:outline-none transition-transform active:scale-[0.99] block"
              >
                <GlowCard glowColor="none" className="p-4 bg-[#111111]/90 border-white/5 hover:border-white/10 flex items-center justify-between cursor-pointer transition-all">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-[#A855F7]/10 text-[#A855F7]">
                      <Settings size={18} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Account Settings</h4>
                      <p className="text-[10px] text-[#A1A1AA] mt-0.5">Manage themes, billing cycle, notifications, and language defaults.</p>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-[#A1A1AA]" />
                </GlowCard>
              </button>


              {/* Train Nannu AI */}
              <button
                onClick={() => setActiveSection("train")}
                className="w-full text-left focus:outline-none transition-transform active:scale-[0.99] block"
              >
                <GlowCard glowColor="purple" className="p-4.5 bg-[#111111]/95 border-[#FF4FD8]/20 hover:border-[#FF4FD8]/40 flex items-center justify-between cursor-pointer transition-all">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-gradient-to-tr from-[#FF4FD8] to-[#D946EF] text-white">
                      <Brain size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">Train Nannu AI</h4>
                        <span className="bg-[#C8FF5A] text-black text-[8px] font-black font-mono px-1 rounded uppercase tracking-wider scale-90">Custom Center</span>
                      </div>
                      <p className="text-[10px] text-[#A1A1AA] mt-0.5">Teach your style using previous scripts, vocabulary list and creators list.</p>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-[#D8B4FE]" />
                </GlowCard>
              </button>

              {/* Saved Scripts */}
              <button
                onClick={() => setActiveSection("scripts")}
                className="w-full text-left focus:outline-none transition-transform active:scale-[0.99] block"
              >
                <GlowCard glowColor="none" className="p-4 bg-[#111111]/90 border-white/5 hover:border-white/10 flex items-center justify-between cursor-pointer transition-all">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
                      <BookOpen size={18} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Saved Drafts Vault</h4>
                      <p className="text-[10px] text-[#A1A1AA] mt-0.5">Review, copy, or launch your {scriptsCount} high-retention mock-ups.</p>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-[#A1A1AA]" />
                </GlowCard>
              </button>

              {/* Usage Stats */}
              <button
                onClick={() => setActiveSection("stats")}
                className="w-full text-left focus:outline-none transition-transform active:scale-[0.99] block"
              >
                <GlowCard glowColor="none" className="p-4 bg-[#111111]/90 border-white/5 hover:border-white/10 flex items-center justify-between cursor-pointer transition-all">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
                      <BarChart3 size={18} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Usage Analytics</h4>
                      <p className="text-[10px] text-[#A1A1AA] mt-0.5">Monitor silent background analytics and generation parameters.</p>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-[#A1A1AA]" />
                </GlowCard>
              </button>
            </div>
          </motion.div>
        )}

        {/* Section 1: Creator Profile Details */}
        {activeSection === "profile" && (
          <motion.div
            key="profile-sub"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <GlowCard glowColor="none" className="p-5 bg-[#111111]/95 border-white/5">
              <h3 className="text-xs font-mono text-white mb-4 uppercase tracking-wider border-b border-white/[0.04] pb-2">
                Identity Profile Settings
              </h3>

              <div className="space-y-3 font-sans">
                {profileSuccessMsg && (
                  <div className="flex items-center gap-2 p-3 bg-[#C8FF5A]/10 border border-[#C8FF5A]/30 text-[#C8FF5A] text-xs rounded-xl">
                    <CheckCircle size={14} />
                    <span>Profile settings successfully saved in cloud vault.</span>
                  </div>
                )}

                <div>
                  <label className="text-[10px] font-mono text-[#A1A1AA] uppercase tracking-wide block mb-1">
                    Creator Name
                  </label>
                  <input
                    type="text"
                    value={creatorName}
                    onChange={(e) => setCreatorName(e.target.value)}
                    disabled={!isEditingProfile}
                    className={`w-full bg-[#050505] border text-xs text-white p-3 rounded-xl focus:outline-none transition-all ${
                      isEditingProfile ? "border-[#FF4FD8]/40 focus:border-[#FF4FD8]" : "border-white/5"
                    }`}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-[#A1A1AA] uppercase tracking-wide block mb-1">
                    Profile Handle (@)
                  </label>
                  <input
                    type="text"
                    value={creatorHandle}
                    onChange={(e) => setCreatorHandle(e.target.value)}
                    disabled={!isEditingProfile}
                    className={`w-full bg-[#050505] border text-xs text-white p-3 rounded-xl focus:outline-none transition-all ${
                      isEditingProfile ? "border-[#FF4FD8]/40 focus:border-[#FF4FD8]" : "border-white/5"
                    }`}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-[#A1A1AA] uppercase tracking-wide block mb-1">
                    Contact Email Address
                  </label>
                  <input
                    type="email"
                    value={creatorEmail}
                    onChange={(e) => setCreatorEmail(e.target.value)}
                    disabled={!isEditingProfile}
                    className={`w-full bg-[#050505] border text-xs text-white p-3 rounded-xl focus:outline-none transition-all ${
                      isEditingProfile ? "border-[#FF4FD8]/40 focus:border-[#FF4FD8]" : "border-white/5"
                    }`}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-[#A1A1AA] uppercase tracking-wide block mb-1">
                    Creator Biography / Position
                  </label>
                  <textarea
                    value={creatorBio}
                    onChange={(e) => setCreatorBio(e.target.value)}
                    disabled={!isEditingProfile}
                    rows={3}
                    className={`w-full bg-[#050505] border text-xs text-white p-3 rounded-xl focus:outline-none transition-all resize-none ${
                      isEditingProfile ? "border-[#FF4FD8]/40 focus:border-[#FF4FD8]" : "border-white/5"
                    }`}
                  />
                </div>

                <div className="pt-3">
                  {isEditingProfile ? (
                    <button
                      onClick={handleSaveProfileInfo}
                      className="w-full py-3 rounded-xl bg-[#C8FF5A] text-black text-xs font-bold font-sans cursor-pointer flex items-center justify-center gap-1.5 shadow"
                    >
                      <Save size={14} />
                      <span>Apply Changes</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsEditingProfile(true)}
                      className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/5 text-xs font-bold font-sans cursor-pointer transition-colors"
                    >
                      Unlock Profile Adjustments
                    </button>
                  )}
                </div>
              </div>
            </GlowCard>

            <GlowCard glowColor="none" className="p-4 bg-[#111111]/90 border-white/5 font-sans">
              <h4 className="text-[11px] font-mono block text-white uppercase tracking-wider mb-2">Connected Channels</h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2.5 bg-white/[0.01] border border-white/5 rounded-xl">
                  <span className="text-[#A1A1AA]">Instagram Reels Feed</span>
                  <span className="text-emerald-400 font-bold uppercase text-[9px] font-mono">LINKED ✅</span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-white/[0.01] border border-white/5 rounded-xl">
                  <span className="text-[#A1A1AA]">TikTok Channel</span>
                  <span className="text-[#FF4FD8] font-bold uppercase text-[9px] font-mono">LINK NOW ➜</span>
                </div>
              </div>
            </GlowCard>
          </motion.div>
        )}

        {/* Section 2: Account Settings */}
        {activeSection === "settings" && (
          <motion.div
            key="settings-sub"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4 font-sans"
          >
            {/* Theme switcher */}
            <GlowCard glowColor="none" className="p-4.5 bg-[#111111]/95 border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${
                  theme === "light" ? "bg-amber-500/10 text-amber-500" : "bg-[#FF4FD8]/10 text-[#FF4FD8]"
                }`}>
                  {theme === "light" ? <Sun size={18} /> : <Moon size={18} />}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Accessibility Theme</h4>
                  <p className="text-[10px] text-[#A1A1AA]">Toggle sleek Dark Slate or clean Apple Light overrides.</p>
                </div>
              </div>
              
              <button
                id="profile-theme-toggle"
                onClick={onToggleTheme}
                className="py-1.5 px-3 bg-white/5 hover:bg-white/10 transition-colors text-white font-mono text-[10px] rounded-lg border border-white/5 font-bold cursor-pointer"
              >
                {theme === "dark" ? "LIGHT THEME" : "DARK THEME"}
              </button>
            </GlowCard>

            {/* Plan management */}
            <GlowCard glowColor="none" className="p-5 bg-gradient-to-tr from-[#111111] to-[#0A0A0A] border-white/5 relative overflow-hidden">
              <div className="absolute -top-16 -right-16 w-32 h-32 rounded-full bg-[#FF4FD8]/10 filter blur-3xl pointer-events-none" />
              <div>
                <span className="text-[8px] font-mono text-[#A1A1AA] uppercase tracking-wider block mb-1">
                  ENTERPRISE SUBSCRIPTION
                </span>
                <h4 className="text-base font-black text-white font-sans flex items-center gap-1">
                  <span>Nannu AI Enterprise Plus</span>
                  <Award size={16} className="text-[#C8FF5A]" />
                </h4>
                <p className="text-[11px] text-[#A1A1AA] mt-1.5 leading-relaxed">
                  Active tier license. Includes unlimited deep structural vocabulary training, caption mutations, and unlimited generated concept match loops.
                </p>
                <div className="border-t border-white/5 mt-4 pt-3 flex items-center justify-between text-[11px] text-[#A1A1AA]">
                  <span className="flex items-center gap-1 font-mono text-[9px] text-[#A1A1AA]">
                    <Calendar size={12} />
                    <span>RENEWS JULY 10, 2026</span>
                  </span>
                  <span className="text-[#C8FF5A] font-bold">$49/mo Plan</span>
                </div>
              </div>
            </GlowCard>

            {/* Extra sub settings */}
            <GlowCard glowColor="none" className="p-4 bg-[#111111]/90 border-white/5 space-y-3">
              <h4 className="text-[11px] font-mono text-white uppercase tracking-wider border-b border-white/[0.04] pb-1.5">Studio Presets</h4>
              
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#A1A1AA]">Primary Content Language</span>
                <span className="text-white font-bold select-none cursor-pointer hover:text-[#FF4FD8]">English 🗺️</span>
              </div>
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-[#A1A1AA]">Email Broadcast Notifications</span>
                <span className="text-[#C8FF5A] font-bold">ACTIVE 🔥</span>
              </div>
            </GlowCard>

            {/* Developer Diagnostics & Analytics Log */}
            <GlowCard glowColor="none" className="p-4.5 bg-[#111111]/95 border-red-500/10 space-y-3.5 relative overflow-hidden">
              <div className="absolute top-0 right-0 h-24 w-24 bg-red-500/[0.02] rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-[11px] font-mono font-bold text-red-400 uppercase tracking-widest flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 bg-red-500 rounded-full animate-ping" />
                    <span>Diagnostics & Verification Log</span>
                  </h4>
                  <p className="text-[9px] text-[#A1A1AA] mt-0.5 leading-tight">Live tracking of core system clicks, triggers, failures and API syncs.</p>
                </div>
                
                {analyticsEvents.length > 0 && (
                  <button
                    onClick={handleClearLogs}
                    className="p-1 px-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-mono text-[8px] rounded uppercase font-black tracking-wider transition-all border border-red-500/15 cursor-pointer"
                  >
                    Clear Logs
                  </button>
                )}
              </div>

              {analyticsEvents.length === 0 ? (
                <div className="p-3 bg-white/[0.01] border border-white/5 rounded-xl text-center">
                  <span className="text-[10px] text-zinc-500 font-mono tracking-wide">No diagnostic events logged. Start creating to trigger analytics!</span>
                </div>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {analyticsEvents.slice(0, 8).map((ev, index) => {
                    const date = new Date(ev.timestamp);
                    const isErr = ev.event.toLowerCase().includes("fail") || ev.event.toLowerCase().includes("err");
                    const isSuccess = ev.event.toLowerCase().includes("success");
                    const isFallback = ev.event.toLowerCase().includes("fallback");
                    
                    return (
                      <div 
                        key={index} 
                        className="p-2.5 bg-[#050505] border border-white/5 rounded-xl flex flex-col gap-1 hover:border-white/10 transition-colors"
                      >
                        <div className="flex items-center justify-between text-[9px] font-mono">
                          <span className={`font-black uppercase tracking-wider ${
                            isErr ? "text-red-400" : isSuccess ? "text-[#C8FF5A]" : isFallback ? "text-[#FFBE1A]" : "text-purple-400"
                          }`}>
                            {ev.event}
                          </span>
                          <span className="text-zinc-500 text-[8px]">
                            {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </span>
                        </div>
                        
                        {/* Render metadata cleanly */}
                        {ev.metadata && Object.keys(ev.metadata).length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-0.5">
                            {Object.entries(ev.metadata).map(([k, v]) => (
                              <span key={k} className="px-1.5 py-0.5 bg-white/[0.03] text-[8.5px] font-mono text-[#A1A1AA] rounded border border-white/5 leading-none">
                                <span className="text-zinc-500">{k}:</span> {typeof v === 'object' ? JSON.stringify(v) : String(v)}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  
                  {analyticsEvents.length > 8 && (
                    <div className="text-center text-[8.5px] font-mono text-zinc-500 pt-1">
                      + {analyticsEvents.length - 8} additional verification event records preserved.
                    </div>
                  )}
                </div>
              )}
            </GlowCard>
          </motion.div>
        )}

        {/* Section 3: Content Preferences */}
        {activeSection === "preferences" && (
          <motion.div
            key="preferences-sub"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4 font-sans"
          >
            {/* Preferred format settings */}
            <GlowCard glowColor="none" className="p-4 bg-[#111111]/95 border-white/5 space-y-4">
              <h3 className="text-xs font-mono text-white uppercase tracking-wider border-b border-white/[0.04] pb-2">
                Pacing & Formatting Filters
              </h3>

              {/* Tones statistics */}
              <div>
                <span className="text-[10px] font-mono text-[#A1A1AA] block uppercase mb-2">
                  Learned Tone Profiles (Silently Recorded)
                </span>
                {topTones.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {topTones.map(([tone, weight]) => (
                      <span key={tone} className="p-2 py-1.5 bg-white/5 border border-white/5 text-[11px] text-white rounded-lg font-medium">
                        {tone} <span className="text-[#FF4FD8] font-bold">({weight}x used)</span>
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs text-[#A1A1AA] block bg-white/[0.01] p-3 rounded-xl border border-white/5">
                    No custom interactions parsed yet. Fill the "Train Nannu AI" section below or start copying scripts to generate tones automatically.
                  </span>
                )}
              </div>

              {/* Format weight statistic */}
              <div className="pt-2">
                <span className="text-[10px] font-mono text-[#A1A1AA] block uppercase mb-2">
                  Learned Content Formats
                </span>
                {topStyles.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {topStyles.map(([style, weight]) => (
                      <span key={style} className="p-2 py-1.5 bg-[#C8FF5A]/5 border border-[#C8FF5A]/20 text-[11px] text-[#C8FF5A] rounded-lg font-semibold">
                        {style} <span className="font-bold">({weight}x)</span>
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs text-[#A1A1AA] block bg-white/[0.01] p-3 rounded-xl border border-white/5">
                    Pure Talking Head script model active by default.
                  </span>
                )}
              </div>

              {/* General style override selection */}
              <div className="pt-2 border-t border-white/[0.04]">
                <span className="text-[10px] font-mono text-[#A1A1AA] block uppercase mb-1">
                  Preferred Sentence Layout
                </span>
                <div className="bg-[#050505]/80 p-3.5 rounded-xl border border-white/5 flex justify-between items-center text-xs">
                  <span className="text-[#A1A1AA]">Target Sentence Structure</span>
                  <span className="text-[#FF4FD8] font-mono font-bold uppercase tracking-wider text-[10px]">
                    {profilePref.sentenceLengthTrend}
                  </span>
                </div>
                <p className="text-[9px] text-[#555] font-mono mt-1.5 uppercase">
                  💡 Dynamic: Click scripts copy actions to shift this between short, conversational, and storytelling modes.
                </p>
              </div>
            </GlowCard>

            {/* Quick customization reset triggers */}
            <GlowCard glowColor="none" className="p-4 bg-[#111111]/90 border-white/5">
              <h4 className="text-[11px] font-mono text-white uppercase tracking-wider mb-2">Clear Adaptive Intelligence</h4>
              <p className="text-[10px] text-[#A1A1AA] mb-4.5">Reset your hidden analytical state memory. This resets Nannu's automatically learned tones, formats, and structural weights.</p>
              <button
                onClick={() => {
                  const cleaned: PreferenceProfile = {
                    interactions: {
                      copiedCount: 0,
                      savedCount: 0,
                      regeneratedCount: 0,
                      editedCount: 0,
                      revisitedCount: 0,
                      readingSecTotal: 0,
                      exportedCount: 0,
                      generateMoreCount: 0
                    },
                    preferredTones: {},
                    preferredStyle: {},
                    preferredVocabulary: {},
                    sentenceLengthTrend: "punchy & conversational",
                    preferredHookStyle: {},
                    preferredCtaStyle: {},
                    successfulPatterns: []
                  };
                  savePreferenceProfile(cleaned);
                  setTrainingFeedback("Failsafe triggers: Restored automated profiling to factory settings!");
                  setTimeout(() => setTrainingFeedback(null), 3000);
                }}
                className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-mono text-[9px] border border-red-500/20 rounded-xl cursor-pointer transition-colors"
              >
                CONFIRM FACTORY STYLE DELETION
              </button>
            </GlowCard>
          </motion.div>
        )}

        {/* Section 4: Train Nannu AI Customize Center */}
        {activeSection === "train" && (
          <motion.div
            key="train-sub"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-5 font-sans text-left"
          >
            {/* Feedback alert panel */}
            {trainingFeedback && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-[#C8FF5A]/10 border border-[#C8FF5A]/35 text-[#C8FF5A] text-xs font-sans rounded-xl flex items-center gap-2"
              >
                <CheckCircle size={14} className="shrink-0" />
                <span>{trainingFeedback}</span>
              </motion.div>
            )}

            {/* HEADER BRANDING BANNER - Apple/Linear Style */}
            <div className="flex flex-col gap-1 pb-1">
              <div className="flex items-center gap-2">
                <Brain size={16} className="text-[#FF4FD8]" />
                <h3 className="text-xs font-mono text-[#FF4FD8] uppercase tracking-wider font-bold">
                  My AI Style
                </h3>
              </div>
              <h2 className="text-lg font-black text-white uppercase tracking-tight">Style Personalization Center</h2>
              <p className="text-xs text-[#A1A1AA] leading-relaxed">
                Nannu learns your natural writing voice, vocabulary, and structural pacing organically from your content seeds.
              </p>
            </div>

            {/* Premium Section 1: VOICE MATCH INTELLIGENCE CARD (Apple/Spotify Style metrics dashboard) */}
            <GlowCard glowColor="purple" className="p-5 bg-gradient-to-tr from-[#111111]/95 to-[#050505]/95 border-white/5 relative overflow-hidden">
              <div className="absolute -top-16 -right-16 w-36 h-36 bg-[#FF4FD8]/10 filter blur-3xl rounded-full" />
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* Voice Sync visualization block */}
                <div className="flex items-center gap-4">
                  <div className="relative flex items-center justify-center shrink-0">
                    <div className="w-14 h-14 rounded-full border-2 border-dashed border-[#FF4FD8]/40 animate-spin" style={{ animationDuration: '10s' }} />
                    <div className="absolute inset-1.5 rounded-full bg-gradient-to-tr from-[#FF4FD8] to-[#9333EA] p-0.5 flex items-center justify-center">
                      <div className="w-full h-full rounded-full bg-[#050505] flex items-center justify-center">
                        <Fingerprint size={16} className="text-[#C8FF5A]" />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-[9px] font-mono text-[#C8FF5A] uppercase tracking-wider block font-bold">
                      Synthesis Status
                    </span>
                    <h4 className="text-sm font-extrabold text-white">Active Voice Wave Match</h4>
                    <p className="text-[10px] text-[#A1A1AA] mt-0.5">Continuous fine-tuning active</p>
                  </div>
                </div>

                {/* Score visualization badges */}
                <div className="flex items-center gap-2.5">
                  <div className="py-2 px-3 bg-white/5 rounded-xl border border-white/5 text-center min-w-[70px]">
                    <span className="text-xs font-mono font-black text-white block">98.4%</span>
                    <span className="text-[8px] font-mono text-[#A1A1AA] uppercase">Similarity</span>
                  </div>

                  <div className="py-2 px-3 bg-white/5 rounded-xl border border-white/5 text-center min-w-[70px]">
                    <span className="text-xs font-mono font-black text-[#C8FF5A] block">24</span>
                    <span className="text-[8px] font-mono text-[#A1A1AA] uppercase">Samples</span>
                  </div>

                  <div className="py-2 px-3 bg-gradient-to-tr from-[#FF4FD8]/20 to-purple-500/10 rounded-xl border border-[#FF4FD8]/25 text-center min-w-[70px]">
                    <span className="text-xs font-mono font-black text-[#FF4FD8] block">99.2%</span>
                    <span className="text-[8px] font-mono text-[#A1A1AA] uppercase font-semibold">Confidence</span>
                  </div>
                </div>
              </div>

              {/* Learning Progress Waveform */}
              <div className="mt-4 pt-4 border-t border-white/[0.04]">
                <div className="flex items-center justify-between text-[10px] text-[#A1A1AA] font-mono mb-2">
                  <span className="uppercase tracking-wider">Voice Match Synaptic Sequence</span>
                  <span className="text-white">Active Feed Sync • Hyper-calibrated</span>
                </div>
                {/* Simulated equalizer waves */}
                <div className="h-6 flex items-end gap-1 px-1.5 bg-white/[0.01] rounded-lg p-1.5 border border-white/[0.02]">
                  {[30, 45, 60, 25, 90, 75, 40, 85, 100, 50, 70, 35, 80, 95, 60, 45, 75, 30, 90, 65, 85, 40, 70, 99].map((height, ix) => (
                    <motion.div
                      key={ix}
                      className="flex-1 rounded-sm bg-[#C8FF5A]"
                      animate={{ height: [`${height * 0.3}%`, `${height * 1.1}%`, `${height * 0.5}%`] }}
                      transition={{
                        repeat: Infinity,
                        duration: 1.2 + (ix % 3) * 0.2,
                        ease: "easeInOut"
                      }}
                    />
                  ))}
                </div>
              </div>
            </GlowCard>

            {/* Premium Section 2: WRITING SAMPLES CONTROL BOARD */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-[#A1A1AA] uppercase tracking-wider block font-bold">
                  My Style Seeds & Samples
                </span>
                <span className="text-[8px] font-mono text-[#C8FF5A] uppercase tracking-wider bg-[#C8FF5A]/10 border border-[#C8FF5A]/20 px-2 py-0.5 rounded">
                  Organic Sync Active
                </span>
              </div>

              <GlowCard glowColor="none" className="p-0 bg-[#111111]/95 border-white/5 overflow-hidden">
                {/* Segment tabs */}
                <div className="flex border-b border-white/[0.04] bg-white/[0.02]">
                  {[
                    { id: "upload", label: "Upload Scripts", icon: Upload },
                    { id: "script", label: "Paste Script", icon: FileText },
                    { id: "caption", label: "Import Captions", icon: MessageSquare }
                  ].map((tab) => {
                    const isTabActive = writingSampleTab === tab.id;
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setWritingSampleTab(tab.id as any)}
                        className={`flex-1 py-3 px-1 text-center text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          isTabActive ? "text-white border-b-2 border-[#FF4FD8] bg-white/[0.02]" : "text-[#A1A1AA] hover:text-white"
                        }`}
                      >
                        <Icon size={12} className={isTabActive ? "text-[#FF4FD8]" : "text-[#A1A1AA]"} />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="p-4 bg-[#111111]/40">
                  {/* TAB 1: Upload Scripts */}
                  {writingSampleTab === "upload" && (
                    <div className="space-y-3">
                      <p className="text-[11px] text-[#A1A1AA]/90 leading-relaxed">
                        Drag previous video scripts or transcripts here to analyze length, grammar style patterns, and structural pacing flags.
                      </p>

                      <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDropFile}
                        className={`border-2 border-dashed rounded-xl p-5 text-center transition-all duration-300 cursor-pointer ${
                          dragOver ? "border-[#FF4FD8] bg-[#FF4FD8]/5" : "border-white/10 bg-[#050505]/40 hover:border-white/20"
                        }`}
                        onClick={() => {
                          setTrainingFeedback("Analyzing reference document structure...");
                          setTimeout(() => {
                            const updated = {
                              ...trainingPrefs,
                              pastScripts: [...trainingPrefs.pastScripts, `Sample Style Seed Script ${trainingPrefs.pastScripts.length + 1}.txt`]
                            };
                            saveTrainingSettings(updated);
                            setTrainingFeedback("Successfully analyzed reference style seed!");
                            setTimeout(() => setTrainingFeedback(null), 3000);
                          }, 1000);
                        }}
                      >
                        <Upload size={18} className="mx-auto text-[#A1A1AA] mb-2" />
                        <span className="text-xs text-white font-bold block mb-0.5">Click or drag script files here</span>
                        <span className="text-[9px] text-[#A1A1AA] uppercase font-mono">Txt, PDF or Markdown format up to 10MB</span>
                      </div>

                      {trainingPrefs.pastScripts.length > 0 && (
                        <div className="pt-2">
                          <span className="text-[9px] font-mono text-[#A1A1AA] block uppercase mb-1.5 font-bold">Analyzed Seeds ({trainingPrefs.pastScripts.length})</span>
                          <div className="space-y-1.5">
                            {trainingPrefs.pastScripts.slice(-3).map((s, id) => (
                              <div key={id} className="text-[10px] text-white/80 bg-white/[0.01] border border-white/5 p-2 px-3 rounded-lg flex items-center justify-between font-mono">
                                <span className="flex items-center gap-2 truncate">
                                  <FileText size={11} className="text-[#FF4FD8] shrink-0" />
                                  <span className="truncate">{s.substring(0, 35)}</span>
                                </span>
                                <span className="text-emerald-400 uppercase text-[8px] font-bold tracking-wider shrink-0">SYNCHRONIZED</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 2: Paste Scripts */}
                  {writingSampleTab === "script" && (
                    <div className="space-y-3">
                      <p className="text-[11px] text-[#A1A1AA]/90 leading-relaxed font-sans">
                        Have high-performing scripts that fit your exact voice style? Paste them here to formulate visual pattern triggers.
                      </p>

                      <div>
                        <textarea
                          value={scriptPasteInput}
                          onChange={(e) => setScriptPasteInput(e.target.value)}
                          placeholder="E.g. These 3 simple tools can 10x your SaaS reach without a single paid ad. Let me break it down step-by-step..."
                          rows={4}
                          className="w-full bg-[#050505] text-xs text-white p-3 border border-white/5 focus:border-[#FF4FD8]/40 focus:outline-none rounded-xl resize-none font-sans leading-relaxed"
                        />
                        <button
                          onClick={handlePasteScriptSubmit}
                          disabled={!scriptPasteInput.trim()}
                          className="mt-2.5 w-full py-2 bg-[#FF4FD8] hover:bg-[#FF4FD8]/90 text-black font-bold text-xs rounded-xl cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all uppercase tracking-wider font-mono"
                        >
                          Train From Past Script
                        </button>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: Import Captions */}
                  {writingSampleTab === "caption" && (
                    <div className="space-y-3">
                      <p className="text-[11px] text-[#A1A1AA]/90 leading-relaxed font-sans">
                        Import past social post descriptions or paragraph structures to replicate spacing and bulleting defaults.
                      </p>

                      <div>
                        <textarea
                          value={captionPasteInput}
                          onChange={(e) => setCaptionPasteInput(e.target.value)}
                          placeholder="Paste reference caption... E.g. The gap between leverage and direct labor is where micro-SaaS owners wins. Detailed playbook inside our bio... #startuplife"
                          rows={4}
                          className="w-full bg-[#050505] text-xs text-white p-3 border border-white/5 focus:border-[#FF4FD8]/40 focus:outline-none rounded-xl resize-none font-sans leading-relaxed"
                        />
                        <button
                          onClick={handlePasteCaptionSubmit}
                          disabled={!captionPasteInput.trim()}
                          className="mt-2.5 w-full py-2 bg-gradient-to-tr from-[#9333EA] to-[#FF4FD8] text-white font-bold text-xs rounded-xl cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all uppercase tracking-wider font-mono"
                        >
                          Import Caption Framework
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </GlowCard>
            </div>

            {/* Premium Section 3: ADVANCED PREFERENCES (Collapsible layout) */}
            <div className="space-y-2">
              <button
                onClick={() => setIsAdvancedCollapsibleOpen(!isAdvancedCollapsibleOpen)}
                className="w-full py-2.5 px-4 bg-[#111111]/90 hover:bg-[#111111] transition-all rounded-xl border border-white/5 flex items-center justify-between text-left cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Settings size={13} className="text-[#A1A1AA]" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">Advanced Preferences</span>
                </div>
                <ChevronRight
                  size={14}
                  className={`text-[#A1A1AA] transition-transform duration-300 ${
                    isAdvancedCollapsibleOpen ? "rotate-90 text-[#FF4FD8]" : ""
                  }`}
                />
              </button>

              <AnimatePresence>
                {isAdvancedCollapsibleOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden space-y-2.5 pt-1"
                  >
                    {/* Advanced Item A: Favorite Creators Inspiration */}
                    <div className="p-4 bg-[#111111]/90 rounded-xl border border-white/5 space-y-3">
                      <div>
                        <h4 className="text-xs font-bold text-white uppercase tracking-wide">Favorite Creator Inspiration</h4>
                        <p className="text-[10px] text-[#A1A1AA] mt-0.5 leading-relaxed">Add creators whose pacing, brevity, or structure you want Nannu to analyze and blend.</p>
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newCreatorInput}
                          onChange={(e) => setNewCreatorInput(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleAddCreatorInspiration()}
                          placeholder="Add creator (e.g. Ali Abdaal, Alex Hormozi)"
                          className="flex-1 bg-[#050505] text-xs text-white p-2.5 border border-white/5 rounded-xl focus:border-[#FF4FD8]/40 focus:outline-none"
                        />
                        <button
                          onClick={handleAddCreatorInspiration}
                          className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 text-white rounded-xl cursor-pointer transition-all flex items-center justify-center shrink-0"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      {trainingPrefs.favoriteCreators.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {trainingPrefs.favoriteCreators.map((creator, i) => (
                            <span key={i} className="inline-flex items-center gap-1 p-2 py-0.5 bg-[#FF4FD8]/5 border border-[#FF4FD8]/15 text-xs text-[#FF4FD8] rounded-xl font-bold">
                              <span>{creator}</span>
                              <button
                                onClick={() => handleRemoveCreatorInspiration(i)}
                                className="hover:text-red-500 font-bold ml-1.5 text-[11px] cursor-pointer"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Advanced Item B: Custom writing instructions constraints */}
                    <div className="p-4 bg-[#111111]/90 rounded-xl border border-white/5 space-y-3">
                      <div>
                        <h4 className="text-xs font-bold text-white uppercase tracking-wide">Custom Writing Instructions</h4>
                        <p className="text-[10px] text-[#A1A1AA] mt-0.5 leading-relaxed">Hard constraints that Nannu AI must strictly adhere to across all output scripts.</p>
                      </div>

                      <textarea
                        value={trainingPrefs.customInstructions}
                        onChange={(e) => {
                          const updated = { ...trainingPrefs, customInstructions: e.target.value };
                          saveTrainingSettings(updated);
                        }}
                        rows={3}
                        className="w-full bg-[#050505] text-xs text-white p-3 border border-white/5 focus:border-[#FF4FD8]/40 focus:outline-none rounded-xl resize-none font-sans leading-relaxed"
                        placeholder="E.g. Set specific constraints. Write exclusively in first-person singular. Keep sentences punchy, avoid empty intros."
                      />
                      <span className="text-[9px] font-mono text-[#555] block uppercase">
                        💡 DIRECTIVES: E.g., &quot;never start with a rhetorical question; write in punchy direct lines&quot;
                      </span>
                    </div>

                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* Section 5: Saved Scripts vault drawer list */}
        {activeSection === "scripts" && (
          <motion.div
            key="scripts-sub"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {localLibraryList.length === 0 ? (
              <div className="text-center p-8 bg-[#111111]/90 border border-white/5 rounded-2xl font-sans">
                <AlertCircle className="mx-auto text-[#A1A1AA] mb-2" size={24} />
                <h4 className="text-xs font-bold text-white mb-1 uppercase tracking-wide">No Saved Drafts</h4>
                <p className="text-[10px] text-[#A1A1AA] max-w-[200px] mx-auto leading-relaxed">You haven't copied or manually archived any high-retention mock-ups in your profile synapse vault yet.</p>
              </div>
            ) : (
              <div className="space-y-3 font-sans">
                {localLibraryList.map((item) => (
                  <div key={item.id}>
                    <GlowCard glowColor="none" className="p-4 bg-[#111111]/95 border-white/5">
                      <div className="flex items-start justify-between mb-2">
                        <div className="max-w-[180px] text-left">
                          <span className="text-[8px] font-mono text-[#FF4FD8] uppercase font-bold tracking-wider mb-0.5 block">
                            {item.contentType} • {item.duration}
                          </span>
                          <h4 className="text-xs font-black text-white hover:text-[#C8FF5A] transition-colors leading-snug cursor-pointer" onClick={() => onSelectScript && onSelectScript(item)}>
                            {item.prompt}
                          </h4>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleToggleFavLocal(item.id)}
                            className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-[#FF4FD8] transition-colors cursor-pointer"
                          >
                            <Heart size={12} fill={item.isFavorite ? "#FF4FD8" : "transparent"} />
                          </button>
                          <button
                            onClick={() => {
                              if (item.data?.script?.hook?.text) {
                                const fullText = `HOOK:\n${item.data.script.hook.text}\n\nBODY:\n${item.data.script.body.text}\n\nCTA:\n${item.data.script.cta.text}`;
                                navigator.clipboard.writeText(fullText).then(() => {
                                  setCopiedId(item.id);
                                  setTimeout(() => setCopiedId(null), 1500);
                                });
                              }
                            }}
                            className={`${
                              copiedId === item.id ? "bg-[#C8FF5A] text-black" : "bg-white/5 text-[#A1A1AA] hover:text-white"
                            } p-1.5 rounded-lg text-xs transition-colors cursor-pointer flex items-center gap-1`}
                          >
                            {copiedId === item.id ? <Check size={11} /> : <Copy size={11} />}
                          </button>
                          <button
                            onClick={() => handleDeleteLocal(item.id)}
                            className="p-1.5 bg-white/5 hover:bg-red-500/10 hover:text-red-400 rounded-lg text-[#A1A1AA] transition-colors cursor-pointer"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                      {/* Tiny visual text preview snippet */}
                      <p className="text-[10px] text-[#A1A1AA] leading-relaxed line-clamp-2 bg-[#050505]/40 p-2 rounded-lg border border-white/5 italic">
                        "{item.data?.script?.hook?.text}"
                      </p>
                    </GlowCard>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Section 6: Usage Statistics */}
        {activeSection === "stats" && (
          <motion.div
            key="stats-sub"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4 font-sans"
          >
            {/* Real Stats parameters grids or Empty State if no stats yet */}
            {stats.scriptsGenerated === 0 && stats.practiceSessions === 0 && stats.draftsSaved === 0 && stats.totalPracticeSeconds === 0 ? (
              <div className="text-center p-8 bg-[#111111]/90 border border-white/5 rounded-2xl font-sans">
                <BarChart3 className="mx-auto text-[#A1A1AA] mb-2" size={24} />
                <h4 className="text-xs font-bold text-white mb-1 uppercase tracking-wide">No Analytics Logged Yet</h4>
                <p className="text-[10px] text-[#A1A1AA] max-w-[220px] mx-auto leading-relaxed">
                  Start generating your custom script or practicing with the live teleprompter to see real-time statistics here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {stats.scriptsGenerated > 0 && (
                  <GlowCard glowColor="none" className="p-3.5 bg-[#111111]/90 border-white/5 text-center">
                    <span className="text-[18px] font-black font-mono text-white block mb-0.5">{stats.scriptsGenerated}</span>
                    <span className="text-[9px] font-mono text-[#A1A1AA] uppercase tracking-wider">Scripts Generated</span>
                  </GlowCard>
                )}
                {stats.draftsSaved > 0 && (
                  <GlowCard glowColor="none" className="p-3.5 bg-[#111111]/90 border-white/5 text-center">
                    <span className="text-[18px] font-black font-mono text-white block mb-0.5">{stats.draftsSaved}</span>
                    <span className="text-[9px] font-mono text-[#A1A1AA] uppercase tracking-wider">Drafts Saved</span>
                  </GlowCard>
                )}
                {stats.practiceSessions > 0 && (
                  <GlowCard glowColor="none" className="p-3.5 bg-[#111111]/90 border-white/5 text-center">
                    <span className="text-[18px] font-black font-mono text-[#C8FF5A] block mb-0.5">{stats.practiceSessions}</span>
                    <span className="text-[9px] font-mono text-[#A1A1AA] uppercase tracking-wider">Practice Sessions</span>
                  </GlowCard>
                )}
                {stats.totalPracticeSeconds > 0 && (
                  <GlowCard glowColor="none" className="p-3.5 bg-[#111111]/90 border-white/5 text-center">
                    <span className="text-[18px] font-black font-mono text-[#FF4FD8] block mb-0.5">
                      {formatSeconds(stats.totalPracticeSeconds)}
                    </span>
                    <span className="text-[9px] font-mono text-[#A1A1AA] uppercase tracking-wider">Total Practice Time</span>
                  </GlowCard>
                )}
                {stats.currentStreak > 0 && (
                  <GlowCard glowColor="none" className="p-3.5 bg-[#111111]/90 border-white/5 text-center col-span-2">
                    <span className="text-[18px] font-black font-mono text-blue-400 block mb-0.5">
                      {stats.currentStreak} {stats.currentStreak === 1 ? "Day" : "Days"}
                    </span>
                    <span className="text-[9px] font-mono text-[#A1A1AA] uppercase tracking-wider">Current Practice Streak</span>
                  </GlowCard>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
