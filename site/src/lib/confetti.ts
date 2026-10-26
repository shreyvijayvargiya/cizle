/** A short celebration. Skipped for people who ask for reduced motion. */
export async function celebrate() {
	if (typeof window === "undefined" || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
	const { default: confetti } = await import("canvas-confetti");
	const colors = ["#f97316", "#fb923c", "#fbbf24", "#a3e635", "#38bdf8", "#e879f9"];
	const end = Date.now() + 1800;
	confetti({ particleCount: 140, spread: 90, startVelocity: 48, origin: { y: 0.65 }, colors, zIndex: 9999 });
	(function frame() {
		confetti({ particleCount: 5, angle: 60, spread: 60, origin: { x: 0, y: 0.8 }, colors, zIndex: 9999 });
		confetti({ particleCount: 5, angle: 120, spread: 60, origin: { x: 1, y: 0.8 }, colors, zIndex: 9999 });
		if (Date.now() < end) requestAnimationFrame(frame);
	})();
}
