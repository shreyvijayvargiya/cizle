import { Link } from "@tanstack/react-router";
import { LockIcon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/Icon";
import { SkillThumb } from "@/components/SkillThumb";
import { Badge } from "@/components/ui/badge";
import type { Filters, SkillMeta } from "@/lib/data";

export function SkillCard({ skill, search }: { skill: SkillMeta; search: Filters }) {
	return (
		<article className="group relative flex flex-col rounded-xl border border-border bg-surface p-3 transition-colors hover:border-foreground/25 hover:bg-accent/40">
			<SkillThumb skill={skill} />
			<div className="mt-3 flex items-start justify-between gap-2">
				<h3 className="text-sm font-semibold tracking-tight">
					{/* The whole card is the link: stretched ::after keeps the heading as the accessible name. */}
					<Link to="/skills/$slug" params={{ slug: skill.slug }} search={search} className="after:absolute after:inset-0 after:rounded-xl focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-ring">
						{skill.name}
					</Link>
				</h3>
				{skill.tier === "premium" ? (
					<Badge tone="warning" className="shrink-0">
						<Icon icon={LockIcon} size={11} /> Pro
					</Badge>
				) : (
					<Badge tone="success" className="shrink-0">
						Free
					</Badge>
				)}
			</div>
			<p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-muted-foreground">{skill.summary}</p>
			<div className="mt-3 flex flex-wrap gap-1.5 pt-0.5">
				<Badge tone="outline">{skill.category}</Badge>
				{skill.duration ? <Badge tone="outline">{skill.duration}s</Badge> : null}
				<Badge tone="outline">{skill.aspect}</Badge>
				{skill.platform !== "Any" ? <Badge tone="outline">{skill.platform}</Badge> : null}
			</div>
		</article>
	);
}
