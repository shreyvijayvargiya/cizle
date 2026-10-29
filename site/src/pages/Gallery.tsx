import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { Cancel01Icon, Globe02Icon, Layers01Icon, Search01Icon, ShuffleIcon, SortByDown01Icon, Video01Icon } from "@hugeicons/core-free-icons";
import { CategoryChips, categoryLabel } from "@/components/CategoryChips";
import { Icon } from "@/components/Icon";
import { PromptCard } from "@/components/PromptCard";
import { PromptDialog } from "@/components/PromptDialog";
import { Button } from "@/components/ui/button";
import { VideoToggle } from "@/components/VideoToggle";
import { Input } from "@/components/ui/input";
import { LanguageSelect } from "@/components/LanguageSelect";
import { Skeleton } from "@/components/ui/misc";
import { OptionSelect } from "@/components/ui/select";
import { useAuth } from "@/lib/auth";
import { fromLabel } from "@/lib/billing";
import { CLASSIC, canonCategory, filterGallery, findPrompt, shuffled, useGallery, useGalleryFuse, useShuffle, type GalleryFilters, type GalleryItem } from "@/lib/gallery";
import { GUEST_LIMIT, useGate } from "@/lib/gate";
import { ACCESS_ICON, SORT_ICON, categoryIcon } from "@/lib/filterIcons";
import { PREMIUM } from "@/lib/config";
import { useHead } from "@/lib/head";
import { countBy, countryFlag } from "@/lib/facets";
import { isLatinLabel } from "@/lib/utils";

const PAGE = 48;
/** how many masonry columns fit: the same breakpoints the old grid used (1, 2, 3, 4) */
function useColumns() {
	const count = () => (typeof window === "undefined" ? 4 : window.innerWidth >= 1280 ? 4 : window.innerWidth >= 1024 ? 3 : window.innerWidth >= 640 ? 2 : 1);
	const [n, setN] = useState(count);
	useEffect(() => {
		const on = () => setN(count());
		window.addEventListener("resize", on);
		return () => window.removeEventListener("resize", on);
	}, []);
	return n;
}
type Collection = { family: string; name: string; total: number; pages: { route: string; name: string }[] };
/** Every programmatic page (use cases, styles, best-of lists, how-tos, glossary, templates and more), as plain links. The list is written at build time. */
function Collections() {
	const q = useQuery({ queryKey: ["collections"], queryFn: async (): Promise<Collection[]> => { const r = await fetch("/collections.json"); if (!r.ok) throw new Error("no collections"); return r.json(); }, staleTime: 30 * 60_000 });
	if (!q.data?.length) return null;
	return (
		<section aria-labelledby="col-h" className="mt-12">
			<h2 id="col-h" className="text-3xl tracking-[-0.03em]">Collections</h2>
			<p className="mt-2 max-w-[60ch] text-base text-muted-foreground">Every guide, style and use-case page in the library, each with its own address.</p>
			<div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
				{q.data.map((c) => (
					<div key={c.family}>
						<h3 className="mb-2 text-lg font-semibold"><a href={c.family === "creators" ? "/sources" : `/${c.family}`} className="hover:underline">{c.name}</a> <span className="text-muted-foreground">({c.total})</span></h3>
						<ul className="flex flex-wrap gap-1.5">
							{c.pages.map((x) => <li key={x.route}><a href={x.route} className="press inline-flex rounded-full bg-surface px-3 py-1.5 text-sm text-foreground hover:bg-tile-2">{x.name}</a></li>)}
						</ul>
					</div>
				))}
			</div>
		</section>
	);
}
const KEYS: (keyof GalleryFilters)[] = ["q", "category", "access", "sort", "lang", "country", "tool", "topic"];

/** one page per kind of prompt: the whole library, only the image prompts, or only the video prompts */
export type GalleryMode = "all" | "images" | "videos";
const PAGES = {
	all: { path: "/gallery", h1: "Prompt gallery", noun: "prompt", nouns: "prompts", blurb: "video prompts, image prompts and skills from creators around the world" },
	images: { path: "/images", h1: "Image prompts", noun: "image prompt", nouns: "image prompts", blurb: "image prompts from creators around the world, each with its picture" },
	videos: { path: "/videos", h1: "Video prompts", noun: "video prompt", nouns: "video prompts", blurb: "video prompts from creators around the world, each with its demo video" },
} as const;
export const isImagePrompt = (g: GalleryItem) => g.kind === "image-prompt" || Boolean(g.images?.length && !g.video);
const inMode = (g: GalleryItem, m: GalleryMode) => m === "all" || (m === "images" ? isImagePrompt(g) : !isImagePrompt(g) && (g.hasVideo || Boolean(g.video)));

