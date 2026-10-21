import type { ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
	"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
	{
		variants: {
			variant: {
				default: "bg-primary text-primary-foreground shadow-sm hover:bg-primary/85",
				outline: "border border-border bg-surface hover:bg-accent",
				secondary: "bg-muted text-foreground hover:bg-muted/70",
				ghost: "hover:bg-accent",
				danger: "border border-border bg-surface text-danger hover:bg-danger/10",
			},
			size: { default: "h-9 px-3.5", sm: "h-8 px-2.5 text-xs", lg: "h-10 px-5", icon: "size-8", "icon-sm": "size-7" },
		},
		defaultVariants: { variant: "default", size: "default" },
	},
);

type Props = ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants> & { asChild?: boolean };

export function Button({ className, variant, size, asChild, ...props }: Props) {
	const Comp = asChild ? Slot.Root : "button";
	return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
