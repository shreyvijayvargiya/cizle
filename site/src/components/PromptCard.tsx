import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { LockIcon, PlayIcon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/Icon";
import { Badge } from "@/components/ui/badge";
import type { GalleryFilters, GalleryItem } from "@/lib/gallery";

/** Poster from the creator's own post. Hidden if it fails to load, so a card never shows a broken image. */
function Poster({ item }: { item: GalleryItem }) {
	const [bad, setBad] = useState(false);
	return (
		<div className="relative flex aspect-[16/10] items-center justify-center overflow-hidden rounded-lg border border-border bg-muted">
			{item.poster && !bad ? <img src={item.poster} alt="" loading="lazy" referrerPolicy="no-referrer" onError={() => setBad(true)} className="absolute inset-0 size-full object-cover" /> : <span className="px-4 text-center text-xs text-muted-foreground">{item.category || "video prompt"}</span>}
			{item.hasVideo ? <span className="absolute right-2 bottom-2 grid size-6 place-items-center rounded-full bg-black/55 text-white"><Icon icon={PlayIcon} size={12} /></span> : null}
		</div>
	);
}

export function PromptCard({ item, search }: { item: GalleryItem; search: GalleryFilters }) {
	return (
		<article className="group relative flex h-full flex-col rounded-xl border border-border bg-surface p-3 transition-colors hover:border-foreground/25 hover:bg-accent/40">
			<Poster item={item} />
			<div className="mt-3 flex items-start justify-between gap-2">
				<h3 className="text-sm font-semibold tracking-tight">
					<Link to="/gallery" search={{ ...search, p: item.id }} resetScroll={false} className="after:absolute after:inset-0 after:rounded-xl focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-ring">
						{item.title}
					</Link>
				</h3>
				{item.tier === "premium" ? (
					<Badge tone="warning" className="shrink-0">
						<Icon icon={LockIcon} size={11} /> Pro
					</Badge>
				) : (
					<Badge tone="success" className="shrink-0">
						Free
					</Badge>
				)}
			</div>
			<p className="mt-1 text-xs text-muted-foreground">by {item.handle ? `@${item.handle}` : item.author || "the creator"}</p>
			<p className="mt-2 line-clamp-3 text-[13px] leading-relaxed text-muted-foreground">{item.preview}</p>
			<div className="mt-auto flex flex-wrap gap-1.5 pt-3">
				{item.category ? <Badge tone="outline">{item.category}</Badge> : null}
				{item.model ? <Badge tone="outline">{item.model}</Badge> : null}
			</div>
		</article>
	);
}
