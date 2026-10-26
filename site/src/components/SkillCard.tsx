import { Link } from "@tanstack/react-router";
import { SkillThumb } from "@/components/SkillThumb";
import type { Filters, SkillMeta } from "@/lib/data";

/** A card is the video and nothing else. Name, summary and access are on the skill page it opens. */
export function SkillCard({ skill, search }: { skill: SkillMeta; search: Filters }) {
	return (
		<article className="lift h-full">
			<Link to="/skills/$slug" params={{ slug: skill.slug }} search={search} aria-label={skill.name} className="group block h-full overflow-hidden rounded-lg bg-surface outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring">
				<SkillThumb skill={skill} />
			</Link>
		</article>
	);
}
