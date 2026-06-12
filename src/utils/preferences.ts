import { LibraryItem } from "../types";

export interface PreferenceProfile {
  interactions: {
    copiedCount: number;
    savedCount: number;
    regeneratedCount: number;
    editedCount: number;
    revisitedCount: number;
    readingSecTotal: number;
    exportedCount: number;
    generateMoreCount: number;
  };
  preferredTones: Record<string, number>; // tone name -> weight
  preferredStyle: Record<string, number>; // contentType -> weight
  preferredVocabulary: Record<string, number>; // vocabulary -> weight
  sentenceLengthTrend: "short" | "punchy & conversational" | "long & explanatory";
  preferredHookStyle: Record<string, number>; // hookStyle -> weight
  preferredCtaStyle: Record<string, number>; // ctaStyle -> weight
  successfulPatterns: string[]; // list of topics/keys that user liked (copied or saved)
}

const DEFAULT_PROFILE: PreferenceProfile = {
  interactions: {
    copiedCount: 0,
    savedCount: 0,
    regeneratedCount: 0,
    editedCount: 0,
    revisitedCount: 0,
    readingSecTotal: 0,
    exportedCount: 0,
    generateMoreCount: 0,
  },
  preferredTones: {},
  preferredStyle: {},
  preferredVocabulary: {},
  sentenceLengthTrend: "punchy & conversational",
  preferredHookStyle: {},
  preferredCtaStyle: {},
  successfulPatterns: [],
};

// Retrieve hidden preference profile from local storage
export function getSavedPreferenceProfile(): PreferenceProfile {
  try {
    const data = localStorage.getItem("nannu_hidden_preferences");
    if (!data) {
      localStorage.setItem("nannu_hidden_preferences", JSON.stringify(DEFAULT_PROFILE));
      return { ...DEFAULT_PROFILE };
    }
    const parsed = JSON.parse(data);
    // Ensure nested fields fit nicely and are resilient
    return {
      interactions: { ...DEFAULT_PROFILE.interactions, ...parsed.interactions },
      preferredTones: parsed.preferredTones || {},
      preferredStyle: parsed.preferredStyle || {},
      preferredVocabulary: parsed.preferredVocabulary || {},
      sentenceLengthTrend: parsed.sentenceLengthTrend || "punchy & conversational",
      preferredHookStyle: parsed.preferredHookStyle || {},
      preferredCtaStyle: parsed.preferredCtaStyle || {},
      successfulPatterns: parsed.successfulPatterns || [],
    };
  } catch (e) {
    console.warn("Failsafe: error decoding preference state logs, returning defaults", e);
    return { ...DEFAULT_PROFILE };
  }
}

// Persist user preference profile updates
export function savePreferenceProfile(profile: PreferenceProfile) {
  try {
    localStorage.setItem("nannu_hidden_preferences", JSON.stringify(profile));
  } catch (e) {
    console.error("Failsafe: unable to save preference log updates", e);
  }
}

// Track actions helper to update weights automatically
function incrementWeight(record: Record<string, number>, key: string, amount = 1) {
  if (!key) return;
  record[key] = (record[key] || 0) + amount;
}

// Retrieve top sorting keys for prompt embedding
function getTopKeys(record: Record<string, number>, limit = 3): string[] {
  return Object.entries(record)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([key]) => key);
}

// 1. WHICH SCRIPTS USERS COPY
export function trackCopyAction(metadata: {
  prompt: string;
  mood: string;
  contentType: string;
  vocabulary?: string;
}) {
  const profile = getSavedPreferenceProfile();
  profile.interactions.copiedCount += 1;

  // Add weights to attributes
  incrementWeight(profile.preferredTones, metadata.mood, 3);
  incrementWeight(profile.preferredStyle, metadata.contentType, 3);
  if (metadata.vocabulary) {
    incrementWeight(profile.preferredVocabulary, metadata.vocabulary, 3);
  }

  // Deduce Hook Style based on mood and style
  if (metadata.mood.toLowerCase().includes("aggressive") || metadata.mood.toLowerCase().includes("roast")) {
    incrementWeight(profile.preferredHookStyle, "Agitate Pain & Savage Truth", 4);
    profile.sentenceLengthTrend = "short";
  } else if (metadata.contentType === "Storytelling") {
    incrementWeight(profile.preferredHookStyle, "Vulnerability & Metaphor Story", 4);
    profile.sentenceLengthTrend = "long & explanatory";
  } else {
    incrementWeight(profile.preferredHookStyle, "Curiosity Gap & Fact-Based Highlight", 2);
  }

  // Deduce CTA style pattern
  if (profile.interactions.copiedCount > 3) {
    profile.sentenceLengthTrend = "punchy & conversational";
  }

  // Store successful topics
  if (metadata.prompt && !profile.successfulPatterns.includes(metadata.prompt)) {
    profile.successfulPatterns.push(metadata.prompt);
    // Keep max 15 successful prompt references
    if (profile.successfulPatterns.length > 15) {
      profile.successfulPatterns.shift();
    }
  }

  savePreferenceProfile(profile);
  console.log("BACKGROUND LEARNING: Tracked text COPY event. Profile updated! Current top tones:", getTopKeys(profile.preferredTones));
}

