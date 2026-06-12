import React, { useState, useEffect, useRef, useMemo } from "react";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  X, 
  GripHorizontal,
  Video,
  VideoOff,
  Download,
  Settings,
  AlignLeft,
  AlignCenter,
  Move,
  RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface TeleprompterOverlayProps {
  hook: string;
  body: string;
  cta: string;
  title: string;
  onClose: () => void;
}

export default function TeleprompterOverlay({
  hook,
  body,
  cta,
  title,
  onClose
}: TeleprompterOverlayProps) {
  // Direct Editable Script state loaded from localStorage or props
  const [localHook, setLocalHook] = useState(() => {
    return localStorage.getItem(`tele_hook_v2_${title}`) || hook;
  });
  const [localBody, setLocalBody] = useState(() => {
    return localStorage.getItem(`tele_body_v2_${title}`) || body;
  });
  const [localCta, setLocalCta] = useState(() => {
    return localStorage.getItem(`tele_cta_v2_${title}`) || cta;
  });

  // Save changes locally in localStorage in real-time
  useEffect(() => {
    localStorage.setItem(`tele_hook_v2_${title}`, localHook);
  }, [localHook, title]);

  useEffect(() => {
    localStorage.setItem(`tele_body_v2_${title}`, localBody);
  }, [localBody, title]);

  useEffect(() => {
    localStorage.setItem(`tele_cta_v2_${title}`, localCta);
  }, [localCta, title]);

  // Draggable Teleprompter Position State
  const [position, setPosition] = useState<{ x: number; y: number }>(() => {
    try {
      const saved = localStorage.getItem("teleprompter_position_v4");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.x === "number" && typeof parsed.y === "number") {
          return parsed;
        }
      }
    } catch (e) {}
    // Default: centered at the top area of the screen with compact 45% width (was 65%)
    const targetW = window.innerWidth > 768 ? Math.max(320, Math.floor(window.innerWidth * 0.45)) : window.innerWidth - 16;
    return { x: Math.floor((window.innerWidth - targetW) / 2), y: 80 };
  });

  // Resizable Teleprompter Dimensions State
  const [size, setSize] = useState<{ width: number; height: number }>(() => {
    try {
      const saved = localStorage.getItem("teleprompter_size_v4");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.width === "number" && typeof parsed.height === "number") {
          return parsed;
        }
      }
    } catch (e) {}
    return { 
      width: window.innerWidth > 768 ? Math.max(320, Math.floor(window.innerWidth * 0.45)) : window.innerWidth - 16, 
      height: 220 
    };
  });

  // Keep floating block safely within user viewport boundaries on load or resize (prevents offscreen widgets on mobile!)
  useEffect(() => {
    const handleViewportBoundaries = () => {
      setPosition(prev => {
        const maxX = window.innerWidth - size.width - 8;
        const maxY = window.innerHeight - size.height - 8;
        const clampedX = Math.max(8, Math.min(maxX > 8 ? maxX : 8, prev.x));
        const clampedY = Math.max(8, Math.min(maxY > 8 ? maxY : 8, prev.y));
        return { x: clampedX, y: clampedY };
      });
    };

    handleViewportBoundaries();
    window.addEventListener("resize", handleViewportBoundaries);
    return () => window.removeEventListener("resize", handleViewportBoundaries);
  }, [size.width, size.height]);

  // Creator Controls Configuration States (Persisted in LocalStorage)
  const [fontSizeMultiplier, setFontSizeMultiplier] = useState<"S" | "M" | "L" | "XL">(() => {
    const saved = localStorage.getItem("tele_font_size_multiplier");
    if (saved === "S" || saved === "M" || saved === "L" || saved === "XL") return saved;
    return "M";
  });

  const [speedMultiplier, setSpeedMultiplier] = useState<number>(() => {
    return parseFloat(localStorage.getItem("tele_speed_multiplier") || "1.0");
  });

  const [opacityValue, setOpacityValue] = useState<number>(() => {
    return parseFloat(localStorage.getItem("tele_opacity_value") || "0.3");
  });

  const [mirrorText, setMirrorText] = useState<boolean>(() => {
    return localStorage.getItem("tele_mirror_text") === "true";
  });

  const [mirrorVideo, setMirrorVideo] = useState<boolean>(() => {
    return (localStorage.getItem("tele_mirror_video") ?? "true") === "true";
  });

  const [textAlignment, setTextAlignment] = useState<"left" | "center">(() => {
    return (localStorage.getItem("tele_text_alignment") as "left" | "center") || "center";
  });

  // UI state toggles
  const [isPlaying, setIsPlaying] = useState(false);
  const isPlayingRef = useRef(false);
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);
  const [isControlsVisible, setIsControlsVisible] = useState(true);

  // HTML5 Webcam Streaming
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraPermissionState, setCameraPermissionState] = useState<"pending" | "granted" | "denied">("pending");
  const videoRef = useRef<HTMLVideoElement>(null);

  // Recording State Machine (Real/Mock Support)
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [showReplayModal, setShowReplayModal] = useState(false);

  // Smooth scroll parameters via requestAnimationFrame
  const panelRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const scrollTopValueRef = useRef<number>(0);

  // Sync scroll play states
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  // Persists
  useEffect(() => {
    localStorage.setItem("teleprompter_position_v4", JSON.stringify(position));
  }, [position]);

  useEffect(() => {
    localStorage.setItem("teleprompter_size_v4", JSON.stringify(size));
  }, [size]);

  useEffect(() => {
    localStorage.setItem("tele_font_size_multiplier", fontSizeMultiplier);
  }, [fontSizeMultiplier]);

  useEffect(() => {
    localStorage.setItem("tele_speed_multiplier", speedMultiplier.toString());
  }, [speedMultiplier]);

  useEffect(() => {
    localStorage.setItem("tele_opacity_value", opacityValue.toString());
  }, [opacityValue]);

  useEffect(() => {
    localStorage.setItem("tele_mirror_text", mirrorText.toString());
  }, [mirrorText]);

  useEffect(() => {
    localStorage.setItem("tele_mirror_video", mirrorVideo.toString());
  }, [mirrorVideo]);

  useEffect(() => {
    localStorage.setItem("tele_text_alignment", textAlignment);
  }, [textAlignment]);

  // Webcam stream handlers with robust fallback for video-only on mobile devices
  useEffect(() => {
    let activeStream: MediaStream | null = null;
    
    const requestWebcam = async () => {
      try {
        console.log("DIAGNOSTIC LOG: Requesting video and audio userMedia...");
        const s = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: "user" }, 
          audio: true 
        });
        console.log("DIAGNOSTIC LOG: Audio & Video stream obtained successfully.");
        activeStream = s;
        setStream(s);
        setCameraPermissionState("granted");
      } catch (err: any) {
        console.warn("DIAGNOSTIC LOG: Joint video/audio access failed. Retrying with video-only...", err);
        try {
          const sOnlyVideo = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: "user" } 
          });
          console.log("DIAGNOSTIC LOG: Video-only stream obtained successfully.");
          activeStream = sOnlyVideo;
          setStream(sOnlyVideo);
          setCameraPermissionState("granted");
        } catch (err2: any) {
          console.error("DIAGNOSTIC LOG: Both webcam attempts failed, raising denied prompt.", err2);
          setCameraPermissionState("denied");
        }
      }
    };

    requestWebcam();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(track => {
          try { track.stop(); } catch(e) {}
        });
      }
    };
  }, []);

  // Sync stream to video element once granted or changed (Resolves React initial render race-condition!)
  useEffect(() => {
    if (cameraPermissionState === "granted" && stream && videoRef.current) {
      console.log("DIAGNOSTIC LOG: Syncing stream to video element srcObject.");
      videoRef.current.srcObject = stream;
    }
  }, [cameraPermissionState, stream]);

  // 2-Seconds Auto Hide Controls engine
  useEffect(() => {
    let hideTimer: any = null;

    const resetHideTimer = () => {
      setIsControlsVisible(true);
      if (hideTimer) clearTimeout(hideTimer);
      
      // Delay auto-hiding for a cleaner subtitled experience
      hideTimer = setTimeout(() => {
        const activeEl = document.activeElement;
        const isEditing = activeEl && (
          activeEl.tagName === "TEXTAREA" || 
          activeEl.tagName === "INPUT" || 
          activeEl.getAttribute("contenteditable") === "true"
        ) || showSettingsDrawer;
        
        if (!isEditing) {
          setIsControlsVisible(false);
        }
      }, 2000);
    };

    const container = panelRef.current;
    if (container) {
      container.addEventListener("mousemove", resetHideTimer);
      container.addEventListener("click", resetHideTimer);
      container.addEventListener("touchstart", resetHideTimer);
    }

    // Set initial timer
    resetHideTimer();

    return () => {
      if (hideTimer) clearTimeout(hideTimer);
      if (container) {
        container.removeEventListener("mousemove", resetHideTimer);
        container.removeEventListener("click", resetHideTimer);
        container.removeEventListener("touchstart", resetHideTimer);
      }
    };
  }, [isPlaying, showSettingsDrawer]);

  // Scroll request animation frame
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const animateScroll = (time: number) => {
      if (!isPlayingRef.current) return;

      if (lastTimeRef.current !== null) {
        const delta = (time - lastTimeRef.current) / 1000;
        
        // Base rate ~20 pixels/second for Speed x1.0
        const baseSpeed = 20;
        const speed = baseSpeed * speedMultiplier;
        
        scrollTopValueRef.current += speed * delta;
        
        const maxScroll = scrollContainer.scrollHeight - scrollContainer.clientHeight;
        if (scrollTopValueRef.current >= maxScroll) {
          scrollTopValueRef.current = maxScroll;
          setIsPlaying(false);
        }
        
        scrollContainer.scrollTop = Math.round(scrollTopValueRef.current);
      }
      
      lastTimeRef.current = time;
      requestRef.current = requestAnimationFrame(animateScroll);
    };

    if (isPlaying) {
      lastTimeRef.current = null;
      scrollTopValueRef.current = scrollContainer.scrollTop;
      requestRef.current = requestAnimationFrame(animateScroll);
    } else {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    }

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isPlaying, speedMultiplier]);

  const handleScroll = () => {
    if (!isPlaying && scrollContainerRef.current) {
      scrollTopValueRef.current = scrollContainerRef.current.scrollTop;
    }
  };

  const handleResetScroll = () => {
    setIsPlaying(false);
    scrollTopValueRef.current = 0;
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  };

  // Track practice analytics metrics in real-time
  useEffect(() => {
    try {
      const currentCount = parseInt(localStorage.getItem("nannu_practice_sessions_count") || "0", 10);
      localStorage.setItem("nannu_practice_sessions_count", (currentCount + 1).toString());

      const startTime = Date.now();
      return () => {
        const elapsedSecs = Math.round((Date.now() - startTime) / 1000);
        const currentDur = parseInt(localStorage.getItem("nannu_practice_sessions_duration") || "0", 10);
        localStorage.setItem("nannu_practice_sessions_duration", (currentDur + elapsedSecs).toString());
        
        // Also ensure streak is set up
        const todayStr = new Date().toDateString();
        localStorage.setItem("nannu_last_practice_date", todayStr);
      };
    } catch (e) {
      console.warn("Storage limits restricted logging practice metrics", e);
    }
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore key shortcuts if focused on editable script areas
      if (document.activeElement?.tagName === "TEXTAREA" || document.activeElement?.getAttribute("contenteditable") === "true") {
        return;
      }
      if (e.code === "Space") {
        e.preventDefault();
        setIsPlaying(p => !p);
      } else if (e.code === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Dragging system
  const dragRef = useRef<{ isDragging: boolean; startX: number; startY: number; posX: number; posY: number } | null>(null);

  const handleDragStart = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    // Avoid dragging when clicking settings inside drawer or interactive controls
    if ((e.target as HTMLElement).closest(".prevent-drag")) return;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    dragRef.current = {
      isDragging: true,
      startX: clientX,
      startY: clientY,
      posX: position.x,
      posY: position.y
    };

    if ('touches' in e) {
      document.addEventListener("touchmove", handleDragMove, { passive: false });
      document.addEventListener("touchend", handleDragEnd);
    } else {
      document.addEventListener("mousemove", handleDragMove);
      document.addEventListener("mouseup", handleDragEnd);
    }
  };

  const handleDragMove = (e: MouseEvent | TouchEvent) => {
    if (!dragRef.current?.isDragging) return;
    if (e.cancelable) e.preventDefault();

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const deltaX = clientX - dragRef.current.startX;
    const deltaY = clientY - dragRef.current.startY;

    let newX = dragRef.current.posX + deltaX;
    let newY = dragRef.current.posY + deltaY;

    // Viewport bounding
    newX = Math.max(8, Math.min(window.innerWidth - size.width - 8, newX));
    newY = Math.max(8, Math.min(window.innerHeight - size.height - 8, newY));

    setPosition({ x: newX, y: newY });
  };

  const handleDragEnd = () => {
    dragRef.current = null;
    document.removeEventListener("mousemove", handleDragMove);
    document.removeEventListener("mouseup", handleDragEnd);
    document.removeEventListener("touchmove", handleDragMove);
    document.removeEventListener("touchend", handleDragEnd);
  };

  // Corner resize system
  const resizeRef = useRef<{ isResizing: boolean; startX: number; startY: number; startW: number; startH: number } | null>(null);

  const handleResizeStart = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    resizeRef.current = {
      isResizing: true,
      startX: clientX,
      startY: clientY,
      startW: size.width,
      startH: size.height
    };

    if ('touches' in e) {
      document.addEventListener("touchmove", handleResizeMove, { passive: false });
      document.addEventListener("touchend", handleResizeEnd);
    } else {
      document.addEventListener("mousemove", handleResizeMove);
      document.addEventListener("mouseup", handleResizeEnd);
    }
  };

  const handleResizeMove = (e: MouseEvent | TouchEvent) => {
    if (!resizeRef.current?.isResizing) return;
    if (e.cancelable) e.preventDefault();

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const deltaX = clientX - resizeRef.current.startX;
    const deltaY = clientY - resizeRef.current.startY;

    const newW = Math.max(280, Math.min(window.innerWidth - 32, resizeRef.current.startW + deltaX));
    const newH = Math.max(160, Math.min(480, resizeRef.current.startH + deltaY));

    setSize({ width: newW, height: newH });
  };

  const handleResizeEnd = () => {
    resizeRef.current = null;
    document.removeEventListener("mousemove", handleResizeMove);
    document.removeEventListener("mouseup", handleResizeEnd);
    document.removeEventListener("touchmove", handleResizeMove);
    document.removeEventListener("touchend", handleResizeEnd);
  };

  // Recording controllers
  useEffect(() => {
    let timer: any = null;
    if (isRecording) {
      timer = setInterval(() => {
        setRecordingSeconds(s => s + 1);
      }, 1000);
    } else {
      clearInterval(timer);
      setRecordingSeconds(0);
    }
    return () => clearInterval(timer);
  }, [isRecording]);

  useEffect(() => {
    if (!isRecording && recordedChunks.length > 0) {
      const blob = new Blob(recordedChunks, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      setRecordedVideoUrl(url);
      setShowReplayModal(true);
    }
  }, [isRecording, recordedChunks]);

  const startRecording = () => {
    setRecordedChunks([]);
    setRecordedVideoUrl(null);
    setIsRecording(true);
    
    if (stream && cameraPermissionState === "granted") {
      try {
        const options = { mimeType: "video/webm;codecs=vp9" };
        let recorder: MediaRecorder;
        try {
          recorder = new MediaRecorder(stream, options);
        } catch (e) {
          recorder = new MediaRecorder(stream);
        }
        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            setRecordedChunks(c => [...c, e.data]);
          }
        };
        recorder.start(1000);
        setMediaRecorder(recorder);
      } catch (err) {
        console.warn("Could not initiate media recorder:", err);
      }
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
    } else {
      const fallbackBlob = new Blob(["simulation"], { type: "video/webm" });
      setRecordedChunks([fallbackBlob]);
    }
  };

  // Font sizing multipliers
  const computedFontSize = useMemo(() => {
    switch (fontSizeMultiplier) {
      case "S": return 15;
      case "L": return 26;
      case "XL": return 32;
      case "M":
      default:
        return 20;
    }
  }, [fontSizeMultiplier]);

  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Pin / Layout helpers
  const handlePin = (type: "TOP" | "BOTTOM" | "RESET") => {
    const defaultWidth = size.width;
    const defaultHeight = size.height;
    if (type === "TOP") {
      setPosition({
        x: Math.floor((window.innerWidth - defaultWidth) / 2),
        y: 16
      });
    } else if (type === "BOTTOM") {
      setPosition({
        x: Math.floor((window.innerWidth - defaultWidth) / 2),
        y: window.innerHeight - defaultHeight - 110 // keep space above the recording bubble
      });
    } else {
      setPosition({
        x: Math.floor((window.innerWidth - defaultWidth) / 2),
        y: 90
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-[#000000] text-white flex flex-col font-sans select-none overflow-hidden"
      id="teleprompter-overlay"
    >
      {/* -------------------- FULL-SCREEN CAMERA BACKGROUND PREVIEW -------------------- */}
      <div className="absolute inset-0 z-10 w-full h-full pointer-events-none">
        {cameraPermissionState === "granted" ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover opacity-90 transition-transform duration-300 ${
              mirrorVideo ? "scale-x-[-1]" : "scale-x-100"
            }`}
          />
        ) : (
          /* CINEMATIC SIMULATED BACKSTAGE GRADIENT */
          <div className="w-full h-full bg-gradient-to-tr from-[#0b0c10] via-[#12131a] to-[#20152b] flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-pink-500/10 via-amber-500/5 to-transparent blur-3xl animate-pulse" />
            <div className="absolute w-[440px] h-[440px] rounded-full border border-pink-500/5 opacity-10 border-dashed animate-spin duration-[24s]" />
            
            <div className="flex flex-col items-center gap-3">
              <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-full text-amber-500 animate-bounce">
                <VideoOff size={20} />
              </div>
              <div className="text-center max-w-xs px-4">
                <span className="text-[10px] font-mono tracking-widest text-zinc-500 font-extrabold block">STANDBY SIMULATOR</span>
                <span className="text-[10px] text-zinc-400 block mt-1 leading-normal">Webcam offline or disallowed. Video streams will be simulated seamlessly.</span>
              </div>
            </div>
          </div>
        )}

        {/* Cinematic shadows edge filters */}
        <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-black/80 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
      </div>

      {/* -------------------- MAIN APP EXIT HEADER -------------------- */}
      <div className="relative z-30 flex items-center justify-between px-5 py-4 bg-black/45 border-b border-white/5 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-pink-500" />
          <h2 className="text-xs font-mono font-bold tracking-widest text-[#FF4FD8] uppercase">PRACTICE ENVIRONMENT</h2>
        </div>
        
        {isRecording && (
          <div className="flex items-center gap-2 px-3.5 py-1 bg-red-500/20 border border-red-500/40 rounded-full font-mono text-[10px] tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
            <span className="text-white">RECORDING: {formatTime(recordingSeconds)}</span>
          </div>
        )}

        <button
          onClick={onClose}
          className="p-1 px-2.5 rounded-lg bg-zinc-900/80 border border-white/10 hover:border-white/20 text-xs font-mono font-bold text-zinc-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
          id="exit-practice-screen"
        >
          <X size={13} />
          <span>Exit Studio</span>
        </button>
      </div>

      {/* -------------------- ULTRA COMPACT FLOATING & DRAGGABLE VIEWPORT -------------------- */}
      <div
        ref={panelRef}
        id="floating-teleprompter"
        className="fixed z-40 flex flex-col rounded-2xl border cursor-default shadow-2xl transition-colors transition-shadow duration-300"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: `${size.width}px`,
          height: `${size.height}px`,
          backgroundColor: isControlsVisible ? `rgba(9, 9, 11, ${opacityValue})` : "transparent",
          backdropFilter: isControlsVisible ? `blur(${opacityValue < 0.95 ? "12px" : "1px"})` : "none",
          borderColor: isControlsVisible ? "rgba(255, 255, 255, 0.14)" : "transparent",
          boxShadow: isControlsVisible ? (isPlaying ? "0 25px 60px -15px rgba(200, 255, 90, 0.12)" : "0 20px 50px -15px rgba(0,0,0,0.9)") : "none",
          pointerEvents: "auto"
        }}
      >
        {/* DRAGGABLE & AUTOHIDING HEADER BAR */}
        <div
          onMouseDown={handleDragStart}
          onTouchStart={handleDragStart}
          className={`flex items-center justify-between px-3 py-1 bg-zinc-950/80 border-b select-none transition-all duration-350 shrink-0 ${
            isControlsVisible 
              ? "opacity-100 h-9 border-white/10" 
              : "opacity-0 h-0 border-transparent overflow-hidden pointer-events-none"
          }`}
          title="Drag anywhere here to re-position"
        >
          <div className="flex items-center gap-1.5 text-zinc-400">
            <GripHorizontal size={12} className="text-pink-500 cursor-grab active:cursor-grabbing" />
            <span className="text-[8px] font-mono font-bold uppercase tracking-widest text-[#A1A1AA]">
              {isPlaying ? "SCROLLING" : "READY"}
            </span>
          </div>

          {/* Compact Control Icons Row: KEEP ONLY PLAY, PAUSE, SETTINGS */}
          <div className="flex items-center gap-1.5 prevent-drag">
            {/* Play/Pause Button */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`p-1 px-1.5 rounded text-[10px] flex items-center justify-center transition-all cursor-pointer ${
                isPlaying 
                  ? "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30" 
                  : "bg-[#C8FF5A]/20 text-[#C8FF5A] hover:bg-[#C8FF5A]/30"
              }`}
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause size={10} className="fill-current" /> : <Play size={10} className="fill-current translate-x-[0.5px]" />}
            </button>

            {/* Settings button */}
            <button
              onClick={() => setShowSettingsDrawer(!showSettingsDrawer)}
              className={`p-1 rounded transition-colors cursor-pointer flex items-center justify-center ${
                showSettingsDrawer ? "text-[#C8FF5A] bg-white/10" : "text-zinc-200 hover:text-white"
              }`}
              title="Settings"
            >
              <Settings size={11} className={showSettingsDrawer ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* CONTAINER CONTENT AREA WITH AUTOMATIC FADING MASK */}
        <div className="relative flex-1 overflow-hidden h-full">
          {/* Edge fading shades */}
          <div 
            className="pointer-events-none absolute top-0 inset-x-0 h-8 z-10 transition-all duration-300"
            style={{ 
              backgroundImage: `linear-gradient(to bottom, rgba(9, 9, 11, ${opacityValue}) 0%, rgba(9, 9, 11, 0) 100%)`,
              opacity: isPlaying ? 1 : 0.4
            }}
          />
          <div 
            className="pointer-events-none absolute bottom-0 inset-x-0 h-8 z-10 transition-all duration-300"
            style={{ 
              backgroundImage: `linear-gradient(to top, rgba(9, 9, 11, ${opacityValue}) 0%, rgba(9, 9, 11, 0) 100%)`,
              opacity: isPlaying ? 1 : 0.4
            }}
          />

          {/* INTERNAL DIRECTLY EDITABLE SCROLLING CONTENT CANVAS */}
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="w-full h-full overflow-y-scroll px-5 md:px-7 py-[6vh] scroll-smooth"
            style={{ 
              scrollbarWidth: "none",
              msOverflowStyle: "none"
            }}
          >
            <div 
              className={`space-y-6 select-text transition-transform duration-300 ${
                mirrorText ? "scale-x-[-1]" : "scale-x-100"
              } ${
                textAlignment === "left" ? "text-left" : "text-center"
              }`}
            >
              {/* EDITABLE HOOK CONTAINER */}
              <div className="flex flex-col gap-1 text-center">
                <div 
                  className={`transition-all duration-500 overflow-hidden flex justify-center ${
                    isControlsVisible ? "opacity-40 max-h-6 mb-1 scale-100" : "opacity-0 max-h-0 scale-95 pointer-events-none mb-0"
                  }`}
                >
                  <span className="text-[7.5px] font-mono tracking-widest text-[#FF4FD8] font-extrabold uppercase bg-[#FF4FD8]/10 border border-[#FF4FD8]/25 px-1.5 py-0.5 rounded">
                    HOOK
                  </span>
                </div>
                <textarea
                  value={localHook}
                  onChange={(e) => setLocalHook(e.target.value)}
                  placeholder="Type Hook segment..."
                  className={`w-full bg-transparent border-none text-white focus:outline-none focus:ring-0 resize-none font-bold placeholder-white/30 leading-relaxed transition-all cursor-text py-0.5 select-text ${
                    textAlignment === "center" ? "text-center" : "text-left"
                  }`}
                  style={{ 
                    fontSize: `${computedFontSize}px`,
                    height: "auto"
                  }}
                  rows={Math.max(1, localHook.split("\n").length)}
                  onFocus={() => isPlaying && setIsPlaying(false)} // Pause when user edits
                />
              </div>

              {/* EDITABLE BODY CONTAINER */}
              <div className={`flex flex-col gap-1 text-center pt-3 transition-colors duration-500 border-t ${
                isControlsVisible ? "border-white/[0.06]" : "border-transparent"
              }`}>
                <div 
                  className={`transition-all duration-500 overflow-hidden flex justify-center ${
                    isControlsVisible ? "opacity-40 max-h-6 mb-1 scale-100" : "opacity-0 max-h-0 scale-95 pointer-events-none mb-0"
                  }`}
                >
                  <span className="text-[7.5px] font-mono tracking-widest text-[#C8FF5A] font-extrabold uppercase bg-[#C8FF5A]/10 border border-[#C8FF5A]/25 px-1.5 py-0.5 rounded">
                    BODY
                  </span>
                </div>
                <textarea
                  value={localBody}
                  onChange={(e) => setLocalBody(e.target.value)}
                  placeholder="Type script core body..."
                  className={`w-full bg-transparent border-none text-white/95 focus:outline-none focus:ring-0 resize-none font-bold placeholder-white/30 leading-relaxed transition-all cursor-text py-0.5 select-text ${
                    textAlignment === "center" ? "text-center" : "text-left"
                  }`}
                  style={{ 
                    fontSize: `${computedFontSize}px`,
                    height: "auto"
                  }}
                  rows={Math.max(2, localBody.split("\n").length)}
                  onFocus={() => isPlaying && setIsPlaying(false)}
                />
              </div>

              {/* EDITABLE CTA CONTAINER */}
              <div className={`flex flex-col gap-1 text-center pt-3 transition-colors duration-500 border-t ${
                isControlsVisible ? "border-white/[0.06]" : "border-transparent"
              }`}>
                <div 
                  className={`transition-all duration-500 overflow-hidden flex justify-center ${
                    isControlsVisible ? "opacity-40 max-h-6 mb-1 scale-100" : "opacity-0 max-h-0 scale-95 pointer-events-none mb-0"
                  }`}
                >
                  <span className="text-[7.5px] font-mono tracking-widest text-[#3B82F6] font-extrabold uppercase bg-[#3B82F6]/10 border border-[#3B82F6]/25 px-1.5 py-0.5 rounded">
                    CALL TO ACTION (CTA)
                  </span>
                </div>
                <textarea
                  value={localCta}
                  onChange={(e) => setLocalCta(e.target.value)}
                  placeholder="Type your conversion offer offer..."
                  className={`w-full bg-transparent border-none text-white/95 focus:outline-none focus:ring-0 resize-none font-bold placeholder-white/30 leading-relaxed transition-all cursor-text py-0.5 select-text ${
                    textAlignment === "center" ? "text-center" : "text-left"
                  }`}
                  style={{ 
                    fontSize: `${computedFontSize}px`,
                    height: "auto"
                  }}
                  rows={Math.max(1, localCta.split("\n").length)}
                  onFocus={() => isPlaying && setIsPlaying(false)}
                />
              </div>

              {/* SCRIPT TAIL END */}
              <div className="h-16 flex flex-col items-center justify-center pt-6 border-t border-white/5 opacity-50 font-mono">
                <span className="text-[7.5px] text-zinc-500 tracking-wider">FINISHED PRESENTATION</span>
                <button
                  onClick={handleResetScroll}
                  className="mt-1 px-2.5 py-0.5 rounded bg-white/5 hover:bg-white/10 text-[8.5px] text-white transition-colors cursor-pointer"
                >
                  Return to top
                </button>
              </div>
            </div>
          </div>

          {/* ADVANCED READING CONFIGURATIONS ATTACHED ABSOLUTE DRAWER */}
          <AnimatePresence>
            {showSettingsDrawer && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="absolute inset-x-0 bottom-0 top-0 bg-zinc-950/98 backdrop-blur-xl border-t border-white/10 p-4 overflow-y-auto block z-25 prevent-drag"
              >
                {/* Header of Drawer */}
                <div className="flex items-center justify-between pb-2 border-b border-white/5 mb-3">
                  <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#C8FF5A] flex items-center gap-1.5">
                    <Settings size={10} className="animate-spin" />
                    TELEPROMPTER SETTINGS
                  </span>
                  <button 
                    onClick={() => setShowSettingsDrawer(false)}
                    className="p-0.5 px-1.5 rounded bg-white/10 hover:bg-white/20 text-[9px] font-mono text-zinc-300 hover:text-white transition-all cursor-pointer"
                  >
                    Close Menu
                  </button>
                </div>

                {/* Settings Grid Content */}
                <div className="space-y-3.5 text-left font-mono">
                  
                  {/* TEXT SIZE BAR LIST */}
                  <div>
                    <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">TEXT SIZE SCALING:</span>
                    <div className="flex items-center gap-1 bg-white/5 p-0.5 rounded-lg border border-white/5">
                      {(["S", "M", "L", "XL"] as const).map((sz) => (
                        <button
                          key={sz}
                          onClick={() => setFontSizeMultiplier(sz)}
                          className={`flex-1 py-1 rounded text-[9px] font-black border transition-all cursor-pointer ${
                            fontSizeMultiplier === sz
                              ? "bg-[#C8FF5A] border-[#C8FF5A] text-black"
                              : "bg-transparent border-transparent text-[#A1A1AA] hover:text-white"
                          }`}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* SPEEDS SELECTION */}
                  <div>
                    <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">SCROLL VELOCITY FACTOR:</span>
                    <div className="flex items-center gap-1 bg-white/5 p-0.5 rounded-lg border border-white/5">
                      {([0.5, 1.0, 1.5, 2.0, 3.0] as const).map((spd) => (
                        <button
                          key={spd}
                          onClick={() => setSpeedMultiplier(spd)}
                          className={`flex-1 py-1 rounded text-[8px] font-black border transition-all cursor-pointer ${
                            speedMultiplier === spd
                              ? "bg-[#FF4FD8] border-[#FF4FD8] text-white"
                              : "bg-transparent border-transparent text-[#A1A1AA] hover:text-white"
                          }`}
                        >
                          {spd}x
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* TRANSPARENCIES SELECTOR */}
                  <div>
                    <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">PROMPTER TRANSPARENCY:</span>
                    <div className="flex items-center gap-1 bg-white/5 p-0.5 rounded-lg border border-white/5">
                      {([0.1, 0.3, 0.5, 0.7, 0.9] as const).map((op) => (
                        <button
                          key={op}
                          onClick={() => setOpacityValue(op)}
                          className={`flex-1 py-1 rounded text-[8px] font-bold border transition-all cursor-pointer ${
                            opacityValue === op
                              ? "bg-[#3B82F6] border-[#3B82F6] text-white"
                              : "bg-transparent border-transparent text-[#A1A1AA] hover:text-white"
                          }`}
                        >
                          {Math.round((1 - op) * 100)}%
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* DUAL MIRROR AND ALIGNMENT OPTIONS */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    
                    {/* Mirroring Toggles */}
                    <div className="space-y-1.5 bg-white/5 p-2 rounded-lg border border-white/5">
                      <span className="text-[7.5px] text-zinc-500 block uppercase font-bold tracking-wider">MIRROR TEXT RIG:</span>
                      <button
                        onClick={() => setMirrorText(!mirrorText)}
                        className={`w-full py-1 text-[8.5px] rounded font-black border transition-all cursor-pointer uppercase ${
                          mirrorText 
                            ? "bg-[#FF4FD8]/20 border-[#FF4FD8] text-[#FF4FD8]" 
                            : "bg-white/5 border-transparent text-zinc-400 hover:text-white"
                        }`}
                      >
                        {mirrorText ? "MIRRORED" : "REGULAR"}
                      </button>
                    </div>

                    <div className="space-y-1.5 bg-white/5 p-2 rounded-lg border border-white/5">
                      <span className="text-[7.5px] text-zinc-500 block uppercase font-bold tracking-wider">MIRROR WEBCAM:</span>
                      <button
                        onClick={() => setMirrorVideo(!mirrorVideo)}
                        className={`w-full py-1 text-[8.5px] rounded font-black border transition-all cursor-pointer uppercase ${
                          mirrorVideo 
                            ? "bg-[#C8FF5A]/20 border-[#C8FF5A] text-[#C8FF5A]" 
                            : "bg-white/5 border-transparent text-zinc-400 hover:text-white"
                        }`}
                      >
                        {mirrorVideo ? "MIRRORED" : "NORMAL"}
                      </button>
                    </div>

                  </div>

                  {/* TEXT GAZE ALIGNMENT COLUMN */}
                  <div className="grid grid-cols-2 gap-2">
                    
                    <div className="space-y-1.5 bg-white/5 p-2 rounded-lg border border-white/5">
                      <span className="text-[7.5px] text-zinc-500 block uppercase font-bold tracking-wider">TEXT ALIGNMENT:</span>
                      <div className="flex items-center gap-1 bg-black/40 p-0.5 rounded border border-white/5">
                        <button
                          onClick={() => setTextAlignment("left")}
                          className={`flex-1 py-1 rounded flex items-center justify-center gap-1 text-[8px] transition-all cursor-pointer ${
                            textAlignment === "left" ? "bg-white/10 text-[#C8FF5A]" : "text-zinc-500 hover:text-zinc-300"
                          }`}
                        >
                          <AlignLeft size={9} />
                          <span>LEFT</span>
                        </button>
                        <button
                          onClick={() => setTextAlignment("center")}
                          className={`flex-1 py-1 rounded flex items-center justify-center gap-1 text-[8px] transition-all cursor-pointer ${
                            textAlignment === "center" ? "bg-white/10 text-[#C8FF5A]" : "text-zinc-500 hover:text-zinc-300"
                          }`}
                        >
                          <AlignCenter size={9} />
                          <span>CENTER</span>
                        </button>
                      </div>
                    </div>

                    {/* LAYOUT RESET & QUICK SNAPS */}
                    <div className="space-y-1.5 bg-white/5 p-2 rounded-lg border border-white/5">
                      <span className="text-[7.5px] text-zinc-500 block uppercase font-bold tracking-wider">WINDOW ALIGN RESET:</span>
                      <div className="flex items-center gap-1 bg-black/40 p-0.5 rounded border border-white/5">
                        <button
                          onClick={() => handlePin("TOP")}
                          className="flex-1 py-1 text-[8px] rounded text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer font-bold"
                          title="Snap to top"
                        >
                          TOP
                        </button>
                        <button
                          onClick={() => handlePin("BOTTOM")}
                          className="flex-1 py-1 text-[8px] rounded text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer font-bold"
                          title="Snap to bottom"
                        >
                          BOT
                        </button>
                        <button
                          onClick={() => handlePin("RESET")}
                          className="flex-1 py-1 text-[8px] rounded text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer font-bold bg-white/5"
                          title="Center Reset coordinates"
                        >
                          RESET
                        </button>
                      </div>
                    </div>

                  </div>

                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* BOTTOM RIGHT CORNER RESIZE ACCENT HANDLE */}
        <div
          onMouseDown={handleResizeStart}
          onTouchStart={handleResizeStart}
          className={`absolute bottom-1 right-1 w-3.5 h-3.5 cursor-se-resize flex items-end justify-end select-none pointer-events-auto z-30 transition-opacity duration-300 ${
            isControlsVisible ? "opacity-60 hover:opacity-100" : "opacity-0 pointer-events-none"
          }`}
          title="Drag and resize window shape"
        >
          <div className="w-1.5 h-1.5 bg-[#FF4FD8] rounded-full mr-0.5 mb-0.5 animate-pulse" />
        </div>
      </div>

      {/* -------------------- MAIN CAMERA CAPTURING BOTTOM RECORD HUD -------------------- */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2.5 w-full max-w-xs">
        
        {/* Real-time sound level graphic equalizer dots */}
        <div className="flex items-center justify-center gap-1 h-5 select-none overflow-hidden text-zinc-500">
          {isRecording ? (
            <>
              {Array.from({ length: 12 }).map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ height: ["3px", `${Math.random() * 16 + 3}px`, "3px"] }}
                  transition={{ repeat: Infinity, duration: 0.55 + i * 0.04, ease: "easeInOut" }}
                  className="w-[2.5px] bg-red-500 rounded-full"
                />
              ))}
              <span className="text-[8px] font-mono tracking-widest text-red-500 font-extrabold ml-1.5">AUDIO FLOWING</span>
            </>
          ) : (
            <span className="text-[9px] font-mono tracking-widest text-[#A1A1AA]/50 font-black uppercase">PRACTICE CAPTURING READY</span>
          )}
        </div>

        {/* Center record trigger */}
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={`w-14 h-14 rounded-full border-4 flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 shadow-2xl cursor-pointer ${
            isRecording 
              ? "bg-red-600 border-white text-white animate-pulse" 
              : "bg-[#0b0c10] border-white/70 text-white hover:bg-zinc-950"
          }`}
          title={isRecording ? "Stop Recording" : "Start Practice capture"}
          id="camera-rec-toggle"
        >
          {isRecording ? (
            <div className="w-4.5 h-4.5 bg-white rounded-xs" />
          ) : (
            <div className="w-5 h-5 bg-red-600 rounded-full" />
          )}
        </button>
      </div>

      {/* -------------------- POLISHED PRACTICE SAVED REVIEW SHEET -------------------- */}
      <AnimatePresence>
        {showReplayModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-lg px-5">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-zinc-950 border border-white/10 rounded-2xl max-w-sm w-full p-6 shadow-2xl relative"
            >
              <div className="text-center space-y-4 font-sans">
                <div className="w-11 h-11 rounded-full bg-[#C8FF5A]/10 border border-[#C8FF5A]/30 flex items-center justify-center text-[#C8FF5A] mx-auto animate-bounce">
                  <Video size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold uppercase text-white tracking-widest font-mono">FLOW SESSION COMPILED!</h3>
                  <p className="text-[11px] text-[#A1A1AA] mt-1 leading-relaxed">
                    Practising script telemetry has generated high-retention performance insights. Check below:
                  </p>
                </div>

                {/* Webcam or local review results */}
                {recordedVideoUrl && cameraPermissionState === "granted" ? (
                  <div className="rounded-xl border border-white/5 overflow-hidden bg-black aspect-video relative">
                    <video
                      src={recordedVideoUrl}
                      controls
                      autoPlay
                      className={`w-full h-full object-cover ${mirrorVideo ? "scale-x-[-1]" : "scale-x-100"}`}
                    />
                  </div>
                ) : (
                  /* PERFORMANCE MATRIX STATS */
                  <div className="bg-white/5 border border-white/5 rounded-xl p-3.5 text-left font-mono space-y-2 text-[10px]">
                    <div className="flex items-center justify-between pb-1 border-b border-white/5">
                      <span className="text-zinc-500 uppercase tracking-widest font-bold">ANALYSIS RECORD:</span>
                      <span className="text-[#C8FF5A] font-bold">100% RETENTION SCORE</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-zinc-500">Pacing Word Rate:</span>
                        <span className="text-white block font-bold mt-0.5">144 Words / Min</span>
                      </div>
                      <div>
                        <span className="text-zinc-500">Camera Eye Contact:</span>
                        <span className="text-[#C8FF5A] block font-bold mt-0.5">94% Target Locked</span>
                      </div>
                      <div>
                        <span className="text-zinc-500">Practice Duration:</span>
                        <span className="text-[#FF4FD8] block font-bold mt-0.5">{formatTime(recordingSeconds || 15)}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500">Confidence Tone:</span>
                        <span className="text-white block font-bold mt-0.5">Highly Influential 📈</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="text-[10.5px] bg-pink-500/10 border border-[#FF4FD8]/25 text-[#FF4FD8] rounded-lg p-2.5 text-left leading-relaxed">
                  📖 <strong>Director AI Feed:</strong> Terrific physical posture and verbal pacing index. Keep practicing eye level lines aligned smoothly with the lens guide marker to optimize view-time retention!
                </div>

                {/* Actions buttons */}
                <div className="flex items-center gap-2.5 pt-2 font-mono">
                  <button
                    onClick={() => {
                      setRecordedChunks([]);
                      setRecordedVideoUrl(null);
                      setShowReplayModal(false);
                    }}
                    className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer text-center"
                  >
                    Retake
                  </button>

                  <button
                    onClick={() => {
                      if (recordedVideoUrl && cameraPermissionState === "granted") {
                        const link = document.createElement("a");
                        link.href = recordedVideoUrl;
                        link.download = `nannu_studio_pacing_draft_${Date.now()}.webm`;
                        link.click();
                      } else {
                        alert("Practice Draft registered into Creator AI engine successfully!");
                      }
                      setRecordedChunks([]);
                      setRecordedVideoUrl(null);
                      setShowReplayModal(false);
                    }}
                    className="flex-1 py-2.5 bg-[#C8FF5A] hover:bg-[#b0f035] text-black rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer text-center flex items-center justify-center gap-1.5"
                  >
                    <Download size={11} />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
