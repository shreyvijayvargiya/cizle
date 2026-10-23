import type { ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
	"press inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
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
			size: { default: "h-8 px-3", sm: "h-7 px-2.5 text-xs", lg: "h-9 px-4", icon: "size-8", "icon-sm": "size-7" },
		},
		defaultVariants: { variant: "default", size: "default" },
	},
);

type Props = ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants> & { asChild?: boolean };

export function Button({ className, variant, size, asChild, ...props }: Props) {
	const Comp = asChild ? Slot.Root : "button";
	return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
