import { useNavigate } from "@tanstack/react-router";
import { Command } from "cmdk";
import { ComputerTerminal01Icon, DashboardSquare01Icon, GridViewIcon, Package01Icon, PlusSignIcon, QuillWrite01Icon, Settings01Icon, Video01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/Icon";
import { Dialog, DialogContent } from "@/components/ui/menu";
import { usePrompts, useVideos } from "@/lib/api";
import { hostOf } from "@/lib/utils";

const itemCls = "flex cursor-default items-center gap-2.5 rounded-md px-2.5 py-2 text-sm outline-none data-[selected=true]:bg-accent";
const groupCls = "px-1.5 py-1 [&_[cmdk-group-heading]]:px-1.5 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground";

export function CommandMenu({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
	const navigate = useNavigate();
	const videos = useVideos();
	const prompts = usePrompts();
	const go = (fn: () => void) => {
		onOpenChange(false);
		fn();
	};
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent title="Search" className="max-w-xl">
				<Command loop>
					<Command.Input autoFocus placeholder="Search videos, prompts, pages…" className="h-12 w-full border-b border-border bg-transparent px-4 text-sm outline-none placeholder:text-muted-foreground" />
					<Command.List className="max-h-80 overflow-y-auto py-1">
						<Command.Empty className="px-4 py-6 text-center text-sm text-muted-foreground">Nothing found.</Command.Empty>
						<Command.Group heading="Go to" className={groupCls}>
							{[
								{ to: "/", label: "Dashboard", icon: DashboardSquare01Icon },
								{ to: "/create", label: "Create video", icon: PlusSignIcon },
								{ to: "/videos", label: "Videos", icon: Video01Icon },
								{ to: "/gallery", label: "Gallery", icon: GridViewIcon },
								{ to: "/product", label: "Product memory", icon: Package01Icon },
								{ to: "/products/new", label: "Add product", icon: PlusSignIcon },
								{ to: "/prompts", label: "Prompts", icon: QuillWrite01Icon },
								{ to: "/claude", label: "Claude Code", icon: ComputerTerminal01Icon },
								{ to: "/settings", label: "Settings", icon: Settings01Icon },
							].map((n) => (
								<Command.Item key={n.to} value={`page ${n.label}`} onSelect={() => go(() => navigate({ to: n.to }))} className={itemCls}>
									<Icon icon={n.icon} size={15} className="text-muted-foreground" /> {n.label}
								</Command.Item>
							))}
						</Command.Group>
						{(videos.data || []).length ? (
							<Command.Group heading="Videos" className={groupCls}>
								{(videos.data || []).slice(0, 20).map((v) => (
									<Command.Item key={v.id} value={`video ${v.title} ${v.url} ${v.type}`} onSelect={() => go(() => navigate({ to: "/videos/$id", params: { id: v.id } }))} className={itemCls}>
										<Icon icon={Video01Icon} size={15} className="text-muted-foreground" />
										<span className="truncate">{v.title}</span>
										<span className="ml-auto truncate text-xs text-muted-foreground">{v.type} · {hostOf(v.url)}</span>
									</Command.Item>
								))}
							</Command.Group>
						) : null}
						<Command.Group heading="Prompts" className={groupCls}>
							{(prompts.data || []).map((p) => (
								<Command.Item key={p.id} value={`prompt ${p.name} ${p.description}`} onSelect={() => go(() => navigate({ to: "/prompts/$id", params: { id: p.id } }))} className={itemCls}>
									<Icon icon={QuillWrite01Icon} size={15} className="text-muted-foreground" />
									<span className="truncate">{p.name}</span>
									<span className="ml-auto text-xs text-muted-foreground capitalize">{p.kind}</span>
								</Command.Item>
							))}
						</Command.Group>
					</Command.List>
				</Command>
			</DialogContent>
		</Dialog>
	);
}
