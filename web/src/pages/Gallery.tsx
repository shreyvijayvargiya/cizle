import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { ArrowRight01Icon, PlayCircleIcon, Video01Icon } from "@hugeicons/core-free-icons";
import { Page } from "@/components/AppShell";
import { Icon } from "@/components/Icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OptionSelect } from "@/components/ui/select";
import { Skeleton, Tabs, TabsList, TabsTrigger } from "@/components/ui/misc";
import { Motion, StylePreview } from "@/components/PromptPreview";
import { api, fileUrl, usePrompts, type Aspect, type Preset, type StyleId } from "@/lib/api";
import { FOUNDER_LABEL, STYLES, STYLE_LABEL } from "@/lib/constants";
import { cn, hostOf, timeAgo } from "@/lib/utils";
import { useWorkspace } from "@/lib/workspace";

const ANIMATIONS: Record<string, string> = {
	"kinetic-type": "Kinetic type",
	"ui-zoom": "UI zoom",
	"cursor-walkthrough": "Cursor walkthrough",
	"split-compare": "Split compare",
	"device-mockup": "Device mockup",
	"count-up": "Count-up",
	"card-stack": "Card stack",
	"glitch-cut": "Glitch cut",
};
const CATEGORIES: Record<string, string> = {
	devtools: "Developer tools",
	analytics: "Analytics",
	crm: "CRM and sales",
	"ai-agents": "AI agents",
	"project-management": "Project management",
	fintech: "Fintech",
	"marketing-seo": "Marketing and SEO",
	security: "Security",
};
const ASPECT_CLASS: Record<Aspect, string> = { "16:9": "w-full aspect-video", "9:16": "w-[52%] aspect-[9/16]", "1:1": "w-[74%] aspect-square" };

function PresetCard({ preset, typeName, onRemix }: { preset: Preset; typeName: string; onRemix: () => void }) {
	return (
		<div className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-3">
			<div className="flex justify-center rounded-lg bg-muted p-3">
				<div className={cn("flex items-center justify-center overflow-hidden rounded-md bg-surface/60 ring-1 ring-border", ASPECT_CLASS[preset.aspect])}>
					{preset.style && preset.style !== "default" ? <StylePreview style={preset.style} /> : <Motion name={preset.animation} />}
				</div>
			</div>
			<div className="px-1">
				<p className="text-sm leading-snug font-medium">{preset.title}</p>
				<p className="mt-1 line-clamp-2 text-[13px] text-muted-foreground">{preset.description}</p>
			</div>
			<div className="flex flex-wrap gap-1.5 px-1">
				<Badge>{typeName}</Badge>
				<Badge tone="outline">{preset.aspect}</Badge>
				<Badge tone={preset.style && preset.style !== "default" ? "info" : "outline"}>{STYLE_LABEL[preset.style || "default"]}</Badge>
				<Badge tone="outline">{ANIMATIONS[preset.animation] || preset.animation}</Badge>
			</div>
			<Button size="sm" variant="outline" className="mx-1 mb-1 justify-between" onClick={onRemix}>
				Remix for my product <Icon icon={ArrowRight01Icon} size={14} />
			</Button>
		</div>
	);
}

