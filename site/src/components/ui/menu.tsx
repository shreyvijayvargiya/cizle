import { DropdownMenu as M, Dialog as D } from "radix-ui";
import { cn } from "@/lib/utils";

export const Menu = M.Root;
export const MenuTrigger = M.Trigger;
export function MenuContent({ className, align = "start", ...p }: React.ComponentProps<typeof M.Content>) {
	return (
		<M.Portal>
			<M.Content
				align={align}
				sideOffset={6}
				className={cn("z-50 min-w-44 overflow-hidden rounded-lg bg-surface p-1 text-base shadow-2xl shadow-black/20", className)}
				{...p}
			/>
		</M.Portal>
	);
}
export function MenuItem({ className, ...p }: React.ComponentProps<typeof M.Item>) {
	return <M.Item className={cn("flex cursor-default items-center gap-2 rounded-md px-2 py-1.5 outline-none select-none data-[highlighted]:bg-tile-2", className)} {...p} />;
}
export function MenuRadioItem({ className, children, ...p }: React.ComponentProps<typeof M.RadioItem>) {
	return (
		<M.RadioItem className={cn("relative flex cursor-default items-center gap-2 rounded-md py-1.5 pr-2 pl-7 outline-none select-none data-[highlighted]:bg-tile-2", className)} {...p}>
			<M.ItemIndicator className="absolute left-2 flex size-3.5 items-center justify-center">
				<span className="size-1.5 rounded-full bg-foreground" />
			</M.ItemIndicator>
			{children}
		</M.RadioItem>
	);
}
export const MenuRadioGroup = M.RadioGroup;
export const MenuLabel = ({ className, ...p }: React.ComponentProps<typeof M.Label>) => <M.Label className={cn("px-2 py-1.5 text-xs font-medium text-muted-foreground", className)} {...p} />;
export const MenuSeparator = ({ className, ...p }: React.ComponentProps<typeof M.Separator>) => <M.Separator className={cn("-mx-1 my-1 h-px bg-border", className)} {...p} />;

export const Dialog = D.Root;
export const DialogTrigger = D.Trigger;
export function DialogContent({ className, children, title, ...p }: React.ComponentProps<typeof D.Content> & { title: string }) {
	return (
		<D.Portal>
			<D.Overlay className="fixed inset-0 z-50 bg-black/50" />
			<D.Content
				className={cn("fixed top-[18%] left-1/2 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 overflow-hidden rounded-xl border border-border bg-surface shadow-2xl", className)}
				{...p}
			>
				<D.Title className="sr-only">{title}</D.Title>
				<D.Description className="sr-only">{title}</D.Description>
				{children}
			</D.Content>
		</D.Portal>
	);
}
