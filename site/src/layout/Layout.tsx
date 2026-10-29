import { useEffect, useState } from "react";
import { Outlet } from "@tanstack/react-router";
import { Tooltip } from "radix-ui";
import { Toaster } from "sonner";
import { CommandMenu } from "@/layout/CommandMenu";
import { Footer } from "@/layout/Footer";
import { Navbar } from "@/layout/Navbar";
import { MiniPlayer } from "@/components/MiniPlayer";
import { track } from "@/lib/funnel";
import { GateProvider } from "@/lib/gate";
import { useReveal } from "@/lib/reveal";
import { VideoProvider } from "@/lib/videos";
import { useTheme } from "@/lib/theme";

/** The shell every page shares: navbar, page, footer, ⌘K and toasts. Pages only render their own content. */
export function Layout() {
	const [searchOpen, setSearchOpen] = useState(false);
	const { resolved } = useTheme();
	useReveal();
	useEffect(() => track("visits", { once: true }), []);
	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
				e.preventDefault();
				setSearchOpen((o) => !o);
			}
			if (e.key === "/" && !(e.target as HTMLElement)?.closest("input, textarea, select, [contenteditable]")) {
				e.preventDefault();
				setSearchOpen(true);
			}
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, []);
	return (
		<VideoProvider>
		<GateProvider>
		<Tooltip.Provider delayDuration={250}>
			<a href="#main" className="sr-only z-[60] rounded-lg bg-primary px-4 py-3 text-base text-primary-foreground focus:not-sr-only focus:fixed focus:top-2 focus:left-2">
				Skip to content
			</a>
			<div className="flex min-h-dvh flex-col">
				<Navbar onSearch={() => setSearchOpen(true)} />
				<main id="main" className="flex-1">
					<Outlet />
				</main>
				<Footer />
			</div>
			<MiniPlayer />
			<CommandMenu open={searchOpen} onOpenChange={setSearchOpen} />
			<Toaster theme={resolved} position="bottom-right" richColors closeButton mobileOffset={{ bottom: "max(16px, env(safe-area-inset-bottom))" }} />
		</Tooltip.Provider>
		</GateProvider>
		</VideoProvider>
	);
}
