import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badge = cva("inline-flex items-center gap-1 rounded-md border px-1.5 py-px text-[10.5px] font-medium whitespace-nowrap", {
	variants: {
		tone: {
			default: "border-border bg-muted text-foreground",
			success: "border-success/25 bg-success/10 text-success",
			warning: "border-warning/25 bg-warning/10 text-warning",
			danger: "border-danger/25 bg-danger/10 text-danger",
			info: "border-info/25 bg-info/10 text-info",
			outline: "border-border text-muted-foreground",
		},
	},
	defaultVariants: { tone: "default" },
});

export function Badge({ className, tone, ...props }: HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badge>) {
	return <span className={cn(badge({ tone }), className)} {...props} />;
}
