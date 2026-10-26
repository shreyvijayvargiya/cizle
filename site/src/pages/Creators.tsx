import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight01Icon, Clock01Icon, GithubIcon, Globe02Icon, Layers01Icon, NewTwitterIcon, Search01Icon, SortingAZ01Icon, SortByDown01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/Icon";
import { LanguageSelect } from "@/components/LanguageSelect";
import { Input } from "@/components/ui/input";
import { OptionSelect } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/misc";
import { useCreators, type Creator } from "@/lib/creators";
import { useHead } from "@/lib/head";
import { languageOf } from "@/lib/languages";
import { cn } from "@/lib/utils";

const PAGE = 100;
const COLS = "grid-cols-[2.25rem_minmax(0,1.6fr)_4.5rem_4.5rem] md:grid-cols-[2.5rem_minmax(0,1.6fr)_5rem_5rem_minmax(0,1fr)_minmax(0,0.9fr)_9.5rem]";

function Avatar({ c }: { c: Creator }) {
	// GitHub owners have a public avatar; X profile pictures are not fetched from any third party, so those show the initial
	const [bad, setBad] = useState(false);
	const src = c.platform === "github" ? `https://github.com/${c.handle}.png?size=64` : null;
	return (
		<span className="relative grid size-9 shrink-0 place-items-center overflow-hidden rounded-full bg-field-2 text-sm font-semibold text-field-2-ink">
			{(c.name || c.handle).replace("@", "").slice(0, 1).toUpperCase()}
			{src && !bad ? <img src={src} alt="" loading="lazy" referrerPolicy="no-referrer" onError={() => setBad(true)} className="absolute inset-0 size-full object-cover" /> : null}
		</span>
	);
}

