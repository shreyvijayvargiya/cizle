import { facetsOf, type Facets } from "@/lib/facets";
import { useQuery } from "@tanstack/react-query";
import Fuse from "fuse.js";
import { useCallback, useEffect, useMemo, useState } from "react";
import { DEV_UNLOCK } from "./config";
import { firebaseConfigured, loadFirebase } from "./firebase";

export type GalleryItem = {
	id: string;
	slug: string;
	title: string;
	handle: string | null;
	author: string | null;
	category: string | null;
	tags: string[];
	model: string | null;
	tier: "free" | "premium";
	preview: string;
	chars: number;
	text?: string;
	/** the full text exists in a shard file (classic prompts): the index only carries the preview */
	hasText?: boolean;
	partial?: boolean;
	translatedFrom?: string;
	video: string | null;
	postUrl: string | null;
	sourceUrl: string | null;
	poster: string | null;
	/** every picture of an image prompt (the poster is the first) */
	images?: string[];
	hasVideo: boolean;
	added: string | null;
	/** language code of the prompt ("en" when the classic gallery does not say), the harvest version it came from ("classic" for v1 to v3) and what it is */
	lang?: string;
	version?: string;
	kind?: string;
	source?: string;
	fetchedAt?: string | null;
	license?: string;
	hasEnglish?: boolean;
	collection?: string;
	/** the picture or video is an illustration cizle made from the prompt (it is not the output of the model the prompt was written for) */
	previewBy?: string;
	/** country (from the language), tools and topic, worked out when the library loads */
	country?: string;
	tools?: string[];
	topic?: string;
	/** no open licence: only a preview is published, the full text stays at the source */
	restricted?: boolean;
};
export type GalleryIndex = { generatedAt: string; total: number; free: number; categories: string[]; languages: Record<string, number>; versions: VersionInfo[]; items: GalleryItem[] };
/** One entry of public/versions.json: a harvest version published next to the classic gallery. */
export type VersionInfo = { version: string; folder: string; store: string; built_at: string; fetched_at: { first: string | null; last: string | null }; gallery: string; skills: string; counts: { prompts: number; skills: number; with_video: number }; languages: Record<string, number> };
export const CLASSIC = "classic";
/** The kinds of prompt the library holds: one tab, one page and one filter each. */
export const COLLECTION_TABS = [
	{ id: "video", label: "Video", path: "/video-prompts", title: "Video prompts", blurb: "Prompts for AI video models, each with the clip it made." },
	{ id: "image", label: "Image", path: "/image-prompts", title: "Image prompts", blurb: "Prompts for AI image models, with the picture they produced." },
	{ id: "website", label: "Website", path: "/website-prompts", title: "Website prompts", blurb: "Prompts and design systems that make AI agents build landing pages and websites." },
	{ id: "app", label: "Mobile app", path: "/app-prompts", title: "Mobile app prompts", blurb: "Prompts and design systems that make AI agents build iOS, Android and cross-platform apps." },
	{ id: "text", label: "Text", path: "/text-prompts", title: "Text prompts", blurb: "General prompts for chat models: roles, writing, business and education." },
] as const;
export type CollectionId = (typeof COLLECTION_TABS)[number]["id"];
export const collectionLabel = (id?: string) => COLLECTION_TABS.find((c) => c.id === id)?.label ?? id ?? "";
/** a harvest version records its collection (website, app); older prompts are told apart by what they are */
export const collectionOf = (g: { collection?: string; kind?: string; version?: string }): CollectionId => (g.collection as CollectionId) || (g.kind === "image-prompt" ? "image" : g.version === "v7" ? "text" : "video");
export async function fetchVersions(): Promise<VersionInfo[]> {
	try {
		const res = await fetch("/versions.json");
		return res.ok ? await res.json() : [];
	} catch {
		return [];
	}
}
/** The prompt a /prompts/<slug> path names. The trailing id code decides, so an older title in a shared link still opens it. */
export function findPrompt(items: GalleryItem[] | undefined, slug: string) {
	const code = slug.slice(slug.lastIndexOf("-") + 1);
	return items?.find((g) => g.slug === slug) ?? (code ? items?.find((g) => g.slug.endsWith(`-${code}`)) : undefined);
}
export type GalleryFilters = { q?: string; category?: string; access?: string; sort?: string; p?: string; lang?: string; version?: string; country?: string; tool?: string; topic?: string; collection?: string };