/** Community prompts, each credited and linked to the original. A free sample in full; the rest open to subscribers. */
export function GalleryPage({ slug, mode = "all" }: { slug?: string; mode?: GalleryMode } = {}) {
	const page = PAGES[mode];
	const navigate = useNavigate();
	const search = useSearch({ strict: false }) as GalleryFilters;
	const { isPro } = useAuth();
	const gallery = useGallery();
	const items = useMemo(() => (mode === "all" ? gallery.data?.items : gallery.data?.items.filter((g) => inMode(g, mode))), [gallery.data, mode]);
	const fuse = useGalleryFuse(items);
	const [q, setQ] = useState(search.q || "");
	const [shown, setShown] = useState(PAGE);
	const { seed, reshuffle: reshuffleList } = useShuffle();
	const { locked, ready, openGate } = useGate();
	const cols = useColumns();
	// A visitor without an account sees a fixed random sample of video prompts; searching, filtering, shuffling, paging and opening one asks them to sign in.
	const reshuffle = () => (locked ? openGate("shuffle the gallery") : reshuffleList());

	const setFilter = (patch: Partial<GalleryFilters>) => {
		if (locked) return openGate("search and filter the gallery");
		const next = { ...search, ...patch };
		for (const k of [...KEYS, "p" as const]) if (!next[k]) delete next[k];
		setShown(PAGE);
		navigate({ to: page.path as "/gallery", search: next, replace: true, resetScroll: false });
	};
	useEffect(() => {
		if (locked || (search.q || "") === q.trim()) return;
		const t = setTimeout(() => setFilter({ q: q.trim() || undefined }), 220);
		return () => clearTimeout(t);
	});
	useEffect(() => setQ(search.q || ""), [search.q]);

	const list = useMemo(() => {
		if (!items) return [];
		if (locked) return shuffled(items.filter((g) => (mode === "images" ? g.poster || g.images?.length : g.hasVideo && g.video)), seed).slice(0, GUEST_LIMIT);
		return filterGallery(items, fuse, search, seed);
	}, [items, fuse, search, seed, locked]);
	const active = !locked && KEYS.some((k) => k !== "sort" && search[k]);
	const total = items?.length ?? 0;
	const languages = useMemo(() => { if (mode === "all") return gallery.data?.languages ?? {}; const m: Record<string, number> = {}; for (const g of items || []) m[g.lang || "en"] = (m[g.lang || "en"] || 0) + 1; return m; }, [items, mode, gallery.data?.languages]);
	const open = slug && !locked ? findPrompt(items, slug) : undefined;
	// the sign-in wall opens with the page, once (also when a guest lands on a prompt's own address)
	const asked = useRef(false);
	useEffect(() => {
		if (!locked || !ready || asked.current) return;
		asked.current = true;
		openGate(slug ? "open this prompt" : "see every prompt");
	}, [locked, ready, slug]); // eslint-disable-line react-hooks/exhaustive-deps
	const legacy = search.p ? items?.find((g) => g.id === search.p) : undefined;
	useEffect(() => {
		// old ?p=<id> links move to the readable address
		if (legacy) navigate({ to: "/prompts/$slug", params: { slug: legacy.slug }, search: { ...search, p: undefined } as never, replace: true, resetScroll: false });
	}, [legacy]); // eslint-disable-line react-hooks/exhaustive-deps

	useHead({
		enabled: !open && !legacy,
		title: `${page.h1}: ${page.nouns} with the video, the creator and the original link | cizle`,
		description: "Browse real video prompts people made with Claude Opus 5.5: motion graphics, explainers, product videos and 3D. Each one credits its creator and links to the original post. Read a free sample, unlock the rest with Premium.",
		path: page.path,
	});

	// only English (Latin-script) categories are listed for now; prompts in other languages stay visible, they just do not add their own category labels
	const allCategories = useMemo(() => [...new Set((mode === "all" ? gallery.data?.categories || [] : (items || []).map((g) => g.category || "")).map(canonCategory))].filter((c) => c && isLatinLabel(c)), [gallery.data?.categories, items, mode]);
	const categories = allCategories;
	const countryCounts = useMemo(() => countBy(items || [], (g) => g.country), [items]);
	const toolCounts = useMemo(() => countBy(items || [], (g) => g.tools), [items]);
	const topicCounts = useMemo(() => countBy(items || [], (g) => g.topic), [items]);
	const counts = useMemo(() => {
		const m: Record<string, number> = {};
		for (const g of items || []) if (g.category) m[canonCategory(g.category)] = (m[canonCategory(g.category)] || 0) + 1;
		return m;
	}, [items]);

	return (
		<div className="board pt-6 pb-4">
			<div className="board-w">
				<div className="reveal flex flex-wrap items-end justify-between gap-x-10 gap-y-5">
					<h1 className="display" style={{ fontSize: "clamp(2.75rem, 8vw, 7.5rem)" }}>
						{page.h1}
					</h1>
					<p className="max-w-[46ch] pb-2 text-lg leading-snug">
						Every one of these made something you can watch. Open a card to read the prompt, copy it, and find the person who wrote it. {PREMIUM ? "Free samples read in full; Premium opens the rest." : "All free to read and copy."}
					</p>
				</div>

				<div className="mt-8">
					<form role="search" aria-label="Filter prompts" className="flex flex-wrap items-center gap-2 rounded-lg bg-surface p-2" onSubmit={(e) => e.preventDefault()}>
						<div className="relative w-full sm:w-80">
							<Icon icon={Search01Icon} size={17} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted-foreground" />
							<Input type="search" value={q} onChange={(e) => (locked ? openGate("search the gallery") : setQ(e.target.value))} placeholder="Search prompts" className="pl-10" aria-label="Search prompts" />
						</div>
						<LanguageSelect value={search.lang || ""} onChange={(v) => setFilter({ lang: v })} counts={languages} className="w-[12.5rem]" />
						<OptionSelect icon={Globe02Icon} aria-label="Country" value={search.country || ""} onValueChange={(v) => setFilter({ country: v })} emptyLabel="All countries" emptyIcon={Globe02Icon} options={countryCounts.map(([c, n]) => ({ value: c, label: `${countryFlag(c)} ${c}` }))} className="w-[13rem]" />
						<OptionSelect icon={Layers01Icon} aria-label="Tool" value={search.tool || ""} onValueChange={(v) => setFilter({ tool: v })} emptyLabel="All tools" emptyIcon={Layers01Icon} options={toolCounts.map(([c, n]) => ({ value: c, label: c }))} className="w-[12.5rem]" />
						<OptionSelect icon={Layers01Icon} aria-label="Topic" value={search.topic || ""} onValueChange={(v) => setFilter({ topic: v })} emptyLabel="All topics" emptyIcon={Layers01Icon} options={topicCounts.map(([c, n]) => ({ value: c, label: c }))} className="w-[13rem]" />
						<OptionSelect icon={Layers01Icon} aria-label="Category" value={search.category || ""} onValueChange={(v) => setFilter({ category: v })} emptyLabel="All categories" options={categories.map((c) => ({ value: c, label: categoryLabel(c), icon: categoryIcon(c) }))} className="w-[12.5rem]" />
						{PREMIUM ? <OptionSelect icon={Layers01Icon} aria-label="Access" value={search.access || ""} onValueChange={(v) => setFilter({ access: v })} emptyLabel="Any access" options={[{ value: "free", label: "Free samples", icon: ACCESS_ICON.free }, { value: "premium", label: "Premium", icon: ACCESS_ICON.premium }]} className="w-[12rem]" /> : null}
						<OptionSelect icon={SortByDown01Icon} aria-label="Sort" value={search.sort || ""} onValueChange={(v) => setFilter({ sort: v })} emptyLabel="Random" emptyIcon={SORT_ICON.random} options={[{ value: "new", label: "Newest", icon: SORT_ICON.new }, { value: "az", label: "A to Z", icon: SORT_ICON.az }, { value: "long", label: "Longest first", icon: SORT_ICON.long }]} className="w-[12rem]" />
						{active ? (
							<Button type="button" variant="secondary" onClick={() => (setQ(""), setShown(PAGE), navigate({ to: page.path as "/gallery", search: {}, replace: true }))}>
								<Icon icon={Cancel01Icon} size={15} /> Clear
							</Button>
						) : null}
						<Button type="button" variant="secondary" onClick={() => (reshuffle(), setShown(PAGE))} aria-label="Shuffle the order">
							<Icon icon={ShuffleIcon} size={15} /> Shuffle
						</Button>
						<VideoToggle />
					</form>
				</div>
				{gallery.data ? <CategoryChips categories={[...allCategories].sort((a, b) => (counts[b] ?? 0) - (counts[a] ?? 0)).slice(0, 24)} counts={counts} value={search.category || ""} onChange={(c) => setFilter({ category: c || undefined })} total={total} /> : null}

				<p className="px-1 py-3 text-lg" aria-live="polite">
					{gallery.isLoading ? "Loading prompts…" : locked ? "A small sample. " : active && !list.length ? "" : ""}
					{locked && gallery.data ? <button type="button" onClick={() => openGate("see every prompt")} className="underline decoration-field-1 decoration-2 underline-offset-4">Sign in free to browse them all.</button> : null}
					{PREMIUM && !isPro && gallery.data ? <Link to="/pricing" className="underline decoration-field-1 decoration-2 underline-offset-4">Unlock the full text of every prompt from {fromLabel("USD")} a month.</Link> : PREMIUM && isPro ? "Premium is unlocked." : null}
				</p>

				{gallery.isLoading ? (
					<div className="grid grid-cols-[minmax(0,1fr)] gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
						{Array.from({ length: 8 }).map((_, i) => (
							<Skeleton key={i} className="h-80" />
						))}
					</div>
				) : gallery.isError ? (
					<div className="tile p-8 text-center">
						<p className="statement">The gallery is not published yet.</p>
						<p className="mt-2 text-muted-foreground">Check your connection and try again.</p>
						<Button className="mt-4" onClick={() => gallery.refetch()}>
							Try again
						</Button>
					</div>
				) : list.length ? (
					<>
						{/* masonry: each card keeps the shape of its own video, so vertical phone videos stand tall and wide ones lie flat. Cards go to columns in turn, so "show more" adds to the bottom without moving what is already there. */}
						<div className="flex items-start gap-2">
							{Array.from({ length: cols }, (_, c) => (
								<ul key={c} className="flex min-w-0 flex-1 flex-col gap-2">
									{list.slice(0, shown).map((g, k) => (k % cols === c ? (
										<li key={g.id} className="reveal" style={{ ["--i" as string]: Math.floor(k / cols) % 4 }}>
											<PromptCard natural item={g} search={mode === "all" ? search : { ...search, from: mode }} />
										</li>
									) : null))}
								</ul>
							))}
						</div>
						{locked ? (
							<button type="button" onClick={() => openGate("see every prompt")} className="press tile mt-2 flex h-16 w-full items-center justify-center gap-2 text-lg font-medium hover:bg-tile-2">
								Sign in free to see every prompt
							</button>
						) : shown < list.length ? (
							<button type="button" onClick={() => setShown((n) => n + PAGE)} className="press tile mt-2 flex h-16 w-full items-center justify-center gap-2 text-lg font-medium hover:bg-tile-2">
								Show more
							</button>
						) : null}
					</>
				) : (
					<div className="tile p-10 text-center">
						<p className="statement">No prompts match those filters.</p>
						<Button className="mt-4" variant="secondary" onClick={() => (setQ(""), navigate({ to: page.path as "/gallery", search: {}, replace: true }))}>
							Clear filters
						</Button>
					</div>
				)}

				{mode === "all" ? <Collections /> : null}

				<p className="mx-auto mt-10 max-w-[60ch] px-1 text-center text-base">Prompts belong to the people who wrote them. We link to every original and remove a prompt on request. Email us from the contact page.</p>
			</div>

			{open ? <PromptDialog item={open} search={search} list={list} /> : null}
		</div>
	);
}
