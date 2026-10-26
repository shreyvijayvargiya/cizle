import { useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import learn from "../../content/learn.json";
import { useHead } from "@/lib/head";

type Clip = { slug: string; title: string; description: string; video: string; poster: string };
const CLIPS = learn as Clip[];

function ClipCard({ c, index }: { c: Clip; index: number }) {
	const ref = useRef<HTMLVideoElement>(null);
	const [playing, setPlaying] = useState(false);
	const toggle = () => {
		const v = ref.current;
		if (!v) return;
		if (v.paused) void v.play().catch(() => {});
		else v.pause();
	};
	return (
		<article className="reveal flex flex-col gap-3" style={{ ["--i" as string]: index % 4 }}>
			<button type="button" onClick={toggle} aria-label={`${playing ? "Pause" : "Play"}: ${c.title}`} className="press group relative block aspect-[9/16] w-full overflow-hidden rounded-xl bg-field-2">
				<video ref={ref} src={c.video} poster={c.poster} preload="none" playsInline loop controls={playing} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} className="absolute inset-0 h-full w-full object-cover" />
				{playing ? null : (
					<span className="absolute inset-0 flex items-center justify-center bg-black/10 transition-colors group-hover:bg-black/25">
						<span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 text-black shadow-lg">
							<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.6-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z" fill="currentColor" /></svg>
						</span>
					</span>
				)}
			</button>
			<div>
				<h2 className="text-xl font-semibold tracking-tight">{c.title}</h2>
				<p className="mt-1 text-base text-muted-foreground">{c.description}</p>
			</div>
		</article>
	);
}

export function LearnPage() {
	useHead({
		title: "Learn: short videos about cizle prompts, skills and pricing",
		description: "Ten short videos on how cizle works: finding a prompt, copying a film look, Claude Code skills, creator credit, pricing and FAQ.",
		path: "/learn",
		jsonLd: {
			"@context": "https://schema.org",
			"@type": "ItemList",
			itemListElement: CLIPS.map((c, i) => ({ "@type": "VideoObject", position: i + 1, name: c.title, description: c.description, thumbnailUrl: c.poster, contentUrl: c.video })),
		},
	});
	return (
		<div className="board pt-6 pb-4">
			<div className="board-w">
				<h1 className="display reveal" style={{ fontSize: "clamp(2.75rem, 7vw, 6.5rem)" }}>Learn</h1>
				<p className="reveal mt-5 max-w-[48ch] text-lg" style={{ ["--i" as string]: 1 }}>
					Short videos on how cizle works. Pick a topic, press play. Ready to try it? <Link to="/gallery" className="underline decoration-field-1 decoration-2 underline-offset-4">Open the gallery</Link>.
				</p>
				<div className="mt-10 grid grid-cols-1 gap-x-5 gap-y-10 min-[480px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
					{CLIPS.map((c, i) => <ClipCard key={c.slug} c={c} index={i} />)}
				</div>
			</div>
		</div>
	);
}
