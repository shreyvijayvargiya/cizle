import { useEffect, useMemo, useState } from "react";
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
/** the countries shown as quick links, when the library has prompts from them */
const HERO_COUNTRIES = ["USA", "China", "Japan", "Brazil", "Spain", "Mexico", "Turkey", "Vietnam", "Russia", "Indonesia", "India", "Germany", "France", "UK"];
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
	const heroCountries = HERO_COUNTRIES.map((c) => countries.find(([n]) => n === c)).filter((x): x is [string, number] => Boolean(x));

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

	return (
		<section aria-label="cizle" className="board pb-2">
			{/* Desktop board: headline and video on the top row (video on the right), the subscribe and browse tiles on the bottom left, the prompt under the video. */}
			<div className="board-w grid min-h-[calc(100dvh-84px)] grid-cols-1 gap-2 lg:grid-cols-12 lg:grid-rows-2">
				<div className="tile reveal flex min-h-[260px] flex-col justify-end p-5 sm:p-6 lg:col-span-6 lg:col-start-1 lg:row-start-1">
					<p className="text-lg font-medium text-muted-foreground" aria-live="off"><Tagline /></p>
					<h1 className="display mt-3" style={{ fontSize: "clamp(2.25rem, 4.6vw, 5.25rem)" }}>
						The prompt library for creators and builders
					</h1>
					<p className="mt-4 max-w-[60ch] text-lg leading-snug">
						<strong className="font-semibold">{items ? `${items.toLocaleString()} prompts and skills.` : "Thousands of prompts and skills."}</strong> cizle is a free library of AI video prompts, image prompts and Claude Code skills in {langs.length > 1 ? langs.length : 12} languages and {countries.length > 1 ? `${countries.length} regions` : "many countries"}: video prompts by country, motion graphics with Remotion and HyperFrames, classroom and education animations, entertainment and small-business prompts. Every prompt credits its creator. Copy one, make it yours.
					</p>
					<ul aria-label="Popular searches" className="mt-4 flex flex-wrap gap-1.5">
						{TAGS.map((t) => (
							<li key={t}><Link to="/" search={{ q: t }} hash="library" className="press inline-flex rounded-full bg-tile-2 px-3 py-1 text-sm text-foreground hover:bg-muted">{t}</Link></li>
						))}
					</ul>
					{heroCountries.length ? (
						<ul aria-label="Browse by country" className="mt-2 flex flex-wrap gap-1.5">
							{heroCountries.map(([c, n]) => (
								<li key={c}><Link to="/" search={{ country: c }} hash="library" className="press inline-flex items-center gap-1.5 rounded-full bg-tile-2 px-3 py-1 text-sm text-foreground hover:bg-muted"><span aria-hidden>{countryFlag(c)}</span>{c} <span className="text-muted-foreground tabular-nums">{n.toLocaleString()}</span></Link></li>
							))}
						</ul>
					) : null}
				</div>

				<div className="shutter relative min-h-[300px] overflow-hidden rounded-lg bg-field-2 lg:col-span-6 lg:col-start-7 lg:row-start-1" style={{ animationDelay: ".1s" }}>
					{cur && !(videoBad && !cur.poster) ? (
						<>
							{cur.video && !videoBad ? (
								<AutoVideo key={cur.id} priority src={cur.video} poster={cur.poster} onFail={() => setVideoBad(true)} className="absolute inset-0 size-full object-cover" aria-label={`Demo video: ${cur.title}`} />
							) : cur.poster ? (
								<img src={cur.poster} alt={cur.title} className="absolute inset-0 size-full object-cover" referrerPolicy="no-referrer" onError={() => setVideoBad(true)} />
							) : null}
						</>
					) : (
						<>
							{/* While the library loads, or if a demo cannot play: the product's own launch teaser, made with its Launch teaser skill. */}
							<AutoVideo priority src="/videos/cizle-launch.mp4" poster="/videos/cizle-launch-poster.jpg" className="absolute inset-0 size-full object-cover" aria-label="cizle launch teaser, made with the Launch teaser skill" />
						</>
					)}
				</div>

				<div id="subscribe" className="tile-ink reveal flex min-h-[260px] scroll-mt-24 flex-col justify-between gap-5 p-5 sm:p-6 lg:col-span-3 lg:col-start-1 lg:row-start-2" style={{ ["--i" as string]: 2 }}>
					<p className="statement">{items ? `${items.toLocaleString()} video prompts, image prompts and skills` : "Video prompts, image prompts and skills"} from creators around the world. Every one is credited and free to copy.</p>
					<SubscribeForm stacked cta="Subscribe" className="relative" />
				</div>

				<div className="tile-accent reveal flex min-h-[200px] flex-col justify-between gap-5 p-5 sm:p-6 lg:col-span-3 lg:col-start-4 lg:row-start-2" style={{ ["--i" as string]: 3 }}>
					<div>
						<p className="statement">{langs.length > 1 ? `In ${langs.length} languages, and growing.` : PREMIUM ? `Free samples open in full. Premium opens the rest, from ${fromLabel("USD")} a month.` : "Every prompt and skill here is free."}</p>
						{langs.length > 1 ? (
							<ul aria-label="Languages" className="mt-3 flex flex-wrap gap-1.5">
								{langs.slice(0, 8).map(([code, n]) => (
									<li key={code}>
										<Link to="/" search={{ lang: code }} hash="library" className="press inline-flex items-center gap-1.5 rounded-full bg-field-2 px-3 py-1 text-sm text-field-2-ink hover:opacity-90" title={`${n.toLocaleString()} prompts and skills`}>
											<span aria-hidden>{languageOf(code).flag}</span> {languageOf(code).native}
										</Link>
									</li>
								))}
								{langs.length > 8 ? <li className="inline-flex items-center px-1 text-sm opacity-80">+{langs.length - 8} more</li> : null}
							</ul>
						) : null}
					</div>
					<a href="#library" className="press inline-flex h-12 w-fit items-center gap-2 rounded-lg bg-field-2 px-5 text-base font-medium text-field-2-ink hover:opacity-90">
						Browse the library <Icon icon={ArrowRight01Icon} size={16} />
					</a>
				</div>

				<div className="tile reveal relative flex min-h-[320px] flex-col p-5 sm:p-6 lg:col-span-6 lg:col-start-7 lg:row-start-2" style={{ ["--i" as string]: 1 }}>
					{cur ? (
						<>
							<p className="max-w-[60ch] flex-1 overflow-hidden text-base leading-relaxed whitespace-pre-line [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:7]">{plain(curText)}</p>
							<div className="mt-4 flex flex-wrap items-center gap-2">
								<button
									type="button"
									onClick={async () => {
										if (await copyText(curText)) (setCopied(true), toast.success("Prompt copied"), setTimeout(() => setCopied(false), 1800));
									}}
									className="press inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-4 text-base font-medium text-primary-foreground hover:bg-primary/85"
								>
									<Icon icon={copied ? Tick02Icon : Copy01Icon} size={16} /> {copied ? "Copied" : "Copy prompt"}
								</button>
								<Link to="/prompts/$slug" params={{ slug: cur.slug }} className="press inline-flex h-11 items-center rounded-lg bg-tile-2 px-4 text-base text-foreground hover:bg-muted">
									Open it
								</Link>
								<button type="button" onClick={() => setI((n) => (n + 1) % picks.length)} aria-label="Next prompt" className="press ml-auto inline-flex h-11 items-center gap-2 rounded-lg bg-tile-2 px-4 text-base text-foreground hover:bg-muted">
									Next <Icon icon={ArrowRight01Icon} size={16} />
								</button>
							</div>
						</>
					) : (
						<p className="statement">The prompt that made the video shows here.</p>
					)}
				</div>
			</div>
		</section>
	);
}
