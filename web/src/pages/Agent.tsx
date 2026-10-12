import { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";
import { AiMagicIcon, ArrowUp02Icon, Loading03Icon, PlusSignIcon } from "@hugeicons/core-free-icons";
import { Page } from "@/components/AppShell";
import { Icon } from "@/components/Icon";
import { IdeaCard } from "@/components/IdeaCard";
import { ModelToggle } from "@/components/ModelToggle";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { ApiError, api, type ChatMessage, type Idea } from "@/lib/api";
import { useWorkspace } from "@/lib/workspace";
import { cn } from "@/lib/utils";

type Turn = ChatMessage & { proposals?: Idea[] };

const STARTERS = ["What should I make this week?", "Give me three ideas for Reels or Shorts", "What shipped recently that is worth a video?", "Something for people comparing us with a competitor"];

export function AgentPage() {
	const qc = useQueryClient();
	const { slug, product, tier, productsLoaded } = useWorkspace();
	const [turns, setTurns] = useState<Turn[]>([]);
	const [text, setText] = useState("");
	const endRef = useRef<HTMLDivElement>(null);

	// A new product starts a new conversation.
	useEffect(() => setTurns([]), [slug]);
	useEffect(() => endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }), [turns]);

	const send = useMutation({
		mutationFn: (history: Turn[]) => api.agent(slug, history.map(({ role, content }) => ({ role, content })), tier),
		onSuccess: (r) => {
			setTurns((t) => [...t, { role: "assistant", content: r.reply, proposals: r.proposals }]);
			qc.invalidateQueries({ queryKey: ["product", slug] });
			qc.invalidateQueries({ queryKey: ["products"] });
		},
		onError: (e: ApiError) => {
			setTurns((t) => t.slice(0, -1));
			toast.error(e.message);
		},
	});

	const ask = (q: string) => {
		const content = q.trim();
		if (!content || send.isPending) return;
		const next: Turn[] = [...turns, { role: "user", content }];
		setTurns(next);
		setText("");
		send.mutate(next);
	};

	if (!slug) {
		return (
			<Page title="Cizle agent" description="Suggests videos based on what your product is and what just shipped.">
				{productsLoaded ? (
					<div className="rounded-xl border border-dashed border-border p-10 text-center">
						<p className="text-sm font-medium">The agent needs a product to talk about</p>
						<p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">Add your website and repos so it can read your notes and recent changes.</p>
						<Button className="mt-4" asChild>
							<Link to="/products/new">
								<Icon icon={PlusSignIcon} size={15} /> Add product
							</Link>
						</Button>
					</div>
				) : null}
			</Page>
		);
	}

	return (
		<Page title="Cizle agent" description={`Suggestions for ${product?.name || "your product"}, grounded in its notes and recent changes. It proposes, you press Create.`}>
			<div className="flex min-h-[calc(100dvh-14rem)] flex-col rounded-xl border border-border bg-surface">
				<div className="flex-1 space-y-5 overflow-y-auto p-4 sm:p-5">
					{turns.length === 0 ? (
						<div className="flex h-full flex-col items-center justify-center gap-4 py-10 text-center">
							<span className="flex size-10 items-center justify-center rounded-xl bg-brand/15 text-brand">
								<Icon icon={AiMagicIcon} size={20} />
							</span>
							<div>
								<p className="text-sm font-medium">What should we make next?</p>
								<p className="mt-1 text-sm text-muted-foreground">It reads {product?.name}'s notes, changes and past videos before answering.</p>
							</div>
							<div className="flex max-w-xl flex-wrap justify-center gap-2">
								{STARTERS.map((s) => (
									<Button key={s} variant="outline" size="sm" onClick={() => ask(s)}>
										{s}
									</Button>
								))}
							</div>
						</div>
					) : null}
					{turns.map((t, i) => (
						<div key={i} className={cn("flex flex-col gap-3", t.role === "user" && "items-end")}>
							<div className={cn("max-w-[88%] rounded-2xl px-4 py-2.5 text-sm", t.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted")}>
								{t.role === "user" ? t.content : (
									<div className="prose-cizle">
										<ReactMarkdown remarkPlugins={[remarkGfm]}>{t.content}</ReactMarkdown>
									</div>
								)}
							</div>
							{t.proposals?.length ? (
								<div className="grid w-full gap-3 md:grid-cols-2 lg:grid-cols-3">
									{t.proposals.map((p) => (
										<IdeaCard key={p.id} idea={p} slug={slug} showToggle />
									))}
								</div>
							) : null}
						</div>
					))}
					{send.isPending ? (
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							<Icon icon={Loading03Icon} size={15} className="animate-spin" /> Reading your notes…
						</div>
					) : null}
					<div ref={endRef} />
				</div>
				<div className="border-t border-border p-3">
					<div className="flex items-end gap-2">
						<Textarea
							value={text}
							rows={2}
							onChange={(e) => setText(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter" && !e.shiftKey) {
									e.preventDefault();
									ask(text);
								}
							}}
							placeholder="Ask for ideas, or tell it what you just shipped…"
							className="min-h-11 resize-none"
							aria-label="Message the agent"
						/>
						<Button size="icon" className="size-10 rounded-xl" onClick={() => ask(text)} disabled={!text.trim() || send.isPending} aria-label="Send">
							<Icon icon={ArrowUp02Icon} size={18} />
						</Button>
					</div>
					<div className="mt-2 flex items-center justify-between">
						<ModelToggle id="agent-tier" />
						<span className="text-[11px] text-muted-foreground">Enter to send, Shift+Enter for a new line</span>
					</div>
				</div>
			</div>
		</Page>
	);
}
