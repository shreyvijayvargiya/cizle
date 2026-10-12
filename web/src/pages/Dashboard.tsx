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
	Link01Icon,
	Loading03Icon,
	Presentation01Icon,
	QuillWrite01Icon,
	Rocket01Icon,
	StarsIcon,
	Video01Icon,
} from "@hugeicons/core-free-icons";
import { Composer } from "@/components/Composer";
import { IdeaCard } from "@/components/IdeaCard";
import { Icon } from "@/components/Icon";
import { VideosTable } from "@/components/VideosTable";
import { Button } from "@/components/ui/button";
import { useProduct, usePrompts, useSettings, useStats, useVideos } from "@/lib/api";
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
	const { slug, product, productsLoaded } = useWorkspace();
	const videos = useVideos(slug);
	const detail = useProduct(slug);
	const prompts = usePrompts();
	const navigate = useNavigate();
	const keyReady = Boolean(settings.data?.openrouter_api_key_set);
	const types = (prompts.data || []).filter((p) => p.kind === "type");
	const s = stats.data;
	const open = (detail.data?.ideas || []).filter((i) => i.status === "suggested").slice(0, 3);

	return (
		<div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
			{productsLoaded && !product ? (
				<div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-brand/30 bg-brand/10 p-4">
					<div className="flex items-start gap-3">
						<span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand/20 text-brand">
							<Icon icon={Package01Icon} size={16} />
						</span>
						<div>
							<p className="text-sm font-medium">Add your product once, get videos on the go</p>
							<p className="text-[13px] text-muted-foreground">cizle reads your site and repos, remembers them as markdown, and suggests the first videos to make.</p>
						</div>
					</div>
					<Button asChild>
						<Link to="/products/new">Add product</Link>
					</Button>
				</div>
			) : null}
			<div className="grid gap-3 sm:grid-cols-3">
				<Step n={1} icon={Key01Icon} title="Add your OpenRouter key" done={keyReady} to="/settings">
					{keyReady ? "Key connected. Scripts, screenshots and voice-overs run through OpenRouter." : "Paste it once in Settings. It stays on this machine in data/settings.json."}
				</Step>
				<Step n={2} icon={Link01Icon} title="Paste a URL or GitHub repo">
					cizle reads the site, llms.txt, blog, FAQ and repo, then grabs real screenshots and product images.
				</Step>
				<Step n={3} icon={Layers01Icon} title="Pick a type and generate">
					Showcase, features, FAQ, comparison, glossary or launch. Load a prompt with / to steer it.
				</Step>
			</div>

			<div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
				<Stat label="Videos" value={s ? s.videos : "—"} icon={Video01Icon} />
				<Stat label="Rendering now" value={s ? s.rendering : "—"} icon={Loading03Icon} spin={Boolean(s?.rendering)} />
				<Stat label="Prompts" value={s ? s.prompts : "—"} icon={QuillWrite01Icon} />
				<Stat label="Total spend" value={s ? usd(s.spend_usd, 2) : "—"} icon={Coins01Icon} />
			</div>

			<section className="mt-10">
				<h1 className="text-center text-2xl font-semibold tracking-tight sm:text-[28px]">What are we shipping today?</h1>
				<p className="mx-auto mt-2 max-w-lg text-center text-sm text-muted-foreground">Paste a link, describe the video, hit enter. Under a minute of video, made from your real product.</p>
				<div className="mx-auto mt-6 max-w-3xl">
					<Composer autoFocus />
				</div>
				{types.length ? (
					<div className="mx-auto mt-4 flex max-w-3xl flex-wrap justify-center gap-1.5">
						{types.map((t) => (
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
					</div>
				) : null}
			</section>

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