/**
 * The classic gallery (/gallery.json, v1 to v3) plus every harvest version published next to it (/versions/<v>/gallery.json). Each version is its own file and
 * is only joined here, in memory: items keep their `version`, so nothing is mixed on disk. Premium prompts carry a preview, never the full text.
 */
export const useGallery = () =>
	useQuery({
		queryKey: ["gallery"],
		queryFn: async (): Promise<GalleryIndex> => {
			const [res, versions] = await Promise.all([fetch("/gallery.json"), fetchVersions()]);
			if (!res.ok) throw new Error(`Could not load the gallery (${res.status})`);
			const base = (await res.json()) as Omit<GalleryIndex, "languages" | "versions">;
			const extra = await Promise.all(versions.map(async (v) => ((await fetch(v.gallery)).json() as Promise<{ items: GalleryItem[]; categories: string[] }>).catch(() => ({ items: [], categories: [] }))));
			const classic = base.items.map((g) => ({ ...g, lang: g.lang || "en", version: g.version || CLASSIC }));
			const items = [...classic, ...extra.flatMap((e) => e.items)].map((g) => ({ ...g, collection: collectionOf(g), ...facetsOf(g.lang, g.tags, g.title, g.category, g.preview, g.source) }));
			const languages: Record<string, number> = {};
			for (const g of items) languages[g.lang || "en"] = (languages[g.lang || "en"] || 0) + 1;
			return { ...base, total: items.length, free: items.filter((g) => g.tier === "free").length, categories: [...new Set([...base.categories, ...extra.flatMap((e) => e.categories)])], languages, versions, items };
		},
		staleTime: 10 * 60_000,
		gcTime: 60 * 60_000,
	});

const shardOf = async (id: string) => {
	const buf = await crypto.subtle.digest("SHA-1", new TextEncoder().encode(id));
	return [...new Uint8Array(buf).slice(0, 1)].map((b) => b.toString(16).padStart(2, "0")).join("");
};

/** The full prompt: already in the file for free samples, otherwise a public per-prompt file (default), or Firestore (VITE_GALLERY_TEXT=firestore), or the dev server when testing. */
export function usePromptText(item: GalleryItem | undefined, isPro: boolean) {
	return useQuery({
		queryKey: ["gallery-text", item?.id],
		enabled: Boolean(item) && !item?.text && (isPro || item?.tier === "free" || (item?.version !== undefined && item.version !== CLASSIC)),
		staleTime: 30 * 60_000,
		queryFn: async (): Promise<string> => {
			// classic free prompts: the text sits in a shard next to the index (public/gallery-text/<xx>.json)
			if ((!item!.version || item!.version === CLASSIC) && item!.tier === "free" && item!.hasText) {
				const res = await fetch(`/gallery-text/${await shardOf(item!.id)}.json`);
				if (!res.ok) throw new Error("The text of this prompt could not be loaded.");
				const text = ((await res.json()) as Record<string, string>)[item!.id];
				if (!text) throw new Error("The text of this prompt is missing from its file.");
				return text;
			}
			// a harvest version keeps its full texts in its own small shard files, next to its gallery.json
			if (item!.version && item!.version !== CLASSIC) {
				const res = await fetch(`/versions/${item!.version}/text/${await shardOf(item!.id)}.json`);
				if (!res.ok) throw new Error("The text of this prompt could not be loaded.");
				const text = ((await res.json()) as Record<string, string>)[item!.id];
				if (!text) throw new Error("The text of this prompt is missing from its file.");
				return text;
			}
			// Default: a small public file per prompt (soft gate, no Firebase read). VITE_GALLERY_TEXT=firestore: Firestore, subscribers only.
			if (!DEV_UNLOCK && import.meta.env.VITE_GALLERY_TEXT === "public") {
				const res = await fetch(`/gallery/text/${item!.id}.json`);
				if (!res.ok) throw new Error("This prompt has not been published yet. Rebuild the site (npm run content).");
				return (await res.json()).text;
			}
			if (DEV_UNLOCK) {
				const res = await fetch(`/__gallery/${item!.id}.json`);
				if (!res.ok) throw new Error("Not found");
				return (await res.json()).text;
			}
			if (!firebaseConfigured) throw new Error("Sign-in is not configured.");
			const { db, fsMod } = await loadFirebase();
			const snap = await fsMod.getDoc(fsMod.doc(db, "gallery", item!.id));
			if (!snap.exists()) throw new Error("This prompt has not been published to the premium gallery yet.");
			return String(snap.data().text || "");
		},
	});
}

