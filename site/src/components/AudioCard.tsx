import { Link } from "@tanstack/react-router";
import { MusicNote01Icon, PauseIcon, PlayIcon } from "@hugeicons/core-free-icons";
import { AudioViz, vizFor } from "@/components/AudioViz";
import { Icon } from "@/components/Icon";
import { engine, fmtTime, KIND_LABEL, useEngine, type AudioFilters, type AudioItem } from "@/lib/audio";

/** The round play/pause toggle used on cards and in the dialog. One clip plays at a time; pressing another moves the sound there. */
export function PlayButton({ item, size = "md" }: { item: AudioItem; size?: "md" | "lg" }) {
	const s = useEngine();
	const on = s.id === item.id && s.playing;
	return (
		<button type="button" aria-label={on ? `Pause ${item.title}` : `Play ${item.title}`} aria-pressed={on} onClick={(e) => (e.preventDefault(), e.stopPropagation(), engine.toggle(item))} className={`press play-btn grid shrink-0 place-items-center rounded-full bg-field-1 text-field-1-ink shadow-md outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${size === "lg" ? "size-16" : "size-12"}`}>
			<Icon icon={on ? PauseIcon : PlayIcon} size={size === "lg" ? 26 : 20} strokeWidth={0} className="fill-current" />
		</button>
	);
}

/** A clip card: the picture that moves with its sound, a play/pause toggle, the name and what it is. The card opens the dialog; the toggle only plays. */
export function AudioCard({ item, search }: { item: AudioItem; search: AudioFilters }) {
	const s = useEngine();
	const mine = s.id === item.id;
	const on = mine && s.playing;
	return (
		<article className="lift card-in group/card relative h-full">
			<Link to="/audio/$slug" params={{ slug: item.slug }} search={search as never} resetScroll={false} aria-label={`Open ${item.title}`} className="group block h-full overflow-hidden rounded-lg bg-surface outline-none focus-visible:ring-2 focus-visible:ring-ring">
				<div className="relative aspect-[16/10] overflow-hidden bg-field-3 text-field-3-ink">
					<AudioViz variant={vizFor(item.id)} live={on} playing={on} seed={item.id} className="p-3" />
					<span className="absolute top-2.5 left-2.5 inline-flex items-center gap-1 rounded-full bg-black/55 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-sm"><Icon icon={MusicNote01Icon} size={12} /> {KIND_LABEL[item.kind]}</span>
					<span className="tabular absolute top-2.5 right-2.5 rounded-full bg-black/55 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-sm">{mine && s.duration ? `${fmtTime(s.time)} / ${fmtTime(item.duration)}` : fmtTime(item.duration)}</span>
					{mine ? <span aria-hidden className="absolute inset-x-0 bottom-0 h-1 bg-black/15"><span className="block h-full origin-left bg-field-1" style={{ transform: `scaleX(${Math.min(1, s.time / Math.max(1, Math.min(item.duration, 90)))})` }} /></span> : null}
				</div>
				<div className="px-3.5 pt-3 pb-3.5 pl-[4.75rem]">
					<h3 className="line-clamp-2 text-base leading-snug font-medium tracking-[-0.01em] [overflow-wrap:anywhere]">{item.title}</h3>
					<p className="mt-0.5 truncate text-sm text-muted-foreground">{item.tags.slice(0, 3).join(" · ")}</p>
				</div>
			</Link>
			<div className="absolute bottom-3 left-3"><PlayButton item={item} /></div>
		</article>
	);
}
