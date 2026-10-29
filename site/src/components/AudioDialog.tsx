import { Link, useCanGoBack, useNavigate, useRouter } from "@tanstack/react-router";
import { Dialog as D } from "radix-ui";
import { ArrowLeft01Icon, ArrowRight01Icon, ArrowUpRight01Icon, Cancel01Icon, Download01Icon, FullScreenIcon, SidebarRightIcon, VolumeHighIcon, VolumeLowIcon, VolumeMute01Icon, ArrowShrink02Icon } from "@hugeicons/core-free-icons";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { AudioViz, VIZ, vizFor } from "@/components/AudioViz";
import { AudioCard } from "@/components/AudioCard";
import { dialogSize, FsControls, FsDrawer, GROW, MoreCue, RelatedSection, useViewport } from "@/components/DialogFullscreen";
import { PlayButton } from "@/components/AudioCard";
import { CopyButton } from "@/components/CopyButton";
import { Icon } from "@/components/Icon";
import { engine, fmtTime, KIND_LABEL, LENGTH_LABEL, useEngine, type AudioFilters, type AudioItem } from "@/lib/audio";
import { MCP_URL, SITE } from "@/lib/config";
import { useHead } from "@/lib/head";

const tool = "press grid size-10 shrink-0 place-items-center rounded-full outline-none hover:bg-tile-2 focus-visible:ring-2 focus-visible:ring-ring";
const pill = "inline-flex h-8 items-center rounded-full border border-input px-3 text-sm";
const round = "grid size-9 place-items-center rounded-full border border-input outline-none transition-colors hover:bg-tile-2 focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-30 disabled:hover:bg-transparent";

/**
 * One clip over the list, at its own address (/audio/<name>). The picture is big and moves with the sound; below it the play/pause toggle and a
 * seek bar. On the right: the prompt to copy, the Claude Code call to action, credit and licence, and the close button.
 */
