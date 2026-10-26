import { PauseIcon, PlayIcon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/Icon";
import { useVideoPlayback } from "@/lib/videos";

/** One switch for every demo video on the page. It sits at the end of the search row. */
export function VideoToggle({ className = "" }: { className?: string }) {
	const { playing, toggle } = useVideoPlayback();
	return (
		<button type="button" onClick={toggle} aria-pressed={playing} className={`press ml-auto inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-4 text-base font-medium text-primary-foreground hover:bg-primary/85 ${className}`}>
			<Icon icon={playing ? PauseIcon : PlayIcon} size={17} />
			{playing ? "Pause videos" : "Play videos"}
		</button>
	);
}
