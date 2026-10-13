import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { toast } from "sonner";
import {
	AlertCircleIcon,
	ArrowLeft01Icon,
	CheckmarkCircle02Icon,
	Copy01Icon,
	Delete02Icon,
	Download04Icon,
	GithubIcon,
	Globe02Icon,
	Loading03Icon,
	RepeatIcon,
	StopIcon,
	Tick02Icon,
} from "@hugeicons/core-free-icons";
import { Icon } from "@/components/Icon";
import { StatusBadge } from "@/components/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/menu";
import { Skeleton, Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/misc";
import { api, fileUrl, isActive, type Job, type Pack, type Variant } from "@/lib/api";
import { ARTICLE_PIPELINE, PIPELINE as PRODUCT_PIPELINE, STEP_LABELS } from "@/lib/constants";
import { cn, hostOf, timeAgo, usd } from "@/lib/utils";

const SOURCE_LABELS: Record<string, string> = { website: "Website", llms_txt: "llms.txt", blog: "Blog", github: "GitHub", page: "Page", faq: "FAQ", competitor: "Competitor" };
const ASPECT_CLASS: Record<string, string> = { "9:16": "aspect-[9/16] max-h-[70vh]", "1:1": "aspect-square", "16:9": "aspect-video" };

function Timeline({ job }: { job: Job }) {
	const PIPELINE = job.engine === "article" ? ARTICLE_PIPELINE : PRODUCT_PIPELINE;
	const rank = (step: string) => Math.max(0, PIPELINE.findIndex((s) => s === step || (s === "render" && ["narration", "frames_render", "render_clips", "audio_mix", "mux"].includes(step))));
	const idx = job.step === "done" ? PIPELINE.length : rank(job.step);
	const failed = job.status === "failed";
	return (
		<ol className="space-y-0.5">
			{PIPELINE.map((s, i) => {
				const done = i < idx || job.step === "done";
				const current = i === idx && isActive(job.status);
				return (
					<li key={s} className="flex items-center gap-2.5 py-1 text-sm">
						<span
							className={cn(
								"flex size-5 items-center justify-center rounded-full border",
								done ? "border-success/30 bg-success/10 text-success" : current ? "border-info/30 bg-info/10 text-info" : failed && i === idx ? "border-danger/30 bg-danger/10 text-danger" : "border-border text-muted-foreground",
							)}
						>
							{done ? <Icon icon={Tick02Icon} size={11} /> : current ? <Icon icon={Loading03Icon} size={11} className="animate-spin" /> : failed && i === idx ? <Icon icon={AlertCircleIcon} size={11} /> : null}
						</span>
						<span className={cn(done || current ? "text-foreground" : "text-muted-foreground")}>{job.engine === "article" && s === "context" ? "Reading the article" : STEP_LABELS[s]}</span>
					</li>
				);
			})}
		</ol>
	);
}

function Player({ job, v, onStop, stopping }: { job: Job; v?: Variant; onStop?: () => void; stopping?: boolean }) {
	const src = v?.result ? v.result.video_url || fileUrl(job.id, v.result.video_path) : null;
	const poster = v?.result ? fileUrl(job.id, v.result.thumbnail_path) : null;
	return (
		<div className={cn("relative mx-auto w-full overflow-hidden rounded-xl border border-border bg-zinc-950", ASPECT_CLASS[job.input.aspect] || ASPECT_CLASS["9:16"])}>
			{src ? (
				<video key={src} src={src} poster={poster || undefined} controls playsInline className="absolute inset-0 size-full object-contain" />
			) : (
				<div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center text-zinc-300">
					{job.status === "cancelled" ? (
						<Icon icon={StopIcon} size={24} className="fill-current text-zinc-400" />
					) : job.status === "failed" || v?.status === "failed" ? (
						<Icon icon={AlertCircleIcon} size={24} className="text-red-400" />
					) : (
						<Icon icon={Loading03Icon} size={24} className="animate-spin" />
					)}
					<p className="text-sm font-medium text-white">{v?.concept.hook || job.title}</p>
					<p className="text-xs">{job.status === "cancelled" ? "Stopped" : job.status === "failed" ? "Generation failed" : STEP_LABELS[v?.step || job.step] || "Working…"}</p>
					{isActive(job.status) ? (
						<div className="h-1 w-36 overflow-hidden rounded-full bg-white/10">
							<div className="h-full bg-white transition-all" style={{ width: `${Math.max(5, v?.progress || job.progress)}%` }} />
						</div>
					) : null}
					{isActive(job.status) && onStop ? (
						<Button variant="outline" size="sm" className="border-white/30 bg-transparent text-white hover:bg-white/10" onClick={onStop} disabled={stopping}>
							<Icon icon={StopIcon} size={13} className="fill-current" /> Stop
						</Button>
					) : null}
				</div>
			)}
		</div>
	);
}

function CopyButton({ text, label }: { text: string; label: string }) {
	const [done, setDone] = useState(false);
	return (
		<Button
			variant="outline"
			size="sm"
			onClick={() =>
				navigator.clipboard?.writeText(text).then(() => {
					setDone(true);
					setTimeout(() => setDone(false), 1500);
				})
			}
		>
			<Icon icon={done ? CheckmarkCircle02Icon : Copy01Icon} size={14} /> {label}
		</Button>
	);
}

function PackSection({ title, children, copy }: { title: string; children: React.ReactNode; copy?: string }) {
	return (
		<section className="rounded-xl border border-border p-4">
			<div className="mb-2 flex items-center justify-between gap-2">
				<h2 className="text-sm font-semibold">{title}</h2>
				{copy ? <CopyButton text={copy} label="Copy" /> : null}
			</div>
			<div className="text-sm leading-relaxed">{children}</div>
		</section>
	);
}

const bullets = (a: string[]) => (
	<ul className="list-disc space-y-1 pl-5">
		{a.map((x, i) => (
			<li key={i}>{x}</li>
		))}
	</ul>
);

function PackContent({ pack }: { pack: Pack }) {
	return (
		<div className="space-y-3">
			<PackSection title="Hook" copy={pack.hook}>
				{pack.hook}
			</PackSection>
			<PackSection title="Narration script" copy={pack.narration.join("\n")}>
				{bullets(pack.narration)}
			</PackSection>
			<PackSection title="Storyboard">
				<div className="grid gap-2 sm:grid-cols-2">
					{pack.storyboard.map((sc) => (
						<div key={sc.scene} className="rounded-lg bg-muted/50 p-3 text-xs">
							<p className="mb-1 text-[13px] font-medium">
								Scene {sc.scene} <span className="font-normal text-muted-foreground">· {sc.duration_sec}s</span>
							</p>
							{sc.label ? <p><span className="text-muted-foreground">On screen:</span> {sc.label}{sc.diagram.length ? ` (${sc.diagram.join(" → ")})` : ""}</p> : null}
							<p><span className="text-muted-foreground">Subject:</span> {sc.subject}</p>
							<p><span className="text-muted-foreground">Action:</span> {sc.action}</p>
							<p><span className="text-muted-foreground">Camera:</span> {sc.camera}</p>
							<p><span className="text-muted-foreground">Lighting:</span> {sc.lighting}</p>
							<p><span className="text-muted-foreground">Transition:</span> {sc.transition}</p>
						</div>
					))}
				</div>
			</PackSection>
			<PackSection title="Video-generation prompts" copy={pack.video_prompts.map((v) => `Scene ${v.scene}\n${v.prompt}`).join("\n\n")}>
				<div className="space-y-2">
					{pack.video_prompts.map((v) => (
						<div key={v.scene}>
							<p className="mb-1 text-xs font-medium text-muted-foreground">Scene {v.scene}</p>
							<pre className="rounded-lg bg-muted p-2.5 text-xs leading-relaxed whitespace-pre-wrap">{v.prompt}</pre>
						</div>
					))}
				</div>
			</PackSection>
			<PackSection title="Subtitles" copy={pack.subtitles.map((x) => x.text).join("\n")}>
				{bullets(pack.subtitles.map((x) => `Scene ${x.scene}: ${x.text}`))}
			</PackSection>
			<PackSection title="Sound design">{bullets(pack.sound_design)}</PackSection>
			<PackSection title="Final assembly">
				<ol className="list-decimal space-y-1 pl-5">
					{pack.assembly.map((x, i) => (
						<li key={i}>{x}</li>
					))}
				</ol>
			</PackSection>
			<PackSection title="Source facts">
				<ul className="space-y-2">
					{pack.source_facts.map((f, i) => (
						<li key={i}>
							<p>{f.claim}</p>
							<p className="mt-0.5 border-l-2 border-border pl-2 text-xs text-muted-foreground">
								{f.passage}
								{f.found_in_source ? "" : " (quote not found in the source, check before use)"}
							</p>
						</li>
					))}
				</ul>
			</PackSection>
		</div>
	);
}

function downloadPack(pack: Pack) {
	const a = document.createElement("a");
	a.href = URL.createObjectURL(new Blob([pack.markdown], { type: "text/markdown" }));
	a.download = `${(pack.title || "prompt-pack").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}.md`;
	a.click();
	URL.revokeObjectURL(a.href);
}

export function VideoDetailPage() {
	const { id } = useParams({ strict: false }) as { id: string };
	const navigate = useNavigate();
	const qc = useQueryClient();
	const [variantId, setVariantId] = useState<string | null>(null);
	const q = useQuery({ queryKey: ["video", id], queryFn: () => api.video(id), refetchInterval: (query) => (isActive(query.state.data?.status) ? 1500 : false) });
	const del = useMutation({
		mutationFn: () => api.deleteVideo(id),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["videos"] });
			toast.success("Video deleted");
			navigate({ to: "/videos" });
		},
	});
	const [confirmDelete, setConfirmDelete] = useState(false);
	const stop = useMutation({
		mutationFn: () => api.cancelVideo(id),
		onSuccess: (job) => {
			qc.setQueryData(["video", id], job);
			qc.invalidateQueries({ queryKey: ["videos"] });
			qc.invalidateQueries({ queryKey: ["stats"] });
			toast.info("Stopped. Calls and rendering were cancelled.");
		},
		// It finished or failed a moment before: just show how it ended.
		onError: () => qc.invalidateQueries({ queryKey: ["video", id] }),
	});
	const regen = useMutation({
		mutationFn: () => api.regenerate(id),
		onSuccess: (job) => {
			qc.invalidateQueries({ queryKey: ["videos"] });
			toast.success("Regenerating with the same settings");
			navigate({ to: "/videos/$id", params: { id: job.id } });
		},
		onError: (e: Error) => toast.error(e.message),
	});

	if (q.isLoading)
		return (
			<div className="mx-auto max-w-6xl space-y-4 p-6">
				<Skeleton className="h-8 w-64" />
				<Skeleton className="h-[60vh] w-full" />
			</div>
		);
	if (!q.data)
		return (
			<div className="mx-auto max-w-md p-12 text-center">
				<p className="font-medium">Video not found</p>
				<Button variant="outline" className="mt-4" asChild>
					<Link to="/videos">Back to videos</Link>
				</Button>
			</div>
		);

	const deleteDialog = (
		<Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
				<DialogContent title="Delete video" className="top-[28%] max-w-md p-5">
					<p className="text-sm font-medium">Delete this video?</p>
					<p className="mt-1 text-sm text-muted-foreground">Its files are removed from data/videos.</p>
					<div className="mt-4 flex justify-end gap-2">
						<Button variant="outline" onClick={() => setConfirmDelete(false)}>
							Cancel
						</Button>
						<Button variant="danger" onClick={() => del.mutate()} disabled={del.isPending}>
							Delete
						</Button>
					</div>
				</DialogContent>
			</Dialog>
	);
	const job = q.data;
	const v = job.variants.find((x) => x.id === variantId) || job.variants.find((x) => x.result) || job.variants[0];
	const videoSrc = v?.result ? v.result.video_url || fileUrl(job.id, v.result.video_path, true) : null;
	const caption = v?.result?.caption || v?.caption || "";

	return (
		<div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
			<Link to="/videos" className="mb-4 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
				<Icon icon={ArrowLeft01Icon} size={13} /> Videos
			</Link>
			<div className="mb-5 flex flex-wrap items-start justify-between gap-3">
				<div className="min-w-0">
					<div className="flex flex-wrap items-center gap-2">
						<h1 className="truncate text-xl font-semibold tracking-tight">{v?.result?.title || job.title}</h1>
						<StatusBadge status={job.status} step={job.step} progress={job.progress} />
					</div>
					<div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
						<a href={job.input.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-foreground">
							<Icon icon={/github\.com/.test(job.input.url) ? GithubIcon : Globe02Icon} size={12} /> {hostOf(job.input.url)}
						</a>
						{job.input.github_url ? (
							<a href={job.input.github_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-foreground">
								<Icon icon={GithubIcon} size={12} /> {job.input.github_url.replace(/^https?:\/\/github\.com\//, "")}
							</a>
						) : null}
						<span>{job.type_label || job.input.type}</span>
						<span>
							{job.input.aspect} · {job.input.audio === "voice" ? "voice-over" : job.input.audio === "music" ? "music only" : "silent"}
						</span>
						<span>{timeAgo(job.created_at)}</span>
						<span className="tabular-nums">{job.cost ? usd(job.cost.total_usd) : `est. ${usd(job.estimate.total_usd)}`}</span>
					</div>
				</div>
				<div className="flex flex-wrap gap-1.5">
					{videoSrc ? (
						<Button size="sm" asChild>
							<a href={videoSrc} download>
								<Icon icon={Download04Icon} size={14} /> Download MP4
							</a>
						</Button>
					) : null}
					{caption ? <CopyButton text={caption} label="Copy caption" /> : null}
					{job.pack ? <CopyButton text={job.pack.markdown} label="Copy prompt pack" /> : null}
					{job.pack ? (
						<Button variant="outline" size="sm" onClick={() => downloadPack(job.pack!)}>
							<Icon icon={Download04Icon} size={14} /> Pack .md
						</Button>
					) : null}
					{isActive(job.status) ? (
						<Button variant="outline" size="sm" onClick={() => stop.mutate()} disabled={stop.isPending}>
							<Icon icon={StopIcon} size={13} className="fill-current" /> Stop
						</Button>
					) : (
						<Button variant="outline" size="sm" onClick={() => regen.mutate()} disabled={regen.isPending}>
							<Icon icon={RepeatIcon} size={14} /> Regenerate
						</Button>
					)}
					<Button variant="danger" size="sm" onClick={() => setConfirmDelete(true)} aria-label="Delete video">
						<Icon icon={Delete02Icon} size={14} />
					</Button>
				</div>
			</div>

			{job.error ? (
				<div className="mb-5 flex gap-2 rounded-xl border border-danger/25 bg-danger/5 p-3 text-sm text-danger">
					<Icon icon={AlertCircleIcon} size={16} className="mt-0.5" />
					<div className="min-w-0">
						<p className="font-medium break-words">{job.error}</p>
						{/OPENROUTER_API_KEY|OpenRouter key/i.test(job.error) ? (
							<Link to="/settings" className="mt-1 inline-block text-xs underline">
								Fix it in Settings
							</Link>
						) : null}
					</div>
				</div>
			) : null}

			{job.variants.length > 1 ? (
				<div className="mb-4 flex flex-wrap gap-1.5">
					{job.variants.map((x) => (
						<button
							key={x.id}
							type="button"
							onClick={() => setVariantId(x.id)}
							className={cn("rounded-lg border px-3 py-1.5 text-left text-xs", x.id === v?.id ? "border-foreground bg-accent" : "border-border hover:bg-accent")}
						>
							<span className="font-medium">{x.result?.title || x.concept.title}</span>
							<span className="ml-1.5 text-muted-foreground">{x.status === "success" ? `${Math.round(x.result?.duration_sec || 0)}s` : x.status}</span>
						</button>
					))}
				</div>
			) : null}

			<div className="grid gap-6 lg:grid-cols-[minmax(0,420px)_1fr]">
				<div>
					<Player job={job} v={v} onStop={() => stop.mutate()} stopping={stop.isPending} />
					{v?.concept ? (
						<div className="mt-3 rounded-xl border border-border p-3 text-xs">
							<p className="text-muted-foreground">Angle</p>
							<p className="mt-0.5 text-sm">{v.concept.angle || "—"}</p>
							{v.concept.hook ? <p className="mt-2 text-muted-foreground">Hook · <span className="text-foreground">“{v.concept.hook}”</span></p> : null}
						</div>
					) : null}
				</div>

				<Tabs defaultValue="overview">
					<TabsList>
						<TabsTrigger value="overview">Overview</TabsTrigger>
						<TabsTrigger value="script">Script</TabsTrigger>
						{job.pack ? <TabsTrigger value="pack">Prompt pack</TabsTrigger> : null}
						<TabsTrigger value="assets">Assets</TabsTrigger>
						<TabsTrigger value="logs">Logs</TabsTrigger>
					</TabsList>

					<TabsContent value="overview" className="mt-4 space-y-4">
						<div className="grid gap-4 sm:grid-cols-2">
							<div className="rounded-xl border border-border p-4">
								<p className="mb-2 text-xs font-medium text-muted-foreground">Progress</p>
								<Timeline job={job} />
							</div>
							<div className="rounded-xl border border-border p-4">
								<p className="mb-2 text-xs font-medium text-muted-foreground">Sources read</p>
								{job.sources.length ? (
									<ul className="space-y-1.5 text-sm">
										{job.sources.map((s, i) => (
											<li key={i} className="flex items-center gap-2">
												<span className={cn("size-1.5 shrink-0 rounded-full", s.ok ? "bg-success" : "bg-border")} />
												<span>{SOURCE_LABELS[s.type] || s.type}</span>
												<span className="truncate text-xs text-muted-foreground">{s.detail || hostOf(s.url)}</span>
											</li>
										))}
									</ul>
								) : (
									<p className="text-sm text-muted-foreground">Gathering…</p>
								)}
							</div>
						</div>
						{job.brief ? (
							<div className="rounded-xl border border-border p-4">
								<p className="text-xs font-medium text-muted-foreground">Product brief</p>
								<p className="mt-1 text-sm font-medium">{job.brief.product_name}</p>
								<p className="text-sm text-muted-foreground">{job.brief.one_liner}</p>
								<div className="mt-3 grid gap-3 text-xs sm:grid-cols-3">
									{[
										["Features", (job.brief.features || []).map((f) => f.name)],
										["Proof", (job.brief.proof || []).map((p) => `${p.value} ${p.label}`)],
										["Hooks", job.brief.hooks || []],
									].map(([title, items]) => (
										<div key={title as string}>
											<p className="mb-1 text-muted-foreground">{title as string}</p>
											<ul className="space-y-1">
												{(items as string[]).slice(0, 4).map((t, i) => (
													<li key={i}>{t}</li>
												))}
												{!(items as string[]).length ? <li className="text-muted-foreground">None found</li> : null}
											</ul>
										</div>
									))}
								</div>
							</div>
						) : null}
						{job.input.prompt || job.input.prompt_id ? (
							<div className="rounded-xl border border-border p-4 text-sm">
								<p className="mb-1 text-xs font-medium text-muted-foreground">Prompt</p>
								{job.input.prompt_id ? <Badge className="mb-2">{job.input.prompt_id}</Badge> : null}
								<p className="whitespace-pre-wrap text-muted-foreground">{job.input.prompt || "—"}</p>
							</div>
						) : null}
					</TabsContent>

					<TabsContent value="script" className="mt-4">
						{v?.result?.scenes?.length ? (
							<ol className="divide-y divide-border rounded-xl border border-border">
								{v.result.scenes.map((s) => {
									const frame = fileUrl(job.id, s.frame_path);
									return (
										<li key={s.id} className="flex gap-3 p-3">
											{frame ? <img src={frame} alt="" className={cn("shrink-0 rounded-md border border-border object-cover", job.input.aspect === "16:9" ? "h-12 w-20" : job.input.aspect === "1:1" ? "size-14" : "h-16 w-9")} loading="lazy" /> : null}
											<div className="min-w-0 text-sm">
												<p className="font-mono text-[11px] text-muted-foreground">
													{s.start.toFixed(1)}s · {s.duration.toFixed(1)}s · {s.visual.type}
												</p>
												<p className="mt-0.5">{s.narration || s.on_screen_text || String(s.visual.title || s.visual.question || s.visual.term || s.visual.text || "")}</p>
											</div>
										</li>
									);
								})}
							</ol>
						) : (
							<p className="text-sm text-muted-foreground">The script appears here once it's written.</p>
						)}
					</TabsContent>

					{job.pack ? (
						<TabsContent value="pack" className="mt-4">
							<PackContent pack={job.pack} />
						</TabsContent>
					) : null}

					<TabsContent value="assets" className="mt-4 space-y-4">
						{caption ? (
							<div className="rounded-xl border border-border p-4">
								<div className="mb-2 flex items-center justify-between">
									<p className="text-xs font-medium text-muted-foreground">Social caption</p>
									<CopyButton text={caption} label="Copy" />
								</div>
								<p className="text-sm whitespace-pre-wrap">{caption}</p>
							</div>
						) : null}
						{v?.result?.captions_path ? (
							<Button variant="outline" size="sm" asChild>
								<a href={fileUrl(job.id, v.result.captions_path, true) || "#"}>
									<Icon icon={Download04Icon} size={14} /> captions.srt
								</a>
							</Button>
						) : null}
						{v?.result?.music?.attribution ? <p className="text-xs text-muted-foreground">♪ {v.result.music.attribution}</p> : null}
						{job.frames.length ? (
							<div>
								<p className="mb-2 text-xs font-medium text-muted-foreground">Screenshots and images ({job.frames.length})</p>
								<div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
									{job.frames.map((f) => {
										const src = fileUrl(job.id, f.preview_path);
										return (
											<a key={f.id} href={src || "#"} target="_blank" rel="noreferrer" title={f.summary || f.source} className={cn("overflow-hidden rounded-lg border border-border", f.use_for === "skip" && "opacity-40")}>
												{src ? <img src={src} alt={f.summary || f.source} className="aspect-video w-full object-cover object-top" loading="lazy" /> : null}
												<span className="flex justify-between px-2 py-1 text-[10px] text-muted-foreground">
													{f.id}
													{f.quality ? <span>{f.quality}/10</span> : null}
												</span>
											</a>
										);
									})}
								</div>
							</div>
						) : (
							<p className="text-sm text-muted-foreground">Screenshots appear here once captured.</p>
						)}
					</TabsContent>

					<TabsContent value="logs" className="mt-4">
						<pre className="max-h-[60vh] overflow-auto rounded-xl border border-border bg-zinc-950 p-3 font-mono text-[11px] leading-relaxed text-zinc-300">{job.logs.join("\n") || "No logs yet."}</pre>
					</TabsContent>
				</Tabs>
			</div>
			{deleteDialog}
		</div>
	);
}
