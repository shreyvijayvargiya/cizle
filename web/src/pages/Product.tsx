import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";
import { Delete02Icon, FloppyDiskIcon, GithubIcon, Link01Icon, PlusSignIcon, RefreshIcon, StopIcon } from "@hugeicons/core-free-icons";
import { Page } from "@/components/AppShell";
import { Icon } from "@/components/Icon";
import { IdeaCard } from "@/components/IdeaCard";
import { ModelToggle } from "@/components/ModelToggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Dialog, DialogContent } from "@/components/ui/menu";
import { Skeleton, Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/misc";
import { isAborted, useAbort } from "@/lib/abort";
import { ApiError, api, useProduct } from "@/lib/api";
import { timeAgo } from "@/lib/utils";
import { useWorkspace } from "@/lib/workspace";

export function ProductPage() {
	const qc = useQueryClient();
	const navigate = useNavigate();
	const { slug, tier, productsLoaded } = useWorkspace();
	const { data: product, isLoading } = useProduct(slug);
	const [body, setBody] = useState("");
	const [name, setName] = useState("");
	const [url, setUrl] = useState("");
	const [repos, setRepos] = useState("");
	const [confirmDelete, setConfirmDelete] = useState(false);

	useEffect(() => {
		if (!product) return;
		setBody(product.body);
		setName(product.name);
		setUrl(product.url);
		setRepos(product.repos.join(", "));
	}, [product]);

	const refresh = () => {
		qc.invalidateQueries({ queryKey: ["product", slug] });
		qc.invalidateQueries({ queryKey: ["products"] });
	};
	const save = useMutation({
		mutationFn: (patch: Parameters<typeof api.saveProduct>[1]) => api.saveProduct(slug, patch),
		onSuccess: () => {
			refresh();
			toast.success("Saved to products/" + slug);
		},
		onError: (e: ApiError) => toast.error(e.message),
	});
	const abort = useAbort();
	const sync = useMutation({
		mutationFn: () => api.sync(slug, tier, abort.next()),
		onSuccess: (r) => {
			refresh();
			if (r.busy) toast.info(r.message || "A sync is already running.");
			else if (r.repo_errors.length) toast.warning("Synced, but a repo could not be read", { description: r.repo_errors[0] });
			else toast.success(r.ideas_added ? `${r.ideas_added} new video idea${r.ideas_added === 1 ? "" : "s"}` : r.changed ? "Synced. Nothing worth a video yet." : "Nothing new since the last sync.");
		},
		onError: (e: ApiError) => (isAborted(e) ? toast.info("Sync stopped. Nothing was changed.") : toast.error(e.message)),
	});
	const remove = useMutation({
		mutationFn: () => api.deleteProduct(slug),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["products"] });
			toast.success("Product removed");
			navigate({ to: "/" });
		},
	});

	if (!slug) {
		return (
			<Page title="Product memory" description="cizle remembers each product as markdown files in products/.">
				{productsLoaded ? (
					<div className="rounded-xl border border-dashed border-border p-10 text-center">
						<p className="text-sm font-medium">No product selected</p>
						<p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">Add your website and repos once. cizle keeps the notes, watches for new commits and pages, and suggests videos.</p>
						<Button className="mt-4" asChild>
							<Link to="/products/new">
								<Icon icon={PlusSignIcon} size={15} /> Add product
							</Link>
						</Button>
					</div>
				) : (
					<Skeleton className="h-40 w-full" />
				)}
			</Page>
		);
	}
	if (isLoading || !product) {
		return (
			<Page title="Product memory">
				<Skeleton className="h-64 w-full" />
			</Page>
		);
	}

	const open = product.ideas.filter((i) => i.status === "suggested");
	const rest = product.ideas.filter((i) => i.status !== "suggested");
	const dirty = body !== product.body;

	return (
		<Page
			title={product.name}
			description={product.tagline || product.icp || "Product memory"}
			wide
			actions={
				<>
					<ModelToggle id="product-tier" />
					{sync.isPending ? (
						<Button variant="outline" onClick={abort.stop}>
							<Icon icon={StopIcon} size={14} className="fill-current" /> Stop sync
						</Button>
					) : (
						<Button variant="outline" onClick={() => sync.mutate()}>
							<Icon icon={RefreshIcon} size={15} /> Sync now
						</Button>
					)}
				</>
			}
		>
			<div className="-mt-3 mb-5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
				<a href={product.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-foreground">
					<Icon icon={Link01Icon} size={12} /> {product.url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}
				</a>
				{product.repos.map((r) => (
					<a key={r} href={`https://github.com/${r}`} target="_blank" rel="noreferrer">
						<Badge tone="outline" className="gap-1">
							<Icon icon={GithubIcon} size={11} /> {r}
						</Badge>
					</a>
				))}
				<Badge>{product.category}</Badge>
				<span>{product.last_synced ? `Synced ${timeAgo(product.last_synced)}` : "Not synced yet"}</span>
			</div>

			<Tabs defaultValue="ideas">
				<TabsList>
					<TabsTrigger value="ideas">Ideas{open.length ? ` (${open.length})` : ""}</TabsTrigger>
					<TabsTrigger value="changes">Changes</TabsTrigger>
					<TabsTrigger value="notes">Notes</TabsTrigger>
					<TabsTrigger value="sources">Sources</TabsTrigger>
				</TabsList>

				<TabsContent value="ideas" className="mt-4 space-y-6">
					{open.length ? (
						<div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
							{open.map((i) => (
								<IdeaCard key={i.id} idea={i} slug={slug} />
							))}
						</div>
					) : (
						<p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
							No open ideas. Press Sync now to look for new commits and pages, or ask the{" "}
							<Link to="/agent" className="underline">
								agent
							</Link>
							.
						</p>
					)}
					{rest.length ? (
						<div>
							<p className="mb-2 text-xs font-medium text-muted-foreground">Created and dismissed</p>
							<div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
								{rest.map((i) => (
									<IdeaCard key={i.id} idea={i} slug={slug} />
								))}
							</div>
						</div>
					) : null}
				</TabsContent>

				<TabsContent value="changes" className="mt-4">
					<div className="prose-cizle rounded-xl border border-border p-5">
						<ReactMarkdown remarkPlugins={[remarkGfm]}>{product.changes || "*Nothing recorded yet. Changes appear here after a sync finds new commits, releases or pages.*"}</ReactMarkdown>
					</div>
				</TabsContent>

				<TabsContent value="notes" className="mt-4 space-y-3">
					<Tabs defaultValue="preview">
						<div className="flex items-center justify-between gap-2">
							<TabsList>
								<TabsTrigger value="preview">Preview</TabsTrigger>
								<TabsTrigger value="edit">Edit markdown</TabsTrigger>
							</TabsList>
							<Button size="sm" disabled={!dirty || save.isPending} onClick={() => save.mutate({ body })}>
								<Icon icon={FloppyDiskIcon} size={14} /> Save notes
							</Button>
						</div>
						<TabsContent value="preview" className="mt-3">
							<div className="prose-cizle rounded-xl border border-border p-5">
								<ReactMarkdown remarkPlugins={[remarkGfm]}>{body || "*Empty*"}</ReactMarkdown>
							</div>
						</TabsContent>
						<TabsContent value="edit" className="mt-3">
							<Textarea value={body} onChange={(e) => setBody(e.target.value)} className="min-h-[420px] font-mono text-[13px] leading-relaxed" aria-label="Product notes markdown" />
							<p className="mt-2 text-xs text-muted-foreground">Saved to products/{slug}/product.md. Every new video reads these notes, so correct anything that is wrong.</p>
						</TabsContent>
					</Tabs>
				</TabsContent>

				<TabsContent value="sources" className="mt-4 space-y-4">
					<div className="grid gap-4 rounded-xl border border-border p-5 sm:grid-cols-2">
						<div className="space-y-1.5">
							<Label htmlFor="p-name">Name</Label>
							<Input id="p-name" value={name} onChange={(e) => setName(e.target.value)} />
						</div>
						<div className="space-y-1.5">
							<Label htmlFor="p-url">Website</Label>
							<Input id="p-url" value={url} onChange={(e) => setUrl(e.target.value)} />
						</div>
						<div className="space-y-1.5 sm:col-span-2">
							<Label htmlFor="p-repos">GitHub repos</Label>
							<Input id="p-repos" value={repos} onChange={(e) => setRepos(e.target.value)} placeholder="owner/app, owner/docs" />
							<p className="text-xs text-muted-foreground">Comma separated. Public repos need no token; for private ones add GITHUB_TOKEN to .env.</p>
						</div>
						<div className="sm:col-span-2">
							<Button onClick={() => save.mutate({ name, url, repos })} disabled={save.isPending}>
								Save sources
							</Button>
						</div>
					</div>
					<div className="rounded-xl border border-border p-5 text-sm">
						<p className="mb-2 font-medium">Last sync state</p>
						<ul className="space-y-1.5 text-muted-foreground">
							{Object.entries(product.sources.repos || {}).map(([r, v]) => (
								<li key={r} className="flex flex-wrap items-center gap-2">
									<span className="font-mono text-xs text-foreground">{r}</span>
									{v.error ? <Badge tone="danger">{v.error.slice(0, 90)}</Badge> : <Badge tone="outline">@ {v.head?.slice(0, 7) || "none"}</Badge>}
								</li>
							))}
							<li>{product.sources.site ? `${product.sources.site.urls.length} website pages known` : "Website not tracked"}</li>
						</ul>
					</div>
					<Button variant="danger" onClick={() => setConfirmDelete(true)}>
						<Icon icon={Delete02Icon} size={15} /> Delete product memory
					</Button>
				</TabsContent>
			</Tabs>

			<Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
				<DialogContent title="Delete product" className="top-[28%] max-w-md p-5">
					<p className="text-sm font-medium">Delete {product.name}?</p>
					<p className="mt-1 text-sm text-muted-foreground">This removes products/{slug}/ (notes, changes and ideas). Videos you already made stay in data/videos.</p>
					<div className="mt-4 flex justify-end gap-2">
						<Button variant="outline" onClick={() => setConfirmDelete(false)}>
							Cancel
						</Button>
						<Button variant="danger" onClick={() => remove.mutate()} disabled={remove.isPending}>
							Delete
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</Page>
	);
}
