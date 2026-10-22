import { Link } from "@tanstack/react-router";
import { Skeleton } from "@/components/ui/misc";
import { usePage } from "@/lib/data";
import { useHead } from "@/lib/head";

/** Long-form markdown pages (docs and legal): prerendered at build, so crawlers and AI assistants get the text without running JS. */
export function ContentPage({ name, path, title, description, toc = false, noindex }: { name: "docs" | "terms" | "privacy" | "refund"; path: string; title: string; description: string; toc?: boolean; noindex?: boolean }) {
	const page = usePage(name);
	useHead({ title, description, path, noindex });
	return (
		<div className={toc ? "board-w board grid gap-10 py-10 lg:grid-cols-[1fr_16rem]" : "mx-auto w-full max-w-3xl px-4 py-12 sm:px-6"}>
			<article className="prose-cizle prose-docs reveal min-w-0 !text-base">
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
					<nav aria-label="On this page" className="sticky top-24">
						<p className="mb-3 text-lg font-semibold">On this page</p>
						<ul className="space-y-2 rounded-lg bg-surface p-4">
							{page.data.toc.map((t) => (
								<li key={t.id}><a href={`#${t.id}`} className="text-base text-foreground transition-opacity hover:opacity-70">{t.title}</a></li>
							))}
						</ul>
					</nav>
				</aside>
			) : null}
		</div>
	);
}
