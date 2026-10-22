import { Link } from "@tanstack/react-router";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/Icon";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/misc";
import { usePost, usePosts, useSkill } from "@/lib/data";
import { useHead } from "@/lib/head";
import { postJsonLd } from "@/lib/seo";
import { CopyButton } from "@/components/CopyButton";
import { Button } from "@/components/ui/button";

const fmtDate = (d: string) => new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

export function BlogPage() {
	const posts = usePosts();
	useHead({ title: "Blog: video prompts, Claude Code skills and ad formats | cizle", description: "Guides and examples for making product, launch and ad videos with Claude Code: video types every SaaS needs, ad formats for Meta, TikTok and Google, and how skills work.", path: "/blog" });
	return (
		<div className="board-w px-[var(--margin)] py-12 sm:py-16">
			<h1 className="display" style={{ fontSize: "clamp(2.75rem, 6.4vw, 5.75rem)", maxWidth: "14ch" }}>Guides for making videos with Claude</h1>
			<p className="mt-4 max-w-xl text-lg">Worked examples for making product, launch and ad videos with Claude Code and cizle skills.</p>
			<div className="mt-8 grid gap-4">
				{posts.isLoading ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32" />) : (posts.data || []).map((p) => (
					<article key={p.slug} className="reveal group relative rounded-lg border border-border bg-surface p-5 transition-colors hover:bg-tile-2 sm:p-6">
						<div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
							<time dateTime={p.date}>{fmtDate(p.date)}</time>·<span>{p.minutes} min read</span>
							{p.tags.slice(0, 2).map((t) => <Badge key={t} tone="outline">{t}</Badge>)}
						</div>
						<h2 className="mt-2 text-lg font-semibold tracking-tight text-balance">
							<Link to="/blog/$slug" params={{ slug: p.slug }} className="after:absolute after:inset-0 after:rounded-lg">{p.title}</Link>
						</h2>
						<p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{p.description}</p>
						<p className="mt-3 inline-flex items-center gap-1 text-sm font-medium">Read article →</p>
					</article>
				))}
			</div>
		</div>
	);
}

export function BlogPostPage({ slug }: { slug: string }) {
	const post = usePost(slug);
	const p = post.data;
	const skill = useSkill(p?.skill || undefined);
	useHead({ title: p ? `${p.title} | cizle` : "Article | cizle", description: p?.description || "", path: `/blog/${slug}`, jsonLd: p ? postJsonLd(p) : undefined });
	if (post.isLoading) return <div className="mx-auto max-w-3xl space-y-3 px-4 py-12"><Skeleton className="h-9 w-3/4" /><Skeleton className="h-4" /><Skeleton className="h-64" /></div>;
	if (!p) return <div className="mx-auto max-w-3xl px-4 py-24 text-center"><p className="font-medium">We could not find that article.</p><Button asChild className="mt-4"><Link to="/blog">All articles</Link></Button></div>;
	return (
		<article className="board-w max-w-3xl px-[var(--margin)] py-12 sm:py-16">
			<nav aria-label="Breadcrumb" className="text-xs text-muted-foreground"><Link to="/blog" className="hover:text-foreground">Blog</Link> / <span>{p.title}</span></nav>
			<header className="mt-4">
				<h1 className="display" style={{ fontSize: "clamp(2.5rem, 5.5vw, 5rem)" }}>{p.title}</h1>
				<p className="mt-3 text-base leading-relaxed text-muted-foreground">{p.description}</p>
				<p className="mt-3 text-xs text-muted-foreground"><time dateTime={p.date}>{fmtDate(p.date)}</time> · {p.minutes} min read · by the cizle team</p>
			</header>
			<div className="prose-cizle prose-docs mt-8 !text-base" dangerouslySetInnerHTML={{ __html: p.html || "" }} />
			{skill.data ? (
				<aside aria-label="Try the skill" className="mt-10 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-surface p-5">
					<div>
						<p className="text-sm font-semibold">Try it: {skill.data.name}</p>
						<p className="mt-0.5 max-w-md text-xs text-muted-foreground">{skill.data.summary}</p>
					</div>
					<div className="flex gap-2">
						<Button asChild><Link to="/skills/$slug" params={{ slug: skill.data.slug }}>Open skill</Link></Button>
						{!skill.data.locked ? <CopyButton text={skill.data.cli} label="Copy install" done="Install command copied" /> : null}
					</div>
				</aside>
			) : null}
		</article>
	);
}
