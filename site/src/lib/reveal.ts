import { useEffect } from "react";

/** Adds `.in` to every `.reveal` element as it scrolls into view (once). Without script, or with reduced motion, content is simply visible. */
export function useReveal() {
	useEffect(() => {
		if (typeof IntersectionObserver === "undefined") return;
		const io = new IntersectionObserver(
			(entries) => {
				for (const e of entries) if (e.isIntersecting) (e.target.classList.add("in"), io.unobserve(e.target));
			},
			{ rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
		);
		const scan = () => document.querySelectorAll<HTMLElement>(".reveal:not(.in)").forEach((el) => io.observe(el));
		scan();
		let raf = 0;
		const mo = new MutationObserver(() => {
			cancelAnimationFrame(raf);
			raf = requestAnimationFrame(scan);
		});
		mo.observe(document.body, { childList: true, subtree: true });
		return () => (io.disconnect(), mo.disconnect(), cancelAnimationFrame(raf));
	}, []);
}
