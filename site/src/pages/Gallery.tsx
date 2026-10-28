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
import { COLLECTION_TABS, CLASSIC, canonCategory, filterGallery, findPrompt, shuffled, useGallery, useGalleryFuse, useShuffle, type GalleryFilters } from "@/lib/gallery";
import { GUEST_LIMIT, useGate } from "@/lib/gate";
import { ACCESS_ICON, SORT_ICON, categoryIcon } from "@/lib/filterIcons";
import { PREMIUM } from "@/lib/config";
import { useHead } from "@/lib/head";
import { countBy, countryFlag } from "@/lib/facets";
import { isLatinLabel } from "@/lib/utils";

const PAGE = 48;
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
const KEYS: (keyof GalleryFilters)[] = ["q", "category", "access", "sort", "lang", "country", "tool", "topic", "collection"];

/** Community video prompts, each credited and linked to the original. A free sample in full; the rest open to subscribers. */
export function GalleryPage({ slug, collection }: { slug?: string; collection?: string } = {}) {
	const navigate = useNavigate();
	const routeSearch = useSearch({ strict: false }) as GalleryFilters;
	// on /website-prompts, /app-prompts ... the kind is fixed by the address
	const preset = COLLECTION_TABS.find((c) => c.id === collection);
	const search: GalleryFilters = preset ? { ...routeSearch, collection: preset.id } : routeSearch;
	const listPath = (preset?.path ?? "/gallery") as "/gallery";
	const { isPro } = useAuth();
	const gallery = useGallery();
	const items = gallery.data?.items;
	const fuse = useGalleryFuse(items);
	const [q, setQ] = useState(search.q || "");
	const [shown, setShown] = useState(PAGE);
	const { seed, reshuffle: reshuffleList } = useShuffle();
	const { locked, ready, openGate } = useGate();
	// A visitor without an account sees a fixed random sample of video prompts; searching, filtering, shuffling, paging and opening one asks them to sign in.
	const reshuffle = () => (locked ? openGate("shuffle the gallery") : reshuffleList());

	const setFilter = (patch: Partial<GalleryFilters>) => {
		if (locked) return openGate("search and filter the gallery");
		const next = { ...search, ...patch };
		for (const k of [...KEYS, "p" as const]) if (!next[k]) delete next[k];
		if (preset) delete next.collection;
		setShown(PAGE);
		navigate({ to: listPath, search: next, replace: true, resetScroll: false });
	};
	useEffect(() => {
		if (locked || (search.q || "") === q.trim()) return;
		const t = setTimeout(() => setFilter({ q: q.trim() || undefined }), 220);
		return () => clearTimeout(t);
	});
	useEffect(() => setQ(search.q || ""), [search.q]);

	const list = useMemo(() => {
		if (!items) return [];
		if (locked) return shuffled(items.filter((g) => (!preset || g.collection === preset.id) && (g.hasVideo && g.video ? true : preset && g.poster)), seed).slice(0, GUEST_LIMIT);
		return filterGallery(items, fuse, search, seed);
	}, [items, fuse, search, seed, locked]);
	const active = !locked && KEYS.some((k) => k !== "sort" && !(preset && k === "collection") && search[k]);
	const allTotal = gallery.data?.total ?? 0;
	// on a kind page every count (search box, chips, "of N") is about that kind only
	const scoped = useMemo(() => (preset ? (items || []).filter((g) => g.collection === preset.id) : items), [items, preset?.id]);
	const total = preset ? (scoped?.length ?? 0) : allTotal;
	const kindTotal = total;
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
		title: preset ? `${preset.title} for AI agents: ${kindTotal.toLocaleString()} prompts with previews | cizle` : `Prompt gallery: ${total ? total.toLocaleString() : "1,000+"} prompts in ${Object.keys(gallery.data?.languages ?? {}).length || 1} languages, with credit | cizle`,
		description: preset ? `${preset.blurb} Each prompt credits its creator and links to the original.` : "Browse real video prompts people made with Claude Opus 5.5: motion graphics, explainers, product videos and 3D. Each one credits its creator and links to the original post. Read a free sample, unlock the rest with Premium.",
		path: preset?.path ?? "/gallery",
	});

	// only English (Latin-script) categories are listed for now; prompts in other languages stay visible, they just do not add their own category labels
	const allCategories = useMemo(() => [...new Set((preset ? (items || []).filter((g) => g.collection === preset.id).map((g) => g.category || "") : gallery.data?.categories || []).map(canonCategory))].filter((c) => c && isLatinLabel(c)), [gallery.data?.categories, items, preset?.id]);
	const categories = allCategories;
	const countryCounts = useMemo(() => countBy(scoped || [], (g) => g.country), [scoped]);
	const toolCounts = useMemo(() => countBy(scoped || [], (g) => g.tools), [scoped]);
	const topicCounts = useMemo(() => countBy(scoped || [], (g) => g.topic), [scoped]);
	const counts = useMemo(() => {
		const m: Record<string, number> = {};
		for (const g of scoped || []) if (g.category) m[canonCategory(g.category)] = (m[canonCategory(g.category)] || 0) + 1;
		return m;
	}, [scoped]);

	return (
		<div className="board pt-6 pb-4">
			<div className="board-w">
				<div className="reveal flex flex-wrap items-end justify-between gap-x-10 gap-y-5">
					<h1 className="display" style={{ fontSize: "clamp(2.75rem, 8vw, 7.5rem)" }}>
						{preset ? preset.title : "Prompt gallery"}
					</h1>
					<p className="max-w-[46ch] pb-2 text-lg leading-snug">
						{preset ? `${preset.blurb} ${kindTotal.toLocaleString()} prompts, each with its creator credited and a link to the original.` : null}
						{!preset ? <>{total ? `${total.toLocaleString()} real prompts` : "Real prompts"} in {Object.keys(gallery.data?.languages ?? {}).length || 1} languages: video prompts, image prompts and skills from creators around the world. Every card credits its creator and links to the original. {PREMIUM ? `${gallery.data?.free ?? "A few"} are free to read in full; Premium unlocks the rest.` : "All of them are free to read and copy."}</> : null}
					</p>
				</div>

				<nav aria-label="Prompt types" className="mt-6 flex flex-wrap gap-1.5">
					{[{ id: "", label: "All", path: "/gallery" }, ...COLLECTION_TABS].map((t) => {
						const n = t.id ? (items || []).filter((g) => g.collection === t.id).length : allTotal;
						if (t.id && !n && gallery.data) return null;
						const on = (preset?.id ?? "") === t.id;
						return (
							<Link key={t.id || "all"} to={t.path as "/gallery"} search={{}} aria-current={on ? "page" : undefined} className={`press inline-flex items-center gap-2 rounded-full px-4 py-2 text-base ${on ? "bg-foreground text-background" : "bg-surface text-foreground hover:bg-tile-2"}`}>
								{t.label} {n ? <span className={`tabular-nums ${on ? "opacity-70" : "text-muted-foreground"}`}>{n.toLocaleString()}</span> : null}
							</Link>
						);
					})}
				</nav>

				<div className="mt-4">
					<form role="search" aria-label="Filter prompts" className="flex flex-wrap items-center gap-2 rounded-lg bg-surface p-2" onSubmit={(e) => e.preventDefault()}>
						<div className="relative w-full sm:w-80">
							<Icon icon={Search01Icon} size={17} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted-foreground" />
							<Input type="search" value={q} onChange={(e) => (locked ? openGate("search the gallery") : setQ(e.target.value))} placeholder={`Search ${total ? total.toLocaleString() : ""} prompts`} className="pl-10" aria-label="Search prompts" />
						</div>
						<LanguageSelect value={search.lang || ""} onChange={(v) => setFilter({ lang: v })} counts={gallery.data?.languages ?? {}} className="w-[12.5rem]" />
						<OptionSelect icon={Globe02Icon} aria-label="Country" value={search.country || ""} onValueChange={(v) => setFilter({ country: v })} emptyLabel="All countries" emptyIcon={Globe02Icon} options={countryCounts.map(([c, n]) => ({ value: c, label: `${countryFlag(c)} ${c} · ${n.toLocaleString()}` }))} className="w-[13rem]" />
						<OptionSelect icon={Layers01Icon} aria-label="Tool" value={search.tool || ""} onValueChange={(v) => setFilter({ tool: v })} emptyLabel="All tools" emptyIcon={Layers01Icon} options={toolCounts.map(([c, n]) => ({ value: c, label: `${c} · ${n.toLocaleString()}` }))} className="w-[12.5rem]" />
						<OptionSelect icon={Layers01Icon} aria-label="Topic" value={search.topic || ""} onValueChange={(v) => setFilter({ topic: v })} emptyLabel="All topics" emptyIcon={Layers01Icon} options={topicCounts.map(([c, n]) => ({ value: c, label: `${c} · ${n.toLocaleString()}` }))} className="w-[13rem]" />
						<OptionSelect icon={Layers01Icon} aria-label="Category" value={search.category || ""} onValueChange={(v) => setFilter({ category: v })} emptyLabel="All categories" options={categories.map((c) => ({ value: c, label: categoryLabel(c), icon: categoryIcon(c) }))} className="w-[12.5rem]" />
						{PREMIUM ? <OptionSelect icon={Layers01Icon} aria-label="Access" value={search.access || ""} onValueChange={(v) => setFilter({ access: v })} emptyLabel="Any access" options={[{ value: "free", label: "Free samples", icon: ACCESS_ICON.free }, { value: "premium", label: "Premium", icon: ACCESS_ICON.premium }]} className="w-[12rem]" /> : null}
						<OptionSelect icon={SortByDown01Icon} aria-label="Sort" value={search.sort || ""} onValueChange={(v) => setFilter({ sort: v })} emptyLabel="Random" emptyIcon={SORT_ICON.random} options={[{ value: "new", label: "Newest", icon: SORT_ICON.new }, { value: "az", label: "A to Z", icon: SORT_ICON.az }, { value: "long", label: "Longest first", icon: SORT_ICON.long }]} className="w-[12rem]" />
						{active ? (
							<Button type="button" variant="secondary" onClick={() => (setQ(""), setShown(PAGE), navigate({ to: listPath, search: {}, replace: true }))}>
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
					{gallery.isLoading ? "Loading prompts…" : `${list.length.toLocaleString()} ${list.length === 1 ? "prompt" : "prompts"}${active || locked ? ` of ${total.toLocaleString()}` : ""}. `}
					{locked && gallery.data ? <button type="button" onClick={() => openGate("see every prompt")} className="underline decoration-field-1 decoration-2 underline-offset-4">Sign in free to browse them all.</button> : null}
					{PREMIUM && !isPro && gallery.data ? <Link to="/pricing" className="underline decoration-field-1 decoration-2 underline-offset-4">Unlock the full text of {(total - gallery.data.free).toLocaleString()} prompts from {fromLabel("USD")} a month.</Link> : PREMIUM && isPro ? "Premium is unlocked." : null}
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
						<ul className="grid grid-cols-[minmax(0,1fr)] gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
							{list.slice(0, shown).map((g, k) => (
								<li key={g.id} className="reveal" style={{ ["--i" as string]: k % 4 }}>
									<PromptCard item={g} search={search} />
								</li>
							))}
						</ul>
						{locked ? (
							<button type="button" onClick={() => openGate("see every prompt")} className="press tile mt-2 flex h-16 w-full items-center justify-center gap-2 text-lg font-medium hover:bg-tile-2">
								Sign in free to see the other {(total - list.length).toLocaleString()} prompts
							</button>
						) : shown < list.length ? (
							<button type="button" onClick={() => setShown((n) => n + PAGE)} className="press tile mt-2 flex h-16 w-full items-center justify-center gap-2 text-lg font-medium hover:bg-tile-2">
								Show {Math.min(PAGE, list.length - shown)} more <span className="text-muted-foreground">· {(list.length - shown).toLocaleString()} left</span>
							</button>
						) : null}
					</>
				) : (
					<div className="tile p-10 text-center">
						<p className="statement">No prompts match those filters.</p>
						<Button className="mt-4" variant="secondary" onClick={() => (setQ(""), navigate({ to: listPath, search: {}, replace: true }))}>
							Clear filters
						</Button>
					</div>
				)}

				<Collections />

				<p className="mx-auto mt-10 max-w-[60ch] px-1 text-center text-base">Prompts belong to the people who wrote them. We link to every original and remove a prompt on request. Email us from the contact page.</p>
			</div>

			{open ? <PromptDialog item={open} search={search} list={list} /> : null}
		</div>
	);
}
