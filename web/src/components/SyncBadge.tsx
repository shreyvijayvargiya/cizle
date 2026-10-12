import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Loading03Icon, RefreshIcon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/Icon";
import { Button } from "@/components/ui/button";
import { ApiError, api } from "@/lib/api";
import { timeAgo } from "@/lib/utils";
import { useWorkspace } from "@/lib/workspace";

/** Sidebar footer: when the product was last checked for new commits and pages, plus a Sync button. */
export function SyncBadge() {
	const qc = useQueryClient();
	const { product, tier } = useWorkspace();
	const sync = useMutation({
		mutationFn: () => api.sync(product!.slug, tier),
		onSuccess: (r) => {
			qc.invalidateQueries({ queryKey: ["products"] });
			qc.invalidateQueries({ queryKey: ["product", product?.slug] });
			if (r.busy) toast.info(r.message || "A sync is already running.");
			else if (r.repo_errors.length) toast.warning("Synced, but a repo could not be read", { description: r.repo_errors[0] });
			else if (r.ideas_added) toast.success(`${r.ideas_added} new video idea${r.ideas_added === 1 ? "" : "s"}`, { description: r.summary[0] });
			else toast.success(r.changed ? "Synced. Nothing worth a video yet." : "Nothing new since the last sync.");
		},
		onError: (e: ApiError) => toast.error(e.message),
	});
	if (!product) return null;
	return (
		<div className="border-t border-border p-3">
			<div className="flex items-center justify-between gap-2">
				<div className="min-w-0 text-[11px] leading-tight text-muted-foreground">
					<p className="truncate">{product.last_synced ? `Synced ${timeAgo(product.last_synced)}` : "Not synced yet"}</p>
					<Link to="/product" className="hover:text-foreground">
						{product.ideas_open ? `${product.ideas_open} idea${product.ideas_open === 1 ? "" : "s"} waiting` : "No new ideas"}
					</Link>
				</div>
				<Button variant="outline" size="sm" onClick={() => sync.mutate()} disabled={sync.isPending} aria-label="Sync now">
					<Icon icon={sync.isPending ? Loading03Icon : RefreshIcon} size={13} className={sync.isPending ? "animate-spin" : ""} /> Sync
				</Button>
			</div>
		</div>
	);
}
