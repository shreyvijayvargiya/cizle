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
	Loading03Icon,
	Mic01Icon,
	MusicNote01Icon,
	PaintBoardIcon,
	QuillWrite01Icon,
	SlidersHorizontalIcon,
	VolumeOffIcon,
} from "@hugeicons/core-free-icons";
import { Icon } from "@/components/Icon";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, Menu, MenuContent, MenuLabel, MenuRadioGroup, MenuRadioItem, MenuSeparator, MenuTrigger } from "@/components/ui/menu";
import { ApiError, api, usePrompts, useSettings, type Aspect, type Audio, type CreateVideo, type Prompt } from "@/lib/api";
import { ASPECTS, AUDIO, VOICES } from "@/lib/constants";
import { cn, hostOf } from "@/lib/utils";

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

export function Composer({ initialPromptId, autoFocus, size = "lg" }: { initialPromptId?: string; autoFocus?: boolean; size?: "md" | "lg" }) {
	const navigate = useNavigate();
	const qc = useQueryClient();
	const settings = useSettings();
	const prompts = usePrompts();
	const [text, setText] = useState("");
	const [type, setType] = useState("auto");
	const [tone, setTone] = useState("auto");
	const [aspect, setAspect] = useState<Aspect>("9:16");
	const [audio, setAudio] = useState<Audio>("voice");
	const [duration, setDuration] = useState(30);
	const [variations, setVariations] = useState(1);
	const [voice, setVoice] = useState("nova");
	const [compare, setCompare] = useState("");
	const [loaded, setLoaded] = useState<Prompt | null>(null);
	const [pickerOpen, setPickerOpen] = useState(false);
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

	function applyPrompt(p: Prompt) {
		if (p.kind === "type") setType(p.slug);
		else if (p.kind === "tone") setTone(p.slug);
		else {
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
	const mainUrl = links.site || links.github;
	const body: CreateVideo = {
		url: mainUrl || undefined,
		github_url: links.site && links.github ? links.github : undefined,
		compare_urls: compare.split(/[\s,]+/).filter(Boolean),
		prompt: text,
		prompt_id: loaded?.id || null,
		type,
		tone,
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

	const create = useMutation({
		mutationFn: api.createVideo,
		onSuccess: (job) => {
			qc.invalidateQueries({ queryKey: ["videos"] });
			qc.invalidateQueries({ queryKey: ["stats"] });
			toast.success("Video started", { description: "The agent is reading your product now." });
			navigate({ to: "/videos/$id", params: { id: job.id } });
		},
		onError: (e: ApiError) => {
			toast.error(e.message, e.code === "MISSING_API_KEY" || e.code === "OPENROUTER_AUTH" ? { action: { label: "Open settings", onClick: () => navigate({ to: "/settings" }) } } : undefined);
		},
	});

	const submit = () => {
		if (!mainUrl) {
			toast.error("Paste a SaaS URL or GitHub repo in the box first.");
			taRef.current?.focus();
			return;
		}
		create.mutate(body);
	};

	const typeName = type === "auto" ? "Any type" : types.find((t) => t.slug === type)?.name || type;
	const toneName = tone === "auto" ? "Best tone" : tones.find((t) => t.slug === tone)?.name || tone;
	const audioIcon = audio === "voice" ? Mic01Icon : audio === "music" ? MusicNote01Icon : VolumeOffIcon;

	return (
		<div className="w-full">
			<div
				className={cn(
					"rounded-2xl border border-border bg-surface shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(0,0,0,0.12)] transition-shadow focus-within:border-ring/60 focus-within:shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_-12px_rgba(0,0,0,0.18)]",
				)}
			>
				{links.site || links.github || loaded ? (
					<div className="flex flex-wrap gap-1.5 px-4 pt-3.5">
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
					placeholder="Paste your SaaS URL or GitHub repo, then describe the video you want…  (type / to load a prompt)"
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
						<MenuContent className="w-64">
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
						<span className="hidden text-xs text-muted-foreground tabular-nums sm:inline">
							{estimate.data ? `≈ $${estimate.data.total_usd.toFixed(2)}` : mainUrl ? "" : "⌘↵ to generate"}
						</span>
						<Button size="icon" className="size-9 rounded-xl" disabled={create.isPending} onClick={submit} aria-label="Generate video">
							<Icon icon={create.isPending ? Loading03Icon : ArrowUp02Icon} size={18} className={create.isPending ? "animate-spin" : ""} />
						</Button>
					</div>
				</div>
			</div>

			<Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
				<DialogContent title="Load a prompt" className="max-w-xl">
					<Command loop>
						<Command.Input autoFocus placeholder="Search the prompt library…" className="h-12 w-full border-b border-border bg-transparent px-4 text-sm outline-none placeholder:text-muted-foreground" />
						<Command.List className="max-h-96 overflow-y-auto p-1.5">
							<Command.Empty className="px-4 py-6 text-center text-sm text-muted-foreground">No prompts match.</Command.Empty>
							{(["custom", "type", "tone"] as const).map((kind) => {
								const list = (prompts.data || []).filter((p) => p.kind === kind);
								if (!list.length) return null;
								return (
									<Command.Group
										key={kind}
										heading={kind === "custom" ? "Your prompts" : kind === "type" ? "Video types" : "Tones"}
										className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground"
									>
										{list.map((p) => (
											<Command.Item
												key={p.id}
												value={`${p.name} ${p.description} ${p.kind}`}
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
