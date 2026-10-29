import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { SaveButtons } from "@/components/SaveButtons";
import { useGate } from "@/lib/gate";
import { isRtl, languageOf } from "@/lib/languages";
import { plain } from "@/lib/utils";
import { AutoVideo } from "@/lib/videos";
import type { GalleryFilters, GalleryItem } from "@/lib/gallery";

/** The demo plays in the card (muted, looping, while it is on screen). Its poster shows until it starts, and if it cannot play. */
/** shape (width / height) of each picture or video, learned when it loads, so the gallery can show vertical ones tall and wide ones wide */
const shapes = new Map<string, number>();
function Poster({ item, natural }: { item: GalleryItem; natural?: boolean }) {
	const [shape, setShape] = useState(() => shapes.get(item.id));
	const learn = (w: number, h: number) => {
		if (!natural || !w || !h) return;
		const r = Math.min(2, Math.max(0.5, w / h));
		if (!shapes.has(item.id)) (shapes.set(item.id, r), setShape(r));
	};
	const [bad, setBad] = useState(false);
	const [videoBad, setVideoBad] = useState(false);
	const lang = languageOf(item.lang);
	const noPicture = !item.poster || bad;
	return (
		<div dir={isRtl(item.lang) ? "rtl" : "ltr"} style={natural ? { aspectRatio: shape ?? 4 / 5 } : undefined} className={`relative flex ${natural ? "" : "aspect-[16/10]"} items-center justify-center overflow-hidden bg-field-3 text-field-3-ink`}>
			{!noPicture ? (
				<img ref={(el) => { if (el?.complete) learn(el.naturalWidth, el.naturalHeight); }} src={item.poster!} alt="" loading="lazy" referrerPolicy="no-referrer" onLoad={(e) => learn(e.currentTarget.naturalWidth, e.currentTarget.naturalHeight)} onError={() => setBad(true)} className="absolute inset-0 size-full object-cover" />
			) : (
				// no picture and no video: the card is the start of the prompt itself
				<p className="line-clamp-6 px-4 text-base leading-snug [overflow-wrap:anywhere]">{item.preview || item.category || "video prompt"}</p>
			)}
			{item.video && !videoBad ? <AutoVideo src={item.video} poster={item.poster} onFail={() => setVideoBad(true)} onLoadedMetadata={(e) => learn(e.currentTarget.videoWidth, e.currentTarget.videoHeight)} className="absolute inset-0 size-full object-cover" aria-label={`Demo video: ${item.title}`} /> : null}
			{item.lang && item.lang !== "en" ? <span className="absolute top-2.5 left-2.5 rounded-full bg-black/55 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-sm">{lang.flag} {lang.native}</span> : null}
		</div>
	);
}

/** A card is the video and nothing else. Title, creator, access and the prompt are in the dialog it opens. */
export function PromptCard({ item, search, inSearch, natural }: { item: GalleryItem; search: GalleryFilters; natural?: boolean; base?: "/" | "/gallery"; inSearch?: string }) {
	const { locked, openGate } = useGate();
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const lp: any = inSearch !== undefined ? { to: "/search", search: { q: inSearch || undefined, p: item.slug } } : { to: "/prompts/$slug", params: { slug: item.slug }, search };
	return (
		<article className={`lift card-in group/card relative ${natural ? "" : "h-full"}`}>
			<Link {...lp} resetScroll={false} onClick={(e) => { if (locked) { e.preventDefault(); openGate("open this prompt"); } }} aria-label={plain(item.title)} className={`group block ${natural ? "" : "h-full"} overflow-hidden rounded-lg bg-surface outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring`}>
				<Poster item={item} natural={natural} />
			</Link>
			<SaveButtons id={`p:${item.id}`} overlay />
		</article>
	);
}
