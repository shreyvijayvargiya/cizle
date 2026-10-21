import { Accordion as A } from "radix-ui";
import { ArrowDown01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/Icon";
import { cn } from "@/lib/utils";

export const Accordion = A.Root;
export function AccordionItem({ className, ...p }: React.ComponentProps<typeof A.Item>) {
	return <A.Item className={cn("border-b border-border last:border-b-0", className)} {...p} />;
}
export function AccordionTrigger({ className, children, ...p }: React.ComponentProps<typeof A.Trigger>) {
	return (
		<A.Header className="flex">
			<A.Trigger className={cn("group flex flex-1 items-center justify-between gap-4 py-4 text-left text-sm font-medium outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring/40", className)} {...p}>
				{children}
				<Icon icon={ArrowDown01Icon} size={16} className="shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
			</A.Trigger>
		</A.Header>
	);
}
export function AccordionContent({ className, children, ...p }: React.ComponentProps<typeof A.Content>) {
	return (
		<A.Content className="overflow-hidden text-sm text-muted-foreground data-[state=closed]:animate-[acc-up_.2s_ease-out] data-[state=open]:animate-[acc-down_.2s_ease-out]" {...p}>
			<div className={cn("pb-4 leading-relaxed", className)}>{children}</div>
		</A.Content>
	);
}
