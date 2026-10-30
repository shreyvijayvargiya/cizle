import { useEffect, useMemo, useRef, useState, type SyntheticEvent } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight01Icon, Copy01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import { toast } from "sonner";
import { copyText } from "@/components/CopyButton";
import { Icon } from "@/components/Icon";
import { SubscribeForm } from "@/components/SubscribeForm";
import { fromLabel } from "@/lib/billing";
import { PREMIUM } from "@/lib/config";
import { useSkills } from "@/lib/data";
import { languageOf } from "@/lib/languages";
import { shuffled, useGallery, usePromptText, useShuffle, type GalleryItem } from "@/lib/gallery";
import { countBy, countryFlag } from "@/lib/facets";
import { plain } from "@/lib/utils";
import { AutoVideo } from "@/lib/videos";

const TAGS = ["AI video prompts", "image prompts", "Claude Code skills", "Remotion", "HyperFrames", "education animation", "whiteboard videos", "small business prompts", "motion graphics prompts", "film styles"];
const LINES = ["Never start from a blank prompt.", "Copy a prompt that already worked.", "Inspiration for creators and builders.", "Every prompt credits its creator."];

/** One line that changes every few seconds; the first is in the page from the start, and motion-sensitive visitors keep it. */
function Tagline() {
	const [n, setN] = useState(0);
	useEffect(() => {
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
		const t = setInterval(() => setN((v) => (v + 1) % LINES.length), 3400);
		return () => clearInterval(t);
	}, []);
	return <span key={n} className="inline-block animate-[fade-in_.4s_ease-out]">{LINES[n]}</span>;
}

/**
 * The first screen is a board of four tiles. The live thing: the video tile plays a real demo, the tile under it shows the prompt that made
 * it (free samples, in full), and the arrow moves to the next one. Every tile holds something real from the library.
 */
