import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { Dialog as D } from "radix-ui";
import { ArrowLeft01Icon, ArrowRight01Icon, Cancel01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/Icon";
import { SaveButtons } from "@/components/SaveButtons";
import { SkillActions, SkillContent } from "@/components/SkillContent";
import { Button } from "@/components/ui/button";
import { Skeleton, Tip } from "@/components/ui/misc";
import { skillQuery, useSkill, type Filters, type SkillMeta } from "@/lib/data";
import { SITE } from "@/lib/config";
import { useHead } from "@/lib/head";
import { statsKey, useRecordView } from "@/lib/stats";
import { skillJsonLd } from "@/lib/seo";

/**
 * A single skill as a modal over the list. The URL is /skills/<slug>, so it can be shared, opened in a new tab (where it is a
 * full prerendered page) and closed back to the same filtered list. Arrow keys and the top-right arrows walk the list.
 */
export function SkillDialog({ slug, list, search, onClose, onGo }: { slug: string; list: SkillMeta[]; search: Filters; onClose?: () => void; onGo?: (s: SkillMeta) => void }) {
	const navigate = useNavigate();
	const qc = useQueryClient();
	const q = useSkill(slug);
	const recordView = useRecordView();
	useEffect(() => recordView(statsKey(`s:${slug}`)), [slug]); // eslint-disable-line react-hooks/exhaustive-deps
	const idx = list.findIndex((s) => s.slug === slug);
	const prev = idx > 0 ? list[idx - 1] : null;
	const next = idx >= 0 && idx < list.length - 1 ? list[idx + 1] : null;
	const close = () => (onClose ? onClose() : navigate({ to: "/", search, resetScroll: false }));
	const go = (s: SkillMeta | null) => s && (onGo ? onGo(s) : navigate({ to: "/skills/$slug", params: { slug: s.slug }, search, replace: true, resetScroll: false }));

	// Warm the neighbours so the arrows feel instant.
	useEffect(() => {
		for (const n of [prev, next]) if (n) qc.prefetchQuery(skillQuery(n.slug));
	}, [prev, next, qc]);

	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if ((e.target as HTMLElement)?.closest("input, textarea, select, [role=combobox], [cmdk-root]")) return;
			if (e.key === "ArrowLeft") go(prev);
			if (e.key === "ArrowRight") go(next);
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	});

	const s = q.data;
	useHead({
		title: s ? `${s.name} skill for Claude Code | cizle` : "Skill | cizle",
		description: s ? s.summary : SITE.description,
		path: `/skills/${slug}`,
		jsonLd: s ? skillJsonLd(s) : undefined,
	});

	return (
		<D.Root open onOpenChange={(o) => !o && close()}>
			<D.Portal>
				<D.Overlay className="fixed inset-0 z-50 bg-black/45 scrim sheet-overlay vt-overlay" />
				<D.Content
					className="vt-modal fixed inset-x-0 bottom-0 z-50 flex max-h-[94dvh] flex-col sheet-up overflow-hidden rounded-t-3xl border border-border bg-background shadow-e3 outline-none sm:inset-x-auto sm:top-[4vh] sm:bottom-auto sm:left-1/2 sm:max-h-[92dvh] sm:w-[min(60rem,calc(100vw-2rem))] sm:-translate-x-1/2 sm:rounded-2xl sm:[animation:pop-in_.2s_cubic-bezier(0.23,1,0.32,1)]"
					aria-describedby="skill-desc"
					onOpenAutoFocus={(e) => {
						// Land on the dialog itself, not on the first arrow (which would pop its tooltip open).
						e.preventDefault();
						(e.currentTarget as HTMLElement).focus();
					}}
					tabIndex={-1}
				>
					<div className="flex items-center justify-between gap-3 border-b border-border bg-surface px-4 py-2.5">
						<div className="min-w-0">
							<D.Title asChild>
								<h1 title={s?.name} className="truncate text-base font-semibold tracking-tight sm:text-lg">{s?.name || "Loading skill…"}</h1>
							</D.Title>
							<D.Description id="skill-desc" className="sr-only">
								{s?.summary || "Skill details"}
							</D.Description>
						</div>
						<div className="flex shrink-0 items-center gap-1">
							{idx >= 0 ? (
								<span className="mr-1 hidden text-xs text-muted-foreground tabular-nums sm:inline">
									{idx + 1} / {list.length}
								</span>
							) : null}
							<Tip label="Previous skill (←)">
								<Button variant="outline" size="icon" disabled={!prev} onClick={() => go(prev)} aria-label="Previous skill">
									<Icon icon={ArrowLeft01Icon} size={16} />
								</Button>
							</Tip>
							<Tip label="Next skill (→)">
								<Button variant="outline" size="icon" disabled={!next} onClick={() => go(next)} aria-label="Next skill">
									<Icon icon={ArrowRight01Icon} size={16} />
								</Button>
							</Tip>
							<SaveButtons id={`s:${slug}`} className="mr-1" />
							<D.Close asChild>
								<Button variant="ghost" size="icon" aria-label="Close and go back to all skills">
									<Icon icon={Cancel01Icon} size={16} />
								</Button>
							</D.Close>
						</div>
					</div>
					<div className="flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:px-6">
						{q.isLoading ? (
							<div className="space-y-4">
								<Skeleton className="h-6 w-2/3" />
								<Skeleton className="h-4 w-full" />
								<Skeleton className="h-64" />
								<Skeleton className="h-40" />
							</div>
						) : q.isError || !s ? (
							<div className="py-16 text-center">
								<p className="font-medium">We could not find that skill.</p>
								<Button variant="outline" className="mt-4" asChild>
									<Link to="/">Back to all skills</Link>
								</Button>
							</div>
						) : (
							<SkillContent skill={s} />
						)}
					</div>
					{s ? (
						<div className="flex items-center justify-between gap-3 border-t border-border bg-surface px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-6">
							<p className="hidden min-w-0 truncate text-sm text-muted-foreground sm:block">{s.name}</p>
							<SkillActions skill={s} className="flex flex-wrap justify-end gap-2" />
						</div>
					) : null}
				</D.Content>
			</D.Portal>
		</D.Root>
	);
}
