import { Link } from "@tanstack/react-router";
import { SaveButtons } from "@/components/SaveButtons";
import { SkillThumb } from "@/components/SkillThumb";
import type { Filters, SkillMeta } from "@/lib/data";

/** A card is the video and nothing else. Name, summary and access are on the skill page it opens. */
export function SkillCard({ skill, search, inSearch }: { skill: SkillMeta; search: Filters; inSearch?: string }) {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const lp: any = inSearch !== undefined ? { to: "/search", search: { q: inSearch || undefined, s: skill.slug } } : { to: "/skills/$slug", params: { slug: skill.slug }, search };
	return (
		<article className="lift card-in group/card relative h-full">
			<Link {...lp} aria-label={skill.name} className="group block h-full overflow-hidden rounded-lg bg-surface outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring">
				<SkillThumb skill={skill} />
			</Link>
			<SaveButtons id={`s:${skill.slug}`} overlay />
		</article>
	);
}
