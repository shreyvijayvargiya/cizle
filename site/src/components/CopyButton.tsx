import { useState } from "react";
import { toast } from "sonner";
import { Tick02Icon, Copy01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/Icon";
import { Button } from "@/components/ui/button";

/** Copies text, confirms with a toast and a check mark. Falls back to a hidden textarea where the clipboard API is blocked. */
export async function copyText(text: string) {
	try {
		await navigator.clipboard.writeText(text);
		return true;
	} catch {
		try {
			const ta = document.createElement("textarea");
			ta.value = text;
			ta.style.position = "fixed";
			ta.style.opacity = "0";
			document.body.appendChild(ta);
			ta.select();
			const ok = document.execCommand("copy");
			ta.remove();
			return ok;
		} catch {
			return false;
		}
	}
}

export function CopyButton({ text, label, done = "Copied", variant = "outline", size = "sm", className, disabled, onCopied }: { text: string; label: string; done?: string; variant?: "default" | "outline" | "secondary" | "ghost"; size?: "default" | "sm" | "lg"; className?: string; disabled?: boolean; onCopied?: () => void }) {
	const [ok, setOk] = useState(false);
	return (
		<Button
			variant={variant}
			size={size}
			className={className}
			disabled={disabled}
			onClick={async () => {
				if (!(await copyText(text))) return toast.error("Could not copy. Select the text and copy it by hand.");
				setOk(true);
				toast.success(done);
				onCopied?.();
				setTimeout(() => setOk(false), 1800);
			}}
		>
			<Icon icon={ok ? Tick02Icon : Copy01Icon} size={14} className={ok ? "text-success" : ""} />
			{ok ? "Copied" : label}
		</Button>
	);
}