// 2. WHICH SCRIPTS USERS SAVE
export function trackSaveAction(metadata: {
  prompt: string;
  mood: string;
  contentType: string;
  vocabulary?: string;
}) {
  const profile = getSavedPreferenceProfile();
  profile.interactions.savedCount += 1;

  // Saved is a strong signal - double the weights addition!
  incrementWeight(profile.preferredTones, metadata.mood, 4);
  incrementWeight(profile.preferredStyle, metadata.contentType, 4);
  if (metadata.vocabulary) {
    incrementWeight(profile.preferredVocabulary, metadata.vocabulary, 4);
  }

  incrementWeight(profile.preferredHookStyle, metadata.contentType === "Storytelling" ? "Personal/Observation metaphor" : "Bold contrast facts", 3);

  // Store successful topics
  if (metadata.prompt && !profile.successfulPatterns.includes(metadata.prompt)) {
    profile.successfulPatterns.push(metadata.prompt);
  }

  savePreferenceProfile(profile);
  console.log("BACKGROUND LEARNING: Tracked script SAVE event. Profile updated!");
}

// 3. WHICH SCRIPTS USERS SPEND TIME READING (seconds interval tracking)
export function trackReadingDuration(seconds: number, metadata: {
  prompt: string;
  mood: string;
  contentType: string;
}) {
  const profile = getSavedPreferenceProfile();
  profile.interactions.readingSecTotal += seconds;

  // If reading more than 15 seconds, user is high-intent, treat as success signal
  if (seconds >= 12) {
    incrementWeight(profile.preferredTones, metadata.mood, 1);
    incrementWeight(profile.preferredStyle, metadata.contentType, 1);
  }

  savePreferenceProfile(profile);
  console.log(`BACKGROUND LEARNING: Tracked ${seconds}s reading duration.`);
}

// 4. WHICH SCRIPTS USERS REGENERATE
export function trackRegenerateAction(metadata: {
  prompt: string;
  mood: string;
  contentType: string;
}) {
  const profile = getSavedPreferenceProfile();
  profile.interactions.regeneratedCount += 1;

  // Regeneration is a mild rejection of the current style, slightly decrement weights or shift preferences
  // This is a negative modifier to current mood & style so the loop changes dynamically
  incrementWeight(profile.preferredTones, metadata.mood, -1);
  incrementWeight(profile.preferredStyle, metadata.contentType, -1);

  savePreferenceProfile(profile);
  console.log("BACKGROUND LEARNING: Tracked REGENERATE event. Adapting style bias.");
}

// 5. WHICH SCRIPTS USERS EDIT BEFORE USING
export function trackEditAction(metadata: {
  prompt: string;
  mood: string;
  contentType: string;
}) {
  const profile = getSavedPreferenceProfile();
  profile.interactions.editedCount += 1;

  // Editing indicates the user likes the core but wants adjustment (e.g. they edit a word, sentence structure)
  incrementWeight(profile.preferredTones, metadata.mood, 2);
  incrementWeight(profile.preferredStyle, metadata.contentType, 2);
  
  // High edit rates indicate they want customized lengths (trend toward conversational pacing)
  profile.sentenceLengthTrend = "punchy & conversational";

  savePreferenceProfile(profile);
  console.log("BACKGROUND LEARNING: Tracked script EDIT event. Reinforcing conversational style.");
}

