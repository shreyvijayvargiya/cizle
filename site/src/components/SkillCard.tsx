import { Link } from "@tanstack/react-router";
import { SkillThumb } from "@/components/SkillThumb";
import type { Filters, SkillMeta } from "@/lib/data";

export function SkillCard({ skill, search }: { skill: SkillMeta; search: Filters }) {
	return (
		<article className="lift h-full">
			{/* The whole card is one link, so nothing sits on top of its text. */}
			<Link to="/skills/$slug" params={{ slug: skill.slug }} search={search} className="group flex h-full flex-col overflow-hidden rounded-lg bg-surface outline-none transition-colors hover:bg-tile-2 focus-visible:ring-2 focus-visible:ring-ring">
				<SkillThumb skill={skill} />
				<div className="flex flex-1 flex-col p-4">
					<h3 className="text-xl leading-tight tracking-[-0.03em]">{skill.name}</h3>
					<p className="mt-2 line-clamp-3 text-base leading-snug">{skill.summary}</p>
					<p className="mt-auto pt-4 text-base">
						<span className={skill.tier === "premium" ? "font-semibold" : "font-semibold text-brand-ink"}>{skill.tier === "premium" ? "Premium" : "Free"}</span>
						<span className="text-muted-foreground">
							{skill.platform !== "Any" ? ` · ${skill.platform}` : ""} · {skill.aspect}
						</span>
					</p>
				</div>
			</Link>
		</article>
	);
}
