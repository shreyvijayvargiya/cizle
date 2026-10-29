import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Dialog as D } from "radix-ui";
import { ArrowShrink02Icon, Cancel01Icon, SidebarRightIcon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/Icon";

/** the curve every dialog move uses: the iOS drawer curve (--ease-drawer), as numbers for motion */
export const EASE = [0.32, 0.72, 0, 1] as const;
export const GROW = { duration: 0.46, ease: EASE };

/** viewport size and whether the dialog is the centred desktop one (lg), kept in step with the window */
export function useViewport() {
	const read = () => ({ w: window.innerWidth, h: window.innerHeight, lg: window.matchMedia("(min-width: 1024px)").matches });
	const [v, setV] = useState(read);
	useEffect(() => {
		const on = () => setV(read());
		const mq = window.matchMedia("(min-width: 1024px)");
		window.addEventListener("resize", on);
		mq.addEventListener("change", on);
		return () => (window.removeEventListener("resize", on), mq.removeEventListener("change", on));
	}, []);
	return v;
}

/**
 * The size the dialog animates to. Normal: the centred card (1320 x 878 at most, 16 px from every edge). Full screen: the whole window.
 * Below lg the dialog is already the whole window, so there is nothing to animate.
 */
export function dialogSize(v: { w: number; h: number }, fs: boolean, maxW: number, maxH: number) {
	return fs ? { width: v.w, height: v.h, borderRadius: 0 } : { width: Math.min(maxW, v.w - 32), height: Math.min(maxH, v.h - 32), borderRadius: 24 };
}

const ctl = "press grid size-11 place-items-center rounded-full bg-black/55 text-white outline-none backdrop-blur hover:bg-black/70 focus-visible:ring-2 focus-visible:ring-white";

/** top right in full screen: details drawer, leave full screen, close. Nothing else is on screen but the picture and the player toolbar. */
export function FsControls({ onExit, onDrawer, drawerOpen, closeLabel = "Close and go back" }: { onExit: () => void; onDrawer: () => void; drawerOpen: boolean; closeLabel?: string }) {
	return (
		<motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28, ease: EASE, delay: 0.2 }} className="absolute top-3 right-3 z-30 flex gap-2">
			<button type="button" onClick={onDrawer} aria-label={drawerOpen ? "Hide details" : "Show details"} aria-pressed={drawerOpen} className={`${ctl} ${drawerOpen ? "!bg-white !text-black" : ""}`}><Icon icon={SidebarRightIcon} size={18} /></button>
			<button type="button" onClick={onExit} aria-label="Exit full screen" className={ctl}><Icon icon={ArrowShrink02Icon} size={18} /></button>
			<D.Close asChild><button type="button" aria-label={closeLabel} className={ctl}><Icon icon={Cancel01Icon} size={18} /></button></D.Close>
		</motion.div>
	);
}

/** the details card (the right side of the dialog) as a drawer over the full-screen picture; opening it never touches the player */
export function FsDrawer({ open, onClose, children }: { open: boolean; onClose: () => void; children: ReactNode }) {
	return (
		<AnimatePresence>
			{open ? (
				<>
					<motion.button key="scrim" type="button" aria-label="Close details" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="absolute inset-0 z-30 cursor-default bg-black/40" />
					<motion.aside key="drawer" role="complementary" aria-label="Details" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ duration: 0.34, ease: EASE }} className="absolute inset-y-0 right-0 z-40 flex w-[min(26rem,100vw)] flex-col overflow-y-auto overscroll-contain bg-background shadow-e3">
						{children}
					</motion.aside>
				</>
			) : null}
		</AnimatePresence>
	);
}

/** below the full-screen picture: scroll down and more of the same kind appear (up to 8, four to a row) */
export function RelatedSection({ title, children }: { title: string; children: ReactNode }) {
	return (
		<section aria-label={title} className="w-full shrink-0 bg-background px-4 pt-8 pb-12 sm:px-6">
			<h2 className="mb-4 text-xl tracking-[-0.02em]">{title}</h2>
			<ul className="grid grid-cols-[minmax(0,1fr)] gap-2 sm:grid-cols-2 lg:grid-cols-4">{children}</ul>
		</section>
	);
}

/** the little "more below" cue at the bottom of the full-screen picture, gone once the viewer scrolls */
export function MoreCue({ label, className = "bottom-16" }: { label: string; className?: string }) {
	return (
		<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8, duration: 0.4 }} className={`pointer-events-none absolute inset-x-0 z-20 flex justify-center ${className}`}>
			<span className="rounded-full bg-black/55 px-3 py-1 text-sm text-white backdrop-blur">{label} <span aria-hidden>↓</span></span>
		</motion.div>
	);
}
