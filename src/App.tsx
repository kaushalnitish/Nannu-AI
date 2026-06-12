/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { Header } from "react"; // Actually we can write custom layouts directly
import { motion, AnimatePresence } from "motion/react";
import { Brain, Heart, Layers, Sparkles, UserCircle } from "lucide-react";

import { GeneratedScriptPayload, LibraryItem, VoiceSettings } from "./types";
import {
  getSavedLibrary,
  getSavedVoiceSettings,
  saveLibraryItem,
  saveVoiceSettings,
  toggleFavoriteItem,
  deleteLibraryItem,
  updateLibraryItem
} from "./utils/mockData";
import {
  getPreferenceProfileString,
  trackCopyAction,
  trackSaveAction,
  trackRegenerateAction,
  trackEditAction,
  trackRevisitAction
} from "./utils/preferences";

// Components
import BottomNavBar from "./components/BottomNavBar";

// Screens
import WelcomeScreen from "./screens/WelcomeScreen";
import DurationScreen from "./screens/DurationScreen";
import TypeScreen from "./screens/TypeScreen";
import GeneratingScreen from "./screens/GeneratingScreen";
import ScriptScreen from "./screens/ScriptScreen";
import CaptionScreen from "./screens/CaptionScreen";
import ThumbnailScreen from "./screens/ThumbnailScreen";
import LibraryScreen from "./screens/LibraryScreen";
import ProfileScreen from "./screens/ProfileScreen";
import AnalyzeScreen from "./screens/AnalyzeScreen";

