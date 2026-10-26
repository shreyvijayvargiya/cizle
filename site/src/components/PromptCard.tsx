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

/** A card is the video and nothing else. Title, creator, access and the prompt are in the dialog it opens. */
export function PromptCard({ item, search }: { item: GalleryItem; search: GalleryFilters; base?: "/" | "/gallery" }) {
	return (
		<article className="lift h-full">
			<Link to="/prompts/$slug" params={{ slug: item.slug }} search={search as never} resetScroll={false} aria-label={plain(item.title)} className="group block h-full overflow-hidden rounded-lg bg-surface outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring">
				<Poster item={item} />
			</Link>
		</article>
	);
}
