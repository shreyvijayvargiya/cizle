import { cn } from "@/lib/utils";

/** The mark is the product: a play triangle on a flat ink tile. */
export function Logo({ className, mark = true }: { className?: string; mark?: boolean }) {
	return (
		<span className={cn("inline-flex items-center gap-2.5 font-semibold tracking-tight", className)}>
			{mark ? (
				<svg width="28" height="28" viewBox="0 0 32 32" aria-hidden>
					<rect width="32" height="32" rx="8" className="fill-primary" />
					<path d="M12.5 9.8v12.4a1 1 0 0 0 1.5.86l10.2-6.2a1 1 0 0 0 0-1.72L14 8.94a1 1 0 0 0-1.5.86Z" className="fill-primary-foreground" />
				</svg>
			) : null}
			<span className="text-xl tracking-[-0.04em]">cizle</span>
		</span>
	);
}
