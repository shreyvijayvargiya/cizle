import { Progress as P } from "radix-ui";
import { cn } from "@/lib/utils";

export function Progress({ value, className, ...p }: Omit<React.ComponentProps<typeof P.Root>, "value"> & { value: number }) {
	return (
		<P.Root value={value} className={cn("relative h-1.5 w-full overflow-hidden rounded-full bg-muted", className)} {...p}>
			<P.Indicator className="h-full rounded-full bg-primary transition-[width] duration-500" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
		</P.Root>
	);
}
