/**
 * The cizle agent: a short tool loop over one product's memory.
 *
 * It can read the product notes, recent changes, queued ideas and existing videos, run a sync, and
 * PROPOSE videos (they land in ideas.md with a Create button). It has no tool that renders anything:
 * only the founder's click spends money, so a hostile page or commit message can't trigger a render.
 */
import fsp from "fs/promises";
import path from "path";
import matter from "gray-matter";
import { openRouterChatRaw, openRouterChat, isFreeModel } from "../pipeline/openrouter.js";
import { listJobs } from "../pipeline/job.js";
import { parseJson } from "../pipeline/render.js";
import { PROMPTS_DIR } from "../library.js";
import { tierModels } from "../models.js";
import { addIdeas, cleanIdea, getProduct, readIdeas } from "../products/store.js";
import { ideaVocab, syncProduct } from "../products/sync.js";
import { UNTRUSTED_NOTE } from "../products/llm.js";

const MAX_ROUNDS = 6;

const TOOLS = [
	{ name: "read_product", description: "The product notes: positioning, features, pricing, tone.", parameters: { type: "object", properties: {} } },
	{ name: "read_changes", description: "What shipped recently (newest first), from the last syncs.", parameters: { type: "object", properties: {} } },
	{ name: "list_ideas", description: "Video ideas already on the list, with their status.", parameters: { type: "object", properties: {} } },
	{ name: "list_videos", description: "Videos already made for this product.", parameters: { type: "object", properties: {} } },
	{ name: "sync_now", description: "Check GitHub and the website for new commits, releases and pages. Can take up to a minute.", parameters: { type: "object", properties: {} } },
	{
		name: "propose_video",
		description: "Put a video idea on the founder's list. The founder decides whether to create it.",
		parameters: {
			type: "object",
			required: ["title", "type", "aspect", "why_now", "source"],
			properties: {
				title: { type: "string" },
				type: { type: "string", description: "A video type id" },
				tone: { type: "string", description: "A tone id, or auto" },
				aspect: { type: "string", enum: ["9:16", "1:1", "16:9"] },
				why_now: { type: "string" },
				source: { type: "string", description: "Where the facts come from, e.g. github:pr:41 or site:/pricing" },
				prompt: { type: "string", description: "1-2 sentences of direction, no URLs" },
			},
		},
	},
].map((t) => ({ type: "function", function: t }));

async function systemPrompt(product, vocab) {
	const raw = await fsp.readFile(path.join(PROMPTS_DIR, "agent.md"), "utf8").catch(() => "");
	const body = matter(raw).content.trim() || "You suggest short marketing videos for one SaaS product, grounded in its notes. You cannot render videos.";
	return `${body}\n\nProduct: ${product.name} (${product.url}). Category: ${product.category}.\nVideo type ids: ${[...vocab.types].filter((t) => t !== "auto").join(", ")}. Tone ids: ${[...vocab.tones].filter((t) => t !== "auto").join(", ")}.\n${UNTRUSTED_NOTE}`;
}

async function runTool(name, args, ctx) {
	switch (name) {
		case "read_product":
			return ctx.product.body.slice(0, 9000) || "(no notes yet)";
		case "read_changes":
			return ((await getProduct(ctx.slug))?.changes || "(nothing recorded yet)").slice(0, 6000);
		case "list_ideas":
			return JSON.stringify((await readIdeas(ctx.slug)).map(({ id, title, status, type, aspect, source }) => ({ id, title, status, type, aspect, source })));
		case "list_videos":
			return JSON.stringify((await listJobs({ product: ctx.slug })).slice(0, 15).map((v) => ({ title: v.title, type: v.type, aspect: v.aspect, status: v.status, made: v.created_at })));
		case "sync_now": {
			const r = await syncProduct(ctx.slug, { tier: ctx.tier });
			ctx.synced = true;
			return JSON.stringify({ changed: r.changed, summary: r.summary, ideas_added: r.ideas_added, busy: r.busy || false, errors: r.repo_errors });
		}
		case "propose_video": {
			if (ctx.proposals.length >= 3) return "Limit reached: at most 3 proposals per answer.";
			const idea = cleanIdea(args, ctx.vocab);
			if (!idea) return "Invalid idea: a title is required.";
			const [added] = await addIdeas(ctx.slug, [idea]);
			if (!added) return "That idea is already on the list.";
			ctx.proposals.push(added);
			return JSON.stringify({ ok: true, id: added.id });
		}
		default:
			return `Unknown tool ${name}`;
	}
}

