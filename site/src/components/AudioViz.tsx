import { useEffect, useRef, type ReactNode } from "react";
import { engine } from "@/lib/audio";

/**
 * What every picture is drawn from: 64 frequency bands (0..1), the peak of each band (falls slowly), 128 waveform samples (-1..1), the overall level,
 * the bass, a beat impulse (jumps on a kick, decays in about a third of a second) and the time in seconds.
 */
export type VizData = { bands: Float32Array; peaks: Float32Array; wave: Float32Array; level: number; bass: number; beat: number; t: number };
/** `st` is state a picture keeps between frames (ripples, rotation); `bg` is the colour behind the canvas */
type Draw = (c: CanvasRenderingContext2D, w: number, h: number, d: VizData, ink: string, st: Record<string, any>, bg: string) => void; // eslint-disable-line @typescript-eslint/no-explicit-any

const TAU = Math.PI * 2;
const a = (ink: string, o: number) => `color-mix(in srgb, ${ink} ${Math.round(Math.max(0, Math.min(1, o)) * 100)}%, transparent)`;
const lerp = (x: number, y: number, k: number) => x + (y - x) * k;

/** a smooth closed curve through points (quadratic midpoints), so a blob looks poured, not polygonal */
function smooth(c: CanvasRenderingContext2D, p: [number, number][]) {
	const n = p.length;
	c.beginPath();
	c.moveTo((p[n - 1][0] + p[0][0]) / 2, (p[n - 1][1] + p[0][1]) / 2);
	for (let i = 0; i < n; i++) { const q = p[i], r = p[(i + 1) % n]; c.quadraticCurveTo(q[0], q[1], (q[0] + r[0]) / 2, (q[1] + r[1]) / 2); }
	c.closePath();
}

