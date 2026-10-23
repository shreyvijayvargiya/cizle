import { useEffect } from "react";
import { SITE } from "./config";

type Head = { enabled?: boolean; title: string; description: string; path: string; noindex?: boolean; jsonLd?: object | object[] };

function meta(attr: "name" | "property", key: string, value: string) {
	let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
	if (!el) {
		el = document.createElement("meta");
		el.setAttribute(attr, key);
		document.head.appendChild(el);
	}
	el.setAttribute("content", value);
}

/** Keeps title, description, canonical, Open Graph and JSON-LD in step with the route (the prerendered HTML has them already). */
export function useHead({ enabled = true, title, description, path, noindex, jsonLd }: Head) {
	const ld = jsonLd ? JSON.stringify(jsonLd) : "";
	useEffect(() => {
		if (!enabled) return;
		const url = `${SITE.url}${path === "/" ? "" : path}`;
		document.title = title;
		meta("name", "description", description);
		meta("name", "robots", noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large");
		meta("property", "og:title", title);
		meta("property", "og:description", description);
		meta("property", "og:url", url);
		meta("name", "twitter:title", title);
		meta("name", "twitter:description", description);
		let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
		if (!link) {
			link = document.createElement("link");
			link.rel = "canonical";
			document.head.appendChild(link);
		}
		link.href = url;
		document.head.querySelectorAll("script[data-head-ld]").forEach((n) => n.remove());
		if (ld) {
			const s = document.createElement("script");
			s.type = "application/ld+json";
			s.dataset.headLd = "1";
			s.text = ld;
			document.head.appendChild(s);
		}
	}, [enabled, title, description, path, noindex, ld]);
}
