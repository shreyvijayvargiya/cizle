import { useEffect, useRef, useState } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { Cancel01Icon, PauseIcon, PlayIcon, VolumeHighIcon, VolumeMute01Icon } from "@hugeicons/core-free-icons";
import { AudioViz, vizFor } from "@/components/AudioViz";
import { Icon } from "@/components/Icon";
import { engine, fmtTime, useEngine } from "@/lib/audio";
import { setMiniVideo, setResume, useMiniVideo } from "@/lib/mini";
import { isDirectBlocked, viaProxy } from "@/lib/videos";

const shell = "mini-in fixed right-3 bottom-3 z-40 flex w-[min(21rem,calc(100vw-1.5rem))] overflow-hidden rounded-2xl bg-background shadow-e3 sm:right-4 sm:bottom-4";
const iconBtn = "press grid size-9 shrink-0 place-items-center rounded-full outline-none hover:bg-tile-2 focus-visible:ring-2 focus-visible:ring-ring";

/**
 * What is playing stays on screen when its dialog is closed, bottom right, like YouTube's mini player: a clip's picture or a video, its name,
 * play/pause and close. Pressing the picture or the name opens the dialog again where it was. Audio and video never show together.
 */
export function MiniPlayer() {
	const video = useMiniVideo();
	const audio = useEngine();
	const path = useRouterState({ select: (s) => s.location.pathname });
	const search = useRouterState({ select: (s) => s.location.search });
	if (video) return <MiniVideoPlayer key={video.src} />;
	const item = audio.item;
	// the dialog of this clip is open: it is the player, no second one
	if (!item || path === `/audio/${item.slug}`) return null;
	const on = audio.playing;
	const limit = Math.max(1, Math.min(item.duration, 90));
	return <MiniAudioShell title={item.title} slug={item.slug} search={search} id={item.id} on={on} time={audio.time} limit={limit} onToggle={() => engine.toggle(item)} />;
}

function MiniAudioShell({ title, slug, search, id, on, time, limit, onToggle }: { title: string; slug: string; search: object; id: string; on: boolean; time: number; limit: number; onToggle: () => void }) {
	const navigate = useNavigate();
	const open = () => navigate({ to: "/audio/$slug", params: { slug }, search: search as never, resetScroll: false });
	return (
		<aside aria-label="Now playing" className={shell}>
			<button type="button" onClick={open} aria-label={`Open ${title}`} className="relative block h-[4.5rem] w-28 shrink-0 bg-field-3 text-field-3-ink outline-none focus-visible:ring-2 focus-visible:ring-ring">
				<AudioViz variant={vizFor(id)} live={on} playing={on} seed={id} className="p-1.5" />
			</button>
			<div className="flex min-w-0 flex-1 items-center gap-1 pr-1 pl-3">
				<button type="button" onClick={open} className="min-w-0 flex-1 py-2 text-left outline-none focus-visible:underline">
					<span className="block truncate text-sm font-medium">{title}</span>
					<span className="tabular block truncate text-xs text-muted-foreground">{fmtTime(time)} / {fmtTime(limit)}</span>
				</button>
				<button type="button" aria-label={on ? "Pause" : "Play"} aria-pressed={on} onClick={onToggle} className={iconBtn}><Icon icon={on ? PauseIcon : PlayIcon} size={18} strokeWidth={0} className="fill-current" /></button>
				<button type="button" aria-label="Close player" onClick={() => engine.stop()} className={iconBtn}><Icon icon={Cancel01Icon} size={16} /></button>
			</div>
			<span aria-hidden className="absolute inset-x-0 bottom-0 h-0.5 bg-tile-2"><span className="block h-full origin-left bg-field-1" style={{ transform: `scaleX(${Math.min(1, time / limit)})` }} /></span>
		</aside>
	);
}

/** the video of a closed dialog, carried on from the moment it was closed (with its mute choice) */
function MiniVideoPlayer() {
	const v = useMiniVideo()!;
	const navigate = useNavigate();
	const ref = useRef<HTMLVideoElement>(null);
	const [playing, setPlaying] = useState(true);
	const [muted, setMuted] = useState(v.muted);
	const [time, setTime] = useState(v.time);
	const [dur, setDur] = useState(0);
	useEffect(() => {
		const el = ref.current; if (!el) return;
		const at = v.time;
		el.addEventListener("loadedmetadata", () => { el.currentTime = at; el.play().catch(() => setPlaying(false)); }, { once: true });
		const sync = () => (setTime(el.currentTime), setDur(el.duration || 0), setPlaying(!el.paused));
		(["timeupdate", "play", "pause", "durationchange"] as const).forEach((e) => el.addEventListener(e, sync));
		return () => (["timeupdate", "play", "pause", "durationchange"] as const).forEach((e) => el.removeEventListener(e, sync));
	}, [v]);
	useEffect(() => { if (ref.current) ref.current.muted = muted; }, [muted]);
	const open = () => {
		setResume({ src: v.src, time: ref.current?.currentTime ?? v.time });
		setMiniVideo(null);
		navigate({ to: "/prompts/$slug", params: { slug: v.slug }, search: v.search as never, resetScroll: false });
	};
	return (
		<aside aria-label="Now playing" className={`${shell} flex-col`}>
			<div className="relative aspect-video w-full bg-black">
				<video ref={ref} src={isDirectBlocked() && viaProxy(v.src) !== v.src ? viaProxy(v.src) : v.src} poster={v.poster || undefined} muted={muted} loop playsInline preload="auto" aria-label={`Video: ${v.title}`} onClick={open} className="size-full cursor-pointer object-contain" />
				<button type="button" onClick={() => setMuted((m) => !m)} aria-label={muted ? "Unmute" : "Mute"} aria-pressed={!muted} className="absolute top-2 left-2 grid size-8 place-items-center rounded-full bg-black/55 text-white outline-none backdrop-blur hover:bg-black/70 focus-visible:ring-2 focus-visible:ring-ring"><Icon icon={muted ? VolumeMute01Icon : VolumeHighIcon} size={16} /></button>
				<span aria-hidden className="absolute inset-x-0 bottom-0 h-0.5 bg-white/30"><span className="block h-full origin-left bg-white" style={{ transform: `scaleX(${dur ? Math.min(1, time / dur) : 0})` }} /></span>
			</div>
			<div className="flex items-center gap-1 py-1 pr-1 pl-3">
				<button type="button" onClick={open} className="min-w-0 flex-1 py-1.5 text-left outline-none focus-visible:underline"><span className="block truncate text-sm font-medium">{v.title}</span></button>
				<button type="button" aria-label={playing ? "Pause" : "Play"} aria-pressed={playing} onClick={() => { const el = ref.current; if (el) el.paused ? el.play().catch(() => {}) : el.pause(); }} className={iconBtn}><Icon icon={playing ? PauseIcon : PlayIcon} size={18} strokeWidth={0} className="fill-current" /></button>
				<button type="button" aria-label="Close player" onClick={() => setMiniVideo(null)} className={iconBtn}><Icon icon={Cancel01Icon} size={16} /></button>
			</div>
		</aside>
	);
}