/** ----- ten pictures: 2D bars, waves and rings, a blob, and 3D point clouds, all driven by the same data ----- */
const bars: Draw = (c, w, h, d, ink) => {
	const n = 36, g = w / n, base = h * 0.78;
	const grad = c.createLinearGradient(0, base, 0, 0); grad.addColorStop(0, ink); grad.addColorStop(1, a(ink, 0.45));
	for (let i = 0; i < n; i++) {
		const k = Math.floor((i / n) * 54), v = d.bands[k], pk = d.peaks[k];
		const bh = Math.max(4, v * base * 0.96), x = i * g + g * 0.16, bw = g * 0.68;
		c.fillStyle = grad; c.beginPath(); c.roundRect(x, base - bh, bw, bh, bw / 2.4); c.fill();
		c.fillStyle = ink; c.beginPath(); c.roundRect(x, base - Math.max(bh + 6, pk * base * 0.96 + 8), bw, 3, 1.5); c.fill(); // the peak cap that hangs and falls
		c.fillStyle = a(ink, 0.16); c.beginPath(); c.roundRect(x, base + 5, bw, Math.max(2, v * h * 0.16), bw / 2.4); c.fill(); // soft reflection
	}
};
const mirror: Draw = (c, w, h, d, ink) => {
	const n = 52, g = w / n;
	for (let i = 0; i < n; i++) {
		const k = Math.abs(i - n / 2 + 0.5) / (n / 2), v = d.bands[Math.floor(k * 52)];
		const bh = Math.max(5, v * h * 0.8 * (0.7 + d.beat * 0.3)), x = i * g + g * 0.22, bw = g * 0.56;
		c.fillStyle = a(ink, 0.35 + v * 0.65); c.beginPath(); c.roundRect(x, (h - bh) / 2, bw, bh, bw / 2); c.fill();
	}
};
const scope: Draw = (c, w, h, d, ink) => {
	const line = (k: number, ph: number) => { c.beginPath(); for (let i = 0; i < d.wave.length; i++) { const x = (i / (d.wave.length - 1)) * w, env = Math.sin((i / (d.wave.length - 1)) * Math.PI) * 0.7 + 0.3; const y = h / 2 + (d.wave[(i + ph) % d.wave.length]) * h * 0.46 * k * (0.7 + d.level) * env; i ? c.lineTo(x, y) : c.moveTo(x, y); } };
	c.lineJoin = "round"; c.lineCap = "round";
	line(1, 0); c.lineTo(w, h / 2); c.lineTo(0, h / 2); c.closePath();
	const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, a(ink, 0.22)); g.addColorStop(0.5, a(ink, 0.02)); g.addColorStop(1, a(ink, 0.22)); c.fillStyle = g; c.fill();
	for (const [k, ph, o, lw] of [[0.7, 14, 0.25, 1.5], [0.85, 7, 0.45, 2], [1, 0, 1, 3]] as const) { line(k, ph); c.strokeStyle = a(ink, o); c.lineWidth = lw; c.stroke(); }
};
const radial: Draw = (c, w, h, d, ink, st) => {
	const cx = w / 2, cy = h / 2, m = Math.min(w, h), r0 = m * (0.19 + d.beat * 0.025), n = 84;
	st.rot = (st.rot || 0) + 0.002 + d.level * 0.012;
	c.lineCap = "round";
	for (let i = 0; i < n; i++) {
		const ang = (i / n) * TAU - Math.PI / 2 + st.rot, k = Math.floor((Math.abs(i - n / 2) / (n / 2)) * 54), v = d.bands[k], pk = d.peaks[k];
		const cos = Math.cos(ang), sin = Math.sin(ang), r1 = r0 + 3 + v * m * 0.3;
		c.strokeStyle = ink; c.lineWidth = Math.max(2, m * 0.013); c.beginPath(); c.moveTo(cx + cos * r0, cy + sin * r0); c.lineTo(cx + cos * r1, cy + sin * r1); c.stroke();
		c.strokeStyle = a(ink, 0.35); c.lineWidth = 2; const rp = r0 + 8 + pk * m * 0.3; c.beginPath(); c.moveTo(cx + cos * rp, cy + sin * rp); c.lineTo(cx + cos * (rp + 3), cy + sin * (rp + 3)); c.stroke();
	}
	c.strokeStyle = a(ink, 0.5); c.lineWidth = 1.5; c.beginPath(); c.arc(cx, cy, Math.max(0, r0 - 6), 0, TAU); c.stroke();
	c.fillStyle = a(ink, 0.18 + d.beat * 0.3); c.beginPath(); c.arc(cx, cy, Math.max(0, r0 - 12 - d.bass * 4), 0, TAU); c.fill();
};
const blob: Draw = (c, w, h, d, ink, st) => {
	const cx = w / 2, cy = h / 2, base = Math.min(w, h) * (0.2 + d.level * 0.07 + d.beat * 0.045), n = 14;
	st.p = (st.p || 0) + 0.012 + d.level * 0.03;
	const shape = (s: number, ph: number, amp: number): [number, number][] => Array.from({ length: n }, (_, i) => {
		const t = (i / n) * TAU, band = d.bands[Math.floor((Math.abs(i - n / 2) / (n / 2)) * 30)];
		const r = base * s * (1 + Math.sin(t * 2 + st.p * 1.3 + ph) * 0.07 + Math.sin(t * 3 - st.p * 0.9 + ph * 2) * 0.05 + band * amp);
		return [cx + Math.cos(t) * r, cy + Math.sin(t) * r];
	});
	smooth(c, shape(1.55, 2, 0.35)); c.fillStyle = a(ink, 0.07); c.fill();
	smooth(c, shape(1.3, 1, 0.45)); c.fillStyle = a(ink, 0.13); c.fill();
	smooth(c, shape(1.12, 3, 0.55)); c.fillStyle = a(ink, 0.25); c.fill();
	smooth(c, shape(1, 0, 0.6));
	const g = c.createRadialGradient(cx - base * 0.35, cy - base * 0.4, base * 0.1, cx, cy, base * 1.4); g.addColorStop(0, a(ink, 0.82)); g.addColorStop(0.55, ink); g.addColorStop(1, ink);
	c.fillStyle = g; c.fill();
	c.fillStyle = a("#fff", 0.16 + d.beat * 0.12); c.beginPath(); c.ellipse(cx - base * 0.3, cy - base * 0.36, base * 0.28, base * 0.14, -0.6, 0, TAU); c.fill(); // a highlight, so it reads as a soft object
};
const rings: Draw = (c, w, h, d, ink, st) => {
	const cx = w / 2, cy = h / 2, m = Math.min(w, h) / 2;
	const rip: { r: number; o: number }[] = (st.rip ||= []);
	if (d.beat > 0.85 && (st.last || 0) < 0.85) rip.push({ r: m * 0.1, o: 0.9 }); // a ripple leaves the centre on each kick
	st.last = d.beat;
	for (let i = 0; i < 7; i++) { const v = d.bands[i * 6]; c.strokeStyle = a(ink, 0.18 + v * 0.7); c.lineWidth = 1.5 + v * 4; c.beginPath(); c.arc(cx, cy, m * (0.14 + i * 0.1) * (1 + v * 0.14), 0, TAU); c.stroke(); }
	for (let i = rip.length - 1; i >= 0; i--) { const p = rip[i]; p.r += m * 0.016; p.o *= 0.975; if (p.o < 0.03 || p.r > m * 1.15) { rip.splice(i, 1); continue; } c.strokeStyle = a(ink, p.o); c.lineWidth = 2 + p.o * 3; c.beginPath(); c.arc(cx, cy, p.r, 0, TAU); c.stroke(); }
	c.fillStyle = ink; c.beginPath(); c.arc(cx, cy, m * (0.055 + d.level * 0.08 + d.beat * 0.03), 0, TAU); c.fill();
};
const dots: Draw = (c, w, h, d, ink) => {
	const cols = 26, rows = 13, gx = w / cols, gy = h / rows;
	for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
		const k = Math.floor((x / cols) * 52), band = d.bands[k];
		const fill = Math.max(0, Math.min(1, band * rows - y)), wave = Math.sin(x * 0.5 + d.t * 3 - y * 0.3) * 0.5 + 0.5;
		const r = Math.min(gx, gy) * (0.1 + fill * 0.34 + wave * band * 0.1);
		c.fillStyle = a(ink, 0.18 + fill * 0.82); c.beginPath(); c.arc(x * gx + gx / 2, h - (y * gy + gy / 2), r, 0, TAU); c.fill();
	}
};
const ribbons: Draw = (c, w, h, d, ink, _st, bg) => {
	const rows = 15, pts = 64, xy: [number, number][] = [];
	for (let r = 0; r < rows; r++) {
		const y0 = h * 0.2 + (r / (rows - 1)) * h * 0.68;
		xy.length = 0;
		for (let i = 0; i <= pts; i++) { const env = Math.pow(Math.sin((i / pts) * Math.PI), 1.4), k = Math.floor((i / pts) * 46); const v = (d.bands[k] * 0.7 + d.bands[Math.min(63, k + 2)] * 0.3) * env; xy.push([(i / pts) * w, y0 - v * h * 0.24 * (0.8 + d.beat * 0.25) - Math.sin(i * 0.4 + d.t * 1.4 + r * 0.7) * 1.3]); }
		c.beginPath(); xy.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.lineTo(w, h); c.lineTo(0, h); c.closePath();
		c.fillStyle = bg; c.fill(); // the rows in front hide the rows behind (the Unknown Pleasures look)
		c.beginPath(); xy.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
		c.strokeStyle = a(ink, 0.4 + (r / rows) * 0.6); c.lineWidth = 1.6; c.lineJoin = "round"; c.stroke();
	}
};
const sphere: Draw = (c, w, h, d, ink, st) => {
	const cx = w / 2, cy = h / 2, R = Math.min(w, h) * (0.27 + d.beat * 0.02), lat = 14, lon = 28;
	st.ry = (st.ry || 0) + 0.006 + d.level * 0.02;
	const rx = 0.38 + Math.sin(st.ry * 0.4) * 0.12;
	const pt = (i: number, j: number) => {
		const th = (i / lat) * Math.PI, ph = (j / lon) * TAU + st.ry;
		const v = d.bands[Math.floor((j / lon) * 44)] * 0.5 * Math.sin(th) + d.bass * 0.12;
		const r = R * (1 + v);
		const x = r * Math.sin(th) * Math.cos(ph), y = r * Math.cos(th), z = r * Math.sin(th) * Math.sin(ph);
		const y2 = y * Math.cos(rx) - z * Math.sin(rx), z2 = y * Math.sin(rx) + z * Math.cos(rx), p = 1 / (1 - z2 / (R * 4.5));
		return [cx + x * p, cy + y2 * p, z2 / R, v] as const;
	};
	const grid: (readonly [number, number, number, number])[][] = [];
	for (let i = 0; i <= lat; i++) { grid.push([]); for (let j = 0; j < lon; j++) grid[i].push(pt(i, j)); }
	c.lineWidth = 1;
	for (let i = 1; i < lat; i++) for (let j = 0; j < lon; j++) {
		const p = grid[i][j], q = grid[i][(j + 1) % lon], s = grid[i + 1][j];
		c.strokeStyle = a(ink, 0.08 + 0.4 * ((p[2] + 1) / 2)); c.beginPath(); c.moveTo(p[0], p[1]); c.lineTo(q[0], q[1]); c.moveTo(p[0], p[1]); c.lineTo(s[0], s[1]); c.stroke();
	}
	for (let i = 1; i < lat; i++) for (let j = 0; j < lon; j++) { const p = grid[i][j]; c.fillStyle = a(ink, 0.3 + 0.7 * ((p[2] + 1) / 2)); c.beginPath(); c.arc(p[0], p[1], Math.max(0.8, (1 + p[3] * 4) * Math.min(w, h) / 320), 0, TAU); c.fill(); }
};
const orbit: Draw = (c, w, h, d, ink, st) => {
	const cx = w / 2, cy = h / 2, R = Math.min(w, h) * 0.34, n = 110;
	st.ang = (st.ang || 0) + 0.006 + d.level * 0.02;
	const pts: [number, number, number, number][] = [];
	for (let i = 0; i < n; i++) {
		const k = i % 3, v = d.bands[Math.floor((i / n) * 56)], tilt = [0.4, 1.1, -0.7][k];
		const ang = i * 2.399 + st.ang * (1 + k * 0.35) * (k === 1 ? -1 : 1), r = R * (0.5 + k * 0.22 + v * 0.55 + d.beat * 0.08);
		const x = r * Math.cos(ang), y0 = r * Math.sin(ang) * Math.sin(tilt), z = r * Math.sin(ang) * Math.cos(tilt), p = 1 / (1 - z / (R * 4));
		pts.push([cx + x * p, cy + y0 * p, z / R, 1.4 + v * 7]);
	}
	for (let k = 0; k < 3; k++) { c.strokeStyle = a(ink, 0.1); c.lineWidth = 1; c.beginPath(); c.ellipse(cx, cy, R * (0.5 + k * 0.22) * 1.05, R * (0.5 + k * 0.22) * 1.05 * Math.abs(Math.sin([0.4, 1.1, -0.7][k])), [0.3, 0, -0.4][k], 0, TAU); c.stroke(); }
	pts.sort((p, q) => p[2] - q[2]);
	for (const [x, y, z, s] of pts) { const o = 0.25 + 0.75 * ((z + 1.3) / 2.6); c.fillStyle = a(ink, o * 0.25); c.beginPath(); c.arc(x, y, (s * 2.2 * Math.min(w, h)) / 320 + 2, 0, TAU); c.fill(); c.fillStyle = a(ink, o); c.beginPath(); c.arc(x, y, (s * Math.min(w, h)) / 320 + 1, 0, TAU); c.fill(); }
	c.fillStyle = ink; c.beginPath(); c.arc(cx, cy, R * (0.1 + d.bass * 0.1 + d.beat * 0.05), 0, TAU); c.fill();
};

