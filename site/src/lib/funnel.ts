import { firebaseConfigured, loadFirebase } from "./firebase";

/**
 * The conversion funnel, one counter document per day (Firestore collection "funnel", document "YYYY-MM-DD"):
 *   visits          a browser session that opened the site
 *   gate_views      a visitor who was shown the sign-in wall
 *   logins/signups  a visitor who signed in / made an account
 *   premium_views   a signed-in free member who opened a locked premium prompt (wants the full text)
 *   pricing_views   the pricing page opened
 *   checkout_clicks the Get Premium button pressed
 * The rules (firestore.rules) let a client raise one counter by one per write and read nothing back; `npm run funnel` prints the table.
 * Without Firebase keys every call does nothing.
 */
export type FunnelEvent = "visits" | "gate_views" | "logins" | "signups" | "premium_views" | "pricing_views" | "checkout_clicks";

const isBot = () => typeof navigator === "undefined" || /bot|crawl|spider|headless|lighthouse|prerender/i.test(navigator.userAgent);

/** Count an event. With `once` it counts a single time per browser tab session (per `key` when given), so a reload or a second look is not a second visit. */
export function track(event: FunnelEvent, opts: { once?: boolean; key?: string } = {}) {
	if (!firebaseConfigured || isBot()) return;
	if (opts.once) {
		const mark = `cizle-fn-${event}${opts.key ? `-${opts.key}` : ""}`;
		try {
			if (sessionStorage.getItem(mark)) return;
			sessionStorage.setItem(mark, "1");
		} catch {
			/* private mode: count it */
		}
	}
	const day = new Date().toISOString().slice(0, 10);
	loadFirebase()
		.then(({ db, fsMod }) => fsMod.setDoc(fsMod.doc(db, "funnel", day), { [event]: fsMod.increment(1), updatedAt: fsMod.serverTimestamp() }, { merge: true }))
		.catch(() => {
			/* counting must never break the page */
		});
}
