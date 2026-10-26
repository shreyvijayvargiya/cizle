import { Link, useCanGoBack, useNavigate, useRouter } from "@tanstack/react-router";
import { Dialog as D } from "radix-ui";
import { ArrowLeft01Icon, ArrowRight01Icon, ArrowUpRight01Icon, Cancel01Icon } from "@hugeicons/core-free-icons";
import { useEffect, useState } from "react";
import { CopyButton } from "@/components/CopyButton";
import { SaveButtons } from "@/components/SaveButtons";
import { Icon } from "@/components/Icon";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/misc";
import { VideoPlayer } from "@/components/VideoPlayer";
import { useAuth } from "@/lib/auth";
import { statsKey, useRecordView } from "@/lib/stats";
import { useSuspendVideos } from "@/lib/videos";
import { fromLabel } from "@/lib/billing";
import { PREMIUM, SITE } from "@/lib/config";
import { isRtl, languageOf } from "@/lib/languages";
import { usePromptText, type GalleryFilters, type GalleryItem } from "@/lib/gallery";
import { useHead } from "@/lib/head";
import { isLatinLabel } from "@/lib/utils";

/** The preview of an image prompt: the picture, and a strip of thumbnails when it has several. A picture that does not load is skipped; if none loads, say so and link the source. */
function ImagePreview({ images, title, sourceUrl }: { images: string[]; title: string; sourceUrl?: string | null }) {
	const [i, setI] = useState(0);
	const [bad, setBad] = useState<Record<number, boolean>>({});
	useEffect(() => (setI(0), setBad({})), [images[0]]); // eslint-disable-line react-hooks/exhaustive-deps
	const working = images.map((_, k) => k).filter((k) => !bad[k]);
	if (!working.length) {
		return (
			<p className="max-w-xs text-center text-lg text-muted-foreground">
				The picture could not be loaded here.{sourceUrl ? <> <a className="underline underline-offset-2" href={sourceUrl} target="_blank" rel="noopener noreferrer">Open the source</a>.</> : null}
			</p>
		);
	}
	const cur = bad[i] ? working[0] : i;
	return (
		<div className="flex h-full w-full min-w-0 flex-col items-center justify-center gap-3">
			<img key={cur} src={images[cur]} alt={title} referrerPolicy="no-referrer" onError={() => setBad((b) => ({ ...b, [cur]: true }))} className="min-h-0 max-h-full max-w-full flex-1 rounded-xl object-contain" />
			{working.length > 1 ? (
				<div role="tablist" aria-label="Pictures" className="flex max-w-full shrink-0 gap-2 overflow-x-auto pb-1">
					{working.map((k) => (
						<button key={k} role="tab" type="button" aria-selected={k === cur} aria-label={`Picture ${k + 1} of ${images.length}`} onClick={() => setI(k)} className={`size-14 shrink-0 overflow-hidden rounded-lg border-2 outline-none focus-visible:ring-2 focus-visible:ring-ring ${k === cur ? "border-primary" : "border-transparent opacity-70 hover:opacity-100"}`}>
							<img src={images[k]} alt="" loading="lazy" referrerPolicy="no-referrer" onError={() => setBad((b) => ({ ...b, [k]: true }))} className="size-full object-cover" />
						</button>
					))}
				</div>
			) : null}
		</div>
	);
}

const pill = "inline-flex h-8 items-center rounded-full border border-input px-3 text-sm";
const round = "grid size-9 place-items-center rounded-full border border-input outline-none transition-colors hover:bg-tile-2 focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-30 disabled:hover:bg-transparent";

/**
 * One gallery prompt over the list, at its own address (/prompts/<title-words>-<id>). Video on the left, details on the right.
 * Free samples show in full. For the rest everyone sees the credit, the links to the original post and a preview; the full text
 * and copy button belong to subscribers.
 */
