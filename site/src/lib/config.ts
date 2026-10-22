import site from "../../content/site.json";

export const SITE = {
	...site,
	url: ((import.meta.env.VITE_SITE_URL as string | undefined) || site.url).replace(/\/+$/, ""),
	price: { usd: site.price.usd, inr: Number(import.meta.env.VITE_PRICE_INR || site.price.inr) },
	/** The three plans. INR per-month prices can be overridden to match the Dodo INR products: VITE_PRICE_INR_MONTH, _HALF, _YEAR. */
	plans: site.plans.map((p) => ({ ...p, inr: Number((import.meta.env as Record<string, string | undefined>)[`VITE_PRICE_INR_${p.id.toUpperCase()}`] || p.inr) })),
};

/** Local testing only: pretend to be a Premium subscriber without Firebase. Ignored in production builds. */
export const DEV_UNLOCK = import.meta.env.DEV && import.meta.env.VITE_DEV_UNLOCK === "1";

export const env = (k: string) => ((import.meta.env as Record<string, string | undefined>)[k] || "").trim();

export const NAV = [
	{ to: "/", label: "Skills" },
	{ to: "/gallery", label: "Gallery" },
	{ to: "/pricing", label: "Pricing" },
	{ to: "/docs", label: "Docs" },
	{ to: "/blog", label: "Blog" },
	{ to: "/faq", label: "FAQ" },
] as const;
