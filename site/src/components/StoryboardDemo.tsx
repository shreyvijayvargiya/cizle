import { useEffect, useRef, useState } from "react";
import { PauseIcon, PlayIcon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/Icon";
import { Button } from "@/components/ui/button";
import type { Scene } from "@/lib/data";
import { cn } from "@/lib/utils";

const FRAME: Record<string, string> = { "9:16": "aspect-[9/16] max-h-[26rem]", "16:9": "aspect-video w-full", "1:1": "aspect-square max-h-[22rem]", "4:5": "aspect-[4/5] max-h-[26rem]", Other: "aspect-[4/3] w-full max-w-md" };

/** The skill's structure played back scene by scene: a tappable timeline in the video's own aspect ratio. */
export function StoryboardDemo({ scenes, anatomy, aspect, label }: { scenes: Scene[]; anatomy: Scene[]; aspect: string; label: string }) {
	const items = scenes.length ? scenes : anatomy;
	const [i, setI] = useState(0);
	const reduced = useRef(typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches);
	const [playing, setPlaying] = useState(!reduced.current);
	useEffect(() => {
		setI(0);
	}, [items]);
	useEffect(() => {
		if (!playing || items.length < 2) return;
		const t = setInterval(() => setI((x) => (x + 1) % items.length), 2600);
		return () => clearInterval(t);
	}, [playing, items.length]);
	if (!items.length) return null;
	const cur = items[Math.min(i, items.length - 1)];
	const portrait = aspect === "9:16" || aspect === "4:5";
	return (
		<figure className="rounded-lg border border-border bg-muted/40 p-3 sm:p-4">
			<div className={cn("flex gap-4", portrait ? "flex-col items-center sm:flex-row sm:items-stretch" : "flex-col")}>
				<div className={cn("relative mx-auto flex shrink-0 flex-col justify-between overflow-hidden rounded-lg border border-border bg-surface p-4 shadow-sm", FRAME[aspect] || FRAME.Other)}>
					<div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
						<span>
							Scene {cur.n} of {items.length}
						</span>
						{cur.time ? <span className="rounded bg-muted px-1.5 py-0.5">{cur.time}</span> : null}
					</div>
					<div key={cur.n} className="my-3 [animation:scene-in_.45s_ease-out]">
						<p className="text-xl leading-tight font-semibold tracking-tight sm:text-2xl">{cur.name}</p>
						{cur.visual ? <p className="mt-2 inline-block rounded-md bg-brand/10 px-2 py-0.5 font-mono text-sm text-brand">{cur.visual}</p> : null}
						{cur.text ? <p className="mt-3 line-clamp-4 text-xs leading-relaxed text-muted-foreground">{cur.text}</p> : null}
					</div>
					<div className="flex gap-1" aria-hidden>
						{items.map((s, k) => (
							<span key={s.n} className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
								<span className={cn("block h-full rounded-full bg-primary", k < i ? "w-full" : k === i && playing ? "[animation:fill_2.6s_linear_forwards]" : k === i ? "w-full" : "w-0")} />
							</span>
						))}
					</div>
				</div>
				<figcaption className="min-w-0 flex-1">
					<div className="mb-2 flex items-center justify-between gap-2">
						<p className="text-xs font-medium text-muted-foreground">{label}</p>
						{items.length > 1 ? (
							<Button variant="ghost" size="sm" onClick={() => setPlaying((p) => !p)} aria-label={playing ? "Pause demo" : "Play demo"}>
								<Icon icon={playing ? PauseIcon : PlayIcon} size={13} /> {playing ? "Pause" : "Play"}
							</Button>
						) : null}
					</div>
					<ol className="grid gap-1">
						{items.map((s, k) => (
							<li key={s.n}>
								<button type="button" onClick={() => (setI(k), setPlaying(false))} aria-current={k === i} className={cn("flex w-full items-baseline gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors hover:bg-accent", k === i && "bg-accent font-medium")}>
									<span className="w-4 shrink-0 text-xs text-muted-foreground">{s.n}</span>
									<span className="min-w-0 flex-1 truncate">{s.name}</span>
									{s.time ? <span className="shrink-0 text-xs text-muted-foreground">{s.time}</span> : null}
								</button>
							</li>
						))}
					</ol>
				</figcaption>
			</div>
		</figure>
	);
}
