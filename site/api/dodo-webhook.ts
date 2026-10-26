/**
 * The only server code in the project: Dodo Payments calls this when a subscription changes, and it flips users/{uid} in Firestore.
 * Firestore rules let a signed-in user read their own users/{uid} but never write it, so only this function can grant Premium.
 *
 * Deploy: Vercel picks up api/*.ts automatically. Set DODO_WEBHOOK_SECRET and FIREBASE_SERVICE_ACCOUNT in the host environment, then add
 * https://YOUR-DOMAIN/api/dodo-webhook in Dodo > Developer > Webhooks for the subscription and payment events.
 */
import { createHmac, timingSafeEqual } from "node:crypto";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { FieldValue, Timestamp, getFirestore } from "firebase-admin/firestore";

type Req = { method?: string; headers: Record<string, string | string[] | undefined>; body?: unknown; on: (e: string, f: (c: Buffer) => void) => void };
type Res = { status: (n: number) => Res; json: (b: unknown) => void; setHeader: (k: string, v: string) => void };

export const config = { api: { bodyParser: false } };

const DAY = 864e5;
const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || "";

function rawBody(req: Req): Promise<string> {
	return new Promise((resolve, reject) => {
		const chunks: Buffer[] = [];
		req.on("data", (c: Buffer) => chunks.push(c));
		req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
		req.on("error", reject);
	});
}

/** Standard Webhooks signature: HMAC-SHA256 of `${id}.${timestamp}.${body}` with the base64 secret, header "v1,<sig> v1,<sig>". */
export function verify(body: string, headers: Req["headers"], secret: string, now = Date.now()) {
	const id = first(headers["webhook-id"]);
	const ts = first(headers["webhook-timestamp"]);
	const sigs = first(headers["webhook-signature"]);
	if (!id || !ts || !sigs) return false;
	if (Math.abs(now / 1000 - Number(ts)) > 5 * 60) return false; // replay window
	const key = Buffer.from(secret.replace(/^whsec_/, ""), "base64");
	const expected = createHmac("sha256", key).update(`${id}.${ts}.${body}`).digest();
	return sigs.split(" ").some((part) => {
		const [version, sig] = part.split(",");
		if (version !== "v1" || !sig) return false;
		const got = Buffer.from(sig, "base64");
		return got.length === expected.length && timingSafeEqual(got, expected);
	});
}

function db() {
	if (!getApps().length) {
		const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
		if (!raw) throw new Error("FIREBASE_SERVICE_ACCOUNT is not set");
		initializeApp({ credential: cert(JSON.parse(raw)) });
	}
	return getFirestore();
}

/** Which Firebase user paid: the uid we put in the checkout link, else the paying email. */
async function uidFor(data: Record<string, any>) {
	const meta = data.metadata || {};
	if (typeof meta.uid === "string" && meta.uid) return meta.uid;
	const email = data.customer?.email;
	if (email) {
		try {
			return (await getAuth().getUserByEmail(email)).uid;
		} catch {
			return null;
		}
	}
	return null;
}

const ACTIVE = new Set(["subscription.active", "subscription.renewed", "subscription.plan_changed", "subscription.updated"]);
const ENDED = new Set(["subscription.expired", "subscription.failed", "subscription.on_hold"]);

/** What an event does to users/{uid}. Pure, so it can be tested without Firebase. */
export function subscriptionPatch(type: string, data: Record<string, any>, isPaid = false, now = Date.now()) {
	const nextBilling = data.next_billing_date ? new Date(data.next_billing_date) : null;
	// Plans bill every 1, 6 or 12 months. next_billing_date is what is paid for; without it, fall back on the plan's own interval plus a few days of grace.
	const count = Number(data.payment_frequency_count) || 1;
	const unit = String(data.payment_frequency_interval || "Month").toLowerCase();
	const months = unit.startsWith("year") ? count * 12 : unit.startsWith("week") ? count / 4 : unit.startsWith("day") ? count / 30 : count;
	const proUntil = nextBilling && !Number.isNaN(+nextBilling) ? nextBilling : new Date(now + Math.max(1, months) * 31 * DAY + 4 * DAY);
	const base = { subscriptionId: data.subscription_id || null, customerId: data.customer?.customer_id || null, email: data.customer?.email || null };
	if (ACTIVE.has(type) || isPaid) return { ...base, plan: "pro", status: "active", cancelAtPeriodEnd: false, proUntil: Timestamp.fromDate(proUntil) };
	// Cancelled means "does not renew": keep access to the end of the period that was paid for.
	if (type === "subscription.cancelled") return { ...base, plan: "pro", status: "cancelled", cancelAtPeriodEnd: true };
	if (ENDED.has(type)) return { ...base, plan: "free", status: type.replace("subscription.", ""), cancelAtPeriodEnd: false, proUntil: Timestamp.fromDate(new Date(now)) };
	return base;
}

export default async function handler(req: Req, res: Res) {
	if (req.method !== "POST") {
		res.setHeader("Allow", "POST");
		return res.status(405).json({ error: "POST only" });
	}
	const secret = process.env.DODO_WEBHOOK_SECRET;
	if (!secret) return res.status(500).json({ error: "DODO_WEBHOOK_SECRET is not set" });
	const body = await rawBody(req);
	if (!verify(body, req.headers, secret)) return res.status(401).json({ error: "Bad signature" });

	let event: { type?: string; data?: Record<string, any> };
	try {
		event = JSON.parse(body);
	} catch {
		return res.status(400).json({ error: "Bad JSON" });
	}
	const type = event.type || "";
	const data = event.data || {};
	const firestore = db();

	// Idempotency: Dodo retries, and the same event must not be applied twice.
	const id = first(req.headers["webhook-id"]);
	const seen = firestore.collection("webhooks").doc(id);
	if ((await seen.get()).exists) return res.status(200).json({ ok: true, duplicate: true });

	const isSub = type.startsWith("subscription.");
	const isPaid = type === "payment.succeeded" && data.subscription_id;
	if (!isSub && !isPaid) {
		await seen.set({ type, at: FieldValue.serverTimestamp(), ignored: true });
		return res.status(200).json({ ok: true, ignored: type });
	}
	const uid = await uidFor(data);
	if (!uid) {
		// 200 so Dodo stops retrying; the event is kept so support can match it by hand.
		await seen.set({ type, at: FieldValue.serverTimestamp(), unmatched: true, email: data.customer?.email || null, subscription: data.subscription_id || null });
		return res.status(200).json({ ok: true, unmatched: true });
	}

	const patch = subscriptionPatch(type, data, !!isPaid);
	await firestore.collection("users").doc(uid).set({ ...patch, updatedAt: FieldValue.serverTimestamp(), lastEvent: type }, { merge: true });
	await seen.set({ type, at: FieldValue.serverTimestamp(), uid });
	return res.status(200).json({ ok: true });
}
