import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight01Icon, Copy01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import { toast } from "sonner";
import { copyText } from "@/components/CopyButton";
import { Icon } from "@/components/Icon";
import { fromLabel } from "@/lib/billing";
import { LAUNCH_FREE } from "@/lib/config";
import { useGallery, type GalleryItem } from "@/lib/gallery";
import { plain } from "@/lib/utils";
import { AutoVideo } from "@/lib/videos";

/**
 * The first screen is a board of four tiles. The live thing: the video tile plays a real demo, the tile under it shows the prompt that made
 * it (free samples, in full), and the arrow moves to the next one. Every tile holds something real from the library.
 */
export function Hero({ skillCount: _skillCount }: { skillCount: number }) {
	const gallery = useGallery();
	const picks = useMemo(() => {
		const free = (gallery.data?.items || []).filter((g) => g.tier === "free" && g.video && g.text && g.chars >= 200 && g.chars <= 1400);
		// A spread of the library, not eight of one kind: take one per category first.
		const seen = new Set<string>();
		const out: GalleryItem[] = [];
		for (const g of free) if (!seen.has(g.category || "")) (seen.add(g.category || ""), out.push(g));
		for (const g of free) if (out.length < 8 && !out.includes(g)) out.push(g);
		return out.slice(0, 8);
	}, [gallery.data]);
	const [i, setI] = useState(0);
	const [copied, setCopied] = useState(false);
	const [videoBad, setVideoBad] = useState(false);
	const cur = picks[i % Math.max(1, picks.length)];
	const total = gallery.data?.total ?? 0;
	useEffect(() => setVideoBad(false), [cur?.id]);

	return (
		<section aria-label="cizle" className="board pb-2">
			<div className="board-w grid min-h-[calc(100dvh-84px)] grid-cols-1 gap-2 md:grid-cols-12 lg:grid-rows-2">
				<div className="tile reveal order-1 flex min-h-[260px] flex-col justify-end p-5 sm:p-6 md:order-none md:col-span-6">
					<h1 className="display" style={{ fontSize: "clamp(2.75rem, 7.4vw, 7.5rem)" }}>
						Prompts with their videos
					</h1>
				</div>

				<div className="shutter relative order-3 min-h-[260px] overflow-hidden rounded-lg bg-field-2 md:order-none md:col-span-6" style={{ animationDelay: ".1s" }}>
					{cur && !(videoBad && !cur.poster) ? (
						<>
							{cur.video && !videoBad ? (
								<AutoVideo key={cur.id} priority src={cur.video} poster={cur.poster} onFail={() => setVideoBad(true)} className="absolute inset-0 size-full object-cover" aria-label={`Demo video: ${cur.title}`} />
							) : cur.poster ? (
								<img src={cur.poster} alt={cur.title} className="absolute inset-0 size-full object-cover" referrerPolicy="no-referrer" onError={() => setVideoBad(true)} />
							) : null}
							<div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-black/55 px-5 py-4 text-white">
								<p className="max-w-[34ch] text-lg leading-tight font-medium">{plain(cur.title)}</p>
								<p className="shrink-0 text-base">{cur.handle ? `@${cur.handle}` : cur.author}</p>
							</div>
						</>
					) : (
						<>
							{/* While the library loads, or if a demo cannot play: the product's own launch teaser, made with its Launch teaser skill. */}
							<AutoVideo priority src="/videos/cizle-launch.mp4" poster="/videos/cizle-launch-poster.jpg" className="absolute inset-0 size-full object-cover" aria-label="cizle launch teaser, made with the Launch teaser skill" />
							<div className="absolute inset-x-0 bottom-0 bg-black/55 px-5 py-4 text-white">
								<p className="text-lg leading-tight font-medium">cizle launch teaser, made with the Launch teaser skill</p>
							</div>
						</>
					)}
				</div>

				<div className="tile reveal relative order-4 flex min-h-[320px] flex-col p-5 sm:p-6 md:order-none md:col-span-12 lg:col-span-6" style={{ ["--i" as string]: 1 }}>
					{cur ? (
						<>
							<p className="max-w-[60ch] flex-1 overflow-hidden text-base leading-relaxed whitespace-pre-line [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:7]">{plain(cur.text)}</p>
							<div className="mt-4 flex flex-wrap items-center gap-2">
								<button
									type="button"
									onClick={async () => {
										if (await copyText(cur.text || "")) (setCopied(true), toast.success("Prompt copied"), setTimeout(() => setCopied(false), 1800));
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

				<div className="tile-ink reveal order-5 flex min-h-[200px] flex-col justify-between p-5 sm:p-6 md:order-none md:col-span-6 lg:col-span-3" style={{ ["--i" as string]: 2 }}>
					<p className="statement">
						{total ? `${total.toLocaleString()} real prompts` : "Real prompts"}, each with the video it made. Copy one or open it.
					</p>
				</div>

				<div className="tile-accent reveal order-2 flex min-h-[200px] flex-col justify-between gap-6 p-5 sm:p-6 md:order-none md:col-span-6 lg:col-span-3" style={{ ["--i" as string]: 3 }}>
					<p className="statement">{LAUNCH_FREE ? "Every prompt is free to read and copy, and open source on GitHub." : `Free samples open in full. Premium opens the rest, from ${fromLabel("USD")} a month.`}</p>
					<a href="#library" className="press inline-flex h-12 w-fit items-center gap-2 rounded-lg bg-field-2 px-5 text-base font-medium text-field-2-ink hover:opacity-90">
						Browse the library <Icon icon={ArrowRight01Icon} size={16} />
					</a>
				</div>
			</div>
		</section>
	);
}