const svg = (children: ReactNode) => <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>{children}</svg>;
export const VIZ: { id: string; name: string; dim: "2D" | "3D"; draw: Draw; trail?: number; icon: ReactNode }[] = [
	{ id: "bars", name: "Bars", dim: "2D", draw: bars, icon: svg(<><path d="M5 20v-6M10 20V6M15 20v-9M20 20v-4" /></>) },
	{ id: "mirror", name: "Mirror", dim: "2D", draw: mirror, icon: svg(<path d="M4 12h0M8 8v8M12 4v16M16 7v10M20 12h0" />) },
	{ id: "scope", name: "Waveform", dim: "2D", draw: scope, trail: 0.3, icon: svg(<path d="M2 12c2 0 2-7 4-7s2 14 4 14 2-14 4-14 2 14 4 14 2-7 4-7" />) },
	{ id: "radial", name: "Radial", dim: "2D", draw: radial, icon: svg(<><circle cx="12" cy="12" r="4" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" /></>) },
	{ id: "blob", name: "Blob", dim: "2D", draw: blob, trail: 0.35, icon: svg(<path d="M6 8c2-4 8-4 11-1 3 3 3 8 0 11-3 3-9 2-11-1-2-3-2-6 0-9z" />) },
	{ id: "rings", name: "Rings", dim: "2D", draw: rings, icon: svg(<><circle cx="12" cy="12" r="2" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="10" /></>) },
	{ id: "dots", name: "Matrix", dim: "2D", draw: dots, icon: svg(<path d="M5 5h.01M12 5h.01M19 5h.01M5 12h.01M12 12h.01M19 12h.01M5 19h.01M12 19h.01M19 19h.01" strokeWidth="3" />) },
	{ id: "ribbons", name: "Ribbons", dim: "3D", draw: ribbons, icon: svg(<><path d="M3 8c3-4 5 4 9 0s6 2 9-1M3 14c3-4 5 4 9 0s6 2 9-1M3 20c3-4 5 4 9 0s6 2 9-1" /></>) },
	{ id: "sphere", name: "Sphere", dim: "3D", draw: sphere, trail: 0.4, icon: svg(<><circle cx="12" cy="12" r="9" /><ellipse cx="12" cy="12" rx="4" ry="9" /><path d="M3 12h18" /></>) },
	{ id: "orbit", name: "Orbit", dim: "3D", draw: orbit, trail: 0.25, icon: svg(<><ellipse cx="12" cy="12" rx="10" ry="4.5" transform="rotate(-25 12 12)" /><circle cx="12" cy="12" r="1.6" fill="currentColor" /><circle cx="20" cy="8" r="1.2" fill="currentColor" /></>) },
];
export const vizFor = (id: string) => VIZ[[...id].reduce((s, ch) => s + ch.charCodeAt(0), 0) % VIZ.length].id;

/** the idle picture: a slow, soft breathing, so a clip that is not playing still shows its shape */
function idleData(seed: number, t: number, out: VizData) {
	for (let i = 0; i < 64; i++) out.bands[i] = Math.max(0.04, (Math.sin(i * 0.31 + seed) * 0.5 + 0.5) * (Math.sin(i * 0.09 + seed * 1.7 + t * 0.6) * 0.25 + 0.4) * (1 - i / 90));
	for (let i = 0; i < 128; i++) out.wave[i] = Math.sin(i * 0.16 + seed + t * 1.2) * 0.22 + Math.sin(i * 0.05 + seed) * 0.15;
	out.peaks.set(out.bands); out.level = 0.25; out.bass = 0.3; out.beat = 0; out.t = t;
}
function liveData(sm: Float32Array, t: number, out: VizData) {
	const f = engine.freq, wv = engine.wave;
	let sum = 0;
	for (let i = 0; i < 64; i++) {
		// log-spaced: low bands are narrow, high bands are wide, so the picture reacts the way ears do
		const lo = Math.floor(Math.pow(i / 64, 2) * f.length * 0.62), hi = Math.max(lo + 1, Math.floor(Math.pow((i + 1) / 64, 2) * f.length * 0.62));
		let s = 0; for (let k = lo; k < hi; k++) s += f[k];
		const v = Math.min(1, (s / (hi - lo) / 255) * (1 + i / 90));
		sm[i] = v > sm[i] ? lerp(sm[i], v, 0.7) : sm[i] * 0.88 + v * 0.12; out.bands[i] = sm[i]; sum += sm[i];
		out.peaks[i] = Math.max(sm[i], out.peaks[i] - 0.011);
	}
	const step = wv.length / 128;
	for (let i = 0; i < 128; i++) out.wave[i] = (wv[Math.floor(i * step)] - 128) / 128;
	const bass = (sm[0] + sm[1] + sm[2] + sm[3] + sm[4]) / 5;
	if (bass > out.bass * 1.18 + 0.06 && bass > 0.35) out.beat = 1; else out.beat *= 0.9; // a kick: the bass jumps above its own recent level
	out.bass = lerp(out.bass, bass, 0.35); out.level = Math.min(1, (sum / 64) * 1.8); out.t = t;
}

/**
 * One picture on a canvas. `live` makes it move with the sound that is playing (it reads the shared analyser every frame); otherwise it
 * draws one still frame. Reduced motion always gets the still frame.
 */
export function AudioViz({ variant, live = false, playing = false, seed = "x", className }: { variant: string; live?: boolean; playing?: boolean; seed?: string; className?: string }) {
	const ref = useRef<HTMLCanvasElement>(null);
	const spec = VIZ.find((v) => v.id === variant) ?? VIZ[0];
	useEffect(() => {
		const cv = ref.current; if (!cv) return;
		const ctx = cv.getContext("2d"); if (!ctx) return;
		const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		const sd = [...seed].reduce((s, ch) => s + ch.charCodeAt(0), 0) % 97;
		const data: VizData = { bands: new Float32Array(64), peaks: new Float32Array(64), wave: new Float32Array(128), level: 0, bass: 0, beat: 0, t: 0 };
		const sm = new Float32Array(64), st: Record<string, any> = {}; // eslint-disable-line @typescript-eslint/no-explicit-any
		let w = 0, h = 0, raf = 0, ink = "#111", bg = "#fff", frame = 0;
		const size = () => { const r = cv.getBoundingClientRect(); const dpr = Math.min(2, window.devicePixelRatio || 1); w = r.width; h = r.height; cv.width = Math.max(1, Math.round(w * dpr)); cv.height = Math.max(1, Math.round(h * dpr)); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
		const paint = (t: number, first = false) => {
			if (frame++ % 90 === 0) { ink = getComputedStyle(cv).color || "#111"; bg = (cv.parentElement && getComputedStyle(cv.parentElement).backgroundColor) || "#fff"; }
			if (playing && engine.read()) liveData(sm, t, data); else { idleData(sd, t, data); sm.fill(0); }
			if (spec.trail && !first && live && !still) { ctx.globalCompositeOperation = "destination-out"; ctx.fillStyle = `rgba(0,0,0,${spec.trail})`; ctx.fillRect(0, 0, w, h); ctx.globalCompositeOperation = "source-over"; } else ctx.clearRect(0, 0, w, h);
			try { spec.draw(ctx, w, h, data, ink, st, bg); } catch { /* a picture must never take the page down */ }
		};
		size();
		const ro = new ResizeObserver(() => { size(); if (!live || still) paint(2 + sd, true); });
		ro.observe(cv);
		if (live && !still) {
			const t0 = performance.now();
			const loop = () => { paint((performance.now() - t0) / 1000); raf = requestAnimationFrame(loop); };
			raf = requestAnimationFrame(loop);
		} else paint(2 + sd, true);
		return () => { cancelAnimationFrame(raf); ro.disconnect(); };
	}, [spec, live, playing, seed]);
	return <canvas ref={ref} aria-hidden className={`block size-full text-foreground ${className ?? ""}`} />;
}
