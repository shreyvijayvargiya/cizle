import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Command } from "cmdk";
import { toast } from "sonner";
import {
	ArrowDown01Icon,
	ArrowUp02Icon,
	AspectRatioIcon,
	Cancel01Icon,
	GithubIcon,
	Layers01Icon,
	Mic01Icon,
	Package01Icon,
	MusicNote01Icon,
	PaintBoardIcon,
	PaintBrush01Icon,
	QuillWrite01Icon,
	SlidersHorizontalIcon,
	StopIcon,
	VolumeOffIcon,
} from "@hugeicons/core-free-icons";
import { Icon } from "@/components/Icon";
import { ModelToggle } from "@/components/ModelToggle";
import { ReviewCard, effectiveChoice, type AnswerKey, type ReviewAnswers } from "@/components/ReviewCard";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, Menu, MenuContent, MenuLabel, MenuRadioGroup, MenuRadioItem, MenuSeparator, MenuTrigger } from "@/components/ui/menu";
import { isAborted, useAbort } from "@/lib/abort";
import { Tip } from "@/components/ui/misc";
import { ApiError, api, usePrompts, useSettings, type Aspect, type Audio, type CreateVideo, type Prompt, type Review, type StyleId } from "@/lib/api";
import { ASPECTS, AUDIO, STYLES, STYLE_LABEL, VOICES } from "@/lib/constants";
import { cn, hostOf } from "@/lib/utils";
import { useWorkspace } from "@/lib/workspace";

const URL_RE = /\b((?:https?:\/\/)?(?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/[^\s,]*)?)/gi;

