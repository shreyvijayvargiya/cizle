import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
	return (
		<input
			className={cn(
				"flex h-11 w-full rounded-lg border border-input bg-surface px-3.5 text-base outline-none transition-shadow placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/40",
				className,
			)}
			{...props}
		/>
	);
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
	return (
		<textarea
			className={cn(
				"flex w-full rounded-lg border border-input bg-surface px-3.5 py-2.5 text-base outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/40",
				className,
			)}
			{...props}
		/>
	);
}

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
	return <label className={cn("text-sm font-medium text-foreground", className)} {...props} />;
}
