import { useQuery } from "@tanstack/react-query";
import Fuse from "fuse.js";
import { useMemo } from "react";
import { DEV_UNLOCK } from "./config";
import { firebaseConfigured, loadFirebase } from "./firebase";

export type Tier = "free" | "premium";
export type SkillMeta = {
	slug: string;
	source: string;
	sourceSlug: string;
	order: number;
	name: string;
	summary: string;
	category: string;
	platform: string;
	format: string;
	aspect: string;
	duration: number | null;
	tier: Tier;
	featured: boolean;
	tags: string[];
	bestFor: string[];
	scenes: string[];
	anatomy: string[];
	video: string | null;
	poster: string | null;
	credit: { author: string; license: string; source: string | null } | null;
};
export type SkillsIndex = { categories: string[]; platforms: string[]; formats: string[]; aspects: string[]; skills: SkillMeta[] };
export type Scene = { n: number; name: string; time: string; visual: string; text: string };
export type SkillDetail = Omit<SkillMeta, "scenes" | "anatomy"> & {
	scenes: Scene[];
	anatomy: Scene[];
	goal: string;
	needs: string[];
	faq: { q: string; a: string }[];
	cli: string;
	locked: boolean;
	explanationHtml: string;
	howtoHtml: string;
	promptText: string | null;
	skillMd: string | null;
	related: string[];
};
export type Post = { slug: string; title: string; description: string; date: string; tags: string[]; skill: string | null; minutes: number; html?: string; toc?: { id: string; title: string }[] };
export type Page = { title: string; html: string; toc: { id: string; title: string }[] };
export type Faq = { q: string; a: string }[];

async function getJson<T>(url: string): Promise<T> {
	const res = await fetch(url);
	if (!res.ok) throw new Error(`Could not load ${url} (${res.status})`);
	return res.json();
}

const STATIC = { staleTime: 10 * 60_000, gcTime: 60 * 60_000 };
export const useSkills = () => useQuery({ queryKey: ["skills"], queryFn: () => getJson<SkillsIndex>("/skills.json"), ...STATIC });
export const skillQuery = (slug: string) => ({ queryKey: ["skill", slug], queryFn: () => getJson<SkillDetail>(`/skills/${slug}.json`), ...STATIC });
export const useSkill = (slug?: string) => useQuery({ ...skillQuery(slug || ""), enabled: Boolean(slug) });
export const usePosts = () => useQuery({ queryKey: ["posts"], queryFn: () => getJson<Post[]>("/blog.json"), ...STATIC });
export const usePost = (slug: string) => useQuery({ queryKey: ["post", slug], queryFn: () => getJson<Post>(`/blog/${slug}.json`), ...STATIC });
export const usePage = (name: "docs" | "terms" | "privacy" | "refund") => useQuery({ queryKey: ["page", name], queryFn: () => getJson<Page>(`/content/${name}.json`), ...STATIC });
export const useFaq = () => useQuery({ queryKey: ["faq"], queryFn: () => getJson<Faq>("/content/faq.json"), ...STATIC });

/** The locked half of a premium skill: Firestore (rules only let subscribers read it), or the dev server when testing. */
export function usePremiumBody(slug: string | undefined, isPro: boolean) {
	return useQuery({
		queryKey: ["premium", slug],
		enabled: Boolean(slug) && isPro,
		staleTime: 30 * 60_000,
		queryFn: async (): Promise<{ promptText: string; skillMd: string }> => {
			if (DEV_UNLOCK) return getJson(`/__premium/${slug}.json`);
			if (!firebaseConfigured) throw new Error("Sign-in is not configured.");
			const { db, fsMod } = await loadFirebase();
			const snap = await fsMod.getDoc(fsMod.doc(db, "premium", slug!));
			if (!snap.exists()) throw new Error("This skill has not been published to the premium library yet.");
			const d = snap.data();
			return { promptText: String(d.promptText || ""), skillMd: String(d.skillMd || "") };
		},
	});
}

export type Filters = { q?: string; category?: string; platform?: string; format?: string; aspect?: string; access?: string; sort?: string };

export function useFuse(skills: SkillMeta[] | undefined) {
	return useMemo(() => new Fuse(skills || [], { keys: [{ name: "name", weight: 3 }, { name: "summary", weight: 1.5 }, { name: "tags", weight: 1.5 }, { name: "category", weight: 1 }, { name: "platform", weight: 1 }, { name: "scenes", weight: 0.7 }], threshold: 0.34, ignoreLocation: true, minMatchCharLength: 2 }), [skills]);
}

export function filterSkills(skills: SkillMeta[], fuse: Fuse<SkillMeta>, f: Filters) {
	let list = f.q?.trim() ? fuse.search(f.q.trim()).map((r) => r.item) : [...skills];
	if (f.category) list = list.filter((s) => s.category === f.category);
	if (f.platform) list = list.filter((s) => s.platform === f.platform);
	if (f.format) list = list.filter((s) => s.format === f.format);
	if (f.aspect) list = list.filter((s) => s.aspect === f.aspect);
	if (f.access) list = list.filter((s) => s.tier === f.access);
	if (!f.q?.trim()) {
		if (f.sort === "az") list.sort((a, b) => a.name.localeCompare(b.name));
		else if (f.sort === "short") list.sort((a, b) => (a.duration ?? 999) - (b.duration ?? 999));
		else list.sort((a, b) => Number(b.tier === "free") - Number(a.tier === "free") || Number(b.featured) - Number(a.featured) || a.order - b.order);
	}
	return list;
}
