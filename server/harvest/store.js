/**
 * Everything the harvester remembers lives in plain files under harvest/data (override with HARVEST_DIR). No database.
 *
 *   harvest/data/state.json            run pointer + status of every source
 *   harvest/data/.lock                 who is running (pid + heartbeat), so two runners never collide
 *   harvest/data/<source>/records.jsonl   append-only, one prompt record per line (the product)
 *   harvest/data/<source>/cursor.json     where the adapter stopped (page, index, listing), so it resumes
 *   harvest/data/<source>/meta.json       status, counts, robots findings, diagnostics
 *   harvest/data/<source>/raw/            cached raw downloads (listing, dataset, clone)
 */
import fs from "fs";
import fsp from "fs/promises";
import os from "os";
import path from "path";
import { ROOT } from "../paths.js";

export const harvestRoot = () => (process.env.HARVEST_DIR?.trim() ? path.resolve(process.env.HARVEST_DIR) : path.join(ROOT, "harvest"));
export const dataRoot = () => path.join(harvestRoot(), "data");
const ID_RE = /^[A-Za-z0-9_-]{1,40}$/;

export function sourceDir(id) {
	if (!ID_RE.test(String(id))) throw new Error(`Bad source id "${id}" (use letters, digits, - and _)`);
	return path.join(dataRoot(), id);
}

/** Write to a temp file and rename: a crash never leaves half a JSON file. */
export async function writeJsonAtomic(file, obj) {
	await fsp.mkdir(path.dirname(file), { recursive: true });
	const tmp = `${file}.${process.pid}.${Date.now()}.tmp`;
	await fsp.writeFile(tmp, JSON.stringify(obj, null, 2));
	await fsp.rename(tmp, file);
}

export async function readJson(file, fallback = null) {
	try {
		return JSON.parse(await fsp.readFile(file, "utf8"));
	} catch {
		return fallback;
	}
}

/**
 * Append-only JSON Lines with an in-memory id set. A crash can leave the last line half written: on open we skip unparseable
 * lines and make sure the file ends with a newline so the next record never glues onto the damaged one.
 */
export class RecordLog {
	constructor(file) {
		this.file = file;
		this.ids = new Set();
		this.chain = Promise.resolve();
	}

	async open() {
		await fsp.mkdir(path.dirname(this.file), { recursive: true });
		let text = "";
		try {
			text = await fsp.readFile(this.file, "utf8");
		} catch {
			/* first run */
		}
		for (const line of text.split("\n")) {
			if (!line) continue;
			try {
				const id = JSON.parse(line)?.id;
				if (id) this.ids.add(id);
			} catch {
				/* a line cut short by a crash */
			}
		}
		if (text && !text.endsWith("\n")) await fsp.appendFile(this.file, "\n");
		return this;
	}

	has(id) {
		return this.ids.has(id);
	}

	get size() {
		return this.ids.size;
	}

	/** @returns {Promise<boolean>} true when the record was new */
	add(record) {
		if (this.ids.has(record.id)) return Promise.resolve(false);
		this.ids.add(record.id);
		const line = `${JSON.stringify(record)}\n`;
		this.chain = this.chain.then(() => fsp.appendFile(this.file, line));
		return this.chain.then(() => true);
	}

	flush() {
		return this.chain;
	}
}

export async function readRecords(id, { limit = Infinity } = {}) {
	const out = [];
	let text = "";
	try {
		text = await fsp.readFile(path.join(sourceDir(id), "records.jsonl"), "utf8");
	} catch {
		return out;
	}
	for (const line of text.split("\n")) {
		if (!line) continue;
		try {
			out.push(JSON.parse(line));
		} catch {
			/* skip */
		}
		if (out.length >= limit) break;
	}
	return out;
}

/* ------------------------------------------------------------------ run lock */

const STALE_MS = 45_000;

export class LockedError extends Error {
	constructor(holder) {
		super(`Another harvest is running (pid ${holder.pid} on ${holder.host}, started ${holder.started}).`);
		this.code = "LOCKED";
		this.holder = holder;
	}
}

const alive = (pid) => {
	try {
		process.kill(pid, 0);
		return true;
	} catch (e) {
		return e.code === "EPERM";
	}
};

export async function readLock() {
	const lock = await readJson(path.join(dataRoot(), ".lock"));
	if (!lock) return null;
	const fresh = Date.now() - new Date(lock.heartbeat).getTime() < STALE_MS;
	const sameHost = lock.host === os.hostname();
	if (!fresh || (sameHost && !alive(lock.pid))) return null; // a crashed run: take over
	return lock;
}

/** One runner at a time (CLI or API). The lock refreshes every 10 s and is ignored once it goes stale or its process is gone. */
export async function acquireLock() {
	const file = path.join(dataRoot(), ".lock");
	const held = await readLock();
	if (held && held.pid !== process.pid) throw new LockedError(held);
	const body = { pid: process.pid, host: os.hostname(), started: new Date().toISOString(), heartbeat: new Date().toISOString() };
	await writeJsonAtomic(file, body);
	const timer = setInterval(() => writeJsonAtomic(file, { ...body, heartbeat: new Date().toISOString() }).catch(() => {}), 10_000);
	timer.unref();
	return {
		async release() {
			clearInterval(timer);
			await fsp.rm(file, { force: true });
		},
	};
}

export const stateFile = () => path.join(dataRoot(), "state.json");
export const exists = (p) => fs.existsSync(p);
