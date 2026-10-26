import { env, SITE } from "./config";

export type Currency = "USD" | "INR";
export type Plan = (typeof SITE.plans)[number];
export type PlanId = Plan["id"];

const money = (n: number, c: Currency) => (c === "INR" ? `₹${n.toLocaleString("en-IN")}` : `$${n}`);

/** Price per month of a plan. */
export const planMonthly = (p: Plan, c: Currency) => (c === "INR" ? p.inr : p.usd);
/** What is charged each time: the monthly price times the months in the plan. */
export const planTotal = (p: Plan, c: Currency) => planMonthly(p, c) * p.months;
export const planPerMonthLabel = (p: Plan, c: Currency) => money(planMonthly(p, c), c);
export const planTotalLabel = (p: Plan, c: Currency) => money(planTotal(p, c), c);

/** The one-month price (what a plain "Premium" costs) and the lowest per-month price (billed yearly). */
export const priceLabel = (c: Currency) => money(planMonthly(SITE.plans[0], c), c);
export const fromLabel = (c: Currency) => money(Math.min(...SITE.plans.map((p) => planMonthly(p, c))), c);

/** Indian visitors see rupees first. Only a default: the pricing page has a toggle. */
export function defaultCurrency(): Currency {
	try {
		if (Intl.DateTimeFormat().resolvedOptions().timeZone === "Asia/Calcutta" || Intl.DateTimeFormat().resolvedOptions().timeZone === "Asia/Kolkata") return "INR";
	} catch {
		/* ignore */
	}
	return "USD";
}

/** The env key holding a plan's Dodo product id: VITE_DODO_PRODUCT_<MONTH|HALF|YEAR>_<USD|INR>. */
export const productKey = (plan: PlanId, currency: Currency) => `VITE_DODO_PRODUCT_${plan.toUpperCase()}_${currency}`;

/**
 * Dodo Payments hosted checkout link for a plan. No server needed: the uid travels as metadata and comes back in the webhook, which is
 * what actually unlocks Premium. Returns null until that plan's product id is set in .env (the one-month plan also accepts the older
 * VITE_DODO_PRODUCT_USD / _INR keys).
 */
export function checkoutUrl({ uid, email, name, currency, plan = "month" }: { uid: string; email: string; name?: string; currency: Currency; plan?: PlanId }) {
	const product = env(productKey(plan, currency)) || (plan === "month" ? env(currency === "INR" ? "VITE_DODO_PRODUCT_INR" : "VITE_DODO_PRODUCT_USD") : "");
	if (!product) return null;
	const base = (env("VITE_DODO_CHECKOUT_BASE") || "https://checkout.dodopayments.com/buy").replace(/\/+$/, "");
	const q = new URLSearchParams({ quantity: "1", email, redirect_url: `${window.location.origin}/settings?payment=success`, metadata_uid: uid, metadata_plan: plan });
	if (name) q.set("fullName", name);
	return `${base}/${product}?${q.toString()}`;
}

export const portalUrl = () => env("VITE_DODO_PORTAL_URL") || null;
