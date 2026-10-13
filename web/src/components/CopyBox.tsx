import { useState } from "react";
import { CheckmarkCircle02Icon, Copy01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/Icon";
import { cn } from "@/lib/utils";

/** A command or prompt in a box with a copy button. */
export function CopyBox({ text, label, mono = true, className }: { text: string; label?: string; mono?: boolean; className?: string }) {
	const [done, setDone] = useState(false);
	const copy = () =>
		navigator.clipboard?.writeText(text).then(() => {
			setDone(true);
			setTimeout(() => setDone(false), 1500);
		});
	return (
		<div className={cn("group relative rounded-lg border border-border bg-muted/50", className)}>
			{label ? <p className="px-3 pt-2 text-[11px] font-medium text-muted-foreground">{label}</p> : null}
			<p className={cn("px-3 py-2 pr-11 text-[13px] leading-relaxed break-words whitespace-pre-wrap", mono && "font-mono text-xs", label && "pt-1")}>{text}</p>
			<button type="button" onClick={copy} aria-label="Copy" className="absolute top-1.5 right-1.5 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
				<Icon icon={done ? CheckmarkCircle02Icon : Copy01Icon} size={14} className={done ? "text-success" : ""} />
			</button>
		</div>
	);
}
