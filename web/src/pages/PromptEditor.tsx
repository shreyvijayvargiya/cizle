import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";
import { ArrowLeft01Icon, Delete02Icon, FloppyDiskIcon, PlayCircleIcon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/Icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OptionSelect } from "@/components/ui/select";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Skeleton, Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/misc";
import { api, usePrompts } from "@/lib/api";

const TEMPLATE = `Describe how videos made with this prompt should feel and what they must include.

- Who is it for?
- What must appear on screen (install command, pricing, a specific feature)?
- What should the hook be about?
- Anything to avoid?
`;

export function PromptEditorPage() {
	const { id } = useParams({ strict: false }) as { id?: string };
	const isNew = !id;
	const navigate = useNavigate();
	const qc = useQueryClient();
	const prompts = usePrompts();
	const q = useQuery({ queryKey: ["prompt", id], queryFn: () => api.prompt(id!), enabled: !isNew });
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [type, setType] = useState("");
	const [body, setBody] = useState(isNew ? TEMPLATE : "");

	useEffect(() => {
		if (!q.data) return;
		setName(q.data.name);
		setDescription(q.data.description);
		setType(q.data.kind === "custom" ? q.data.type || "" : "");
		setBody(q.data.body);
	}, [q.data]);

	const save = useMutation({
		mutationFn: () => (isNew ? api.createPrompt({ name, description, body, type: type || null }) : api.updatePrompt(id!, { name, description, body, type: type || null })),
		onSuccess: (p) => {
			qc.invalidateQueries({ queryKey: ["prompts"] });
			qc.setQueryData(["prompt", p.id], p);
			toast.success(isNew ? "Prompt created" : "Prompt saved", { description: `prompts/${p.kind === "type" ? "types" : p.kind === "tone" ? "tones" : p.kind === "film" ? "films" : "custom"}/${p.slug}.md` });
			if (isNew) navigate({ to: "/prompts/$id", params: { id: p.id } });
		},
		onError: (e: Error) => toast.error(e.message),
	});
	const del = useMutation({
		mutationFn: () => api.deletePrompt(id!),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["prompts"] });
			toast.success("Prompt deleted");
			navigate({ to: "/prompts" });
		},
	});

	if (!isNew && q.isLoading)
		return (
			<div className="mx-auto max-w-4xl space-y-3 p-6">
				<Skeleton className="h-8 w-56" />
				<Skeleton className="h-96" />
			</div>
		);

	const prompt = q.data;
	const types = (prompts.data || []).filter((p) => p.kind === "type");
	const isCustom = isNew || prompt?.kind === "custom";

	return (
		<div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6">
			<Link to="/prompts" className="mb-4 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
				<Icon icon={ArrowLeft01Icon} size={13} /> Prompts
			</Link>
			{prompt?.kind === "film" ? (
				<div className="mb-4 rounded-xl border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
					<p>
						Opus film style from <span className="font-medium text-foreground">lemo-opuscar</span> by {prompt.author} ({prompt.license}), imported unchanged.{" "}
						{prompt.source ? (
							<a href={prompt.source} target="_blank" rel="noreferrer" className="underline hover:text-foreground">
								View the original
							</a>
						) : null}
					</p>
					<p className="mt-1">
						In cizle it renders as the closest look{prompt.style ? ` (${prompt.style})` : " (clean)"}. The full text is art direction for a film built entirely in code with the lemo-opuscar skill in Claude Code.
					</p>
				</div>
			) : null}
			<div className="mb-5 flex flex-wrap items-center justify-between gap-3">
				<div className="flex items-center gap-2">
					<h1 className="text-xl font-semibold tracking-tight">{isNew ? "New prompt" : prompt?.name}</h1>
					{prompt ? <Badge tone={prompt.built_in ? "outline" : "info"}>{prompt.built_in ? `Built-in ${prompt.kind}` : "Custom"}</Badge> : null}
				</div>
				<div className="flex gap-1.5">
					{!isNew && prompt ? (
						<Button variant="outline" size="sm" onClick={() => navigate({ to: "/create", search: { prompt: prompt.id } })}>
							<Icon icon={PlayCircleIcon} size={14} /> Use in composer
						</Button>
					) : null}
					{!isNew && isCustom ? (
						<Button
							variant="danger"
							size="sm"
							onClick={() => {
								if (confirm("Delete this prompt file?")) del.mutate();
							}}
						>
							<Icon icon={Delete02Icon} size={14} />
						</Button>
					) : null}
					<Button size="sm" onClick={() => save.mutate()} disabled={save.isPending || !name.trim() || !body.trim()}>
						<Icon icon={FloppyDiskIcon} size={14} /> {isNew ? "Create prompt" : "Save"}
					</Button>
				</div>
			</div>

			<div className="grid gap-4 sm:grid-cols-2">
				<div className="space-y-1.5">
					<Label htmlFor="name">Name</Label>
					<Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Dev tool launch" />
				</div>
				{isCustom ? (
					<div className="space-y-1.5">
						<Label htmlFor="type">Default video type</Label>
						<OptionSelect id="type" value={type} onValueChange={setType} emptyLabel="Any type" options={types.map((t) => ({ value: t.slug, label: t.name }))} />
					</div>
				) : null}
				<div className="space-y-1.5 sm:col-span-2">
					<Label htmlFor="desc">Description</Label>
					<Input id="desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="One line shown in the prompt picker" />
				</div>
			</div>

			<Tabs defaultValue="write" className="mt-5">
				<TabsList>
					<TabsTrigger value="write">Write</TabsTrigger>
					<TabsTrigger value="preview">Preview</TabsTrigger>
				</TabsList>
				<TabsContent value="write" className="mt-3">
					<Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={20} spellCheck={false} className="min-h-[420px] font-mono text-[13px] leading-relaxed" />
					<p className="mt-2 text-xs text-muted-foreground">Markdown. It's injected into the script writer next to the video type guide and tone — write instructions, not the script itself.</p>
				</TabsContent>
				<TabsContent value="preview" className="mt-3">
					<div className="prose-cizle min-h-[420px] rounded-xl border border-border p-5">
						<ReactMarkdown remarkPlugins={[remarkGfm]}>{body || "*Nothing yet*"}</ReactMarkdown>
					</div>
				</TabsContent>
			</Tabs>
		</div>
	);
}
