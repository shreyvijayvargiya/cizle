import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { firebaseConfigured, loadFirebase } from "./firebase";

/**
 * Public counters per prompt or skill, kept in Firestore (collection "stats", document "p-<prompt id>" or "s-<skill slug>"): likes, bookmarks, views.
 * The rules (firestore.rules) only let a client move one counter by one per write; likes and bookmarks need a signed-in member. Without Firebase keys
 * every call here does nothing and the cards simply show no counts.
 */
export type Stats = { likes: number; bookmarks: number; views: number };
export type StatField = keyof Stats;
const EMPTY: Stats = { likes: 0, bookmarks: 0, views: 0 };
/** A count is shown only above this number: a lone like or view says little. */
export const SHOW_COUNT_ABOVE = 1;

/** "p:x-2103…" → "p-x-2103…": a Firestore-safe document id. */
export const statsKey = (id: string) => id.replace(/[^A-Za-z0-9_-]+/g, "-").slice(0, 200);

/** Read one counter document. Pass `enabled` false until you need it (a card reads it on hover, not for all 8,000 cards). */
export const useStats = (id: string | null, enabled = true) =>
	useQuery({
		queryKey: ["stats", id],
		enabled: enabled && Boolean(id) && firebaseConfigured,
		staleTime: 2 * 60_000,
		gcTime: 10 * 60_000,
		retry: false,
		queryFn: async (): Promise<Stats> => {
			const { db, fsMod } = await loadFirebase();
			const snap = await fsMod.getDoc(fsMod.doc(db, "stats", statsKey(id!)));
			const d = snap.exists() ? snap.data() : {};
			return { likes: Number(d.likes || 0), bookmarks: Number(d.bookmarks || 0), views: Number(d.views || 0) };
		},
	});

/** Add or remove one from a counter. Updates the cached number at once; if the write is refused (not signed in, rules, offline) the cache is put back. */
export function useAdjustStat() {
	const qc = useQueryClient();
	return useCallback(
		async (id: string, field: StatField, delta: 1 | -1): Promise<boolean> => {
			if (!firebaseConfigured) return false;
			const key = ["stats", id];
			const before = qc.getQueryData<Stats>(key);
			if (before) qc.setQueryData<Stats>(key, { ...before, [field]: Math.max(0, before[field] + delta) });
			try {
				const { auth, db, fsMod } = await loadFirebase();
				if (field !== "views" && !auth.currentUser) throw new Error("sign in to count");
				await fsMod.setDoc(fsMod.doc(db, "stats", statsKey(id)), { [field]: fsMod.increment(delta), updatedAt: fsMod.serverTimestamp() }, { merge: true });
				return true;
			} catch {
				if (before) qc.setQueryData<Stats>(key, before);
				return false;
			}
		},
		[qc],
	);
}

/** Count a view once per browser tab and item: opening the same dialog again in the same visit does not add another. */
export function useRecordView() {
	const adjust = useAdjustStat();
	return useCallback(
		(id: string) => {
			try {
				const seen = new Set<string>(JSON.parse(sessionStorage.getItem("cizle-viewed") || "[]"));
				if (seen.has(id)) return;
				seen.add(id);
				sessionStorage.setItem("cizle-viewed", JSON.stringify([...seen].slice(-500)));
			} catch {
				/* private mode: count it, once per call */
			}
			void adjust(id, "views", 1);
		},
		[adjust],
	);
}

export { EMPTY as NO_STATS };
