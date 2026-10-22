/**
 * A local log for every command that stores or updates the prompt library. One file per run in site/logs/
 * (<timestamp>-<command>.log, plain text) plus one line per finished run in site/logs/runs.jsonl. Logs are git-ignored.
 */
import fs from "node:fs";
import path from "node:path";
import { logsDir } from "./paths.js";

const stamp = (d = new Date()) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d+Z$/, "Z").replace("T", "-");

export function createRunLog(cmd, args = {}, { dir = logsDir(), echo = false } = {}) {
	fs.mkdirSync(dir, { recursive: true });
	const started = new Date();
	const id = `${stamp(started)}-${cmd}`;
	const file = path.join(dir, `${id}.log`);
	const fd = fs.openSync(file, "a");
	const write = (s) => fs.writeSync(fd, `${s}\n`);
	write(`# ${cmd} ${started.toISOString()} pid ${process.pid}`);
	write(`# args ${JSON.stringify(args)}`);
	let closed = false;
	return {
		id,
		file,
		started,
		log(msg) {
			if (closed) return;
			const line = `[${new Date().toISOString().slice(11, 19)}] ${msg}`;
			write(line);
			if (echo) console.log(line);
		},
		/** Finish the run: write the summary and index it in runs.jsonl. */
		end(summary = {}) {
			if (closed) return;
			closed = true;
			const rec = { id, cmd, started_at: started.toISOString(), ended_at: new Date().toISOString(), ms: Date.now() - started.getTime(), args, ...summary, log: path.relative(path.dirname(dir), file) };
			write(`# end ${JSON.stringify(summary)}`);
			fs.closeSync(fd);
			fs.appendFileSync(path.join(dir, "runs.jsonl"), `${JSON.stringify(rec)}\n`);
			return rec;
		},
	};
}
