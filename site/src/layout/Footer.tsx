import { Link } from "@tanstack/react-router";
import { SITE } from "@/lib/config";

const LINK = "press block py-1 text-base text-foreground transition-opacity hover:opacity-70";
/** The mark returns at full width, each letter knocked out of its own block; heights differ, bottoms share one line. */
const BLOCKS: { letter: string; h: string; field: string }[] = [
	{ letter: "c", h: "78%", field: "bg-field-1 text-field-1-ink" },
	{ letter: "i", h: "100%", field: "bg-field-2 text-field-2-ink" },
	{ letter: "z", h: "64%", field: "bg-field-3 text-field-3-ink" },
	{ letter: "l", h: "90%", field: "bg-field-1 text-field-1-ink" },
	{ letter: "e", h: "72%", field: "bg-field-2 text-field-2-ink" },
];

export function Footer() {
	return (
		<footer className="board mt-40 pb-3">
			<div className="board-w">
				<div aria-hidden className="flex h-[34svh] min-h-[220px] items-end gap-1">
					{BLOCKS.map((b) => (
						<div key={b.letter} className={`reveal flex items-end justify-center overflow-hidden rounded-lg ${b.field}`} style={{ height: b.h, flex: b.letter === "i" || b.letter === "l" ? 0.6 : 1 }}>
							<span className="display leading-[0.78]" style={{ fontSize: "clamp(5rem, 24vw, 22rem)", marginBottom: "-0.02em" }}>
								{b.letter}
							</span>
						</div>
					))}
				</div>
				<p className="sr-only">cizle</p>

				<div className="grid gap-10 px-1 pt-14 pb-12 md:grid-cols-12">
					<p className="statement reveal max-w-[24ch] md:col-span-12 lg:col-span-4">Video prompts and skills for Claude, each with the demo video it made.</p>
					<nav aria-label="Product" className="reveal md:col-span-4 lg:col-span-2 lg:col-start-6" style={{ ["--i" as string]: 1 }}>
						<p className="mb-2 text-lg font-semibold">Product</p>
						<Link to="/" className={LINK}>Skills and prompts</Link>
						<Link to="/gallery" className={LINK}>Prompt gallery</Link>
						<Link to="/connect" className={LINK}>Use in Claude (MCP)</Link>
						<Link to="/films" className={LINK}>Launch films</Link>
						<Link to="/pricing" className={LINK}>Pricing</Link>
						<Link to="/docs" className={LINK}>Docs</Link>
						<Link to="/blog" className={LINK}>Blog</Link>
					</nav>
					<nav aria-label="Company" className="reveal md:col-span-4 lg:col-span-2" style={{ ["--i" as string]: 2 }}>
						<p className="mb-2 text-lg font-semibold">Company</p>
						<Link to="/faq" className={LINK}>FAQ</Link>
						<Link to="/contact" className={LINK}>Contact</Link>
						<a href={SITE.github} target="_blank" rel="noreferrer" className={LINK}>GitHub</a>
						{SITE.x ? <a href={SITE.x} target="_blank" rel="noreferrer" className={LINK}>X</a> : null}
					</nav>
					<nav aria-label="Legal" className="reveal md:col-span-4 lg:col-span-2" style={{ ["--i" as string]: 3 }}>
						<p className="mb-2 text-lg font-semibold">Legal</p>
						<Link to="/terms" className={LINK}>Terms</Link>
						<Link to="/privacy" className={LINK}>Privacy</Link>
						<Link to="/refund" className={LINK}>Refunds</Link>
					</nav>
				</div>

				<div className="flex flex-wrap items-center justify-between gap-3 px-1 pb-2 text-base">
					<p>© {new Date().getFullYear()} cizle. Payments by Dodo Payments. Prompts belong to their creators and are credited on every card.</p>
					<a href="#main" className="press rounded-lg bg-primary px-4 py-2 text-base text-primary-foreground hover:bg-primary/85">
						Back to top
					</a>
				</div>
			</div>
		</footer>
	);
}
