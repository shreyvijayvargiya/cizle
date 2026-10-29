import { Dialog as D } from "radix-ui";
import { cn } from "@/lib/utils";

export const Sheet = D.Root;
export const SheetTrigger = D.Trigger;
export const SheetClose = D.Close;
/** Side drawer for the mobile menu. */
export function SheetContent({ className, children, title, side = "right", ...p }: React.ComponentProps<typeof D.Content> & { title: string; side?: "left" | "right" }) {
	return (
		<D.Portal>
			<D.Overlay className="fixed inset-0 z-50 bg-black/45 scrim sheet-overlay" />
			<D.Content
				className={cn("fixed inset-y-0 z-50 flex w-[min(20rem,85vw)] flex-col gap-1 bg-surface p-4 shadow-e3 outline-none", side === "right" ? "right-0 border-l sheet-r" : "left-0 border-r sheet-l", className)}
				{...p}
			>
				<D.Title className="sr-only">{title}</D.Title>
				<D.Description className="sr-only">{title}</D.Description>
				{children}
			</D.Content>
		</D.Portal>
	);
}
