import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { Cancel01Icon, Globe02Icon, Layers01Icon, Search01Icon, ShuffleIcon, Video01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/Icon";
import { SkillCard } from "@/components/SkillCard";
import { SkillDialog } from "@/components/SkillDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OptionSelect } from "@/components/ui/select";
import { LanguageSelect } from "@/components/LanguageSelect";
import { Skeleton } from "@/components/ui/misc";
import { Hero } from "@/components/Hero";
import { VideoToggle } from "@/components/VideoToggle";
import { PromptCard } from "@/components/PromptCard";
import { CLASSIC, filterGallery, shuffled, useGallery, useGalleryFuse, useShuffle, type GalleryItem } from "@/lib/gallery";
import { ACCESS_ICON, ASPECT_ICON, FORMAT_ICON, KIND_ICON, SORT_ICON, categoryIcon, platformIcon } from "@/lib/filterIcons";
import { useAuth } from "@/lib/auth";
import { fromLabel } from "@/lib/billing";
import { PREMIUM, SITE } from "@/lib/config";
import { filterSkills, useFuse, useSkills, type Filters, type SkillMeta } from "@/lib/data";
import { useHead } from "@/lib/head";
import { isLatinLabel } from "@/lib/utils";
import { orgJsonLd, siteJsonLd } from "@/lib/seo";

const KEYS: (keyof Filters)[] = ["q", "category", "platform", "format", "aspect", "access", "sort", "kind", "lang", "version"];
const PAGE = 48;
type Entry = { type: "skill"; skill: SkillMeta } | { type: "prompt"; prompt: GalleryItem };

/** Skills and community prompts in one list. Demo videos come first: four prompts (every one has its video), then one skill, and skills with a video of their own lead the skills. */
function interleave(skills: SkillMeta[], prompts: GalleryItem[]): Entry[] {
	const out: Entry[] = [];
	let i = 0;
	let j = 0;
	const withVideo = [...skills].sort((a, b) => Number(Boolean(b.video)) - Number(Boolean(a.video)));
	const ordered = [...prompts].sort((a, b) => Number(Boolean(b.video)) - Number(Boolean(a.video)));
	while (i < withVideo.length || j < ordered.length) {
		for (let k = 0; k < 4 && j < ordered.length; k++) out.push({ type: "prompt", prompt: ordered[j++] });
		if (i < withVideo.length) out.push({ type: "skill", skill: withVideo[i++] });
	}
	return out;
}

/** The home page IS the library: skills and community prompts on one page, filters on top, one item opens as a modal over it. */
export function ExplorerPage({ slug }: { slug?: string }) {
	const navigate = useNavigate();
	const search = useSearch({ strict: false }) as Filters;
	const { isPro, user } = useAuth();
	const skills = useSkills();
	const gallery = useGallery();
	const fuse = useFuse(skills.data?.skills);
	const gfuse = useGalleryFuse(gallery.data?.items);
	const [shown, setShown] = useState(PAGE);
	const [q, setQ] = useState(search.q || "");
	const { seed, reshuffle } = useShuffle();

	const setFilter = (patch: Partial<Filters>) => {
		const next = { ...search, ...patch };
		for (const k of [...KEYS, "p" as const]) if (!next[k]) delete next[k];
		setShown(PAGE);
		navigate(slug ? { to: "/skills/$slug", params: { slug }, search: next, replace: true, resetScroll: false } : { to: "/", search: next, replace: true, resetScroll: false });
	};
	// Typing is debounced into the URL so a filtered view can be shared.
	useEffect(() => {
		if ((search.q || "") === q.trim()) return;
		const t = setTimeout(() => setFilter({ q: q.trim() || undefined }), 220);
		return () => clearTimeout(t);
	});
	useEffect(() => setQ(search.q || ""), [search.q]);

	// Filters that only mean something for a skill (platform, format, ratio) leave the community prompts out.
	const skillOnly = Boolean(search.platform || search.format || search.aspect);
	const skillList = useMemo(() => {
		if (!skills.data || search.kind === "prompts") return [];
		const l = filterSkills(skills.data.skills, fuse, search);
		return !search.sort && !search.q ? shuffled(l.map((s) => ({ ...s, id: s.slug })), seed) : l;
	}, [skills.data, fuse, search, seed]);
	const promptList = useMemo(
		() => (gallery.data && search.kind !== "skills" && !skillOnly ? filterGallery(gallery.data.items, gfuse, { q: search.q, category: search.category, access: search.access, lang: search.lang, version: search.version, sort: search.sort === "az" || search.sort === "new" ? search.sort : undefined }, seed) : []),
		[gallery.data, gfuse, search, skillOnly, seed],
	);
	const mixed = useMemo(() => interleave(skillList, promptList), [skillList, promptList]);
	// languages offered in the dropdown: everything in the library (skills and prompts), not only what the other filters leave
	const langCounts = useMemo(() => {
		const m: Record<string, number> = {};
		for (const s of skills.data?.skills ?? []) m[s.lang || "en"] = (m[s.lang || "en"] || 0) + 1;
		for (const g of gallery.data?.items ?? []) m[g.lang || "en"] = (m[g.lang || "en"] || 0) + 1;
		return m;
	}, [skills.data, gallery.data]);
	const list = skillList;
	const active = KEYS.some((k) => k !== "sort" && search[k]);
	const total = skills.data?.skills.length ?? 0;
	const promptTotal = gallery.data?.total ?? 0;
	const freeCount = skills.data?.skills.filter((s) => s.tier === "free").length ?? SITE.freeCount;
	const lockedPrompts = promptTotal - (gallery.data?.free ?? 0);
	const openPrompt = search.p ? gallery.data?.items.find((g) => g.id === search.p) : undefined;
	useEffect(() => {
		if (openPrompt) navigate({ to: "/prompts/$slug", params: { slug: openPrompt.slug }, search: {}, replace: true, resetScroll: false });
	}, [openPrompt]); // eslint-disable-line react-hooks/exhaustive-deps
	const categories = useMemo(() => [...new Set([...(skills.data?.categories ?? []), ...(gallery.data?.categories ?? []).filter(isLatinLabel).slice(0, 24)])].filter(isLatinLabel), [skills.data, gallery.data]);

	useHead({
		enabled: !slug && !openPrompt,
		title: "cizle: video prompts, image prompts and Claude Code skills, in many languages",
		description: SITE.description,
		path: "/",
		jsonLd: [orgJsonLd(), siteJsonLd()],
	});

	const options = (items: string[] = [], label: (s: string) => string = (s) => s) => items.map((v) => ({ value: v, label: label(v) }));

	return (
		<div>
			{!slug && !openPrompt ? <Hero skillCount={total} /> : null}

			<section id="library" aria-labelledby="lib-h" className="board scroll-mt-16 pt-20 pb-4 sm:pt-28">
				<div className="board-w">
					<div className="reveal flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
						<h2 id="lib-h" className="text-5xl tracking-[-0.045em]">
							Skills and prompts
						</h2>
						<p className="max-w-[44ch] text-lg leading-snug" aria-live="polite">
							{skills.isLoading ? "Loading…" : `${skillList.length} skills and ${promptList.length.toLocaleString()} prompts${active ? ` match, of ${total} and ${promptTotal.toLocaleString()}` : ""}.`}{" "}
							{PREMIUM ? (!isPro ? <Link to="/pricing" className="underline decoration-field-1 decoration-2 underline-offset-4">Unlock {lockedPrompts > 0 ? lockedPrompts.toLocaleString() : "all"} full prompts and {total - freeCount || 36} premium skills.</Link> : <span>Premium is unlocked.</span>) : <span>All free. <a href="#subscribe" className="underline decoration-field-1 decoration-2 underline-offset-4">Subscribe</a> for new ones.</span>}
						</p>
					</div>

					<div className="mt-8">
						<form role="search" aria-label="Filter skills and prompts" className="flex flex-wrap items-center gap-2 rounded-lg bg-surface p-2" onSubmit={(e) => e.preventDefault()}>
							<div className="relative w-full sm:w-80">
								<Icon icon={Search01Icon} size={17} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted-foreground" />
								<Input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${(total + promptTotal).toLocaleString()} skills and prompts`} className="pl-10" aria-label="Search skills and prompts" />
							</div>
							<OptionSelect aria-label="Show" value={search.kind || ""} onValueChange={(v) => setFilter({ kind: v })} emptyLabel="Skills and prompts" emptyIcon={KIND_ICON[""]} options={[{ value: "skills", label: "Skills only", icon: KIND_ICON.skills }, { value: "prompts", label: "Community prompts", icon: KIND_ICON.prompts }]} className="w-[13.5rem]" />
							<LanguageSelect value={search.lang || ""} onChange={(v) => setFilter({ lang: v })} counts={langCounts} className="w-[12.5rem]" />
							{gallery.data?.versions.length ? (
								<OptionSelect aria-label="Collection" value={search.version || ""} onValueChange={(v) => setFilter({ version: v })} emptyLabel="All collections" emptyIcon={Layers01Icon} options={[{ value: CLASSIC, label: "Classic (v1 to v3)", icon: Video01Icon }, ...gallery.data.versions.map((v) => ({ value: v.version, label: `${v.version} · ${Object.keys(v.languages).length} languages`, icon: Globe02Icon }))]} className="w-[13rem]" />
							) : null}
							<OptionSelect aria-label="Category" value={search.category || ""} onValueChange={(v) => setFilter({ category: v })} emptyLabel="All categories" emptyIcon={Layers01Icon} options={categories.map((c) => ({ value: c, label: c, icon: categoryIcon(c) }))} className="w-[12rem]" />
							<OptionSelect aria-label="Platform" value={search.platform || ""} onValueChange={(v) => setFilter({ platform: v })} emptyLabel="Any platform" emptyIcon={platformIcon("Any")} options={(skills.data?.platforms.filter((p) => p !== "Any") ?? []).map((p) => ({ value: p, label: p, icon: platformIcon(p) }))} className="w-[11rem]" />
							<OptionSelect aria-label="Format" value={search.format || ""} onValueChange={(v) => setFilter({ format: v })} emptyLabel="Any format" emptyIcon={Layers01Icon} options={(skills.data?.formats ?? []).map((f) => ({ value: f, label: f, icon: FORMAT_ICON[f] }))} className="w-[11rem]" />
							<OptionSelect aria-label="Aspect ratio" value={search.aspect || ""} onValueChange={(v) => setFilter({ aspect: v })} emptyLabel="Any ratio" emptyIcon={ASPECT_ICON.Other} options={(skills.data?.aspects ?? []).map((a) => ({ value: a, label: a, icon: ASPECT_ICON[a] }))} className="w-[10rem]" />
							{PREMIUM ? <OptionSelect aria-label="Access" value={search.access || ""} onValueChange={(v) => setFilter({ access: v })} emptyLabel="Any access" emptyIcon={Layers01Icon} options={[{ value: "free", label: "Free", icon: ACCESS_ICON.free }, { value: "premium", label: "Premium", icon: ACCESS_ICON.premium }]} className="w-[10.5rem]" /> : null}
							<OptionSelect aria-label="Sort" value={search.sort || ""} onValueChange={(v) => setFilter({ sort: v })} emptyLabel="Random" emptyIcon={SORT_ICON.random} options={[{ value: "new", label: "Newest", icon: SORT_ICON.new }, { value: "az", label: "A to Z", icon: SORT_ICON.az }, { value: "short", label: "Shortest first", icon: SORT_ICON.short }]} className="w-[12rem]" />
							{active ? (
								<Button type="button" variant="secondary" onClick={() => (setQ(""), navigate(slug ? { to: "/skills/$slug", params: { slug }, search: {}, replace: true } : { to: "/", search: {}, replace: true }))}>
									<Icon icon={Cancel01Icon} size={15} /> Clear
								</Button>
							) : null}
							<Button type="button" variant="secondary" onClick={() => (reshuffle(), setShown(PAGE))} aria-label="Shuffle the order">
								<Icon icon={ShuffleIcon} size={15} /> Shuffle
							</Button>
							<VideoToggle />
						</form>
					</div>

					{skills.isLoading ? (
						<div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
							{Array.from({ length: 8 }).map((_, i) => (
								<Skeleton key={i} className="h-80" />
							))}
						</div>
					) : skills.isError ? (
						<div className="tile mt-2 p-8 text-center">
							<p className="statement">We could not load the skills.</p>
							<p className="mt-2 text-muted-foreground">Check your connection and try again.</p>
							<Button className="mt-4" onClick={() => skills.refetch()}>
								Try again
							</Button>
						</div>
					) : mixed.length ? (
						<>
							<ul className="mt-2 grid grid-cols-[minmax(0,1fr)] gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
								{mixed.slice(0, shown).map((e, k) =>
									e.type === "skill" ? (
										<li key={`s-${e.skill.slug}`} className="reveal" style={{ ["--i" as string]: k % 4 }}>
											<SkillCard skill={e.skill} search={search} />
										</li>
									) : (
										<li key={`p-${e.prompt.id}`} className="reveal" style={{ ["--i" as string]: k % 4 }}>
											<PromptCard item={e.prompt} search={search} base="/" />
										</li>
									),
								)}
							</ul>
							{shown < mixed.length ? (
								<div className="mt-2">
									<button type="button" onClick={() => setShown((n) => n + PAGE)} className="press tile flex h-16 w-full items-center justify-center gap-2 text-lg font-medium hover:bg-tile-2">
										Show {Math.min(PAGE, mixed.length - shown)} more <span className="text-muted-foreground">· {(mixed.length - shown).toLocaleString()} left</span>
									</button>
								</div>
							) : null}
						</>
					) : (
						<div className="tile mt-2 p-10 text-center">
							<p className="statement">Nothing matches those filters.</p>
							<p className="mt-2 text-muted-foreground">Try a different word, or clear the filters.</p>
							<Button className="mt-4" variant="secondary" onClick={() => (setQ(""), navigate({ to: "/", search: {}, replace: true }))}>
								Clear filters
							</Button>
						</div>
					)}

					{PREMIUM && !user && skills.data && !slug ? (
						<section aria-labelledby="cta-h" className="mt-2 grid gap-2 md:grid-cols-12">
							<div className="tile-accent reveal p-6 sm:p-8 md:col-span-8">
								<h2 id="cta-h" className="text-5xl">
									Need ads, engineering formats or film styles?
								</h2>
								<p className="mt-3 max-w-[52ch] text-lg">Premium unlocks every ad format for Meta, TikTok and Google, 20 film styles and the full text of every community prompt, from {fromLabel("USD")} a month. Cancel any time.</p>
								<Link to="/pricing" className="press mt-6 inline-flex h-12 items-center rounded-lg bg-field-2 px-6 text-base font-medium text-field-2-ink hover:opacity-90">
									See Premium
								</Link>
							</div>
							<div className="tile-tan reveal hidden p-6 md:col-span-4 md:flex md:flex-col md:justify-end" style={{ ["--i" as string]: 1 }}>
								<p className="display" style={{ fontSize: "clamp(3rem,7vw,7rem)" }}>
									{fromLabel("USD")}
								</p>
								<p className="mt-2 text-lg">a month on the yearly plan, cancel any time</p>
							</div>
						</section>
					) : null}
				</div>
			</section>

			{!PREMIUM && !user && skills.data && !slug ? (
				<section aria-labelledby="cta-h" className="board pt-2 pb-4">
					<div className="board-w tile-accent reveal flex flex-col items-start gap-5 p-6 sm:p-8">
						<h2 id="cta-h" className="text-5xl">
							New prompts and skills, free in your inbox.
						</h2>
						<p className="max-w-[52ch] text-lg">Everything here is free. Sign in and subscribe and we send each new prompt and skill the day it lands.</p>
						<div className="flex flex-wrap gap-2">
							<a href="#subscribe" className="press inline-flex h-12 items-center rounded-lg bg-field-2 px-6 text-base font-medium text-field-2-ink hover:opacity-90">Subscribe</a>
							<Link to="/login" search={{}} className="press inline-flex h-12 items-center rounded-lg bg-tile-2 px-6 text-base text-foreground hover:bg-muted">Sign in</Link>
						</div>
					</div>
				</section>
			) : null}

			{slug && skills.data ? <SkillDialog slug={slug} list={list.some((s) => s.slug === slug) ? list : skills.data.skills} search={search} /> : null}
		</div>
	);
}
