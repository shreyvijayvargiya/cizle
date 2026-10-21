/**
 * A folder of JSON files in a GitHub repo (one file per prompt), e.g. data/library/<tweetid>.json.
 * mode "clone"  one sparse, blobless git clone of just that folder: a single transfer, then batches from disk (default when git exists)
 * mode "api"    Trees API for the listing, then raw.githubusercontent.com per file in paced batches
 */
import { execFile } from "child_process";
import fs from "fs";
import fsp from "fs/promises";
import path from "path";
import { promisify } from "util";
import { MAPPERS } from "./mappers.js";

const run = promisify(execFile);
const git = (args, opts) => run("git", args, { timeout: 15 * 60_000, maxBuffer: 16 * 1024 * 1024, ...opts });

async function hasGit() {
	try {
		await git(["--version"], { timeout: 10_000 });
		return true;
	} catch {
		return false;
	}
}

async function cloneFolder(ctx, { repo, ref, dir }) {
	const target = ctx.rawFile("clone");
	if (!fs.existsSync(path.join(target, ".git"))) {
		await fsp.rm(target, { recursive: true, force: true });
		ctx.log(`cloning ${repo}/${dir} (sparse, no history)`);
		await git(["clone", "--quiet", "--depth", "1", "--filter=blob:none", "--sparse", "--no-checkout", "--branch", ref, `https://github.com/${repo}`, target], { signal: ctx.signal });
		await git(["-C", target, "sparse-checkout", "set", dir], { signal: ctx.signal });
		await git(["-C", target, "checkout", "--quiet"], { signal: ctx.signal });
	}
	return target;
}

export default {
	id: "github-files",
	async run(ctx) {
		const { repo, ref = "main", dir, ext = ".json", mapper, mode = "auto" } = ctx.config;
		const map = MAPPERS[mapper];
		if (!repo || !dir || !map) throw new Error(`github-files needs config.repo, config.dir and a known config.mapper (got "${mapper}")`);

		const how = ctx.cursor.how || (mode === "api" || (mode === "auto" && !(await hasGit())) ? "api" : "clone");
		let files = ctx.cursor.files;
		let root = null;
		if (how === "clone") {
			root = await cloneFolder(ctx, { repo, ref, dir });
			files ||= (await fsp.readdir(path.join(root, dir))).filter((f) => f.endsWith(ext)).sort();
		} else if (!files) {
			const headers = process.env.GITHUB_TOKEN ? { authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {};
			const tree = await ctx.http.getJson(`https://api.github.com/repos/${repo}/git/trees/${ref}?recursive=1`, { headers });
			files = tree.tree.filter((e) => e.type === "blob" && e.path.startsWith(`${dir}/`) && e.path.endsWith(ext)).map((e) => e.path.slice(dir.length + 1)).sort();
			if (tree.truncated) ctx.log("GitHub truncated the tree listing; some files may be missing (set mode: clone)");
		}
		if (ctx.cursor.how !== how || !ctx.cursor.files) await ctx.setCursor({ how, files });
		if (!files.length) throw new Error(`No ${ext} files found in ${repo}/${dir}`);

		const idOf = (f) => `x:${f.slice(0, -ext.length)}`;
		const finished = await ctx.mapBatches(
			files,
			async (f) => {
				const text = how === "clone" ? await fsp.readFile(path.join(root, dir, f), "utf8") : await ctx.http.getText(`https://raw.githubusercontent.com/${repo}/${ref}/${dir}/${f}`);
				await ctx.emitRecord(map(ctx.id, JSON.parse(text)));
			},
			{ idOf, network: how === "api" },
		);
		if (finished && root) await fsp.rm(root, { recursive: true, force: true }); // free the disk once every file is in records.jsonl
	},
};
