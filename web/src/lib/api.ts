import { useQuery } from "@tanstack/react-query";

export type Audio = "voice" | "music" | "silent";
export type Aspect = "9:16" | "1:1" | "16:9";
export type Status = "pending" | "running" | "success" | "partial" | "failed";

export type Prompt = {
	id: string;
	kind: "type" | "tone" | "custom";
	slug: string;
	name: string;
	description: string;
	type: string | null;
	aspect: string | null;
	duration: number | null;
	needs: string[];
	built_in: boolean;
	body: string;
	updated_at: string | null;
};

export type VideoRow = {
	id: string;
	title: string;
	url: string;
	github_url: string | null;
	type: string;
	type_id: string;
	status: Status;
	step: string;
	progress: number;
	aspect: Aspect;
	audio: Audio;
	variants: number;
	duration_sec: number | null;
	thumbnail_path: string | null;
	video_url: string | null;
	video_path: string | null;
	cost_usd: number | null;
	created_at: string;
};

export type Scene = { id: string; purpose: string; start: number; duration: number; narration: string; on_screen_text: string; visual: { type: string; [k: string]: unknown }; frame_path?: string | null };

export type Variant = {
	id: string;
	status: "pending" | "scripting" | "queued" | "rendering" | "success" | "failed";
	step: string;
	progress: number;
	error: string | null;
	concept: { type: string; title: string; angle: string; hook: string; audience: string; pace: string; theme?: { accent?: string } | null };
	caption?: string;
	result: null | {
		video_url: string | null;
		video_path: string | null;
		duration_sec: number;
		resolution: string;
		has_audio: boolean;
		title: string;
		logline: string;
		caption: string;
		music: { source: string; title: string | null; attribution: string | null } | null;
		thumbnail_path: string | null;
		captions_path: string | null;
		scenes: Scene[];
	};
};

export type Job = {
	id: string;
	title: string;
	status: Status;
	step: string;
	progress: number;
	type_label: string | null;
	input: {
		url: string;
		github_url: string | null;
		compare_urls: string[];
		prompt: string;
		prompt_id: string | null;
		type: string;
		tone: string;
		variations: number;
		target_duration_sec: number;
		aspect: Aspect;
		audio: Audio;
		voice: string;
	};
	estimate: { total_usd: number; per_video_usd: number };
	sources: { type: string; url: string; ok: boolean; detail: string | null }[];
	frames: { id: string; kind: string; source: string; preview_path: string | null; summary?: string; quality?: number; use_for?: string }[];
	brief: null | { product_name: string; one_liner: string; features?: { name: string; benefit: string }[]; proof?: { label: string; value: string }[]; hooks?: string[]; faqs?: { q: string; a: string }[] };
	variants: Variant[];
	cost: null | { total_usd: number; by_stage: Record<string, number>; by_variant: Record<string, number> };
	error: string | null;
	logs: string[];
	created_at: string;
	updated_at: string;
};

export type Settings = {
	openrouter_api_key: string;
	openrouter_api_key_set: boolean;
	openrouter_api_key_source: "env" | "settings" | null;
	uploadthing_token: string;
	uploadthing_token_set: boolean;
	uploadthing_token_source: "env" | "settings" | null;
	script_model: string;
	vision_model: string;
	tts_model: string;
	voice: string;
	aspect: Aspect;
	duration_sec: number;
	audio: Audio;
	captions: boolean;
	data_dir?: string;
};

export type Stats = { videos: number; jobs: number; rendering: number; prompts: number; custom_prompts: number; spend_usd: number };

export type CreateVideo = {
	url?: string;
	github_url?: string;
	compare_urls?: string[];
	prompt?: string;
	prompt_id?: string | null;
	type: string;
	tone: string;
	aspect: Aspect;
	audio: Audio;
	duration_sec: number;
	variations: number;
	voice?: string;
};

export class ApiError extends Error {
	code?: string;
	constructor(message: string, code?: string) {
		super(message);
		this.code = code;
	}
}

async function req<T>(path: string, init?: RequestInit & { json?: unknown }): Promise<T> {
	const res = await fetch(`/api${path}`, {
		...init,
		headers: init?.json !== undefined ? { "Content-Type": "application/json" } : undefined,
		body: init?.json !== undefined ? JSON.stringify(init.json) : init?.body,
	});
	const data = await res.json().catch(() => ({}));
	if (!res.ok) throw new ApiError(data?.error || `Request failed (${res.status})`, data?.code);
	return data as T;
}

export const api = {
	settings: () => req<Settings>("/settings"),
	saveSettings: (s: Partial<Settings>) => req<Settings>("/settings", { method: "PUT", json: s }),
	testKey: (openrouter_api_key?: string) => req<{ ok: boolean; error?: string; label?: string | null }>("/settings/test", { method: "POST", json: { openrouter_api_key } }),
	prompts: () => req<{ prompts: Prompt[] }>("/prompts").then((r) => r.prompts),
	prompt: (id: string) => req<Prompt>(`/prompts/${encodeURIComponent(id)}`),
	createPrompt: (p: Partial<Prompt>) => req<Prompt>("/prompts", { method: "POST", json: p }),
	updatePrompt: (id: string, p: Partial<Prompt>) => req<Prompt>(`/prompts/${encodeURIComponent(id)}`, { method: "PUT", json: p }),
	deletePrompt: (id: string) => req<{ ok: true }>(`/prompts/${encodeURIComponent(id)}`, { method: "DELETE" }),
	stats: () => req<Stats>("/stats"),
	videos: () => req<{ videos: VideoRow[] }>("/videos").then((r) => r.videos),
	video: (id: string) => req<Job>(`/videos/${id}`),
	createVideo: (body: CreateVideo) => req<Job>("/videos", { method: "POST", json: body }),
	deleteVideo: (id: string) => req<{ ok: true }>(`/videos/${id}`, { method: "DELETE" }),
	regenerate: (id: string) => req<Job>(`/videos/${id}/regenerate`, { method: "POST", json: {} }),
	estimate: (body: CreateVideo) => req<{ total_usd: number; per_video_usd: number }>("/estimate", { method: "POST", json: body }),
};

export const fileUrl = (jobId: string, rel?: string | null, download = false) =>
	rel ? `/api/files/${jobId}?p=${encodeURIComponent(rel)}${download ? "&download=1" : ""}` : null;

export const isActive = (s?: string) => s === "pending" || s === "running";

export const useSettings = () => useQuery({ queryKey: ["settings"], queryFn: api.settings });
export const usePrompts = () => useQuery({ queryKey: ["prompts"], queryFn: api.prompts });
export const useStats = () => useQuery({ queryKey: ["stats"], queryFn: api.stats, refetchInterval: 5000 });
export const useVideos = () =>
	useQuery({ queryKey: ["videos"], queryFn: api.videos, refetchInterval: (q) => ((q.state.data || []).some((v) => isActive(v.status)) ? 2000 : 10000) });
