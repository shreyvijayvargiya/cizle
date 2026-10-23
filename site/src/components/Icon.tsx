import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import { cn } from "@/lib/utils";

export function Icon({ icon, className, size = 16, strokeWidth = 1.7 }: { icon: IconSvgElement; className?: string; size?: number; strokeWidth?: number }) {
	return <HugeiconsIcon icon={icon} size={size} strokeWidth={strokeWidth} className={cn("shrink-0", className)} />;
}
