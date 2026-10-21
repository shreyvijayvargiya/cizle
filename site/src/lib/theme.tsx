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
		setThemeState(t);
		try {
			localStorage.setItem("cizle-theme", t);
		} catch {
			/* storage unavailable */
		}
	};
	return <Ctx.Provider value={{ theme, resolved, setTheme }}>{children}</Ctx.Provider>;
}

export const useTheme = () => useContext(Ctx);
