import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { Cancel01Icon, Layers01Icon, MusicNote01Icon, Search01Icon, SortByDown01Icon, Timer01Icon, FilterHorizontalIcon } from "@hugeicons/core-free-icons";
import { AudioCard } from "@/components/AudioCard";
import { AudioDialog } from "@/components/AudioDialog";
import { Icon } from "@/components/Icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/misc";
import { OptionSelect } from "@/components/ui/select";
import { filterAudio, KIND_LABEL, LENGTH_LABEL, useAudio, type AudioFilters } from "@/lib/audio";
import { useHead } from "@/lib/head";

const PAGE = 48;
const KEYS: (keyof AudioFilters)[] = ["q", "kind", "length", "tag", "license", "version"];

/** Background music, sound effects and ambience, each with a name, a file that plays in the browser, a prompt and its credit. Same search, tabs and dropdowns as the gallery. */
export function AudioPage({ slug }: { slug?: string } = {}) {
	const navigate = useNavigate();
	const search = useSearch({ strict: false }) as AudioFilters;
	const audio = useAudio();
	const items = audio.data?.items;
	const [q, setQ] = useState(search.q || "");
	const [shown, setShown] = useState(PAGE);
	const setFilter = (patch: Partial<AudioFilters>) => {
		const next = { ...search, ...patch };
		for (const k of [...KEYS, "sort" as const]) if (!next[k]) delete next[k];
		setShown(PAGE);
		navigate({ to: "/audio", search: next as never, replace: true, resetScroll: false });
	};
	useEffect(() => {
		if ((search.q || "") === q.trim()) return;
		const t = setTimeout(() => setFilter({ q: q.trim() || undefined }), 220);
		return () => clearTimeout(t);
	});
	useEffect(() => setQ(search.q || ""), [search.q]);

	const list = useMemo(() => (items ? filterAudio(items, search) : []), [items, search]);
	const active = KEYS.some((k) => search[k]);
	const total = audio.data?.total ?? 0;
	const open = slug ? items?.find((a) => a.slug === slug) : undefined;
	const kinds = audio.data?.kinds ?? [];
	const version = audio.data?.versions.at(-1)?.version;
	useHead({ enabled: !open, title: `Audio library: ${total ? `${total.toLocaleString()} ` : ""}background music and sound effects for AI video | cizle`, description: "Free background music, sound effects and ambience with a name, a prompt and a credit. Listen in the browser, copy the prompt, and use it from Claude Code through the cizle MCP.", path: "/audio" });

	return (
		<div className="board pt-6 pb-4">
			<div className="board-w">
				<div className="reveal flex flex-wrap items-end justify-between gap-x-10 gap-y-5">
					<h1 className="display" style={{ fontSize: "clamp(2.75rem, 8vw, 7.5rem)" }}>Audio library</h1>
					<p className="max-w-[46ch] pb-2 text-lg leading-snug">
						{total ? `${total.toLocaleString()} clips` : "Clips"} of background music, sound effects and ambience, from short stings to full tracks. Press play to listen, open one for its prompt and credit. {version ? <span className="whitespace-nowrap rounded-full bg-surface px-2.5 py-0.5 text-sm">Audio harvest {version}{(audio.data?.versions.length ?? 0) > 1 ? ` · ${audio.data!.versions.length} collections` : ""}</span> : null}
					</p>
				</div>

				<div className="mt-8">
					<form role="search" aria-label="Filter audio" className="flex flex-wrap items-center gap-2 rounded-lg bg-surface p-2" onSubmit={(e) => e.preventDefault()}>
						<div className="relative w-full sm:w-80">
							<Icon icon={Search01Icon} size={17} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted-foreground" />
							<Input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${total ? total.toLocaleString() : ""} clips`} className="pl-10" aria-label="Search audio" />
						</div>
						{(audio.data?.versions.length ?? 0) > 1 ? <OptionSelect icon={Layers01Icon} aria-label="Collection" value={search.version || ""} onValueChange={(v) => setFilter({ version: v })} emptyLabel="All collections" options={(audio.data?.versions ?? []).map((v) => ({ value: v.version, label: `${v.label} · ${v.count}` }))} className="w-[13.5rem]" /> : null}
						<OptionSelect icon={MusicNote01Icon} aria-label="Type" value={search.kind || ""} onValueChange={(v) => setFilter({ kind: v })} emptyLabel="All types" options={kinds.map(([k, n]) => ({ value: k, label: `${KIND_LABEL[k] ?? k} · ${n}` }))} className="w-[12.5rem]" />
						<OptionSelect icon={Timer01Icon} aria-label="Length" value={search.length || ""} onValueChange={(v) => setFilter({ length: v })} emptyLabel="Any length" options={(audio.data?.lengths ?? []).map(([k, n]) => ({ value: k, label: `${LENGTH_LABEL[k] ?? k} · ${n}` }))} className="w-[14rem]" />
						<OptionSelect icon={Layers01Icon} aria-label="Mood or sound" value={search.tag || ""} onValueChange={(v) => setFilter({ tag: v })} emptyLabel="All sounds" options={(audio.data?.tags ?? []).map(([k, n]) => ({ value: k, label: `${k} · ${n}` }))} className="w-[12.5rem]" />
						<OptionSelect icon={Layers01Icon} aria-label="Licence" value={search.license || ""} onValueChange={(v) => setFilter({ license: v })} emptyLabel="Any licence" options={(audio.data?.licenses ?? []).map(([k, n]) => ({ value: k, label: `${k} · ${n}` }))} className="w-[12.5rem]" />
						<OptionSelect icon={SortByDown01Icon} aria-label="Sort" value={search.sort || ""} onValueChange={(v) => setFilter({ sort: v })} emptyLabel="Mixed" options={[{ value: "az", label: "A to Z" }, { value: "short", label: "Shortest first" }, { value: "long", label: "Longest first" }]} className="w-[12rem]" />
						{active ? <Button type="button" variant="secondary" onClick={() => (setQ(""), setShown(PAGE), navigate({ to: "/audio", search: {} as never, replace: true }))}><Icon icon={Cancel01Icon} size={15} /> Clear</Button> : null}
					</form>
				</div>

				{audio.data ? (
					<div role="group" aria-label="Type" className="mt-2 flex flex-wrap gap-2">
						{[["", "All", total] as const, ...kinds.map(([k, n]) => [k, KIND_LABEL[k] ?? k, n] as const)].map(([k, label, n]) => (
							<button key={k} type="button" aria-pressed={(search.kind || "") === k} onClick={() => setFilter({ kind: k || undefined })} className={`press inline-flex h-11 items-center gap-2 rounded-lg px-4 text-base font-medium transition-colors ${(search.kind || "") === k ? "bg-primary text-primary-foreground" : "bg-surface hover:bg-tile-2"}`}>
								<Icon icon={k ? MusicNote01Icon : FilterHorizontalIcon} size={17} /> {label} <span className="opacity-70">{n}</span>
							</button>
						))}
					</div>
				) : null}

				<p className="px-1 py-3 text-lg" aria-live="polite">{audio.isLoading ? "Loading clips…" : `${list.length.toLocaleString()} ${list.length === 1 ? "clip" : "clips"}${active ? ` of ${total.toLocaleString()}` : ""}.`}</p>

				{audio.isLoading ? (
					<div className="grid grid-cols-[minmax(0,1fr)] gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-64" />)}</div>
				) : audio.isError ? (
					<div className="tile p-8 text-center"><p className="statement">The audio library is not published yet.</p><Button className="mt-4" onClick={() => audio.refetch()}>Try again</Button></div>
				) : list.length ? (
					<>
						<ul className="grid grid-cols-[minmax(0,1fr)] gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
							{list.slice(0, shown).map((a) => <li key={a.id}><AudioCard item={a} search={search} /></li>)}
						</ul>
						{shown < list.length ? <button type="button" onClick={() => setShown((n) => n + PAGE)} className="press tile mt-2 flex h-16 w-full items-center justify-center gap-2 text-lg font-medium hover:bg-tile-2">Show {Math.min(PAGE, list.length - shown)} more <span className="text-muted-foreground">· {(list.length - shown).toLocaleString()} left</span></button> : null}
					</>
				) : (
					<div className="tile p-10 text-center"><p className="statement">No clips match those filters.</p><Button className="mt-4" variant="secondary" onClick={() => (setQ(""), navigate({ to: "/audio", search: {} as never, replace: true }))}>Clear filters</Button></div>
				)}

				<p className="mx-auto mt-10 max-w-[60ch] px-1 text-center text-base">Every clip keeps its creator's credit and licence. Previews are MP3; the original files stay with their source. Email us from the contact page to have one removed.</p>
			</div>
			{open && list.length ? <AudioDialog item={open} search={search} list={list.some((a) => a.id === open.id) ? list : [open, ...list]} /> : open ? <AudioDialog item={open} search={search} list={[open]} /> : null}
		</div>
	);
}
