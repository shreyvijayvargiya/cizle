import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { ArrowUp02Icon, Cancel01Icon, RefreshIcon, StopIcon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/Icon";
import { ModelToggle } from "@/components/ModelToggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tip } from "@/components/ui/misc";
import { isAborted, useAbort } from "@/lib/abort";
import { ApiError, api, usePrompts, type Idea } from "@/lib/api";
import { useWorkspace } from "@/lib/workspace";
import { cn, usd } from "@/lib/utils";

/** A suggested video. Nothing renders until Create is pressed. */
export function IdeaCard({ idea, slug, showToggle, className }: { idea: Idea; slug: string; showToggle?: boolean; className?: string }) {
	const qc = useQueryClient();
	const navigate = useNavigate();
	const { tier, products } = useWorkspace();
	const prompts = usePrompts();
	const product = products.find((p) => p.slug === slug);
	const typeName = prompts.data?.find((p) => p.kind === "type" && p.slug === idea.type)?.name || (idea.type === "auto" ? "Any type" : idea.type);

	const estimate = useQuery({
		queryKey: ["estimate", "idea", slug, idea.id, tier],
		queryFn: () => api.estimate({ url: product!.url, type: idea.type, tone: idea.tone, aspect: idea.aspect, audio: "voice", duration_sec: 30, variations: 1, model_tier: tier }),
		enabled: Boolean(product) && idea.status === "suggested",
		staleTime: 5 * 60_000,
	});
	const refresh = () => {
		qc.invalidateQueries({ queryKey: ["product", slug] });
		qc.invalidateQueries({ queryKey: ["products"] });
	};
	const abort = useAbort();
	const create = useMutation({
		mutationFn: () => api.createFromIdea(slug, idea.id, { model_tier: tier }, abort.next()),
		onSuccess: (job) => {
			refresh();
			qc.invalidateQueries({ queryKey: ["videos"] });
			qc.invalidateQueries({ queryKey: ["stats"] });
			toast.success("Video started", { description: idea.title });
			navigate({ to: "/videos/$id", params: { id: job.id } });
		},
		onError: (e: ApiError) => {
			if (isAborted(e)) {
				toast.info("Stopped. Nothing was started.");
				refresh();
				return;
			}
			toast.error(e.message, e.code === "MISSING_API_KEY" || e.code === "OPENROUTER_AUTH" ? { action: { label: "Open settings", onClick: () => navigate({ to: "/settings" }) } } : undefined);
		},
	});
	const setStatus = useMutation({ mutationFn: (status: "suggested" | "dismissed") => api.setIdeaStatus(slug, idea.id, status), onSuccess: refresh });

	return (
		<div className={cn("flex flex-col gap-2.5 rounded-xl border border-border bg-surface p-4", idea.status === "dismissed" && "opacity-60", className)}>
			<div className="flex items-start justify-between gap-2">
				{idea.source ? (
					<Badge tone="outline" className="max-w-full truncate font-mono">
						{idea.source}
					</Badge>
				) : (
					<span />
				)}
				{idea.status === "suggested" ? (
					<Tip label="Dismiss this idea">
						<Button variant="ghost" size="icon-sm" className="-mt-1 -mr-1.5 text-muted-foreground" onClick={() => setStatus.mutate("dismissed")} aria-label="Dismiss idea">
							<Icon icon={Cancel01Icon} size={13} />
						</Button>
					</Tip>
				) : null}
			</div>
			<div>
				<p className="text-sm leading-snug font-medium">{idea.title}</p>
				{idea.why_now ? <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{idea.why_now}</p> : null}
			</div>
			<div className="flex flex-wrap gap-1.5">
				<Badge>{typeName}</Badge>
				<Badge tone="outline">{idea.aspect}</Badge>
				{idea.status === "created" ? <Badge tone="success">Created</Badge> : null}
				{idea.status === "dismissed" ? <Badge tone="outline">Dismissed</Badge> : null}
			</div>
			<div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
				{idea.status === "suggested" ? (
					<>
						{showToggle ? <ModelToggle id={`tier-${idea.id}`} /> : null}
						<span className="ml-auto text-xs text-muted-foreground tabular-nums">{tier === "free" ? "Free" : estimate.data ? `≈ ${usd(estimate.data.total_usd, 2)}` : ""}</span>
						{create.isPending ? (
							<Button size="sm" variant="outline" onClick={abort.stop}>
								<Icon icon={StopIcon} size={13} className="fill-current" /> Stop
							</Button>
						) : (
							<Button size="sm" onClick={() => create.mutate()}>
								<Icon icon={ArrowUp02Icon} size={14} /> Create
							</Button>
						)}
					</>
				) : null}
				{idea.status === "created" && idea.video_id ? (
					<Button variant="outline" size="sm" className="ml-auto" asChild>
						<Link to="/videos/$id" params={{ id: idea.video_id }}>
							View video
						</Link>
					</Button>
				) : null}
				{idea.status === "dismissed" ? (
					<Button variant="outline" size="sm" className="ml-auto" onClick={() => setStatus.mutate("suggested")}>
						<Icon icon={RefreshIcon} size={13} /> Restore
					</Button>
				) : null}
			</div>
		</div>
	);
}
