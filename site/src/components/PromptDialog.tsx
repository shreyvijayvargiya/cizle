import { Link, useNavigate } from "@tanstack/react-router";
import { Dialog as D } from "radix-ui";
import { Cancel01Icon, LinkSquare02Icon, LockIcon } from "@hugeicons/core-free-icons";
import { useState } from "react";
import { CopyButton } from "@/components/CopyButton";
import { Icon } from "@/components/Icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/misc";
import { useAuth } from "@/lib/auth";
import { fromLabel } from "@/lib/billing";
import { SITE } from "@/lib/config";
import { usePromptText, type GalleryFilters, type GalleryItem } from "@/lib/gallery";
import { useHead } from "@/lib/head";

/**
 * One gallery prompt over the list (the URL is /gallery?p=<id>). Free samples show in full. For the rest everyone sees the credit,
 * the links to the original post and a preview; the full text and copy button belong to subscribers.
 */
export function PromptDialog({ item, search, base = "/gallery" }: { item: GalleryItem; search: GalleryFilters; base?: "/" | "/gallery" }) {
	const navigate = useNavigate();
	const { isPro, user } = useAuth();
	const full = usePromptText(item, isPro);
	const text = item.text ?? full.data;
	const close = () => navigate({ to: base, search: { ...search, p: undefined } as never, resetScroll: false });
	const [videoBad, setVideoBad] = useState(false);
	const [posterBad, setPosterBad] = useState(false);
	const locked = !text && !isPro;

	useHead({ title: `${item.title} | cizle prompt gallery`, description: item.preview.slice(0, 180), path: base, noindex: true });

	return (
		<D.Root open onOpenChange={(o) => !o && close()}>
			<D.Portal>
				<D.Overlay className="fixed inset-0 z-50 bg-black/45  data-[state=open]:animate-[fade-in_.15s_ease-out]" />
				<D.Content
					className="fixed inset-x-0 bottom-0 z-50 flex max-h-[94dvh] flex-col overflow-hidden rounded-t-2xl border border-border bg-background shadow-2xl outline-none sm:inset-x-auto sm:top-[4vh] sm:bottom-auto sm:left-1/2 sm:max-h-[92dvh] sm:w-[min(52rem,calc(100vw-2rem))] sm:-translate-x-1/2 sm:rounded-lg sm:[animation:pop-in_.18s_ease-out]"
					aria-describedby="prompt-desc"
					tabIndex={-1}
				>
					<div className="flex items-center justify-between gap-3 border-b border-border bg-surface px-4 py-2.5">
						<div className="min-w-0">
							<D.Title asChild>
								<h1 className="truncate text-base font-semibold tracking-tight sm:text-lg">{item.title}</h1>
							</D.Title>
							<D.Description id="prompt-desc" className="sr-only">
								Video prompt by {item.handle ? `@${item.handle}` : item.author || "the creator"}
							</D.Description>
						</div>
						<D.Close asChild>
							<Button variant="ghost" size="icon" aria-label="Close and go back to the gallery">
								<Icon icon={Cancel01Icon} size={16} />
							</Button>
						</D.Close>
					</div>

					<div className="flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:px-6">
						<div className="flex flex-wrap items-center gap-2 text-sm">
							<span className="text-muted-foreground">Prompt by</span>
							{item.handle ? (
								<a className="font-medium underline-offset-2 hover:underline" href={`https://x.com/${item.handle}`} target="_blank" rel="noopener noreferrer">
									@{item.handle}
								</a>
							) : (
								<span className="font-medium">{item.author || "the creator"}</span>
							)}
							{item.tier === "free" ? <Badge tone="success">Free sample</Badge> : <Badge tone="warning"><Icon icon={LockIcon} size={11} /> Pro</Badge>}
							{item.category ? <Badge tone="outline">{item.category}</Badge> : null}
							{item.model ? <Badge tone="outline">{item.model}</Badge> : null}
							{item.translatedFrom ? <Badge tone="outline">Translated from {item.translatedFrom}</Badge> : null}
						</div>

						{item.video && !videoBad ? (
							<video key={item.video} controls autoPlay muted loop playsInline preload="auto" poster={item.poster || undefined} onError={() => setVideoBad(true)} className="mt-4 max-h-[52dvh] w-full rounded-lg border border-border bg-black">
								<source src={item.video} type="video/mp4" onError={() => setVideoBad(true)} />
							</video>
						) : item.poster && !posterBad ? (
							<img src={item.poster} alt="" referrerPolicy="no-referrer" onError={() => setPosterBad(true)} className="mt-4 max-h-72 w-full rounded-lg border border-border object-cover" />
						) : null}
						{item.video && videoBad ? <p className="mt-2 text-xs text-muted-foreground">The video did not load here. Use the link to the original post to watch it.</p> : null}

						<div className="mt-4 flex flex-wrap gap-2">
							{item.postUrl ? (
								<Button variant="outline" size="sm" asChild>
									<a href={item.postUrl} target="_blank" rel="noopener noreferrer"><Icon icon={LinkSquare02Icon} size={14} /> {item.video ? "Original post" : item.hasVideo ? "Watch the original post and video" : "Original post"}</a>
								</Button>
							) : null}
							{item.sourceUrl ? (
								<Button variant="outline" size="sm" asChild>
									<a href={item.sourceUrl} target="_blank" rel="noopener noreferrer"><Icon icon={LinkSquare02Icon} size={14} /> Source page</a>
								</Button>
							) : null}
						</div>

						<h2 className="mt-6 text-sm font-semibold">Prompt</h2>
						{text ? (
							<pre className="mt-2 max-h-[46dvh] overflow-auto rounded-lg border border-border bg-muted/50 p-3 text-xs leading-relaxed whitespace-pre-wrap">{text}</pre>
						) : locked ? (
							<div className="relative mt-2 overflow-hidden rounded-lg border border-border bg-muted/50 p-3">
								<p className="text-xs leading-relaxed whitespace-pre-wrap">{item.preview}</p>
								<div aria-hidden className="mt-2 space-y-2 select-none blur-[5px]">
									<div className="h-3 w-full rounded bg-foreground/15" />
									<div className="h-3 w-11/12 rounded bg-foreground/15" />
									<div className="h-3 w-4/5 rounded bg-foreground/15" />
								</div>
								<div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-background/80" />
							</div>
						) : full.isError ? (
							<p className="mt-2 rounded-lg border border-border bg-muted/50 p-3 text-sm text-muted-foreground">{(full.error as Error).message}</p>
						) : (
							<Skeleton className="mt-2 h-40" />
						)}
						{item.partial ? <p className="mt-2 text-xs text-muted-foreground">The creator shared only part of this prompt.</p> : null}
						<p className="mt-1 text-xs text-muted-foreground">{item.chars.toLocaleString()} characters</p>

						{locked ? (
							<div className="mt-5 rounded-lg border border-border bg-surface p-4 text-center">
								<p className="font-medium">Unlock the full prompt</p>
								<p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">Premium shows the full text of every gallery prompt and lets you copy it into Claude Code. from {fromLabel("USD")} a month, cancel any time.</p>
								<Button className="mt-3" asChild>
									{user ? <Link to="/pricing">See Premium</Link> : <Link to="/login" search={{ next: "/pricing" }}>Sign in to unlock</Link>}
								</Button>
							</div>
						) : null}

						<p className="mt-6 text-xs text-muted-foreground">
							This prompt belongs to its creator and is listed with credit and a link to the original. Are you the creator and want it changed or removed? Email{" "}
							<a className="underline" href={`mailto:${SITE.email}?subject=Gallery%20removal%20${item.id}`}>
								{SITE.email}
							</a>{" "}
							with this prompt's link.
						</p>
					</div>

					<div className="flex items-center justify-between gap-3 border-t border-border bg-surface px-4 py-3 sm:px-6">
						<p className="hidden min-w-0 truncate text-sm text-muted-foreground sm:block">{item.title}</p>
						<div className="flex flex-wrap justify-end gap-2">{text ? <CopyButton text={text} label="Copy prompt" done="Prompt copied" variant="default" /> : null}</div>
					</div>
				</D.Content>
			</D.Portal>
		</D.Root>
	);
}
