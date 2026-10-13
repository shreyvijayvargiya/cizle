import { Link } from "@tanstack/react-router";
import { ArrowRight01Icon, ComputerTerminal01Icon, Video01Icon } from "@hugeicons/core-free-icons";
import { Page } from "@/components/AppShell";
import { CopyBox } from "@/components/CopyBox";
import { Icon } from "@/components/Icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fileUrl, usePrompts, useSettings, useVideos } from "@/lib/api";
import { cn, hostOf, timeAgo } from "@/lib/utils";
import { useWorkspace } from "@/lib/workspace";

const HOW = [
	["You ask Claude Code", "in plain words, in any project: \"make a 40 second sketch explainer of my latest blog post\"."],
	["Claude reads and writes", "It reads cizle's guide and prompt, your blog or code, and writes the storyboard on your own subscription."],
	["cizle renders it", "Animated frames, captions and music, rendered on this machine with FFmpeg. No model, no key."],
	["It lands here", "The MP4 and its storyboard are stored locally and show up under Videos with a Claude Code badge."],
] as const;

const TOOLS: [string, string][] = [
	["guide", "The storyboard format, scene types, styles, video types and laws. Claude reads it first."],
	["list_prompts / read_prompt", "The prompt library: 21 video types, 5 tones, 43 Opus film styles and your own prompts."],
	["list_products / read_product / save_product", "Product context. Claude can write it from what it read, no model on cizle's side."],
	["create_video", "Render a storyboard Claude wrote into an animated MP4."],
	["get_video / list_videos", "Progress, the file path and the dashboard link."],
	["reskin_video", "The same storyboard again in another style or aspect ratio. Free."],
	["cancel_video", "Stop a render."],
];

