import { Label } from "@/components/ui/input";
import { Switch, Tip } from "@/components/ui/misc";
import { useWorkspace } from "@/lib/workspace";
import { cn } from "@/lib/utils";

/** Free or paid models for the button next to it. One shared setting, remembered between visits. */
export function ModelToggle({ id = "model-tier", className }: { id?: string; className?: string }) {
	const { tier, setTier } = useWorkspace();
	return (
		<Tip label={tier === "free" ? "Free OpenRouter models: $0, rate limited, voice-over becomes music" : "Your paid models from Settings"}>
			<span className={cn("inline-flex items-center gap-2", className)}>
				<Switch id={id} checked={tier === "free"} onCheckedChange={(v) => setTier(v ? "free" : "paid")} />
				<Label htmlFor={id} className="cursor-pointer text-xs text-muted-foreground select-none">
					Free model
				</Label>
			</span>
		</Tip>
	);
}
