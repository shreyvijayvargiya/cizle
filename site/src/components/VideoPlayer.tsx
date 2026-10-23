import { useCallback, useEffect, useRef, useState } from "react";
import { PauseIcon, PlayIcon, VolumeHighIcon, VolumeMute01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/Icon";

const clock = (s: number) => (Number.isFinite(s) ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}` : "0:00");

/** Our own player: play/pause bottom left, the whole timeline across the middle, volume at the end. Starts muted and loops, like every other video here. */
export function VideoPlayer({ src, poster, label, onFail }: { src: string; poster?: string | null; label: string; onFail?: () => void }) {
	const ref = useRef<HTMLVideoElement>(null);
	const [playing, setPlaying] = useState(false);
	const [muted, setMuted] = useState(true);
	const [time, setTime] = useState(0);
	const [dur, setDur] = useState(0);

	useEffect(() => {
		const v = ref.current;
		if (!v) return;
		const sync = () => (setTime(v.currentTime), setDur(v.duration || 0), setPlaying(!v.paused));
		const evs = ["timeupdate", "loadedmetadata", "play", "pause", "durationchange"] as const;
		evs.forEach((e) => v.addEventListener(e, sync));
		v.play().catch(() => setPlaying(false));
		return () => evs.forEach((e) => v.removeEventListener(e, sync));
	}, [src]);

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
		<div className="group relative flex max-h-full max-w-full overflow-hidden rounded-xl bg-black">
			<video ref={ref} key={src} src={src} poster={poster || undefined} muted={muted} loop playsInline autoPlay preload="auto" aria-label={label} onClick={toggle} onError={onFail} className="block max-h-full max-w-full min-h-[min(60dvh,420px)] min-w-[min(60vw,300px)] cursor-pointer object-contain" />
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
				<button type="button" onClick={() => setMuted((m) => !m)} aria-label={muted ? "Unmute" : "Mute"} aria-pressed={!muted} className="grid size-8 shrink-0 place-items-center rounded-full outline-none hover:bg-white/15 focus-visible:ring-2 focus-visible:ring-white">
					<Icon icon={muted ? VolumeMute01Icon : VolumeHighIcon} size={18} />
				</button>
			</div>
		</div>
	);
}
