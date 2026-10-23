import site from "../../content/site.json";

const LAUNCH_FREE_FLAG = ["1", "true"].includes(((import.meta.env.VITE_LAUNCH_FREE_ONLY as string | undefined) || "").trim().toLowerCase());

export const SITE = {
	...site,
	description: LAUNCH_FREE_FLAG ? site.description.replace(/ 20 free skills, premium.*$/, " Free and open source.") : site.description,
	url: ((import.meta.env.VITE_SITE_URL as string | undefined) || site.url).replace(/\/+$/, ""),
	price: { usd: site.price.usd, inr: Number(import.meta.env.VITE_PRICE_INR || site.price.inr) },
	/** The three plans. INR per-month prices can be overridden to match the Dodo INR products: VITE_PRICE_INR_MONTH, _HALF, _YEAR. */
	plans: site.plans.map((p) => ({ ...p, inr: Number((import.meta.env as Record<string, string | undefined>)[`VITE_PRICE_INR_${p.id.toUpperCase()}`] || p.inr) })),
};

/** Local testing only: pretend to be a Premium subscriber without Firebase. Ignored in production builds. */
export const DEV_UNLOCK = import.meta.env.DEV && import.meta.env.VITE_DEV_UNLOCK === "1";

/**
 * Free-only launch: set VITE_LAUNCH_FREE_ONLY=1 in site/.env. Premium prompts and skills are left out of the data, and the pricing,
 * sign-in, settings and refund pages and every "Get Premium" button are hidden. Leave it unset to bring Premium back.
 */
export const LAUNCH_FREE = LAUNCH_FREE_FLAG;

export const env = (k: string) => ((import.meta.env as Record<string, string | undefined>)[k] || "").trim();

const NAV_ALL = [
	{ to: "/", label: "Skills" },
	{ to: "/gallery", label: "Gallery" },
	{ to: "/films", label: "Films" },
	{ to: "/connect", label: "MCP" },
	{ to: "/pricing", label: "Pricing" },
	{ to: "/docs", label: "Docs" },
	{ to: "/blog", label: "Blog" },
] as const;
export const NAV = NAV_ALL.filter((n) => !(LAUNCH_FREE && (n.to === "/pricing" || n.to === "/films")));
