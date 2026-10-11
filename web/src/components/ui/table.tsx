import type { HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const Table = ({ className, ...p }: HTMLAttributes<HTMLTableElement>) => (
	<div className="relative w-full overflow-x-auto">
		<table className={cn("w-full caption-bottom text-sm", className)} {...p} />
	</div>
);
export const TableHeader = ({ className, ...p }: HTMLAttributes<HTMLTableSectionElement>) => <thead className={cn("[&_tr]:border-b", className)} {...p} />;
export const TableBody = ({ className, ...p }: HTMLAttributes<HTMLTableSectionElement>) => <tbody className={cn("[&_tr:last-child]:border-0", className)} {...p} />;
export const TableRow = ({ className, ...p }: HTMLAttributes<HTMLTableRowElement>) => <tr className={cn("border-b border-border transition-colors", className)} {...p} />;
export const TableHead = ({ className, ...p }: ThHTMLAttributes<HTMLTableCellElement>) => (
	<th className={cn("h-10 px-3 text-left align-middle text-xs font-medium whitespace-nowrap text-muted-foreground", className)} {...p} />
);
export const TableCell = ({ className, ...p }: TdHTMLAttributes<HTMLTableCellElement>) => <td className={cn("px-3 py-2.5 align-middle", className)} {...p} />;
