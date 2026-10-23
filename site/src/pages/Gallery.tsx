import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { Cancel01Icon, LockIcon, Search01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/Icon";
import { PromptCard } from "@/components/PromptCard";
import { PromptDialog } from "@/components/PromptDialog";
import { Button } from "@/components/ui/button";
import { VideoToggle } from "@/components/VideoToggle";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/misc";
import { OptionSelect } from "@/components/ui/select";
import { useAuth } from "@/lib/auth";
import { fromLabel } from "@/lib/billing";
import { filterGallery, findPrompt, useGallery, useGalleryFuse, type GalleryFilters } from "@/lib/gallery";
import { useHead } from "@/lib/head";

const PAGE = 48;
const KEYS: (keyof GalleryFilters)[] = ["q", "category", "access", "sort"];

/** Community video prompts, each credited and linked to the original. A free sample in full; the rest open to subscribers. */
export function GalleryPage({ slug }: { slug?: string } = {}) {
	const navigate = useNavigate();
	const search = useSearch({ strict: false }) as GalleryFilters;
	const { isPro } = useAuth();
	const gallery = useGallery();
	const items = gallery.data?.items;
	const fuse = useGalleryFuse(items);
	const [q, setQ] = useState(search.q || "");
	const [shown, setShown] = useState(PAGE);

	const setFilter = (patch: Partial<GalleryFilters>) => {
		const next = { ...search, ...patch };
		for (const k of [...KEYS, "p" as const]) if (!next[k]) delete next[k];
		setShown(PAGE);
		navigate({ to: "/gallery", search: next, replace: true, resetScroll: false });
	};
	useEffect(() => {
		if ((search.q || "") === q.trim()) return;
		const t = setTimeout(() => setFilter({ q: q.trim() || undefined }), 220);
		return () => clearTimeout(t);
	});
	useEffect(() => setQ(search.q || ""), [search.q]);

	const list = useMemo(() => (items ? filterGallery(items, fuse, search) : []), [items, fuse, search]);
	const active = KEYS.some((k) => k !== "sort" && search[k]);
	const total = gallery.data?.total ?? 0;
	const open = slug ? findPrompt(items, slug) : undefined;
	const legacy = search.p ? items?.find((g) => g.id === search.p) : undefined;
	useEffect(() => {
		// old ?p=<id> links move to the readable address
		if (legacy) navigate({ to: "/prompts/$slug", params: { slug: legacy.slug }, search: { ...search, p: undefined } as never, replace: true, resetScroll: false });
	}, [legacy]); // eslint-disable-line react-hooks/exhaustive-deps

	useHead({
		enabled: !open && !legacy,
		title: `Prompt gallery: ${total ? total.toLocaleString() : "1,000+"} Opus 5.5 video prompts, with credit | cizle`,
		description: "Browse real video prompts people made with Claude Opus 5.5: motion graphics, explainers, product videos and 3D. Each one credits its creator and links to the original post. Read a free sample, unlock the rest with Premium.",
		path: "/gallery",
	});

	const categories = (gallery.data?.categories || []).slice(0, 24);

	return (
		<div className="board pt-6 pb-4">
			<div className="board-w">
				<div className="reveal flex flex-wrap items-end justify-between gap-x-10 gap-y-5">
					<h1 className="display" style={{ fontSize: "clamp(2.75rem, 8vw, 7.5rem)" }}>
						Prompt gallery
					</h1>
					<p className="max-w-[46ch] pb-2 text-lg leading-snug">
						{total ? `${total.toLocaleString()} real video prompts` : "Real video prompts"} people made with Claude Opus 5.5. Every card credits its creator and links to the original post. {gallery.data?.free ?? "A few"} are free to read in full; Premium unlocks the rest.
					</p>
				</div>

				<div className="mt-8">
					<form role="search" aria-label="Filter prompts" className="flex flex-wrap items-center gap-2 rounded-lg bg-surface p-2" onSubmit={(e) => e.preventDefault()}>
						<div className="relative w-full sm:w-80">
							<Icon icon={Search01Icon} size={17} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted-foreground" />
							<Input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${total ? total.toLocaleString() : ""} prompts`} className="pl-10" aria-label="Search prompts" />
						</div>
						<OptionSelect aria-label="Category" value={search.category || ""} onValueChange={(v) => setFilter({ category: v })} emptyLabel="All categories" options={categories.map((c) => ({ value: c, label: c }))} className="w-[12.5rem]" />
						<OptionSelect aria-label="Access" value={search.access || ""} onValueChange={(v) => setFilter({ access: v })} emptyLabel="Any access" options={[{ value: "free", label: "Free samples" }, { value: "premium", label: "Premium" }]} className="w-[12rem]" />
						<OptionSelect aria-label="Sort" value={search.sort || ""} onValueChange={(v) => setFilter({ sort: v })} emptyLabel="Newest" options={[{ value: "az", label: "A to Z" }, { value: "long", label: "Longest first" }]} className="w-[12rem]" />
						{active ? (
							<Button type="button" variant="secondary" onClick={() => (setQ(""), setShown(PAGE), navigate({ to: "/gallery", search: {}, replace: true }))}>
								<Icon icon={Cancel01Icon} size={15} /> Clear
							</Button>
						) : null}
						<VideoToggle />
					</form>
				</div>

				<p className="px-1 py-3 text-lg" aria-live="polite">
					{gallery.isLoading ? "Loading prompts…" : `${list.length.toLocaleString()} ${list.length === 1 ? "prompt" : "prompts"}${active ? ` of ${total.toLocaleString()}` : ""}. `}
					{!isPro && gallery.data ? <Link to="/pricing" className="underline decoration-field-1 decoration-2 underline-offset-4">Unlock the full text of {(total - gallery.data.free).toLocaleString()} prompts from {fromLabel("USD")} a month.</Link> : isPro ? "Premium is unlocked." : null}
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
						{shown < list.length ? (
							<button type="button" onClick={() => setShown((n) => n + PAGE)} className="press tile mt-2 flex h-16 w-full items-center justify-center gap-2 text-lg font-medium hover:bg-tile-2">
								Show {Math.min(PAGE, list.length - shown)} more <span className="text-muted-foreground">· {(list.length - shown).toLocaleString()} left</span>
							</button>
						) : null}
					</>
				) : (
					<div className="tile p-10 text-center">
						<p className="statement">No prompts match those filters.</p>
						<Button className="mt-4" variant="secondary" onClick={() => (setQ(""), navigate({ to: "/gallery", search: {}, replace: true }))}>
							Clear filters
						</Button>
					</div>
				)}

				<p className="mx-auto mt-10 max-w-[60ch] px-1 text-center text-base">Prompts belong to the people who wrote them. We link to every original and remove a prompt on request. Email us from the contact page.</p>
			</div>

			{open ? <PromptDialog item={open} search={search} list={list} /> : null}
		</div>
	);
}
