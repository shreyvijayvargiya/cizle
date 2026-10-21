import site from "../../content/site.json";

export const SITE = {
	...site,
	url: ((import.meta.env.VITE_SITE_URL as string | undefined) || site.url).replace(/\/+$/, ""),
	price: { usd: site.price.usd, inr: Number(import.meta.env.VITE_PRICE_INR || site.price.inr) },
};

/** Local testing only: pretend to be a Premium subscriber without Firebase. Ignored in production builds. */
export const DEV_UNLOCK = import.meta.env.DEV && import.meta.env.VITE_DEV_UNLOCK === "1";

export const env = (k: string) => ((import.meta.env as Record<string, string | undefined>)[k] || "").trim();

export const NAV = [
	{ to: "/", label: "Skills" },
	{ to: "/pricing", label: "Pricing" },
	{ to: "/docs", label: "Docs" },
	{ to: "/blog", label: "Blog" },
	{ to: "/faq", label: "FAQ" },
] as const;