function extractLinks(text: string) {
	const found = [...new Set((text.match(URL_RE) || []).map((u) => (/^https?:\/\//i.test(u) ? u : `https://${u}`)))];
	const github = found.filter((u) => /^https?:\/\/(www\.)?github\.com\/[^/]+\/[^/\s]+/i.test(u));
	const sites = found.filter((u) => !github.includes(u));
	return { site: sites[0] || null, github: github[0] || null };
}

function useDebounced<T>(value: T, ms = 450) {
	const [v, setV] = useState(value);
	useEffect(() => {
		const t = setTimeout(() => setV(value), ms);
		return () => clearTimeout(t);
	}, [value, ms]);
	return v;
}

function Pill({ icon, label, children }: { icon: Parameters<typeof Icon>[0]["icon"]; label: string; children: React.ReactNode }) {
	return (
		<Menu>
			<MenuTrigger asChild>
				<button
					type="button"
					className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 text-xs font-medium text-foreground/80 transition-colors hover:bg-accent data-[state=open]:bg-accent"
				>
					<Icon icon={icon} size={14} className="text-muted-foreground" />
					<span className="max-w-28 truncate">{label}</span>
					<Icon icon={ArrowDown01Icon} size={12} className="text-muted-foreground" />
				</button>
			</MenuTrigger>
			{children}
		</Menu>
	);
}

export function Composer({ initialPromptId, initialPresetId, autoFocus, size = "lg" }: { initialPromptId?: string; initialPresetId?: string; autoFocus?: boolean; size?: "md" | "lg" }) {
	const navigate = useNavigate();
	const qc = useQueryClient();
	const settings = useSettings();
	const prompts = usePrompts();
	const { slug, product, tier } = useWorkspace();
	const [text, setText] = useState("");
	const [type, setType] = useState("auto");
	const [tone, setTone] = useState("auto");
	const [style, setStyle] = useState<StyleId | "auto">("auto");
	const [aspect, setAspect] = useState<Aspect>("9:16");
	const [audio, setAudio] = useState<Audio>("voice");
	const [duration, setDuration] = useState(30);
	const [variations, setVariations] = useState(1);
	const [voice, setVoice] = useState("nova");
	const [compare, setCompare] = useState("");
	const [loaded, setLoaded] = useState<Prompt | null>(null);
	const [pickerOpen, setPickerOpen] = useState(false);
	const [review, setReview] = useState<Review | null>(null);
	const [answers, setAnswers] = useState<ReviewAnswers>({});
	const [finalPrompt, setFinalPrompt] = useState("");
	const taRef = useRef<HTMLTextAreaElement>(null);
	const seeded = useRef(false);

	const types = (prompts.data || []).filter((p) => p.kind === "type");
	const tones = (prompts.data || []).filter((p) => p.kind === "tone");

	// Defaults from Settings, once.
	useEffect(() => {
		if (!settings.data || seeded.current) return;
		seeded.current = true;
		setAspect(settings.data.aspect);
		setAudio(settings.data.audio);
		setDuration(settings.data.duration_sec);
		setVoice(settings.data.voice);
	}, [settings.data]);

	// ?prompt=<id> preloads a prompt from the library.
	useEffect(() => {
		if (!initialPromptId || !prompts.data) return;
		const p = prompts.data.find((x) => x.id === initialPromptId);
		if (p) applyPrompt(p);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [initialPromptId, prompts.data]);

	// ?preset=<id> (Gallery → Remix) fills type, tone, aspect and direction; the product supplies the URL.
	const gallery = useQuery({ queryKey: ["gallery", slug], queryFn: () => api.gallery(slug), enabled: Boolean(initialPresetId) });
	const presetApplied = useRef<string | null>(null);
	useEffect(() => {
		const preset = gallery.data?.presets.find((x) => x.id === initialPresetId);
		if (!preset || presetApplied.current === preset.id) return;
		presetApplied.current = preset.id;
		setType(preset.type);
		setTone(preset.tone);
		setStyle(preset.style || "auto");
		setAspect(preset.aspect);
		setText((t) => t || preset.prompt);
		setTimeout(() => taRef.current?.focus(), 0);
	}, [gallery.data, initialPresetId]);

	function applyPrompt(p: Prompt) {
		if (p.kind === "type") setType(p.slug);
		else if (p.kind === "tone") setTone(p.slug);
		else if (p.kind === "film") {
			// An Opus film style steers the render toward its closest cizle look and gives the director its one-line direction.
			setLoaded(p);
			setStyle((p.style || "default") as StyleId);
		} else {
			setLoaded(p);
			if (p.type) setType(p.type);
		}
		const typeEntry = p.kind === "type" ? p : types.find((t) => t.slug === p.type);
		if (typeEntry?.duration) setDuration(typeEntry.duration);
		setPickerOpen(false);
		setTimeout(() => taRef.current?.focus(), 0);
	}

	// Auto-grow.
	useEffect(() => {
		const el = taRef.current;
		if (!el) return;
		el.style.height = "auto";
		el.style.height = `${Math.min(el.scrollHeight, 260)}px`;
	}, [text]);

	const links = useMemo(() => extractLinks(text), [text]);
	// With a product selected, no pasted link is needed: its website and first repo come from products/<slug>/.
	const usingProduct = Boolean(product) && !links.site && !links.github;
	const mainUrl = links.site || links.github || (usingProduct ? product!.url : null);
	const productRepo = usingProduct && product!.repos[0] && !/github\.com/i.test(product!.url) ? `https://github.com/${product!.repos[0]}` : undefined;
	const body: CreateVideo = {
		url: mainUrl || undefined,
		github_url: productRepo || (links.site && links.github ? links.github : undefined),
		product: usingProduct ? slug : undefined,
		model_tier: tier,
		compare_urls: compare.split(/[\s,]+/).filter(Boolean),
		prompt: text,
		prompt_id: loaded?.id || null,
		type,
		tone,
		style,
		aspect,
		audio,
		duration_sec: duration,
		variations,
		voice,
	};
	const debounced = useDebounced(body);
	const estimate = useQuery({
		queryKey: ["estimate", JSON.stringify(debounced)],
		queryFn: () => api.estimate(debounced),
		enabled: Boolean(debounced.url),
		staleTime: 60_000,
	});

	const abort = useAbort();
	const onError = (e: ApiError) => {
		if (isAborted(e)) {
			toast.info("Stopped. Nothing was started.");
			return;
		}
		toast.error(e.message, e.code === "MISSING_API_KEY" || e.code === "OPENROUTER_AUTH" ? { action: { label: "Open settings", onClick: () => navigate({ to: "/settings" }) } } : undefined);
	};
	const create = useMutation({
		mutationFn: (b: CreateVideo) => api.createVideo(b, abort.next()),
		onSuccess: (job) => {
			qc.invalidateQueries({ queryKey: ["videos"] });
			qc.invalidateQueries({ queryKey: ["stats"] });
			toast.success("Video started", { description: "Reading your link now." });
			navigate({ to: "/videos/$id", params: { id: job.id } });
		},
		onError,
	});
	// The review asks its questions first; it creates nothing. Only Approve below calls the create API.
	const reviewing = useMutation({
		mutationFn: (b: CreateVideo) => api.review(b, abort.next()),
		onSuccess: (r) => {
			setReview(r);
			setAnswers({});
			setFinalPrompt(r.final_prompt);
		},
		onError,
	});
	const savePrompt = useMutation({
		mutationFn: (r: Review) => api.createPrompt({ name: r.save_prompt!.name, description: r.save_prompt!.description, body: r.save_prompt!.body, type: r.save_prompt!.type || null, review_id: r.id }),
		onSuccess: (p) => {
			qc.invalidateQueries({ queryKey: ["prompts"] });
			setReview(null);
			setText("");
			toast.success(`Saved “${p.name}” to your library`, { action: { label: "Open", onClick: () => navigate({ to: "/prompts/$id", params: { id: p.id } }) } });
		},
		onError,
	});

	const submit = () => {
		if (!text.trim() && !mainUrl) {
			toast.error("Paste a link or describe what you want first.");
			taRef.current?.focus();
			return;
		}
		reviewing.mutate(body);
	};

	const approve = () => {
		if (!review) return;
		if (review.intent === "save_prompt") return savePrompt.mutate(review);
		const choice = effectiveChoice(review, answers);
		const list = (v: string | string[] | undefined) => [v].flat().filter(Boolean) as string[];
		const extra = [list(answers.audience).length && `Audience: ${list(answers.audience).join(", ")}`, list(answers.key_takeaway).length && `Key takeaway: ${list(answers.key_takeaway)[0]}`].filter(Boolean);
		const promptId = answers.prompt_id !== undefined ? answers.prompt_id : loaded?.id || "";
		create.mutate({
			...body,
			type: choice.type,
			tone: choice.tone,
			style: (answers.style as StyleId | "auto" | undefined) ?? style,
			aspect: choice.aspect,
			audio: choice.audio,
			duration_sec: choice.duration_sec,
			variations: list(answers.variations)[0] ? Number(list(answers.variations)[0]) : variations,
			model_tier: (list(answers.model_tier)[0] as "free" | "paid" | undefined) ?? tier,
			prompt_id: promptId || null,
			prompt: [finalPrompt.trim(), ...extra].join("\n"),
			review_id: review.id,
		});
	};
	const setAnswer = (key: AnswerKey, v: string | string[]) => setAnswers((a) => ({ ...a, [key]: v }));
	const busy = create.isPending || reviewing.isPending || savePrompt.isPending;

	const typeName = type === "auto" ? "Any type" : types.find((t) => t.slug === type)?.name || type;
	const toneName = tone === "auto" ? "Best tone" : tones.find((t) => t.slug === tone)?.name || tone;
	const audioIcon = audio === "voice" ? Mic01Icon : audio === "music" ? MusicNote01Icon : VolumeOffIcon;

	return (
		<div className="w-full">
			{review ? (
				<ReviewCard review={review} answers={answers} setAnswer={setAnswer} library={prompts.data || []} loadedPromptId={loaded?.id || null} style={style} prompt={finalPrompt} setPrompt={setFinalPrompt} onApprove={approve} onCancel={() => setReview(null)} busy={create.isPending || savePrompt.isPending} />
			) : null}
			<div
				className={cn(
					"rounded-2xl border border-border bg-surface shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(0,0,0,0.12)] transition-shadow focus-within:border-ring/60 focus-within:shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_-12px_rgba(0,0,0,0.18)]",
				)}
			>
				{links.site || links.github || usingProduct || loaded || type !== "auto" || tone !== "auto" || style !== "auto" ? (
					<div className="flex flex-wrap gap-1.5 px-4 pt-3.5">
						{usingProduct ? (
							<span className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2 py-1 text-xs font-medium">
								<Icon icon={Package01Icon} size={12} />
								{product!.name}
								{product!.repos.length ? <span className="text-muted-foreground">+ {product!.repos.length} repo{product!.repos.length === 1 ? "" : "s"}</span> : null}
							</span>
						) : null}
						{links.site ? (
							<span className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2 py-1 text-xs font-medium">
								<img src={`https://www.google.com/s2/favicons?domain=${hostOf(links.site)}&sz=32`} alt="" className="size-3.5 rounded-sm" onError={(e) => (e.currentTarget.style.display = "none")} />
								{hostOf(links.site)}
							</span>
						) : null}
						{links.github ? (
							<span className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2 py-1 text-xs font-medium">
								<Icon icon={GithubIcon} size={12} />
								{links.github.replace(/^https?:\/\/(www\.)?github\.com\//i, "")}
							</span>
						) : null}
						{type !== "auto" ? (
							<span className="inline-flex items-center gap-1.5 rounded-md border border-brand/30 bg-brand/10 px-2 py-1 text-xs font-medium text-brand">
								<Icon icon={Layers01Icon} size={12} />
								{typeName}
								<button type="button" aria-label="Remove video type" onClick={() => setType("auto")} className="-mr-0.5 rounded hover:bg-brand/15">
									<Icon icon={Cancel01Icon} size={12} />
								</button>
							</span>
						) : null}
						{tone !== "auto" ? (
							<span className="inline-flex items-center gap-1.5 rounded-md border border-brand/30 bg-brand/10 px-2 py-1 text-xs font-medium text-brand">
								<Icon icon={PaintBoardIcon} size={12} />
								{toneName}
								<button type="button" aria-label="Remove tone" onClick={() => setTone("auto")} className="-mr-0.5 rounded hover:bg-brand/15">
									<Icon icon={Cancel01Icon} size={12} />
								</button>
							</span>
						) : null}
						{style !== "auto" ? (
							<span className="inline-flex items-center gap-1.5 rounded-md border border-brand/30 bg-brand/10 px-2 py-1 text-xs font-medium text-brand">
								<Icon icon={PaintBrush01Icon} size={12} />
								{STYLE_LABEL[style]}
								<button type="button" aria-label="Remove style" onClick={() => setStyle("auto")} className="-mr-0.5 rounded hover:bg-brand/15">
									<Icon icon={Cancel01Icon} size={12} />
								</button>
							</span>
						) : null}
						{loaded ? (
							<span className="inline-flex items-center gap-1.5 rounded-md border border-brand/30 bg-brand/10 px-2 py-1 text-xs font-medium text-brand">
								<Icon icon={QuillWrite01Icon} size={12} />
								{loaded.name}
								<button type="button" aria-label="Remove prompt" onClick={() => setLoaded(null)} className="-mr-0.5 rounded hover:bg-brand/15">
									<Icon icon={Cancel01Icon} size={12} />
								</button>
							</span>
						) : null}
					</div>
				) : null}
				<textarea
					ref={taRef}
					autoFocus={autoFocus}
					value={text}
					rows={size === "lg" ? 3 : 2}
					onChange={(e) => {
						const v = e.target.value;
						if (v === "/") {
							setPickerOpen(true);
							setText("");
							return;
						}
						setText(v);
					}}
					onKeyDown={(e) => {
						if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
							e.preventDefault();
							submit();
						}
					}}
					placeholder={product ? `Describe the video you want for ${product.name}…  (type / to load a prompt)` : "Paste your website or GitHub repo, then describe the ad or video you want…  (type / to load a prompt)"}
					className={cn("block w-full resize-none bg-transparent px-4 pt-3.5 pb-2 text-[15px] leading-relaxed outline-none placeholder:text-muted-foreground/80", size === "lg" ? "min-h-24" : "min-h-16")}
				/>
				{type === "comparison" ? (
					<div className="mx-4 mb-2 flex items-center gap-2 rounded-lg border border-dashed border-border px-2.5 py-1.5">
						<span className="text-xs whitespace-nowrap text-muted-foreground">Compare with</span>
						<input
							value={compare}
							onChange={(e) => setCompare(e.target.value)}
							placeholder="competitor.com, other.io"
							className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/70"
						/>
					</div>
				) : null}
				<div className="flex flex-wrap items-center gap-1.5 px-3 pb-3">
					<button
						type="button"
						onClick={() => setPickerOpen(true)}
						className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 text-xs font-medium text-foreground/80 hover:bg-accent"
					>
						<Icon icon={QuillWrite01Icon} size={14} className="text-muted-foreground" />
						Load prompt
					</button>
					<Pill icon={Layers01Icon} label={typeName}>
						<MenuContent className="max-h-[60vh] w-72 overflow-y-auto">
							<MenuLabel>Video type</MenuLabel>
							<MenuRadioGroup value={type} onValueChange={setType}>
								<MenuRadioItem value="auto">
									<span>
										<span className="block">Any type</span>
										<span className="block text-[11px] text-muted-foreground">The agent picks the best fit</span>
									</span>
								</MenuRadioItem>
								{types.map((t) => (
									<MenuRadioItem key={t.slug} value={t.slug}>
										<span className="min-w-0">
											<span className="block">{t.name}</span>
											<span className="block truncate text-[11px] text-muted-foreground">{t.description}</span>
										</span>
									</MenuRadioItem>
								))}
							</MenuRadioGroup>
						</MenuContent>
					</Pill>
					<Pill icon={PaintBoardIcon} label={toneName}>
						<MenuContent className="w-60">
							<MenuLabel>Tone</MenuLabel>
							<MenuRadioGroup value={tone} onValueChange={setTone}>
								<MenuRadioItem value="auto">Best tone for the product</MenuRadioItem>
								{tones.map((t) => (
									<MenuRadioItem key={t.slug} value={t.slug}>
										<span className="min-w-0">
											<span className="block">{t.name}</span>
											<span className="block truncate text-[11px] text-muted-foreground">{t.description}</span>
										</span>
									</MenuRadioItem>
								))}
							</MenuRadioGroup>
						</MenuContent>
					</Pill>
					<Pill icon={PaintBrush01Icon} label={STYLE_LABEL[style]}>
						<MenuContent className="w-60">
							<MenuLabel>Animated style</MenuLabel>
							<MenuRadioGroup value={style} onValueChange={(v) => setStyle(v as StyleId | "auto")}>
								{STYLES.map((s) => (
									<MenuRadioItem key={s.value} value={s.value}>
										<span className="min-w-0">
											<span className="block">{s.label}</span>
											<span className="block truncate text-[11px] text-muted-foreground">{s.hint}</span>
										</span>
									</MenuRadioItem>
								))}
							</MenuRadioGroup>
						</MenuContent>
					</Pill>
					<Pill icon={AspectRatioIcon} label={aspect}>
						<MenuContent>
							<MenuLabel>Aspect ratio</MenuLabel>
							<MenuRadioGroup value={aspect} onValueChange={(v) => setAspect(v as Aspect)}>
								{ASPECTS.map((a) => (
									<MenuRadioItem key={a.value} value={a.value}>
										{a.label} <span className="text-[11px] text-muted-foreground">{a.hint}</span>
									</MenuRadioItem>
								))}
							</MenuRadioGroup>
						</MenuContent>
					</Pill>
					<Pill icon={audioIcon} label={AUDIO.find((a) => a.value === audio)?.label || audio}>
						<MenuContent>
							<MenuLabel>Audio</MenuLabel>
							<MenuRadioGroup value={audio} onValueChange={(v) => setAudio(v as Audio)}>
								{AUDIO.map((a) => (
									<MenuRadioItem key={a.value} value={a.value}>
										{a.label}
									</MenuRadioItem>
								))}
							</MenuRadioGroup>
							{audio === "voice" ? (
								<>
									<MenuSeparator />
									<MenuLabel>Voice</MenuLabel>
									<MenuRadioGroup value={voice} onValueChange={setVoice}>
										{VOICES.map((v) => (
											<MenuRadioItem key={v} value={v} className="capitalize">
												{v}
											</MenuRadioItem>
										))}
									</MenuRadioGroup>
								</>
							) : null}
						</MenuContent>
					</Pill>
					<Pill icon={SlidersHorizontalIcon} label={`${duration}s · ${variations}×`}>
						<MenuContent>
							<MenuLabel>Length</MenuLabel>
							<MenuRadioGroup value={String(duration)} onValueChange={(v) => setDuration(Number(v))}>
								{[15, 20, 30, 45, 59].map((d) => (
									<MenuRadioItem key={d} value={String(d)}>
										{d} seconds
									</MenuRadioItem>
								))}
							</MenuRadioGroup>
							<MenuSeparator />
							<MenuLabel>Variations</MenuLabel>
							<MenuRadioGroup value={String(variations)} onValueChange={(v) => setVariations(Number(v))}>
								{[1, 2, 3].map((n) => (
									<MenuRadioItem key={n} value={String(n)}>
										{n} {n === 1 ? "video" : "different videos"}
									</MenuRadioItem>
								))}
							</MenuRadioGroup>
						</MenuContent>
					</Pill>
					<div className="ml-auto flex items-center gap-2.5">
						<ModelToggle id="composer-tier" className="mr-1" />
						<span className="hidden text-xs text-muted-foreground tabular-nums sm:inline">
							{tier === "free" && mainUrl ? "Free" : estimate.data ? `≈ $${estimate.data.total_usd.toFixed(2)}` : mainUrl ? "" : "⌘↵ to review"}
						</span>
						{busy ? (
							<Tip label="Stop">
								<Button size="icon" variant="outline" className="size-9 rounded-xl" onClick={abort.stop} aria-label="Stop">
									<Icon icon={StopIcon} size={16} className="fill-current" />
								</Button>
							</Tip>
						) : (
							<Button size="icon" className="size-9 rounded-xl" onClick={submit} aria-label="Review and create">
								<Icon icon={ArrowUp02Icon} size={18} />
							</Button>
						)}
					</div>
				</div>
			</div>

			<Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
				<DialogContent title="Load a prompt" className="max-w-xl">
					<Command loop>
						<Command.Input autoFocus placeholder="Search the prompt library…" className="h-12 w-full border-b border-border bg-transparent px-4 text-sm outline-none placeholder:text-muted-foreground" />
						<Command.List className="max-h-96 overflow-y-auto p-1.5">
							<Command.Empty className="px-4 py-6 text-center text-sm text-muted-foreground">No prompts match.</Command.Empty>
							{(["custom", "type", "tone", "film"] as const).map((kind) => {
								const list = (prompts.data || []).filter((p) => p.kind === kind);
								if (!list.length) return null;
								return (
									<Command.Group
										key={kind}
										heading={kind === "custom" ? "Your prompts" : kind === "type" ? "Video types" : kind === "film" ? "Opus film styles" : "Tones"}
										className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground"
									>
										{list.map((p) => (
											<Command.Item
												key={p.id}
												value={`${p.name} ${p.description} ${p.kind} ${p.category || ""} ${(p.uses || []).join(" ")}`}
												onSelect={() => applyPrompt(p)}
												className="flex cursor-default flex-col items-start gap-0.5 rounded-lg px-2.5 py-2 outline-none data-[selected=true]:bg-accent"
											>
												<span className="text-sm font-medium">{p.name}</span>
												<span className="line-clamp-1 text-xs text-muted-foreground">{p.description}</span>
											</Command.Item>
										))}
									</Command.Group>
								);
							})}
						</Command.List>
					</Command>
				</DialogContent>
			</Dialog>
		</div>
	);
}
