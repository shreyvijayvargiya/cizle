import { Link } from "@tanstack/react-router";
import { FORMAT_ICON, KIND_ICON, categoryIcon } from "@/lib/filterIcons";
import { Icon } from "@/components/Icon";

const chip = "press inline-flex items-center gap-2 rounded-lg bg-surface px-4 py-2.5 text-base text-foreground transition-colors hover:bg-tile-2";

/** Two rows of plain links under the hero: each goes to the filter's own page (/explore/<facet>/<value>), so people and crawlers can start from any format or style. */
export function BrowseBy({ formats, categories, counts }: { formats: string[]; categories: string[]; counts: Record<string, number> }) {
	const styles = [...categories].filter((c) => counts[c]).sort((a, b) => (counts[b] || 0) - (counts[a] || 0)).slice(0, 14);
	return (
		<section aria-label="Browse the library" className="board pt-6">
			<div className="board-w grid gap-6 lg:grid-cols-2">
				<div>
					<h2 className="mb-3 text-xl font-semibold tracking-tight">Browse by format</h2>
					<ul className="flex flex-wrap gap-2">
						<li><Link to="/explore/$facet/$value" params={{ facet: "kind", value: "prompts" }} className={chip}><Icon icon={KIND_ICON.prompts} size={16} /> Video and image prompts</Link></li>
						<li><Link to="/explore/$facet/$value" params={{ facet: "kind", value: "skills" }} className={chip}><Icon icon={KIND_ICON.skills} size={16} /> Claude Code skills</Link></li>
						{formats.map((f) => (
							<li key={f}><Link to="/explore/$facet/$value" params={{ facet: "format", value: f }} className={chip}>{FORMAT_ICON[f] ? <Icon icon={FORMAT_ICON[f]} size={16} /> : null} {f}</Link></li>
						))}
					</ul>
				</div>
				<div>
					<h2 className="mb-3 text-xl font-semibold tracking-tight">Browse by style</h2>
					<ul className="flex flex-wrap gap-2">
						{styles.map((c) => (
							<li key={c}><Link to="/explore/$facet/$value" params={{ facet: "category", value: c }} className={chip}><Icon icon={categoryIcon(c)} size={16} /> {c}</Link></li>
						))}
					</ul>
				</div>
			</div>
		</section>
	);
}
