import { useSearch } from "@tanstack/react-router";
import { Composer } from "@/components/Composer";
import { Page } from "@/components/AppShell";

export function CreatePage() {
	const search = useSearch({ strict: false }) as { prompt?: string };
	return (
		<Page title="Create a video" description="Paste a SaaS URL or GitHub repo, pick a type, and describe what you want. Each run makes 1–3 videos under a minute.">
			<Composer initialPromptId={search.prompt} autoFocus />
			<div className="mt-8 grid gap-3 text-[13px] text-muted-foreground sm:grid-cols-3">
				<div className="rounded-xl border border-border p-4">
					<p className="mb-1 font-medium text-foreground">What it reads</p>
					Homepage, llms.txt, latest blog posts, FAQ markup, pricing and docs pages, and the GitHub repo (cloned locally).
				</div>
				<div className="rounded-xl border border-border p-4">
					<p className="mb-1 font-medium text-foreground">How it decides</p>
					A product brief grounded in those sources, then the chosen type's markdown guide, tone and your prompt shape each script.
				</div>
				<div className="rounded-xl border border-border p-4">
					<p className="mb-1 font-medium text-foreground">What you get</p>
					MP4 in 9:16, 1:1 or 16:9, captions, a social caption, the full script and every frame, all saved locally.
				</div>
			</div>
		</Page>
	);
}
