import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { plain } from "@/lib/utils";
import { AutoVideo } from "@/lib/videos";
import type { GalleryFilters, GalleryItem } from "@/lib/gallery";

/** The demo plays in the card (muted, looping, while it is on screen). Its poster shows until it starts, and if it cannot play. */
function Poster({ item }: { item: GalleryItem }) {
	const [bad, setBad] = useState(false);
	const [videoBad, setVideoBad] = useState(false);
	return (
		<div className="relative flex aspect-[16/10] items-center justify-center overflow-hidden bg-field-3 text-field-3-ink">
			{item.poster && !bad ? <img src={item.poster} alt="" loading="lazy" referrerPolicy="no-referrer" onError={() => setBad(true)} className="absolute inset-0 size-full object-cover" /> : <span className="px-4 text-center text-base">{item.category || "video prompt"}</span>}
			{item.video && !videoBad ? <AutoVideo src={item.video} poster={item.poster} onFail={() => setVideoBad(true)} className="absolute inset-0 size-full object-cover" aria-label={`Demo video: ${item.title}`} /> : null}
		</div>
	);
}

export function PromptCard({ item, search, base = "/gallery" }: { item: GalleryItem; search: GalleryFilters; base?: "/" | "/gallery" }) {
	return (
		<article className="lift h-full">
			<Link to={base} search={{ ...search, p: item.id } as never} resetScroll={false} className="group flex h-full flex-col overflow-hidden rounded-lg bg-surface outline-none transition-colors hover:bg-tile-2 focus-visible:ring-2 focus-visible:ring-ring">
				<Poster item={item} />
				<div className="flex flex-1 flex-col p-4">
					<h3 className="text-xl leading-tight tracking-[-0.03em]">{plain(item.title)}</h3>
					<p className="mt-1 text-base text-muted-foreground">by {item.handle ? `@${item.handle}` : item.author || "the creator"}</p>
					<p className="mt-3 line-clamp-3 text-base leading-snug">{plain(item.preview)}</p>
					<p className="mt-auto pt-4 text-base">
						<span className={item.tier === "premium" ? "font-semibold" : "font-semibold text-brand-ink"}>{item.tier === "premium" ? "Premium" : "Free"}</span>
						<span className="text-muted-foreground">
							{item.category ? ` · ${item.category}` : ""}
							{item.translatedFrom ? " · translated" : ""}
						</span>
					</p>
				</div>
			</Link>
		</article>
	);
}
