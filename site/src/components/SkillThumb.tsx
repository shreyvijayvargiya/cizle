import { cn } from "@/lib/utils";
import { AutoVideo } from "@/lib/videos";
import type { SkillMeta } from "@/lib/data";
import { isRtl, languageOf } from "@/lib/languages";

const FIELDS = ["bg-field-1 text-field-1-ink", "bg-field-2 text-field-2-ink", "bg-field-3 text-field-3-ink", "bg-tile-2 text-foreground"];
const ORDER = ["Product videos", "Explainers", "Launch & growth", "Social proof", "Ads", "Engineering", "Film styles"];

/** A flat field in one of the palette colours with two real facts of the skill set large: how long it runs and its shape. No mock interface. */
export function SkillThumb({ skill, className }: { skill: Pick<SkillMeta, "category" | "aspect" | "scenes" | "anatomy" | "poster" | "name" | "duration"> & { video?: string | null; format?: string; summary?: string; lang?: string }; className?: string }) {
	const field = FIELDS[Math.max(0, ORDER.indexOf(skill.category)) % FIELDS.length];
	const steps = skill.scenes.length || skill.anatomy.length;
	// a skill file has no video: its card is the skill itself (name, one line, language), in the language it is written in
	if (skill.format === "Skill" && !skill.video && !skill.poster) {
		const lang = languageOf(skill.lang);
		return (
			<div dir={isRtl(skill.lang) ? "rtl" : "ltr"} className={cn("relative flex aspect-[16/10] flex-col justify-between gap-2 overflow-hidden p-4", field, className)}>
				<span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-black/10 px-2.5 py-1 text-xs font-medium">{lang.flag} {lang.native} · skill</span>
				<div>
					<p className="line-clamp-2 text-xl leading-tight font-semibold tracking-[-0.02em]">{skill.name}</p>
					{skill.summary ? <p className="mt-1.5 line-clamp-3 text-sm opacity-80">{skill.summary}</p> : null}
				</div>
			</div>
		);
	}
	return (
		<div className={cn("relative flex aspect-[16/10] flex-col justify-end gap-1 overflow-hidden p-4", field, className)}>
			{skill.video ? (
				<AutoVideo src={skill.video} poster={skill.poster} className="absolute inset-0 size-full object-cover" aria-label={`Demo video: ${skill.name}`} />
			) : skill.poster ? (
				<img src={skill.poster} alt="" loading="lazy" className="absolute inset-0 size-full object-cover" />
			) : (
				<>
					<p className="display tabular" style={{ fontSize: "3rem" }}>
						{skill.duration ? `${skill.duration}s` : skill.aspect}
					</p>
					<p className="text-base">
						{skill.category}, {skill.duration ? skill.aspect : "style guide"}
						{steps ? ` · ${steps} ${steps === 1 ? "step" : "steps"}` : ""}
					</p>
				</>
			)}
		</div>
	);
}
