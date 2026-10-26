import { Command as C } from "cmdk";
import { cn } from "@/lib/utils";

export const Command = C;
export const CommandInput = ({ className, ...p }: React.ComponentProps<typeof C.Input>) => <C.Input className={cn("h-12 w-full border-b border-border bg-transparent px-4 text-sm outline-none placeholder:text-muted-foreground", className)} {...p} />;
export const CommandList = ({ className, ...p }: React.ComponentProps<typeof C.List>) => <C.List className={cn("max-h-[min(60vh,26rem)] overflow-y-auto p-1.5", className)} {...p} />;
export const CommandEmpty = (p: React.ComponentProps<typeof C.Empty>) => <C.Empty className="px-4 py-8 text-center text-sm text-muted-foreground" {...p} />;
export const CommandGroup = ({ className, ...p }: React.ComponentProps<typeof C.Group>) => (
	<C.Group className={cn("[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground", className)} {...p} />
);
export const CommandItem = ({ className, ...p }: React.ComponentProps<typeof C.Item>) => <C.Item className={cn("flex cursor-default items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm outline-none data-[selected=true]:bg-accent", className)} {...p} />;
export const Kbd = ({ className, ...p }: React.HTMLAttributes<HTMLElement>) => <kbd className={cn("inline-flex h-5 min-w-5 items-center justify-center rounded border border-border bg-muted px-1 font-mono text-xs text-muted-foreground", className)} {...p} />;
