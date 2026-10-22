import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";
import { SITE } from "@/lib/config";

const COL = "text-sm text-muted-foreground transition-colors hover:text-foreground";

export function Footer() {
	return (
		<footer className="mt-20 border-t border-border bg-surface">
			<div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_repeat(3,1fr)]">
				<div>
					<Logo />
					<p className="mt-3 max-w-xs text-sm text-muted-foreground">Video skills and prompts for Claude Code. Give it your product link, get an animated MP4 rendered on your own machine.</p>
				</div>
				<nav aria-label="Product" className="flex flex-col gap-2">
					<h2 className="mb-1 text-xs font-semibold tracking-wide text-foreground uppercase">Product</h2>
					<Link to="/" className={COL}>Skills library</Link>
					<Link to="/gallery" className={COL}>Prompt gallery</Link>
					<Link to="/pricing" className={COL}>Pricing</Link>
					<Link to="/docs" className={COL}>Docs</Link>
					<Link to="/blog" className={COL}>Blog</Link>
				</nav>
				<nav aria-label="Company" className="flex flex-col gap-2">
					<h2 className="mb-1 text-xs font-semibold tracking-wide text-foreground uppercase">Company</h2>
					<Link to="/faq" className={COL}>FAQ</Link>
					<Link to="/contact" className={COL}>Contact</Link>
					<a href={SITE.github} target="_blank" rel="noreferrer" className={COL}>GitHub</a>
					{SITE.x ? <a href={SITE.x} target="_blank" rel="noreferrer" className={COL}>X</a> : null}
				</nav>
				<nav aria-label="Legal" className="flex flex-col gap-2">
					<h2 className="mb-1 text-xs font-semibold tracking-wide text-foreground uppercase">Legal</h2>
					<Link to="/terms" className={COL}>Terms</Link>
					<Link to="/privacy" className={COL}>Privacy</Link>
					<Link to="/refund" className={COL}>Refunds</Link>
				</nav>
			</div>
			<div className="border-t border-border">
				<div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-4 text-xs text-muted-foreground sm:px-6">
					<p>© {new Date().getFullYear()} cizle. Payments by Dodo Payments.</p>
					<p>Made for founders who would rather ship than edit video.</p>
				</div>
			</div>
		</footer>
	);
}
