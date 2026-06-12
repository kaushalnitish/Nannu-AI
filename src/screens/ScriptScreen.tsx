import { useState, useEffect, useMemo, useRef } from "react";
import { Copy, Sparkles, RefreshCw, ChevronLeft, ArrowRight, Eye, ClipboardCheck, Bookmark, CheckCircle, Save, Edit3, Check, Brain, Share2, Camera, Smile, Film, Play, Sliders, TrendingUp, ChevronDown, ChevronUp, Clapperboard } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { GeneratedScriptPayload } from "../types";
import GlowCard from "../components/GlowCard";
import { trackCopyAction, trackReadingDuration, trackEditAction, getPreferenceProfileString, logAnalyticsEvent } from "../utils/preferences";
import TeleprompterOverlay from "../components/TeleprompterOverlay";

interface Particle {
  id: number;
  x: number;
  y: number;
  rotation: number;
  color: string;
  size: number;
  emoji?: string;
  delay: number;
}

interface ScriptScreenProps {
  payload: GeneratedScriptPayload;
  prompt: string;
  onBack: () => void;
  onNavigateToCaption: () => void;
  onNavigateToThumbnails: () => void;
  onRegenerate: () => void;
  isRegenerating: boolean;
  onSaveDraft?: (customPromptName?: string) => void;
  mood?: string;
  contentType?: string;
  onEditScriptText?: (tab: "hook" | "body" | "cta", newText: string) => void;
}

interface CreatorActionGuideProps {
  prompt: string;
  mood: string;
  contentType: string;
}

