import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { Cancel01Icon, LockIcon, Search01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/Icon";
import { SkillCard } from "@/components/SkillCard";
import { SkillDialog } from "@/components/SkillDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OptionSelect } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/misc";
import { PromptCard } from "@/components/PromptCard";
import { PromptDialog } from "@/components/PromptDialog";
import { filterGallery, useGallery, useGalleryFuse, type GalleryItem } from "@/lib/gallery";
import { useAuth } from "@/lib/auth";
import { priceLabel } from "@/lib/billing";
import { SITE } from "@/lib/config";
import { filterSkills, useFuse, useSkills, type Filters, type SkillMeta } from "@/lib/data";
import { useHead } from "@/lib/head";
import { orgJsonLd, siteJsonLd } from "@/lib/seo";

const KEYS: (keyof Filters)[] = ["q", "category", "platform", "format", "aspect", "access", "sort", "kind"];
const PAGE = 48;
type Entry = { type: "skill"; skill: SkillMeta } | { type: "prompt"; prompt: GalleryItem };

/** Skills and community prompts in one list: a skill, then two prompts, so neither buries the other. */
function interleave(skills: SkillMeta[], prompts: GalleryItem[]): Entry[] {
	const out: Entry[] = [];
	let i = 0;
	let j = 0;
	while (i < skills.length || j < prompts.length) {
		if (i < skills.length) out.push({ type: "skill", skill: skills[i++] });
		for (let k = 0; k < 2 && j < prompts.length; k++) out.push({ type: "prompt", prompt: prompts[j++] });
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
	const skillList = useMemo(() => (skills.data && search.kind !== "prompts" ? filterSkills(skills.data.skills, fuse, search) : []), [skills.data, fuse, search]);
	const promptList = useMemo(
		() => (gallery.data && search.kind !== "skills" && !skillOnly ? filterGallery(gallery.data.items, gfuse, { q: search.q, category: search.category, access: search.access, sort: search.sort === "az" ? "az" : undefined }) : []),
		[gallery.data, gfuse, search, skillOnly],
	);
	const mixed = useMemo(() => interleave(skillList, promptList), [skillList, promptList]);
	const list = skillList;
	const active = KEYS.some((k) => k !== "sort" && search[k]);
	const total = skills.data?.skills.length ?? 0;
	const promptTotal = gallery.data?.total ?? 0;
	const freeCount = skills.data?.skills.filter((s) => s.tier === "free").length ?? SITE.freeCount;
	const lockedPrompts = promptTotal - (gallery.data?.free ?? 0);
	const openPrompt = search.p ? gallery.data?.items.find((g) => g.id === search.p) : undefined;
	const categories = useMemo(() => [...new Set([...(skills.data?.categories ?? []), ...(gallery.data?.categories ?? []).slice(0, 24)])], [skills.data, gallery.data]);

	useHead({
		enabled: !slug && !openPrompt,
		title: "cizle skills: video prompts and Claude Code skills for product, ad and launch videos",
		description: SITE.description,
		path: "/",
		jsonLd: [orgJsonLd(), siteJsonLd()],
	});

	const options = (items: string[] = [], label: (s: string) => string = (s) => s) => items.map((v) => ({ value: v, label: label(v) }));

	return (
		<div className="mx-auto w-full max-w-7xl px-4 pt-8 sm:px-6 sm:pt-10">
			<div className="max-w-3xl">
				<h1 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">Video skills for Claude Code</h1>
				<p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
					Pick a skill or a community prompt, copy it or install it, and give Claude your product link. It plans the scenes and cizle renders the MP4 on your machine. {freeCount} skills and a free sample of the prompts are free; the ad and film-style skills and the full prompt library are Premium.
				</p>
				{!slug ? (
					<p className="mt-3 text-sm">
						<Link to="/gallery" className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 hover:bg-accent">
							<span className="font-medium">{promptTotal ? `${promptTotal.toLocaleString()} community prompts` : "Community prompts"}</span>
							<span className="text-muted-foreground">credited to their creators, mixed in below · open the full gallery →</span>
						</Link>
					</p>
				) : null}
			</div>

			<div className="sticky top-14 z-30 -mx-4 mt-6 border-b border-border bg-background/90 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
				<form role="search" aria-label="Filter skills" className="flex flex-wrap items-center gap-2" onSubmit={(e) => e.preventDefault()}>
					<div className="relative w-full sm:w-72">
						<Icon icon={Search01Icon} size={15} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground" />
						<Input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${(total + promptTotal).toLocaleString()} skills and prompts…`} className="pl-9" aria-label="Search skills and prompts" />
					</div>
					<OptionSelect aria-label="Show" value={search.kind || ""} onValueChange={(v) => setFilter({ kind: v })} emptyLabel="Skills and prompts" options={[{ value: "skills", label: "Skills only" }, { value: "prompts", label: "Community prompts" }]} className="w-[11rem]" />
					<OptionSelect aria-label="Category" value={search.category || ""} onValueChange={(v) => setFilter({ category: v })} emptyLabel="All categories" options={options(categories)} className="w-[9.5rem]" />
					<OptionSelect aria-label="Platform" value={search.platform || ""} onValueChange={(v) => setFilter({ platform: v })} emptyLabel="Any platform" options={options(skills.data?.platforms.filter((p) => p !== "Any"))} className="w-[8.5rem]" />
					<OptionSelect aria-label="Format" value={search.format || ""} onValueChange={(v) => setFilter({ format: v })} emptyLabel="Any format" options={options(skills.data?.formats)} className="w-[8.5rem]" />
					<OptionSelect aria-label="Aspect ratio" value={search.aspect || ""} onValueChange={(v) => setFilter({ aspect: v })} emptyLabel="Any ratio" options={options(skills.data?.aspects)} className="w-[7.5rem]" />
					<OptionSelect aria-label="Access" value={search.access || ""} onValueChange={(v) => setFilter({ access: v })} emptyLabel="Any access" options={[{ value: "free", label: "Free" }, { value: "premium", label: "Premium" }]} className="w-[8.5rem]" />
					<OptionSelect aria-label="Sort" value={search.sort || ""} onValueChange={(v) => setFilter({ sort: v })} emptyLabel="Recommended" options={[{ value: "az", label: "A to Z" }, { value: "short", label: "Shortest first" }]} className="w-[10.5rem]" />
					{active ? (
						<Button type="button" variant="ghost" size="sm" onClick={() => (setQ(""), navigate(slug ? { to: "/skills/$slug", params: { slug }, search: {}, replace: true } : { to: "/", search: {}, replace: true }))}>
							<Icon icon={Cancel01Icon} size={13} /> Clear
						</Button>
					) : null}
				</form>
			</div>

			<div className="mt-5 flex items-center justify-between gap-3 text-sm text-muted-foreground" aria-live="polite">
				<p>{skills.isLoading ? "Loading…" : `${skillList.length} ${skillList.length === 1 ? "skill" : "skills"}${promptList.length || search.kind !== "skills" ? ` · ${promptList.length.toLocaleString()} prompts` : ""}${active ? ` (of ${total} skills, ${promptTotal.toLocaleString()} prompts)` : ""}`}</p>
				{!isPro ? (
					<Link to="/pricing" className="hidden items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs hover:bg-accent sm:inline-flex">
						<Icon icon={LockIcon} size={12} className="text-brand" /> Unlock {total - freeCount || 36} premium skills and {lockedPrompts > 0 ? lockedPrompts.toLocaleString() : "all"} full prompts · {priceLabel("USD")}/mo
					</Link>
				) : (
					<span className="text-xs text-brand">Premium unlocked</span>
				)}
			</div>

			{skills.isLoading ? (
				<div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{Array.from({ length: 8 }).map((_, i) => (
						<Skeleton key={i} className="h-60" />
					))}
				</div>
			) : skills.isError ? (
				<div className="mt-10 rounded-xl border border-border bg-surface p-8 text-center">
					<p className="font-medium">We could not load the skills.</p>
					<p className="mt-1 text-sm text-muted-foreground">Check your connection and try again.</p>
					<Button className="mt-4" onClick={() => skills.refetch()}>
						Try again
					</Button>
				</div>
			) : mixed.length ? (
				<>
					<ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
						{mixed.slice(0, shown).map((e) =>
							e.type === "skill" ? (
								<li key={`s-${e.skill.slug}`} className="[animation:rise_.3s_ease-out_both]">
									<SkillCard skill={e.skill} search={search} />
								</li>
							) : (
								<li key={`p-${e.prompt.id}`} className="[animation:rise_.3s_ease-out_both]">
									<PromptCard item={e.prompt} search={search} base="/" />
								</li>
							),
						)}
					</ul>
					{shown < mixed.length ? (
						<div className="mt-8 text-center">
							<Button variant="outline" onClick={() => setShown((n) => n + PAGE)}>
								Show {Math.min(PAGE, mixed.length - shown)} more · {(mixed.length - shown).toLocaleString()} left
							</Button>
						</div>
					) : null}
				</>
			) : (
				<div className="mt-10 rounded-xl border border-dashed border-border p-10 text-center">
					<p className="font-medium">Nothing matches those filters.</p>
					<p className="mt-1 text-sm text-muted-foreground">Try a different word, or clear the filters.</p>
					<Button className="mt-4" variant="outline" onClick={() => (setQ(""), navigate({ to: "/", search: {}, replace: true }))}>
						Clear filters
					</Button>
				</div>
			)}

			{!user && skills.data ? (
				<section aria-labelledby="cta-h" className="mt-12 rounded-2xl border border-border bg-surface p-6 text-center sm:p-8">
					<h2 id="cta-h" className="text-lg font-semibold tracking-tight">
						Need ads, engineering formats or film styles?
					</h2>
					<p className="mx-auto mt-1 max-w-xl text-sm text-muted-foreground">Premium unlocks every ad format for Meta, TikTok and Google plus 20 film styles, for {priceLabel("USD")} a month. Cancel any time.</p>
					<Button className="mt-4" asChild>
						<Link to="/pricing">See Premium</Link>
					</Button>
				</section>
			) : null}

			{openPrompt && !slug ? <PromptDialog item={openPrompt} search={search} base="/" /> : null}
			{slug && skills.data ? <SkillDialog slug={slug} list={list.some((s) => s.slug === slug) ? list : skills.data.skills} search={search} /> : null}
		</div>
	);
}
