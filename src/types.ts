export interface PromptSettings {
  prompt: string;
  mood: string;
  duration: string;
  contentType: string;
  energyLevel: string;
  language: string;
}

export interface GeneratedScriptCard {
  text: string;
  action: string;
}

export interface GeneratedScriptPayload {
  script: {
    hook: GeneratedScriptCard;
    body: GeneratedScriptCard;
    cta: GeneratedScriptCard;
  };
  captions: string[];
  thumbnails: {
    title: string;
    description: string;
  }[];
}

export interface LibraryItem {
  id: string;
  timestamp: string;
  prompt: string;
  mood: string;
  duration: string;
  contentType: string;
  language?: string;
  data: GeneratedScriptPayload;
  isFavorite?: boolean;
}

export interface VoiceSettings {
  vocabulary: string; // e.g. "Startup/SaaS", "Casual Gen Z", "Philosophical", "No-BS Aggressive"
  baseEnergy?: "High Energy" | "Calm & Deep" | "Dynamic Speech" | string;
  voiceSyncScore: number;
  lastTrained: string;
  selectedTones?: string[];
}
