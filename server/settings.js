/**
 * Local settings in data/settings.json (git-ignored). Keys entered in the dashboard are applied to
 * process.env so the pipeline picks them up immediately — no .env file or restart needed.
 * Values from a real .env / environment win over the file.
 */
import fs from "fs";
import fsp from "fs/promises";
import path from "path";
import { DATA_DIR } from "./paths.js";

const FILE = path.join(DATA_DIR, "settings.json");

export const DEFAULTS = {
	openrouter_api_key: "",
	uploadthing_token: "",
	script_model: "anthropic/claude-sonnet-4",
	vision_model: "google/gemini-2.5-flash",
	tts_model: "openai/gpt-audio-mini",
	image_model: "google/gemini-2.5-flash-image", // Image studio default; pick any image model per generation
	free_script_model: "auto", // "auto" = best free text model OpenRouter currently lists
	free_vision_model: "auto",
	voice: "nova",
	aspect: "9:16",
	duration_sec: 30,
	audio: "voice", // voice | music | silent
	captions: true,
	auto_sync: true, // re-check each product's repos and site at start and every 6 h while the app runs
};

const ENV_KEYS = { openrouter_api_key: "OPENROUTER_API_KEY", uploadthing_token: "UPLOADTHING_TOKEN" };
const fromEnvAtBoot = Object.fromEntries(Object.entries(ENV_KEYS).map(([k, env]) => [k, Boolean(process.env[env]?.trim())]));

let cache = null;

export function loadSettings() {
	if (cache) return cache;
	let file = {};
	try {
		file = JSON.parse(fs.readFileSync(FILE, "utf8"));
	} catch {
		/* first run */
	}
	cache = { ...DEFAULTS, ...file };
	applyToEnv(cache);
	return cache;
}

function applyToEnv(s) {
	for (const [k, env] of Object.entries(ENV_KEYS)) {
		if (fromEnvAtBoot[k]) continue; // a real environment variable always wins
		if (s[k]) process.env[env] = s[k];
		else delete process.env[env];
	}
}

export async function saveSettings(patch = {}) {
	const current = loadSettings();
	const next = { ...current };
	for (const k of Object.keys(DEFAULTS)) {
		if (!(k in patch)) continue;
		// Masked secrets coming back from the UI mean "unchanged".
		if (ENV_KEYS[k] && typeof patch[k] === "string" && patch[k].includes("•")) continue;
		next[k] = typeof DEFAULTS[k] === "number" ? Number(patch[k]) || DEFAULTS[k] : typeof DEFAULTS[k] === "boolean" ? Boolean(patch[k]) : String(patch[k] ?? "").trim();
	}
	await fsp.mkdir(DATA_DIR, { recursive: true });
	await fsp.writeFile(FILE, JSON.stringify(next, null, 2));
	cache = next;
	applyToEnv(next);
	return next;
}

const mask = (v) => (v ? `${v.slice(0, 6)}••••••${v.slice(-4)}` : "");

/** Settings as returned to the dashboard: secrets masked, plus where each key comes from. */
export function publicSettings() {
	const s = loadSettings();
	const out = { ...s };
	for (const [k, env] of Object.entries(ENV_KEYS)) {
		const value = process.env[env]?.trim() || "";
		out[k] = mask(value);
		out[`${k}_set`] = Boolean(value);
		out[`${k}_source`] = fromEnvAtBoot[k] ? "env" : value ? "settings" : null;
	}
	return out;
}

/** Ping OpenRouter's key endpoint. */
export async function testOpenRouterKey(candidate) {
	const key = (candidate && !candidate.includes("•") ? candidate : process.env.OPENROUTER_API_KEY || "").trim();
	if (!key) return { ok: false, error: "No OpenRouter key set" };
	try {
		const res = await fetch("https://openrouter.ai/api/v1/key", { headers: { Authorization: `Bearer ${key}` }, signal: AbortSignal.timeout(10_000) });
		const body = await res.json().catch(() => ({}));
		if (!res.ok) return { ok: false, error: body?.error?.message || `HTTP ${res.status}` };
		return { ok: true, label: body?.data?.label || null, usage: body?.data?.usage ?? null, limit: body?.data?.limit ?? null };
	} catch (e) {
		return { ok: false, error: `Could not reach OpenRouter: ${e.message}` };
	}
}
