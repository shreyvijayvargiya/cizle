/**
 * A virtual clock injected into the page before its own scripts run, so a canvas, three.js, GSAP or CSS animation can be captured
 * frame by frame at an exact time (no wall-clock timing, so the video is the same on a slow or a fast machine).
 *
 * It replaces performance.now, Date, requestAnimationFrame, setTimeout and setInterval, and exposes window.__advance(ms), which
 * moves time forward, fires the timers that fall due, runs the queued animation frames once, and seeks CSS/Web animations.
 */
export const VIRTUAL_CLOCK = `(() => {
	let now = 0;
	const base = 1700000000000;
	const RealDate = Date;
	const frames = [];
	const timers = [];
	let nextId = 0;
	performance.now = () => now;
	const D = function (...a) { return a.length ? new RealDate(...a) : new RealDate(base + now); };
	D.prototype = RealDate.prototype;
	D.now = () => base + now;
	D.parse = RealDate.parse;
	D.UTC = RealDate.UTC;
	window.Date = D;
	window.requestAnimationFrame = (cb) => (frames.push([++nextId, cb]), nextId);
	window.cancelAnimationFrame = (id) => { const i = frames.findIndex((f) => f[0] === id); if (i >= 0) frames.splice(i, 1); };
	window.setTimeout = (cb, ms, ...args) => (timers.push({ id: ++nextId, at: now + Math.max(0, +ms || 0), cb, args, every: 0 }), nextId);
	window.setInterval = (cb, ms, ...args) => { const e = Math.max(1, +ms || 1); timers.push({ id: ++nextId, at: now + e, cb, args, every: e }); return nextId; };
	window.clearTimeout = window.clearInterval = (id) => { const i = timers.findIndex((t) => t.id === id); if (i >= 0) timers.splice(i, 1); };
	window.__advance = (ms) => {
		const target = now + ms;
		for (;;) {
			timers.sort((a, b) => a.at - b.at);
			const t = timers[0];
			if (!t || t.at > target) break;
			timers.shift();
			now = Math.max(now, t.at);
			if (t.every) { t.at += t.every; timers.push(t); }
			try { if (typeof t.cb === "function") t.cb(...t.args); } catch (e) { console.error(e); }
		}
		now = target;
		const due = frames.splice(0);
		for (const [, cb] of due) { try { cb(now); } catch (e) { console.error(e); } }
		for (const a of document.getAnimations()) { try { a.pause(); a.currentTime = now; } catch {} }
	};
})();`;
