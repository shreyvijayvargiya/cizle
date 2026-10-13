/**
 * The cizle MCP server. It gives a client such as Claude Code the prompt library and the product context, and a tool that
 * renders the storyboard the client writes. The client's own model does all the reading and writing, so no OpenRouter
 * key or running dashboard is needed; videos land in the data directory the dashboard reads.
 */
import path from "path";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { bootLocal, describeJob, dashboardUrl, waitForJob } from "../local.js";
import { buildGuide } from "./guide.js";

const CATEGORIES = ["devtools", "analytics", "crm", "ai-agents", "project-management", "fintech", "marketing-seo", "security", "other"];
const STYLE_ENUM = ["auto", "default", "sketch", "clay", "glass", "isometric", "ascii"];

const text = (value) => ({ content: [{ type: "text", text: typeof value === "string" ? value : JSON.stringify(value, null, 2) }] });
const fail = (message) => ({ isError: true, content: [{ type: "text", text: String(message) }] });
const guarded = (fn) => async (args, extra) => {
	try {
		return await fn(args, extra);
	} catch (e) {
		return fail(e?.message || e);
	}
};

/**
 * Wait for a job, sending MCP progress notifications when the client asked for them (they keep a long call alive).
 * Many clients time a tool call out after about 60 seconds, so callers should wait in short slices.
 */
async function waitWithProgress(id, seconds, extra) {
	const token = extra?._meta?.progressToken;
	return waitForJob(id, {
		timeoutMs: seconds * 1000,
		onProgress: token === undefined ? undefined : (job) => extra.sendNotification({ method: "notifications/progress", params: { progressToken: token, progress: job.progress || 0, total: 100, message: `${job.step} ${job.progress || 0}%` } }).catch(() => {}),
	});
}

const sceneSchema = z
	.object({
		purpose: z.string().optional(),
		duration_sec: z.number().optional(),
		narration: z.string().optional(),
		on_screen_text: z.string().optional(),
		visual: z.record(z.string(), z.any()),
	})
	.passthrough();

const storyboardSchema = z
	.object({
		title: z.string(),
		logline: z.string().optional(),
		caption: z.string().optional(),
		cta: z.object({ text: z.string().optional(), url: z.string().optional() }).optional(),
		music: z.object({ mood: z.string().optional(), search_query: z.string().optional(), bpm: z.number().optional() }).optional(),
		theme: z.record(z.string(), z.any()).optional(),
		scenes: z.array(sceneSchema).min(1).max(14),
		pack: z.record(z.string(), z.any()).optional(),
	})
	.passthrough();

