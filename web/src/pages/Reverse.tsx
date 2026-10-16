import { useRef, useState, type DragEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { BookmarkAdd01Icon, Copy01Icon, Delete02Icon, MagicWand01Icon, Upload01Icon } from "@hugeicons/core-free-icons";
import { Page } from "@/components/AppShell";
import { CopyBox } from "@/components/CopyBox";
import { Icon } from "@/components/Icon";
import { ModelToggle } from "@/components/ModelToggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/misc";
import { Progress } from "@/components/ui/progress";
import { api, isActive, type ReverseJob, type ReverseResult, type ReverseScene } from "@/lib/api";
import { useWorkspace } from "@/lib/workspace";
import { cn, timeAgo, usd } from "@/lib/utils";

const frameSrc = (id: string, name: string) => `/api/reverse/${id}/frames/${name}`;
const fmt = (s: number) => `${s.toFixed(1)}s`;

/** Everything in one markdown document, for pasting into a doc or an agent. */
function toMarkdown(r: ReverseResult) {
	const parts = [`# ${r.title}`, r.summary, `**Overall style:** ${r.overall_style}`, `## Master prompt\n${r.master_prompt}`];
	if (r.audio.music_prompt || r.audio.voiceover_transcript) {
		parts.push(`## Audio\n- Music: ${r.audio.music_prompt || "none"}\n- Voice-over style: ${r.audio.voiceover_style || "none"}\n- Transcript: ${r.audio.voiceover_transcript || "none"}\n- SFX: ${r.audio.sfx.join(", ") || "none"}`);
	}
	for (const s of r.scenes) {
		parts.push(`## Scene ${s.index} (${fmt(s.start)} - ${fmt(s.end)})\n${s.summary}\n\n**Image prompt:** ${s.image_prompt}\n\n**Video prompt:** ${s.video_prompt}\n\n**Camera:** ${s.camera}\n\n**Animation:** ${s.animation}\n\n**Transition in:** ${s.transition_in}\n\n**On-screen text:** ${s.on_screen_text || "none"}\n\n**Audio prompt:** ${s.audio_prompt}`);
	}
	return parts.filter(Boolean).join("\n\n");
}

function useSave() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (p: { name: string; description: string; body: string }) => api.createPrompt({ ...p, kind: "custom" }),
		onSuccess: (saved) => {
			qc.invalidateQueries({ queryKey: ["prompts"] });
			toast.success(`Saved to your prompt library as "${saved.name}"`);
		},
		onError: (e: Error) => toast.error(e.message),
	});
}

