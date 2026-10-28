import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { Cancel01Icon, Search01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/Icon";
import { PromptCard } from "@/components/PromptCard";
import { PromptDialog } from "@/components/PromptDialog";
import { SkillCard } from "@/components/SkillCard";
import { SkillDialog } from "@/components/SkillDialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/misc";
import { COLLECTION_TABS, filterGallery, useGallery, useGalleryFuse, useShuffle, type GalleryItem } from "@/lib/gallery";
import { filterSkills, useFuse, useSkills, type SkillMeta } from "@/lib/data";
import { useHead } from "@/lib/head";

const PAGE = 48;
const IDEAS = ["product launch video", "landing page", "saas dashboard", "ios app design", "logo reveal", "3d scene", "claude code skill", "explainer"];
type Entry = { type: "skill"; skill: SkillMeta } | { type: "prompt"; prompt: GalleryItem };

/** Prompts with a demo video first, one skill after every four prompts: the same order the home page uses. */
function mix(skills: SkillMeta[], prompts: GalleryItem[]): Entry[] {
	const out: Entry[] = [];
	const p = [...prompts].sort((a, b) => Number(Boolean(b.video)) - Number(Boolean(a.video)));
	const s = [...skills].sort((a, b) => Number(Boolean(b.video)) - Number(Boolean(a.video)));
	let i = 0, j = 0;
	while (i < s.length || j < p.length) {
		for (let k = 0; k < 4 && j < p.length; k++) out.push({ type: "prompt", prompt: p[j++] });
		if (i < s.length) out.push({ type: "skill", skill: s[i++] });
	}
	return out;
}

/**
 * Search, entirely in the browser: Fuse.js over the library files the site already loads (cached by react-query), so it costs no API calls.
 * The query lives in the address (/search?q=papercut), so a person, a bot or an AI agent can build the URL itself; typing updates it.
 * Add &format=md or &format=json (served by the function, see vercel.json) for plain text.
 */
export function SearchPage() {
	const navigate = useNavigate();
	const search = useSearch({ strict: false }) as { q?: string; p?: string; s?: string; format?: string; t?: string };
	const skills = useSkills();
	const gallery = useGallery();
	const fuse = useFuse(skills.data?.skills);
	const gfuse = useGalleryFuse(gallery.data?.items);
	const { seed } = useShuffle();
	const [text, setText] = useState(search.q || "");
	const [shown, setShown] = useState(PAGE);
	const q = (search.q || "").trim();

	// someone who opens the plain-text form in a browser gets it from the function
	useEffect(() => {
		if (search.format) window.location.replace(`/api/search?${new URLSearchParams(window.location.search).toString()}`);
	}, [search.format]);

	// typing writes the address (debounced); the address is the one source of truth
	useEffect(() => {
		if (text.trim() === q) return;
		const t = setTimeout(() => (setShown(PAGE), navigate({ to: "/search", search: { q: text.trim() || undefined, p: search.p, s: search.s, t: search.t } as never, replace: true, resetScroll: false })), 200);
		return () => clearTimeout(t);
	});
	useEffect(() => setText(search.q || ""), [search.q]);

	// the tab (?t=website) narrows the results to one kind: video, image, website, app, text prompts, or skills
	const tab = search.t || "";
	const allPrompts = useMemo(() => (gallery.data ? filterGallery(gallery.data.items, gfuse, { q }, seed) : []), [gallery.data, gfuse, q, seed]);
	const allSkills = useMemo(() => (q && skills.data ? filterSkills(skills.data.skills, fuse, { q }) : skills.data && tab ? skills.data.skills : []), [skills.data, fuse, q, tab]);
	const tabs = useMemo(
		() => [
			{ id: "", label: "All", n: allPrompts.length + allSkills.length },
			...COLLECTION_TABS.map((c) => ({ id: c.id as string, label: c.label, n: allPrompts.filter((g) => g.collection === c.id).length + allSkills.filter((x) => x.collection === c.id).length })),
			{ id: "skills", label: "Skills", n: allSkills.length },
		].filter((t) => !t.id || t.n || tab === t.id),
		[allPrompts, allSkills, tab],
	);
	const promptList = useMemo(() => {
		if (tab === "skills") return [];
		const l = tab ? allPrompts.filter((g) => g.collection === tab) : allPrompts;
		return q || tab ? l : l.filter((g) => g.video).slice(0, 24);
	}, [allPrompts, tab, q]);
	const skillList = useMemo(() => (!tab || tab === "skills" ? allSkills : allSkills.filter((x) => x.collection === tab)), [allSkills, tab]);
	const entries = useMemo(() => mix(skillList, promptList), [skillList, promptList]);
	const open = search.p ? gallery.data?.items.find((g) => g.slug === search.p) : undefined;
	const openSkill = search.s ? skills.data?.skills.find((s) => s.slug === search.s) : undefined;
	const loading = skills.isLoading || gallery.isLoading;

	useHead({
		enabled: !open && !openSkill,
		title: q ? `Search: ${q} | cizle` : "Search the cizle prompt library | cizle",
		description: "Search thousands of AI video, image, website and mobile-app prompts and Claude Code skills. Add ?q=your+words to the address to search from a link.",
		path: "/search",
		noindex: true,
	});

	const base = { q: q || undefined, t: tab || undefined } as never;
	const close = () => navigate({ to: "/search", search: base, resetScroll: false });
	return (
		<div className="board pt-6 pb-4">
			<div className="board-w">
				<h1 className="display reveal text-center" style={{ fontSize: "clamp(2rem, 4.5vw, 4rem)" }}>Search the library</h1>
				<form role="search" onSubmit={(e) => e.preventDefault()} className="reveal relative mx-auto mt-6 max-w-3xl" style={{ ["--i" as string]: 1 }}>
					<Icon icon={Search01Icon} size={22} className="pointer-events-none absolute top-1/2 left-5 -translate-y-1/2 text-neutral-500" />
					<input
						type="search"
						autoFocus
						value={text}
						onChange={(e) => setText(e.target.value)}
						placeholder={`Search ${((gallery.data?.total ?? 0) + (skills.data?.skills.length ?? 0) || 8000).toLocaleString()} prompts and skills`}
						aria-label="Search prompts and skills"
						className="h-16 w-full rounded-full border border-neutral-300 bg-white pr-14 pl-14 text-xl text-neutral-950 shadow-sm outline-none placeholder:text-neutral-400 focus:border-neutral-500 focus:ring-4 focus:ring-neutral-300/60"
					/>
					{text ? (
						<button type="button" onClick={() => setText("")} aria-label="Clear search" className="absolute top-1/2 right-4 grid size-9 -translate-y-1/2 place-items-center rounded-full text-neutral-500 hover:bg-neutral-100">
							<Icon icon={Cancel01Icon} size={18} />
						</button>
					) : null}
				</form>
				<p className="mt-3 text-center text-base text-muted-foreground" aria-live="polite">
					{loading ? "Loading the library…" : q ? `${(skillList.length + promptList.length).toLocaleString()} results for "${q}"` : "Try one of these, or type your own:"}
				</p>
				<nav aria-label="Result types" className="mt-4 flex flex-wrap justify-center gap-1.5">
					{tabs.map((t) => (
						<Link key={t.id || "all"} to="/search" search={{ q: q || undefined, t: t.id || undefined } as never} replace resetScroll={false} aria-current={tab === t.id ? "page" : undefined} className={`press inline-flex items-center gap-2 rounded-full px-4 py-2 text-base ${tab === t.id ? "bg-foreground text-background" : "bg-surface text-foreground hover:bg-tile-2"}`}>
							{t.label} <span className={`tabular-nums ${tab === t.id ? "opacity-70" : "text-muted-foreground"}`}>{t.n.toLocaleString()}</span>
						</Link>
					))}
				</nav>
				{!q ? (
					<ul className="mt-3 flex flex-wrap justify-center gap-2">
						{IDEAS.map((t) => (
							<li key={t}><Link to="/search" search={{ q: t } as never} className="press rounded-full bg-surface px-4 py-2 text-base text-foreground hover:bg-tile-2">{t}</Link></li>
						))}
					</ul>
				) : null}

				<div className="mt-6">
					{loading ? (
						<div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-72" />)}</div>
					) : entries.length ? (
						<>
							<ul className="grid grid-cols-[minmax(0,1fr)] gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
								{entries.slice(0, shown).map((e, k) => (
									<li key={e.type === "skill" ? `s-${e.skill.slug}` : `p-${e.prompt.id}`} className="reveal" style={{ ["--i" as string]: k % 4 }}>
										{e.type === "skill" ? <SkillCard skill={e.skill} search={{}} inSearch={q} /> : <PromptCard item={e.prompt} search={{}} inSearch={q} />}
									</li>
								))}
							</ul>
							{shown < entries.length ? (
								<button type="button" onClick={() => setShown((n) => n + PAGE)} className="press tile mt-2 flex h-16 w-full items-center justify-center gap-2 text-lg font-medium hover:bg-tile-2">
									Show {Math.min(PAGE, entries.length - shown)} more <span className="text-muted-foreground">· {(entries.length - shown).toLocaleString()} left</span>
								</button>
							) : null}
						</>
					) : (
						<div className="tile p-10 text-center">
							<p className="statement">Nothing matches "{q}".</p>
							<p className="mt-2 text-muted-foreground">Try fewer or simpler words.</p>
							<Button className="mt-4" variant="secondary" onClick={() => setText("")}>Clear search</Button>
						</div>
					)}
				</div>
				<p className="mx-auto mt-10 max-w-[64ch] text-center text-sm text-muted-foreground">
					For a plain-text answer, add <code>&amp;format=md</code> or <code>&amp;format=json</code> to the address: <code>/search?q=papercut&amp;format=md</code>.
				</p>
			</div>

			{open ? <PromptDialog item={open} search={{}} list={promptList} onClose={close} onGo={(g) => navigate({ to: "/search", search: { q: q || undefined, p: g.slug } as never, replace: true, resetScroll: false })} /> : null}
			{openSkill ? <SkillDialog slug={openSkill.slug} list={skillList.length ? skillList : skills.data?.skills ?? []} search={{}} onClose={close} onGo={(s) => navigate({ to: "/search", search: { q: q || undefined, s: s.slug } as never, replace: true, resetScroll: false })} /> : null}
		</div>
	);
}
