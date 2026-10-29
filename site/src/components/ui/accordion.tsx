import { Accordion as A } from "radix-ui";
import { cn } from "@/lib/utils";

export const Accordion = A.Root;
export function AccordionItem({ className, ...p }: React.ComponentProps<typeof A.Item>) {
	return <A.Item className={cn("reveal mb-2 rounded-lg bg-surface data-[state=open]:bg-field-1 data-[state=open]:text-field-1-ink", className)} {...p} />;
}
export function AccordionTrigger({ className, children, ...p }: React.ComponentProps<typeof A.Trigger>) {
	return (
		<A.Header className="flex">
			<A.Trigger className={cn("group flex flex-1 items-center justify-between gap-4 px-6 py-5 text-left text-lg font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring/40", className)} {...p}>
				{children}
				<span aria-hidden className="relative block size-4 shrink-0">
					<span className="absolute top-1/2 left-0 h-[3px] w-4 -translate-y-1/2 bg-current" />
					<span className="absolute top-1/2 left-0 h-[3px] w-4 -translate-y-1/2 acc-plus rotate-90 bg-current group-data-[state=open]:rotate-0" />
				</span>
			</A.Trigger>
		</A.Header>
	);
}
export function AccordionContent({ className, children, ...p }: React.ComponentProps<typeof A.Content>) {
	return (
		<A.Content className="acc-content overflow-hidden text-base" {...p}>
			<div className={cn("max-w-[52ch] px-6 pb-6 leading-relaxed", className)}>{children}</div>
		</A.Content>
	);
}
