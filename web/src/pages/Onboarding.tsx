import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { CheckmarkCircle02Icon, Loading03Icon, Alert02Icon, ArrowRight01Icon, StopIcon } from "@hugeicons/core-free-icons";
import { Page } from "@/components/AppShell";
import { Icon } from "@/components/Icon";
import { IdeaCard } from "@/components/IdeaCard";
import { ModelToggle } from "@/components/ModelToggle";
import { SuggestedPrompts } from "@/components/SuggestedPrompts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { isAborted, useAbort } from "@/lib/abort";
import { ApiError, api, useSettings } from "@/lib/api";
import { useWorkspace } from "@/lib/workspace";
import { cn } from "@/lib/utils";

export function OnboardingPage() {
	const qc = useQueryClient();
	const navigate = useNavigate();
	const settings = useSettings();
	const { tier, setSlug } = useWorkspace();
	const [url, setUrl] = useState("");
	const [repos, setRepos] = useState("");
	const [runId, setRunId] = useState<string | null>(null);
	const finished = useRef<string | null>(null);

	const abort = useAbort();
	const start = useMutation({
		mutationFn: () => api.startOnboard({ url, repos, model_tier: tier }, abort.next()),
		onSuccess: (r) => setRunId(r.id),
		onError: (e: ApiError) => (isAborted(e) ? toast.info("Stopped.") : toast.error(e.message)),
	});
	const stop = useMutation({
		mutationFn: () => api.cancelOnboard(runId!),
		onSuccess: (r) => {
			qc.setQueryData(["onboard", runId], r);
			toast.info("Stopped. Nothing was saved.");
		},
		// Already finished: just refresh the run so the page shows how it ended.
		onError: () => qc.invalidateQueries({ queryKey: ["onboard", runId] }),
	});
	const run = useQuery({
		queryKey: ["onboard", runId],
		queryFn: () => api.onboard(runId!),
		enabled: Boolean(runId),
		refetchInterval: (q) => (q.state.data?.status === "running" || !q.state.data ? 1500 : false),
	});
	const data = run.data;

	useEffect(() => {
		if (data?.status === "success" && data.slug && finished.current !== data.id) {
			finished.current = data.id;
			qc.invalidateQueries({ queryKey: ["products"] });
			setSlug(data.slug);
		}
	}, [data, qc, setSlug]);

	const keyMissing = settings.data && !settings.data.openrouter_api_key_set;
	const done = data?.steps.filter((s) => s.state === "done").length ?? 0;
	const running = start.isPending || data?.status === "running";

	return (
		<Page title="Add a product" description="Paste your website and any GitHub repos. cizle reads them once, saves what it learns as markdown in products/, and suggests your first videos.">
			{!runId || data?.status === "failed" || data?.status === "cancelled" ? (
				<Card>
					<CardHeader>
						<CardTitle>Where does your product live?</CardTitle>
						<CardDescription>Only public pages and repos are read. Add a GITHUB_TOKEN to .env later if a repo is private.</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-1.5">
							<Label htmlFor="product-url">Website or GitHub repo</Label>
							<Input id="product-url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://yourproduct.com" autoFocus />
						</div>
						<div className="space-y-1.5">
							<Label htmlFor="product-repos">GitHub repos (optional)</Label>
							<Input id="product-repos" value={repos} onChange={(e) => setRepos(e.target.value)} placeholder="owner/app, owner/docs, owner/api" />
							<p className="text-xs text-muted-foreground">Separate several repos with commas. Each one is checked for new commits and releases.</p>
						</div>
						{data?.status === "cancelled" ? <p className="text-sm text-muted-foreground">Stopped. Nothing was saved. Start again whenever you are ready.</p> : null}
						{data?.status === "failed" ? (
							<div className="flex items-start gap-2 rounded-lg border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
								<Icon icon={Alert02Icon} size={16} className="mt-0.5" /> {data.error}
							</div>
						) : null}
						{keyMissing ? (
							<p className="text-sm text-warning">
								Add your OpenRouter key first.{" "}
								<Link to="/settings" className="underline">
									Open Settings
								</Link>
							</p>
						) : null}
						<div className="flex flex-wrap items-center gap-3 pt-1">
							<ModelToggle id="onboard-tier" />
							{start.isPending ? (
								<Button className="ml-auto" variant="outline" onClick={abort.stop}>
									<Icon icon={StopIcon} size={14} className="fill-current" /> Stop
								</Button>
							) : (
								<Button className="ml-auto" disabled={!url.trim() || running} onClick={() => start.mutate()}>
									<Icon icon={ArrowRight01Icon} size={15} /> Read my product
								</Button>
							)}
						</div>
					</CardContent>
				</Card>
			) : null}

			{data && data.status !== "failed" && data.status !== "cancelled" ? (
				<Card>
					<CardHeader className="flex-row items-start justify-between gap-3">
						<div className="space-y-1.5">
							<CardTitle>{data.status === "success" ? "Your product is saved" : "Reading your product"}</CardTitle>
							<CardDescription>{data.status === "success" ? "cizle now remembers it. Pick a first video or a prompt below, nothing renders until you approve it." : "This takes about a minute."}</CardDescription>
						</div>
						{data.status === "running" ? (
							<Button variant="outline" size="sm" onClick={() => stop.mutate()} disabled={stop.isPending}>
								<Icon icon={StopIcon} size={13} className="fill-current" /> Stop
							</Button>
						) : null}
					</CardHeader>
					<CardContent className="space-y-4">
						<Progress value={data.status === "success" ? 100 : (done / data.steps.length) * 100 + 8} aria-label="Onboarding progress" />
						<ul className="space-y-2">
							{data.steps.map((s) => (
								<li key={s.id} className={cn("flex items-center gap-2.5 text-sm", s.state === "pending" && "text-muted-foreground")}>
									{s.state === "done" ? (
										<Icon icon={CheckmarkCircle02Icon} size={16} className="text-success" />
									) : s.state === "active" ? (
										<Icon icon={Loading03Icon} size={16} className="animate-spin text-info" />
									) : (
										<span className="size-4 rounded-full border border-border" />
									)}
									{s.label}
								</li>
							))}
						</ul>
					</CardContent>
				</Card>
			) : null}

			{data?.status === "success" && data.slug ? (
				<section className="mt-8">
					<div className="mb-3 flex items-end justify-between gap-2">
						<div>
							<h2 className="text-base font-semibold tracking-tight">Suggested first videos</h2>
							<p className="text-xs text-muted-foreground">Each one cites where its facts come from. Flip the switch to use a free model.</p>
						</div>
						<Button variant="outline" size="sm" onClick={() => navigate({ to: "/product" })}>
							Open product memory
						</Button>
					</div>
					<div className="grid gap-3 md:grid-cols-3">
						{data.ideas.map((i) => (
							<IdeaCard key={i.id} idea={i} slug={data.slug!} showToggle />
						))}
					</div>
					<SuggestedPrompts slug={data.slug} className="mt-10" />
				</section>
			) : null}
		</Page>
	);
}
