import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { Cancel01Icon, LockIcon, Search01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/Icon";
import { PromptCard } from "@/components/PromptCard";
import { PromptDialog } from "@/components/PromptDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/misc";
import { OptionSelect } from "@/components/ui/select";
import { useAuth } from "@/lib/auth";
import { priceLabel } from "@/lib/billing";
import { filterGallery, useGallery, useGalleryFuse, type GalleryFilters } from "@/lib/gallery";
import { useHead } from "@/lib/head";

const PAGE = 48;
const KEYS: (keyof GalleryFilters)[] = ["q", "category", "access", "sort"];

/** Community video prompts, each credited and linked to the original. A free sample in full; the rest open to subscribers. */
export function GalleryPage() {
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
	const open = search.p ? items?.find((g) => g.id === search.p) : undefined;

	useHead({
		enabled: !open,
		title: `Prompt gallery: ${total ? total.toLocaleString() : "1,000+"} Opus 5.5 video prompts, with credit | cizle`,
		description: "Browse real video prompts people made with Claude Opus 5.5: motion graphics, explainers, product videos and 3D. Each one credits its creator and links to the original post. Read a free sample, unlock the rest with Premium.",
		path: "/gallery",
	});

	const categories = (gallery.data?.categories || []).slice(0, 24);

	return (
		<div className="mx-auto w-full max-w-7xl px-4 pt-8 sm:px-6 sm:pt-10">
			<div className="max-w-3xl">
				<h1 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">Prompt gallery</h1>
				<p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
					{total ? `${total.toLocaleString()} real video prompts` : "Real video prompts"} that people made with Claude Opus 5.5. Every card credits its creator and links to the original post. Read {gallery.data?.free ?? "a few"} free samples in full; Premium unlocks the full text of the rest.
				</p>
			</div>

			<div className="sticky top-14 z-30 -mx-4 mt-6 border-b border-border bg-background/90 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
				<form role="search" aria-label="Filter prompts" className="flex flex-wrap items-center gap-2" onSubmit={(e) => e.preventDefault()}>
					<div className="relative w-full sm:w-72">
						<Icon icon={Search01Icon} size={15} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground" />
						<Input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${total ? total.toLocaleString() : ""} prompts…`} className="pl-9" aria-label="Search prompts" />
					</div>
					<OptionSelect aria-label="Category" value={search.category || ""} onValueChange={(v) => setFilter({ category: v })} emptyLabel="All categories" options={categories.map((c) => ({ value: c, label: c }))} className="w-[10.5rem]" />
					<OptionSelect aria-label="Access" value={search.access || ""} onValueChange={(v) => setFilter({ access: v })} emptyLabel="Any access" options={[{ value: "free", label: "Free samples" }, { value: "premium", label: "Premium" }]} className="w-[9.5rem]" />
					<OptionSelect aria-label="Sort" value={search.sort || ""} onValueChange={(v) => setFilter({ sort: v })} emptyLabel="Newest" options={[{ value: "az", label: "A to Z" }, { value: "long", label: "Longest first" }]} className="w-[9.5rem]" />
					{active ? (
						<Button type="button" variant="ghost" size="sm" onClick={() => (setQ(""), setShown(PAGE), navigate({ to: "/gallery", search: {}, replace: true }))}>
							<Icon icon={Cancel01Icon} size={13} /> Clear
						</Button>
					) : null}
				</form>
			</div>

			<div className="mt-5 flex items-center justify-between gap-3 text-sm text-muted-foreground" aria-live="polite">
				<p>{gallery.isLoading ? "Loading prompts…" : `${list.length.toLocaleString()} ${list.length === 1 ? "prompt" : "prompts"}${active ? ` of ${total.toLocaleString()}` : ""}`}</p>
				{!isPro && gallery.data ? (
					<Link to="/pricing" className="hidden items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs hover:bg-accent sm:inline-flex">
						<Icon icon={LockIcon} size={12} className="text-brand" /> Unlock the full text of {(total - gallery.data.free).toLocaleString()} prompts · {priceLabel("USD")}/mo
					</Link>
				) : isPro ? (
					<span className="text-xs text-brand">Premium unlocked</span>
				) : null}
			</div>

			{gallery.isLoading ? (
				<div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{Array.from({ length: 8 }).map((_, i) => (
						<Skeleton key={i} className="h-72" />
					))}
				</div>
			) : gallery.isError ? (
				<div className="mt-10 rounded-xl border border-border bg-surface p-8 text-center">
					<p className="font-medium">The gallery is not published yet.</p>
					<p className="mt-1 text-sm text-muted-foreground">Check your connection and try again.</p>
					<Button className="mt-4" onClick={() => gallery.refetch()}>
						Try again
					</Button>
				</div>
			) : list.length ? (
				<>
					<ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
						{list.slice(0, shown).map((g) => (
							<li key={g.id}>
								<PromptCard item={g} search={search} />
							</li>
						))}
					</ul>
					{shown < list.length ? (
						<div className="mt-8 text-center">
							<Button variant="outline" onClick={() => setShown((n) => n + PAGE)}>
								Show {Math.min(PAGE, list.length - shown)} more · {(list.length - shown).toLocaleString()} left
							</Button>
						</div>
					) : null}
				</>
			) : (
				<div className="mt-10 rounded-xl border border-dashed border-border p-10 text-center">
					<p className="font-medium">No prompts match those filters.</p>
					<Button className="mt-4" variant="outline" onClick={() => (setQ(""), navigate({ to: "/gallery", search: {}, replace: true }))}>
						Clear filters
					</Button>
				</div>
			)}

			<p className="mx-auto mt-10 max-w-2xl text-center text-xs text-muted-foreground">
				Prompts belong to the people who wrote them. We link to every original and remove a prompt on request. Email us from the contact page.
			</p>

			{open ? <PromptDialog item={open} search={search} /> : null}
		</div>
	);
}
