import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { DEV_UNLOCK } from "./config";
import { firebaseConfigured, loadFirebase } from "./firebase";

export type Member = { uid: string; email: string; name: string; photo: string | null };
export type Subscription = { loaded: boolean; plan: "free" | "pro"; status: string | null; proUntil: Date | null; cancelAtPeriodEnd: boolean };
type AuthState = {
	configured: boolean;
	ready: boolean;
	user: Member | null;
	sub: Subscription;
	isPro: boolean;
	signInGoogle: () => Promise<void>;
	signInEmail: (email: string, password: string) => Promise<void>;
	signUpEmail: (email: string, password: string, name: string) => Promise<void>;
	resetPassword: (email: string) => Promise<void>;
	signOut: () => Promise<void>;
};

const FREE: Subscription = { loaded: false, plan: "free", status: null, proUntil: null, cancelAtPeriodEnd: false };
const Ctx = createContext<AuthState | null>(null);

export class AuthNotConfigured extends Error {
	constructor() {
		super("Sign-in is temporarily unavailable. Please try again soon.");
	}
}

/** Firebase error codes → something a person can act on. */
export function friendlyAuthError(e: unknown) {
	const code = String((e as { code?: string })?.code || "");
	const map: Record<string, string> = {
		"auth/invalid-credential": "That email and password do not match.",
		"auth/invalid-email": "That email address does not look right.",
		"auth/user-not-found": "No account with that email. Create one instead.",
		"auth/wrong-password": "That email and password do not match.",
		"auth/email-already-in-use": "An account with that email already exists. Sign in instead.",
		"auth/weak-password": "Use at least 6 characters for the password.",
		"auth/popup-closed-by-user": "The Google window was closed before signing in.",
		"auth/cancelled-popup-request": "The Google window was closed before signing in.",
		"auth/too-many-requests": "Too many attempts. Wait a minute and try again.",
		"auth/network-request-failed": "Network error. Check your connection and try again.",
	};
	return map[code] || (e instanceof Error ? e.message : "Something went wrong. Try again.");
}

export function AuthProvider({ children }: { children: ReactNode }) {
	const [ready, setReady] = useState(!firebaseConfigured);
	const [user, setUser] = useState<Member | null>(null);
	const [sub, setSub] = useState<Subscription>(FREE);
	const unsubDoc = useRef<(() => void) | null>(null);

	useEffect(() => {
		if (!firebaseConfigured) return;
		let off: (() => void) | undefined;
		let dead = false;
		loadFirebase().then(({ auth, db, authMod, fsMod }) => {
			if (dead) return;
			off = authMod.onAuthStateChanged(auth, (u) => {
				unsubDoc.current?.();
				unsubDoc.current = null;
				if (!u) {
					setUser(null);
					setSub({ ...FREE, loaded: true });
					setReady(true);
					return;
				}
				setUser({ uid: u.uid, email: u.email || "", name: u.displayName || (u.email || "").split("@")[0], photo: u.photoURL });
				setReady(true);
				// The subscription lives in users/{uid}, written only by the payment webhook. Live, so Premium unlocks the moment it lands.
				unsubDoc.current = fsMod.onSnapshot(
					fsMod.doc(db, "users", u.uid),
					(snap) => {
						const d = snap.data();
						const until = d?.proUntil?.toDate?.() as Date | undefined;
						setSub({ loaded: true, plan: d?.plan === "pro" ? "pro" : "free", status: d?.status ?? null, proUntil: until ?? null, cancelAtPeriodEnd: Boolean(d?.cancelAtPeriodEnd) });
					},
					() => setSub({ ...FREE, loaded: true }),
				);
			});
		});
		return () => {
			dead = true;
			off?.();
			unsubDoc.current?.();
		};
	}, []);

	const withFb = useCallback(async () => {
		if (!firebaseConfigured) throw new AuthNotConfigured();
		return loadFirebase();
	}, []);

	const value = useMemo<AuthState>(() => {
		const active = sub.plan === "pro" && (!sub.proUntil || sub.proUntil.getTime() > Date.now());
		return {
			configured: firebaseConfigured,
			ready,
			user: DEV_UNLOCK && !user ? { uid: "dev", email: "dev@cizle.local", name: "Dev (unlocked)", photo: null } : user,
			sub: DEV_UNLOCK ? { loaded: true, plan: "pro", status: "active", proUntil: new Date(Date.now() + 30 * 864e5), cancelAtPeriodEnd: false } : sub,
			isPro: DEV_UNLOCK || active,
			signInGoogle: async () => {
				const { auth, authMod } = await withFb();
				await authMod.signInWithPopup(auth, new authMod.GoogleAuthProvider());
			},
			signInEmail: async (email, password) => {
				const { auth, authMod } = await withFb();
				await authMod.signInWithEmailAndPassword(auth, email, password);
			},
			signUpEmail: async (email, password, name) => {
				const { auth, authMod } = await withFb();
				const cred = await authMod.createUserWithEmailAndPassword(auth, email, password);
				if (name) await authMod.updateProfile(cred.user, { displayName: name });
				setUser({ uid: cred.user.uid, email, name: name || email.split("@")[0], photo: null });
			},
			resetPassword: async (email) => {
				const { auth, authMod } = await withFb();
				await authMod.sendPasswordResetEmail(auth, email);
			},
			signOut: async () => {
				const { auth, authMod } = await withFb();
				await authMod.signOut(auth);
			},
		};
	}, [ready, user, sub, withFb]);

	return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
	const v = useContext(Ctx);
	if (!v) throw new Error("useAuth outside AuthProvider");
	return v;
}
