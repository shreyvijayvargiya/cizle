import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth";
import { ThemeProvider } from "@/lib/theme";
import { router } from "@/router";
import "./index.css";

// browsers with View Transitions animate page, dialog and theme changes themselves (see index.css); the rest keep the plain CSS animations
if ("startViewTransition" in document) document.documentElement.classList.add("vt");

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } } });

// The prerendered HTML in #root is for crawlers and the first paint; React takes over from here.
createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<QueryClientProvider client={queryClient}>
			<ThemeProvider>
				<AuthProvider>
					<RouterProvider router={router} />
				</AuthProvider>
			</ThemeProvider>
		</QueryClientProvider>
	</StrictMode>,
);
