/**
 * Sign-in. The website signs people in with Firebase Auth; this turns that into a long-lived MCP token for Claude.
 *  - verifyFirebaseIdToken: checks a Firebase ID token (a JWT) against Google's public keys.
 *  - issueToken / verifyToken: the cizle MCP token, an HS256 JWT signed with MCP_JWT_SECRET. It names the person (sub) and a version
 *    (ver). Revoking bumps the version stored on users/{uid}, which kills every older token at once.
 * The token never carries the plan: that is looked up on each request, so a lapsed subscription locks the premium library again at once.
 */
import { SignJWT, createRemoteJWKSet, jwtVerify } from "jose";
import { getUser, isPro, projectId } from "./store.js";

const ISS = "cizle";
const AUD = "cizle-mcp";
const JWKS = createRemoteJWKSet(new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"));
let verifyIdOverride = null;
export const setIdVerifier = (f) => (verifyIdOverride = f); // tests

function secret() {
	const s = process.env.MCP_JWT_SECRET || "";
	if (s.length < 32) throw new Error("MCP_JWT_SECRET is not set (use at least 32 random characters)");
	return new TextEncoder().encode(s);
}

export async function verifyFirebaseIdToken(idToken) {
	if (verifyIdOverride) return verifyIdOverride(idToken);
	const pid = projectId();
	if (!pid) throw new Error("FIREBASE_PROJECT_ID is not set");
	const { payload } = await jwtVerify(idToken, JWKS, { issuer: `https://securetoken.google.com/${pid}`, audience: pid });
	if (!payload.sub) throw new Error("No user in that token");
	return { uid: String(payload.sub), email: payload.email ? String(payload.email) : null };
}

export async function issueToken(uid, ver = 0, days = 180) {
	return new SignJWT({ ver }).setProtectedHeader({ alg: "HS256" }).setSubject(uid).setIssuer(ISS).setAudience(AUD).setIssuedAt().setExpirationTime(`${days}d`).sign(secret());
}
export async function verifyToken(token) {
	const { payload } = await jwtVerify(token, secret(), { issuer: ISS, audience: AUD, algorithms: ["HS256"] });
	return { uid: String(payload.sub), ver: Number(payload.ver) || 0, exp: payload.exp };
}

/**
 * Who is calling. No Authorization header: an anonymous visitor, who gets the free library. A good token: the person and whether Premium
 * is active right now. A bad, expired or revoked token: still anonymous, with `problem` so the tools can say how to fix it.
 */
export async function identify(headers) {
	const h = typeof headers.get === "function" ? headers.get("authorization") : headers.authorization;
	const m = /^Bearer\s+(.+)$/i.exec(h || "");
	if (!m) return { uid: null, pro: false, problem: null };
	try {
		const t = await verifyToken(m[1].trim());
		const user = await getUser(t.uid);
		if (t.ver !== (user.mcpVer || 0)) return { uid: null, pro: false, problem: "This token was revoked. Make a new one at https://cizle.dev/connect." };
		return { uid: t.uid, pro: isPro(user), plan: user.plan, proUntil: user.proUntil || null, problem: null, exp: t.exp };
	} catch (e) {
		const expired = /exp/i.test(String(e.code || e.message));
		return { uid: null, pro: false, problem: expired ? "This token has expired. Make a new one at https://cizle.dev/connect." : "That token is not valid. Make a new one at https://cizle.dev/connect." };
	}
}