export function PromptDialog({ item, search, list = [] }: { item: GalleryItem; search: GalleryFilters; list?: GalleryItem[] }) {
	const navigate = useNavigate();
	const router = useRouter();
	const canGoBack = useCanGoBack();
	const { isPro, user } = useAuth();
	const full = usePromptText(item, isPro);
	const text = item.text ?? full.data;
	const [videoBad, setVideoBad] = useState(false);
	const [posterBad, setPosterBad] = useState(false);
	const [expanded, setExpanded] = useState(false);
	useSuspendVideos(true);
	const recordView = useRecordView();
	useEffect(() => recordView(statsKey(`p:${item.id}`)), [item.id]); // eslint-disable-line react-hooks/exhaustive-deps
	const tweetId = /^x-(\d+)$/.exec(item.id)?.[1] || /status\/(\d+)/.exec(item.postUrl || "")?.[1] || null;
	const versioned = Boolean(item.version) && item.version !== "classic";
	const locked = !text && !isPro && item.tier === "premium" && !versioned;
	const at = list.findIndex((g) => g.id === item.id);
	const prev = at > 0 ? list[at - 1] : undefined;
	const next = at >= 0 ? list[at + 1] : undefined;
	const by = item.handle ? `@${item.handle}` : item.author || "the creator";
	const posted = item.added && !Number.isNaN(Date.parse(item.added)) ? new Date(item.added).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : null;

	useEffect(() => (setVideoBad(false), setPosterBad(false), setExpanded(false)), [item.id]);

	const close = () => (canGoBack ? router.history.back() : navigate({ to: "/gallery", search: { ...search, p: undefined } as never, resetScroll: false }));
	const go = (g?: GalleryItem) => g && navigate({ to: "/prompts/$slug", params: { slug: g.slug }, search: search as never, replace: true, resetScroll: false });
	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if (e.target instanceof HTMLElement && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
			if (e.key === "ArrowLeft") go(prev);
			if (e.key === "ArrowRight") go(next);
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	});

	useHead({
		title: `${item.title}: ${item.category && isLatinLabel(item.category) ? `${item.category} ` : ""}${item.kind === "image-prompt" ? "image" : "video"} prompt by ${by} | cizle`,
		description: item.preview.slice(0, 180),
		path: `/prompts/${item.slug}`,
	});

	return (
		<D.Root open onOpenChange={(o) => !o && close()}>
			<D.Portal>
				<D.Overlay className="fixed inset-0 z-50 bg-black/45 data-[state=open]:animate-[fade-in_.15s_ease-out]" />
				<D.Content
					className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-background outline-none lg:inset-auto lg:top-1/2 lg:left-1/2 lg:h-[min(878px,calc(100dvh-2rem))] lg:w-[min(1320px,calc(100vw-2rem))] lg:-translate-x-1/2 lg:-translate-y-1/2 lg:flex-row lg:overflow-hidden lg:rounded-2xl lg:shadow-2xl lg:[animation:pop-in_.2s_cubic-bezier(0.23,1,0.32,1)]"
					aria-describedby="prompt-desc"
					tabIndex={-1}
				>
					<div className="sticky top-0 z-10 flex h-[44dvh] min-h-[240px] w-full shrink-0 items-center justify-center bg-surface p-3 sm:h-[52dvh] lg:static lg:h-auto lg:min-w-0 lg:flex-1 lg:p-8">
						<D.Close asChild>
							<button type="button" aria-label="Close and go back" className="absolute top-3 right-3 z-20 grid size-11 place-items-center rounded-full bg-background/90 text-foreground shadow-md outline-none backdrop-blur focus-visible:ring-2 focus-visible:ring-ring lg:hidden">
								<Icon icon={Cancel01Icon} size={18} />
							</button>
						</D.Close>
						{item.video && !videoBad ? (
							<VideoPlayer src={item.video} postUrl={item.postUrl} poster={item.poster} label={`Video: ${item.title}`} onFail={() => setVideoBad(true)} />
						) : tweetId && !posterBad ? (
							// the file would not play here: show the post's own player instead (it streams the video the way X does)
							<iframe title={`Post by ${by}`} src={`https://platform.twitter.com/embed/Tweet.html?id=${tweetId}&dnt=true&hideThread=true&theme=dark`} sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox" referrerPolicy="no-referrer" loading="lazy" className="h-full w-full max-w-[560px] rounded-xl border-0 bg-surface" onError={() => setPosterBad(true)} />
						) : item.images?.length || item.poster ? (
							// an image prompt: its picture is the preview (all of its pictures when it has several)
							<ImagePreview images={item.images?.length ? item.images : [item.poster!]} title={item.title} sourceUrl={item.sourceUrl} />
						) : (
							<p className="max-w-xs text-center text-lg text-muted-foreground">{versioned ? "This prompt has no picture or video yet." : "No video here yet. Use View post to watch the original."}</p>
						)}
						{item.video && videoBad ? (
							<p className="absolute inset-x-6 bottom-3 flex items-center justify-center gap-3 text-center text-sm text-muted-foreground">
								The file would not play here.
								<button type="button" onClick={() => setVideoBad(false)} className="underline underline-offset-2">Try again</button>
							</p>
						) : null}
					</div>

					<div className="flex w-full min-w-0 shrink-0 flex-col p-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:p-6 lg:w-[400px] lg:overflow-y-auto lg:p-7">
						<div className="flex items-center gap-3">
							<span aria-hidden className="grid size-8 shrink-0 place-items-center rounded-full bg-field-2 text-sm font-semibold text-background">{by.replace("@", "").slice(0, 1).toUpperCase()}</span>
							<div className="min-w-0 flex-1 leading-tight">
								{item.handle ? (
									<a className="block truncate text-base font-medium hover:underline" href={`https://x.com/${item.handle}`} target="_blank" rel="noopener noreferrer">{item.author?.replace(/^@/, "") || item.handle}</a>
								) : (
									<span className="block truncate text-base font-medium">{by}</span>
								)}
								{item.handle ? <span className="block truncate text-sm text-muted-foreground">@{item.handle}</span> : null}
							</div>
							<SaveButtons id={`p:${item.id}`} />
							<D.Close asChild>
								<button type="button" aria-label="Close and go back" className="hidden size-8 place-items-center rounded-full outline-none hover:bg-tile-2 focus-visible:ring-2 focus-visible:ring-ring lg:grid">
									<Icon icon={Cancel01Icon} size={16} />
								</button>
							</D.Close>
						</div>

						<D.Title asChild>
							<h2 className="mt-6 text-xl leading-tight tracking-[-0.02em]">{item.title}</h2>
						</D.Title>
						<D.Description id="prompt-desc" className="sr-only">Video prompt by {by}</D.Description>

						<div className="mt-4 flex flex-wrap gap-2">
							{item.category && isLatinLabel(item.category) ? <span className={pill}>{item.category}</span> : null}
							{item.lang && item.lang !== "en" ? <span className={pill}>{languageOf(item.lang).flag} {languageOf(item.lang).native}</span> : null}
							{item.kind === "image-prompt" ? <span className={pill}>Image prompt</span> : null}
							{PREMIUM ? <span className={pill}>{item.tier === "free" ? "Free sample" : "Premium"}</span> : null}
							{item.translatedFrom ? <span className={pill}>Translated from {item.translatedFrom}</span> : null}
						</div>

						<div className="mt-6 flex min-h-8 items-center justify-between text-sm">
							<h2 className="text-muted-foreground">Prompt</h2>
							{text && !item.restricted ? <CopyButton text={text} label="Copy" done="Copied" variant="ghost" size="sm" /> : null}
						</div>
						{text || locked ? (
							<div className={`mt-2 rounded-lg bg-surface p-4 ${expanded ? "max-h-[46dvh] overflow-y-auto" : "max-h-52 overflow-hidden [mask-image:linear-gradient(to_bottom,#000_65%,transparent)]"}`}>
								<p dir={isRtl(item.lang) ? "rtl" : "auto"} className="text-base leading-relaxed whitespace-pre-wrap">{text || item.preview}</p>
											</div>
						) : full.isError ? (
							<p className="mt-2 rounded-lg bg-surface p-4 text-base text-muted-foreground">{(full.error as Error).message}</p>
						) : (
							<Skeleton className="mt-2 h-40" />
						)}
						{text && !expanded ? (
							<button type="button" onClick={() => setExpanded(true)} className="mt-3 self-start text-base text-muted-foreground hover:text-foreground">Show all</button>
						) : null}
						{locked ? (
							<div className="mt-4">
								<p className="text-base">The full text, and copy, open with Premium from {fromLabel("USD")} a month.</p>
								<Button className="mt-3" asChild>
									{user ? <Link to="/pricing">See Premium</Link> : <Link to="/login" search={{ next: "/pricing" }}>Sign in to unlock</Link>}
								</Button>
							</div>
						) : null}
						{item.restricted ? (
							<p className="mt-3 rounded-lg bg-surface p-3 text-sm text-muted-foreground">
								Preview only. This work is not published under an open licence, so the full prompt stays with its creator
								{item.sourceUrl ? <> : <a className="underline underline-offset-2" href={item.sourceUrl} target="_blank" rel="noopener noreferrer">read it at the source</a></> : ""}. <Link to="/rights" className="underline underline-offset-2">Credits and removal</Link>.
							</p>
						) : null}
						{item.partial ? <p className="mt-2 text-sm text-muted-foreground">The creator shared only part of this prompt.</p> : null}
						<dl className="mt-6 grid grid-cols-[6.5rem_1fr] gap-y-2 border-t border-input pt-5 text-base">
							{item.model ? (<><dt className="text-muted-foreground">Model</dt><dd>{item.model}</dd></>) : null}
							{posted ? (<><dt className="text-muted-foreground">Posted</dt><dd>{posted}</dd></>) : null}
							<dt className="text-muted-foreground">Length</dt>
							<dd>{item.chars.toLocaleString()} characters</dd>
							{item.sourceUrl ? (<><dt className="text-muted-foreground">Source</dt><dd><a className="inline-flex items-center gap-1 underline-offset-2 hover:underline" href={item.sourceUrl} target="_blank" rel="noopener noreferrer">Source page <Icon icon={ArrowUpRight01Icon} size={13} /></a></dd></>) : null}
							{item.postUrl ? (<><dt className="text-muted-foreground">Post</dt><dd><a className="inline-flex items-center gap-1 underline-offset-2 hover:underline" href={item.postUrl} target="_blank" rel="noopener noreferrer">View post <Icon icon={ArrowUpRight01Icon} size={13} /></a></dd></>) : null}
							{versioned ? (<><dt className="text-muted-foreground">Collection</dt><dd>{item.version}{item.source ? ` · ${item.source}` : ""}{item.fetchedAt ? ` · scraped ${new Date(item.fetchedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}` : ""}</dd></>) : null}
							{item.license ? (<><dt className="text-muted-foreground">Licence</dt><dd>{item.license}</dd></>) : null}
						</dl>

						<div className="mt-auto flex items-end justify-between gap-4 pt-8">
							<p className="text-xs text-muted-foreground">
								Are you the creator and want this changed or removed? Email <a className="underline" href={`mailto:${SITE.email}?subject=Gallery%20removal%20${item.id}`}>{SITE.email}</a>.
							</p>
							<div className="flex shrink-0 gap-2">
								<button type="button" className={round} aria-label="Previous prompt" disabled={!prev} onClick={() => go(prev)}><Icon icon={ArrowLeft01Icon} size={16} /></button>
								<button type="button" className={round} aria-label="Next prompt" disabled={!next} onClick={() => go(next)}><Icon icon={ArrowRight01Icon} size={16} /></button>
							</div>
						</div>
					</div>
				</D.Content>
			</D.Portal>
		</D.Root>
	);
}
