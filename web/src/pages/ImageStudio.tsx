import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { Command } from "cmdk";
import { toast } from "sonner";
import { AiImageIcon, ArrowUp02Icon, Cancel01Icon, Copy01Icon, Delete02Icon, Download01Icon, Edit02Icon, QuillWrite01Icon, RefreshIcon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/Icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, Menu, MenuContent, MenuLabel, MenuRadioGroup, MenuRadioItem, MenuSeparator, MenuTrigger } from "@/components/ui/menu";
import { Skeleton } from "@/components/ui/misc";
import { api, imageUrl, usePrompts, type ImageJob, type ImageModel } from "@/lib/api";
import { cn, timeAgo, usd } from "@/lib/utils";
import { useWorkspace } from "@/lib/workspace";

const price = (m: ImageModel) => (m.free ? "free" : m.image_usd ? `${usd(m.image_usd, 3)} / image` : `${usd(m.completion_usd_per_m, 2)} / M out tokens`);

export function ImageStudioPage() {
	const qc = useQueryClient();
	const navigate = useNavigate();
	const search = useSearch({ strict: false }) as { prompt?: string };
	const { slug, product } = useWorkspace();
	const options = useQuery({ queryKey: ["images", "options"], queryFn: api.imageOptions, staleTime: 5 * 60_000 });
	const prompts = usePrompts();
	const jobs = useQuery({
		queryKey: ["images", "list"],
		queryFn: () => api.images(),
		refetchInterval: (q) => (q.state.data?.some((j) => j.status === "running") ? 2000 : false),
	});

	const [text, setText] = useState("");
	const [model, setModel] = useState("");
	const [dimension, setDimension] = useState("og");
	const [custom, setCustom] = useState({ width: 1024, height: 1024 });
	const [count, setCount] = useState(1);
	const [useProduct, setUseProduct] = useState(true);
	const [promptId, setPromptId] = useState<string | null>(null);
	const [reference, setReference] = useState<{ job: string; file: string } | null>(null);
	const [pickModel, setPickModel] = useState(false);
	const [pickPrompt, setPickPrompt] = useState(false);
	const [zoom, setZoom] = useState<{ job: ImageJob; file: string } | null>(null);
	const taRef = useRef<HTMLTextAreaElement>(null);
	const endRef = useRef<HTMLDivElement>(null);

	const models = options.data?.models || [];
	const current = models.find((m) => m.id === (model || options.data?.default_model));
	const imagePrompts = useMemo(() => (prompts.data || []).filter((p) => p.kind === "image"), [prompts.data]);
	const loadedPrompt = imagePrompts.find((p) => p.id === promptId) || null;

	useEffect(() => {
		if (options.data && !model) setModel(options.data.default_model);
	}, [options.data, model]);

	// ?prompt=image:<slug> (from the prompt library) preloads a prompt and its size.
	useEffect(() => {
		if (!search.prompt || !imagePrompts.length) return;
		const p = imagePrompts.find((x) => x.id === search.prompt);
		if (p) applyPrompt(p.id);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [search.prompt, imagePrompts.length]);

	function applyPrompt(id: string) {
		const p = imagePrompts.find((x) => x.id === id);
		if (!p) return;
		setPromptId(p.id);
		if (p.dimension && options.data?.dimensions.some((d) => d.id === p.dimension)) setDimension(p.dimension);
		setPickPrompt(false);
		setTimeout(() => taRef.current?.focus(), 0);
	}

	const list = useMemo(() => [...(jobs.data || [])].reverse(), [jobs.data]);
	const lastId = list[list.length - 1]?.id;
	useEffect(() => {
		endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
	}, [lastId]);

	const size = dimension === "custom" ? custom : options.data?.dimensions.find((d) => d.id === dimension) || { width: 1200, height: 630 };

	const create = useMutation({
		mutationFn: () =>
			api.createImage({
				prompt: text.trim(),
				model: model || options.data?.default_model || "",
				dimension: dimension === "custom" ? undefined : dimension,
				width: dimension === "custom" ? custom.width : undefined,
				height: dimension === "custom" ? custom.height : undefined,
				count,
				product: useProduct && slug ? slug : undefined,
				prompt_id: promptId || undefined,
				reference: reference || undefined,
			}),
		onSuccess: (job) => {
			qc.setQueryData<ImageJob[]>(["images", "list"], (old) => [job, ...(old || [])]);
			setText("");
			setReference(null);
			if (search.prompt) navigate({ to: "/images", search: {}, replace: true });
		},
		onError: (e: Error) => toast.error(e.message),
	});
	const remove = useMutation({
		mutationFn: (id: string) => api.deleteImage(id),
		onSuccess: () => qc.invalidateQueries({ queryKey: ["images", "list"] }),
	});

	const submit = () => {
		if (!text.trim() || create.isPending) return;
		create.mutate();
	};
	const edit = (job: ImageJob, file: string) => {
		if (current && !current.image_in) {
			const alt = models.find((m) => m.image_in);
			toast.error(`${current.name} cannot edit images.${alt ? ` Switch to a model like ${alt.name}.` : ""}`);
		}
		setReference({ job: job.id, file });
		setText("");
		setTimeout(() => taRef.current?.focus(), 0);
	};
	const again = (job: ImageJob) => {
		setText(job.prompt);
		setModel(job.model);
		setDimension(job.dimension);
		if (job.dimension === "custom") setCustom({ width: job.width, height: job.height });
		setCount(job.count);
		setPromptId(job.prompt_id);
		setTimeout(() => taRef.current?.focus(), 0);
	};
	const copy = (t: string) => navigator.clipboard?.writeText(t).then(() => toast.success("Prompt copied"));

	return (
		<div className="mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-5xl flex-col px-4 py-6 sm:px-6">
			<div className="mb-4">
				<h1 className="text-xl font-semibold tracking-tight">Image studio</h1>
				<p className="mt-1 text-sm text-muted-foreground">Describe an image, pick any OpenRouter image model and an exact size. Your product's memory is added so visuals match your brand.</p>
			</div>

			<div className="flex-1 space-y-6 pb-4">
				{jobs.isLoading ? (
					<Skeleton className="h-48" />
				) : list.length === 0 ? (
					<EmptyState onPick={(t) => setText(t)} product={product?.name} />
				) : (
					list.map((job) => <JobCard key={job.id} job={job} onZoom={(file) => setZoom({ job, file })} onEdit={edit} onAgain={() => again(job)} onCopy={() => copy(job.prompt)} onDelete={() => remove.mutate(job.id)} />)
				)}
				<div ref={endRef} />
			</div>

			<div className="sticky bottom-3 z-10 rounded-2xl border border-border bg-surface p-3 shadow-lg">
				{reference || loadedPrompt ? (
					<div className="mb-2 flex flex-wrap gap-1.5">
						{reference ? (
							<span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/50 py-0.5 pr-1.5 pl-0.5 text-xs">
								<img src={imageUrl(reference.job, reference.file)} alt="" className="size-6 rounded object-cover" />
								Editing this image
								<button type="button" aria-label="Stop editing" onClick={() => setReference(null)} className="text-muted-foreground hover:text-foreground">
									<Icon icon={Cancel01Icon} size={12} />
								</button>
							</span>
						) : null}
						{loadedPrompt ? (
							<span className="inline-flex items-center gap-1.5 rounded-lg border border-orange-200 bg-orange-50 px-2 py-1 text-xs text-orange-700 dark:border-orange-900 dark:bg-orange-950/40 dark:text-orange-300">
								<Icon icon={QuillWrite01Icon} size={12} /> {loadedPrompt.name}
								<button type="button" aria-label="Remove prompt" onClick={() => setPromptId(null)}>
									<Icon icon={Cancel01Icon} size={12} />
								</button>
							</span>
						) : null}
					</div>
				) : null}
				<textarea
					ref={taRef}
					value={text}
					onChange={(e) => setText(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === "Enter" && !e.shiftKey) {
							e.preventDefault();
							submit();
						}
					}}
					rows={2}
					placeholder={reference ? "Describe the change: make the background darker, add a rocket…" : `Describe the image${product ? ` for ${product.name}` : ""}: "A launch-day OG image with the headline 'Ship faster'…"`}
					className="w-full resize-none bg-transparent px-1 text-sm outline-none placeholder:text-muted-foreground"
				/>
				<div className="mt-2 flex flex-wrap items-center gap-1.5">
					<Button variant="outline" size="sm" onClick={() => setPickModel(true)} className="max-w-56">
						<Icon icon={AiImageIcon} size={14} />
						<span className="truncate">{current?.name || model || "Choose model"}</span>
						{current ? <span className="text-muted-foreground">· {price(current)}</span> : null}
					</Button>
					<Menu>
						<MenuTrigger asChild>
							<Button variant="outline" size="sm">
								{size.width} × {size.height}
							</Button>
						</MenuTrigger>
						<MenuContent className="max-h-96 w-64 overflow-y-auto">
							<MenuRadioGroup value={dimension} onValueChange={setDimension}>
								{["Web", "Product", "Launch", "Social"].map((group) => (
									<div key={group}>
										<MenuLabel>{group}</MenuLabel>
										{(options.data?.dimensions || []).filter((d) => d.group === group).map((d) => (
											<MenuRadioItem key={d.id} value={d.id}>
												{d.label} <span className="ml-auto pl-3 text-xs text-muted-foreground">{d.width}×{d.height}</span>
											</MenuRadioItem>
										))}
									</div>
								))}
								<MenuSeparator />
								<MenuRadioItem value="custom">Custom size…</MenuRadioItem>
							</MenuRadioGroup>
						</MenuContent>
					</Menu>
					{dimension === "custom" ? (
						<span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
							<Input type="number" min={options.data?.min_px || 256} max={options.data?.max_px || 4096} value={custom.width} onChange={(e) => setCustom({ ...custom, width: Number(e.target.value) })} className="h-8 w-20" />
							×
							<Input type="number" min={options.data?.min_px || 256} max={options.data?.max_px || 4096} value={custom.height} onChange={(e) => setCustom({ ...custom, height: Number(e.target.value) })} className="h-8 w-20" />
						</span>
					) : null}
					<div className="flex items-center rounded-lg border border-border p-0.5">
						{[1, 2, 3, 4].slice(0, options.data?.max_count || 4).map((n) => (
							<button key={n} type="button" onClick={() => setCount(n)} aria-label={`${n} image${n > 1 ? "s" : ""}`} className={cn("h-7 min-w-7 rounded-md px-2 text-xs font-medium", count === n ? "bg-accent" : "text-muted-foreground hover:text-foreground")}>
								{n}
							</button>
						))}
					</div>
					<Button variant="outline" size="sm" onClick={() => setPickPrompt(true)}>
						<Icon icon={QuillWrite01Icon} size={14} /> Prompts
					</Button>
					{product ? (
						<label className="inline-flex cursor-pointer items-center gap-1.5 text-xs text-muted-foreground select-none">
							<input type="checkbox" checked={useProduct} onChange={(e) => setUseProduct(e.target.checked)} className="accent-[var(--brand)]" />
							{product.name} context
						</label>
					) : null}
					<Button size="icon" className="ml-auto size-9 rounded-xl" onClick={submit} disabled={!text.trim() || create.isPending} aria-label="Generate">
						<Icon icon={ArrowUp02Icon} size={18} />
					</Button>
				</div>
			</div>

			<Dialog open={pickModel} onOpenChange={setPickModel}>
				<DialogContent title="Choose an image model" className="max-w-xl">
					<Command loop>
						<Command.Input autoFocus placeholder={`Search ${models.length} image models…`} className="h-12 w-full border-b border-border bg-transparent px-4 text-sm outline-none placeholder:text-muted-foreground" />
						<Command.List className="max-h-96 overflow-y-auto p-1.5">
							<Command.Empty className="px-4 py-6 text-center text-sm text-muted-foreground">{models.length ? "No models match." : "Could not load the OpenRouter model list. Type your model id in Settings."}</Command.Empty>
							{[false, true].map((free) => {
								const list = models.filter((m) => m.free === free);
								if (!list.length) return null;
								return (
									<Command.Group key={String(free)} heading={free ? "Free" : "Paid"} className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground">
										{list.map((m) => (
											<Command.Item
												key={m.id}
												value={`${m.name} ${m.id}`}
												onSelect={() => {
													setModel(m.id);
													setPickModel(false);
												}}
												className="flex cursor-default items-center gap-2 rounded-lg px-2.5 py-2 outline-none data-[selected=true]:bg-accent"
											>
												<div className="min-w-0 flex-1">
													<p className="truncate text-sm font-medium">{m.name}</p>
													<p className="truncate font-mono text-[11px] text-muted-foreground">{m.id}</p>
												</div>
												{m.image_in ? <Badge tone="outline">edits</Badge> : null}
												<span className="shrink-0 text-xs text-muted-foreground">{price(m)}</span>
											</Command.Item>
										))}
									</Command.Group>
								);
							})}
						</Command.List>
					</Command>
				</DialogContent>
			</Dialog>

			<Dialog open={pickPrompt} onOpenChange={setPickPrompt}>
				<DialogContent title="Image prompts" className="max-w-xl">
					<Command loop>
						<Command.Input autoFocus placeholder="Search image prompts…" className="h-12 w-full border-b border-border bg-transparent px-4 text-sm outline-none placeholder:text-muted-foreground" />
						<Command.List className="max-h-96 overflow-y-auto p-1.5">
							<Command.Empty className="px-4 py-6 text-center text-sm text-muted-foreground">No prompts match.</Command.Empty>
							{imagePrompts.map((p) => (
								<Command.Item key={p.id} value={`${p.name} ${p.description} ${p.category || ""} ${(p.uses || []).join(" ")}`} onSelect={() => applyPrompt(p.id)} className="flex cursor-default flex-col items-start gap-0.5 rounded-lg px-2.5 py-2 outline-none data-[selected=true]:bg-accent">
									<span className="text-sm font-medium">{p.name}</span>
									<span className="line-clamp-1 text-xs text-muted-foreground">{p.description}</span>
								</Command.Item>
							))}
						</Command.List>
					</Command>
				</DialogContent>
			</Dialog>

			<Dialog open={Boolean(zoom)} onOpenChange={(o) => !o && setZoom(null)}>
				<DialogContent title="Image preview" className="top-[6%] max-w-4xl bg-black p-0">
					{zoom ? <img src={imageUrl(zoom.job.id, zoom.file)} alt={zoom.job.prompt} className="max-h-[85vh] w-full object-contain" /> : null}
				</DialogContent>
			</Dialog>
		</div>
	);
}

