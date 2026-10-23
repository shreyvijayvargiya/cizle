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
import { Hero } from "@/components/Hero";
import { VideoToggle } from "@/components/VideoToggle";
import { PromptCard } from "@/components/PromptCard";
import { filterGallery, useGallery, useGalleryFuse, type GalleryItem } from "@/lib/gallery";
import { useAuth } from "@/lib/auth";
import { fromLabel } from "@/lib/billing";
import { SITE } from "@/lib/config";
import { filterSkills, useFuse, useSkills, type Filters, type SkillMeta } from "@/lib/data";
import { useHead } from "@/lib/head";
import { orgJsonLd, siteJsonLd } from "@/lib/seo";

const KEYS: (keyof Filters)[] = ["q", "category", "platform", "format", "aspect", "access", "sort", "kind"];
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
	useEffect(() => {
		if (openPrompt) navigate({ to: "/prompts/$slug", params: { slug: openPrompt.slug }, search: {}, replace: true, resetScroll: false });
	}, [openPrompt]); // eslint-disable-line react-hooks/exhaustive-deps
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
							{!isPro ? <Link to="/pricing" className="underline decoration-field-1 decoration-2 underline-offset-4">Unlock {lockedPrompts > 0 ? lockedPrompts.toLocaleString() : "all"} full prompts and {total - freeCount || 36} premium skills.</Link> : <span>Premium is unlocked.</span>}
						</p>
					</div>

					<div className="mt-8">
						<form role="search" aria-label="Filter skills and prompts" className="flex flex-wrap items-center gap-2 rounded-lg bg-surface p-2" onSubmit={(e) => e.preventDefault()}>
							<div className="relative w-full sm:w-80">
								<Icon icon={Search01Icon} size={17} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted-foreground" />
								<Input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${(total + promptTotal).toLocaleString()} skills and prompts`} className="pl-10" aria-label="Search skills and prompts" />
							</div>
							<OptionSelect aria-label="Show" value={search.kind || ""} onValueChange={(v) => setFilter({ kind: v })} emptyLabel="Skills and prompts" options={[{ value: "skills", label: "Skills only" }, { value: "prompts", label: "Community prompts" }]} className="w-[13.5rem]" />
							<OptionSelect aria-label="Category" value={search.category || ""} onValueChange={(v) => setFilter({ category: v })} emptyLabel="All categories" options={options(categories)} className="w-[12rem]" />
							<OptionSelect aria-label="Platform" value={search.platform || ""} onValueChange={(v) => setFilter({ platform: v })} emptyLabel="Any platform" options={options(skills.data?.platforms.filter((p) => p !== "Any"))} className="w-[11rem]" />
							<OptionSelect aria-label="Format" value={search.format || ""} onValueChange={(v) => setFilter({ format: v })} emptyLabel="Any format" options={options(skills.data?.formats)} className="w-[11rem]" />
							<OptionSelect aria-label="Aspect ratio" value={search.aspect || ""} onValueChange={(v) => setFilter({ aspect: v })} emptyLabel="Any ratio" options={options(skills.data?.aspects)} className="w-[10rem]" />
							<OptionSelect aria-label="Access" value={search.access || ""} onValueChange={(v) => setFilter({ access: v })} emptyLabel="Any access" options={[{ value: "free", label: "Free" }, { value: "premium", label: "Premium" }]} className="w-[10.5rem]" />
							<OptionSelect aria-label="Sort" value={search.sort || ""} onValueChange={(v) => setFilter({ sort: v })} emptyLabel="Recommended" options={[{ value: "az", label: "A to Z" }, { value: "short", label: "Shortest first" }]} className="w-[12rem]" />
							{active ? (
								<Button type="button" variant="secondary" onClick={() => (setQ(""), navigate(slug ? { to: "/skills/$slug", params: { slug }, search: {}, replace: true } : { to: "/", search: {}, replace: true }))}>
									<Icon icon={Cancel01Icon} size={15} /> Clear
								</Button>
							) : null}
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

					{!user && skills.data && !slug ? (
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

			{slug && skills.data ? <SkillDialog slug={slug} list={list.some((s) => s.slug === slug) ? list : skills.data.skills} search={search} /> : null}
		</div>
	);
}
