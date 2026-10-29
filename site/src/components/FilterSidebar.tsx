import { useState } from "react";
import { ArrowDown01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";
import { Icon } from "@/components/Icon";
import { cn } from "@/lib/utils";

export type FacetOption = { value: string; label: string; count?: number; icon?: IconSvgElement; flag?: string };
export type Facet = { key: string; label: string; icon: IconSvgElement; options: FacetOption[]; limit?: number; open?: boolean };

/** Every option is a real link (`/explore/<facet>/<value>`) so a crawler can follow it to its own page; a click only changes the filter in place. */
export const facetHref = (key: string, value: string) => `/explore/${key}/${encodeURIComponent(value)}`;

function Check({ on }: { on: boolean }) {
	return (
		<span aria-hidden className={cn("grid size-[18px] shrink-0 place-items-center rounded-[5px] border transition-colors", on ? "border-field-1 bg-field-1 text-field-1-ink" : "border-input bg-background")}>
			{on ? <Icon icon={Tick02Icon} size={12} /> : null}
		</span>
	);
}

function Group({ facet, value, onSelect }: { facet: Facet; value?: string; onSelect: (key: string, value: string) => void }) {
	const [open, setOpen] = useState(facet.open ?? true);
	const [all, setAll] = useState(false);
	const limit = facet.limit ?? 8;
	const shown = all ? facet.options : facet.options.filter((o, i) => i < limit || o.value === value);
	return (
		<section className="border-b border-input/70 py-3 last:border-0">
			<button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex w-full items-center gap-2.5 px-1 py-1 text-left text-base font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ring">
				<Icon icon={facet.icon} size={17} className="text-muted-foreground" />
				<span className="flex-1">{facet.label}</span>
				<Icon icon={ArrowDown01Icon} size={14} className={cn("text-muted-foreground transition-transform", !open && "-rotate-90")} />
			</button>
			{open ? (
				<ul className="mt-1.5 space-y-0.5">
					{shown.map((o) => {
						const on = value === o.value;
						return (
							<li key={o.value}>
								<a
									href={facetHref(facet.key, o.value)}
									role="checkbox"
									aria-checked={on}
									onClick={(e) => (e.preventDefault(), onSelect(facet.key, o.value))}
									onKeyDown={(e) => e.key === " " && (e.preventDefault(), onSelect(facet.key, o.value))}
									className={cn("flex items-center gap-2.5 rounded-md px-1.5 py-1.5 text-[15px] outline-none transition-colors hover:bg-tile-2 focus-visible:ring-2 focus-visible:ring-ring", on && "bg-tile-2 font-medium")}
								>
									<Check on={on} />
									{o.flag ? <span aria-hidden className="text-base leading-none">{o.flag}</span> : o.icon ? <Icon icon={o.icon} size={15} className="text-muted-foreground" /> : null}
									<span className="min-w-0 flex-1 truncate">{o.label}</span>
									
								</a>
							</li>
						);
					})}
					{facet.options.length > limit ? (
						<li>
							<button type="button" onClick={() => setAll((a) => !a)} className="px-1.5 py-1.5 text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground">
								{all ? "Show fewer" : `Show all ${facet.options.length}`}
							</button>
						</li>
					) : null}
				</ul>
			) : null}
		</section>
	);
}

/** The panel body, shared by the desktop sidebar and the mobile drawer. */
export function FilterPanel({ facets, selected, onSelect }: { facets: Facet[]; selected: Record<string, string | undefined>; onSelect: (key: string, value: string) => void }) {
	return (
		<div>
			{facets.filter((f) => f.options.length).map((f) => <Group key={f.key} facet={f} value={selected[f.key]} onSelect={onSelect} />)}
		</div>
	);
}

/** Narrow rail shown when the sidebar is collapsed: one icon per group, a dot when a filter in it is on. */
export function FilterRail({ facets, selected, onOpen }: { facets: Facet[]; selected: Record<string, string | undefined>; onOpen: () => void }) {
	return (
		<div className="flex flex-col items-center gap-1 py-2">
			{facets.filter((f) => f.options.length).map((f) => (
				<button key={f.key} type="button" onClick={onOpen} aria-label={`${f.label} filters`} title={f.label} className="press relative grid size-10 place-items-center rounded-md text-muted-foreground outline-none hover:bg-tile-2 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring">
					<Icon icon={f.icon} size={19} />
					{selected[f.key] ? <span aria-hidden className="absolute top-1.5 right-1.5 size-2 rounded-full bg-field-1" /> : null}
				</button>
			))}
		</div>
	);
}
