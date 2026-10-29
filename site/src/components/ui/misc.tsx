import type { HTMLAttributes, ReactNode } from "react";
import { Switch as SwitchPrimitive, Tabs as TabsPrimitive, Tooltip as TooltipPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";

export function Skeleton({ className, ...p }: HTMLAttributes<HTMLDivElement>) {
	return <div className={cn("animate-pulse rounded-lg bg-muted", className)} {...p} />;
}

export function Switch({ checked, onCheckedChange, disabled, id }: { checked: boolean; onCheckedChange: (v: boolean) => void; disabled?: boolean; id?: string }) {
	return (
		<SwitchPrimitive.Root
			id={id}
			checked={checked}
			onCheckedChange={onCheckedChange}
			disabled={disabled}
			className="peer inline-flex h-5 w-9 shrink-0 items-center rounded-full border border-transparent bg-input transition-colors data-[state=checked]:bg-primary disabled:opacity-50"
		>
			<SwitchPrimitive.Thumb className="switch-thumb block size-4 rounded-full bg-surface data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0.5 dark:data-[state=checked]:bg-primary-foreground" />
		</SwitchPrimitive.Root>
	);
}

export const Tabs = TabsPrimitive.Root;
export function TabsList({ className, ...p }: React.ComponentProps<typeof TabsPrimitive.List>) {
	return <TabsPrimitive.List className={cn("inline-flex h-11 items-center gap-1 rounded-xl bg-muted p-1", className)} {...p} />;
}
export function TabsTrigger({ className, ...p }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
	return (
		<TabsPrimitive.Trigger
			className={cn(
				"press inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-medium text-muted-foreground transition-colors data-[state=active]:shadow-e1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",
				className,
			)}
			{...p}
		/>
	);
}
export const TabsContent = ({ className, ...p }: React.ComponentProps<typeof TabsPrimitive.Content>) => <TabsPrimitive.Content className={cn("outline-none", className)} {...p} />;

export function Tip({ label, children }: { label: string; children: ReactNode }) {
	return (
		<TooltipPrimitive.Root delayDuration={300}>
			<TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
			<TooltipPrimitive.Portal>
				<TooltipPrimitive.Content sideOffset={6} className="tip-pop shadow-e2 z-50 rounded-lg bg-primary px-3 py-1.5 text-sm text-primary-foreground">
					{label}
				</TooltipPrimitive.Content>
			</TooltipPrimitive.Portal>
		</TooltipPrimitive.Root>
	);
}
