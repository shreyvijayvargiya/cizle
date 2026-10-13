import { Link, useNavigate } from "@tanstack/react-router";
import {
	ArrowRight01Icon,
	BalanceScaleIcon,
	Book02Icon,
	CheckmarkCircle02Icon,
	Coins01Icon,
	HelpCircleIcon,
	Key01Icon,
	Layers01Icon,
	Package01Icon,
	Loading03Icon,
	Presentation01Icon,
	LightbulbIcon,
	Rocket01Icon,
	StarsIcon,
	Video01Icon,
} from "@hugeicons/core-free-icons";
import { Composer } from "@/components/Composer";
import { SuggestedPrompts } from "@/components/SuggestedPrompts";
import { AdShelf, ClaudeCodeCard, PromptShelf } from "@/components/DashboardShelves";
import { IdeaCard } from "@/components/IdeaCard";
import { Icon } from "@/components/Icon";
import { StatusBadge } from "@/components/StatusBadge";
import { StopRowButton, VideosTable } from "@/components/VideosTable";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { isActive, useProduct, usePrompts, useSettings, useStats, useVideos } from "@/lib/api";
import { useWorkspace } from "@/lib/workspace";
import { cn, usd } from "@/lib/utils";

const TYPE_ICONS: Record<string, Parameters<typeof Icon>[0]["icon"]> = {
	showcase: Presentation01Icon,
	features: StarsIcon,
	faq: HelpCircleIcon,
	comparison: BalanceScaleIcon,
	glossary: Book02Icon,
	launch: Rocket01Icon,
};

function Step({ n, icon, title, children, done, to }: { n: number; icon: Parameters<typeof Icon>[0]["icon"]; title: string; children: React.ReactNode; done?: boolean; to?: string }) {
	const body = (
		<div className={cn("h-full rounded-xl border border-border bg-surface p-4 transition-colors", to && "hover:bg-accent/50")}>
			<div className="mb-3 flex items-center gap-2">
				<span className={cn("flex size-6 items-center justify-center rounded-md border text-xs font-medium tabular-nums", done ? "border-success/30 bg-success/10 text-success" : "border-border")}>
					{done ? <Icon icon={CheckmarkCircle02Icon} size={14} /> : n}
				</span>
				<Icon icon={icon} size={16} className="text-muted-foreground" />
			</div>
			<p className="text-sm font-medium">{title}</p>
			<p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{children}</p>
		</div>
	);
	return to ? (
		<Link to={to} className="block">
			{body}
		</Link>
	) : (
		body
	);
}

function Stat({ label, value, icon, spin }: { label: string; value: React.ReactNode; icon: Parameters<typeof Icon>[0]["icon"]; spin?: boolean }) {
	return (
		<div className="rounded-xl border border-border bg-surface p-4">
			<div className="flex items-center justify-between text-xs text-muted-foreground">
				{label}
				<Icon icon={icon} size={15} className={spin ? "animate-spin text-info" : ""} />
			</div>
			<p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums">{value}</p>
		</div>
	);
}

