/**
 * Append-only log of review rounds and approvals: data/chats/<id>.jsonl, one line per event.
 * The dashboard does not show it yet; it is here so chat history can be added later without a migration.
 */
import fsp from "fs/promises";
import path from "path";
import { DATA_DIR } from "../paths.js";

const CHATS_DIR = path.join(DATA_DIR, "chats");
const safe = (id) => String(id || "").replace(/[^a-zA-Z0-9-]/g, "");

export async function logChat(id, event) {
	const sid = safe(id);
	if (!sid) return;
	try {
		await fsp.mkdir(CHATS_DIR, { recursive: true });
		await fsp.appendFile(path.join(CHATS_DIR, `${sid}.jsonl`), `${JSON.stringify({ at: new Date().toISOString(), ...event })}\n`);
	} catch {
		/* the log is best effort */
	}
}
