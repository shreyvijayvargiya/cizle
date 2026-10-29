import { useSyncExternalStore } from "react";

/** A video that was playing when its dialog was closed: the mini player picks it up where it was. */
export type MiniVideo = { src: string; poster?: string | null; title: string; slug: string; search: object; time: number; muted: boolean };
let video: MiniVideo | null = null;
let resume: { src: string; time: number } | null = null;
const subs = new Set<() => void>();
const emit = () => subs.forEach((f) => f());

export const setMiniVideo = (v: MiniVideo | null) => ((video = v), emit());
export const getMiniVideo = () => video;
export const useMiniVideo = () => useSyncExternalStore((f) => (subs.add(f), () => void subs.delete(f)), getMiniVideo, getMiniVideo);
/** the dialog opened from the mini player starts its video at the mini player's time */
export const setResume = (r: { src: string; time: number } | null) => (resume = r);
export const takeResume = (src: string) => { const r = resume && resume.src === src ? resume.time : null; resume = null; return r; };
