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
let suspended = 0; // >0 while a dialog is open: the cards behind it stop loading and playing so the dialog's own video gets the connection

function rebalance() {
	const mid = window.innerHeight / 2;
	const list = [...visible.values()].sort((a, b) => Number(b.priority) - Number(a.priority) || Math.abs(center(a.el) - mid) - Math.abs(center(b.el) - mid));
	list.forEach((e, i) => {
		if (playingAll && !suspended && i < MAX_PLAYING) e.el.play().catch(() => {});
		else e.el.pause();
	});
}
const center = (el: HTMLElement) => {
	const r = el.getBoundingClientRect();
	return r.top + r.height / 2;
};

/** While `active`, every card video pauses and stops asking for data. The prompt dialog uses it, so its player is not starved by 48 cards behind it. */
export function useSuspendVideos(active: boolean) {
	useEffect(() => {
		if (!active) return;
		suspended++;
		rebalance();
		return () => {
			suspended--;
			rebalance();
		};
	}, [active]);
}

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

/**
 * A muted looping demo that plays while it is on screen (and playback is on). `priority` videos (the first screen) always win a slot.
 * The file is only requested once the card is near the screen (a page of 48 cards must not open 48 connections), a failed or stalled load is
 * retried once before giving up, and on giving up the poster behind it stays (nothing is hidden for good because of one slow response).
 */
/** Same-origin copy of a tweet video, used when the direct load fails. Anything else is returned unchanged. */
export const viaProxy = (src: string) => (/^https:\/\/video\.twimg\.com\//.test(src) ? `/api/vid?u=${encodeURIComponent(src)}` : src);

export function AutoVideo({ src, poster, className, priority = false, onFail, ...rest }: { src: string; poster?: string | null; className?: string; priority?: boolean; onFail?: () => void } & Omit<VideoHTMLAttributes<HTMLVideoElement>, "src" | "poster">) {
	const ref = useRef<HTMLVideoElement>(null);
	const [armed, setArmed] = useState(priority);
	const [bad, setBad] = useState(false);
	const tries = useRef(0);
	const [proxied, setProxied] = useState(false);
	const failRef = useRef(onFail);
	failRef.current = onFail;

	const giveUp = useCallback(() => (setBad(true), failRef.current?.()), []);
	const retryOrGiveUp = useCallback(() => {
		const el = ref.current;
		if (!el) return giveUp();
		// first failure: the same file through our own server (a cross-site request is what the CDN tends to refuse); then give up
		if (tries.current >= 1) return !proxied && viaProxy(src) !== src ? (tries.current = 0, setProxied(true)) : giveUp();
		tries.current++;
		window.setTimeout(() => el.isConnected && el.load(), 1200);
	}, [giveUp, proxied, src]);

	useEffect(() => {
		tries.current = 0;
		setBad(false);
		setProxied(false);
	}, [src]);

	useEffect(() => {
		const el = ref.current;
		if (!el || typeof IntersectionObserver === "undefined") return setArmed(true);
		const io = new IntersectionObserver(
			([e]) => {
				if (e.isIntersecting) {
					if (!suspended) setArmed(true);
					visible.set(el, { el, priority });
				} else (visible.delete(el), el.pause());
				rebalance();
			},
			{ threshold: 0.35, rootMargin: "200px 0px" },
		);
		io.observe(el);
		return () => (io.disconnect(), visible.delete(el), rebalance());
	}, [src, priority]);

	// a request that never answers: look again after a while, then stop
	useEffect(() => {
		const el = ref.current;
		if (!armed || !el) return;
		const t = window.setTimeout(() => el.readyState < 2 && el.networkState !== 2 && retryOrGiveUp(), 20000);
		el.addEventListener("loadeddata", () => clearTimeout(t), { once: true });
		return () => clearTimeout(t);
	}, [armed, src, retryOrGiveUp]);

	if (bad) return null;
	return <video ref={ref} src={armed ? (proxied ? viaProxy(src) : src) : undefined} poster={poster || undefined} muted loop playsInline preload="metadata" onError={retryOrGiveUp} className={cn("bg-black", className)} {...rest} />;
}