function EmptyState({ onPick, product }: { onPick: (t: string) => void; product?: string }) {
	const ideas = [
		`An Open Graph image for ${product || "my SaaS"} with the headline "Ship faster, break nothing"`,
		`A clean app icon for ${product || "my product"}: bold symbol, two-color gradient`,
		"A Product Hunt gallery slide showing one benefit: save 5 hours a week",
		"An isometric hero illustration of messy data turning into one clear dashboard",
	];
	return (
		<div className="rounded-2xl border border-dashed border-border p-8 text-center">
			<Icon icon={AiImageIcon} size={28} className="mx-auto text-muted-foreground" />
			<p className="mt-3 text-sm font-medium">Make your first image</p>
			<p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">Type below, or start from the Prompts button for ready-made OG images, icons, launch graphics and more.</p>
			<div className="mx-auto mt-4 flex max-w-xl flex-wrap justify-center gap-2">
				{ideas.map((t) => (
					<button key={t} type="button" onClick={() => onPick(t)} className="rounded-full border border-border px-3 py-1.5 text-left text-xs text-muted-foreground hover:bg-accent hover:text-foreground">
						{t}
					</button>
				))}
			</div>
		</div>
	);
}

function JobCard({ job, onZoom, onEdit, onAgain, onCopy, onDelete }: { job: ImageJob; onZoom: (file: string) => void; onEdit: (job: ImageJob, file: string) => void; onAgain: () => void; onCopy: () => void; onDelete: () => void }) {
	const running = job.status === "running";
	const cols = job.images.length > 1 || job.count > 1 ? "sm:grid-cols-2" : "";
	return (
		<div className="space-y-3">
			<div className="ml-auto max-w-2xl rounded-2xl rounded-tr-sm bg-accent px-4 py-2.5 text-sm">
				<p className="whitespace-pre-wrap">{job.prompt}</p>
				<p className="mt-1.5 flex flex-wrap items-center gap-x-2 text-[11px] text-muted-foreground">
					<span>{job.model_name}</span>·<span>{job.width}×{job.height}</span>·<span>{job.count} image{job.count > 1 ? "s" : ""}</span>
					{job.reference ? <>·<span>edit</span></> : null}
					{!running ? <>·<span>{usd(job.cost_usd, 3)}</span></> : null}·<span>{timeAgo(job.created_at)}</span>
				</p>
			</div>
			<div className={cn("grid max-w-3xl gap-3", cols)}>
				{running
					? Array.from({ length: job.count }).map((_, i) => (
							<div key={i} className="flex items-center justify-center rounded-xl border border-border bg-muted/40 text-xs text-muted-foreground" style={{ aspectRatio: `${job.width} / ${job.height}` }}>
								<Icon icon={RefreshIcon} size={16} className="mr-2 animate-spin" /> Generating…
							</div>
						))
					: job.images.map((im) => (
							<div key={im.file} className="group relative overflow-hidden rounded-xl border border-border bg-muted/30">
								<button type="button" onClick={() => onZoom(im.file)} className="block w-full">
									<img src={imageUrl(job.id, im.file)} alt={job.prompt} loading="lazy" className="w-full" style={{ aspectRatio: `${im.width} / ${im.height}` }} />
								</button>
								<div className="absolute right-2 bottom-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
									<a href={imageUrl(job.id, im.file, true)} download className="inline-flex size-8 items-center justify-center rounded-lg bg-surface/95 shadow hover:bg-accent" aria-label="Download" title="Download PNG">
										<Icon icon={Download01Icon} size={15} />
									</a>
									<button type="button" onClick={() => onEdit(job, im.file)} className="inline-flex size-8 items-center justify-center rounded-lg bg-surface/95 shadow hover:bg-accent" aria-label="Edit this image" title="Edit this image">
										<Icon icon={Edit02Icon} size={15} />
									</button>
								</div>
							</div>
						))}
			</div>
			{job.errors.length ? (
				<div className="max-w-3xl rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
					{job.errors.map((e, i) => (
						<p key={i}>{e}</p>
					))}
				</div>
			) : null}
			{!running ? (
				<div className="flex gap-1">
					<Button variant="ghost" size="sm" onClick={onAgain}>
						<Icon icon={RefreshIcon} size={13} /> Reuse settings
					</Button>
					<Button variant="ghost" size="sm" onClick={onCopy}>
						<Icon icon={Copy01Icon} size={13} /> Copy prompt
					</Button>
					<Button variant="ghost" size="sm" onClick={onDelete}>
						<Icon icon={Delete02Icon} size={13} /> Delete
					</Button>
				</div>
			) : null}
		</div>
	);
}