export function useGalleryFuse(items: GalleryItem[] | undefined) {
	return useMemo(
		() => new Fuse(items || [], { keys: [{ name: "title", weight: 3 }, { name: "preview", weight: 1.5 }, { name: "tags", weight: 1.5 }, { name: "author", weight: 1 }, { name: "handle", weight: 1 }, { name: "category", weight: 1 }], threshold: 0.32, ignoreLocation: true, minMatchCharLength: 2 }),
		[items],
	);
}

/** Two spellings of one category (the harvest has productui and product-ui) count as one. */
export const canonCategory = (c?: string | null) => (c === "productui" ? "product-ui" : c || "");

/** The order of the cards on a page load is random: a seed kept for the visit (so opening a card and coming back keeps its place), re-rolled by the Shuffle button. */
const SEED_KEY = "cizle-shuffle";
const newSeed = () => Math.floor(Math.random() * 2 ** 31);
function startSeed() {
	try {
		const saved = sessionStorage.getItem(SEED_KEY);
		if (saved) return Number(saved);
		const n = newSeed();
		sessionStorage.setItem(SEED_KEY, String(n));
		return n;
	} catch {
		return newSeed();
	}
}
export function useShuffle() {
	const [seed, setSeed] = useState(startSeed);
	const reshuffle = useCallback(() => {
		const n = newSeed();
		try {
			sessionStorage.setItem(SEED_KEY, String(n));
		} catch {
			/* private mode */
		}
		setSeed(n);
	}, []);
	// the logo (and anything else) can ask for a new order without knowing about this hook
	useEffect(() => {
		window.addEventListener(SHUFFLE_EVENT, reshuffle);
		return () => window.removeEventListener(SHUFFLE_EVENT, reshuffle);
	}, [reshuffle]);
	return { seed, reshuffle };
}
export const SHUFFLE_EVENT = "cizle:shuffle";
/** A new order for every list now on screen, and for the one that opens next. */
export function requestShuffle() {
	try {
		sessionStorage.removeItem(SEED_KEY);
	} catch {
		/* private mode */
	}
	window.dispatchEvent(new Event(SHUFFLE_EVENT));
}
/** Order by a hash of id + seed: the same seed gives the same order, a new seed a new one. */
export function shuffled<T extends { id: string }>(list: T[], seed: number): T[] {
	const h = (id: string) => {
		let x = seed ^ 0x9e3779b9;
		for (let i = 0; i < id.length; i++) x = Math.imul(x ^ id.charCodeAt(i), 2654435761);
		return (x ^ (x >>> 15)) >>> 0;
	};
	return [...list].sort((a, b) => h(a.id) - h(b.id));
}

export function filterGallery(items: GalleryItem[], fuse: Fuse<GalleryItem>, f: GalleryFilters, seed = 0) {
	let list = f.q?.trim() ? fuse.search(f.q.trim()).map((r) => r.item) : [...items];
	if (f.category) list = list.filter((g) => canonCategory(g.category) === canonCategory(f.category));
	if (f.access) list = list.filter((g) => g.tier === f.access);
	if (f.lang) list = list.filter((g) => (g.lang || "en") === f.lang);
	if (f.version) list = list.filter((g) => (g.version || CLASSIC) === f.version);
	if (f.collection) list = list.filter((g) => g.collection === f.collection);
	if (f.country) list = list.filter((g) => g.country === f.country);
	if (f.tool) list = list.filter((g) => g.tools?.includes(f.tool!));
	if (f.topic) list = list.filter((g) => g.topic === f.topic);
	if (!f.q?.trim()) {
		if (f.sort === "az") list.sort((a, b) => a.title.localeCompare(b.title));
		else if (f.sort === "long") list.sort((a, b) => b.chars - a.chars);
		else if (f.sort === "new") list.sort((a, b) => String(b.added || "").localeCompare(String(a.added || "")));
		else list = shuffled(list, seed); // default: random
	}
	return list;
}
