import fsp from "fs/promises";
import http from "http";
import os from "os";
import path from "path";

/** A fresh HARVEST_DIR per test, so runs never touch the repo's harvest/data. */
export async function tmpHarvest() {
	const dir = await fsp.mkdtemp(path.join(os.tmpdir(), "harvest-test-"));
	process.env.HARVEST_DIR = dir;
	return dir;
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** A tiny local web server: routes is (req, res) => boolean handled. Returns { url, close }. */
export async function serve(handler) {
	const server = http.createServer((req, res) => {
		if (!handler(req, res)) {
			res.statusCode = 404;
			res.end("not found");
		}
	});
	await new Promise((r) => server.listen(0, "127.0.0.1", r));
	const url = `http://127.0.0.1:${server.address().port}`;
	return { url, close: () => new Promise((r) => (server.closeAllConnections?.(), server.close(r))) };
}

/** Collect every event of a run. */
export const collector = () => {
	const events = [];
	const fn = (e) => events.push(e);
	fn.events = events;
	fn.of = (type, id) => events.filter((e) => e.type === type && (!id || e.id === id));
	return fn;
};

export const readLines = async (file) => (await fsp.readFile(file, "utf8")).split("\n").filter(Boolean).map((l) => JSON.parse(l));