export function ReversePage() {
	const qc = useQueryClient();
	const { tier } = useWorkspace();
	const input = useRef<HTMLInputElement>(null);
	const [file, setFile] = useState<File | null>(null);
	const [url, setUrl] = useState("");
	const [notes, setNotes] = useState("");
	const [drag, setDrag] = useState(false);
	const [activeId, setActiveId] = useState<string | null>(null);

	const limits = useQuery({ queryKey: ["reverse", "list"], queryFn: api.reverseList });
	const job = useQuery({
		queryKey: ["reverse", activeId],
		queryFn: () =>
			api.reverse(activeId!).then((r) => {
				if (!isActive(r.status)) qc.invalidateQueries({ queryKey: ["reverse", "list"] });
				return r;
			}),
		enabled: Boolean(activeId),
		refetchInterval: (q) => (isActive(q.state.data?.status) ? 1500 : false),
	});
	const start = useMutation({
		mutationFn: () => api.startReverse({ file: file || undefined, url: file ? undefined : url.trim(), notes: notes.trim(), model_tier: tier }),
		onSuccess: (j) => {
			setActiveId(j.id);
			qc.setQueryData(["reverse", j.id], j);
			qc.invalidateQueries({ queryKey: ["reverse", "list"] });
		},
		onError: (e: Error) => toast.error(e.message),
	});
	const stop = useMutation({ mutationFn: () => api.cancelReverse(activeId!), onError: (e: Error) => toast.error(e.message) });
	const remove = useMutation({
		mutationFn: (id: string) => api.deleteReverse(id),
		onSuccess: (_r, id) => {
			if (id === activeId) setActiveId(null);
			qc.invalidateQueries({ queryKey: ["reverse", "list"] });
		},
	});

	const maxSec = limits.data?.max_seconds ?? 120;
	const maxMb = limits.data?.max_mb ?? 200;
	const pick = (f?: File | null) => {
		if (!f) return;
		if (!f.type.startsWith("video/")) return toast.error("Choose a video file (mp4, mov, webm).");
		if (f.size > maxMb * 1024 * 1024) return toast.error(`Video is larger than ${maxMb} MB.`);
		setFile(f);
		setUrl("");
	};
	const onDrop = (e: DragEvent) => {
		e.preventDefault();
		setDrag(false);
		pick(e.dataTransfer.files?.[0]);
	};
	const j = job.data;
	const busy = start.isPending || isActive(j?.status);
	const ready = Boolean(file || url.trim());

	return (
		<Page title="Reverse a video" description={`Upload a video and get every scene back as copy-ready prompts: image, video (motion, camera, animation) and audio. Up to ${maxSec}s.`}>
			<div className="grid gap-6 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
				<div className="flex flex-col gap-4">
					<Card>
						<CardHeader>
							<CardTitle>Video</CardTitle>
							<CardDescription>Use videos you own or have the rights to.</CardDescription>
						</CardHeader>
						<CardContent className="flex flex-col gap-3">
							<button
								type="button"
								onClick={() => input.current?.click()}
								onDragOver={(e) => {
									e.preventDefault();
									setDrag(true);
								}}
								onDragLeave={() => setDrag(false)}
								onDrop={onDrop}
								className={cn("flex flex-col items-center gap-2 rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground transition-colors hover:bg-accent/50", drag && "border-primary bg-accent/50")}
							>
								<Icon icon={Upload01Icon} size={20} />
								{file ? <span className="font-medium break-all text-foreground">{file.name}</span> : <span>Drop a video here or click to browse</span>}
								<span className="text-xs">mp4, mov or webm · max {maxMb} MB</span>
							</button>
							<input ref={input} type="file" accept="video/*" hidden onChange={(e) => pick(e.target.files?.[0])} />
							<div className="flex items-center gap-2 text-xs text-muted-foreground">
								<span className="h-px flex-1 bg-border" />
								or
								<span className="h-px flex-1 bg-border" />
							</div>
							<Input
								placeholder="https://…/video.mp4 (direct file link)"
								value={url}
								onChange={(e) => {
									setUrl(e.target.value);
									if (e.target.value) setFile(null);
								}}
							/>
							<Input placeholder="Optional notes: what to focus on (e.g. the UI animations)" value={notes} onChange={(e) => setNotes(e.target.value)} />
							<div className="flex items-center justify-between gap-2">
								<ModelToggle id="reverse-tier" />
								<Button disabled={!ready || busy} onClick={() => start.mutate()}>
									<Icon icon={MagicWand01Icon} size={15} />
									{busy ? "Analysing…" : "Get prompts"}
								</Button>
							</div>
						</CardContent>
					</Card>
					<Recent activeId={activeId} onOpen={setActiveId} onDelete={(id) => remove.mutate(id)} items={limits.data?.items || []} />
				</div>

				<div className="min-w-0">
					{!activeId ? (
						<Card>
							<CardContent className="p-8 text-center text-sm text-muted-foreground">Your scene-by-scene prompts will appear here.</CardContent>
						</Card>
					) : !j ? null : isActive(j.status) ? (
						<Card>
							<CardContent className="flex flex-col gap-3 p-6">
								<div className="flex items-center justify-between text-sm">
									<span className="font-medium">{j.step}</span>
									<Button variant="ghost" size="sm" onClick={() => stop.mutate()}>
										Stop
									</Button>
								</div>
								<Progress value={j.progress} />
								<p className="text-xs text-muted-foreground">Finding cuts, grabbing keyframes and asking the vision model to describe each scene. This usually takes 30–90 seconds.</p>
							</CardContent>
						</Card>
					) : j.status === "success" && j.result ? (
						<ResultView job={j} result={j.result} />
					) : (
						<Card>
							<CardContent className="p-6 text-sm">
								<p className="font-medium">{j.status === "cancelled" ? "Stopped." : "That did not work."}</p>
								{j.error ? <p className="mt-1 text-muted-foreground">{j.error}</p> : null}
							</CardContent>
						</Card>
					)}
				</div>
			</div>
		</Page>
	);
}

function Recent({ items, activeId, onOpen, onDelete }: { items: { id: string; title: string; status: string; scene_count: number; created_at: string }[]; activeId: string | null; onOpen: (id: string) => void; onDelete: (id: string) => void }) {
	if (!items.length) return null;
	return (
		<Card>
			<CardHeader>
				<CardTitle>Recent</CardTitle>
			</CardHeader>
			<CardContent className="flex flex-col gap-1">
				{items.slice(0, 10).map((it) => (
					<div key={it.id} className={cn("group flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent/50", it.id === activeId && "bg-accent")}>
						<button type="button" className="min-w-0 flex-1 text-left" onClick={() => onOpen(it.id)}>
							<p className="truncate font-medium">{it.title}</p>
							<p className="text-xs text-muted-foreground">
								{it.status === "success" ? `${it.scene_count} scenes` : it.status} · {timeAgo(it.created_at)}
							</p>
						</button>
						<button type="button" aria-label="Delete" onClick={() => onDelete(it.id)} className="rounded-md p-1.5 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-foreground">
							<Icon icon={Delete02Icon} size={14} />
						</button>
					</div>
				))}
			</CardContent>
		</Card>
	);
}

