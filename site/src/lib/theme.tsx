import { flushSync } from "react-dom";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Theme = "light" | "dark" | "system";
const Ctx = createContext<{ theme: Theme; resolved: "light" | "dark"; setTheme: (t: Theme) => void }>({ theme: "system", resolved: "light", setTheme: () => {} });

function read(): Theme {
	try {
		return (localStorage.getItem("cizle-theme") as Theme) || "system";
	} catch {
		return "system";
	}
}

/** where the last press landed, so a theme change can grow out of it */
const pointer = { x: 0, y: 0, at: -1e9 };
if (typeof window !== "undefined") addEventListener("pointerdown", (e) => Object.assign(pointer, { x: e.clientX, y: e.clientY, at: performance.now() }), { capture: true, passive: true });

export function ThemeProvider({ children }: { children: ReactNode }) {
	const [theme, setThemeState] = useState<Theme>(read);
	const [systemDark, setSystemDark] = useState(() => matchMedia("(prefers-color-scheme: dark)").matches);
	useEffect(() => {
		const mq = matchMedia("(prefers-color-scheme: dark)");
		const on = (e: MediaQueryListEvent) => setSystemDark(e.matches);
		mq.addEventListener("change", on);
		return () => mq.removeEventListener("change", on);
	}, []);
	const resolved = theme === "system" ? (systemDark ? "dark" : "light") : theme;
	useEffect(() => {
		document.documentElement.classList.toggle("dark", resolved === "dark");
	}, [resolved]);
	const setTheme = (t: Theme) => {
		const next = t === "system" ? (systemDark ? "dark" : "light") : t;
		const apply = () => {
			flushSync(() => setThemeState(t));
			document.documentElement.classList.toggle("dark", next === "dark");
		};
		const doc = document as Document & { startViewTransition?: (o: { update: () => void; types: string[] } | (() => void)) => { ready: Promise<void>; finished: Promise<void>; updateCallbackDone: Promise<void> } };
		if (doc.startViewTransition && next !== resolved && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
			// the new theme grows out of the control that was pressed (the middle of the screen for a key press)
			const fresh = performance.now() - pointer.at < 1000;
			const x = fresh ? pointer.x : innerWidth / 2, y = fresh ? pointer.y : innerHeight / 2;
			const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
			const vt = doc.startViewTransition({ update: apply, types: ["theme"] });
			vt.finished.catch(() => {});
			vt.updateCallbackDone.catch(() => {});
			vt.ready.then(() => document.documentElement.animate({ clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] }, { duration: 520, easing: "cubic-bezier(0.23, 1, 0.32, 1)", pseudoElement: "::view-transition-new(root)" }), () => {});
		} else apply();
		try {
			localStorage.setItem("cizle-theme", t);
		} catch {
			/* storage unavailable */
		}
	};
	return <Ctx.Provider value={{ theme, resolved, setTheme }}>{children}</Ctx.Provider>;
}

export const useTheme = () => useContext(Ctx);
