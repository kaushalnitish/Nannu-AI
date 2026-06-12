import { LibraryItem, VoiceSettings } from "../types";

export const INITIAL_LIBRARY_ITEMS: LibraryItem[] = [
  {
    id: "lib-1",
    timestamp: "2 hours ago",
    prompt: "How I signed 5 high-ticket SaaS clients in one afternoon",
    mood: "Confident 😎",
    duration: "45 sec",
    contentType: "Talking Head",
    isFavorite: true,
    data: {
      script: {
        hook: {
          text: "I signed five recurring high-ticket SaaS clients in exactly four hours yesterday, and I didn't spend a single cent on ad spend or cold inbound pitches.",
          action: "Close-up. Speaker is smirking with high contrast dark glass frames. Sound cue: fast futuristic cash click."
        },
        body: {
          text: "Here is the math: I went to Product Hunt, scraped the emails of the top 10 founders who launched yesterday, and sent them brief, video-recorded bugs audits on Loom showing exactly where their signup flow broke. It took 15 mins per video. Value first, agreement second.",
          action: "Overlay schematic detailing Loom funnel metrics. Background lights dim further, exposing a high-end luxury gradient."
        },
        cta: {
          text: "Comment 'SCALE' and my assistant will DM you the template I used. 100% free, no questions asked.",
          action: "Point below with neon violet accent line pulsating."
        }
      },
      captions: [
        "scraped, audited, closed. 🤫 Here is how you bypass standard agency gatekeepers in 2026. Save this loop now.",
        "Stop writing generic cold emails. founders hate them. Do this unhinged Loom audit loophole instead. comment 'SCALE' below.",
        "Is active value outreach superior to standard SEO? Proof is in the retainers. Drop comments below."
      ],
      thumbnails: [
        { title: "5 SaaS Clients / 4h", description: "Glassmorphic board on pitch black surface, vivid pink neon drop border." },
        { title: "My Loom Secret", description: "Minimalist layout with heavy tracking, subtle luxury aesthetics." },
        { title: "The Anti-Pitch", description: "Futuristic dark overlay centered with high contrast lime text." }
      ]
    }
  },
  {
    id: "lib-2",
    timestamp: "1 day ago",
    prompt: "Why the classic 9-to-5 is officially a toxic paradigm",
    mood: "Aggressive 🔥",
    duration: "60 sec",
    contentType: "POV",
    data: {
      script: {
        hook: {
          text: "Keeping a standard 9-to-5 job is officially the single most financially dangerous move you can lock yourself into for 2026.",
          action: "POV over-the-shoulder look at a clock widget turning back dynamically. Luxury dark fashion hues."
        },
        body: {
          text: "We are living in an era where software handles standard labor. Sticking to a single pay stub means you possess 10x the risk of an entrepreneur with 10 clients. Multi-source asset distribution is your only real shield.",
          action: "Slow motion pan of presenter showing a modern high-end studio workspace."
        },
        cta: {
          text: "If you want to transition your current physical skills to digital retainers, click my bio link.",
          action: "Neon neon indicator slides in pointing towards top right corner."
        }
      },
      captions: [
        "The single client trap. 🚫 Sticking to a standard 9-to-5 is high stakes. Re-frame your perspective for 2026.",
        "Your resume is a pitch deck for a single high-concentration buyer. Diversify. comment 'SKILL' for details.",
        "Uncomfortable facts about the corporate grid. Save this video to remind yourself why you started."
      ],
      thumbnails: [
        { title: "9-to-5 is a Trap", description: "Bold modern Helvetica text, monochrome background with sharp pink slash mark." },
        { title: "The Sovereign Career", description: "Apple Vision Pro ambient style mockup, soft rounded edges." },
        { title: "90 Days to Escaping", description: "High retention neon green clock overlay highlighting timeline nodes." }
      ]
    }
  },
  {
    id: "lib-3",
    timestamp: "3 days ago",
    prompt: "A simple visualization hack to cure developer's block",
    mood: "Motivational 🚀",
    duration: "30 sec",
    contentType: "Storytelling",
    data: {
      script: {
        hook: {
          text: "If you find yourself stuck staring at an empty file tree for more than five minutes, stop typing immediately.",
          action: "Direct stare into lens. Abstract neon particles floating gently on background. Deep bass pulse."
        },
        body: {
          text: "Most block comes from editing while draft building. You must separate the Critic from the Creator. Write the worst, most broken un-optimized block first. Only review it when you have 100 complete words of mess.",
          action: "High contrast typewriter-style text scrolls down showing standard syntax compiling successfully."
        },
        cta: {
          text: "Bookmark this to prevent your next code block. Hit follow for daily SaaS design patterns.",
          action: "Clean Apple-style follow checkmark pops up."
        }
      },
      captions: [
        "Creator vs Critic. ⚖️ How to bypass visual block by embracing raw drafting rules. Bookmark for reference.",
        "The infinite blank slate loop. Do not write clean first. write dirty then refine. Follow for more.",
        "Hacking software fatigue. Drop your favorite drafting hacks in the comment section."
      ],
      thumbnails: [
        { title: "Beat Blank Slates", description: "Abstract luminous node cluster with vivid violet lighting rings." },
        { title: "Drafting Over Designing", description: "Symmetric card layout with precise borders and JetBrains Mono fonts." },
        { title: "Stop Coding Clean", description: "High contrast dark mode styling showcasing a single massive highlighted line." }
      ]
    }
  }
];

export const INITIAL_VOICE_SETTINGS: VoiceSettings = {
  vocabulary: "Executive SaaS & Startup",
  baseEnergy: "Dynamic Speech",
  voiceSyncScore: 92,
  lastTrained: "Last trained 4 hours ago",
  selectedTones: ["Excited 🔥", "Friendly 🤝"]
};

export function getSavedLibrary(): LibraryItem[] {
  const data = localStorage.getItem("nannu_library");
  if (!data) {
    localStorage.setItem("nannu_library", JSON.stringify(INITIAL_LIBRARY_ITEMS));
    return INITIAL_LIBRARY_ITEMS;
  }
  return JSON.parse(data);
}

export function saveLibraryItem(item: LibraryItem) {
  const current = getSavedLibrary();
  current.unshift(item);
  localStorage.setItem("nannu_library", JSON.stringify(current));
}

export function updateLibraryItem(updated: LibraryItem) {
  const current = getSavedLibrary();
  const index = current.findIndex(i => i.id === updated.id);
  if (index !== -1) {
    current[index] = updated;
    localStorage.setItem("nannu_library", JSON.stringify(current));
  }
}

export function toggleFavoriteItem(id: string): LibraryItem[] {
  const current = getSavedLibrary();
  const updated = current.map(item => {
    if (item.id === id) {
      return { ...item, isFavorite: !item.isFavorite };
    }
    return item;
  });
  localStorage.setItem("nannu_library", JSON.stringify(updated));
  return updated;
}

export function deleteLibraryItem(id: string): LibraryItem[] {
  const current = getSavedLibrary();
  const updated = current.filter(item => item.id !== id);
  localStorage.setItem("nannu_library", JSON.stringify(updated));
  return updated;
}

export function getSavedVoiceSettings(): VoiceSettings {
  const data = localStorage.getItem("nannu_voice");
  if (!data) {
    localStorage.setItem("nannu_voice", JSON.stringify(INITIAL_VOICE_SETTINGS));
    return INITIAL_VOICE_SETTINGS;
  }
  return JSON.parse(data);
}

export function saveVoiceSettings(settings: VoiceSettings) {
  localStorage.setItem("nannu_voice", JSON.stringify(settings));
}
