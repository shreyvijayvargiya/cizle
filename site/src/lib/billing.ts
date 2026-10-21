import { env, SITE } from "./config";

export type Currency = "USD" | "INR";

export const priceLabel = (c: Currency) => (c === "INR" ? `₹${SITE.price.inr.toLocaleString("en-IN")}` : `$${SITE.price.usd}`);

/** Indian visitors see rupees first. Only a default: the pricing page has a toggle. */
export function defaultCurrency(): Currency {
	try {
		if (Intl.DateTimeFormat().resolvedOptions().timeZone === "Asia/Calcutta" || Intl.DateTimeFormat().resolvedOptions().timeZone === "Asia/Kolkata") return "INR";
	} catch {
		/* ignore */
	}
	return "USD";
}

/**
 * Dodo Payments hosted checkout link for the monthly plan. No server needed: the uid travels as metadata and comes back in the
 * webhook, which is what actually unlocks Premium. Returns null until the product ids are set in .env.
 */
export function checkoutUrl({ uid, email, name, currency }: { uid: string; email: string; name?: string; currency: Currency }) {
	const product = env(currency === "INR" ? "VITE_DODO_PRODUCT_INR" : "VITE_DODO_PRODUCT_USD") || env("VITE_DODO_PRODUCT_USD");
	if (!product) return null;
	const base = (env("VITE_DODO_CHECKOUT_BASE") || "https://checkout.dodopayments.com/buy").replace(/\/+$/, "");
	const q = new URLSearchParams({ quantity: "1", email, redirect_url: `${window.location.origin}/settings?payment=success`, metadata_uid: uid });
	if (name) q.set("fullName", name);
	return `${base}/${product}?${q.toString()}`;
}

export const portalUrl = () => env("VITE_DODO_PORTAL_URL") || null;
