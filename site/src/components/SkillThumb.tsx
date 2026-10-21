import { cn } from "@/lib/utils";
import type { SkillMeta } from "@/lib/data";

const HUE: Record<string, number> = { "Product videos": 24, Explainers: 205, "Launch & growth": 340, "Social proof": 145, Ads: 12, Engineering: 262, "Film styles": 38 };
const FRAME: Record<string, string> = { "9:16": "aspect-[9/16] h-[78%]", "16:9": "aspect-[16/9] w-[62%]", "1:1": "aspect-square h-[72%]", "4:5": "aspect-[4/5] h-[78%]", Other: "aspect-[4/3] w-[54%]" };

/** A small looping mock of the video's shape: its aspect ratio and one bar per scene. No images to load. */
export function SkillThumb({ skill, className }: { skill: Pick<SkillMeta, "category" | "aspect" | "scenes" | "anatomy" | "poster" | "name">; className?: string }) {
	const hue = HUE[skill.category] ?? 24;
	const bars = Math.min(8, Math.max(3, skill.scenes.length || skill.anatomy.length || 4));
	return (
		<div className={cn("relative flex aspect-[16/10] items-center justify-center overflow-hidden rounded-lg border border-border", className)} style={{ background: `linear-gradient(135deg, hsl(${hue} 90% 94%), hsl(${hue + 28} 85% 88%))` }} aria-hidden>
			<div className="pointer-events-none absolute inset-0 hidden dark:block" style={{ background: `linear-gradient(135deg, hsl(${hue} 38% 22%), hsl(${hue + 28} 42% 30%))` }} />
			{skill.poster ? (
				<img src={skill.poster} alt="" loading="lazy" className="absolute inset-0 size-full object-cover" />
			) : (
				<div className={cn("relative flex flex-col justify-between rounded-md border border-black/10 bg-white/85 p-2 shadow-sm dark:border-white/10 dark:bg-black/45", FRAME[skill.aspect] || FRAME.Other)}>
					<div className="h-1.5 w-3/5 rounded-full" style={{ background: `hsl(${hue} 85% 52%)`, animation: "sheen 3s linear infinite", backgroundSize: "200% 100%" }} />
					<div className="space-y-1">
						<div className="h-1 w-full rounded-full bg-black/15 dark:bg-white/20" />
						<div className="h-1 w-4/5 rounded-full bg-black/10 dark:bg-white/15" />
					</div>
					<div className="flex gap-0.5">
						{Array.from({ length: bars }).map((_, i) => (
							<span key={i} className="h-1 flex-1 rounded-full" style={{ background: `hsl(${hue} 80% ${50 + (i % 3) * 8}%)`, opacity: 0.35 + (i % 4) * 0.18 }} />
						))}
					</div>
				</div>
			)}
		</div>
	);
}
