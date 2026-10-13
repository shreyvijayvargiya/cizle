import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { ArrowRight01Icon, AiMagicIcon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/Icon";
import { StylePreview, Motion } from "@/components/PromptPreview";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/misc";
import { api, usePrompts, useProduct, type Preset } from "@/lib/api";
import { FOUNDERS, FOUNDER_LABEL, STYLE_LABEL, founderFromCategory } from "@/lib/constants";
import { cn } from "@/lib/utils";

const CATEGORY_LABEL: Record<string, string> = {
	devtools: "developer tools",
	analytics: "analytics",
	crm: "CRM and sales",
	"ai-agents": "AI agents",
	"project-management": "project management",
	fintech: "fintech",
	"marketing-seo": "marketing and SEO",
	security: "security",
};

/**
 * Up to `count` prompts for a product: its founder kind and category first, a different animated style each.
 * A founder match counts more than a category match, so a dev-tool founder sees Quickstart and Code walkthrough early.
 */
export function pickSuggestions(presets: Preset[], category: string | undefined, founder: string, count = 4) {
	const score = (p: Preset) => (p.founders?.includes(founder) ? 3 : 0) + (category && p.categories.includes(category) ? 2 : 0);
	const ranked = [...presets].sort((x, y) => score(y) - score(x));
	const chosen: Preset[] = [];
	const styles = new Set<string>();
	for (const p of ranked) {
		const s = p.style || "default";
		if (styles.has(s) || score(p) === 0) continue;
		styles.add(s);
		chosen.push(p);
		if (chosen.length === count) break;
	}
	for (const p of ranked) if (chosen.length < count && !chosen.includes(p)) chosen.push(p);
	return { chosen, matched: ranked.some((p) => score(p) > 0) };
}

const readFounder = () => {
	try {
		return localStorage.getItem("cizle-founder") || "";
	} catch {
		return "";
	}
};

/** Prompt formats that fit the product, shown when a product is added and on its page. Pressing one opens it in the composer. */
export function SuggestedPrompts({ slug, title, className }: { slug: string; title?: string; className?: string }) {
	const navigate = useNavigate();
	const product = useProduct(slug);
	const prompts = usePrompts();
	const gallery = useQuery({ queryKey: ["gallery", slug], queryFn: () => api.gallery(slug), enabled: Boolean(slug) });
	const category = product.data?.category;
	const [picked, setPicked] = useState(readFounder);
	const founder = picked || founderFromCategory(category);
	const choose = (v: string) => {
		setPicked(v);
		try {
			localStorage.setItem("cizle-founder", v);
		} catch {
			/* storage unavailable */
		}
	};
	const { chosen, matched } = useMemo(() => pickSuggestions(gallery.data?.presets || [], category, founder), [gallery.data, category, founder]);
	const typeName = (t: string) => prompts.data?.find((p) => p.kind === "type" && p.slug === t)?.name || t;

	if (gallery.isLoading || product.isLoading)
		return (
			<div className={cn("grid gap-3 sm:grid-cols-2 lg:grid-cols-4", className)}>
				{Array.from({ length: 4 }).map((_, i) => (
					<Skeleton key={i} className="h-44" />
				))}
			</div>
		);
	if (!chosen.length) return null;

	return (
		<section className={className}>
			<div className="mb-3 flex flex-wrap items-end justify-between gap-2">
				<div>
				<h2 className="flex items-center gap-1.5 text-base font-semibold tracking-tight">
					<Icon icon={AiMagicIcon} size={16} className="text-brand" /> {title || `Prompts we'd use for ${product.data?.name || "your product"}`}
				</h2>
				<p className="text-xs text-muted-foreground">
					{matched ? `Picked for ${FOUNDER_LABEL[founder] || "your"} founders${category && CATEGORY_LABEL[category] ? ` in ${CATEGORY_LABEL[category]}` : ""}, one for each animated style.` : "One for each animated style. Press one to open it in the composer."}
				</p>
				</div>
				<div className="flex flex-wrap gap-1" role="radiogroup" aria-label="Founder kind">
					{FOUNDERS.map((f) => (
						<button
							key={f.value}
							type="button"
							role="radio"
							aria-checked={founder === f.value}
							onClick={() => choose(f.value)}
							className={cn("rounded-full border px-2.5 py-1 text-xs transition-colors", founder === f.value ? "border-brand/40 bg-brand/10 font-medium text-brand" : "border-border text-muted-foreground hover:bg-accent hover:text-foreground")}
						>
							{f.label}
						</button>
					))}
				</div>
			</div>
			<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
				{chosen.map((p) => (
					<button
						key={p.id}
						type="button"
						onClick={() => navigate({ to: "/create", search: { preset: p.id } })}
						className="group flex flex-col gap-2.5 rounded-xl border border-border bg-surface p-3 text-left transition-colors hover:bg-accent/50"
					>
						<div className="h-28 overflow-hidden rounded-lg border border-border bg-muted">
							{p.style && p.style !== "default" ? <StylePreview style={p.style} /> : <div className="flex size-full items-center justify-center bg-surface/60"><Motion name={p.animation} /></div>}
						</div>
						<div className="px-0.5">
							<p className="text-sm leading-snug font-medium">{p.title}</p>
							<p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{p.description}</p>
						</div>
						<div className="mt-auto flex flex-wrap items-center gap-1.5 px-0.5">
							<Badge tone={p.style && p.style !== "default" ? "info" : "outline"}>{STYLE_LABEL[p.style || "default"]}</Badge>
							<Badge tone="outline">{typeName(p.type)}</Badge>
							<span className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-muted-foreground group-hover:text-foreground">
								Use <Icon icon={ArrowRight01Icon} size={12} />
							</span>
						</div>
					</button>
				))}
			</div>
		</section>
	);
}
