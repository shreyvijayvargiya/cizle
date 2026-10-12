import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider, createRootRoute, createRoute, createRouter } from "@tanstack/react-router";
import { Toaster } from "sonner";
import { AppShell } from "@/components/AppShell";
import { ThemeProvider, useTheme } from "@/lib/theme";
import { DashboardPage } from "@/pages/Dashboard";
import { CreatePage } from "@/pages/Create";
import { VideosPage } from "@/pages/Videos";
import { VideoDetailPage } from "@/pages/VideoDetail";
import { PromptsPage } from "@/pages/Prompts";
import { PromptEditorPage } from "@/pages/PromptEditor";
import { SettingsPage } from "@/pages/Settings";
import { OnboardingPage } from "@/pages/Onboarding";
import { ProductPage } from "@/pages/Product";
import { AgentPage } from "@/pages/Agent";
import { GalleryPage } from "@/pages/Gallery";
import { WorkspaceProvider } from "@/lib/workspace";
import "./index.css";

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } } });

const rootRoute = createRootRoute({ component: () => <AppShell /> });
const parent = () => rootRoute;
const routeTree = rootRoute.addChildren([
	createRoute({ getParentRoute: parent, path: "/", component: DashboardPage }),
	createRoute({
		getParentRoute: parent,
		path: "/create",
		component: CreatePage,
		validateSearch: (s: Record<string, unknown>): { prompt?: string; preset?: string } => ({ prompt: typeof s.prompt === "string" ? s.prompt : undefined, preset: typeof s.preset === "string" ? s.preset : undefined }),
	}),
	createRoute({ getParentRoute: parent, path: "/gallery", component: GalleryPage }),
	createRoute({ getParentRoute: parent, path: "/agent", component: AgentPage }),
	createRoute({ getParentRoute: parent, path: "/product", component: ProductPage }),
	createRoute({ getParentRoute: parent, path: "/products/new", component: OnboardingPage }),
	createRoute({ getParentRoute: parent, path: "/videos", component: VideosPage }),
	createRoute({ getParentRoute: parent, path: "/videos/$id", component: VideoDetailPage }),
	createRoute({ getParentRoute: parent, path: "/prompts", component: PromptsPage }),
	createRoute({ getParentRoute: parent, path: "/prompts/new", component: PromptEditorPage }),
	createRoute({ getParentRoute: parent, path: "/prompts/$id", component: PromptEditorPage }),
	createRoute({ getParentRoute: parent, path: "/settings", component: SettingsPage }),
]);

const router = createRouter({ routeTree, defaultPreload: "intent" });

declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

function ThemedToaster() {
	const { resolved } = useTheme();
	return <Toaster theme={resolved} position="bottom-right" richColors closeButton />;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<ThemeProvider>
			<QueryClientProvider client={queryClient}>
				<WorkspaceProvider>
					<RouterProvider router={router} />
				</WorkspaceProvider>
				<ThemedToaster />
			</QueryClientProvider>
		</ThemeProvider>
	</React.StrictMode>,
);
