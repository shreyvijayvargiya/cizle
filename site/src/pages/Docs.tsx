import { Link } from "@tanstack/react-router";
import { Skeleton } from "@/components/ui/misc";
import { usePage } from "@/lib/data";
import { useHead } from "@/lib/head";

/** Long-form markdown pages (docs and legal): prerendered at build, so crawlers and AI assistants get the text without running JS. */
export function ContentPage({ name, path, title, description, toc = false, noindex }: { name: "docs" | "terms" | "privacy" | "refund"; path: string; title: string; description: string; toc?: boolean; noindex?: boolean }) {
	const page = usePage(name);
	useHead({ title, description, path, noindex });
	return (
		<div className={toc ? "mx-auto grid w-full max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_14rem]" : "mx-auto w-full max-w-3xl px-4 py-12 sm:px-6"}>
			<article className="prose-cizle prose-docs min-w-0 !text-[15px]">
				{page.isLoading ? (
					<div className="space-y-3"><Skeleton className="h-8 w-2/3" /><Skeleton className="h-4" /><Skeleton className="h-4" /><Skeleton className="h-40" /></div>
				) : page.data ? (
					<>
						<h1>{page.data.title}</h1>
						<div dangerouslySetInnerHTML={{ __html: page.data.html }} />
					</>
				) : (
					<p>We could not load this page. <Link to="/">Back home</Link>.</p>
				)}
			</article>
			{toc && page.data ? (
				<aside className="hidden lg:block">
					<nav aria-label="On this page" className="sticky top-24 text-sm">
						<p className="mb-2 text-xs font-semibold tracking-wide text-foreground uppercase">On this page</p>
						<ul className="space-y-1.5 border-l border-border pl-3">
							{page.data.toc.map((t) => (
								<li key={t.id}><a href={`#${t.id}`} className="text-muted-foreground transition-colors hover:text-foreground">{t.title}</a></li>
							))}
						</ul>
					</nav>
				</aside>
			) : null}
		</div>
	);
}
