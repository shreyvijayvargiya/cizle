import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowShrink02Icon, FullScreenIcon, PauseIcon, PlayIcon, SidebarRightIcon, VolumeHighIcon, VolumeLowIcon, VolumeMute01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/Icon";
import { setMiniVideo, takeResume } from "@/lib/mini";
import { engine } from "@/lib/audio";
import { isDirectBlocked, markDirectBlocked, viaProxy } from "@/lib/videos";

const tb = "grid size-8 shrink-0 place-items-center rounded-full outline-none hover:bg-white/15 focus-visible:ring-2 focus-visible:ring-white";
const clock = (s: number) => (Number.isFinite(s) ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}` : "0:00");

/** Our own player: play/pause bottom left, the whole timeline across the middle, volume at the end. Starts muted and loops, like every other video here. */
export function VideoPlayer({ src: first, poster, label, onFail, postUrl, mini, fill, fullscreen, onFullscreen, onDrawer, drawerOpen }: { src: string; poster?: string | null; label: string; onFail?: () => void; postUrl?: string | null; mini?: { title: string; slug: string; search: object }; /** fill the space (full screen) instead of the video's own size */ fill?: boolean; fullscreen?: boolean; onFullscreen?: () => void; /** shows the button that opens the details drawer */ onDrawer?: () => void; drawerOpen?: boolean }) {
	const [src, setSrc] = useState(first);
	const resolved = useRef(false);
	const ref = useRef<HTMLVideoElement>(null);
	const tries = useRef(0);
	const [proxied, setProxied] = useState(() => isDirectBlocked() && viaProxy(first) !== first);
	const [loading, setLoading] = useState(true);
	const [playing, setPlaying] = useState(false);
	const [muted, setMuted] = useState(true);
	const [volume, setVolume] = useState(1);
	const [time, setTime] = useState(0);
	const [dur, setDur] = useState(0);
	// what the mini player needs when this dialog closes while the video is playing
	const last = useRef({ time: 0, paused: true, muted: true, src: first });
	const alive = useRef(true);
	useEffect(() => { alive.current = true; setMiniVideo(null); return () => {
		alive.current = false;
		const l = last.current;
		// StrictMode unmounts and remounts at once: only hand over if it really stayed unmounted
		setTimeout(() => { if (!alive.current && mini && !l.paused) { engine.pause(); setMiniVideo({ src: l.src, poster, title: mini.title, slug: mini.slug, search: mini.search, time: l.time, muted: l.muted }); } }, 0);
	}; }, []); // eslint-disable-line react-hooks/exhaustive-deps

	useEffect(() => {
		const v = ref.current;
		if (!v) return;
		tries.current = 0;
		setLoading(true);
		const sync = () => (setTime(v.currentTime), setDur(v.duration || 0), setPlaying(!v.paused), (last.current = { time: v.currentTime, paused: v.paused, muted: v.muted, src }));
		const at = takeResume(first);
		if (at) v.addEventListener("loadedmetadata", () => { v.currentTime = at; }, { once: true });
		const ready = () => setLoading(false);
		const evs = ["timeupdate", "loadedmetadata", "play", "pause", "durationchange"] as const;
		evs.forEach((e) => v.addEventListener(e, sync));
		["loadeddata", "canplay", "playing"].forEach((e) => v.addEventListener(e, ready));
		v.addEventListener("waiting", () => setLoading(true));
		v.play().catch(() => setPlaying(false));
		// nothing arrived after a while: try once more, then hand over to the fallback (the post's own player)
		const watch = window.setTimeout(() => v.readyState < 2 && retry(), 9000);
		return () => (clearTimeout(watch), evs.forEach((e) => v.removeEventListener(e, sync)), ["loadeddata", "canplay", "playing"].forEach((e) => v.removeEventListener(e, ready)));
	}, [src, proxied]);

	useEffect(() => {
		setSrc(first);
		resolved.current = false;
	}, [first]);
	useEffect(() => setProxied(isDirectBlocked() && viaProxy(src) !== src), [src]);

	/** A failed or stalled load: reload once (a dropped connection is common), then give up so the caller can show the fallback. */
	const retry = useCallback(() => {
		const v = ref.current;
		if (!v) return onFail?.();
		// second failure: the same file through our own server, then hand over to the post's player
		if (tries.current >= 1) {
			if (!proxied && viaProxy(src) !== src) return (tries.current = 0, markDirectBlocked(), setProxied(true));
			// still nothing: ask the server to read the post again for a working mp4 (one try), then hand over to the post's own player
			if (postUrl && !resolved.current) {
				resolved.current = true;
				fetch(`/api/vid/resolve?post=${encodeURIComponent(postUrl)}`)
					.then((r) => (r.ok ? r.json() : Promise.reject()))
					.then((j: { video?: string }) => (j.video && j.video !== src ? (tries.current = 0, setLoading(true), setProxied(isDirectBlocked()), setSrc(j.video)) : onFail?.()))
					.catch(() => onFail?.());
				return;
			}
			return onFail?.();
		}
		tries.current++;
		setLoading(true);
		v.load();
		v.play().catch(() => {});
	}, [onFail, postUrl, proxied, src]);

	// React sets `muted` only when the element is created, so keep the property in step with the button
	useEffect(() => {
		if (ref.current) ref.current.muted = muted;
	}, [muted]);
	useEffect(() => {
		if (ref.current) ref.current.volume = volume;
	}, [volume, src]);
	/** the slider sets the volume; moving it up from silence turns the sound on, taking it to 0 mutes */
	const setVol = (e: React.ChangeEvent<HTMLInputElement>) => { const x = Number(e.target.value) / 100; setVolume(x); setMuted(x === 0); };

	const toggle = useCallback(() => {
		const v = ref.current;
		if (v) v.paused ? v.play().catch(() => {}) : v.pause();
	}, []);
	const seek = (e: React.ChangeEvent<HTMLInputElement>) => {
		const v = ref.current;
		if (v && dur) v.currentTime = (Number(e.target.value) / 1000) * dur;
	};
	const pct = dur ? (time / dur) * 100 : 0;

	return (
		<div className={fill ? "group relative size-full overflow-hidden bg-black" : "group relative flex max-h-full max-w-full overflow-hidden rounded-xl bg-black"}>
			<video ref={ref} key={src} src={proxied ? viaProxy(src) : src} poster={poster || undefined} muted={muted} loop playsInline autoPlay preload="auto" aria-label={label} onClick={toggle} onError={retry} className={fill ? "block size-full cursor-pointer object-contain" : "block max-h-full max-w-full min-h-[min(60dvh,420px)] min-w-[min(60vw,300px)] cursor-pointer object-contain"} />
			{loading ? <span role="status" className="pointer-events-none absolute inset-0 grid place-items-center text-sm text-white/80">Loading video…</span> : null}
			<div className="absolute inset-x-0 bottom-0 flex items-center gap-3 bg-gradient-to-t from-black/70 to-transparent px-4 pt-10 pb-3 text-white">
				<button type="button" onClick={toggle} aria-label={playing ? "Pause" : "Play"} className="grid size-8 shrink-0 place-items-center rounded-full outline-none hover:bg-white/15 focus-visible:ring-2 focus-visible:ring-white">
					<Icon icon={playing ? PauseIcon : PlayIcon} size={18} />
				</button>
				<input
					type="range"
					min={0}
					max={1000}
					value={dur ? Math.round((time / dur) * 1000) : 0}
					onChange={seek}
					aria-label="Timeline"
					aria-valuetext={`${clock(time)} of ${clock(dur)}`}
					className="h-1 min-w-0 flex-1 cursor-pointer appearance-none rounded-full outline-none [&::-moz-range-thumb]:size-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-white [&::-webkit-slider-thumb]:size-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
					style={{ background: `linear-gradient(to right, #fff ${pct}%, rgba(255,255,255,.35) ${pct}%)` }}
				/>
				<button type="button" onClick={() => (muted && volume === 0 ? (setVolume(0.6), setMuted(false)) : setMuted((m) => !m))} aria-label={muted ? "Unmute" : "Mute"} aria-pressed={!muted} className={tb}>
					<Icon icon={muted || volume === 0 ? VolumeMute01Icon : volume < 0.5 ? VolumeLowIcon : VolumeHighIcon} size={18} />
				</button>
				<input type="range" min={0} max={100} value={muted ? 0 : Math.round(volume * 100)} onChange={setVol} aria-label="Volume" className="vol hidden h-1 w-20 shrink-0 cursor-pointer appearance-none rounded-full outline-none sm:block" style={{ background: `linear-gradient(to right, #fff ${muted ? 0 : volume * 100}%, rgba(255,255,255,.35) ${muted ? 0 : volume * 100}%)` }} />
				{onDrawer ? (
					<button type="button" onClick={onDrawer} aria-label={drawerOpen ? "Hide details" : "Show details"} aria-pressed={drawerOpen} className={`${tb} ${drawerOpen ? "bg-white/20" : ""}`}><Icon icon={SidebarRightIcon} size={18} /></button>
				) : null}
				{onFullscreen ? (
					<button type="button" onClick={onFullscreen} aria-label={fullscreen ? "Exit full screen" : "Full screen"} aria-pressed={fullscreen} className={tb}><Icon icon={fullscreen ? ArrowShrink02Icon : FullScreenIcon} size={18} /></button>
				) : null}
			</div>
		</div>
	);
}
