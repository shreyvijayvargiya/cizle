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

export const ASPECTS = [
	{ value: "9:16", label: "9:16", hint: "Reels, Shorts, TikTok" },
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
