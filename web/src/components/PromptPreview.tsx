import { cn } from "@/lib/utils";
import type { StyleId } from "@/lib/api";

const bar = "h-2 rounded-full bg-foreground/70";

/** A few looping shapes that hint at the motion of a plain (clean) video. */
export function Motion({ name }: { name: string }) {
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

const cycle = (n: number, d = 0) => `${n}s ${d}s infinite both`;

/**
 * Tiny looping previews of the five render styles. They mirror what the renderer draws (paper and ink, clay pops,
 * frosted glass over drifting orbs, isometric cubes, a typed terminal), so a card shows the look before you render.
 */
export function StylePreview({ style }: { style: StyleId }) {
	switch (style) {
		case "sketch": {
			const d = (path: string, delay: number, color = "#23211d") => (
				<path d={path} pathLength={1} fill="none" stroke={color} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="1" className="cz-anim" style={{ animation: `cz-draw 4.2s ${delay}s infinite both` }} />
			);
			return (
				<div className="relative size-full overflow-hidden" style={{ background: "#fbf8f1", backgroundImage: "radial-gradient(#23211d18 1px, transparent 1.2px)", backgroundSize: "9px 9px" }}>
					<svg viewBox="0 0 120 90" className="absolute inset-0 size-full p-3">
						{d("M10 12 C 30 8, 60 14, 84 10", 0)}
						{d("M12 26 L52 25 L53 44 L11 45 Z", 0.5)}
						{d("M53 35 C 62 32, 66 38, 76 35 M70 30 L77 35 L70 41", 1.1, "#2f5bea")}
						{d("M78 24 L112 24 L113 46 L77 46 Z", 1.5)}
						{d("M15 62 C 45 57, 75 67, 105 60", 2.1, "#2f5bea")}
						{d("M20 76 L34 76 M40 76 L70 76", 2.5)}
					</svg>
					<svg viewBox="0 0 40 40" className="cz-anim absolute right-2 bottom-2 size-6" style={{ animation: "cz-wob 2.2s ease-in-out infinite alternate" }}>
						<path d="M20 4 L24 16 L37 16 L27 24 L31 37 L20 29 L9 37 L13 24 L3 16 L16 16 Z" fill="none" stroke="#2f5bea" strokeWidth="3" strokeLinejoin="round" />
					</svg>
				</div>
			);
		}
		case "clay":
			return (
				<div className="relative size-full overflow-hidden" style={{ background: "#f4ede4" }}>
					{[
						["-10%", "-20%", 42, "#ff7a59", 0],
						["68%", "62%", 38, "#ffd36e", 1.4],
					].map(([l, t, s, c, dl], i) => (
						<span key={i} className="cz-anim absolute" style={{ left: l as string, top: t as string, width: `${s}%`, aspectRatio: "1", borderRadius: "46% 54% 58% 42%/48% 44% 56% 52%", background: c as string, boxShadow: "inset 0 -8px 14px #00000018, inset 0 7px 12px #ffffff99", animation: `cz-orb 5s ${dl}s ease-in-out infinite alternate` }} />
					))}
					<div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5">
						{[62, 78, 52].map((w, i) => (
							<div key={i} className="cz-anim" style={{ width: `${w}%`, height: 14, borderRadius: 999, background: "#fff8f0", boxShadow: "inset 0 -5px 8px #00000012, inset 0 4px 7px #fff, 0 8px 12px -6px #3a2e2977", animation: `cz-clay 4.4s ${i * 0.22}s infinite both` }} />
						))}
					</div>
				</div>
			);
		case "glass":
			return (
				<div className="relative size-full overflow-hidden" style={{ background: "radial-gradient(120% 90% at 20% 0%, #1d1a4a, #0a0e1f 60%)" }}>
					{[
						["-8%", "-10%", 60, "#7c5cff", 0],
						["52%", "38%", 62, "#ff5cc8", 1.8],
						["40%", "-18%", 42, "#33d6ff", 3.2],
					].map(([l, t, s, c, dl], i) => (
						<span key={i} className="cz-anim absolute rounded-full" style={{ left: l as string, top: t as string, width: `${s}%`, aspectRatio: "1", background: c as string, filter: "blur(18px)", opacity: 0.85, animation: `cz-orb 5s ${dl}s ease-in-out infinite alternate` }} />
					))}
					<div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5">
						{[64, 74].map((w, i) => (
							<div key={i} className="cz-anim" style={{ width: `${w}%`, padding: "7px 9px", borderRadius: 12, background: "linear-gradient(135deg, #ffffff30, #ffffff10)", border: "1px solid #ffffff44", backdropFilter: "blur(8px)", boxShadow: "0 8px 18px -8px #000a", animation: `cz-glass 4.4s ${i * 0.3}s infinite both` }}>
								<div className="h-1.5 rounded-full bg-white/80" style={{ width: i ? "80%" : "55%" }} />
							</div>
						))}
					</div>
				</div>
			);
		case "isometric": {
			const cube = (s: number, color: string, delay: number, style: React.CSSProperties) => (
				<div className="cz-anim absolute" style={{ ...style, width: s, height: s, transformStyle: "preserve-3d", transform: "rotateX(-35.264deg) rotateY(45deg)", animation: `cz-cube 2.6s ${delay}s ease-in-out infinite alternate` }}>
					{[
						["translateZ(var(--h))", 1.1],
						["rotateY(-90deg) translateZ(var(--h))", 0.85],
						["rotateX(90deg) translateZ(var(--h))", 1.3],
					].map(([t, b], i) => (
						<i key={i} className="absolute inset-0 border border-[#16213a]" style={{ ["--h" as string]: `${s / 2}px`, transform: t as string, background: color, filter: `brightness(${b})` }} />
					))}
				</div>
			);
			return (
				<div className="relative size-full overflow-hidden" style={{ background: "linear-gradient(180deg,#f6f8fd,#eef2f9)" }}>
					<div className="absolute inset-0 opacity-70" style={{ backgroundImage: "repeating-linear-gradient(30deg,#16213a14 0 1px,transparent 1px 16px),repeating-linear-gradient(150deg,#16213a14 0 1px,transparent 1px 16px)" }} />
					{cube(20, "#ff7a45", 0, { left: "8%", top: "12%" })}
					{cube(14, "#3ddc97", 0.8, { right: "10%", top: "20%" })}
					{cube(24, "#3b6cff", 1.6, { right: "14%", bottom: "12%" })}
					<div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
						{[60, 72].map((w, i) => (
							<div key={i} className="cz-anim" style={{ width: `${w}%`, height: 16, background: "#fff", border: "2px solid #16213a", borderRadius: 4, boxShadow: "1px 1px 0 #3b6cff, 2px 2px 0 #3b6cff, 3px 3px 0 #3b6cff, 4px 4px 0 #3b6cff, 5px 5px 0 #3b6cff, 6px 6px 0 #3b6cff", animation: `cz-iso 4.4s ${i * 0.25}s infinite both` }} />
						))}
					</div>
				</div>
			);
		}
		case "ascii":
			return (
				<div className="relative size-full overflow-hidden font-mono text-[9px] leading-tight" style={{ background: "#050a06", color: "#38ff85", textShadow: "0 0 6px #38ff8588" }}>
					<div className="absolute inset-0 opacity-25" style={{ backgroundImage: "repeating-linear-gradient(0deg,#000 0 1px,transparent 1px 3px)" }} />
					<div className="absolute inset-0 flex flex-col justify-center gap-1 p-3">
						<div className="cz-anim whitespace-nowrap" style={{ animation: `cz-type ${cycle(4.4)}` }}>&gt; npm i cizle</div>
						<div className="cz-anim whitespace-nowrap" style={{ animation: `cz-type ${cycle(4.4, 0.5)}` }}>[x] reads your site</div>
						<div className="cz-anim whitespace-nowrap" style={{ animation: `cz-type ${cycle(4.4, 1)}` }}>[x] writes the script</div>
						<div className="cz-anim whitespace-nowrap" style={{ animation: `cz-type ${cycle(4.4, 1.5)}` }}>[x] renders the video</div>
						<span className="cz-anim inline-block h-2.5 w-1.5" style={{ background: "#38ff85", animation: "cz-blink 1s steps(1) infinite" }} />
					</div>
				</div>
			);
		default:
			return null;
	}
}

/** A card thumbnail: a style's own preview when it has one, else a motion sample on a neutral stage. */
export function PromptThumb({ style, motion, className }: { style?: StyleId | null; motion?: string; className?: string }) {
	const styled = style && style !== "default";
	return (
		<div className={cn("overflow-hidden rounded-lg border border-border bg-muted", className)}>
			{styled ? <StylePreview style={style} /> : <div className="flex size-full items-center justify-center bg-surface/60"><Motion name={motion || "kinetic-type"} /></div>}
		</div>
	);
}
