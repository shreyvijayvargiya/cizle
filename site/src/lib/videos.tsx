import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode, type VideoHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/**
 * Videos are the point of the site, so every demo plays by default, muted and looping, and one switch (in the search row) pauses or plays them all.
 * Only the videos on screen play, and at most MAX_PLAYING at a time (the ones nearest the middle of the screen), so a page of 48 cards stays light.
 * The choice is remembered; with "reduce motion" set in the system, videos start paused.
 */
const MAX_PLAYING = 8;
const KEY = "cizle-videos";

type Ctx = { playing: boolean; toggle: () => void };
const VideoCtx = createContext<Ctx>({ playing: true, toggle: () => {} });
export const useVideoPlayback = () => useContext(VideoCtx);

type Entry = { el: HTMLVideoElement; priority: boolean };
const visible = new Map<HTMLVideoElement, Entry>();
let playingAll = true;

function rebalance() {
	const mid = window.innerHeight / 2;
	const list = [...visible.values()].sort((a, b) => Number(b.priority) - Number(a.priority) || Math.abs(center(a.el) - mid) - Math.abs(center(b.el) - mid));
	list.forEach((e, i) => {
		if (playingAll && i < MAX_PLAYING) e.el.play().catch(() => {});
		else e.el.pause();
	});
}
const center = (el: HTMLElement) => {
	const r = el.getBoundingClientRect();
	return r.top + r.height / 2;
};

export function VideoProvider({ children }: { children: ReactNode }) {
	const [playing, setPlaying] = useState(() => {
		try {
			const saved = localStorage.getItem(KEY);
			if (saved) return saved === "play";
		} catch {
			/* private mode */
		}
		return !(typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches);
	});
	useEffect(() => {
		playingAll = playing;
		rebalance();
		try {
			localStorage.setItem(KEY, playing ? "play" : "pause");
		} catch {
			/* ignore */
		}
	}, [playing]);
	useEffect(() => {
		let t = 0;
		const onScroll = () => {
			clearTimeout(t);
			t = window.setTimeout(rebalance, 120);
		};
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, []);
	const toggle = useCallback(() => setPlaying((p) => !p), []);
	const value = useMemo(() => ({ playing, toggle }), [playing, toggle]);
	return <VideoCtx.Provider value={value}>{children}</VideoCtx.Provider>;
}

/** A muted looping demo that plays while it is on screen (and playback is on). `priority` videos (the first screen) always win a slot. */
export function AutoVideo({ src, poster, className, priority = false, onFail, ...rest }: { src: string; poster?: string | null; className?: string; priority?: boolean; onFail?: () => void } & Omit<VideoHTMLAttributes<HTMLVideoElement>, "src" | "poster">) {
	const ref = useRef<HTMLVideoElement>(null);
	useEffect(() => {
		const el = ref.current;
		if (!el || typeof IntersectionObserver === "undefined") return;
		const io = new IntersectionObserver(
			([e]) => {
				if (e.isIntersecting) visible.set(el, { el, priority });
				else (visible.delete(el), el.pause());
				rebalance();
			},
			{ threshold: 0.35 },
		);
		io.observe(el);
		return () => (io.disconnect(), visible.delete(el), rebalance());
	}, [src, priority]);
	return <video ref={ref} src={src} poster={poster || undefined} muted loop playsInline preload="metadata" onError={onFail} className={cn("bg-black", className)} {...rest} />;
}
