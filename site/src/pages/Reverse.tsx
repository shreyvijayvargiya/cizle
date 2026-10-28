import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { CopyButton } from "@/components/CopyButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/misc";
import { useAuth } from "@/lib/auth";
import { env } from "@/lib/config";
import { useHead } from "@/lib/head";

type Scene = { index: number; start: number; end: number; frames: string[]; summary: string; image_prompt: string; video_prompt: string; camera: string; narration: string };
type Job = {
	id: string;
	status: "pending" | "running" | "success" | "failed" | "cancelled";
	step: string;
	progress: number;
	error: string | null;
	source_name: string;
	creator?: string;
	result: null | {
		title: string;
		summary: string;
		master_prompt: string;
		claude_code_prompt: string;
		skill_markdown: string;
		trimmed: boolean;
		duration_sec: number;
		original_duration_sec: number;
		source: { url: string | null; platform: string | null; creator: string | null };
		scenes: Scene[];
	};
};

/** The reverse-engineer API (server/, deployed on Fly). Set VITE_REVERSE_API_URL; locally it defaults to the cizle server. */
const API = (env("VITE_REVERSE_API_URL") || (import.meta.env.DEV ? "http://localhost:3737" : "")).replace(/\/+$/, "");
const TOKEN_KEY = "cizle-reverse-token";

const readToken = () => {
	try {
		return sessionStorage.getItem(TOKEN_KEY) || "";
	} catch {
		return "";
	}
};

/**
 * Video link in, Claude Code prompt and skill out. Not launched: the route exists but nothing in the navbar, footer, sitemap or
 * search links to it, and it is noindex. Share the /reverse address directly with whoever should try it.
 */