/** Every creator in the library, once each: a table of names, links and what they made, so people can follow them and use them as sources. */
export function CreatorsPage() {
	const q = useCreators();
	const [text, setText] = useState("");
	const [platform, setPlatform] = useState("");
	const [lang, setLang] = useState("");
	const [sort, setSort] = useState("");
	const [shown, setShown] = useState(PAGE);
	const all = q.data?.creators ?? [];

	const langCounts = useMemo(() => {
		const m: Record<string, number> = {};
		for (const c of all) for (const l of c.languages) m[l] = (m[l] || 0) + 1;
		return m;
	}, [all]);
	const list = useMemo(() => {
		const t = text.trim().toLowerCase();
		let l = all.filter((c) => (!platform || c.platform === platform) && (!lang || c.languages.includes(lang)) && (!t || `${c.name || ""} ${c.handle}`.toLowerCase().includes(t)));
		if (sort === "az") l = [...l].sort((a, b) => (a.name || a.handle).localeCompare(b.name || b.handle));
		else if (sort === "new") l = [...l].sort((a, b) => String(b.last || "").localeCompare(String(a.last || "")));
		else if (sort === "skills") l = [...l].sort((a, b) => b.skills - a.skills || b.total - a.total);
		return l;
	}, [all, text, platform, lang, sort]);

	useHead({
		title: `Creators: ${q.data ? q.data.total.toLocaleString() : "1,000+"} people behind the prompts and skills | cizle`,
		description: "Every creator in the cizle library with a link to follow them: the people who wrote the video prompts and the Claude skills, and how much each one shared.",
		path: "/creators",
	});

	return (
		<div className="board pt-6 pb-4">
			<div className="board-w">
				<div className="reveal flex flex-wrap items-end justify-between gap-x-10 gap-y-5">
					<h1 className="display" style={{ fontSize: "clamp(2.75rem, 8vw, 7.5rem)" }}>
						Creators
					</h1>
					<p className="max-w-[46ch] pb-2 text-lg leading-snug">
						{q.data ? `${q.data.total.toLocaleString()} people` : "The people"} behind the prompts and skills here. Follow them, and use them as your own sources.
					</p>
				</div>

				<form role="search" aria-label="Filter creators" className="mt-8 flex flex-wrap items-center gap-2 rounded-lg bg-surface p-2" onSubmit={(e) => e.preventDefault()}>
					<div className="relative w-full sm:w-80">
						<Icon icon={Search01Icon} size={17} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted-foreground" />
						<Input type="search" value={text} onChange={(e) => (setText(e.target.value), setShown(PAGE))} placeholder={`Search ${all.length ? all.length.toLocaleString() : ""} creators`} className="pl-10" aria-label="Search creators" />
					</div>
					<OptionSelect aria-label="Platform" value={platform} onValueChange={(v) => (setPlatform(v), setShown(PAGE))} emptyLabel="Any platform" emptyIcon={Globe02Icon} options={[{ value: "x", label: `X${q.data ? ` · ${q.data.platforms.x ?? 0}` : ""}`, icon: NewTwitterIcon }, { value: "github", label: `GitHub${q.data ? ` · ${q.data.platforms.github ?? 0}` : ""}`, icon: GithubIcon }]} className="w-[11rem]" />
					<LanguageSelect value={lang} onChange={(v) => (setLang(v), setShown(PAGE))} counts={langCounts} className="w-[12.5rem]" />
					<OptionSelect aria-label="Sort" value={sort} onValueChange={(v) => setSort(v)} emptyLabel="Most shared" emptyIcon={SortByDown01Icon} options={[{ value: "skills", label: "Most skills", icon: Layers01Icon }, { value: "new", label: "Newest", icon: Clock01Icon }, { value: "az", label: "A to Z", icon: SortingAZ01Icon }]} className="w-[12rem]" />
				</form>

				<p className="px-1 py-3 text-lg" aria-live="polite">
					{q.isLoading ? "Loading creators…" : `${list.length.toLocaleString()} ${list.length === 1 ? "creator" : "creators"}${list.length !== all.length ? ` of ${all.length.toLocaleString()}` : ""}.`}
				</p>

				{q.isLoading ? (
					<div className="space-y-2">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-14" />)}</div>
				) : q.isError ? (
					<div className="tile p-8 text-center">
						<p className="statement">The creators list is not published yet.</p>
						<p className="mt-2 text-muted-foreground">Run npm run content in the site folder, then reload.</p>
					</div>
				) : (
					<div role="table" aria-label="Creators" className="overflow-hidden rounded-lg bg-surface">
						<div role="row" className={cn("grid items-center gap-3 border-b border-input px-4 py-3 text-sm font-medium text-muted-foreground", COLS)}>
							<span role="columnheader">#</span>
							<span role="columnheader">Creator</span>
							<span role="columnheader" className="text-right">Prompts</span>
							<span role="columnheader" className="text-right">Skills</span>
							<span role="columnheader" className="hidden md:block">Languages</span>
							<span role="columnheader" className="hidden md:block">Collections</span>
							<span role="columnheader" className="hidden text-right md:block">Follow</span>
						</div>
						<ul>
							{list.slice(0, shown).map((c, i) => (
								<li key={c.key} role="row" className={cn("grid items-center gap-3 px-4 py-2.5 transition-colors hover:bg-tile-2", COLS, i > 0 && "border-t border-input/60")}>
									<span role="cell" className="text-sm text-muted-foreground tabular-nums">{i + 1}</span>
									<div role="cell" className="flex min-w-0 items-center gap-3">
										<Avatar c={c} />
										<div className="min-w-0 leading-tight">
											<a href={c.url} target="_blank" rel="noopener noreferrer" className="block truncate text-base font-medium hover:underline">{c.name || `@${c.handle}`}</a>
											<span className="flex items-center gap-1 truncate text-sm text-muted-foreground">
												<Icon icon={c.platform === "github" ? GithubIcon : NewTwitterIcon} size={12} /> @{c.handle}
											</span>
										</div>
									</div>
									<span role="cell" className="text-right tabular-nums">{c.prompts ? c.prompts.toLocaleString() : "·"}</span>
									<span role="cell" className="text-right tabular-nums">{c.skills ? c.skills.toLocaleString() : "·"}</span>
									<span role="cell" className="hidden items-center gap-1 text-base md:flex" title={c.languages.map((l) => languageOf(l).name).join(", ")}>
										{c.languages.slice(0, 4).map((l) => <span key={l} aria-label={languageOf(l).name}>{languageOf(l).flag}</span>)}
									</span>
									<span role="cell" className="hidden flex-wrap gap-1 md:flex">
										{c.collections.map((v) => <span key={v} className="rounded-md bg-muted px-1.5 py-0.5 text-xs">{v}</span>)}
									</span>
									<span role="cell" className="hidden items-center justify-end gap-1.5 md:flex">
										{c.platform === "x" ? <Link to="/gallery" search={{ q: c.handle }} className="press inline-flex h-8 items-center rounded-md bg-tile-2 px-2.5 text-sm hover:bg-muted" title={`See what @${c.handle} shared`}>Work</Link> : null}
										<a href={c.url} target="_blank" rel="noopener noreferrer" className="press inline-flex h-8 items-center gap-1 rounded-md bg-primary px-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/85">
											{c.platform === "github" ? "GitHub" : "Follow"} <Icon icon={ArrowUpRight01Icon} size={13} />
										</a>
									</span>
								</li>
							))}
						</ul>
					</div>
				)}
				{shown < list.length ? (
					<button type="button" onClick={() => setShown((n) => n + PAGE)} className="press tile mt-2 flex h-16 w-full items-center justify-center gap-2 text-lg font-medium hover:bg-tile-2">
						Show {Math.min(PAGE, list.length - shown)} more <span className="text-muted-foreground">· {(list.length - shown).toLocaleString()} left</span>
					</button>
				) : null}
				<p className="mx-auto mt-10 max-w-[60ch] px-1 text-center text-base">Only creators with a known account are listed. Prompts without a named author are not counted here. Tell us if you want your entry changed or removed.</p>
			</div>
		</div>
	);
}
