import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badge = cva("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium tracking-[0.01em] whitespace-nowrap", {
	variants: {
		tone: {
			default: "bg-muted text-foreground",
			success: "bg-field-1 text-field-1-ink",
			warning: "bg-field-2 text-field-2-ink",
			danger: "bg-danger text-white",
			info: "bg-field-3 text-field-3-ink",
			outline: "bg-muted text-foreground",
		},
	},
	defaultVariants: { tone: "default" },
});

export function Badge({ className, tone, ...props }: HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badge>) {
	return <span className={cn(badge({ tone }), className)} {...props} />;
}
