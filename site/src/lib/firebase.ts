import { env } from "./config";

/** Firebase is optional at build time: without keys the site still works and sign-in explains what is missing. */
export const firebaseConfigured = Boolean(env("VITE_FIREBASE_API_KEY") && env("VITE_FIREBASE_PROJECT_ID"));

let loading: Promise<{ auth: import("firebase/auth").Auth; db: import("firebase/firestore").Firestore; authMod: typeof import("firebase/auth"); fsMod: typeof import("firebase/firestore") }> | null = null;

/** Lazy: keeps ~150 KB of Firebase out of the first page load. */
export function loadFirebase() {
	loading ??= (async () => {
		const [{ initializeApp, getApps }, authMod, fsMod] = await Promise.all([import("firebase/app"), import("firebase/auth"), import("firebase/firestore")]);
		const app =
			getApps()[0] ||
			initializeApp({
				apiKey: env("VITE_FIREBASE_API_KEY"),
				authDomain: env("VITE_FIREBASE_AUTH_DOMAIN") || `${env("VITE_FIREBASE_PROJECT_ID")}.firebaseapp.com`,
				projectId: env("VITE_FIREBASE_PROJECT_ID"),
				appId: env("VITE_FIREBASE_APP_ID"),
				storageBucket: env("VITE_FIREBASE_STORAGE_BUCKET") || undefined,
				messagingSenderId: env("VITE_FIREBASE_MESSAGING_SENDER_ID") || undefined,
			});
		return { auth: authMod.getAuth(app), db: fsMod.getFirestore(app), authMod, fsMod };
	})();
	return loading;
}
