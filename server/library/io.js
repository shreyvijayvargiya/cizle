import fs from "node:fs";
import fsp from "node:fs/promises";
import crypto from "node:crypto";
import os from "node:os";
import path from "node:path";

export async function writeJsonAtomic(file, obj, space) {
	await fsp.mkdir(path.dirname(file), { recursive: true });
	const tmp = `${file}.${process.pid}.${crypto.randomBytes(4).toString("hex")}.tmp`;
	await fsp.writeFile(tmp, JSON.stringify(obj, null, space));
	await fsp.rename(tmp, file);
}
export const readJson = (file, fallback = null) => {
	try {
		return JSON.parse(fs.readFileSync(file, "utf8"));
	} catch {
		return fallback;
	}
};
export function readJsonl(file) {
	if (!fs.existsSync(file)) return [];
	const out = [];
	for (const l of fs.readFileSync(file, "utf8").split("\n")) {
		if (!l.trim()) continue;
		try {
			out.push(JSON.parse(l));
		} catch {
			/* a torn last line */
		}
	}
	return out;
}
export async function writeJsonlAtomic(file, rows) {
	await fsp.mkdir(path.dirname(file), { recursive: true });
	const tmp = `${file}.${process.pid}.${crypto.randomBytes(4).toString("hex")}.tmp`;
	await fsp.writeFile(tmp, rows.map((r) => JSON.stringify(r)).join("\n") + (rows.length ? "\n" : ""));
	await fsp.rename(tmp, file);
}

export class LockedError extends Error {
	constructor(held) {
		super(`Another run is active (pid ${held.pid} on ${held.host}, started ${held.started}).`);
		this.code = "LOCKED";
		this.held = held;
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
/** A lock file with a heartbeat: stale after 45 s without one, or when the pid is gone on this machine. */
export async function acquireLock(file) {
	const held = readJson(file);
	if (held && held.pid !== process.pid) {
		const fresh = Date.now() - Date.parse(held.heartbeat) < 45_000;
		if (fresh && (held.host !== os.hostname() || alive(held.pid))) throw new LockedError(held);
	}
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
export const readLock = (file) => {
	const held = readJson(file);
	if (!held) return null;
	const fresh = Date.now() - Date.parse(held.heartbeat) < 45_000;
	return fresh && (held.host !== os.hostname() || alive(held.pid)) ? held : null;
};
