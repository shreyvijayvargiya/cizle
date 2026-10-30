/* shared helpers for the ads: everything is a pure function of time t (seconds) */
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const prog = (t, a, b) => clamp((t - a) / (b - a));
const E = {
	outExpo: (x) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x)),
	outBack: (x) => 1 + 2.70158 * Math.pow(x - 1, 3) + 1.70158 * Math.pow(x - 1, 2),
	outCubic: (x) => 1 - Math.pow(1 - x, 3),
	inCubic: (x) => x * x * x,
	inOut: (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
};
const lerp = (a, b, x) => a + (b - a) * x;
function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const $ = (h) => { const d = document.createElement("div"); d.innerHTML = h.trim(); return d.firstChild; };
const show = (el, on) => { el.style.display = on ? "" : "none"; };