export default function App() {
  // Navigation State
  const [currentRoute, setCurrentRoute] = useState<string>("home");
  const [activeTab, setActiveTab] = useState<"home" | "create" | "library" | "profile">("home");
  const [initialProfileSection, setInitialProfileSection] = useState<string | null>(null);

  // Accessibility theme state (Dark / Light)
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    return (localStorage.getItem("theme") as "dark" | "light") || "dark";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
  };

  // Creation State parameters
  const [prompt, setPrompt] = useState("");
  const [mood, setMood] = useState("Confident 😎");
  const [duration, setDuration] = useState("45 sec");
  const [contentType, setContentType] = useState("Talking Head");
  const [language, setLanguage] = useState("English");

  // Output States
  const [generatedPayload, setGeneratedPayload] = useState<GeneratedScriptPayload | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isModifyingCaption, setIsModifyingCaption] = useState(false);

  // Persistence States
  const [libraryList, setLibraryList] = useState<LibraryItem[]>([]);
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    vocabulary: "Executive SaaS & Startup",
    baseEnergy: "Dynamic Speech",
    voiceSyncScore: 92,
    lastTrained: "4 hours ago"
  });

  // Load persistence records
  useEffect(() => {
    setLibraryList(getSavedLibrary());
    setVoiceSettings(getSavedVoiceSettings());
  }, []);

  // Hash-based client router synchronization
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash || "#/home";
      const route = hash.replace("#/", "");

      // Sync navigation active tabs based on active path
      if (route === "home") {
        setActiveTab("home");
      } else if (route.startsWith("create/") || route === "analyze") {
        setActiveTab("create");
      } else if (route === "library") {
        setActiveTab("library");
      } else if (route === "profile") {
        setActiveTab("profile");
        setInitialProfileSection(null);
      } else if (route === "voice") {
        setActiveTab("profile"); // Train My Voice belongs in Profile zone
        setInitialProfileSection("train");
      } else if (route === "generating" || route === "script" || route === "caption" || route === "thumbnails") {
        // Keeps create tab active while generating final script outputs
        setActiveTab("create");
      }

      setCurrentRoute(route);
    };

    window.addEventListener("hashchange", handleHashChange);
    
    // Set initial hash route
    if (!window.location.hash) {
      window.location.hash = "#/home";
    } else {
      handleHashChange();
    }

    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Scroll to top on route change via Hash navigation
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentRoute]);

  const navigateTo = (route: string) => {
    window.location.hash = `#/${route}`;
  };

  // Tab changes triggers
  const handleTabChange = (tab: "home" | "create" | "library" | "profile") => {
    if (tab === "home") {
      navigateTo("home");
    } else if (tab === "create") {
      // Re-trigger from first creation options
      navigateTo("create/duration");
    } else if (tab === "library") {
      navigateTo("library");
    } else if (tab === "profile") {
      navigateTo("profile");
    }
  };

  // Handle flow transitions
  const handleStartCreation = (promptText: string) => {
    setPrompt(promptText);
    navigateTo("create/duration");
  };

  const handleDurationSelect = (selectedDuration: string) => {
    setDuration(selectedDuration);
    navigateTo("create/type");
  };

  // Perform Server-Side AI Generation Call
  const handleFormatSelectAndGenerate = async (selectedType: string) => {
    setContentType(selectedType);
    navigateTo("generating");
    setIsGenerating(true);

    try {
      console.log("Requesting script generation via Express proxy with automatic learned profile...");
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt,
          mood: mood,
          duration: duration,
          contentType: selectedType,
          voiceMultiplier: voiceSettings.voiceSyncScore,
          energyLevel: voiceSettings.baseEnergy,
          language: language,
          vocabulary: voiceSettings.vocabulary,
          selectedTones: voiceSettings.selectedTones,
          preferences: getPreferenceProfileString() // Convey silent historic preferences profile
        })
      });

      if (!response.ok) {
        throw new Error("Server returned non-ok format status");
      }

      const payloadData: GeneratedScriptPayload = await response.json();
      setGeneratedPayload(payloadData);

      // Save output to creator library records persistent
      const newItem: LibraryItem = {
        id: `lib-${Date.now()}`,
        timestamp: "Just now",
        prompt: prompt,
        mood: mood,
        duration: duration,
        contentType: selectedType,
        language: language,
        data: payloadData,
        isFavorite: false
      };

      saveLibraryItem(newItem);
      // reload lists
      setLibraryList(getSavedLibrary());

      // Slight wait for nice transition UX
      setTimeout(() => {
        setIsGenerating(false);
        navigateTo("script");
      }, 500);

    } catch (err) {
      console.error("AI Generation failed, falling back to mock sandbox draft:", err);
      // Wait for loader simulation and complete with mock safely
      setTimeout(() => {
        setIsGenerating(false);
        navigateTo("script");
      }, 1000);
    }
  };

  const handleRegenerate = () => {
    trackRegenerateAction({ prompt, mood, contentType });
    handleFormatSelectAndGenerate(contentType);
  };

  const handleEditScriptText = (tab: "hook" | "body" | "cta", newText: string) => {
    if (!generatedPayload) return;
    
    // Track the edit event silently
    trackEditAction({ prompt, mood, contentType });

    const updatedPayload: GeneratedScriptPayload = {
      ...generatedPayload,
      script: {
        ...generatedPayload.script,
        [tab]: {
          ...generatedPayload.script[tab],
          text: newText
        }
      }
    };
    setGeneratedPayload(updatedPayload);

    // Save/sync inline edits to library items so they stay durable
    const existing = libraryList[0]; // Active/latest model item
    if (existing && existing.prompt === prompt) {
      const updatedItem: LibraryItem = {
        ...existing,
        data: updatedPayload
      };
      updateLibraryItem(updatedItem);
      setLibraryList(getSavedLibrary());
    }
  };

  // Caption inline modification trigger
  const handleModifyCaption = (mode: "shorten" | "viral" | "standard") => {
    if (!generatedPayload) return;
    setIsModifyingCaption(true);

    // Simulate AI modifying existing values in-place
    setTimeout(() => {
      let updatedCaptions = [...generatedPayload.captions];
      
      if (mode === "viral") {
        updatedCaptions[1] = `${updatedCaptions[1]} 🔥💸 #viral #creators #startup #ai #nannu`;
        updatedCaptions[2] = `POV: You tuned your content brain with Nannu. 🤫 Comment 'VOICE' for direct file settings blueprints. ${updatedCaptions[2]}`;
      } else if (mode === "shorten") {
        updatedCaptions[0] = "Stop pitching. Do audits on Loom instead. It's friction-free scale. comment below.";
        updatedCaptions[1] = "no website? no problem. sign SaaS retainers this week. details on video. bookmark this.";
      }

      setGeneratedPayload({
        ...generatedPayload,
        captions: updatedCaptions
      });
      setIsModifyingCaption(false);
    }, 1200);
  };

  // Train voice parameters update persistence
  const handleSaveVoiceSettings = (updated: VoiceSettings) => {
    setVoiceSettings(updated);
    saveVoiceSettings(updated);
  };

  const handleAnalysisSuccess = (transformedPayload: GeneratedScriptPayload, originalTopic: string) => {
    // Set parameters
    setPrompt(`Style of ${originalTopic}`);
    setGeneratedPayload(transformedPayload);
    setMood(targetMood => targetMood || mood);

    // Save output to creator library records persistent
    const newItem: LibraryItem = {
      id: `lib-${Date.now()}`,
      timestamp: "Saved just now",
      prompt: `Style of ${originalTopic}`,
      mood: mood,
      duration: duration,
      contentType: contentType,
      language: language,
      data: transformedPayload,
      isFavorite: false
    };

    saveLibraryItem(newItem);
    setLibraryList(getSavedLibrary());

    // Navigate straight to script screen viewer
    navigateTo("script");
  };

  // Library interaction bindings
  const handleSelectLibraryItem = (item: LibraryItem) => {
    setPrompt(item.prompt);
    setMood(item.mood);
    setDuration(item.duration);
    setContentType(item.contentType);
    setGeneratedPayload(item.data);
    
    // Automatically track as revisit
    trackRevisitAction({ prompt: item.prompt, mood: item.mood, contentType: item.contentType });
    navigateTo("script");
  };

  const handleSaveDraft = (customPromptName?: string) => {
    if (!generatedPayload) return;
    const finalName = customPromptName || prompt || "High-Retention Creator Draft";
    
    // Track saving behavior of this customized script 
    trackSaveAction({ prompt: finalName, mood, contentType, vocabulary: voiceSettings.vocabulary });

    // Check for existing element in library
    const existing = libraryList.find(item => item.prompt.toLowerCase() === finalName.toLowerCase());
    if (existing) {
      // Update existing item with the latest payload
      const updatedItem: LibraryItem = {
        ...existing,
        timestamp: "Updated just now",
        data: generatedPayload
      };
      updateLibraryItem(updatedItem);
    } else {
      // Save as completely new draft
      const newItem: LibraryItem = {
        id: `lib-${Date.now()}`,
        timestamp: "Saved just now",
        prompt: finalName,
        mood: mood,
        duration: duration,
        contentType: contentType,
        language: language,
        data: generatedPayload,
        isFavorite: false
      };
      saveLibraryItem(newItem);
    }
    
    // Re-load lists to sync live
    setLibraryList(getSavedLibrary());
  };

  const handleToggleFavorite = (id: string) => {
    const item = libraryList.find(i => i.id === id);
    if (item && !item.isFavorite) {
      // Actively adding to favorite: track as preferred layout save success
      trackSaveAction({ prompt: item.prompt, mood: item.mood, contentType: item.contentType, vocabulary: voiceSettings.vocabulary });
    }
    const updated = toggleFavoriteItem(id);
    setLibraryList(updated);
  };

  const handleRemoveLibraryItem = (id: string) => {
    const updated = deleteLibraryItem(id);
    setLibraryList(updated);
  };

  // Render screens dynamically using Hash state router
  const renderScreen = () => {
    switch (currentRoute) {
      case "create/duration":
        return (
          <DurationScreen
            onNext={handleDurationSelect}
            onBack={() => navigateTo("home")}
            savedDuration={duration}
          />
        );
      case "create/type":
        return (
          <TypeScreen
            onGenerate={handleFormatSelectAndGenerate}
            onBack={() => navigateTo("create/duration")}
            savedType={contentType}
          />
        );
      case "generating":
        return <GeneratingScreen onComplete={() => navigateTo("script")} />;
      case "script":
        return (
          <ScriptScreen
            payload={generatedPayload || {
              script: {
                hook: { text: "No draft loaded. Click home to start.", action: "Visual: Click Home tab." },
                body: { text: "Brain waves are unconfigured.", action: "" },
                cta: { text: "", action: "" }
              },
              captions: ["", "", ""],
              thumbnails: []
            }}
            onBack={() => navigateTo("create/type")}
            onNavigateToCaption={() => navigateTo("caption")}
            onNavigateToThumbnails={() => navigateTo("thumbnails")}
            onRegenerate={handleRegenerate}
            isRegenerating={isGenerating}
            onSaveDraft={handleSaveDraft}
            prompt={prompt}
            mood={mood}
            contentType={contentType}
            onEditScriptText={handleEditScriptText}
          />
        );
      case "caption":
        return (
          <CaptionScreen
            captions={generatedPayload?.captions || ["No caption loaded. Generate first."]}
            onBack={() => navigateTo("script")}
            onModify={handleModifyCaption}
            isModifying={isModifyingCaption}
            prompt={prompt}
            mood={mood}
            contentType={contentType}
          />
        );
      case "thumbnails":
        return (
          <ThumbnailScreen
            thumbnails={generatedPayload?.thumbnails || []}
            onBack={() => navigateTo("script")}
            prompt={prompt}
            mood={mood}
            contentType={contentType}
          />
        );
      case "library":
        return (
          <LibraryScreen
            libraryList={libraryList}
            onSelect={handleSelectLibraryItem}
            onToggleFavorite={handleToggleFavorite}
            onDeleteItem={handleRemoveLibraryItem}
          />
        );
      case "profile":
      case "voice":
        return (
          <ProfileScreen
            scriptsCount={libraryList.length}
            voiceSyncScore={voiceSettings.voiceSyncScore}
            theme={theme}
            onToggleTheme={toggleTheme}
            initialSection={initialProfileSection}
            onClearInitialSection={() => setInitialProfileSection(null)}
            onSelectScript={(item) => {
              handleSelectLibraryItem(item);
            }}
          />
        );
      case "analyze":
        return (
          <AnalyzeScreen
            onBack={() => navigateTo("home")}
            onAnalysisSuccess={handleAnalysisSuccess}
          />
        );
      case "home":
      default:
        return (
          <WelcomeScreen
            onStartCreation={handleStartCreation}
            savedPrompt={prompt}
            language={language}
            onLanguageChange={setLanguage}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col selection:bg-[#FF4FD8]/30 selection:text-[#FF4FD8]">
      {/* Immersive top subtle neon glow accents */}
      <div className="absolute top-0 left-12 right-12 h-64 bg-gradient-to-b from-[#FF4FD8]/5 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute top-10 left-1/3 right-1/4 h-48 bg-gradient-to-b from-[#A855F7]/4 to-transparent blur-3xl pointer-events-none" />

      {/* Main Responsive Mobile Frame */}
      <main className="flex-1 w-full max-w-md mx-auto px-5 pt-8 pb-32 relative overflow-hidden flex flex-col justify-between">
        
        {/* Router transitions animated screen */}
        <div className="flex-1 flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentRoute}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="flex-1 flex flex-col"
            >
              {renderScreen()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Persistent global iOS bottom tab layout */}
      {currentRoute !== "generating" && (
        <BottomNavBar activeTab={activeTab} onTabChange={handleTabChange} />
      )}
    </div>
  );
}