function ResultView({ job, result }: { job: ReverseJob; result: ReverseResult }) {
	const save = useSave();
	const copyAll = () => navigator.clipboard?.writeText(toMarkdown(result)).then(() => toast.success("Copied every prompt as markdown"));
	const a = result.audio;
	return (
		<div className="flex flex-col gap-4">
			<Card>
				<CardHeader>
					<div className="flex flex-wrap items-start justify-between gap-2">
						<div className="min-w-0">
							<CardTitle className="text-base">{result.title}</CardTitle>
							<CardDescription className="mt-1">{result.summary}</CardDescription>
						</div>
						<Button variant="outline" size="sm" onClick={copyAll}>
							<Icon icon={Copy01Icon} size={14} />
							Copy all
						</Button>
					</div>
					<div className="mt-2 flex flex-wrap gap-1.5">
						<Badge>{result.scenes.length} scenes</Badge>
						<Badge>{fmt(result.duration_sec)}</Badge>
						{result.aspect_ratio ? <Badge>{result.aspect_ratio}</Badge> : null}
						<Badge>{usd(job.cost_usd)}</Badge>
					</div>
				</CardHeader>
				<CardContent className="flex flex-col gap-3">
					{result.overall_style ? <CopyBox mono={false} label="Overall style" text={result.overall_style} /> : null}
					<div className="relative">
						<CopyBox mono={false} label="Master prompt (whole video)" text={result.master_prompt} />
						<SaveButton onClick={() => save.mutate({ name: `${result.title} (master)`, description: "Reverse-engineered master prompt", body: result.master_prompt })} />
					</div>
				</CardContent>
			</Card>

			{a.music_prompt || a.voiceover_transcript || a.sfx.length ? (
				<Card>
					<CardHeader>
						<CardTitle>Audio</CardTitle>
					</CardHeader>
					<CardContent className="flex flex-col gap-2">
						{a.music_prompt ? <CopyBox mono={false} label="Music prompt" text={a.music_prompt} /> : null}
						{a.voiceover_style ? <CopyBox mono={false} label="Voice-over style" text={a.voiceover_style} /> : null}
						{a.voiceover_transcript ? <CopyBox mono={false} label="Voice-over transcript" text={a.voiceover_transcript} /> : null}
						{a.sfx.length ? <CopyBox mono={false} label="Sound effects" text={a.sfx.join("\n")} /> : null}
					</CardContent>
				</Card>
			) : null}

			{result.scenes.map((s) => (
				<SceneCard key={s.index} jobId={job.id} scene={s} title={result.title} />
			))}
		</div>
	);
}

function SaveButton({ onClick }: { onClick: () => void }) {
	return (
		<button type="button" onClick={onClick} aria-label="Save to prompt library" title="Save to prompt library" className="absolute top-1.5 right-9 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
			<Icon icon={BookmarkAdd01Icon} size={14} />
		</button>
	);
}

function SceneCard({ jobId, scene: s, title }: { jobId: string; scene: ReverseScene; title: string }) {
	const save = useSave();
	const field = (label: string, text: string, kind: string) =>
		text ? (
			<div className="relative">
				<CopyBox mono={false} label={label} text={text} />
				<SaveButton onClick={() => save.mutate({ name: `${title} · scene ${s.index} ${kind}`, description: `${kind} prompt, ${fmt(s.start)}-${fmt(s.end)}`, body: text })} />
			</div>
		) : null;
	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between gap-2">
					<CardTitle>Scene {s.index}</CardTitle>
					<span className="text-xs text-muted-foreground">
						{fmt(s.start)} – {fmt(s.end)}
					</span>
				</div>
				<CardDescription>{s.summary}</CardDescription>
			</CardHeader>
			<CardContent className="flex flex-col gap-3">
				<div className="flex gap-2 overflow-x-auto">
					{s.frames.map((f) => (
						<img key={f} src={frameSrc(jobId, f)} alt={`Scene ${s.index} keyframe`} loading="lazy" className="h-28 w-auto rounded-md border border-border object-cover" />
					))}
				</div>
				<Tabs defaultValue="video">
					<TabsList>
						<TabsTrigger value="image">Image</TabsTrigger>
						<TabsTrigger value="video">Video</TabsTrigger>
						<TabsTrigger value="audio">Audio</TabsTrigger>
					</TabsList>
					<TabsContent value="image" className="mt-3 flex flex-col gap-2">
						{field("Image prompt", s.image_prompt, "image")}
						{field("On-screen text", s.on_screen_text, "text")}
					</TabsContent>
					<TabsContent value="video" className="mt-3 flex flex-col gap-2">
						{field("Video prompt (motion, camera, animation)", s.video_prompt, "video")}
						{field("Camera", s.camera, "camera")}
						{field("Animation", s.animation, "animation")}
						{field("Transition in", s.transition_in, "transition")}
					</TabsContent>
					<TabsContent value="audio" className="mt-3 flex flex-col gap-2">
						{field("Audio prompt", s.audio_prompt, "audio")}
						{field("Narration", s.narration, "narration")}
					</TabsContent>
				</Tabs>
			</CardContent>
		</Card>
	);
}