// 6. WHICH SCRIPTS USERS REVISIT LATER
export function trackRevisitAction(metadata: {
  prompt: string;
  mood: string;
  contentType: string;
}) {
  const profile = getSavedPreferenceProfile();
  profile.interactions.revisitedCount += 1;

  // Revisit signifies long-term value
  incrementWeight(profile.preferredTones, metadata.mood, 2);
  incrementWeight(profile.preferredStyle, metadata.contentType, 2);

  savePreferenceProfile(profile);
  console.log("BACKGROUND LEARNING: Tracked REVISIT event.");
}

// 7. EXPORT ACTIONS (SAVES OR DOWNLOADS)
export function trackExportAction(metadata: {
  prompt: string;
  mood: string;
  contentType: string;
}) {
  const profile = getSavedPreferenceProfile();
  profile.interactions.exportedCount = (profile.interactions.exportedCount || 0) + 1;

  // High interest indicator
  incrementWeight(profile.preferredTones, metadata.mood, 3);
  incrementWeight(profile.preferredStyle, metadata.contentType, 3);

  savePreferenceProfile(profile);
  console.log("BACKGROUND LEARNING: Tracked EXPORT event. Profile enriched!");
}

// 8. GENERATE MORE LIKE THIS CLICKS
export function trackGenerateMoreLikeThisAction(metadata: {
  prompt: string;
  mood: string;
  contentType: string;
}) {
  const profile = getSavedPreferenceProfile();
  profile.interactions.generateMoreCount = (profile.interactions.generateMoreCount || 0) + 1;

  // Strong stylistic recommendation
  incrementWeight(profile.preferredTones, metadata.mood, 4);
  incrementWeight(profile.preferredStyle, metadata.contentType, 4);

  savePreferenceProfile(profile);
  console.log("BACKGROUND LEARNING: Tracked GENERATE MORE LIKE THIS click.");
}

// Prepare summary instructions to pass to the AI generator
export function getPreferenceProfileString(): string {
  const profile = getSavedPreferenceProfile();
  
  const topTones = getTopKeys(profile.preferredTones, 3);
  const topStyles = getTopKeys(profile.preferredStyle, 2);
  const topVocabs = getTopKeys(profile.preferredVocabulary, 2);
  const topHooks = getTopKeys(profile.preferredHookStyle, 2);

  const profileSummaryParts = [];

  if (topTones.length > 0) {
    profileSummaryParts.push(`Creator's historically preferred tones: ${topTones.join(", ")}`);
  }
  if (topStyles.length > 0) {
    profileSummaryParts.push(`Creator's preferred content formats: ${topStyles.join(", ")}`);
  }
  if (topVocabs.length > 0) {
    profileSummaryParts.push(`Creator's preferred vocabulary dialects: ${topVocabs.join(", ")}`);
  }
  if (topHooks.length > 0) {
    profileSummaryParts.push(`Creator's preferred hook mechanics: ${topHooks.join(", ")}`);
  }

  profileSummaryParts.push(`Creator's custom text trend layout: ${profile.sentenceLengthTrend}`);
  
  if (profile.successfulPatterns.length > 0) {
    profileSummaryParts.push(`Creator's successful content historical topics: "${profile.successfulPatterns.slice(-4).join('", "')}"`);
  }

  return profileSummaryParts.join(" | ");
}

export interface AnalyticsEvent {
  timestamp: string;
  event: string;
  metadata: any;
}

export function logAnalyticsEvent(event: string, metadata: any = {}) {
  try {
    const raw = localStorage.getItem("nannu_analytics_events");
    const events: AnalyticsEvent[] = raw ? JSON.parse(raw) : [];
    
    events.unshift({
      timestamp: new Date().toISOString(),
      event,
      metadata
    });
    
    // limited to 100 entries for mobile space conservation
    if (events.length > 100) {
      events.pop();
    }
    
    localStorage.setItem("nannu_analytics_events", JSON.stringify(events));
    console.log(`[ANALYTICS] ${event}`, metadata);
  } catch (err) {
    console.warn("Failsafe analytics exception:", err);
  }
}

export function getAnalyticsEvents(): AnalyticsEvent[] {
  try {
    const raw = localStorage.getItem("nannu_analytics_events");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function clearAnalyticsEvents() {
  localStorage.removeItem("nannu_analytics_events");
}

