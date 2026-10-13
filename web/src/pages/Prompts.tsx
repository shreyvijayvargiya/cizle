import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { PlusSignIcon, QuillWrite01Icon, Search01Icon } from "@hugeicons/core-free-icons";
import { Page } from "@/components/AppShell";
import { Icon } from "@/components/Icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/misc";
import { PromptThumb } from "@/components/PromptPreview";
import { usePrompts, type Prompt } from "@/lib/api";
import { FOUNDER_LABEL, STYLE_LABEL } from "@/lib/constants";
import { cn, timeAgo } from "@/lib/utils";

/** Motion sample for a built-in video type (used when the prompt has no render style of its own). */
const TYPE_MOTION: Record<string, string> = { showcase: "ui-zoom", features: "cursor-walkthrough", faq: "card-stack", comparison: "split-compare", glossary: "kinetic-type", launch: "device-mockup", "founder-story": "kinetic-type", "problem-solution": "card-stack", "how-it-works": "cursor-walkthrough", "pricing-explained": "count-up", "use-case-spotlight": "device-mockup", "customer-proof": "card-stack", quickstart: "cursor-walkthrough", "whats-new": "card-stack", roadmap: "kinetic-type", integrations: "card-stack", "myth-busting": "split-compare", "tips-listicle": "kinetic-type", "pitch-teaser": "count-up", "code-walkthrough": "cursor-walkthrough" };

const GROUPS: { kind: Prompt["kind"]; title: string; hint: string }[] = [
	{ kind: "custom", title: "Your prompts", hint: "Saved in prompts/custom/*.md" },
	{ kind: "type", title: "Video types", hint: "Structure for each kind of video · prompts/types" },
	{ kind: "tone", title: "Tones", hint: "Energy, pacing and wording · prompts/tones" },
	{ kind: "film", title: "Opus film styles", hint: "43 looks from lemo-opuscar (MIT, LemoLab) · prompts/films" },
];

export function PromptsPage() {
	const prompts = usePrompts();
	const [q, setQ] = useState("");
	const [kind, setKind] = useState<"" | Prompt["kind"]>("");
	const [founder, setFounder] = useState("");
	const [allFilms, setAllFilms] = useState(false);
	const list = useMemo(
		() => (prompts.data || []).filter((p) => (!kind || p.kind === kind) && (!founder || p.founders?.includes(founder)) && (!q || `${p.name} ${p.description} ${p.body} ${p.category || ""} ${(p.uses || []).join(" ")}`.toLowerCase().includes(q.toLowerCase()))),
		[prompts.data, q, kind, founder],
	);
	return (
		<Page
			title="Prompts"
			description="A library of markdown prompts. Every file shapes how cizle writes a video — edit them, add your own, commit them to git."
			actions={
				<Button asChild>
					<Link to="/prompts/new">
						<Icon icon={PlusSignIcon} size={15} /> New prompt
					</Link>
				</Button>
			}
			wide
		>
			<div className="mb-5 flex flex-wrap items-center gap-2">
				<div className="relative w-full sm:w-72">
					<Icon icon={Search01Icon} size={15} className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground" />
					<Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search prompts" className="pl-8" />
				</div>
				<div className="flex items-center gap-1 rounded-lg bg-muted p-1">
					{[["", "All"], ["custom", "Yours"], ["type", "Types"], ["tone", "Tones"], ["film", "Films"]].map(([k, label]) => (
						<button key={k} type="button" onClick={() => setKind(k as typeof kind)} className={cn("h-7 rounded-md px-2.5 text-xs font-medium", kind === k ? "bg-surface shadow-sm" : "text-muted-foreground hover:text-foreground")}>
							{label}
						</button>
					))}
				</div>
				<div className="flex flex-wrap items-center gap-1">
					{Object.entries(FOUNDER_LABEL).map(([v, label]) => (
						<button key={v} type="button" onClick={() => setFounder(founder === v ? "" : v)} className={cn("h-7 rounded-full border px-2.5 text-xs", founder === v ? "border-brand/40 bg-brand/10 font-medium text-brand" : "border-border text-muted-foreground hover:bg-accent hover:text-foreground")}>
							{label}
						</button>
					))}
				</div>
			</div>
			{prompts.isLoading ? (
				<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
					{Array.from({ length: 6 }).map((_, i) => (
						<Skeleton key={i} className="h-28" />
					))}
				</div>
			) : (
				<div className="space-y-8">
					{GROUPS.map((g) => {
						const all = list.filter((p) => p.kind === g.kind);
						if (!all.length && (kind || q)) return null;
						// The film library is long: show a taste first, all of it on request or when searching.
						const items = g.kind === "film" && !allFilms && !q && !kind ? all.slice(0, 9) : all;
						return (
							<section key={g.kind}>
								<div className="mb-2.5 flex items-baseline justify-between">
									<h2 className="text-sm font-semibold">{g.title}</h2>
									<span className="text-xs text-muted-foreground">{g.hint}</span>
								</div>
								{items.length ? (
									<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
										{items.map((p) => (
											<Link key={p.id} to="/prompts/$id" params={{ id: p.id }} className="group flex flex-col rounded-xl border border-border bg-surface p-4 transition-colors hover:bg-accent/50">
												{p.kind !== "custom" ? <PromptThumb style={p.style} motion={TYPE_MOTION[p.slug]} className="mb-3 h-24" /> : null}
												<div className="flex items-start justify-between gap-2">
													<p className="text-sm font-medium">{p.name}</p>
													<Badge tone={p.built_in ? "outline" : "info"}>{p.kind === "film" ? p.category || "Film" : p.built_in ? "Built-in" : "Custom"}</Badge>
												</div>
												<p className="mt-1 line-clamp-2 text-[13px] text-muted-foreground">{p.description || p.body.slice(0, 120)}</p>
												<div className="mt-auto flex items-center gap-2 pt-3 text-[11px] text-muted-foreground">
													<span className="font-mono">{p.kind === "film" ? "films" : p.kind === "type" ? "types" : p.kind === "tone" ? "tones" : "custom"}/{p.slug}.md</span>
													{p.type && p.kind === "custom" ? <span>· {p.type}</span> : null}
													{p.style ? <Badge tone="info">{p.kind === "film" ? `cizle: ${STYLE_LABEL[p.style]}` : STYLE_LABEL[p.style]}</Badge> : null}
													{p.kind === "type" && p.founders?.length ? <span className="truncate">· {p.founders.map((f) => FOUNDER_LABEL[f] || f).join(", ")}</span> : null}
													{p.kind === "film" ? <span className="ml-auto">{p.license} · {p.author}</span> : <span className="ml-auto">{timeAgo(p.updated_at)}</span>}
												</div>
											</Link>
										))}
										{items.length < all.length ? (
											<button type="button" onClick={() => setAllFilms(true)} className="flex min-h-24 items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground hover:bg-accent/50 hover:text-foreground">
												Show all {all.length} film styles
											</button>
										) : null}
									</div>
								) : (
									<Link to="/prompts/new" className="flex items-center gap-3 rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground hover:bg-accent/50">
										<Icon icon={QuillWrite01Icon} size={16} /> Write your first prompt — e.g. "Always open with our free plan, end with the install command."
									</Link>
								)}
							</section>
						);
					})}
				</div>
			)}
		</Page>
	);
}