function Section({ title, hint, children, className }: { title: string; hint?: string; children: React.ReactNode; className?: string }) {
	return (
		<section className={cn("mt-8", className)}>
			<div className="mb-3">
				<h2 className="text-base font-semibold tracking-tight">{title}</h2>
				{hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
			</div>
			{children}
		</section>
	);
}

/** Everything about using cizle from Claude Code: install, examples, slash commands, tools and the videos it made. */
export function ClaudeCodePage() {
	const settings = useSettings();
	const prompts = usePrompts();
	const { product } = useWorkspace();
	const all = useVideos("");
	const made = (all.data || []).filter((v) => v.origin);
	const types = (prompts.data || []).filter((p) => p.kind === "type");
	const entry = settings.data?.mcp_entry || "/path/to/cizle/server/mcp/stdio.js";
	const site = product?.url ? hostOf(product.url) : "my site";
	const name = product?.name || "my product";

	const examples = [
		`Use cizle to make a 40-second sketch explainer of the latest blog post on ${site}. Explain the code using the main concept.`,
		`Use cizle to make a "what's new" video for ${name} from this week's commits. Clay style, 9:16.`,
		`Use cizle to make a 30-second pitch teaser for ${name}. Glass style, 16:9. Use only numbers you can find in the repo.`,
	];

	return (
		<Page title="Claude Code" description="Make videos from Claude Code on your own subscription. Claude writes the storyboard, cizle renders it into this dashboard. No OpenRouter key needed." wide>
			<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
				{HOW.map(([title, text], i) => (
					<div key={title} className="rounded-xl border border-border bg-surface p-4">
						<div className="mb-2 flex items-center gap-2">
							<span className="flex size-6 items-center justify-center rounded-md border border-border text-xs font-medium tabular-nums">{i + 1}</span>
							<p className="text-sm font-medium">{title}</p>
						</div>
						<p className="text-[13px] leading-relaxed text-muted-foreground">{text}</p>
					</div>
				))}
			</div>

			<Section title="Install" hint="Once. It adds cizle to Claude Code for every project, including your SaaS repo.">
				<div className="grid gap-3 lg:grid-cols-2">
					<CopyBox label="From the cizle folder" text="npm install && npm run mcp:install" />
					<CopyBox label="Or by hand, from anywhere" text={`claude mcp add --scope user cizle -- node ${entry}`} />
				</div>
				<p className="mt-2 text-xs text-muted-foreground">
					Opening this repository in Claude Code also offers the project's <span className="font-mono">.mcp.json</span>. You need Node 20.12+, Chrome and FFmpeg, as for the dashboard. To see videos while Claude works, run <span className="font-mono">npm run dev</span> and start Claude Code with{" "}
					<span className="font-mono">CIZLE_DASHBOARD_URL=http://localhost:5173</span>.
				</p>
			</Section>

			<Section title="Try these in Claude Code" hint={product ? `Filled in for ${product.name}.` : "Add a product and these fill in with its name and site."}>
				<div className="grid gap-3 lg:grid-cols-3">
					{examples.map((e) => (
						<CopyBox key={e} text={e} mono={false} />
					))}
				</div>
			</Section>

			<Section title="Slash commands" hint="Every video type is a command. Type /mcp__cizle in Claude Code to see them all, then add your source (a URL, a repo or a topic).">
				<div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
					{types.map((t) => (
						<CopyBox key={t.id} text={`/mcp__cizle__make-${t.slug}`} className="[&_p]:py-1.5" label={t.name} />
					))}
					<CopyBox text="/mcp__cizle__make-video" label="Anything else" className="[&_p]:py-1.5" />
				</div>
			</Section>

			<Section title="What Claude can do" hint="The tools the MCP server gives Claude Code.">
				<div className="overflow-hidden rounded-xl border border-border bg-surface">
					{TOOLS.map(([tool, text]) => (
						<div key={tool} className="flex flex-col gap-0.5 border-b border-border px-4 py-2.5 last:border-b-0 sm:flex-row sm:items-baseline sm:gap-4">
							<code className="shrink-0 font-mono text-xs sm:w-72">{tool}</code>
							<p className="text-[13px] text-muted-foreground">{text}</p>
						</div>
					))}
				</div>
			</Section>

			<Section title="Made with Claude Code" hint="Stored in data/videos with their storyboards. Open one to re-skin it in another style, for free.">
				{made.length ? (
					<div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
						{made.slice(0, 12).map((v) => {
							const thumb = fileUrl(v.id, v.thumbnail_path);
							return (
								<Link key={v.id} to="/videos/$id" params={{ id: v.id }} className="group block">
									<div className={cn("relative overflow-hidden rounded-lg border border-border bg-muted", v.aspect === "9:16" ? "aspect-[9/16]" : v.aspect === "4:5" ? "aspect-[4/5]" : v.aspect === "1:1" ? "aspect-square" : "aspect-video")}>
										{thumb ? <img src={thumb} alt="" className="size-full object-cover" /> : <Icon icon={Video01Icon} size={20} className="absolute inset-0 m-auto text-muted-foreground" />}
									</div>
									<p className="mt-1.5 truncate text-xs font-medium">{v.title}</p>
									<p className="truncate text-[11px] text-muted-foreground">
										{v.type} · {timeAgo(v.created_at)}
									</p>
								</Link>
							);
						})}
					</div>
				) : (
					<div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dashed border-border p-5">
						<p className="text-sm text-muted-foreground">Nothing yet. Copy one of the examples above into Claude Code.</p>
						<Badge tone="outline">
							<Icon icon={ComputerTerminal01Icon} size={12} /> waiting for the first video
						</Badge>
					</div>
				)}
			</Section>

			<Section title="Not working?" hint="If Claude says it has no cizle tools, or offers to clone the repo instead.">
				<div className="grid gap-3 lg:grid-cols-2">
					<CopyBox label="Run in the cizle folder: checks everything and prints what to fix" text="npm run mcp:doctor" />
					<CopyBox label="Then, in your terminal, in your project" text="claude mcp list   # cizle should be connected" />
				</div>
				<ul className="mt-3 grid gap-x-8 gap-y-2 text-[13px] text-muted-foreground sm:grid-cols-2">
					<li>
						<span className="font-medium text-foreground">Use the terminal app.</span> Claude Code on the web cannot see a server on your computer. Run <span className="font-mono">claude</span> locally and type <span className="font-mono">/mcp</span>.
					</li>
					<li>
						<span className="font-medium text-foreground">Restart the session</span> after adding the server. Sessions already open do not pick it up.
					</li>
					<li>
						<span className="font-medium text-foreground">No <span className="font-mono">claude</span> command?</span> <span className="font-mono">curl -fsSL https://claude.ai/install.sh | bash</span>, then open a new terminal.
					</li>
					<li>
						<span className="font-medium text-foreground">Pending approval?</span> Approve the project's <span className="font-mono">.mcp.json</span> in Claude Code, or add cizle at user scope.
					</li>
				</ul>
			</Section>

			<Section title="Good to know">
				<ul className="grid gap-x-8 gap-y-2 text-[13px] text-muted-foreground sm:grid-cols-2">
					<li>
						<span className="font-medium text-foreground">Your model.</span> Claude Code uses the model you picked (choose Opus for the best storyboards). A 40-second storyboard is a few thousand output tokens.
					</li>
					<li>
						<span className="font-medium text-foreground">Voice.</span> Without a text-to-speech key you get on-screen text, captions and music. Add an OpenRouter key and voice-over works too.
					</li>
					<li>
						<span className="font-medium text-foreground">Time.</span> A video takes one to three minutes. Claude checks progress and gives you the file path and link when it is done.
					</li>
					<li>
						<span className="font-medium text-foreground">Local.</span> Nothing is uploaded. Videos, storyboards and product notes live in this folder, and the storyboard is kept so a video can be re-rendered later.
					</li>
				</ul>
				<div className="mt-4 flex flex-wrap gap-2">
					<Button variant="outline" size="sm" asChild>
						<Link to="/prompts" search={{ kind: "film" }}>
							Browse the 43 Opus film styles <Icon icon={ArrowRight01Icon} size={14} />
						</Link>
					</Button>
					<Button variant="outline" size="sm" asChild>
						<Link to="/gallery">
							Open the prompt gallery <Icon icon={ArrowRight01Icon} size={14} />
						</Link>
					</Button>
				</div>
			</Section>
		</Page>
	);
}
