import { Link } from "@tanstack/react-router";
import { CopyButton } from "@/components/CopyButton";
import { Button } from "@/components/ui/button";
import { SITE } from "@/lib/config";
import { useHead } from "@/lib/head";

const STEPS = `git clone ${SITE.github}
cd cizle
npm install
npm start`;

/** The studio is the local dashboard that renders the videos. It runs on your machine, so this page only explains how to open it. */
export function StudioPage() {
	useHead({ title: "Studio: run the cizle dashboard locally | cizle", description: "cizle renders videos on your own machine. Start the local studio dashboard to browse prompts, create videos and see every render.", path: "/dashboard" });
	return (
		<div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
			<h1 className="text-3xl font-semibold tracking-tight">Studio</h1>
			<p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">The cizle studio is the dashboard where videos are rendered and kept. It runs on your own machine, so your product links and videos never leave it. The skills on this site tell Claude Code what to make; the studio makes it.</p>
			<h2 className="mt-8 text-sm font-semibold">Start it</h2>
			<pre className="mt-2 overflow-auto rounded-lg border border-border bg-muted/50 p-3 font-mono text-[12.5px] leading-relaxed">{STEPS}</pre>
			<div className="mt-3 flex flex-wrap gap-2">
				<CopyButton text={STEPS} label="Copy commands" done="Commands copied" />
				<Button variant="outline" asChild><Link to="/docs">Read the docs</Link></Button>
			</div>
			<p className="mt-4 text-sm text-muted-foreground">Then open <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">http://localhost:3737</code>.</p>
		</div>
	);
}