export function AudioDialog({ item, search, list }: { item: AudioItem; search: AudioFilters; list: AudioItem[] }) {
	const navigate = useNavigate();
	const router = useRouter();
	const canGoBack = useCanGoBack();
	const s = useEngine();
	const mine = s.id === item.id;
	const playing = mine && s.playing;
	const [viz, setViz] = useState(vizFor(item.id));
	useEffect(() => setViz(vizFor(item.id)), [item.id]);
	const at = list.findIndex((g) => g.id === item.id);
	const prev = at > 0 ? list[at - 1] : undefined;
	const next = at >= 0 ? list[at + 1] : undefined;
	const close = () => (canGoBack ? router.history.back() : navigate({ to: "/audio", search: search as never, resetScroll: false }));
	const go = (g?: AudioItem) => g && navigate({ to: "/audio/$slug", params: { slug: g.slug }, search: search as never, replace: true, resetScroll: false });
	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if (e.target instanceof HTMLElement && /^(INPUT|TEXTAREA|SELECT|BUTTON)$/.test(e.target.tagName)) return;
			if (e.key === "ArrowLeft") go(prev);
			if (e.key === "ArrowRight") go(next);
			if (e.key === " ") (e.preventDefault(), engine.toggle(item));
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	});
	const limit = Math.min(item.duration, 90);
	useHead({ title: `${item.title}: ${KIND_LABEL[item.kind].toLowerCase()} you can use in AI video | cizle`, description: item.prompt.slice(0, 180), path: `/audio/${item.slug}` });
	const claude = `Use the cizle MCP: open audio "audio:${item.slug}", download its file, and use it as the ${item.kind === "music" ? "background music" : item.kind === "sfx" ? "sound effect" : "ambient bed"} in the video you are making. Credit: ${item.creator}, ${item.license}.`;

	const vp = useViewport();
	const [fs, setFs] = useState(false);
	const [drawer, setDrawer] = useState(false);
	const [scrolled, setScrolled] = useState(false);
	const scroller = useRef<HTMLDivElement>(null);
	useEffect(() => { if (!fs) (setDrawer(false), setScrolled(false)); }, [fs]);
	useEffect(() => { scroller.current?.scrollTo({ top: 0 }); setScrolled(false); }, [item.id]);
	// up to 8 more clips: the same kind first, then the rest of the list, never this clip
	const related = useMemo(() => {
		const rest = list.filter((g) => g.id !== item.id);
		const same = rest.filter((g) => g.kind === item.kind);
		return [...same, ...rest.filter((g) => !same.includes(g))].slice(0, 8);
	}, [list, item.id, item.kind]);
	const speaker = s.muted || s.volume === 0 ? VolumeMute01Icon : s.volume < 0.5 ? VolumeLowIcon : VolumeHighIcon;
	const vol = s.muted ? 0 : s.volume;
	const renderDetails = (inDrawer: boolean) => (
					<div className="flex w-full min-w-0 shrink-0 flex-col p-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:p-6 lg:w-[400px] lg:overflow-y-auto lg:p-7">
						<div className="flex items-center gap-3">
							<span aria-hidden className="grid size-8 shrink-0 place-items-center rounded-full bg-field-2 text-sm font-semibold text-background">{Array.from(item.creator)[0]?.toUpperCase() ?? "?"}</span>
							<div className="min-w-0 flex-1 leading-tight"><span className="block truncate text-base font-medium">{item.creator}</span><span className="block truncate text-sm text-muted-foreground">{item.license}</span></div>
{inDrawer ? (
<button type="button" aria-label="Close details" onClick={() => setDrawer(false)} className="grid size-9 place-items-center rounded-full outline-none hover:bg-tile-2 focus-visible:ring-2 focus-visible:ring-ring"><Icon icon={Cancel01Icon} size={17} /></button>
) : (
							<D.Close asChild>
								<button type="button" aria-label="Close and go back" className="hidden size-9 place-items-center rounded-full outline-none hover:bg-tile-2 focus-visible:ring-2 focus-visible:ring-ring lg:grid"><Icon icon={Cancel01Icon} size={17} /></button>
							</D.Close>
)}
						</div>
						<D.Title asChild><h2 className="mt-6 text-xl leading-tight tracking-[-0.02em] [overflow-wrap:anywhere]">{item.title}</h2></D.Title>
						<D.Description id="audio-desc" className="sr-only">{KIND_LABEL[item.kind]} by {item.creator}</D.Description>
						<div className="mt-4 flex flex-wrap gap-2"><span className={pill}>{KIND_LABEL[item.kind]}</span><span className={pill}>{fmtTime(item.duration)}</span>{item.tags.slice(0, 4).map((t) => <Link key={t} to="/audio" search={{ tag: t } as never} className={`${pill} hover:bg-tile-2`}>{t}</Link>)}</div>

						<div className="mt-6 flex min-h-8 items-center justify-between text-sm"><h2 className="text-muted-foreground">Prompt</h2><CopyButton text={item.prompt} label="Copy" done="Copied" variant="ghost" size="sm" /></div>
						<div className="mt-2 rounded-lg bg-surface p-4"><p className="text-base leading-relaxed whitespace-pre-wrap [overflow-wrap:anywhere]">{item.prompt}</p></div>

						<div className="mt-4 rounded-lg border border-input p-4">
							<p className="text-sm text-muted-foreground">Use this sound in a video from Claude Code. Connect once, then paste the request.</p>
							<div className="mt-3 flex flex-wrap gap-2">
								<CopyButton text={claude} label="Copy for Claude Code" done="Copied for Claude Code" />
								<CopyButton text={`claude mcp add --transport http cizle ${MCP_URL}`} label="Connect command" done="Copied the connect command" />
								<a href={item.src} download={`${item.slug}.mp3`} className="press inline-flex h-10 items-center gap-2 rounded-lg bg-surface px-4 text-base font-medium hover:bg-tile-2"><Icon icon={Download01Icon} size={16} /> Download</a>
							</div>
						</div>

						<dl className="mt-6 grid grid-cols-[6.5rem_1fr] gap-y-2 border-t border-input pt-5 text-base">
							<dt className="text-muted-foreground">Length</dt><dd>{LENGTH_LABEL[item.length]}</dd>
							<dt className="text-muted-foreground">Original</dt><dd>{item.format.toUpperCase()}, previewed as MP3</dd>
							<dt className="text-muted-foreground">Licence</dt><dd>{item.license}</dd>
							<dt className="text-muted-foreground">Source</dt><dd><a className="inline-flex items-center gap-1 underline-offset-2 hover:underline" href={item.sourceUrl} target="_blank" rel="noopener noreferrer">Open the original <Icon icon={ArrowUpRight01Icon} size={14} /></a></dd>
							<dt className="text-muted-foreground">Collection</dt><dd>Audio {item.version}</dd>
						</dl>

						<div className="mt-auto flex items-end justify-between gap-4 pt-8">
							<p className="text-xs text-muted-foreground">Are you the creator and want this removed? Email <a className="underline" href={`mailto:${SITE.email}?subject=Audio%20removal%20${item.id}`}>{SITE.email}</a>.</p>
							<div className="flex shrink-0 gap-2">
								<button type="button" className={round} aria-label="Previous clip" disabled={!prev} onClick={() => go(prev)}><Icon icon={ArrowLeft01Icon} size={16} /></button>
								<button type="button" className={round} aria-label="Next clip" disabled={!next} onClick={() => go(next)}><Icon icon={ArrowRight01Icon} size={16} /></button>
							</div>
						</div>
					</div>
	);

	return (
		<D.Root open onOpenChange={(o) => !o && close()}>
			<D.Portal>
				<D.Overlay className="fixed inset-0 z-50 bg-black/45 scrim sheet-overlay vt-overlay" />
				<D.Content asChild aria-describedby="audio-desc" tabIndex={-1} onEscapeKeyDown={(e) => { if (fs) (e.preventDefault(), drawer ? setDrawer(false) : setFs(false)); }}>
					<motion.div initial={false} animate={vp.lg ? dialogSize(vp, fs, 1200, 820) : undefined} transition={GROW} className={`vt-modal fixed inset-0 z-50 flex flex-col overscroll-contain bg-background outline-none lg:inset-auto lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 lg:overflow-hidden lg:shadow-e3 ${fs ? "overflow-hidden" : "overflow-y-auto lg:flex-row"}`}>
						<div ref={scroller} className={fs ? "relative z-0 h-full w-full overflow-y-auto overscroll-contain" : "contents"} onScroll={fs ? (e) => setScrolled(e.currentTarget.scrollTop > 40) : undefined}>
							<div className={fs ? "relative flex h-dvh w-full shrink-0 flex-col justify-end bg-field-3 text-field-3-ink" : "relative flex shrink-0 flex-col bg-surface p-3 lg:min-w-0 lg:flex-1 lg:p-8"}>
								{!fs ? (
									<D.Close asChild>
										<button type="button" aria-label="Close and go back" className="absolute top-3 right-3 z-20 grid size-11 place-items-center rounded-full bg-background/90 text-foreground shadow-md outline-none backdrop-blur focus-visible:ring-2 focus-visible:ring-ring lg:hidden"><Icon icon={Cancel01Icon} size={18} /></button>
									</D.Close>
								) : null}
								<div className={fs ? "absolute inset-0 text-field-3-ink" : "relative h-[34dvh] min-h-[220px] flex-1 overflow-hidden rounded-xl bg-field-3 text-field-3-ink lg:h-auto"}>
									<AudioViz variant={viz} live playing={playing} seed={item.id} className="p-4" />
								</div>
								<div className={fs ? "relative z-10 mx-auto flex w-full max-w-3xl flex-col gap-2 px-4 pb-4" : "contents"}>
						<div role="tablist" aria-label="Visual style" className={`${fs ? "justify-center" : "mt-3"} flex flex-wrap gap-1.5`}>
							{VIZ.map((v) => (
								<button key={v.id} role="tab" type="button" aria-selected={viz === v.id} aria-label={`${v.name} (${v.dim})`} title={`${v.name} · ${v.dim}`} onClick={() => setViz(v.id)} className={`press grid size-10 place-items-center rounded-lg outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring ${viz === v.id ? "bg-primary text-primary-foreground" : "bg-background text-foreground hover:bg-tile-2"}`}>
									{v.icon}
								</button>
							))}
						</div>
									<div className={`flex items-center gap-3 rounded-xl p-3 ${fs ? "glass glass-pop text-foreground" : "mt-3 bg-background"}`}>
										<PlayButton item={item} size="lg" />
										<div className="min-w-0 flex-1">
											<input type="range" aria-label="Seek" min={0} max={limit} step={0.1} value={mine ? Math.min(s.time, limit) : 0} onChange={(e) => (mine ? engine.seek(+e.target.value) : (engine.play(item), engine.seek(+e.target.value)))} className="seek w-full" />
											<div className="tabular mt-1 flex justify-between text-sm text-muted-foreground"><span>{fmtTime(mine ? s.time : 0)}</span><span>{fmtTime(limit)}{item.duration > 90 ? " preview" : ""}</span></div>
										</div>
										<button type="button" onClick={() => engine.toggleMute()} aria-label={s.muted ? "Unmute" : "Mute"} aria-pressed={s.muted} className={tool}><Icon icon={speaker} size={18} /></button>
										<input type="range" min={0} max={100} value={Math.round(vol * 100)} onChange={(e) => engine.setVolume(+e.target.value / 100)} aria-label="Volume" className="seek hidden w-20 shrink-0 sm:block" />
										{fs ? <button type="button" onClick={() => setDrawer((d) => !d)} aria-label={drawer ? "Hide details" : "Show details"} aria-pressed={drawer} className={`${tool} ${drawer ? "bg-tile-2" : ""}`}><Icon icon={SidebarRightIcon} size={18} /></button> : null}
										<button type="button" onClick={() => setFs((f) => !f)} aria-label={fs ? "Exit full screen" : "Full screen"} aria-pressed={fs} className={tool}><Icon icon={fs ? ArrowShrink02Icon : FullScreenIcon} size={18} /></button>
									</div>
									{s.error && mine ? <p className="mt-2 text-sm text-danger">This file would not play in your browser.</p> : null}
								</div>
								{fs && related.length && !scrolled ? <MoreCue label="More like this" className="bottom-44" /> : null}
							</div>
							{fs ? (
								<RelatedSection title="More audio">
									{related.map((g) => <li key={g.id}><AudioCard item={g} search={search} /></li>)}
								</RelatedSection>
							) : null}
							<AnimatePresence initial={false}>
								{!fs ? (
									<motion.div key="details" initial={vp.lg ? { opacity: 0, width: 0 } : { opacity: 0 }} animate={vp.lg ? { opacity: 1, width: 400 } : { opacity: 1 }} exit={vp.lg ? { opacity: 0, width: 0 } : { opacity: 0 }} transition={GROW} className="flex w-full shrink-0 flex-col overflow-hidden lg:overflow-visible">
										{renderDetails(false)}
									</motion.div>
								) : null}
							</AnimatePresence>
						</div>
						{fs ? <FsControls onExit={() => setFs(false)} onDrawer={() => setDrawer((d) => !d)} drawerOpen={drawer} /> : null}
						<FsDrawer open={fs && drawer} onClose={() => setDrawer(false)}>{renderDetails(true)}</FsDrawer>
					</motion.div>
				</D.Content>
			</D.Portal>
		</D.Root>
	);
}