const CreatorActionGuideDetails = ({ prompt, mood, contentType }: CreatorActionGuideProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<number | null>(null);

  // Derive dynamic instructions
  const guideSections = useMemo(() => {
    const isStory = contentType.toLowerCase().includes("story") || contentType.toLowerCase().includes("vlog") || contentType.toLowerCase().includes("pov");
    const isEdu = contentType.toLowerCase().includes("edu") || contentType.toLowerCase().includes("tut") || contentType.toLowerCase().includes("talk") || contentType.toLowerCase().includes("head");
    const isFunny = mood.toLowerCase().includes("funny") || mood.toLowerCase().includes("humor") || mood.toLowerCase().includes("joke") || mood.toLowerCase().includes("roast") || mood.toLowerCase().includes("skit");

    const cleanTopic = prompt.trim() || "creating viral content";

    const cameraSetup = {
      title: "1. Camera Setup",
      description: isStory 
        ? `Set up matching a deeply personal cinematic atmosphere. Place your lens exactly at eye level, around 3 feet away to lock in personal proximity for "${cleanTopic}".`
        : isEdu
        ? `Establish authority with a bright, ultra-clean setup. Place your camera slightly above eye level pointing with a subtle 15-degree downward angle for "${cleanTopic}".`
        : isFunny
        ? `Optimize for dynamic visual pacing and relatable home scenarios for "${cleanTopic}". Set up in a casual, recognizable room setting.`
        : `Establish premium short-form framing. Set up your camera lens precisely at eye level, perfectly level, creating immediate digital connection for "${cleanTopic}".`,
      bullets: isStory
        ? [
            "Set a warm, key-side cinematic light profile to cast subtle shadows that evoke real emotional depth.",
            "Use a tight 'Medium Close-up' shot (shoulders to head) to capture critical micro-expressions.",
            "De-activate autofocus tracking to prevent lens-hunting during intense reflective or moving beats."
          ]
        : isEdu
        ? [
            "Use a bright ring light or direct window key light to illuminate dental/facial posture fully.",
            "Keep the camera frame wide enough to capture detailed hand gestures and shoulder movements.",
            "Record at 4K / 30fps to keep dynamic on-screen formulas, charts, and captions crisp."
          ]
        : isFunny
        ? [
            "Use punchy direct lighting to feel highly organic, casual, and relatable to the viewer.",
            "Keep framing versatile—be ready to pick up manual shots or shift closer for deadpan face punchlines.",
            "Clear out any complex distracting backgrounds to keep focus strictly on your comedic performance."
          ]
        : [
            "Arrange a beautiful main light offset 45 degrees for classic, premium dimension-heavy facial shading.",
            "Configure framing using the standard 'Rule of Thirds' line grids, positioning your eyes in the upper third.",
            "Ensure subtle background blur (F/1.8 lens setting) to separate you cleanly from background noise."
          ]
    };

    const actingDelivery = {
      title: "2. Acting & Delivery",
      description: isStory
        ? `Focus heavily on subtle expressions, deep pacing, and scene changes. Bring true emotional realism to "${cleanTopic}".`
        : isEdu
        ? `Focus heavily on clarity, strong hand gestures, and authoritative visual examples for "${cleanTopic}".`
        : isFunny
        ? `Focus heavily on comedic timing, exaggerated face reactions, and perfect delivery of punchlines for "${cleanTopic}".`
        : `Command immediate digital authority. Pace yourself intentionally so your points feel premium and highly actionable.`,
      bullets: isStory
        ? [
            "Use intentional 1.5-second pauses directly before delivering critical plot twists or heavy insights.",
            "Keep vocal energy warm, personal, and conversational—avoid projecting like a corporate lecture.",
            "Incorporate deep breath-work and slight head turns to emphasize a genuine reflective breakthrough."
          ]
        : isEdu
        ? [
            "Enunciate every syllable with high-conviction; utilize bold physical hand anchors to punctuate key ideas.",
            "Maintain positive posture, keeping an encouraging mentor smile as you explain complex topics.",
            "Vary speak cadence: slow down on highly advanced terms, accelerate briefly when summarizing quick steps."
          ]
        : isFunny
        ? [
            "Match fast-tempo setup speech with dramatic deadpan silence immediately preceding the joke's payoff.",
            "Deliver punchlines direct to the center-glass with a steady, unblinking glare to capture modern irony.",
            "Use quick change vocal inflections (e.g., sudden high pitches or whispers) to play different character perspectives."
          ]
        : [
            "Speak at approximately 150-160 words-per-minute (the optimal sweet spot for high short-form retention).",
            "Keep your stance engaged, leaning forward slightly when stating the core value-proposition or solution.",
            "Banish filler words like 'uh', 'um', 'literally' to maintain high visual standard."
          ]
    };

    const sceneSuggestions = {
      title: "3. Scene Suggestions",
      description: isStory
        ? `Break the visual monotony with alternating setups that support the progression of "${cleanTopic}".`
        : isEdu
        ? `Introduce physical layout shifts to back up the technical insights of "${cleanTopic}".`
        : isFunny
        ? `Stitch together punchy everyday scene layouts to create high comedic pacing for "${cleanTopic}".`
        : `Simple, professional layouts structured for high-performance short-form content.`,
      bullets: isStory
        ? [
            "Scene 1: Intimate cozy desk/armchair area for the opening hook and initial personal conflict.",
            "Scene 2: Transition outdoors or walking around your space as the core resolution begins to build.",
            "Scene 3: Deep intimate extreme-close up back in the main studio to wrap up the emotional takeaway."
          ]
        : isEdu
        ? [
            "Scene 1: Central talking-head desk space with high-end monitors or warm bookshelves in focus.",
            "Scene 2: Close-up POV angle looking down at a notebook page or digital iPad sketchpad drawing lines.",
            "Scene 3: Punchy screen-screen split showing live examples or websites of what you are tutoring."
          ]
        : isFunny
        ? [
            "Scene 1: Direct POV address setting up the relatable premise from a neutral household spot (bed, kitchen).",
            "Scene 2: Secondary character reaction angle (using alternate clothes, sunglasses, or hats) representing reactions.",
            "Scene 3: Quick closer frame with double-energy to close the joke cycle with maximum force."
          ]
        : [
            "Scene 1: Sleek aesthetic main recording studio centering your figure against clean background.",
            "Scene 2: Secondary profile camera angle (30-degree rotation) to handle conversational parenthesis.",
            "Scene 3: Dynamic extreme close-up to hammer in strict warnings or direct commands."
          ]
    };

    const bRollIdeas = {
      title: "4. B-Roll Ideas",
      description: isStory
        ? `Support the core narrative thread with atmospheric, emotional, and abstract detail clips for "${cleanTopic}".`
        : isEdu
        ? `Provide immediate visual proof panels that reinforce your lessons on "${cleanTopic}".`
        : isFunny
        ? `Stitch in visual gags, relatable quick takes, and funny stock reactions for "${cleanTopic}".`
        : `Aesthetic macro detail clips to screen-transition jump cuts seamlessly.`,
      bullets: isStory
        ? [
            "Cinematic close-up of fingers typing restlessly on a mechanical keyboard or writing down notes.",
            "Slow-motion panning shots of your workspace, hands holding a warm coffee cup, or deep window reflections.",
            "Subtle visual elements: shadows moving across walls, a clock ticking, or searching on a dark laptop screen."
          ]
        : isEdu
        ? [
            "High-contrast desktop screengrabs navigating the dashboards, metrics, or apps mentioned.",
            "Action-packed macro clicks (stylus drawing on tablet glass, checking items off, physical books opening).",
            "Visual text callouts—animated bold bullet lists floating on screen alongside your audio markers."
          ]
        : isFunny
        ? [
            "Intentional ridiculous usage of everyday things (staring blankly at an empty paper, dramatic typing).",
            "0.5-second fast screen drops of famous pop-culture reaction GIFs, ironic stock imagery, or meme clips.",
            "Quick camera-hand shaking movements or dramatic focus shifts to emphasize awkward pauses."
          ]
        : [
            "Smooth aesthetic B-roll detailing secondary elements (glowing LEDs, adjusting a high-end mic arm).",
            "Rapid macro shots of searching critical search engines or looking through analytics interfaces.",
            "Visual overlays showing your actual caption draft scrolling past in slow motion."
          ]
    };

    const editingSuggestions = {
      title: "5. Editing Suggestions",
      description: isStory
        ? `Edit with patience and emotional cadence, avoiding jarring visual cuts for "${cleanTopic}".`
        : isEdu
        ? `Edit to resemble a crisp mini-syllabus, utilizing heavy graphical assists for "${cleanTopic}".`
        : isFunny
        ? `Use erratic timing, rapid punch-ins, and high comedic audio hits for "${cleanTopic}".`
        : `Modern, high-converting editing steps designed to elevate visual retention.`,
      bullets: isStory
        ? [
            "Keep transitions smooth and natural—rely on subtle cross-dissolves rather than hyperactive glitch slide-ins.",
            "Apply a cozy, warm, filmic color grading with high-contrast shadows and clean natural colors.",
            "Underlay a soft, reflective lo-fi melody at -26dB, letting it swell slightly during heavy narrative gaps."
          ]
        : isEdu
        ? [
            "Delete 100% of your breath nodes and speaking gaps; stitch frames with aggressive talking continuity.",
            "Slide in bold text graphic card overlays (e.g. Montserrat/Inter) summarizing formulas as you dictate them.",
            "Incorporate a distinct mechanical 'Whoosh' or 'Click' audio cue whenever secondary charts pop open."
          ]
        : isFunny
        ? [
            "Utilize instant scale expansions (110% to 142% zoom) to punctuate dry or funny punchlines.",
            "Sprinkle sarcastic SFX triggers (record-scratches, bells, slide whistles, fail buzzers) at awkward pauses.",
            "Cut the frame abruptly mid-sentence during your final punchy word of CTA to trigger loop rewinds."
          ]
        : [
            "Employ subtle 4% scale punch-ins on alternating sentences to hide simple jump cuts seamlessly.",
            "Place high-retention center-screen subtitles (highlighting active verbs in bright green or golden yellow).",
            "Synchronize clip transitions and camera angle rotations with the background music's natural beat drops."
          ]
    };

    const retentionTips = {
      title: "6. Retention Tips",
      description: isStory
        ? `Keep viewers intrinsically curious about the narrative resolution for "${cleanTopic}".`
        : isEdu
        ? `Promise clear actionable visual templates at the finish lines of "${cleanTopic}".`
        : isFunny
        ? `Create rewatchable layers that compel the audience to loop back for "${cleanTopic}".`
        : `Industry standard tactics to optimize your average video completion score.`,
      bullets: isStory
        ? [
            "Never start with a greeting. Drop the viewer center-stage in a crisis point in the first 1.5 seconds.",
            "Open 'story loops' (e.g., 'But the real trap was still ahead...') and leave them hanging until the final minutes.",
            "Craft the last spoken word to flow perfectly into the first word of your opening Hook to design a perfect loop."
          ]
        : isEdu
        ? [
            "Display an on-screen progress indicator tracking steps (e.g., 'Step 2 / 3') so viewers visualize structural value.",
            "Acknowledge early that step 3 contains the actual breakthrough secret that ties the entire guide together.",
            "Expose an immediate shocking statistic or contrast statement within frame-one to disprove a standard myth."
          ]
        : isFunny
        ? [
            "Add highly relatable but extremely fast text blocks to force viewers to pause and rewatch the frame.",
            "Structure situational scripts that demand friend tagging (e.g., 'Tag the one friend who does this...').",
            "Keep CTAs fast, ironic, and self-aware to bypass natural marketing resistance and drive higher engagement."
          ]
        : [
            "Trim out any long introductory explanations—start of with an immediate, high-tempo visual experiment.",
            "Introduce a new visual asset, caption color shift, or camera zoom at least once every 2.1 seconds.",
            "Maintain an active, high-tempo background beat to sub-consciously pace the viewer through the content."
          ]
    };

    return [cameraSetup, actingDelivery, sceneSuggestions, bRollIdeas, editingSuggestions, retentionTips];
  }, [prompt, mood, contentType]);

  return (
    <div className="border-t border-white/5 pt-5 mt-4">
      {/* Interactive Expandable Header Trigger Option */}
      <button
        id="creator-action-guide-trigger"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left bg-gradient-to-r from-purple-500/10 via-[#FF4FD8]/10 to-transparent p-4 rounded-xl border border-[#FF4FD8]/20 flex items-center justify-between cursor-pointer transition-all hover:from-purple-500/15 hover:via-[#FF4FD8]/15"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-600 to-[#FF4FD8] flex items-center justify-center text-white shrink-0 shadow-md">
            <Clapperboard size={18} className="animate-pulse" />
          </div>
          <div>
            <h4 className="text-xs font-mono font-black text-white uppercase tracking-widest flex items-center gap-1.5 label-glow">
              🎬 Creator Action Guide
              <span className="text-[8px] bg-[#C8FF5A] text-black px-1.5 py-0.5 rounded font-bold uppercase tracking-normal">
                Director AI
              </span>
            </h4>
            <p className="text-[10px] text-[#A1A1AA] font-sans mt-0.5">
              Practical shooting & editing playbook specifically custom-engineered for your theme
            </p>
          </div>
        </div>
        <div className="p-1 rounded-md bg-white/5 border border-white/5 text-[#A1A1AA]">
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {/* Expandable Playbook details */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-[#111111]/80 rounded-xl border border-white/5 p-4 sm:p-5 mt-3 space-y-4">
              <div className="text-[10px] leading-relaxed text-[#A1A1AA] font-sans bg-black/40 p-3 rounded-lg border border-white/[0.03]">
                💡 <strong className="text-white font-mono uppercase tracking-wider text-[9px]">Director's Pro-Tip:</strong> Treat this guide like an in-studio expert assistant. It modifies its advice structure automatically based on your script's style (<span className="text-[#C8FF5A]">{contentType}</span>) and audio delivery mood (<span className="text-[#FF4FD8]">{mood}</span>).
              </div>

              <div className="grid grid-cols-1 gap-3">
                {guideSections.map((sec, i) => (
                  <div
                    key={i}
                    className="border border-white/5 bg-black/30 rounded-xl overflow-hidden transition-all duration-300"
                  >
                    <button
                      onClick={() => setActiveSection(activeSection === i ? null : i)}
                      className="w-full p-4 flex items-center justify-between text-left hover:bg-white/[0.02] cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded-lg ${
                          activeSection === i 
                            ? "bg-[#C8FF5A]/10 text-[#C8FF5A]" 
                            : "bg-white/5 text-[#A1A1AA]"
                        }`}>
                          {i === 0 && <Camera size={15} />}
                          {i === 1 && <Smile size={15} />}
                          {i === 2 && <Film size={15} />}
                          {i === 3 && <Play size={15} />}
                          {i === 4 && <Sliders size={15} />}
                          {i === 5 && <TrendingUp size={15} />}
                        </div>
                        <span className={`text-xs font-bold uppercase tracking-wider ${activeSection === i ? "text-[#C8FF5A]" : "text-white"}`}>
                          {sec.title}
                        </span>
                      </div>
                      <span className="text-[#555]">
                        {activeSection === i ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </span>
                    </button>

                    <AnimatePresence>
                      {activeSection === i && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: "auto" }}
                          exit={{ height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 pt-1 border-t border-white/[0.03] space-y-3 font-sans text-left">
                            <p className="text-xs text-[#E1E1E6] leading-relaxed italic border-l-2 border-[#FF4FD8] pl-2.5">
                              {sec.description}
                            </p>
                            <ul className="space-y-2 text-[11px] text-[#A1A1AA] list-none">
                              {sec.bullets.map((b, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#FF4FD8] shrink-0 mt-1.5" />
                                  <span className="leading-relaxed">{b}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function ScriptScreen({
  payload,
  prompt,
  onBack,
  onNavigateToCaption,
  onNavigateToThumbnails,
  onRegenerate,
  isRegenerating,
  onSaveDraft,
  mood = "Confident 😎",
  contentType = "Talking Head",
  onEditScriptText
}: ScriptScreenProps) {
  const [activeTab, setActiveTab] = useState<"hook" | "body" | "cta">("hook");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<any>(null);
  const [celebrate, setCelebrate] = useState(true);
  const [showTeleprompter, setShowTeleprompter] = useState(false);

  const showToast = (message: string) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToastMessage(message);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  // Draft Save & Rename States
  const [draftName, setDraftName] = useState(prompt || "");
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveTuner, setShowSaveTuner] = useState(false);

  // Suggest Polish States
  const [isPolishing, setIsPolishing] = useState(false);
  const [polishedVariations, setPolishedVariations] = useState<string[] | null>(null);
  const [showPolishPanel, setShowPolishPanel] = useState(false);
  const [polishError, setPolishError] = useState<string | null>(null);

  const handlePolish = async () => {
    setIsPolishing(true);
    setPolishError(null);
    setPolishedVariations(null);
    setShowPolishPanel(true);
    
    try {
      const prefsStr = getPreferenceProfileString();
      const currentText = card.text;
      
      const res = await fetch("/api/polish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentText,
          preferences: prefsStr,
          prompt,
          contentType,
          mood
        })
      });
      
      if (!res.ok) {
        throw new Error("Failed to load script polish suggestions.");
      }
      
      const data = await res.json();
      if (data && Array.isArray(data.variations)) {
        setPolishedVariations(data.variations);
      } else {
        throw new Error("Invalid format returned from model doctor.");
      }
    } catch (err: any) {
      console.error(err);
      setPolishError(err.message || "An unexpected error occurred during polishing.");
      const fallback = [
        `Adjusted Tone (Punchy Cut): "Always focus directly on the hook without intro noise. ${card.text.substring(0, Math.min(card.text.length, 40))}..."`,
        `Alternative Story Pacing: "Raw conversational tone pattern: I used to fail this every single day until I cut out all external fluff."`,
        `High-Retention Cadence: "The average human retention span is down to 3 seconds. Stop talking and show them the exact gap."`
      ];
      setPolishedVariations(fallback);
    } finally {
      setIsPolishing(false);
    }
  };

  // Sync state values with prompt inputs
  useEffect(() => {
    if (prompt) {
      setDraftName(prompt);
    }
  }, [prompt]);

  const handleManualSave = () => {
    if (!onSaveDraft) return;
    setIsSaving(true);
    setTimeout(() => {
      onSaveDraft(draftName);
      setIsSaving(false);
      setIsSaved(true);
      setShowSaveTuner(false);
      // Auto reset success indicators after a premium threshold
      setTimeout(() => setIsSaved(false), 3500);
    }, 800);
  };

  // Auto dismiss celebration after 4 seconds to keep the interface clear
  useEffect(() => {
    const timer = setTimeout(() => {
      setCelebrate(false);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  // Generate physics-based particle attributes for the confetti burst
  const confettiParticles = useMemo(() => {
    const colors = ["#FF4FD8", "#A855F7", "#C8FF5A", "#3B82F6", "#F59E0B"];
    const emojis = ["✨", "🔥", "🎉", "⚡", "🚀", "🤫", "🎓", "🌟"];
    
    return Array.from({ length: 48 }).map((_, i) => {
      const angle = Math.random() * Math.PI * 2;
      // Spread outwards in all directions
      const distance = Math.random() * 160 + 60;
      const destinationX = Math.cos(angle) * distance;
      // Weighted downwards for realistic gravity simulation
      const destinationY = Math.sin(angle) * distance + (Math.random() * 80 + 40);
      
      return {
        id: i,
        x: destinationX,
        y: destinationY,
        rotation: Math.random() * 720 - 360,
        color: colors[i % colors.length],
        size: Math.random() * 7 + 5,
        emoji: i % 8 === 0 ? emojis[Math.floor(Math.random() * emojis.length)] : undefined,
        delay: Math.random() * 0.15
      };
    });
  }, []);

  // Background Reading Timer to learn what creators read most
  useEffect(() => {
    const startTime = Date.now();
    return () => {
      const elapsedMs = Date.now() - startTime;
      const elapsedSec = Math.round(elapsedMs / 1000);
      if (elapsedSec > 0) {
        trackReadingDuration(elapsedSec, { prompt, mood, contentType });
      }
    };
  }, [prompt, mood, contentType]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      showToast(`COPIED ${label} SECTION!`);
      // Automatically learn preference in background
      trackCopyAction({ prompt, mood, contentType });
    }).catch(() => {
      // Fallback if browser security sandbox blocks clipboard
      showToast(`${label} (Copy ready!)`);
      trackCopyAction({ prompt, mood, contentType });
    });
  };

  const handleShareSection = async (text: string, label: string) => {
    const sectionText = `🎬 Nannu AI Script - ${label} Section\n\n${text}\n\nGenerated via Nannu AI`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Nannu AI Script (${label})`,
          text: sectionText,
        });
        showToast("✓ SHARED SUCCESSFULLY!");
      } catch (err: any) {
        if (err.name !== "AbortError") {
          copyToClipboard(text, label);
        }
      }
    } else {
      copyToClipboard(text, label);
    }
  };

  const handleShareFullScript = async () => {
    const fullText = `NANNU AI GENERATED CONTENT SCRIPT\nTitle: ${draftName || "My Creative Script"}\n\n` +
      `🎬 HOOK (3-SEC RETENTION):\n${payload.script.hook.text}\n\n` +
      `📦 BODY (RETAINER ENGINE):\n${payload.script.body.text}\n\n` +
      `⚡ CTA (CONVERSION ANCHOR):\n${payload.script.cta.text}\n\n` +
      `Generated via Nannu AI`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: draftName || "Nannu AI Generated Script",
          text: fullText,
        });
        showToast("✓ SCRIPT SHARED SUCCESSFULLY!");
      } catch (err: any) {
        if (err.name !== "AbortError") {
          navigator.clipboard.writeText(fullText).then(() => {
            showToast("✓ SCRIPT COPIED TO CLIPBOARD!");
          }).catch(() => {
            showToast("✓ SCRIPT READY TO PASTE!");
          });
        }
      }
    } else {
      navigator.clipboard.writeText(fullText).then(() => {
        showToast("✓ SCRIPT COPIED TO CLIPBOARD!");
      }).catch(() => {
        showToast("✓ SCRIPT READY TO PASTE!");
      });
    }
  };

  const getActiveCard = () => {
    switch (activeTab) {
      case "body":
        return {
          title: "Main Story & High Value Arc",
          ...payload.script.body,
          badge: "RETAINER ENGINE"
        };
      case "cta":
        return {
          title: "Call to Action Formula",
          ...payload.script.cta,
          badge: "CONVERSION ANCHOR"
        };
      default:
        return {
          title: "The Viral Hook Formula",
          ...payload.script.hook,
          badge: "3-SEC RETENTION"
        };
    }
  };

  const card = getActiveCard();

  const [editText, setEditText] = useState("");
  const [isEditingText, setIsEditingText] = useState(false);

  // Sync edit content when activeTab or payload rotates
  useEffect(() => {
    setEditText(card.text || "");
    setIsEditingText(false);
  }, [activeTab, payload]);

  const handleApplyEdit = () => {
    if (onEditScriptText && editText !== card.text) {
      onEditScriptText(activeTab, editText);
    }
    setIsEditingText(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className="flex flex-col flex-1 pb-24 relative"
    >
      {/* Dynamic Celebration Burst Overlay */}
      <AnimatePresence>
        {celebrate && (
          <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden flex items-center justify-center">
            {/* Screen pulse ambient background */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: [0, 0.5, 0], scale: [0.8, 1.3, 2] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.6, ease: "easeOut" }}
              className="absolute w-[440px] h-[440px] rounded-full bg-gradient-to-tr from-[#FF4FD8]/25 via-[#A855F7]/15 to-[#C8FF5A]/10 blur-3xl pointer-events-none"
            />
            
            {/* Particles burst */}
            {confettiParticles.map((p) => (
              <motion.div
                key={p.id}
                initial={{ x: 0, y: 0, scale: 0, rotate: 0, opacity: 1 }}
                animate={{
                  x: p.x,
                  y: p.y,
                  scale: [0, 1.4, 0.9, 0],
                  rotate: p.rotation,
                  opacity: [0, 1, 0.8, 0],
                }}
                transition={{
                  duration: 2.6,
                  ease: "easeOut",
                  delay: p.delay,
                }}
                className="absolute flex items-center justify-center"
              >
                {p.emoji ? (
                  <span className="text-xl leading-none filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] select-none">
                    {p.emoji}
                  </span>
                ) : (
                  <div
                    className="rounded-full shadow-lg"
                    style={{
                      width: p.size,
                      height: p.size,
                      backgroundColor: p.color,
                      boxShadow: `0 0 12px ${p.color}`,
                    }}
                  />
                )}
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Header Back Controls */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-xs font-mono text-[#A1A1AA] hover:text-white cursor-pointer"
        >
          <ChevronLeft size={16} />
          <span>BACK TO EDITOR</span>
        </button>

        <button
          onClick={onRegenerate}
          disabled={isRegenerating}
          className="flex items-center gap-1 text-xs font-mono text-[#FF4FD8] hover:text-[#FF4FD8]/80 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw size={14} className={isRegenerating ? "animate-spin" : ""} />
          <span>REGENERATE</span>
        </button>
      </div>

      {/* Screen Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 border-b border-white/5 pb-5">
        <div>
          <h2 className="text-2xl font-black font-sans tracking-tight text-white uppercase">Your Script is Live</h2>
          <p className="text-xs text-[#A1A1AA] font-sans">
            Swipe or click tabs to copy individual story sequences.
          </p>
        </div>
        
        {/* practice speaking teleprompter trigger */}
        <button
          onClick={() => {
            logAnalyticsEvent("Teleprompter Active", {
              prompt,
              length: (payload.script.hook.text.length + payload.script.body.text.length + payload.script.cta.text.length),
              checkpoint: "Top Button"
            });
            setShowTeleprompter(true);
          }}
          className="flex items-center gap-2 px-4.5 py-3 rounded-xl bg-gradient-to-r from-[#C1FF40] to-[#E2FF45] hover:brightness-110 active:scale-95 text-black font-black text-xs uppercase font-sans tracking-wider transition-all shadow-[0_0_20px_rgba(200,255,90,0.35)] hover:shadow-[0_0_30px_rgba(200,255,90,0.5)] cursor-pointer self-start sm:self-center shrink-0"
        >
          <Clapperboard size={14} className="text-black" />
          <span>📺 Practice with Teleprompter</span>
        </button>
      </div>

      {payload.isFallback && (
        <div className="mb-5 p-3.5 bg-gradient-to-r from-[#FFBE1A]/10 via-[#FFBE1A]/5 to-transparent border-l-2 border-[#FFBE1A] rounded-r-xl select-none animate-pulse">
          <p className="text-xs font-black text-[#FFBE1A] font-sans flex items-center gap-1.5 uppercase tracking-wide">
            <span>⚠️ DEMO GENERATOR ACTIVE</span>
          </p>
          <p className="text-[10px] text-white/70 font-sans mt-0.5 leading-relaxed">
            API key missing or rate-limited. Nannu's local high-fidelity creator brain has crafted this custom script with Hinglish/Hindi dialect support.
          </p>
          {payload.errorReason && (
            <p className="text-[10px] text-[#FF4FD8] font-mono mt-1.5 border-t border-white/5 pt-1.5 leading-normal">
              <span className="font-bold text-[#FF4FD8]/80 uppercase mr-1">Error Reason:</span>
              {payload.errorReason}
            </p>
          )}
        </div>
      )}

      {/* Slide segment buttons */}
      <div className="flex bg-[#111111] p-1 rounded-xl border border-white/5 mb-5 select-none">
        {(["hook", "body", "cta"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 text-xs font-bold leading-none uppercase tracking-wider rounded-lg transition-all duration-300 ${
              activeTab === tab
                ? "bg-[#FF4FD8] text-white shadow-[0_0_12px_rgba(255,79,216,0.35)]"
                : "text-[#A1A1AA] hover:text-white"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Main card viewport */}
      <div className="relative mb-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            <GlowCard glowColor="none" className="p-6 bg-[#111111]/95 border-white/5 shadow-2xl relative min-h-[290px] flex flex-col justify-between">
              {/* Badge & action */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-[9px] font-mono tracking-widest uppercase bg-white/5 px-2 py-1 rounded border border-white/5 text-[#A1A1AA]">
                  {card.badge}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyToClipboard(card.text, activeTab.toUpperCase())}
                    className="p-1.5 rounded-lg bg-white/5 border border-white/5 text-[#A1A1AA] hover:text-white transition-colors cursor-pointer flex items-center justify-center"
                    title="Copy this section"
                  >
                    <Copy size={14} />
                  </button>

                  <button
                    onClick={() => handleShareSection(card.text, activeTab.toUpperCase())}
                    className="p-1.5 rounded-lg bg-[#FF4FD8]/10 border border-[#FF4FD8]/25 text-[#FF4FD8] hover:bg-[#FF4FD8]/20 hover:text-white transition-colors cursor-pointer flex items-center justify-center"
                    title="Share this section"
                  >
                    <Share2 size={14} />
                  </button>
                </div>
              </div>

              {/* Text content details */}
              <div className="mb-6 group">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-mono text-[#555] uppercase tracking-wider">
                    Spoken Script Line:
                  </h3>
                  <button
                    onClick={() => {
                      if (isEditingText) {
                        handleApplyEdit();
                      } else {
                        setIsEditingText(true);
                      }
                    }}
                    className="text-[10px] font-mono font-bold text-[#FF4FD8] hover:brightness-110 flex items-center gap-1 cursor-pointer transition-all bg-white/5 py-0.5 px-2 rounded border border-white/5"
                  >
                    {isEditingText ? (
                      <>
                        <Check size={11} />
                        <span>Done Editing</span>
                      </>
                    ) : (
                      <>
                        <Edit3 size={11} />
                        <span>Edit Text</span>
                      </>
                    )}
                  </button>
                </div>
                {isEditingText ? (
                  <div className="flex flex-col gap-2">
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onBlur={handleApplyEdit}
                      autoFocus
                      className="w-full min-h-[120px] bg-black/40 text-sm leading-relaxed text-white p-3.5 rounded-xl border border-[#FF4FD8]/40 focus:border-[#FF4FD8]/80 focus:outline-none font-sans resize-none transition-all"
                    />
                    <div className="text-[9px] font-mono text-[#A1A1AA]/50 text-left">
                      💡 Auto-Learning: Nannu calibrates this edit to adapt your content tone profile.
                    </div>
                  </div>
                ) : (
                  <p 
                    onClick={() => setIsEditingText(true)}
                    className="text-base font-medium text-white leading-relaxed font-sans cursor-text hover:bg-white/[0.02] p-1 rounded border border-transparent hover:border-white/5 transition-all"
                  >
                    {card.text}
                  </p>
                )}
              </div>
              
              {/* Suggest Polish Section */}
              <div className="mb-4">
                <button
                  id="suggest-polish-btn"
                  onClick={handlePolish}
                  disabled={isPolishing}
                  className={`w-full py-2.5 px-4 rounded-xl bg-gradient-to-tr from-[#9333EA]/20 via-[#FF4FD8]/10 to-[#C8FF5A]/10 border border-[#FF4FD8]/30 text-white font-bold text-xs flex items-center justify-center gap-2 hover:from-[#9333EA]/30 hover:via-[#FF4FD8]/20 hover:to-[#C8FF5A]/20 transition-all shadow-md cursor-pointer uppercase tracking-wider font-mono font-black ${
                    isPolishing ? "opacity-75 cursor-not-allowed" : ""
                  }`}
                >
                  {isPolishing ? (
                    <>
                      <RefreshCw size={13} className="text-[#C8FF5A] animate-spin" />
                      <span className="animate-pulse">Polishing Script...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={13} className="text-[#C8FF5A] animate-pulse" />
                      <span>Suggest Polish</span>
                    </>
                  )}
                </button>

                <AnimatePresence>
                  {showPolishPanel && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden mt-3"
                    >
                      <div className="p-4 rounded-xl bg-[#050505]/95 border border-white/5 space-y-3 font-sans text-left">
                        <div className="flex items-center justify-between border-b border-white/[0.04] pb-2">
                          <div className="flex items-center gap-1.5">
                            <Brain size={13} className="text-[#C8FF5A]" />
                            <span className="text-[9px] font-mono text-white font-bold uppercase tracking-wider">
                              Nannu Voice Polish Suggestions
                            </span>
                          </div>
                          <button
                            onClick={() => setShowPolishPanel(false)}
                            className="text-[9px] font-mono text-[#A1A1AA] hover:text-white uppercase tracking-wider"
                          >
                            Close
                          </button>
                        </div>

                        {isPolishing ? (
                          <div className="py-6 flex flex-col items-center justify-center gap-2">
                            <RefreshCw size={16} className="text-[#FF4FD8] animate-spin" />
                            <span className="text-[9px] font-mono text-[#A1A1AA] uppercase tracking-widest animate-pulse">
                              Re-tuning style filters...
                            </span>
                          </div>
                        ) : polishError ? (
                          <div className="text-xs text-red-400 p-2 text-center bg-red-400/5 rounded">
                            {polishError}
                          </div>
                        ) : (
                          <div className="space-y-2.5">
                            <p className="text-[10px] text-[#A1A1AA] leading-snug">
                              Select a refined variation focusing on your pacing to update this script section instantly:
                            </p>
                            {polishedVariations?.map((variant, index) => (
                              <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -5 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.08 }}
                                onClick={() => {
                                  if (onEditScriptText) {
                                    onEditScriptText(activeTab, variant);
                                    setEditText(variant);
                                    trackEditAction({ prompt, mood, contentType });
                                  }
                                }}
                                className="group p-3 bg-white/[0.01] hover:bg-[#FF4FD8]/5 border border-white/5 hover:border-[#FF4FD8]/20 rounded-xl cursor-pointer transition-all duration-200 text-left relative overflow-hidden"
                              >
                                <div className="absolute top-2.5 right-2 px-1.5 py-0.5 bg-[#C8FF5A]/10 border border-[#C8FF5A]/20 rounded text-[7px] font-mono text-[#C8FF5A] font-bold uppercase tracking-wide opacity-0 group-hover:opacity-100 transition-opacity">
                                  Use Variant
                                </div>
                                <div className="text-[8px] font-mono text-[#FF4FD8] uppercase font-bold tracking-wider mb-1">
                                  {index === 0 ? "Variation 1 (Punchy & Short)" : index === 1 ? "Variation 2 (Conversational Story)" : "Variation 3 (High-Retention)"}
                                </div>
                                <p className="text-xs text-[#E1E1E6] leading-relaxed font-sans pr-16 group-hover:text-white transition-colors">
                                  {variant}
                                </p>
                              </motion.div>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </GlowCard>
          </motion.div>
        </AnimatePresence>

        <CreatorActionGuideDetails prompt={prompt} mood={mood} contentType={contentType} />

        {/* Custom Notification Toast */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="fixed bottom-6 left-6 right-6 sm:left-auto sm:right-6 sm:w-80 bg-[#C8FF5A] text-black py-3 px-5 rounded-xl text-xs font-bold font-sans flex items-center gap-2.5 shadow-[0_8px_30px_rgba(200,255,90,0.35)] z-50 border border-black/10"
            >
              <ClipboardCheck size={15} className="shrink-0 text-black animate-pulse" />
              <span className="leading-tight uppercase font-mono tracking-wide">{toastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Screen action options */}
      <div className="flex flex-col gap-3">
        {/* Share Full Script Action Button */}
        <motion.button
          id="script-share-full-btn"
          whileTap={{ scale: 0.98 }}
          onClick={handleShareFullScript}
          className="w-full py-4 px-5 rounded-2xl bg-[#111111] border border-white/5 hover:border-white/12 text-white font-bold font-sans flex items-center justify-between"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-[#3B82F6]/10 text-[#3B82F6]">
              <Share2 size={16} />
            </div>
            <div className="text-left">
              <span className="text-sm block">Share Full Script</span>
              <span className="text-[10px] text-[#A1A1AA] font-normal block mt-0.5 leading-none">
                Export combined sections directly to WhatsApp, Email, or Notes
              </span>
            </div>
          </div>
          <ArrowRight size={16} className="text-[#A1A1AA]" />
        </motion.button>

        {/* Save Draft Action Option */}
        <div className="flex flex-col bg-[#111111] rounded-2xl border border-white/5 overflow-hidden transition-all duration-300">
          <motion.button
            id="script-save-draft-btn"
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              if (showSaveTuner) {
                handleManualSave();
              } else {
                setShowSaveTuner(true);
              }
            }}
            className={`w-full py-4 px-5 text-white font-bold font-sans flex items-center justify-between transition-colors cursor-pointer ${
              isSaved ? "bg-[#C8FF5A]/10 text-[#C8FF5A]" : "hover:bg-white/[0.02]"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className={`p-1.5 rounded-lg ${
                isSaved ? "bg-[#C8FF5A]/15 text-[#C8FF5A]" : "bg-[#A855F7]/15 text-[#A855F7]"
              }`}>
                <Bookmark size={16} className={isSaving ? "animate-bounce" : ""} />
              </div>
              <div className="text-left font-sans">
                <span className={`text-sm block ${isSaved ? "text-[#C8FF5A]" : "text-white"}`}>
                  {isSaved ? "Draft Saved Successfully!" : "Save Script to Drafts"}
                </span>
                <span className="text-[10px] text-[#A1A1AA] font-normal block leading-none mt-0.5">
                  {isSaved ? "Archived and persistent" : "Review or edit name & back up"}
                </span>
              </div>
            </div>
            {isSaving ? (
              <RefreshCw size={15} className="text-[#A1A1AA] animate-spin" />
            ) : isSaved ? (
              <CheckCircle size={15} className="text-[#C8FF5A]" />
            ) : (
              <motion.div
                animate={{ rotate: showSaveTuner ? 90 : 0 }}
                className="text-[#A1A1AA]"
              >
                <ArrowRight size={15} />
              </motion.div>
            )}
          </motion.button>

          {/* Collapsible Edit/Review Drawer inside the Button Area */}
          <AnimatePresence>
            {showSaveTuner && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="px-5 pb-5 pt-1 border-t border-white/[0.03] bg-black/20"
              >
                <div className="flex flex-col gap-2">
                  <label className="text-[9px] font-mono text-[#A1A1AA] uppercase tracking-wider text-left">
                    Draft Title Name:
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="draft-name-input-field"
                      type="text"
                      value={draftName}
                      onChange={(e) => setDraftName(e.target.value)}
                      placeholder="Title your draft..."
                      className="flex-1 px-3 py-2 bg-[#050505] rounded-xl border border-white/5 focus:border-[#A855F7]/40 focus:outline-none text-xs text-white placeholder-[#555] transition-all"
                    />
                    <button
                      onClick={handleManualSave}
                      disabled={isSaving}
                      className="px-4 py-2 bg-white hover:bg-white/90 text-black font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Save size={13} />
                      <span>Back Up</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Open Teleprompter practicing option */}
        <motion.button
          id="script-practice-teleprompter-btn"
          whileTap={{ scale: 0.97 }}
          onClick={() => {
            logAnalyticsEvent("Teleprompter Active", {
              prompt,
              length: (payload.script.hook.text.length + payload.script.body.text.length + payload.script.cta.text.length),
              checkpoint: "In-Studio Banner Button"
            });
            setShowTeleprompter(true);
          }}
          className="w-full py-4.5 px-5 rounded-2xl bg-gradient-to-r from-[#FF4FD8]/10 via-[#A855F7]/5 to-[#C8FF5A]/5 border border-white/10 hover:border-white/20 hover:from-[#FF4FD8]/15 text-white font-bold font-sans flex items-center justify-between cursor-pointer"
        >
          <div className="flex items-center gap-3 text-left">
            <div className="p-2 rounded-lg bg-gradient-to-br from-violet-600 to-[#FF4FD8] text-white shadow-md shrink-0">
              <Clapperboard size={16} />
            </div>
            <div>
              <span className="text-sm font-extrabold text-white block">Launch In-Studio Teleprompter</span>
              <span className="text-[10px] text-[#A1A1AA] font-normal block mt-0.5 leading-none">
                Auto-scroll combined script flow with customized speed, mirrored glass, and practicing companion
              </span>
            </div>
          </div>
          <ArrowRight size={16} className="text-[#A1A1AA]" />
        </motion.button>

        {/* Generate caption */}
        <motion.button
          id="script-go-caption-btn"
          whileTap={{ scale: 0.97 }}
          onClick={onNavigateToCaption}
          className="w-full py-4 px-5 rounded-2xl bg-[#111111] border border-white/5 hover:border-white/12 text-white font-bold font-sans flex items-center justify-between"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-[#FF4FD8]/10 text-[#FF4FD8]">
              <Sparkles size={16} />
            </div>
            <span className="text-sm">Generate Viral Caption</span>
          </div>
          <ArrowRight size={16} className="text-[#A1A1AA]" />
        </motion.button>

        {/* Generate thumbnail concepts */}
        <motion.button
          id="script-go-thumbnails-btn"
          whileTap={{ scale: 0.97 }}
          onClick={onNavigateToThumbnails}
          className="w-full py-4 px-5 rounded-2xl bg-[#111111] border border-white/5 hover:border-white/12 text-white font-bold font-sans flex items-center justify-between"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-[#C8FF5A]/10 text-[#C8FF5A]">
              <Eye size={16} />
            </div>
            <span className="text-sm">Explore Dynamic Thumbnails</span>
          </div>
          <ArrowRight size={16} className="text-[#A1A1AA]" />
        </motion.button>
      </div>

      {/* Full-Screen Teleprompter practicing overlay */}
      <AnimatePresence>
        {showTeleprompter && (
          <TeleprompterOverlay
            hook={payload.script.hook.text}
            body={payload.script.body.text}
            cta={payload.script.cta.text}
            title={draftName || "My Viral Creation"}
            onClose={() => setShowTeleprompter(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
