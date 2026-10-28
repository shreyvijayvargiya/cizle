import { useQuery } from "@tanstack/react-query";
import Fuse from "fuse.js";
import { useMemo } from "react";
import { DEV_UNLOCK, PREMIUM } from "./config";
import { firebaseConfigured, loadFirebase } from "./firebase";
import { facetsOf } from "./facets";
import { CLASSIC, fetchVersions } from "./gallery";

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
	/** language code of the skill ("en" for the classic skills), the harvest version it came from ("classic" for the first 25), where it was scraped from and when */
	lang?: string;
	version?: string;
	country?: string;
	tools?: string[];
	topic?: string;
	folder?: string;
	fetchedAt?: string | null;
	/** no open licence: only a preview is published, the full skill stays at the source */
	restricted?: boolean;
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
/** The classic skills (/skills.json) plus the skills of every harvest version (/versions/<v>/skills.json), joined in memory only. */
export const useSkills = () =>
	useQuery({
		queryKey: ["skills"],
		queryFn: async (): Promise<SkillsIndex> => {
			const [base, versions] = await Promise.all([getJson<SkillsIndex>("/skills.json"), fetchVersions()]);
			const extra = await Promise.all(versions.map((v) => getJson<{ skills: SkillMeta[]; categories: string[] }>(v.skills).catch(() => ({ skills: [], categories: [] }))));
			const skills = [...base.skills.map((s) => ({ ...s, lang: s.lang || "en", version: s.version || CLASSIC })), ...extra.flatMap((e) => e.skills)].map((s) => ({ ...s, ...facetsOf(s.lang, s.tags, s.name, s.summary, s.category, s.source) }));
			const add = (list: string[], more: string[]) => [...new Set([...list, ...more])];
			return { ...base, skills, categories: add(base.categories, extra.flatMap((e) => e.categories)), formats: add(base.formats, extra.length ? ["Skill"] : []), aspects: add(base.aspects, extra.some((e) => e.skills.length) ? ["Other"] : []) };
		},
		// until Premium is on sale only free skills are listed
		select: (d: SkillsIndex): SkillsIndex => {
			if (PREMIUM) return d;
			const skills = d.skills.filter((s) => s.tier === "free");
			const has = new Set(skills.map((s) => s.category));
			const platforms = new Set(skills.map((s) => s.platform));
			return { ...d, skills, categories: d.categories.filter((c) => has.has(c)), platforms: d.platforms.filter((p) => platforms.has(p)) };
		},
		...STATIC,
	});
export const skillQuery = (slug: string) => ({ queryKey: ["skill", slug], queryFn: () => getJson<SkillDetail>(`/skills/${slug}.json`), ...STATIC });
export const useSkill = (slug?: string) => useQuery({ ...skillQuery(slug || ""), enabled: Boolean(slug) });
export const usePosts = () => useQuery({ queryKey: ["posts"], queryFn: () => getJson<Post[]>("/blog.json"), ...STATIC });
export const usePost = (slug: string) => useQuery({ queryKey: ["post", slug], queryFn: () => getJson<Post>(`/blog/${slug}.json`), ...STATIC });
export const usePage = (name: "docs" | "terms" | "privacy" | "refund" | "rights") => useQuery({ queryKey: ["page", name], queryFn: () => getJson<Page>(`/content/${name}.json`), ...STATIC });
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

export type Filters = { q?: string; category?: string; platform?: string; format?: string; aspect?: string; access?: string; sort?: string; kind?: string; p?: string; lang?: string; version?: string; country?: string; tool?: string; topic?: string };

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
	if (f.lang) list = list.filter((s) => (s.lang || "en") === f.lang);
	if (f.version) list = list.filter((s) => (s.version || CLASSIC) === f.version);
	if (f.country) list = list.filter((s) => s.country === f.country);
	if (f.tool) list = list.filter((s) => s.tools?.includes(f.tool!));
	if (f.topic) list = list.filter((s) => s.topic === f.topic);
	if (!f.q?.trim()) {
		if (f.sort === "az") list.sort((a, b) => a.name.localeCompare(b.name));
		else if (f.sort === "short") list.sort((a, b) => (a.duration ?? 999) - (b.duration ?? 999));
		else list.sort((a, b) => Number(b.tier === "free") - Number(a.tier === "free") || Number(b.featured) - Number(a.featured) || a.order - b.order);
	}
	return list;
}