export function GalleryPage() {
	const navigate = useNavigate();
	const { slug, product } = useWorkspace();
	const prompts = usePrompts();
	const gallery = useQuery({ queryKey: ["gallery", slug], queryFn: () => api.gallery(slug) });
	const [aspect, setAspect] = useState("all");
	const [type, setType] = useState("");
	const search = useSearch({ strict: false }) as { style?: string; founder?: string; category?: string };
	const [category, setCategory] = useState(search.category || "");
	const [style, setStyle] = useState(search.style || "");
	const [founder, setFounder] = useState(search.founder || "");

	const presets = useMemo(() => gallery.data?.presets || [], [gallery.data]);
	// Start on the active product's category when the gallery has presets for it.
	useEffect(() => {
		if (!search.category && product && presets.some((p) => p.categories.includes(product.category))) setCategory(product.category);
	}, [product, presets]);

	const typeName = (t: string) => prompts.data?.find((p) => p.kind === "type" && p.slug === t)?.name || t;
	const shown = presets.filter((p) => (aspect === "all" || p.aspect === aspect) && (!type || p.type === type) && (!style || (p.style || "default") === style) && (!founder || p.founders?.includes(founder)) && (!category || p.categories.includes(category)));
	const types = [...new Set(presets.map((p) => p.type))];
	const mine = gallery.data?.mine || [];

	const perStyle = (s: string) => presets.filter((p) => (p.style || "default") === s).length;

	return (
		<Page title="Gallery" description="Start from a format that works, then remix it with your product's notes. Pick an animated style, then a founder job or a video type. Every format is a type, a tone and a style you can remix." wide>
			<div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6" role="radiogroup" aria-label="Animated style">
				{STYLES.filter((s) => s.value !== "auto").map((s) => (
					<button
						key={s.value}
						type="button"
						role="radio"
						aria-checked={style === s.value}
						onClick={() => setStyle(style === s.value ? "" : s.value)}
						className={cn("overflow-hidden rounded-xl border bg-surface text-left transition-colors", style === s.value ? "border-brand/50 ring-2 ring-brand/20" : "border-border hover:bg-accent/50")}
					>
						<div className="h-20 overflow-hidden border-b border-border bg-muted">
							{s.value === "default" ? <div className="flex size-full items-center justify-center bg-surface/60"><Motion name="ui-zoom" /></div> : <StylePreview style={s.value as StyleId} />}
						</div>
						<div className="flex items-baseline justify-between px-2.5 py-2">
							<p className="text-[13px] font-medium">{s.label}</p>
							<p className="text-[11px] text-muted-foreground tabular-nums">{perStyle(s.value)}</p>
						</div>
					</button>
				))}
			</div>
			<div className="mb-5 flex flex-wrap items-center gap-2">
				<Tabs value={aspect} onValueChange={setAspect}>
					<TabsList>
						<TabsTrigger value="all">All</TabsTrigger>
						<TabsTrigger value="16:9">Landscape</TabsTrigger>
						<TabsTrigger value="9:16">Portrait</TabsTrigger>
						<TabsTrigger value="1:1">Square</TabsTrigger>
					</TabsList>
				</Tabs>
				<OptionSelect size="sm" aria-label="Video type" className="w-44" value={type} onValueChange={setType} emptyLabel="All video types" options={types.map((t) => ({ value: t, label: typeName(t) }))} />
				<OptionSelect size="sm" aria-label="Style" className="w-40" value={style} onValueChange={setStyle} emptyLabel="All styles" options={Object.entries(STYLE_LABEL).filter(([v]) => v !== "auto").map(([value, label]) => ({ value, label }))} />
				<OptionSelect size="sm" aria-label="Founder kind" className="w-40" value={founder} onValueChange={setFounder} emptyLabel="All founders" options={Object.entries(FOUNDER_LABEL).map(([value, label]) => ({ value, label }))} />
				<OptionSelect size="sm" aria-label="Category" className="w-48" value={category} onValueChange={setCategory} emptyLabel="All categories" options={Object.entries(CATEGORIES).map(([value, label]) => ({ value, label }))} />
				<span className="ml-auto text-xs text-muted-foreground">{shown.length} format{shown.length === 1 ? "" : "s"}</span>
			</div>

			{gallery.isLoading ? (
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
					{Array.from({ length: 8 }).map((_, i) => (
						<Skeleton key={i} className="h-64" />
					))}
				</div>
			) : shown.length ? (
				<div className="grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-4">
					{shown.map((p) => (
						<PresetCard key={p.id} preset={p} typeName={typeName(p.type)} onRemix={() => navigate({ to: "/create", search: { preset: p.id } })} />
					))}
				</div>
			) : (
				<p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">No formats match these filters.</p>
			)}

			<section className="mt-12">
				<h2 className="text-base font-semibold tracking-tight">{product ? `Your videos for ${product.name}` : "Your videos"}</h2>
				<p className="mb-3 text-xs text-muted-foreground">Open one to watch it, or to make another take.</p>
				{mine.length ? (
					<div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
						{mine.map((v) => {
							const thumb = fileUrl(v.id, v.thumbnail_path);
							return (
								<Link key={v.id} to="/videos/$id" params={{ id: v.id }} className="group block">
									<div className={cn("relative overflow-hidden rounded-lg border border-border bg-muted", v.aspect === "9:16" ? "aspect-[9/16]" : v.aspect === "1:1" ? "aspect-square" : "aspect-video")}>
										{thumb ? <img src={thumb} alt="" className="size-full object-cover" /> : <Icon icon={Video01Icon} size={20} className="absolute inset-0 m-auto text-muted-foreground" />}
										<span className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
											<Icon icon={PlayCircleIcon} size={28} className="text-white" />
										</span>
									</div>
									<p className="mt-1.5 truncate text-xs font-medium">{v.title}</p>
									<p className="truncate text-[11px] text-muted-foreground">
										{v.type} · {hostOf(v.url)} · {timeAgo(v.created_at)}
									</p>
								</Link>
							);
						})}
					</div>
				) : (
					<p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">Videos you make appear here.</p>
				)}
			</section>
		</Page>
	);
}
