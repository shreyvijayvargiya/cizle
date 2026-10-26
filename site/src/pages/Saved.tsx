import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Bookmark01Icon, FavouriteIcon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/Icon";
import { PromptCard } from "@/components/PromptCard";
import { SkillCard } from "@/components/SkillCard";
import { Skeleton } from "@/components/ui/misc";
import { useAuth } from "@/lib/auth";
import { useSkills } from "@/lib/data";
import { useGallery } from "@/lib/gallery";
import { useHead } from "@/lib/head";
import { useSaved, type SaveKind } from "@/lib/saved";
import type { GalleryItem } from "@/lib/gallery";
import type { SkillMeta } from "@/lib/data";
import { cn } from "@/lib/utils";

type Entry = { type: "prompt"; id: string; prompt: GalleryItem } | { type: "skill"; id: string; skill: SkillMeta };

const TABS: { kind: SaveKind; label: string; icon: typeof FavouriteIcon; empty: string }[] = [
	{ kind: "like", label: "Liked", icon: FavouriteIcon, empty: "Nothing liked yet. Tap the heart on a card to keep it here." },
	{ kind: "bookmark", label: "Bookmarked", icon: Bookmark01Icon, empty: "Nothing bookmarked yet. Tap the bookmark on a card to find it again here." },
];

/** What this member liked and bookmarked: the same cards as the library, from the ids kept in this browser for this account. */
export function SavedPage() {
	const { user } = useAuth();
	const saved = useSaved();
	const gallery = useGallery();
	const skills = useSkills();
	const [tab, setTab] = useState<SaveKind>("like");
	useHead({ title: "Saved prompts and skills | cizle", description: "The prompts and skills you liked or bookmarked.", path: "/saved" });

	const counts = { like: saved.list("like").length, bookmark: saved.list("bookmark").length };
	const entries = useMemo((): Entry[] => {
		const ids = saved.list(tab).reverse(); // newest first
		const byPrompt = new Map((gallery.data?.items ?? []).map((g) => [g.id, g]));
		const bySkill = new Map((skills.data?.skills ?? []).map((s) => [s.slug, s]));
		const out: Entry[] = [];
		for (const id of ids) {
			const [kind, ...rest] = id.split(":");
			const key = rest.join(":");
			const p = kind === "p" ? byPrompt.get(key) : undefined;
			const sk = kind === "s" ? bySkill.get(key) : undefined;
			if (p) out.push({ type: "prompt", id, prompt: p });
			else if (sk) out.push({ type: "skill", id, skill: sk });
		}
		return out;
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [saved.list, tab, gallery.data, skills.data, counts.like, counts.bookmark]);
	const loading = gallery.isLoading || skills.isLoading;
	const current = TABS.find((t) => t.kind === tab)!;

	return (
		<div className="board pt-6 pb-4">
			<div className="board-w">
				<div className="reveal flex flex-wrap items-end justify-between gap-x-10 gap-y-5">
					<h1 className="display" style={{ fontSize: "clamp(2.75rem, 8vw, 7.5rem)" }}>
						Saved
					</h1>
					<p className="max-w-[46ch] pb-2 text-lg leading-snug">
						{counts.like + counts.bookmark ? `${counts.like} liked and ${counts.bookmark} bookmarked` : "Your liked and bookmarked prompts and skills"}.{" "}
						{user ? "Kept for your account on this device." : <>Kept on this device. <Link to="/login" search={{}} className="underline decoration-field-1 decoration-2 underline-offset-4">Sign in</Link> to keep them with your account.</>}
					</p>
				</div>

				<div role="tablist" aria-label="Saved" className="mt-8 flex gap-2">
					{TABS.map((t) => (
						<button key={t.kind} role="tab" type="button" aria-selected={tab === t.kind} onClick={() => setTab(t.kind)} className={cn("press inline-flex h-11 items-center gap-2 rounded-lg px-4 text-base font-medium transition-colors", tab === t.kind ? "bg-primary text-primary-foreground" : "bg-surface hover:bg-tile-2")}>
							<Icon icon={t.icon} size={17} className={cn(tab === t.kind && "[&_path]:fill-current")} /> {t.label} <span className="opacity-70 tabular-nums">{counts[t.kind]}</span>
						</button>
					))}
				</div>

				<div className="mt-2">
					{loading ? (
						<div className="grid grid-cols-[minmax(0,1fr)] gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-80" />)}</div>
					) : entries.length ? (
						<ul className="grid grid-cols-[minmax(0,1fr)] gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
							{entries.map((e) => (
								<li key={e.id}>{e.type === "prompt" ? <PromptCard item={e.prompt} search={{}} /> : <SkillCard skill={e.skill} search={{}} />}</li>
							))}
						</ul>
					) : (
						<div className="tile p-10 text-center">
							<p className="statement">{current.empty}</p>
							<Link to="/gallery" className="press mt-4 inline-flex h-11 items-center rounded-lg bg-primary px-5 text-base font-medium text-primary-foreground hover:bg-primary/85">Browse the gallery</Link>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
