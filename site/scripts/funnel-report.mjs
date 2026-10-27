/**
 * Print the conversion funnel, one row per day: npm run funnel [days]   (default 14)
 * Reads Firestore "funnel/<day>" with the Admin SDK, so it needs FIREBASE_SERVICE_ACCOUNT (the same JSON the webhook uses) in the environment.
 * Rates are against sessions: sign-in wall -> account -> pricing page -> checkout click.
 */
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
if (!raw) {
	console.error("Set FIREBASE_SERVICE_ACCOUNT (the service account JSON) first.");
	process.exit(1);
}
if (!getApps().length) initializeApp({ credential: cert(JSON.parse(raw)) });
const days = Math.max(1, Number(process.argv[2]) || 14);
const snap = await getFirestore().collection("funnel").orderBy("__name__", "desc").limit(days).get();
const COLS = ["visits", "gate_views", "logins", "signups", "premium_views", "pricing_views", "checkout_clicks"];
const pct = (a, b) => (b ? `${((a / b) * 100).toFixed(1)}%` : "-");
const rows = snap.docs.map((d) => ({ day: d.id, ...Object.fromEntries(COLS.map((c) => [c, Number(d.data()[c] || 0)])) })).reverse();
const sum = rows.reduce((t, r) => Object.fromEntries(COLS.map((c) => [c, (t[c] || 0) + r[c]])), {});
console.table([...rows, { day: "TOTAL", ...sum }]);
const accounts = sum.logins + sum.signups;
console.log(`Of ${sum.visits} visits: ${pct(sum.gate_views, sum.visits)} hit the sign-in wall, ${accounts} signed in (${pct(accounts, sum.visits)} of visits, ${sum.signups} new accounts), ${sum.premium_views} premium looks, ${sum.pricing_views} pricing views (${pct(sum.pricing_views, sum.visits)}), ${sum.checkout_clicks} checkout clicks (${pct(sum.checkout_clicks, sum.visits)}).`);