export async function createCizleServer() {
	const local = await bootLocal();
	const { jobs, library, store, deps } = local;
	const server = new McpServer({ name: "cizle", version: "0.1.0" });

	server.registerTool(
		"guide",
		{ title: "How to make a video", description: "Read this first. The storyboard format, scene types and limits, the animated styles, the video types and the creative laws. Nothing is invented by cizle: you write the storyboard from real material." },
		guarded(async () => text(await buildGuide(await library.listPrompts()))),
	);

	server.registerTool(
		"list_prompts",
		{ title: "List the prompt library", description: "Video types, tones, Opus film styles and the user's own prompts, with the render style and founder kinds each suits.", inputSchema: { kind: z.enum(["type", "tone", "film", "custom"]).optional() } },
		guarded(async ({ kind }) => {
			const all = await library.listPrompts();
			return text(all.filter((p) => !kind || p.kind === kind).map(({ id, kind: k, name, description, style, founders, needs, aspect, duration, category, uses }) => ({ id, kind: k, name, description, style, founders, needs, aspect, duration, category, uses })));
		}),
	);

	server.registerTool(
		"read_prompt",
		{ title: "Read a prompt", description: "The full markdown of a video type, tone or custom prompt (for example type:sketch-explainer). Follow its structure and rules when you write the storyboard.", inputSchema: { id: z.string() } },
		guarded(async ({ id }) => {
			const p = await library.getPrompt(id);
			return p ? text(`# ${p.name} (${p.id})\n${p.style ? `${p.kind === "film" ? "Closest cizle look" : "Default style"}: ${p.style}\n` : ""}${p.kind === "film" ? `Source: ${p.source} (${p.license}, ${p.author})\n` : ""}\n${p.body}`) : fail(`No prompt "${id}". Call list_prompts for the ids.`);
		}),
	);

	server.registerTool(
		"list_products",
		{ title: "List products", description: "Products cizle remembers (products/<slug>/product.md): name, site, repos, category." },
		guarded(async () => text(await store.listProducts())),
	);

	server.registerTool(
		"read_product",
		{ title: "Read product context", description: "A product's notes (positioning, features, pricing, tone), recent changes and queued video ideas. Use it as context for the storyboard.", inputSchema: { slug: z.string() } },
		guarded(async ({ slug }) => {
			const p = await store.getProduct(slug);
			return p ? text({ slug: p.slug, name: p.name, url: p.url, repos: p.repos, category: p.category, tagline: p.tagline, icp: p.icp, notes: p.body, changes: p.changes, ideas: p.ideas.filter((i) => i.status === "suggested").map((i) => ({ title: i.title, type: i.type, why_now: i.why_now })) }) : fail(`No product "${slug}". Call list_products, or save_product to create one.`);
		}),
	);

	server.registerTool(
		"save_product",
		{
			title: "Save product context",
			description: "Create or update the product's notes from what you read (site, blog, repo). Writes products/<slug>/product.md on this machine, no model involved. Keep notes factual: positioning, features, pricing, audience, tone.",
			inputSchema: {
				slug: z.string().optional().describe("Update this product. Omit to create a new one."),
				name: z.string(),
				url: z.string().optional(),
				repos: z.array(z.string()).optional().describe("GitHub repos as owner/name"),
				category: z.enum(CATEGORIES).optional(),
				tagline: z.string().optional(),
				icp: z.string().optional().describe("Who it is for"),
				notes: z.string().describe("Markdown body of product.md"),
			},
		},
		guarded(async ({ slug, name, url, repos, category, tagline, icp, notes }) => {
			const meta = { name, url, repos: repos ? store.normalizeRepos(repos) : undefined, category, tagline, icp };
			for (const k of Object.keys(meta)) if (meta[k] === undefined) delete meta[k];
			const p = slug && (await store.getProduct(slug)) ? await store.saveProduct(slug, { meta, body: notes }) : await store.createProduct({ name, url, repos: meta.repos, body: notes, meta });
			return text({ saved: true, slug: p.slug, name: p.name });
		}),
	);

	server.registerTool(
		"create_video",
		{
			title: "Render a video from a storyboard",
			description:
				"Renders the storyboard you wrote into an animated MP4 on this machine and stores it in the dashboard. No model call, no API key. Returns immediately with an id; call get_video until it is done. Call `guide` first for the format.",
			inputSchema: {
				storyboard: storyboardSchema,
				type: z.string().optional().describe("A video type slug, e.g. sketch-explainer. Its default style applies when you give none."),
				style: z.enum(STYLE_ENUM).optional(),
				aspect: z.enum(["9:16", "1:1", "16:9"]).optional(),
				audio: z.enum(["music", "silent", "voice"]).optional(),
				duration_sec: z.number().min(10).max(59).optional(),
				product: z.string().optional().describe("Product slug"),
				source_url: z.string().optional().describe("The page or repo the material came from"),
				request: z.string().optional().describe("The user's request, in their words"),
				wait_seconds: z.number().min(0).max(300).optional().describe("Wait up to this long for the render (default 0: return at once). A render takes 1-3 minutes and many clients time out a tool call after 60 s, so leave this unset and poll get_video with wait_seconds 45."),
			},
		},
		guarded(async ({ wait_seconds, ...body }, extra) => {
			let job = await jobs.createStoryboardJob(body, deps, { origin: { kind: "claude-code", client: "mcp" } });
			if (wait_seconds) job = (await waitWithProgress(job.id, wait_seconds, extra)) || job;
			return text(describeJob(job, jobs.jobDir));
		}),
	);

	server.registerTool(
		"get_video",
		{ title: "Video status", description: "Status and progress of a video, and when it is done the MP4 path on disk and the dashboard link.", inputSchema: { id: z.string(), wait_seconds: z.number().min(0).max(300).optional().describe("Wait up to this long for it to finish. Use 45 and call again if it is still rendering.") } },
		guarded(async ({ id, wait_seconds }, extra) => {
			let job = await jobs.getJob(id);
			if (!job) return fail(`No video "${id}".`);
			if (wait_seconds) job = (await waitWithProgress(id, wait_seconds, extra)) || job;
			return text(describeJob(job, jobs.jobDir));
		}),
	);

	server.registerTool(
		"list_videos",
		{ title: "List videos", description: "Videos in the dashboard, newest first.", inputSchema: { product: z.string().optional(), limit: z.number().min(1).max(50).optional() } },
		guarded(async ({ product, limit }) => {
			const rows = await jobs.listJobs({ product: product || "" });
			return text(rows.slice(0, limit || 15).map((r) => ({ id: r.id, title: r.title, type: r.type, status: r.status, aspect: r.aspect, duration_sec: r.duration_sec, origin: r.origin, created_at: r.created_at, dashboard_url: dashboardUrl(r.id) })));
		}),
	);

	server.registerTool(
		"reskin_video",
		{
			title: "Re-render a video in another style",
			description: "Render the same storyboard again as a new video in another style, aspect ratio or audio mode. Free: no model is involved. Works on videos made with create_video.",
			inputSchema: { id: z.string(), style: z.enum(STYLE_ENUM).optional(), aspect: z.enum(["9:16", "1:1", "16:9"]).optional(), audio: z.enum(["music", "silent", "voice"]).optional(), wait_seconds: z.number().min(0).max(300).optional() },
		},
		guarded(async ({ id, wait_seconds, ...overrides }, extra) => {
			let job = await jobs.reskinJob(id, overrides, deps);
			if (!job) return fail(`Video "${id}" has no stored storyboard (only videos made with create_video can be re-skinned).`);
			if (wait_seconds) job = (await waitWithProgress(job.id, wait_seconds, extra)) || job;
			return text(describeJob(job, jobs.jobDir));
		}),
	);

	server.registerTool(
		"cancel_video",
		{ title: "Stop a render", description: "Stop a video that is still rendering.", inputSchema: { id: z.string() } },
		guarded(async ({ id }) => {
			const job = await jobs.cancelJob(id);
			return job ? text(describeJob(job, jobs.jobDir)) : fail("That video is not rendering in this session.");
		}),
	);

	// One slash command per video type: /mcp__cizle__make-<type> <source>
	const types = (await library.listPrompts()).filter((p) => p.kind === "type");
	const recipe = (label, typeId, source, notes) =>
		`Make a ${label} video with the cizle MCP server for: ${source}${notes ? `\nNotes: ${notes}` : ""}\n\n1. Call \`guide\`, then \`read_prompt\` with ${typeId ? `id "${typeId}"` : "the video type that fits (call list_prompts)"} and follow its structure and rules.\n2. Gather the real material yourself: fetch the page or post, read the relevant code in this working directory, and call \`read_product\` (or \`save_product\` if there is none yet).\n3. Write the storyboard using only facts from that material.\n4. Call \`create_video\`${typeId ? ` with type "${typeId.replace(/^type:/, "")}"` : ""}, then call \`get_video\` with wait_seconds 45 until it is done.\n5. Reply with the video file path and the dashboard link.`;
	for (const t of types) {
		server.registerPrompt(
			`make-${t.slug}`,
			{ title: `Make a ${t.name} video`, description: t.description, argsSchema: { source: z.string().describe("A URL, a blog post, a repo path or a topic"), notes: z.string().optional().describe("Anything else: audience, length, style") } },
			({ source, notes }) => ({ messages: [{ role: "user", content: { type: "text", text: recipe(t.name, t.id, source, notes) } }] }),
		);
	}
	server.registerPrompt(
		"make-video",
		{ title: "Make a video", description: "Describe the video you want; cizle's prompt library does the rest.", argsSchema: { request: z.string() } },
		({ request }) => ({ messages: [{ role: "user", content: { type: "text", text: recipe("", null, request, "") } }] }),
	);

	return server;
}

export const dataDirNote = (dir) => path.relative(process.cwd(), dir) || dir;
