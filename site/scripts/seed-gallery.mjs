#!/usr/bin/env node
/**
 * Publish the full text of premium gallery prompts to Firestore (collection "gallery", one document per prompt), where the
 * rules let only active subscribers read it. Free samples are public already and are not written.
 *
 *   node scripts/seed-gallery.mjs          # write everything
 *   node scripts/seed-gallery.mjs --dry    # count only
 */
import fs from "node:fs";
import path from "node:path";
import { cert, initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { loadGallery } from "./gallery-source.mjs";
import { SITE_DIR } from "./skills-source.mjs";

const dry = process.argv.includes("--dry");
const items = loadGallery().filter((e) => e.tier === "premium");
if (dry) {
	console.log(`${items.length} premium gallery prompts (${items.reduce((n, e) => n + e.text.length, 0)} chars) would be written`);
	process.exit(0);
}
const file = path.join(SITE_DIR, "service-account.json");
const raw = process.env.FIREBASE_SERVICE_ACCOUNT || (fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "");
if (!raw) {
	console.error("Set FIREBASE_SERVICE_ACCOUNT or save the service account key as site/service-account.json (it is git-ignored).");
	process.exit(1);
}
initializeApp({ credential: cert(JSON.parse(raw)) });
const db = getFirestore();
for (let i = 0; i < items.length; i += 400) {
	const batch = db.batch();
	for (const e of items.slice(i, i + 400)) batch.set(db.collection("gallery").doc(e.gid), { text: e.text, title: e.title, updatedAt: FieldValue.serverTimestamp() });
	await batch.commit();
	console.log(`wrote ${Math.min(i + 400, items.length)}/${items.length}`);
}
console.log(`seeded ${items.length} premium gallery prompts`);
