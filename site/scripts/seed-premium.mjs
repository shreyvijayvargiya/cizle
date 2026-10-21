#!/usr/bin/env node
/**
 * Publish the premium prompts to Firestore (collection "premium", one document per skill). Run once, and again whenever a
 * premium prompt changes. Reads FIREBASE_SERVICE_ACCOUNT (JSON on one line) or ./service-account.json.
 *
 *   node scripts/seed-premium.mjs          # write everything
 *   node scripts/seed-premium.mjs --dry    # list what would be written
 */
import fs from "node:fs";
import path from "node:path";
import { cert, initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { SITE_DIR, copyPrompt, loadSkills, skillMd } from "./skills-source.mjs";

const dry = process.argv.includes("--dry");
const skills = loadSkills().filter((s) => s.tier === "premium");
if (dry) {
	for (const s of skills) console.log(`would write premium/${s.slug} (${copyPrompt(s).length} chars)`);
	console.log(`${skills.length} premium skills`);
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
const batch = db.batch();
for (const s of skills) batch.set(db.collection("premium").doc(s.slug), { promptText: copyPrompt(s), skillMd: skillMd(s), name: s.name, updatedAt: FieldValue.serverTimestamp() });
await batch.commit();
console.log(`seeded ${skills.length} premium skills`);
