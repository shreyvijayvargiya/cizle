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
/** The MCP server address people add to Claude. CIZLE_MCP_URL points it at the standalone API (Fly); without it the site's own /mcp is used. */
export const MCP_URL = (env("CIZLE_MCP_URL") || `${SITE.url}/mcp`).replace(/\/+$/, "");

/** Premium (paid skills, film styles, pricing) is not on sale yet: everything shown is free, and the call to action is to sign in and subscribe. Flip "premiumLaunched" in content/site.json to bring it back. */
export const PREMIUM = Boolean((site as { premiumLaunched?: boolean }).premiumLaunched);
/** The blog is written but not ready: hidden from the nav, footer, search, sitemap and routes until "blogLive" is true in content/site.json. */
export const BLOG = Boolean((site as { blogLive?: boolean }).blogLive);

const ALL_NAV = [
	{ to: "/", label: "Skills" },
	{ to: "/gallery", label: "Gallery" },
	{ to: "/films", label: "Films" },
	{ to: "/connect", label: "MCP" },
	{ to: "/pricing", label: "Pricing" },
	{ to: "/docs", label: "Docs" },
	{ to: "/learn", label: "Learn" },
	{ to: "/blog", label: "Blog" },
] as const;
export const NAV = ALL_NAV.filter((n) => (PREMIUM || (n.to !== "/pricing" && n.to !== "/films")) && (BLOG || n.to !== "/blog"));
