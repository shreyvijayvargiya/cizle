import { useEffect, useMemo, useState } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import guide from "@/content/guide.md?raw";
import { cn } from "@/lib/utils";

const slug = (s: string) =>
	s
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");

const text = (children: React.ReactNode): string => (Array.isArray(children) ? children.map(text).join("") : typeof children === "string" ? children : typeof children === "object" && children && "props" in children ? text((children as { props: { children?: React.ReactNode } }).props.children) : "");

/** Headings from the markdown (## and ###), for the side table of contents. */
function headings(md: string) {
	let inCode = false;
	const out: { level: 2 | 3; title: string; id: string }[] = [];
	for (const line of md.split("\n")) {
		if (line.startsWith("```")) inCode = !inCode;
		const m = !inCode && /^(##|###) (.+)$/.exec(line);
		if (m) out.push({ level: m[1].length as 2 | 3, title: m[2].replace(/[`*]/g, ""), id: slug(m[2].replace(/[`*]/g, "")) });
	}
	return out;
}

const components: Components = {
	h2: ({ children }) => <h2 id={slug(text(children))}>{children}</h2>,
	h3: ({ children }) => <h3 id={slug(text(children))}>{children}</h3>,
	a: ({ href, children }) => (
		<a href={href} {...(href?.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}>
			{children}
		</a>
	),
};

/** The one docs route: how to get started and how everything works, rendered from web/src/content/guide.md. */
export function DocsPage() {
	const toc = useMemo(() => headings(guide), []);
	const [active, setActive] = useState("");
	useEffect(() => {
		const els = toc.map((h) => document.getElementById(h.id)).filter(Boolean) as HTMLElement[];
		const io = new IntersectionObserver((entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)), { rootMargin: "-80px 0px -70% 0px" });
		els.forEach((el) => io.observe(el));
		return () => io.disconnect();
	}, [toc]);
	// Land on a heading when the URL has a hash (/docs#claude-code-and-mcp).
	useEffect(() => {
		const id = decodeURIComponent(window.location.hash.slice(1));
		if (id) setTimeout(() => document.getElementById(id)?.scrollIntoView(), 50);
	}, []);
	return (
		<div className="mx-auto flex w-full max-w-6xl gap-10 px-4 py-6 sm:px-6 sm:py-8">
			<article className="prose-cizle prose-docs min-w-0 flex-1" style={{ fontSize: "0.9rem" }}>
				<ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
					{guide}
				</ReactMarkdown>
			</article>
			<nav aria-label="On this page" className="sticky top-6 hidden h-fit max-h-[calc(100vh-3rem)] w-56 shrink-0 overflow-y-auto text-[13px] lg:block">
				<p className="mb-2 text-xs font-medium text-muted-foreground">On this page</p>
				<ul className="space-y-0.5 border-l border-border">
					{toc.map((h) => (
						<li key={h.id}>
							<a
								href={`#${h.id}`}
								onClick={(e) => {
									e.preventDefault();
									document.getElementById(h.id)?.scrollIntoView({ behavior: "smooth" });
									history.replaceState(null, "", `#${h.id}`);
								}}
								className={cn("block border-l -ml-px py-0.5 pl-3 transition-colors", h.level === 3 && "pl-6 text-[12px]", active === h.id ? "border-brand font-medium text-foreground" : "border-transparent text-muted-foreground hover:text-foreground")}
							>
								{h.title}
							</a>
						</li>
					))}
				</ul>
			</nav>
		</div>
	);
}
