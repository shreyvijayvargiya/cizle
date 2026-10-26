import {
	AiMagicIcon, Analytics01Icon, BookOpen01Icon, BrushIcon, Building03Icon, Camera01Icon, ChartLineData01Icon, Clapperboard, CodeIcon, Cursor01Icon, GameController01Icon, GitCompareIcon,
	Grid02Icon, HandPointingRight01Icon, Idea01Icon, Image01Icon, Layers01Icon, Layout01Icon, PackageIcon, PaintBoardIcon, PencilEdit01Icon, PuzzleIcon, Radio01Icon, Rocket01Icon,
	School01Icon, ShapesIcon, SparklesIcon, TextFontIcon, ThreeDViewIcon, Timer01Icon, Tv01Icon, Video01Icon, Task01Icon, FilterHorizontalIcon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";
import { Icon } from "@/components/Icon";

/** An icon and a readable name for each gallery category. Anything new falls back to a sparkle and a tidied-up name. */
const META: Record<string, [string, IconSvgElement]> = {
	motion: ["Motion graphics", Video01Icon],
	comparison: ["Model comparisons", GitCompareIcon],
	video: ["Video", Clapperboard],
	art3d: ["3D art", ThreeDViewIcon],
	"3d": ["3D", ThreeDViewIcon],
	cinematic3d: ["Cinematic 3D", Camera01Icon],
	game: ["Games", GameController01Icon],
	education: ["Education", School01Icon],
	stories: ["Stories", BookOpen01Icon],
	explainer: ["Explainers", Idea01Icon],
	product: ["Product", PackageIcon],
	lowpoly: ["Low poly", ShapesIcon],
	"product-ui": ["Product UI", Layout01Icon],
	productui: ["Product UI", Layout01Icon],
	interactive: ["Interactive", Cursor01Icon],
	brief: ["Briefs", Task01Icon],
	production: ["Production", Layers01Icon],
	"one-shot": ["One shot", Rocket01Icon],
	pixel: ["Pixel art", Grid02Icon],
	spec: ["Specs", CodeIcon],
	pipeline: ["Pipelines", PuzzleIcon],
	cartoon: ["Cartoon", PaintBoardIcon],
	template: ["Templates", Building03Icon],
	"kinetic-type": ["Kinetic type", TextFontIcon],
	generative: ["Generative", AiMagicIcon],
	handdrawn: ["Hand drawn", PencilEdit01Icon],
	typography: ["Typography", TextFontIcon],
	charts: ["Charts", ChartLineData01Icon],
	collage: ["Collage", Image01Icon],
	retro: ["Retro", Tv01Icon],
	analytics: ["Analytics", Analytics01Icon],
	brush: ["Painted", BrushIcon],
	audio: ["Audio", Radio01Icon],
	timelapse: ["Timelapse", Timer01Icon],
	pointer: ["Walkthroughs", HandPointingRight01Icon],
};
const tidy = (s: string) => s.replace(/[-_]+/g, " ").replace(/^./, (c) => c.toUpperCase());
export const categoryLabel = (c: string) => META[c]?.[0] ?? tidy(c);
export const categoryIcon = (c: string): IconSvgElement => META[c]?.[1] ?? SparklesIcon;

/** Every category as a chip, in one wrapping row. Click one to filter, click it again (or "All") to clear. */
export function CategoryChips({ categories, counts, value, onChange, total }: { categories: string[]; counts: Record<string, number>; value: string; onChange: (c: string) => void; total: number }) {
	const chip = "press inline-flex h-11 items-center gap-2 rounded-lg px-4 text-base font-medium transition-colors";
	return (
		<div role="group" aria-label="Categories" className="mt-2 flex flex-wrap gap-2">
			<button type="button" aria-pressed={!value} onClick={() => onChange("")} className={`${chip} ${!value ? "bg-primary text-primary-foreground" : "bg-surface hover:bg-tile-2"}`}>
				<Icon icon={FilterHorizontalIcon} size={17} /> All <span className="opacity-70">{total.toLocaleString()}</span>
			</button>
			{categories.map((c) => (
				<button key={c} type="button" aria-pressed={value === c} onClick={() => onChange(value === c ? "" : c)} className={`${chip} ${value === c ? "bg-primary text-primary-foreground" : "bg-surface hover:bg-tile-2"}`}>
					<Icon icon={categoryIcon(c)} size={17} /> {categoryLabel(c)} <span className="opacity-70">{counts[c] ?? 0}</span>
				</button>
			))}
		</div>
	);
}
