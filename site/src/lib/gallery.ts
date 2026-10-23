import { useQuery } from "@tanstack/react-query";
import Fuse from "fuse.js";
import { useMemo } from "react";
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
	partial?: boolean;
	translatedFrom?: string;
	video: string | null;
	postUrl: string | null;
	sourceUrl: string | null;
	poster: string | null;
	hasVideo: boolean;
	added: string | null;
};
export type GalleryIndex = { generatedAt: string; total: number; free: number; categories: string[]; items: GalleryItem[] };
/** The prompt a /prompts/<slug> path names. The trailing id code decides, so an older title in a shared link still opens it. */
export function findPrompt(items: GalleryItem[] | undefined, slug: string) {
	const code = slug.slice(slug.lastIndexOf("-") + 1);
	return items?.find((g) => g.slug === slug) ?? (code ? items?.find((g) => g.slug.endsWith(`-${code}`)) : undefined);
}
export type GalleryFilters = { q?: string; category?: string; access?: string; sort?: string; p?: string };

/** One static file, loaded only on the gallery (and its home-page teaser). Premium prompts carry a preview, never the full text. */
export const useGallery = () =>
	useQuery({
		queryKey: ["gallery"],
		queryFn: async (): Promise<GalleryIndex> => {
			const res = await fetch("/gallery.json");
			if (!res.ok) throw new Error(`Could not load the gallery (${res.status})`);
			return res.json();
		},
		staleTime: 10 * 60_000,
		gcTime: 60 * 60_000,
	});

/** The full prompt: already in the file for free samples, otherwise a public per-prompt file (default), or Firestore (VITE_GALLERY_TEXT=firestore), or the dev server when testing. */
export function usePromptText(item: GalleryItem | undefined, isPro: boolean) {
	return useQuery({
		queryKey: ["gallery-text", item?.id],
		enabled: Boolean(item) && !item?.text && isPro,
		staleTime: 30 * 60_000,
		queryFn: async (): Promise<string> => {
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

export function filterGallery(items: GalleryItem[], fuse: Fuse<GalleryItem>, f: GalleryFilters) {
	let list = f.q?.trim() ? fuse.search(f.q.trim()).map((r) => r.item) : [...items];
	if (f.category) list = list.filter((g) => canonCategory(g.category) === canonCategory(f.category));
	if (f.access) list = list.filter((g) => g.tier === f.access);
	if (!f.q?.trim()) {
		if (f.sort === "az") list.sort((a, b) => a.title.localeCompare(b.title));
		else if (f.sort === "long") list.sort((a, b) => b.chars - a.chars);
		else list.sort((a, b) => String(b.added || "").localeCompare(String(a.added || "")));
	}
	return list;
}
