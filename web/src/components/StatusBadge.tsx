import { Loading03Icon } from "@hugeicons/core-free-icons";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/Icon";
import { STEP_LABELS } from "@/lib/constants";
import type { Status } from "@/lib/api";

export function StatusBadge({ status, step, progress }: { status: Status | string; step?: string; progress?: number }) {
	if (status === "success") return <Badge tone="success">Ready</Badge>;
	if (status === "partial") return <Badge tone="warning">Partly ready</Badge>;
	if (status === "failed") return <Badge tone="danger">Failed</Badge>;
	return (
		<span className="inline-flex items-center gap-2">
			<Badge tone="info">
				<Icon icon={Loading03Icon} size={11} className="animate-spin" />
				{status === "pending" ? "Queued" : STEP_LABELS[step || ""] || "Working"}
			</Badge>
			{typeof progress === "number" ? (
				<span className="hidden h-1 w-14 overflow-hidden rounded-full bg-muted sm:block">
					<span className="block h-full rounded-full bg-info transition-all" style={{ width: `${Math.max(4, progress)}%` }} />
				</span>
			) : null}
		</span>
	);
}
