/**
 * Onboarding: URL (+ optional repos) → product memory + the first video ideas.
 *
 *   1. read    the existing context agent reads the site, llms.txt, blog, first repo and takes screenshots;
 *              extra repos are read lightly (README + description) so several repos stay quick
 *   2. write   one model call writes the product notes and suggests three first videos
 *   3. save    products/<slug>/ is created and a baseline of the repos and site is recorded,
 *              so the first sync only reports what ships after today
 *
 * Runs in the background; the dashboard polls getOnboard(id).
 */
import fsp from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { load } from "cheerio";
import { gatherProductContext } from "../pipeline/context.js";
import { buildBriefUserText } from "../pipeline/directorPrompts.js";
import { DATA_DIR } from "../paths.js";
import { productJson, untrusted, UNTRUSTED_NOTE } from "./llm.js";
import { ideaVocab, takeSnapshot } from "./sync.js";
import { addIdeas, cleanIdea, createProduct, normalizeRepo, normalizeRepos, productDir, repoUrl, writeSources } from "./store.js";

export const CATEGORIES = ["devtools", "analytics", "crm", "ai-agents", "project-management", "fintech", "marketing-seo", "security", "other"];
const runs = new Map();

const STEPS = [
	{ id: "read", label: "Reading your site, blog and repos" },
	{ id: "write", label: "Writing what cizle knows about the product" },
	{ id: "save", label: "Saving it to products/ and suggesting videos" },
];

