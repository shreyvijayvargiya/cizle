import { countBy, countryFlag } from "@/lib/facets";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { Cancel01Icon, FilterHorizontalIcon, Globe02Icon, Layers01Icon, Search01Icon, ShuffleIcon, SidebarLeftIcon, Video01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/Icon";
import { SkillCard } from "@/components/SkillCard";
import { SkillDialog } from "@/components/SkillDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FilterPanel, FilterRail, type Facet } from "@/components/FilterSidebar";
import { BrowseBy } from "@/components/BrowseBy";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { languageOf } from "@/lib/languages";
import { Skeleton } from "@/components/ui/misc";
import { Hero } from "@/components/Hero";
import { VideoToggle } from "@/components/VideoToggle";
import { PromptCard } from "@/components/PromptCard";
import { CLASSIC, filterGallery, shuffled, useGallery, useGalleryFuse, useShuffle, type GalleryItem } from "@/lib/gallery";
import { ACCESS_ICON, ASPECT_ICON, FORMAT_ICON, KIND_ICON, SORT_ICON, categoryIcon, platformIcon } from "@/lib/filterIcons";
import { useAuth } from "@/lib/auth";
import { fromLabel } from "@/lib/billing";
import { GUEST_LIMIT, useGate } from "@/lib/gate";
import { PREMIUM, SITE } from "@/lib/config";
import { filterSkills, useFuse, useSkills, type Filters, type SkillMeta } from "@/lib/data";
import { useHead } from "@/lib/head";
import { isLatinLabel } from "@/lib/utils";
import { orgJsonLd, siteJsonLd } from "@/lib/seo";

const KEYS: (keyof Filters)[] = ["q", "category", "platform", "format", "aspect", "access", "sort", "kind", "lang", "country", "tool", "topic"];
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
	const { seed, reshuffle: reshuffleList } = useShuffle();
	const { locked, openGate } = useGate();
	// A visitor without an account sees a random sample (GUEST_LIMIT video prompts and the skills between them); filtering, searching, shuffling and paging ask them to sign in.
	const reshuffle = () => (locked ? openGate("shuffle the library") : reshuffleList());

	const setFilter = (patch: Partial<Filters>) => {
		if (locked) return openGate("search and filter the library");
		const next = { ...search, ...patch };
		for (const k of [...KEYS, "p" as const]) if (!next[k]) delete next[k];
		setShown(PAGE);
		navigate(slug ? { to: "/skills/$slug", params: { slug }, search: next, replace: true, resetScroll: false } : { to: "/", search: next, replace: true, resetScroll: false });
	};
	// Typing is debounced into the URL so a filtered view can be shared.
	useEffect(() => {
		if (locked || (search.q || "") === q.trim()) return;
		const t = setTimeout(() => setFilter({ q: q.trim() || undefined }), 220);
		return () => clearTimeout(t);
	});
	useEffect(() => setQ(search.q || ""), [search.q]);

	// Filters that only mean something for a skill (platform, format, ratio) leave the community prompts out.
	const skillOnly = Boolean(search.platform || search.format || search.aspect);
	const skillList = useMemo(() => {
		if (!skills.data) return [];
		if (locked) return shuffled(skills.data.skills.map((s) => ({ ...s, id: s.slug })), seed).slice(0, Math.ceil(GUEST_LIMIT / 4));
		if (search.kind === "prompts") return [];
		const l = filterSkills(skills.data.skills, fuse, search);
		return !search.sort && !search.q ? shuffled(l.map((s) => ({ ...s, id: s.slug })), seed) : l;
	}, [skills.data, fuse, search, seed, locked]);
	const promptList = useMemo(
		() => (locked ? shuffled((gallery.data?.items ?? []).filter((g) => g.hasVideo && g.video), seed).slice(0, GUEST_LIMIT) : gallery.data && search.kind !== "skills" && !skillOnly ? filterGallery(gallery.data.items, gfuse, { q: search.q, category: search.category, access: search.access, lang: search.lang, country: search.country, tool: search.tool, topic: search.topic, sort: search.sort === "az" || search.sort === "new" ? search.sort : undefined }, seed) : []),
		[gallery.data, gfuse, search, skillOnly, seed, locked],
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
	const active = !locked && KEYS.some((k) => k !== "sort" && search[k]);
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
		title: SITE.title,
		description: SITE.description,
		path: "/",
		jsonLd: [orgJsonLd(), siteJsonLd()],
	});

	const [side, setSide] = useState(() => {
		try {
			return localStorage.getItem("cizle-filters") !== "0";
		} catch {
			return true;
		}
	});
	const toggleSide = (v: boolean) => {
		setSide(v);
		try {
			localStorage.setItem("cizle-filters", v ? "1" : "0");
		} catch {
			/* private mode */
		}
	};
	const [drawer, setDrawer] = useState(false);
	const catCounts = useMemo(() => {
		const m: Record<string, number> = {};
		for (const x of skills.data?.skills ?? []) { const c = x.category || ""; m[c] = (m[c] || 0) + 1; }
		for (const g of gallery.data?.items ?? []) { const c = g.category || ""; m[c] = (m[c] || 0) + 1; }
		return m;
	}, [skills.data, gallery.data]);
	const facets: Facet[] = useMemo(
		() => [
			{ key: "kind", label: "Show", icon: Layers01Icon, options: [{ value: "skills", label: "Skills only", icon: KIND_ICON.skills, count: skills.data?.skills.length }, { value: "prompts", label: "Community prompts", icon: KIND_ICON.prompts, count: gallery.data?.total }] },
			{ key: "lang", label: "Language", icon: Globe02Icon, limit: 6, options: Object.entries(langCounts).sort((a, b) => b[1] - a[1]).map(([code, n]) => ({ value: code, label: languageOf(code).native, flag: languageOf(code).flag, count: n })) },
			{ key: "country", label: "Country (by language)", icon: Globe02Icon, limit: 6, options: countBy(gallery.data?.items ?? [], (g) => g.country).map(([c, n]) => ({ value: c, label: c, flag: countryFlag(c), count: n })) },
			{ key: "tool", label: "Tool", icon: Layers01Icon, limit: 6, options: countBy([...(gallery.data?.items ?? []), ...(skills.data?.skills ?? [])], (g) => g.tools).map(([c, n]) => ({ value: c, label: c, count: n })) },
			{ key: "topic", label: "Topic", icon: Layers01Icon, limit: 6, options: countBy([...(gallery.data?.items ?? []), ...(skills.data?.skills ?? [])], (g) => g.topic).map(([c, n]) => ({ value: c, label: c, count: n })) },
			{ key: "category", label: "Category", icon: Layers01Icon, limit: 8, options: categories.map((c) => ({ value: c, label: c, icon: categoryIcon(c), count: catCounts[c] })) },
			{ key: "platform", label: "Platform", icon: platformIcon("Any"), open: false, options: (skills.data?.platforms.filter((p) => p !== "Any") ?? []).map((p) => ({ value: p, label: p, icon: platformIcon(p) })) },
			{ key: "format", label: "Format", icon: Layers01Icon, open: false, options: (skills.data?.formats ?? []).map((f) => ({ value: f, label: f, icon: FORMAT_ICON[f] })) },
			{ key: "aspect", label: "Aspect ratio", icon: ASPECT_ICON.Other, open: false, options: (skills.data?.aspects ?? []).map((a) => ({ value: a, label: a, icon: ASPECT_ICON[a] })) },
			...(PREMIUM ? [{ key: "access", label: "Access", icon: Layers01Icon, open: false, options: [{ value: "free", label: "Free", icon: ACCESS_ICON.free }, { value: "premium", label: "Premium", icon: ACCESS_ICON.premium }] }] : []),
			{ key: "sort", label: "Sort", icon: SORT_ICON.random, open: false, options: [{ value: "new", label: "Newest", icon: SORT_ICON.new }, { value: "az", label: "A to Z", icon: SORT_ICON.az }, { value: "short", label: "Shortest first", icon: SORT_ICON.short }] },
		],
		[skills.data, gallery.data, langCounts, categories, catCounts],
	);
	const selected = search as Record<string, string | undefined>;
	const pick = (key: string, value: string) => setFilter({ [key]: selected[key] === value ? undefined : value } as Partial<Filters>);
	const activeCount = facets.filter((f) => selected[f.key]).length;

	return (
		<div>
			{!slug && !openPrompt ? <Hero skillCount={total} /> : null}
			{!slug && !openPrompt && skills.data ? <BrowseBy formats={skills.data.formats} categories={categories} counts={catCounts} /> : null}

			<section id="library" aria-labelledby="lib-h" className="board scroll-mt-16 pt-20 pb-4 sm:pt-28">
				<div className="board-w">
					<div className="reveal flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
						<h2 id="lib-h" className="text-5xl tracking-[-0.045em]">
							Skills and prompts
						</h2>
						<p className="max-w-[44ch] text-lg leading-snug" aria-live="polite">
							{skills.isLoading ? "Loading…" : `${skillList.length} skills and ${promptList.length.toLocaleString()} prompts${active || locked ? ` ${locked ? "to start with, of" : "match, of"} ${total} and ${promptTotal.toLocaleString()}` : ""}.`}{" "}
							{locked && skills.data ? <button type="button" onClick={() => openGate("see the whole library")} className="underline decoration-field-1 decoration-2 underline-offset-4">Sign in free to see them all.</button> : null}{" "}
							{PREMIUM ? (!isPro ? <Link to="/pricing" className="underline decoration-field-1 decoration-2 underline-offset-4">Unlock {lockedPrompts > 0 ? lockedPrompts.toLocaleString() : "all"} full prompts and {total - freeCount || 36} premium skills.</Link> : <span>Premium is unlocked.</span>) : <span>All free. <Link to="/subscribe" className="underline decoration-field-1 decoration-2 underline-offset-4">Subscribe</Link> for new ones.</span>}
						</p>
					</div>

					<div className="mt-8 flex flex-wrap items-center gap-2 rounded-lg bg-surface p-2">
						<button type="button" onClick={() => toggleSide(!side)} aria-label={side ? "Hide filters" : "Show filters"} aria-pressed={side} className="press hidden h-10 items-center gap-2 rounded-md bg-background px-3.5 text-base font-medium outline-none hover:bg-tile-2 focus-visible:ring-2 focus-visible:ring-ring lg:flex">
						<Icon icon={SidebarLeftIcon} size={18} /> Filters{activeCount ? <span className="grid min-w-5 place-items-center rounded-full bg-field-1 px-1.5 text-xs text-field-1-ink">{activeCount}</span> : null}
						</button>
						<Sheet open={drawer} onOpenChange={setDrawer}>
							<SheetTrigger asChild>
								<button type="button" className="press flex h-10 items-center gap-2 rounded-md bg-background px-3.5 text-base font-medium outline-none hover:bg-tile-2 lg:hidden">
									<Icon icon={FilterHorizontalIcon} size={18} /> Filters{activeCount ? <span className="grid min-w-5 place-items-center rounded-full bg-field-1 px-1.5 text-xs text-field-1-ink">{activeCount}</span> : null}
								</button>
							</SheetTrigger>
							<SheetContent title="Filters" side="left" className="w-[min(22rem,92vw)] overflow-y-auto">
								<p className="px-1 pb-1 text-lg font-semibold">Filters</p>
								<FilterPanel facets={facets} selected={selected} onSelect={pick} />
							</SheetContent>
						</Sheet>
						<form role="search" aria-label="Search skills and prompts" className="relative min-w-[12rem] flex-1 sm:max-w-md" onSubmit={(e) => e.preventDefault()}>
							<Icon icon={Search01Icon} size={17} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted-foreground" />
							<Input type="search" value={q} onChange={(e) => (locked ? openGate("search the library") : setQ(e.target.value))} placeholder={`Search ${(total + promptTotal).toLocaleString()} skills and prompts`} className="pl-10" aria-label="Search skills and prompts" />
						</form>
						<div className="ml-auto flex flex-wrap items-center gap-2">
							{active ? (
								<Button type="button" variant="secondary" onClick={() => (setQ(""), navigate(slug ? { to: "/skills/$slug", params: { slug }, search: {}, replace: true } : { to: "/", search: {}, replace: true }))}>
									<Icon icon={Cancel01Icon} size={15} /> Clear
								</Button>
							) : null}
							<Button type="button" variant="secondary" onClick={() => (reshuffle(), setShown(PAGE))} aria-label="Shuffle the order">
								<Icon icon={ShuffleIcon} size={15} /> Shuffle
							</Button>
							<VideoToggle />
						</div>
					</div>

					<div className={`mt-2 lg:grid lg:items-start lg:gap-2 ${side ? "lg:grid-cols-[300px_minmax(0,1fr)]" : "lg:grid-cols-[60px_minmax(0,1fr)]"}`}>
						<aside aria-label="Filters" className="sticky top-[84px] hidden max-h-[calc(100dvh-100px)] overflow-y-auto rounded-lg bg-surface p-2 lg:block">
							{side ? <FilterPanel facets={facets} selected={selected} onSelect={pick} /> : <FilterRail facets={facets} selected={selected} onOpen={() => toggleSide(true)} />}
						</aside>
						<div className="min-w-0">
					{skills.isLoading ? (
						<div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
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
							<ul className="grid grid-cols-[minmax(0,1fr)] gap-2 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
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
							{locked ? (
								<div className="mt-2">
									<button type="button" onClick={() => openGate("see the whole library")} className="press tile flex h-16 w-full items-center justify-center gap-2 text-lg font-medium hover:bg-tile-2">
										Sign in free to see the other {Math.max(0, promptTotal - promptList.length).toLocaleString()} prompts
									</button>
								</div>
							) : shown < mixed.length ? (
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

						</div>
					</div>

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
							<Link to="/subscribe" className="press inline-flex h-12 items-center rounded-lg bg-field-2 px-6 text-base font-medium text-field-2-ink hover:opacity-90">Subscribe</Link>
							<Link to="/login" search={{}} className="press inline-flex h-12 items-center rounded-lg bg-tile-2 px-6 text-base text-foreground hover:bg-muted">Sign in</Link>
						</div>
					</div>
				</section>
			) : null}

			{slug && skills.data ? <SkillDialog slug={slug} list={list.some((s) => s.slug === slug) ? list : skills.data.skills} search={search} /> : null}
		</div>
	);
}