export function DashboardPage() {
	const settings = useSettings();
	const stats = useStats();
	const { slug, product, products, productsLoaded } = useWorkspace();
	const videos = useVideos(slug);
	const detail = useProduct(slug);
	const prompts = usePrompts();
	const navigate = useNavigate();
	const keyReady = Boolean(settings.data?.openrouter_api_key_set);
	const types = (prompts.data || []).filter((p) => p.kind === "type");
	const s = stats.data;
	const open = (detail.data?.ideas || []).filter((i) => i.status === "suggested").slice(0, 3);
	const ideasWaiting = slug ? (product?.ideas_open ?? 0) : products.reduce((n, p) => n + p.ideas_open, 0);
	const running = (useVideos("").data || []).filter((v) => isActive(v.status));

	return (
		<div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
			<section>
				<h1 className="text-center text-2xl font-semibold tracking-tight sm:text-[28px]">What are we shipping today?</h1>
				<p className="mx-auto mt-2 max-w-lg text-center text-sm text-muted-foreground">Paste a link, describe the ad or video, hit enter. Ads for Meta, TikTok and Google, made from your real brand or product.</p>
				<div className="mx-auto mt-6 max-w-3xl">
					<Composer autoFocus />
				</div>
				{types.length ? (
					<div className="mx-auto mt-4 flex max-w-3xl flex-wrap justify-center gap-1.5">
						{types.slice(0, 10).map((t) => (
							<button
								key={t.id}
								type="button"
								onClick={() => navigate({ to: "/create", search: { prompt: t.id } })}
								className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
							>
								<Icon icon={TYPE_ICONS[t.slug] || Layers01Icon} size={13} />
								{t.name}
							</button>
						))}
						{types.length > 10 ? (
							<Link to="/prompts" className="inline-flex items-center rounded-full px-3 py-1.5 text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground">
								+{types.length - 10} more types
							</Link>
						) : null}
					</div>
				) : null}
			</section>
			<div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
				<Stat label="Videos" value={s ? s.videos : "—"} icon={Video01Icon} />
				<Stat label="Rendering now" value={s ? s.rendering : "—"} icon={Loading03Icon} spin={Boolean(s?.rendering)} />
				<Stat label="Ideas waiting" value={productsLoaded ? ideasWaiting : "—"} icon={LightbulbIcon} />
				<Stat label="Total spend" value={s ? usd(s.spend_usd, 2) : "—"} icon={Coins01Icon} />
			</div>

			{!product ? (
				<section className="mt-8">
					<h2 className="mb-3 text-base font-semibold tracking-tight">Get started</h2>
			<div className="grid gap-3 sm:grid-cols-3">
				<Step n={1} icon={Key01Icon} title="Choose who writes the video" done={keyReady} to={keyReady ? "/settings" : "/claude"}>
					{keyReady ? "OpenRouter key connected. Flip the Free switch to use free models instead of paid ones." : "Add an OpenRouter key in Settings, or skip it and make videos from Claude Code on your own subscription."}
				</Step>
				<Step n={2} icon={Package01Icon} title="Add your product" to="/products/new">
					Paste your website and GitHub repos once. cizle saves what it learns as markdown and suggests the first videos to make.
				</Step>
				<Step n={3} icon={Layers01Icon} title="Create from an idea or a format">
					Press Create on a suggestion, remix a format from the prompt gallery, or describe a video in the box above. A card asks its questions before anything renders.
				</Step>
			</div>

				</section>
			) : null}

			{running.length ? (
				<section className="mt-10">
					<h2 className="mb-3 text-base font-semibold tracking-tight">Running now</h2>
					<div className="space-y-2">
						{running.map((v) => (
							<div key={v.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-surface p-3">
								<Link to="/videos/$id" params={{ id: v.id }} className="min-w-0 flex-1 truncate text-sm font-medium hover:underline">
									{v.title}
								</Link>
								<StatusBadge status={v.status} step={v.step} />
								<Progress value={Math.max(4, v.progress)} className="w-28" aria-label={`${v.title} progress`} />
								<StopRowButton id={v.id} />
							</div>
						))}
					</div>
				</section>
			) : null}

			{open.length ? (
				<section className="mt-12">
					<div className="mb-3 flex items-end justify-between">
						<div>
							<h2 className="text-base font-semibold tracking-tight">Suggested for {product?.name}</h2>
							<p className="text-xs text-muted-foreground">From your notes and what shipped recently. Nothing renders until you press Create.</p>
						</div>
						<Button variant="outline" size="sm" asChild>
							<Link to="/product">
								All ideas <Icon icon={ArrowRight01Icon} size={14} />
							</Link>
						</Button>
					</div>
					<div className="grid gap-3 md:grid-cols-3">
						{open.map((i) => (
							<IdeaCard key={i.id} idea={i} slug={slug} showToggle />
						))}
					</div>
				</section>
			) : null}

			<div className="mt-2">
				{product ? <SuggestedPrompts slug={slug} title={`Prompts for ${product.name}`} className="mt-10" /> : null}
				<AdShelf className="mt-10" />
				<PromptShelf className="mt-10" />
				<ClaudeCodeCard className="mt-10" />
			</div>

			<section className="mt-12">
				<div className="mb-3 flex items-end justify-between">
					<div>
						<h2 className="text-base font-semibold tracking-tight">Latest videos</h2>
						<p className="text-xs text-muted-foreground">{product ? `For ${product.name}. ` : ""}Stored on this machine in data/videos.</p>
					</div>
					<Button variant="outline" size="sm" asChild>
						<Link to="/videos">
							View all <Icon icon={ArrowRight01Icon} size={14} />
						</Link>
					</Button>
				</div>
				<VideosTable data={(videos.data || []).slice(0, 5)} loading={videos.isLoading} compact />
			</section>
		</div>
	);
}
