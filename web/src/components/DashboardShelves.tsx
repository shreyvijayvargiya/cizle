import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ArrowRight01Icon, ComputerTerminal01Icon, GridViewIcon } from "@hugeicons/core-free-icons";
import { CopyBox } from "@/components/CopyBox";
import { Icon } from "@/components/Icon";
import { Motion, StylePreview } from "@/components/PromptPreview";
import { Button } from "@/components/ui/button";
import { api, usePrompts, useVideos, type StyleId } from "@/lib/api";
import { STYLES } from "@/lib/constants";
import { cn, hostOf } from "@/lib/utils";
import { useWorkspace } from "@/lib/workspace";

/** The prompt gallery on the dashboard: one animated tile per style, with counts. Each tile opens the gallery filtered to that style. */
export function PromptShelf({ className }: { className?: string }) {
	const { slug } = useWorkspace();
	const prompts = usePrompts();
	const gallery = useQuery({ queryKey: ["gallery", slug], queryFn: () => api.gallery(slug) });
	const presets = gallery.data?.presets || [];
	const types = (prompts.data || []).filter((p) => p.kind === "type").length;
	const films = (prompts.data || []).filter((p) => p.kind === "film").length;
	return (
		<section className={className}>
			<div className="mb-3 flex flex-wrap items-end justify-between gap-2">
				<div>
					<h2 className="flex items-center gap-1.5 text-base font-semibold tracking-tight">
						<Icon icon={GridViewIcon} size={16} className="text-muted-foreground" /> Prompt gallery
					</h2>
					<p className="text-xs text-muted-foreground">
						{presets.length || "—"} formats · {types || "—"} video types · {films || "—"} Opus film styles. Pick a look, remix it for your product.
					</p>
				</div>
				<div className="flex gap-2">
					<Button variant="outline" size="sm" asChild>
						<Link to="/prompts" search={{ kind: "film" }}>
							Film styles
						</Link>
					</Button>
					<Button variant="outline" size="sm" asChild>
						<Link to="/gallery" search={{}}>
							Open the gallery <Icon icon={ArrowRight01Icon} size={14} />
						</Link>
					</Button>
				</div>
			</div>
			<div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
				{STYLES.filter((s) => s.value !== "auto").map((s) => (
					<Link key={s.value} to="/gallery" search={{ style: s.value }} className="group overflow-hidden rounded-xl border border-border bg-surface transition-colors hover:bg-accent/50">
						<div className="h-24 overflow-hidden border-b border-border bg-muted">
							{s.value === "default" ? <div className="flex size-full items-center justify-center bg-surface/60"><Motion name="ui-zoom" /></div> : <StylePreview style={s.value as StyleId} />}
						</div>
						<div className="px-2.5 py-2">
							<div className="flex items-baseline justify-between">
								<p className="text-[13px] font-medium">{s.label}</p>
								<p className="text-[11px] text-muted-foreground tabular-nums">{presets.filter((p) => (p.style || "default") === s.value).length}</p>
							</div>
							<p className="truncate text-[11px] text-muted-foreground">{s.hint}</p>
						</div>
					</Link>
				))}
			</div>
		</section>
	);
}

/** A short pitch for the Claude Code route, with the install command and a ready prompt. The full guide is on /claude. */
export function ClaudeCodeCard({ className }: { className?: string }) {
	const { product } = useWorkspace();
	const made = (useVideos("").data || []).filter((v) => v.origin).length;
	const site = product?.url ? hostOf(product.url) : "my site";
	return (
		<section className={cn("rounded-2xl border border-brand/30 bg-brand/5 p-5", className)}>
			<div className="flex flex-wrap items-start justify-between gap-3">
				<div className="flex items-start gap-3">
					<span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand/15 text-brand">
						<Icon icon={ComputerTerminal01Icon} size={18} />
					</span>
					<div>
						<h2 className="text-base font-semibold tracking-tight">Make videos from Claude Code, no API key</h2>
						<p className="mt-0.5 max-w-xl text-[13px] leading-relaxed text-muted-foreground">
							Claude reads your blog or code and writes the storyboard on your own subscription. cizle renders it here, animated, with the storyboard saved so you can re-skin it for free.
							{made ? ` ${made} video${made === 1 ? "" : "s"} made this way so far.` : ""}
						</p>
					</div>
				</div>
				<Button asChild>
					<Link to="/claude">
						Set it up <Icon icon={ArrowRight01Icon} size={14} />
					</Link>
				</Button>
			</div>
			<div className="mt-4 grid gap-2.5 lg:grid-cols-2">
				<CopyBox label="1. Install once, from the cizle folder" text="npm run mcp:install" />
				<CopyBox label="2. Then ask Claude Code, in any project" text={`Use cizle to make a 40-second sketch explainer of the latest blog post on ${site}. Explain the code using the main concept.`} mono={false} />
			</div>
		</section>
	);
}
