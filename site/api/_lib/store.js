/**
 * Firebase, the only database. Three small reads: users/{uid} (plan, proUntil, mcpVer), premium/{slug} (locked skill text) and
 * gallery/{id} (locked prompt text, only when VITE_GALLERY_TEXT=firestore). The Admin SDK bypasses the rules, so every read here
 * is checked against the caller's plan first. A user document is cached for a minute, so a busy session costs one read.
 */
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";

let impl = null;
export const setStore = (s) => (impl = s); // tests plug a fake in here

export const projectId = () => {
	if (process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID) return process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID;
	try { return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || "{}").project_id || ""; } catch { return ""; }
};

function db() {
	if (!getApps().length) {
		const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
		if (!raw) throw new Error("FIREBASE_SERVICE_ACCOUNT is not set");
		initializeApp({ credential: cert(JSON.parse(raw)) });
	}
	return getFirestore();
}

const users = new Map();
const USER_TTL = 60_000;
export const clearUserCache = () => users.clear();

export async function getUser(uid) {
	if (impl) return impl.getUser(uid);
	const hit = users.get(uid);
	if (hit && Date.now() - hit.at < USER_TTL) return hit.value;
	const snap = await db().collection("users").doc(uid).get();
	const d = snap.data() || {};
	const value = { uid, plan: d.plan === "pro" ? "pro" : "free", proUntil: d.proUntil?.toDate?.() ?? null, mcpVer: Number(d.mcpVer) || 0, email: d.email || null };
	users.set(uid, { at: Date.now(), value });
	return value;
}
/** Revoke every MCP token this person has made. */
export async function bumpTokenVersion(uid) {
	if (impl) return impl.bumpTokenVersion(uid);
	const ref = db().collection("users").doc(uid);
	const now = await db().runTransaction(async (tx) => {
		const cur = Number((await tx.get(ref)).data()?.mcpVer) || 0;
		tx.set(ref, { mcpVer: cur + 1, mcpVerAt: FieldValue.serverTimestamp() }, { merge: true });
		return cur + 1;
	});
	users.delete(uid);
	return now;
}
export async function premiumSkill(slug) {
	if (impl) return impl.premiumSkill(slug);
	const snap = await db().collection("premium").doc(slug).get();
	return snap.exists ? { promptText: snap.data().promptText || "", skillMd: snap.data().skillMd || "" } : null;
}
export async function galleryText(id) {
	if (impl) return impl.galleryText(id);
	const snap = await db().collection("gallery").doc(id).get();
	return snap.exists ? String(snap.data().text || "") : null;
}
export const isPro = (u) => Boolean(u && u.plan === "pro" && u.proUntil && new Date(u.proUntil) > new Date());
