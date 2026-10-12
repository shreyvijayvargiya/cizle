import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight01Icon, PlayCircleIcon, Video01Icon } from "@hugeicons/core-free-icons";
import { Page } from "@/components/AppShell";
import { Icon } from "@/components/Icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OptionSelect } from "@/components/ui/select";
import { Skeleton, Tabs, TabsList, TabsTrigger } from "@/components/ui/misc";
import { api, fileUrl, usePrompts, type Aspect, type Preset } from "@/lib/api";
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

/** A few looping shapes that hint at the motion style. Real renders replace them as you make videos. */
function Motion({ name }: { name: string }) {
	const bar = "h-2 rounded-full bg-foreground/70";
	switch (name) {
		case "kinetic-type":
			return (
				<div className="flex w-3/4 flex-col gap-2">
					{[100, 70, 85].map((w, i) => (
						<div key={i} className="cz-anim h-3.5 rounded bg-foreground" style={{ width: `${w}%`, animation: `cz-rise 2.4s ${i * 0.35}s infinite both` }} />
					))}
				</div>
			);
		case "ui-zoom":
			return (
				<div className="size-3/4 overflow-hidden rounded-lg border border-foreground/30 bg-surface">
					<div className="cz-anim grid size-full grid-cols-3 gap-1 p-1.5" style={{ animation: "cz-zoom 3s ease-in-out infinite alternate" }}>
						{Array.from({ length: 6 }).map((_, i) => (
							<div key={i} className={cn("rounded bg-foreground/15", i === 1 && "bg-brand/60")} />
						))}
					</div>
				</div>
			);
		case "cursor-walkthrough":
			return (
				<div className="relative size-3/4 rounded-lg border border-foreground/30 bg-surface p-2">
					<div className={cn(bar, "w-1/2")} />
					<div className="mt-2 h-8 rounded bg-foreground/10" />
					<span className="cz-anim absolute top-1/2 left-1/2 size-3 rounded-full bg-brand ring-4 ring-brand/30" style={{ animation: "cz-travel 3.2s ease-in-out infinite" }} />
				</div>
			);
		case "split-compare":
			return (
				<div className="flex size-3/4 overflow-hidden rounded-lg border border-foreground/30">
					<div className="flex-1 bg-brand/30 p-2">
						<div className={cn(bar, "w-3/4")} />
					</div>
					<div className="cz-anim w-0.5 bg-foreground" style={{ animation: "cz-wipe 2.8s ease-in-out infinite" }} />
					<div className="flex-1 bg-foreground/10 p-2">
						<div className={cn(bar, "w-1/2")} />
					</div>
				</div>
			);
		case "device-mockup":
			return (
				<div className="cz-anim flex h-3/4 w-2/5 flex-col rounded-2xl border-2 border-foreground/60 bg-surface p-1.5" style={{ animation: "cz-bob 2.6s ease-in-out infinite" }}>
					<div className="mx-auto h-1 w-1/3 rounded-full bg-foreground/50" />
					<div className="mt-1.5 flex-1 rounded-lg bg-brand/25" />
				</div>
			);
		case "count-up":
			return (
				<div className="cz-anim text-center" style={{ animation: "cz-rise 2.4s infinite both" }}>
					<p className="text-3xl font-semibold tracking-tight tabular-nums">128%</p>
					<div className={cn(bar, "mx-auto mt-2 w-16 bg-foreground/30")} />
				</div>
			);
		case "card-stack":
			return (
				<div className="relative size-3/5">
					{[2, 1, 0].map((i) => (
						<div key={i} className="cz-anim absolute inset-0 rounded-lg border border-foreground/30 bg-surface" style={{ transform: `translate(${i * 8}px, ${i * -8}px)`, animation: `cz-bob 2.6s ${i * 0.25}s ease-in-out infinite` }}>
							{i === 0 ? <div className="m-2 space-y-1.5"><div className={cn(bar, "w-2/3")} /><div className={cn(bar, "w-1/2 bg-foreground/30")} /></div> : null}
						</div>
					))}
				</div>
			);
		default:
			return (
				<div className="flex w-3/4 flex-col gap-2">
					{[90, 60, 75].map((w, i) => (
						<div key={i} className="cz-anim h-3 rounded bg-foreground" style={{ width: `${w}%`, animation: `cz-flick 1.8s ${i * 0.2}s infinite` }} />
					))}
				</div>
			);
	}
}

function PresetCard({ preset, typeName, onRemix }: { preset: Preset; typeName: string; onRemix: () => void }) {
	return (
		<div className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-3">
			<div className="flex justify-center rounded-lg bg-muted p-3">
				<div className={cn("flex items-center justify-center overflow-hidden rounded-md bg-surface/60 ring-1 ring-border", ASPECT_CLASS[preset.aspect])}>
					<Motion name={preset.animation} />
				</div>
			</div>
			<div className="px-1">
				<p className="text-sm leading-snug font-medium">{preset.title}</p>
				<p className="mt-1 line-clamp-2 text-[13px] text-muted-foreground">{preset.description}</p>
			</div>
			<div className="flex flex-wrap gap-1.5 px-1">
				<Badge>{typeName}</Badge>
				<Badge tone="outline">{preset.aspect}</Badge>
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
	const [category, setCategory] = useState("");

	const presets = useMemo(() => gallery.data?.presets || [], [gallery.data]);
	// Start on the active product's category when the gallery has presets for it.
	useEffect(() => {
		if (product && presets.some((p) => p.categories.includes(product.category))) setCategory(product.category);
	}, [product, presets]);

	const typeName = (t: string) => prompts.data?.find((p) => p.kind === "type" && p.slug === t)?.name || t;
	const shown = presets.filter((p) => (aspect === "all" || p.aspect === aspect) && (!type || p.type === type) && (!category || p.categories.includes(category)));
	const types = [...new Set(presets.map((p) => p.type))];
	const mine = gallery.data?.mine || [];

	return (
		<Page title="Gallery" description="Start from a format that works, then remix it with your product's notes. Types, aspect ratios and motion styles in one place." wide>
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
