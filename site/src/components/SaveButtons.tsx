import { useEffect, useRef, useState } from "react";
import { Bookmark01Icon, FavouriteIcon, ViewIcon } from "@hugeicons/core-free-icons";
import { toast } from "sonner";
import { Icon } from "@/components/Icon";
import { useSaved, type SaveKind } from "@/lib/saved";
import { SHOW_COUNT_ABOVE, statsKey, useAdjustStat, useStats } from "@/lib/stats";
import { cn } from "@/lib/utils";

const META: Record<SaveKind, { icon: typeof FavouriteIcon; on: string; off: string; done: string; undone: string; tint: string }> = {
	like: { icon: FavouriteIcon, on: "Unlike", off: "Like", done: "Liked", undone: "Like removed", tint: "text-rose-400" },
	bookmark: { icon: Bookmark01Icon, on: "Remove bookmark", off: "Bookmark", done: "Bookmarked", undone: "Bookmark removed", tint: "text-amber-300" },
};

/**
 * Like and bookmark for one card or dialog. `overlay` is the card version: it sits on the video's bottom right corner and appears on
 * hover or keyboard focus (always visible on touch screens, which have no hover). `id` is "p:<prompt id>" or "s:<skill slug>".
 */
export function SaveButtons({ id, overlay = false, className }: { id: string; overlay?: boolean; className?: string }) {
	const saved = useSaved();
	const adjust = useAdjustStat();
	const ref = useRef<HTMLDivElement>(null);
	const key = statsKey(id);
	// a card reads its counters the first time the pointer reaches it (not for every card on the page); a dialog reads them at once
	const [wanted, setWanted] = useState(!overlay);
	useEffect(() => {
		const host = ref.current?.parentElement;
		if (!overlay || !host) return;
		const on = () => setWanted(true);
		host.addEventListener("pointerenter", on, { once: true });
		host.addEventListener("focusin", on, { once: true });
		return () => (host.removeEventListener("pointerenter", on), host.removeEventListener("focusin", on));
	}, [overlay]);
	const stats = useStats(key, wanted).data;
	const counts = { like: stats?.likes ?? 0, bookmark: stats?.bookmarks ?? 0 } as const;
	const views = stats?.views ?? 0;
	return (
		<div ref={ref} className={cn(overlay ? "save-overlay absolute right-2.5 bottom-2.5 z-10 flex items-center gap-1.5" : "flex items-center gap-1.5", className)}>
			{views > SHOW_COUNT_ABOVE ? (
				<span title={`${views.toLocaleString()} views`} aria-label={`${views.toLocaleString()} views`} className={cn("inline-flex h-9 items-center gap-1 rounded-full px-2.5 text-sm tabular-nums", overlay ? "bg-black/55 text-white backdrop-blur-sm" : "border border-input text-muted-foreground")}>
					<Icon icon={ViewIcon} size={15} /> {views.toLocaleString()}
				</span>
			) : null}
			{(["like", "bookmark"] as const).map((kind) => {
				const m = META[kind];
				const on = saved.has(kind, id);
				const n = counts[kind];
				return (
					<button
						key={kind}
						type="button"
						aria-pressed={on}
						aria-label={`${on ? m.on : m.off}${n > SHOW_COUNT_ABOVE ? `, ${n.toLocaleString()}` : ""}`}
						title={on ? m.on : m.off}
						onClick={(e) => {
							e.preventDefault();
							e.stopPropagation();
							const now = saved.toggle(kind, id);
							if (saved.signedIn) void adjust(key, kind === "like" ? "likes" : "bookmarks", now ? 1 : -1);
							toast(now ? m.done : m.undone, { description: now && !saved.signedIn ? "Saved on this device. Sign in to keep it with your account and add to the count." : undefined, duration: 1800 });
						}}
						className={cn(
							"save-btn inline-flex h-9 items-center justify-center gap-1 rounded-full text-sm tabular-nums outline-none focus-visible:ring-2 focus-visible:ring-ring",
							n > SHOW_COUNT_ABOVE ? "px-2.5" : "w-9",
							overlay ? "bg-black/55 text-white backdrop-blur-sm hover:bg-black/75" : "border border-input hover:bg-tile-2",
							on && m.tint,
							on && "is-on",
						)}
					>
						<Icon icon={m.icon} size={17} className={cn(on && "[&_path]:fill-current")} />
						{n > SHOW_COUNT_ABOVE ? n.toLocaleString() : null}
					</button>
				);
			})}
		</div>
	);
}