export function ReversePage() {
	const { user, ready } = useAuth();
	const [url, setUrl] = useState("");
	const [notes, setNotes] = useState("");
	const [token, setToken] = useState(readToken);
	const [job, setJob] = useState<Job | null>(null);
	const [busy, setBusy] = useState(false);
	const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
	useHead({ title: "Reverse a video | cizle", description: "Paste a video link and get a prompt for Claude Code.", path: "/reverse", noindex: true });

	useEffect(() => () => void (timer.current && clearTimeout(timer.current)), []);

	const headers = (json = false): HeadersInit => ({ ...(json ? { "content-type": "application/json" } : {}), ...(token ? { authorization: `Bearer ${token}` } : {}) });

	async function poll(id: string) {
		try {
			const res = await fetch(`${API}/api/reverse/${id}`, { headers: headers() });
			const next = (await res.json()) as Job & { error?: string };
			if (!res.ok) throw new Error(next.error || `HTTP ${res.status}`);
			setJob(next);
			if (next.status === "pending" || next.status === "running") timer.current = setTimeout(() => poll(id), 2500);
			else setBusy(false);
		} catch (e) {
			setBusy(false);
			toast.error(e instanceof Error ? e.message : "Lost contact with the server.");
		}
	}

	async function submit(e: React.FormEvent) {
		e.preventDefault();
		if (!url.trim() || busy) return;
		try {
			sessionStorage.setItem(TOKEN_KEY, token);
		} catch {
			/* private window: the token just is not remembered */
		}
		setBusy(true);
		setJob(null);
		try {
			const res = await fetch(`${API}/api/reverse`, { method: "POST", headers: headers(true), body: JSON.stringify({ url: url.trim(), notes: notes.trim() }) });
			const body = (await res.json()) as Job & { error?: string };
			if (!res.ok) throw new Error(body.error || `HTTP ${res.status}`);
			setJob(body);
			poll(body.id);
		} catch (err) {
			setBusy(false);
			toast.error(err instanceof Error ? err.message : "Could not start.");
		}
	}

	if (!ready) return <div className="mx-auto max-w-3xl space-y-4 px-4 py-12"><Skeleton className="h-8 w-48" /><Skeleton className="h-40" /></div>;
	if (!user) {
		return (
			<div className="mx-auto w-full max-w-md px-4 py-24 text-center">
				<h1 className="display" style={{ fontSize: "clamp(2.25rem, 5vw, 4rem)" }}>Sign in to reverse a video</h1>
				<Link to="/login" search={{ next: "/reverse" }} className="mt-6 inline-flex rounded-lg bg-field-1 px-5 py-3 font-medium text-field-1-ink">Sign in</Link>
			</div>
		);
	}

	const r = job?.result;
	return (
		<div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-12">
			<div>
				<h1 className="display" style={{ fontSize: "clamp(2rem, 4vw, 3.25rem)" }}>Reverse a video</h1>
				<p className="mt-2 text-muted-foreground">Paste a YouTube, X, Instagram or TikTok link. You get a prompt to paste into Claude Code and a skill draft. Long videos use their first minute.</p>
			</div>

			{!API && <p className="rounded-lg border border-input p-4 text-sm">The reverse API address is not set. Add <code>VITE_REVERSE_API_URL</code> (your Fly app URL) to the site environment.</p>}

			<form onSubmit={submit} className="space-y-3">
				<Input type="url" required placeholder="https://www.youtube.com/watch?v=…" value={url} onChange={(e) => setUrl(e.target.value)} className="h-11 text-base" aria-label="Video link" />
				<Textarea rows={2} placeholder="Optional: what should the remake be for? (your brand, your product, your format)" value={notes} onChange={(e) => setNotes(e.target.value)} aria-label="Notes" />
				<Input type="password" placeholder="API token (if the server asks for one)" value={token} onChange={(e) => setToken(e.target.value)} autoComplete="off" aria-label="API token" />
				<Button type="submit" disabled={busy || !API || !url.trim()}>{busy ? "Working…" : "Get the prompt"}</Button>
			</form>

			{job && (job.status === "pending" || job.status === "running") && (
				<div className="space-y-2">
					<Progress value={job.progress} />
					<p className="text-sm text-muted-foreground">{job.step}</p>
				</div>
			)}
			{job?.status === "failed" && <p className="rounded-lg border border-input p-4 text-sm">{job.error || "That did not work."}</p>}

			{r && (
				<div className="space-y-4">
					<div>
						<h2 className="text-xl font-medium">{r.title}</h2>
						<p className="text-sm text-muted-foreground">
							{r.source.creator ? `${r.source.creator} · ` : ""}
							{r.source.platform ? `${r.source.platform} · ` : ""}
							{r.trimmed ? `first ${Math.round(r.duration_sec)}s of ${Math.round(r.original_duration_sec)}s` : `${Math.round(r.duration_sec)}s`}
							{r.source.url && (
								<>
									{" · "}
									<a href={r.source.url} target="_blank" rel="noreferrer" className="underline">original</a>
								</>
							)}
						</p>
						<p className="mt-2">{r.summary}</p>
					</div>
					<Block title="Prompt for Claude Code" description="Paste this into Claude Code to remake the video in your own format." text={r.claude_code_prompt} />
					<Block title="Skill (SKILL.md)" description="Save as .claude/skills/<name>/SKILL.md to reuse the technique." text={r.skill_markdown} />
					<Block title="Master prompt" description="One prompt for an AI video generator." text={r.master_prompt} />
					<h3 className="pt-2 text-lg font-medium">Scenes</h3>
					{r.scenes.map((s) => (
						<Card key={s.index}>
							<CardHeader>
								<CardTitle className="text-base">Scene {s.index} · {s.start.toFixed(1)}s to {s.end.toFixed(1)}s</CardTitle>
								<CardDescription>{s.summary}</CardDescription>
							</CardHeader>
							<CardContent className="space-y-3">
								{s.frames[0] && <img src={`${API}/api/reverse/${job!.id}/frames/${s.frames[0]}${token ? `?token=${encodeURIComponent(token)}` : ""}`} alt={`Scene ${s.index}`} className="max-h-48 rounded-md" loading="lazy" />}
								<Line label="Video prompt" text={s.video_prompt} />
								<Line label="Image prompt" text={s.image_prompt} />
							</CardContent>
						</Card>
					))}
				</div>
			)}
		</div>
	);
}

function Block({ title, description, text }: { title: string; description: string; text: string }) {
	if (!text) return null;
	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-base">{title}</CardTitle>
				<CardDescription>{description}</CardDescription>
			</CardHeader>
			<CardContent className="space-y-3">
				<pre className="max-h-80 overflow-auto whitespace-pre-wrap rounded-md bg-muted p-3 text-sm">{text}</pre>
				<CopyButton text={text} label="Copy" />
			</CardContent>
		</Card>
	);
}

function Line({ label, text }: { label: string; text: string }) {
	if (!text) return null;
	return (
		<div className="space-y-1">
			<div className="flex items-center justify-between">
				<span className="text-sm font-medium">{label}</span>
				<CopyButton text={text} label="Copy" variant="ghost" />
			</div>
			<p className="text-sm text-muted-foreground">{text}</p>
		</div>
	);
}