function normUrl(raw) {
	const s = String(raw || "").trim();
	if (!s) return null;
	try {
		return new URL(/^https?:\/\//i.test(s) ? s : `https://${s}`).toString();
	} catch {
		return null;
	}
}

/** README + description for repos beyond the first, with no clone and no API. */
async function repoLite(repo) {
	const get = async (u) => {
		const res = await fetch(u, { headers: { "User-Agent": "cizle" }, signal: AbortSignal.timeout(15_000) });
		return res.ok ? res.text() : "";
	};
	const [readme, page] = await Promise.all([get(`https://raw.githubusercontent.com/${repo}/HEAD/README.md`).catch(() => ""), get(repoUrl(repo)).catch(() => "")]);
	const description = page ? load(page)('meta[property="og:description"]').attr("content") || "" : "";
	return { repo, description, readme: readme.slice(0, 5000) };
}

const SYSTEM = (types, tones) => `You write the memory file for a SaaS product, used later to plan marketing videos. Use ONLY facts found in the input; if something is unknown, leave it out or use an empty value. ${UNTRUSTED_NOTE}

Return ONLY JSON:
{
  "name": "product name",
  "tagline": "one line, max 90 characters",
  "category": one of ${JSON.stringify(CATEGORIES)},
  "icp": "who it is for, one sentence",
  "positioning": "2-3 plain sentences: the problem and how the product solves it",
  "features": [{ "name": "...", "benefit": "...", "source": "site:/path | github:README | blog:<post title>" }],
  "pricing": [{ "plan": "...", "price": "...", "notes": "..." }],
  "proof": ["customer logos, numbers, awards actually stated"],
  "tone": "how the product talks: 5-10 words",
  "hooks": ["3 opening lines grounded in real pain points"],
  "ideas": [
    { "title": "short video title", "type": "<type id>", "tone": "<tone id or auto>", "aspect": "16:9 | 9:16 | 1:1", "why_now": "why this video first", "source": "where the facts come from", "prompt": "1-2 sentences of direction, no URLs" }
  ]
}
Ideas: exactly 3. 1) a product showcase in 16:9, 2) the strongest single feature in 9:16, 3) a short launch-style teaser in 1:1.
Allowed type ids: ${types.join(", ")}. Allowed tone ids: ${tones.join(", ")}.`;

function renderBody(p) {
	const list = (arr, fmt) => (Array.isArray(arr) && arr.length ? arr.map(fmt).join("\n") : "");
	const sections = [
		["Positioning", p.positioning],
		["Who it's for", p.icp],
		["Features", list(p.features, (f) => `- **${f.name}** — ${f.benefit}${f.source ? ` *(${f.source})*` : ""}`)],
		["Pricing", list(p.pricing, (x) => `- **${x.plan}** — ${x.price}${x.notes ? ` (${x.notes})` : ""}`)],
		["Proof", list(p.proof, (x) => `- ${x}`)],
		["Tone", p.tone],
		["Hooks", list(p.hooks, (x) => `- ${x}`)],
	];
	return sections
		.filter(([, v]) => v && String(v).trim())
		.map(([h, v]) => `## ${h}\n${String(v).trim()}`)
		.join("\n\n");
}

export function getOnboard(id) {
	return runs.get(id) || null;
}

export function startOnboard(raw, deps) {
	const url = normUrl(raw.url);
	if (!url) throw Object.assign(new Error("Add your product's website or GitHub repo."), { status: 400 });
	const repos = normalizeRepos(raw.repos);
	const urlRepo = normalizeRepo(url);
	if (urlRepo && !repos.includes(urlRepo)) repos.unshift(urlRepo);
	const run = {
		id: uuidv4(),
		status: "running",
		steps: STEPS.map((s) => ({ ...s, state: "pending" })),
		slug: null,
		ideas: [],
		error: null,
		cost_usd: 0,
		created_at: new Date().toISOString(),
	};
	runs.set(run.id, run);
	// Keep only the last few runs in memory.
	for (const k of [...runs.keys()].slice(0, Math.max(0, runs.size - 10))) runs.delete(k);
	execute(run, { url, repos, name: String(raw.name || "").trim(), tier: raw.model_tier === "free" ? "free" : "paid" }, deps).catch((e) => {
		run.status = "failed";
		run.error = e?.message || String(e);
		const active = run.steps.find((s) => s.state === "active");
		if (active) active.state = "failed";
	});
	return run;
}

async function execute(run, { url, repos, name, tier }, deps) {
	const mark = (id, state) => {
		run.steps.find((s) => s.id === id).state = state;
	};
	const workDir = path.join(DATA_DIR, "onboarding", run.id);
	await fsp.mkdir(workDir, { recursive: true });
	const log = () => {};

	// 1. read ------------------------------------------------------------------
	mark("read", "active");
	const input = {
		url,
		github_url: url && !normalizeRepo(url) && repos[0] ? repoUrl(repos[0]) : null,
		compare_urls: [],
		blog_url: null,
		extra_urls: [],
		max_blog_posts: 3,
		max_screenshots: 4,
		max_images: 3,
		aspect: "16:9",
	};
	// The baseline snapshot runs alongside, so the first sync reports only what ships after today.
	const baselineP = takeSnapshot({ url, repos, baseline: true }).catch(() => null);
	const [gathered, extra] = await Promise.all([gatherProductContext({ input, deps, workDir, log }), Promise.all(repos.slice(1).map((r) => repoLite(r).catch(() => null)))]);
	const context = { ...gathered.context };
	const more = extra.filter(Boolean);
	if (more.length) context.other_repos = more;
	mark("read", "done");

	// 2. write -----------------------------------------------------------------
	mark("write", "active");
	const vocab = await ideaVocab();
	const typeIds = [...vocab.types].filter((t) => t !== "auto");
	const toneIds = [...vocab.tones].filter((t) => t !== "auto");
	const { data, usd } = await productJson({
		tier,
		system: SYSTEM(typeIds, toneIds),
		user: untrusted("product", buildBriefUserText(context).slice(0, 30_000)),
		maxTokens: 4500,
		temperature: 0.3,
	});
	run.cost_usd = usd;
	mark("write", "done");

	// 3. save ------------------------------------------------------------------
	mark("save", "active");
	const product = await createProduct({
		name: name || String(data.name || gathered.source.name || "").slice(0, 60),
		url,
		repos,
		body: renderBody(data) || `## Positioning\n${gathered.source.title || ""}`,
		meta: {
			tagline: String(data.tagline || "").slice(0, 120),
			category: CATEGORIES.includes(data.category) ? data.category : "other",
			icp: String(data.icp || "").slice(0, 200),
			last_synced: new Date().toISOString(),
		},
	});
	const assets = path.join(productDir(product.slug), "assets");
	await fsp.mkdir(assets, { recursive: true });
	for (const f of gathered.frames.slice(0, 6)) {
		const src = f.preview || f.file;
		if (src) await fsp.copyFile(src, path.join(assets, `${f.id}${path.extname(src)}`)).catch(() => {});
	}
	const ideas = (Array.isArray(data.ideas) ? data.ideas : []).map((i) => cleanIdea(i, vocab)).filter(Boolean).slice(0, 3);
	run.ideas = await addIdeas(product.slug, ideas);
	const snap = await baselineP;
	await writeSources(product.slug, { ...(snap?.state || {}), last_synced: new Date().toISOString() });
	await fsp.rm(workDir, { recursive: true, force: true }).catch(() => {});
	run.slug = product.slug;
	mark("save", "done");
	run.status = "success";
}
