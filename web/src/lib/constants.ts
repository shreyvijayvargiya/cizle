export const REPO_URL = "https://github.com/shreyvijayvargiya/cizle";

export const STEP_LABELS: Record<string, string> = {
	queued: "Queued",
	context: "Reading the product",
	frames: "Analysing screenshots",
	brief: "Writing the brief",
	concepts: "Planning concepts",
	script: "Writing scripts",
	render: "Rendering",
	narration: "Recording voice-over",
	frames_render: "Drawing frames",
	render_clips: "Animating scenes",
	audio_mix: "Mixing audio",
	mux: "Finishing video",
	upload: "Uploading",
	done: "Done",
};

export const PIPELINE = ["context", "frames", "brief", "concepts", "script", "render", "done"] as const;
/** Article types (Sketch Explainer) skip screenshots and the product brief. */
export const ARTICLE_PIPELINE = ["context", "script", "render", "done"] as const;
/** Storyboards written by Claude Code (or any agent) only need rendering. */
export const STORYBOARD_PIPELINE = ["render", "done"] as const;

export const ASPECTS = [
	{ value: "9:16", label: "9:16", hint: "Reels, Shorts, TikTok" },
	{ value: "4:5", label: "4:5", hint: "Meta feed ads" },
	{ value: "1:1", label: "1:1", hint: "Feed posts" },
	{ value: "16:9", label: "16:9", hint: "YouTube, landing pages" },
] as const;

export const AUDIO = [
	{ value: "voice", label: "Voice-over + music" },
	{ value: "music", label: "Music only" },
	{ value: "silent", label: "Silent" },
] as const;

export const VOICES = ["nova", "alloy", "echo", "fable", "onyx", "shimmer"];

export const STYLES = [
	{ value: "auto", label: "From tone", hint: "The tone or type picks the look" },
	{ value: "default", label: "Clean", hint: "Real UI, soft gradients" },
	{ value: "sketch", label: "Hand-drawn", hint: "Whiteboard ink on paper" },
	{ value: "clay", label: "Clay", hint: "Soft, squishy, playful" },
	{ value: "glass", label: "Glass", hint: "Frosted cards over a glow" },
	{ value: "isometric", label: "Isometric", hint: "Extruded blocks and cubes" },
	{ value: "ascii", label: "ASCII", hint: "Animated terminal" },
] as const;

export const STYLE_LABEL: Record<string, string> = Object.fromEntries(STYLES.map((s) => [s.value, s.label]));

/** Kinds of brand or founder, used to pick which prompts to suggest first. */
export const FOUNDERS = [
	{ value: "solo", label: "Solo / indie" },
	{ value: "devtool", label: "Dev tool" },
	{ value: "b2b", label: "B2B SaaS" },
	{ value: "ai", label: "AI product" },
	{ value: "fundraising", label: "Raising" },
	{ value: "ecommerce", label: "Online shop" },
	{ value: "beauty", label: "Beauty and fashion" },
	{ value: "food", label: "Food and drink" },
	{ value: "health", label: "Health and fitness" },
	{ value: "local", label: "Local business" },
	{ value: "app", label: "App or game" },
	{ value: "creator", label: "Creator or agency" },
] as const;

export const FOUNDER_LABEL: Record<string, string> = Object.fromEntries(FOUNDERS.map((f) => [f.value, f.label]));

/** A starting guess for the founder kind from the product's category. The founder can change it. */
const BRAND_OF_CATEGORY: Record<string, string> = { devtools: "devtool", "ai-agents": "ai", ecommerce: "ecommerce", "beauty-fashion": "beauty", "food-drink": "food", "health-fitness": "health", "local-services": "local", "apps-games": "app", creator: "creator" };
export const founderFromCategory = (category?: string): string => BRAND_OF_CATEGORY[category || ""] || (category && category !== "other" ? "b2b" : "solo");

/** Ad platforms the prompt library has ad formats for. */
export const PLATFORMS = [
	{ value: "meta", label: "Meta", hint: "Instagram and Facebook" },
	{ value: "tiktok", label: "TikTok", hint: "In-Feed ads" },
	{ value: "google", label: "Google Ads", hint: "YouTube and display" },
] as const;

export const PLATFORM_LABEL: Record<string, string> = Object.fromEntries(PLATFORMS.map((p) => [p.value, p.label]));
