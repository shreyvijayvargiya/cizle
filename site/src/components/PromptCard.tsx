import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { SaveButtons } from "@/components/SaveButtons";
import { isRtl, languageOf } from "@/lib/languages";
import { plain } from "@/lib/utils";
import { AutoVideo } from "@/lib/videos";
import type { GalleryFilters, GalleryItem } from "@/lib/gallery";

/** The demo plays in the card (muted, looping, while it is on screen). Its poster shows until it starts, and if it cannot play. */
function Poster({ item }: { item: GalleryItem }) {
	const [bad, setBad] = useState(false);
	const [videoBad, setVideoBad] = useState(false);
	const lang = languageOf(item.lang);
	const noPicture = !item.poster || bad;
	return (
		<div dir={isRtl(item.lang) ? "rtl" : "ltr"} className="relative flex aspect-[16/10] items-center justify-center overflow-hidden bg-field-3 text-field-3-ink">
			{!noPicture ? (
				<img src={item.poster!} alt="" loading="lazy" referrerPolicy="no-referrer" onError={() => setBad(true)} className="absolute inset-0 size-full object-cover" />
			) : (
				// no picture and no video: the card is the start of the prompt itself
				<p className="line-clamp-6 px-4 text-base leading-snug">{item.preview || item.category || "video prompt"}</p>
			)}
			{item.video && !videoBad ? <AutoVideo src={item.video} poster={item.poster} onFail={() => setVideoBad(true)} className="absolute inset-0 size-full object-cover" aria-label={`Demo video: ${item.title}`} /> : null}
			{item.lang && item.lang !== "en" ? <span className="absolute top-2.5 left-2.5 rounded-full bg-black/55 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-sm">{lang.flag} {lang.native}</span> : null}
		</div>
	);
}

/** A card is the video and nothing else. Title, creator, access and the prompt are in the dialog it opens. */
export function PromptCard({ item, search }: { item: GalleryItem; search: GalleryFilters; base?: "/" | "/gallery" }) {
	return (
		<article className="lift group/card relative h-full">
			<Link to="/prompts/$slug" params={{ slug: item.slug }} search={search as never} resetScroll={false} aria-label={plain(item.title)} className="group block h-full overflow-hidden rounded-lg bg-surface outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring">
				<Poster item={item} />
			</Link>
			<SaveButtons id={`p:${item.id}`} overlay />
		</article>
	);
}
