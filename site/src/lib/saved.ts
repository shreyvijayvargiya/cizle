import { useCallback, useSyncExternalStore } from "react";
import { useAuth } from "@/lib/auth";

/**
 * Likes and bookmarks, kept per signed-in member (or "guest" before sign-in) in this browser's storage. Items are "p:<prompt id>" or "s:<skill slug>".
 * One tiny store shared by every card and both dialogs, so a heart tapped on a card is already filled in the dialog.
 */
export type SaveKind = "like" | "bookmark";
const cache = new Map<string, Set<string>>();
const listeners = new Set<() => void>();
let version = 0;
const storeKey = (uid: string, kind: SaveKind) => `cizle:${kind}:${uid}`;

function load(uid: string, kind: SaveKind) {
	const k = storeKey(uid, kind);
	let set = cache.get(k);
	if (!set) {
		try {
			set = new Set<string>(JSON.parse(localStorage.getItem(k) || "[]"));
		} catch {
			set = new Set(); // private mode or a damaged value: start empty
		}
		cache.set(k, set);
	}
	return set;
}

export function useSaved() {
	const { user } = useAuth();
	const uid = user?.uid || "guest";
	useSyncExternalStore(
		(cb) => (listeners.add(cb), () => listeners.delete(cb)),
		() => version,
		() => 0,
	);
	const has = useCallback((kind: SaveKind, id: string) => load(uid, kind).has(id), [uid]);
	const toggle = useCallback(
		(kind: SaveKind, id: string) => {
			const set = load(uid, kind);
			const on = !set.has(id);
			if (on) set.add(id);
			else set.delete(id);
			try {
				localStorage.setItem(storeKey(uid, kind), JSON.stringify([...set]));
			} catch {
				/* storage full or blocked: the change still shows for this visit */
			}
			version++;
			listeners.forEach((l) => l());
			return on;
		},
		[uid],
	);
	const list = useCallback((kind: SaveKind) => [...load(uid, kind)], [uid]);
	return { has, toggle, list, signedIn: Boolean(user) };
}
