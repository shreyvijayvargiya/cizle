import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/Icon";
import { Skeleton } from "@/components/ui/misc";
import { usePage } from "@/lib/data";
import { useHead } from "@/lib/head";
import { cn } from "@/lib/utils";

type Chapter = { id: string; title: string };

/** The chapter whose heading was last scrolled past (the one the reader is in). */
function useActiveChapter(chapters: Chapter[]) {
	const [active, setActive] = useState("");
	useEffect(() => {
		if (!chapters.length) return;
		setActive((a) => (chapters.some((c) => c.id === a) ? a : chapters.find((c) => c.id === location.hash.slice(1))?.id ?? chapters[0].id));
		const els = chapters.map((c) => document.getElementById(c.id)).filter((e): e is HTMLElement => Boolean(e));
		const io = new IntersectionObserver(
			(entries) => {
				const seen = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
				if (seen) setActive(seen.target.id);
			},
			{ rootMargin: "-90px 0px -65% 0px" },
		);
		els.forEach((e) => io.observe(e));
		return () => io.disconnect();
	}, [chapters]);
	return [active, setActive] as const;
}

const MORE: { to: string; label: string }[] = [
	{ to: "/connect", label: "Use in Claude (MCP)" },
	{ to: "/gallery", label: "Prompt gallery" },
	{ to: "/faq", label: "FAQ" },
	{ to: "/contact", label: "Contact" },
];

function Chapters({ chapters, active, onPick }: { chapters: Chapter[]; active: string; onPick: (id: string) => void }) {
	return (
		<ul className="space-y-0.5">
			{chapters.map((c) => (
				<li key={c.id}>
					<a href={`#${c.id}`} onClick={() => onPick(c.id)} aria-current={active === c.id ? "true" : undefined} className={cn("block rounded-md px-3 py-2 text-base transition-colors", active === c.id ? "bg-field-1 font-medium text-field-1-ink" : "text-foreground hover:bg-tile-2")}>
						{c.title}
					</a>
				</li>
			))}
		</ul>
	);
}

/** Long-form markdown pages (docs and legal): prerendered at build, so crawlers and AI assistants get the text without running JS. With `toc` (the docs) the chapters become a sidebar on the left and the text sits in the centre. */
export function ContentPage({ name, path, title, description, toc = false, noindex }: { name: "docs" | "terms" | "privacy" | "refund" | "rights"; path: string; title: string; description: string; toc?: boolean; noindex?: boolean }) {
	const page = usePage(name);
	useHead({ title, description, path, noindex });
	const chapters = useMemo<Chapter[]>(() => (toc && page.data ? page.data.toc : []), [toc, page.data]);
	const [active, setActive] = useActiveChapter(chapters);
	const at = chapters.findIndex((c) => c.id === active);
	const prev = at > 0 ? chapters[at - 1] : undefined;
	const next = at >= 0 ? chapters[at + 1] : undefined;

	const body = (
		<article className="prose-cizle prose-docs reveal mx-auto w-full min-w-0 max-w-3xl !text-base">
			{page.isLoading ? (
				<div className="space-y-3"><Skeleton className="h-8 w-2/3" /><Skeleton className="h-4" /><Skeleton className="h-4" /><Skeleton className="h-40" /></div>
			) : page.data ? (
				<>
					<h1>{page.data.title}</h1>
					<div dangerouslySetInnerHTML={{ __html: page.data.html }} />
					{toc && (prev || next) ? (
						<nav aria-label="Chapters" className="not-prose mt-12 grid gap-2 sm:grid-cols-2">
							{prev ? (
								<a href={`#${prev.id}`} onClick={() => setActive(prev.id)} className="press tile flex flex-col gap-1 p-4 text-left no-underline hover:bg-tile-2">
									<span className="flex items-center gap-1 text-sm text-muted-foreground"><Icon icon={ArrowLeft01Icon} size={14} /> Previous</span>
									<span className="text-lg font-medium text-foreground">{prev.title}</span>
								</a>
							) : <span />}
							{next ? (
								<a href={`#${next.id}`} onClick={() => setActive(next.id)} className="press tile flex flex-col gap-1 p-4 text-right no-underline hover:bg-tile-2 sm:col-start-2">
									<span className="flex items-center justify-end gap-1 text-sm text-muted-foreground">Next <Icon icon={ArrowRight01Icon} size={14} /></span>
									<span className="text-lg font-medium text-foreground">{next.title}</span>
								</a>
							) : null}
						</nav>
					) : null}
				</>
			) : (
				<p>We could not load this page. <Link to="/">Back home</Link>.</p>
			)}
		</article>
	);

	if (!toc) return <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">{body}</div>;
	return (
		<div className="board-w board grid gap-8 py-10 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-12">
			<aside className="lg:self-start">
				<nav aria-label="Docs chapters" className="lg:sticky lg:top-24 lg:max-h-[calc(100dvh-7rem)] lg:overflow-y-auto">
					{/* phones: the chapters fold away above the text */}
					<details className="tile lg:hidden">
						<summary className="cursor-pointer list-none px-4 py-3 text-lg font-medium [&::-webkit-details-marker]:hidden">Chapters</summary>
						<div className="px-2 pb-3"><Chapters chapters={chapters} active={active} onPick={setActive} /></div>
					</details>
					<div className="hidden lg:block">
						<p className="px-3 pb-2 text-sm font-medium tracking-wide text-muted-foreground uppercase">Docs</p>
						<Chapters chapters={chapters} active={active} onPick={setActive} />
						<p className="mt-6 px-3 pb-2 text-sm font-medium tracking-wide text-muted-foreground uppercase">More</p>
						<ul className="space-y-0.5">
							{MORE.map((m) => (
								<li key={m.to}><Link to={m.to as "/"} className="block rounded-md px-3 py-2 text-base text-foreground transition-colors hover:bg-tile-2">{m.label}</Link></li>
							))}
						</ul>
					</div>
				</nav>
			</aside>
			{body}
		</div>
	);
}
