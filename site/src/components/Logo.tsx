import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
	return (
		<span className={cn("inline-flex items-center gap-2 font-semibold tracking-tight", className)}>
			<svg width="26" height="26" viewBox="0 0 32 32" aria-hidden>
				<rect width="32" height="32" rx="8" className="fill-primary" />
				<path d="M12.5 9.8v12.4a1 1 0 0 0 1.5.86l10.2-6.2a1 1 0 0 0 0-1.72L14 8.94a1 1 0 0 0-1.5.86Z" className="fill-primary-foreground" />
			</svg>
			<span className="text-[15px]">cizle</span>
		</span>
	);
}
