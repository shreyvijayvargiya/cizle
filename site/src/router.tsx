import { Outlet, createRootRoute, createRoute, createRouter, useParams } from "@tanstack/react-router";
import { Layout } from "@/layout/Layout";
import { BlogPage, BlogPostPage } from "@/pages/Blog";
import { ContactPage } from "@/pages/Contact";
import { ContentPage } from "@/pages/Docs";
import { ExplorerPage } from "@/pages/Explorer";
import { FaqPage } from "@/pages/Faq";
import { FilmsPage } from "@/pages/Films";
import { GalleryPage } from "@/pages/Gallery";
import { LoginPage } from "@/pages/Login";
import { NotFound } from "@/pages/NotFound";
import { PricingPage } from "@/pages/Pricing";
import { SettingsPage } from "@/pages/Settings";
import type { Filters } from "@/lib/data";
import type { GalleryFilters } from "@/lib/gallery";

const str = (v: unknown) => (typeof v === "string" && v ? v : undefined);
const filters = (s: Record<string, unknown>): Filters => ({ q: str(s.q), category: str(s.category), platform: str(s.platform), format: str(s.format), aspect: str(s.aspect), access: str(s.access), sort: str(s.sort), kind: str(s.kind), p: str(s.p) });

const root = createRootRoute({ component: Layout, notFoundComponent: NotFound });
function r<const P extends string>(path: P, component: () => React.ReactNode) {
	return createRoute({ getParentRoute: () => root, path, component });
}

const home = createRoute({ getParentRoute: () => root, path: "/", validateSearch: filters, component: () => <ExplorerPage /> });
const skill = createRoute({ getParentRoute: () => root, path: "/skills/$slug", validateSearch: filters, component: SkillRoute });
function SkillRoute() {
	const { slug } = useParams({ from: "/skills/$slug" });
	return <ExplorerPage slug={slug} />;
}
const post = createRoute({ getParentRoute: () => root, path: "/blog/$slug", component: function PostRoute() { const { slug } = useParams({ from: "/blog/$slug" }); return <BlogPostPage slug={slug} />; } });

const galleryFilters = (s: Record<string, unknown>): GalleryFilters => ({ q: str(s.q), category: str(s.category), access: str(s.access), sort: str(s.sort), p: str(s.p) });
const gallery = createRoute({ getParentRoute: () => root, path: "/gallery", validateSearch: galleryFilters, component: GalleryPage });

const prompt = createRoute({ getParentRoute: () => root, path: "/prompts/$slug", validateSearch: galleryFilters, component: function PromptRoute() { const { slug } = useParams({ from: "/prompts/$slug" }); return <GalleryPage slug={slug} />; } });

/** The film is a static page (public/launch.html). The dev server and hosts without clean URLs reach it through this route. */
const launch = createRoute({ getParentRoute: () => root, path: "/launch", component: function LaunchRoute() { window.location.replace("/launch.html"); return null; } });

const login = createRoute({ getParentRoute: () => root, path: "/login", component: LoginPage, validateSearch: (s: Record<string, unknown>): { next?: string } => ({ next: str(s.next) }) });
const settings = createRoute({ getParentRoute: () => root, path: "/settings", component: SettingsPage, validateSearch: (s: Record<string, unknown>): { payment?: string; status?: string } => ({ payment: str(s.payment), status: str(s.status) }) });

const tree = root.addChildren([
	home,
	skill,
	gallery,
	prompt,
	launch,
	r("/films", FilmsPage),
	r("/pricing", PricingPage),
	r("/faq", FaqPage),
	r("/contact", ContactPage),
	r("/blog", BlogPage),
	post,
	r("/docs", () => <ContentPage name="docs" path="/docs" toc title="Docs: how to use cizle skills with Claude Code | cizle" description="Step-by-step: install a cizle skill, connect the MCP server to Claude Code, ask for a video and open the MP4. Includes search, free vs premium and troubleshooting." />),
	r("/terms", () => <ContentPage name="terms" path="/terms" title="Terms of service | cizle" description="The terms for using the cizle skills library and Premium subscription." />),
	r("/privacy", () => <ContentPage name="privacy" path="/privacy" title="Privacy policy | cizle" description="What cizle collects, who processes it and how to ask us to delete it." />),
	r("/refund", () => <ContentPage name="refund" path="/refund" title="Refund policy | cizle" description="Refunds for cizle Premium: 7 days from your first payment, no questions asked." />),
	login,
	settings,
]);

export const router = createRouter({ routeTree: tree, defaultPreload: "intent", scrollRestoration: true, defaultNotFoundComponent: NotFound });
declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}
export { Outlet };
