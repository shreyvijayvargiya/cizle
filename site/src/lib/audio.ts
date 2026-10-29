import { useQuery } from "@tanstack/react-query";
import { useSyncExternalStore } from "react";
import { setMiniVideo } from "@/lib/mini";

export type AudioKind = "music" | "sfx" | "ambience";
export type AudioItem = {
	id: string; slug: string; title: string; kind: AudioKind; length: "short" | "medium" | "long"; duration: number; tags: string[]; creator: string; license: string;
	sourceUrl: string; prompt: string; description: string; format: string; bytes: number; src: string; version: string; fetchedAt: string;
};
export type AudioData = { generatedAt: string; total: number; versions: { version: string; label: string; count: number }[]; kinds: [string, number][]; lengths: [string, number][]; licenses: [string, number][]; tags: [string, number][]; items: AudioItem[] };
export type AudioFilters = { q?: string; kind?: string; length?: string; tag?: string; license?: string; version?: string; sort?: string };

export const KIND_LABEL: Record<string, string> = { music: "Music", sfx: "Sound effects", ambience: "Ambience" };
export const LENGTH_LABEL: Record<string, string> = { short: "Short (under 10 s)", medium: "Medium (10-60 s)", long: "Long (over 60 s)" };
export const fmtTime = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

export const useAudio = () => useQuery({ queryKey: ["audio"], queryFn: async (): Promise<AudioData> => { const r = await fetch("/audio.json"); if (!r.ok) throw new Error("The audio library is not published yet."); return r.json(); }, staleTime: 30 * 60_000 });

export function filterAudio(items: AudioItem[], f: AudioFilters): AudioItem[] {
	const q = (f.q || "").trim().toLowerCase().split(/\s+/).filter(Boolean);
	let out = items.filter((a) => (!f.kind || a.kind === f.kind) && (!f.length || a.length === f.length) && (!f.tag || a.tags.includes(f.tag)) && (!f.license || a.license === f.license) && (!f.version || a.version === f.version));
	if (q.length) out = out.filter((a) => { const hay = `${a.title} ${a.tags.join(" ")} ${a.creator} ${a.kind} ${a.description}`.toLowerCase(); return q.every((w) => hay.includes(w)); });
	if (f.sort === "az") out = [...out].sort((a, b) => a.title.localeCompare(b.title));
	else if (f.sort === "long") out = [...out].sort((a, b) => b.duration - a.duration);
	else if (f.sort === "short") out = [...out].sort((a, b) => a.duration - b.duration);
	return out;
}

/**
 * One audio element for the whole site, so only one clip plays at a time. The analyser is created on the first play (a user gesture, which
 * browsers require) and is what the visualisers read every frame: the pictures move with the sound that is really playing.
 */
type Clip = Pick<AudioItem, "id" | "src" | "duration" | "title" | "slug">;
type Snap = { id: string | null; item: Clip | null; playing: boolean; time: number; duration: number; error: boolean; volume: number; muted: boolean };
class Engine {
	el: HTMLAudioElement | null = null;
	ctx: AudioContext | null = null;
	analyser: AnalyserNode | null = null;
	gain: GainNode | null = null;
	freq = new Uint8Array(512);
	wave = new Uint8Array(1024);
	private snap: Snap = { id: null, item: null, playing: false, time: 0, duration: 0, error: false, volume: 1, muted: false };
	private subs = new Set<() => void>();
	private last = 0;
	subscribe = (fn: () => void) => (this.subs.add(fn), () => void this.subs.delete(fn));
	getSnapshot = () => this.snap;
	private set(p: Partial<Snap>) { this.snap = { ...this.snap, ...p }; this.subs.forEach((f) => f()); }
	private ensure() {
		if (this.el) return this.el;
		const el = new Audio();
		el.preload = "auto";
		el.addEventListener("play", () => this.set({ playing: true, error: false }));
		el.addEventListener("pause", () => this.set({ playing: false }));
		el.addEventListener("ended", () => this.set({ playing: false, time: 0 }));
		el.addEventListener("loadedmetadata", () => this.set({ duration: el.duration || 0 }));
		el.addEventListener("error", () => this.set({ playing: false, error: true }));
		el.addEventListener("timeupdate", () => { const n = performance.now(); if (n - this.last > 120) { this.last = n; this.set({ time: el.currentTime }); } });
		this.el = el;
		return el;
	}
	private wire() {
		if (this.ctx || !this.el) return;
		try {
			const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
			this.ctx = new Ctx();
			const src = this.ctx.createMediaElementSource(this.el);
			this.analyser = this.ctx.createAnalyser();
			this.analyser.fftSize = 1024;
			this.analyser.smoothingTimeConstant = 0.78;
			src.connect(this.analyser);
			// the analyser sits before the volume, so the picture keeps moving when the sound is turned down or muted
			this.gain = this.ctx.createGain();
			this.analyser.connect(this.gain);
			this.gain.connect(this.ctx.destination);
			this.applyVolume();
			this.freq = new Uint8Array(this.analyser.frequencyBinCount);
			this.wave = new Uint8Array(this.analyser.fftSize);
		} catch { this.ctx = null; this.analyser = null; }
	}
	play(item: Clip) {
		setMiniVideo(null); // one mini player at a time
		const el = this.ensure();
		if (this.snap.id !== item.id) {
			el.src = item.src;
			this.set({ id: item.id, item: { id: item.id, src: item.src, duration: item.duration, title: item.title, slug: item.slug }, time: 0, duration: item.duration, error: false });
		}
		this.wire();
		void this.ctx?.resume();
		void el.play().catch(() => this.set({ playing: false, error: true }));
	}
	private applyVolume() {
		const v = this.snap.muted ? 0 : this.snap.volume;
		if (this.gain) this.gain.gain.value = v;
		else if (this.el) this.el.volume = v;
	}
	setVolume(x: number) { this.set({ volume: x, muted: x === 0 }); this.applyVolume(); }
	toggleMute() { this.set({ muted: !this.snap.muted && this.snap.volume > 0 ? true : false, volume: this.snap.volume === 0 ? 0.6 : this.snap.volume }); this.applyVolume(); }
	pause() { this.el?.pause(); }
	/** closes the mini player: stops the sound and forgets the clip */
	stop() { this.el?.pause(); this.set({ id: null, item: null, playing: false, time: 0 }); }
	toggle(item: Clip) { this.snap.id === item.id && this.snap.playing ? this.pause() : this.play(item); }
	seek(t: number) { if (this.el) { this.el.currentTime = t; this.set({ time: t }); } }
	/** fills freq and wave from the analyser; returns false when nothing is wired (the visualiser then idles) */
	read() {
		if (!this.analyser) return false;
		this.analyser.getByteFrequencyData(this.freq);
		this.analyser.getByteTimeDomainData(this.wave);
		return true;
	}
}
export const engine = new Engine();
export const useEngine = () => useSyncExternalStore(engine.subscribe, engine.getSnapshot, engine.getSnapshot);