export function Hero({ skillCount: _skillCount }: { skillCount: number }) {
	const gallery = useGallery();
	const skillsQ = useSkills();
	const { seed } = useShuffle();
	// how many prompts and skills, and in how many languages: counted from the data, so every new harvest version shows up here by itself
	const langs = useMemo(() => {
		const m: Record<string, number> = { ...(gallery.data?.languages || {}) };
		for (const sk of skillsQ.data?.skills ?? []) m[sk.lang || "en"] = (m[sk.lang || "en"] || 0) + 1;
		return Object.entries(m).sort((a, b) => b[1] - a[1]);
	}, [gallery.data, skillsQ.data]);

	const countries = useMemo(() => countBy([...(gallery.data?.items ?? []), ...(skillsQ.data?.skills ?? [])], (g) => g.country), [gallery.data, skillsQ.data]);
	const heroCountries = countries; // every country in the library, most prompts first

	const picks = useMemo(() => {
		// a different set of demos on every visit: the library is shuffled, then one of each category comes first
		const free = shuffled((gallery.data?.items || []).filter((g) => g.tier === "free" && g.video && g.preview && g.chars >= 200 && g.chars <= 1400), seed);
		// A spread of the library, not eight of one kind: take one per category first.
		const seen = new Set<string>();
		const out: GalleryItem[] = [];
		for (const g of free) if (!seen.has(g.category || "")) (seen.add(g.category || ""), out.push(g));
		for (const g of free) if (out.length < 8 && !out.includes(g)) out.push(g);
		return out.slice(0, 8);
	}, [gallery.data, seed]);
	const [i, setI] = useState(0);
	useEffect(() => setI(0), [seed]); // a new order starts from its first demo
	const [copied, setCopied] = useState(false);
	const [videoBad, setVideoBad] = useState(false);
	const cur = picks[i % Math.max(1, picks.length)];
	const fullText = usePromptText(cur, false).data; // the home tile shows the whole prompt once its shard has loaded, the preview until then
	const curText = cur?.text ?? fullText ?? cur?.preview ?? "";
	const total = gallery.data?.total ?? 0;
	const items = total + (skillsQ.data?.skills.length ?? 0);
	useEffect(() => setVideoBad(false), [cur?.id]);
	// the stage is wide, so a vertical demo would be cropped to a strip: those are skipped (the rest of the library shows them in full)
	const skipped = useRef(0);
	useEffect(() => { skipped.current = 0; }, [seed]);
	const onMeta = (e: SyntheticEvent<HTMLVideoElement>) => {
		const v = e.currentTarget;
		if (v.videoHeight > v.videoWidth && skipped.current < picks.length - 1) (skipped.current++, setI((n) => (n + 1) % picks.length));
	};

	const showVideo = cur && cur.video && !videoBad;
	return (
		<section aria-label="cizle" className="board pb-2">
			<div className="board-w grid grid-cols-1 gap-2 lg:grid-cols-12">
				{/* The stage: one big demo video playing across the whole first screen, the headline set huge over it. */}
				<div className="shutter relative isolate min-h-[max(560px,calc(100dvh-84px))] overflow-hidden rounded-lg bg-field-2 text-white lg:col-span-12">
					{showVideo ? (
						<AutoVideo key={cur.id} priority src={cur.video!} poster={cur.poster} onFail={() => setVideoBad(true)} onLoadedMetadata={onMeta} className="absolute inset-0 -z-20 size-full object-cover" aria-label={`Demo video: ${cur.title}`} />
					) : cur?.poster ? (
						<img src={cur.poster} alt={cur.title} className="absolute inset-0 -z-20 size-full object-cover" referrerPolicy="no-referrer" onError={() => setVideoBad(true)} />
					) : (
						// While the library loads, or if a demo cannot play: the product's own launch teaser, made with its Launch teaser skill.
						<AutoVideo priority src="/videos/cizle-launch.mp4" poster="/videos/cizle-launch-poster.jpg" className="absolute inset-0 -z-20 size-full object-cover" aria-label="cizle launch teaser, made with the Launch teaser skill" />
					)}
					<div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(to_top,rgb(0_0_0/.62),rgb(0_0_0/.18)_34%,transparent_52%),linear-gradient(to_bottom,rgb(0_0_0/.34),transparent_20%)]" />

					<div className="absolute inset-0 flex flex-col justify-between gap-6 p-4 sm:p-8">
						<div className="flex flex-wrap items-start justify-between gap-3">
							<p className="rounded-full bg-black/40 px-4 py-2 text-sm font-medium backdrop-blur-md sm:text-base" aria-live="off"><Tagline /></p>
							{cur ? (
								<Link to="/prompts/$slug" params={{ slug: cur.slug }} className="press hidden max-w-[34ch] truncate rounded-full bg-black/40 px-4 py-2 text-sm backdrop-blur-md hover:bg-black/55 sm:inline-flex">
									{plain(cur.title)}
								</Link>
							) : null}
						</div>

						<div className="flex flex-col gap-5 [text-shadow:0_1px_20px_rgb(0_0_0/.45)] sm:gap-6">
							<div className="max-w-[46rem]">
								<h1 className="font-semibold tracking-[-0.035em] [text-wrap:balance]" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.25rem, 5.4vw, 5rem)", lineHeight: 1 }}>
									The prompt library for creators
								</h1>
								<p className="mt-3 max-w-[40ch] text-base leading-snug text-white/90 sm:text-xl">
									Prompts that already worked, with the video to prove it. Copy one and change a line.
								</p>
								<div className="mt-5 flex flex-wrap gap-2 [text-shadow:none]">
									<a href="#library" className="press inline-flex h-12 items-center rounded-full bg-white px-6 text-sm font-semibold tracking-wide text-black hover:bg-white/90">Browse prompts</a>
									<a href="#subscribe" className="press inline-flex h-12 items-center rounded-full bg-white/20 px-6 text-sm font-semibold tracking-wide backdrop-blur-md hover:bg-white/30">Get new prompts</a>
								</div>
							</div>

							{/* the prompt behind this video, with copy, open and next: set into the bottom of the video instead of a card under it */}
							{cur ? (
								<div className="flex flex-col gap-3 rounded-2xl bg-black/45 p-3 [text-shadow:none] backdrop-blur-xl sm:flex-row sm:items-center sm:gap-5 sm:p-4">
									<div className="min-w-0 flex-1">
										<p className="text-xs font-medium tracking-wide text-white/65 uppercase">The prompt behind this video · {i % Math.max(1, picks.length) + 1} of {picks.length}</p>
										<p className="mt-1 text-sm leading-snug whitespace-pre-line text-white/95 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] overflow-hidden sm:text-base">{plain(curText)}</p>
									</div>
									<div className="flex shrink-0 flex-wrap items-center gap-2">
										<button
											type="button"
											onClick={async () => {
												if (await copyText(curText)) (setCopied(true), toast.success("Prompt copied"), setTimeout(() => setCopied(false), 1800));
											}}
											className="press inline-flex h-11 items-center gap-2 rounded-full bg-white px-4 text-sm font-semibold text-black hover:bg-white/90"
										>
											<Icon icon={copied ? Tick02Icon : Copy01Icon} size={16} /> {copied ? "Copied" : "Copy prompt"}
										</button>
										<Link to="/prompts/$slug" params={{ slug: cur.slug }} className="press inline-flex h-11 items-center rounded-full bg-white/20 px-4 text-sm font-semibold backdrop-blur-md hover:bg-white/30">Open it</Link>
										<button type="button" onClick={() => setI((n) => (n + 1) % picks.length)} aria-label="Next demo" className="press inline-flex h-11 items-center gap-2 rounded-full bg-white/20 px-4 text-sm font-semibold backdrop-blur-md hover:bg-white/30">
											Next <Icon icon={ArrowRight01Icon} size={15} />
										</button>
									</div>
								</div>
							) : null}
						</div>
					</div>
				</div>

				<div className="tile reveal flex flex-col justify-end p-5 sm:p-6 lg:col-span-6">
					<p className="max-w-[60ch] text-lg leading-snug">
						<strong className="font-semibold">Stop staring at a blank box.</strong> cizle keeps the prompts people really used to make AI videos, images and Claude Code skills, next to what they made: motion graphics with Remotion and HyperFrames, classroom animations, shop ads, film looks from every country. Copy one, change a line, and the credit stays with whoever wrote it.
					</p>
					<ul aria-label="Popular searches" className="mt-4 flex flex-wrap gap-1.5">
						{TAGS.map((t) => (
							<li key={t}><Link to="/" search={{ q: t }} hash="library" className="press inline-flex rounded-full bg-tile-2 px-3 py-1 text-sm text-foreground hover:bg-muted">{t}</Link></li>
						))}
					</ul>
					{heroCountries.length ? (
						<ul aria-label="Browse by country" className="mt-2 flex flex-wrap gap-1.5">
							{heroCountries.map(([c, n]) => (
								<li key={c}><Link to="/" search={{ country: c }} hash="library" className="press inline-flex items-center gap-1.5 rounded-full bg-tile-2 px-3 py-1 text-sm text-foreground hover:bg-muted"><span aria-hidden>{countryFlag(c)}</span>{c}</Link></li>
							))}
						</ul>
					) : null}
				</div>

				<div id="subscribe" className="tile-ink reveal flex min-h-[220px] scroll-mt-24 flex-col justify-between gap-5 p-5 sm:p-6 lg:col-span-6" style={{ ["--i" as string]: 1 }}>
					<p className="statement">New prompts land every week. Get the best ones in your inbox, each with its video and its creator.</p>
					<SubscribeForm stacked cta="Subscribe" className="relative" />
				</div>

				<div className="tile-accent reveal flex min-h-[220px] flex-col justify-between gap-5 p-5 sm:p-6 lg:col-span-12" style={{ ["--i" as string]: 2 }}>
					<div>
						<p className="statement">{langs.length > 1 ? "Written in many languages, searchable in all of them." : PREMIUM ? `Free samples open in full. Premium opens the rest, from ${fromLabel("USD")} a month.` : "Every prompt and skill here is free."}</p>
						{langs.length > 1 ? (
							<ul aria-label="Languages" className="mt-3 flex flex-wrap gap-1.5">
								{langs.map(([code]) => (
									<li key={code}>
										<Link to="/" search={{ lang: code }} hash="library" className="press inline-flex items-center gap-1.5 rounded-full bg-field-2 px-3 py-1 text-sm text-field-2-ink hover:opacity-90">
											<span aria-hidden>{languageOf(code).flag}</span> {languageOf(code).native}
										</Link>
									</li>
								))}
							</ul>
						) : null}
					</div>
					<a href="#library" className="press inline-flex h-12 w-fit items-center gap-2 rounded-lg bg-field-2 px-5 text-base font-medium text-field-2-ink hover:opacity-90">
						Browse the library <Icon icon={ArrowRight01Icon} size={16} />
					</a>
				</div>
			</div>
		</section>
	);
}
