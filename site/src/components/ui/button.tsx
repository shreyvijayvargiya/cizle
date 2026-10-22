import type { ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
	"press inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
	{
		variants: {
			variant: {
				default: "bg-primary text-primary-foreground hover:bg-primary/85",
				brand: "bg-field-1 text-field-1-ink hover:bg-field-1/85",
				outline: "bg-surface hover:bg-tile-2",
				secondary: "bg-muted text-foreground hover:bg-tile-2",
				ghost: "hover:bg-surface",
				danger: "bg-surface text-danger hover:bg-tile-2",
			},
			size: { default: "h-10 px-4", sm: "h-9 px-3", lg: "h-12 px-6 text-base", icon: "size-10", "icon-sm": "size-8" },
		},
		defaultVariants: { variant: "default", size: "default" },
	},
);

type Props = ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants> & { asChild?: boolean };

export function Button({ className, variant, size, asChild, ...props }: Props) {
	const Comp = asChild ? Slot.Root : "button";
	return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