/** Free models often can't call tools: answer from the notes in one shot and read proposals from a JSON block. */
async function plainAnswer(ctx, history, system) {
	const changes = (await getProduct(ctx.slug))?.changes || "";
	const queued = (await readIdeas(ctx.slug)).map((i) => `- ${i.title} (${i.status})`).join("\n");
	const res = await openRouterChat({
		model: ctx.model,
		messages: [
			{
				role: "system",
				content: `${system}\n\nYou cannot call tools in this mode. Everything you know is below. After your short answer, put up to 3 proposals in one fenced \`\`\`json block shaped {"proposals":[{"title","type","tone","aspect","why_now","source","prompt"}]}.\n\nPRODUCT NOTES:\n${ctx.product.body.slice(0, 7000)}\n\nRECENT CHANGES:\n${changes.slice(0, 3000)}\n\nALREADY QUEUED:\n${queued}`,
			},
			...history,
		],
		temperature: 0.5,
		maxTokens: 1500,
	});
	let reply = res.content;
	const block = reply.match(/```json\s*([\s\S]*?)```/i);
	if (block) {
		reply = reply.replace(block[0], "").trim();
		try {
			const items = parseJson(block[1])?.proposals;
			const cleaned = (Array.isArray(items) ? items : []).map((i) => cleanIdea(i, ctx.vocab)).filter(Boolean).slice(0, 3);
			ctx.proposals.push(...(await addIdeas(ctx.slug, cleaned)));
		} catch {
			/* no usable proposals */
		}
	}
	return { reply, usd: res.usage?.cost || 0 };
}

export async function runAgent({ slug, messages, tier = "paid" }) {
	const product = await getProduct(slug);
	if (!product) throw Object.assign(new Error("Product not found"), { status: 404 });
	const vocab = await ideaVocab();
	const model = tierModels(tier).script_model;
	const ctx = { slug, product, vocab, tier, model, proposals: [], synced: false };
	const history = (Array.isArray(messages) ? messages : [])
		.filter((m) => (m?.role === "user" || m?.role === "assistant") && typeof m.content === "string" && m.content.trim())
		.slice(-16)
		.map((m) => ({ role: m.role, content: m.content.slice(0, 4000) }));
	if (!history.length || history[history.length - 1].role !== "user") throw Object.assign(new Error("Send a message first."), { status: 400 });

	const system = await systemPrompt(product, vocab);
	const convo = [{ role: "system", content: system }, ...history];
	let usd = 0;
	let reply = "";
	let mode = "tools";
	try {
		for (let round = 0; round < MAX_ROUNDS; round++) {
			const res = await openRouterChatRaw({ model, messages: convo, tools: TOOLS, temperature: 0.4, maxTokens: 1800 });
			usd += res.usage?.cost || 0;
			const calls = res.message.tool_calls || [];
			if (!calls.length) {
				reply = String(res.message.content || "").trim();
				break;
			}
			convo.push({ role: "assistant", content: res.message.content || null, tool_calls: calls });
			for (const call of calls) {
				let args = {};
				try {
					args = JSON.parse(call.function?.arguments || "{}");
				} catch {
					/* bad arguments */
				}
				const out = await runTool(call.function?.name, args, ctx).catch((e) => `Error: ${e.message}`);
				convo.push({ role: "tool", tool_call_id: call.id, content: String(out).slice(0, 12_000) });
			}
		}
		if (!reply) reply = ctx.proposals.length ? "Here are my suggestions." : "I could not finish that. Try asking again, or run a sync first.";
	} catch (e) {
		if (e.code === "RATE_LIMIT" || e.code === "OPENROUTER_AUTH" || !/tool|function/i.test(e.message || "")) throw e;
		mode = "plain";
		ctx.proposals.length = 0;
		const r = await plainAnswer(ctx, history, system);
		reply = r.reply;
		usd += r.usd;
	}
	return { reply, proposals: ctx.proposals, synced: ctx.synced, cost_usd: usd, mode, model_is_free: isFreeModel(model) };
}
