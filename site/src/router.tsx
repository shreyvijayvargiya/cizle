import { Outlet, createRootRoute, createRoute, createRouter, useParams, useSearch } from "@tanstack/react-router";
import { Layout } from "@/layout/Layout";
import { BlogPage, BlogPostPage } from "@/pages/Blog";
import { ConnectPage } from "@/pages/Connect";
import { ContactPage } from "@/pages/Contact";
import { ContentPage } from "@/pages/Docs";
import { CreatorsPage } from "@/pages/Creators";
import { ExplorerPage } from "@/pages/Explorer";
import { FaqPage } from "@/pages/Faq";
import { FilmsPage } from "@/pages/Films";
import { GalleryPage } from "@/pages/Gallery";
import { LoginPage } from "@/pages/Login";
import { NotFound } from "@/pages/NotFound";
import { PricingPage } from "@/pages/Pricing";
import { BLOG } from "@/lib/config";
import { LearnPage } from "@/pages/Learn";
import { SubscribePage } from "@/pages/Subscribe";
import { SearchPage } from "@/pages/Search";
import { ExploreRoute } from "@/pages/Explore";
import { SavedPage } from "@/pages/Saved";
import { AudioPage } from "@/pages/Audio";
import { SettingsPage } from "@/pages/Settings";
import { ReversePage } from "@/pages/Reverse";
import type { Filters } from "@/lib/data";
import type { GalleryFilters } from "@/lib/gallery";

const str = (v: unknown) => (typeof v === "string" && v ? v : undefined);
const filters = (s: Record<string, unknown>): Filters => ({ q: str(s.q), category: str(s.category), platform: str(s.platform), format: str(s.format), aspect: str(s.aspect), access: str(s.access), sort: str(s.sort), kind: str(s.kind), p: str(s.p), lang: str(s.lang), version: str(s.version), country: str(s.country), tool: str(s.tool), topic: str(s.topic) });

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

const galleryFilters = (s: Record<string, unknown>): GalleryFilters => ({ from: str(s.from), q: str(s.q), category: str(s.category), access: str(s.access), sort: str(s.sort), p: str(s.p), lang: str(s.lang), version: str(s.version), country: str(s.country), tool: str(s.tool), topic: str(s.topic) });
const gallery = createRoute({ getParentRoute: () => root, path: "/gallery", validateSearch: galleryFilters, component: GalleryPage });

const audioFilters = (s: Record<string, unknown>) => ({ q: str(s.q), kind: str(s.kind), length: str(s.length), tag: str(s.tag), license: str(s.license), version: str(s.version), sort: str(s.sort) });
const audio = createRoute({ getParentRoute: () => root, path: "/audio", validateSearch: audioFilters, component: () => <AudioPage /> });
const audioClip = createRoute({ getParentRoute: () => root, path: "/audio/$slug", validateSearch: audioFilters, component: function AudioClipRoute() { const { slug } = useParams({ from: "/audio/$slug" }); return <AudioPage slug={slug} />; } });

const images = createRoute({ getParentRoute: () => root, path: "/images", validateSearch: galleryFilters, component: () => <GalleryPage mode="images" /> });
const videos = createRoute({ getParentRoute: () => root, path: "/videos", validateSearch: galleryFilters, component: () => <GalleryPage mode="videos" /> });

const prompt = createRoute({ getParentRoute: () => root, path: "/prompts/$slug", validateSearch: galleryFilters, component: function PromptRoute() { const { slug } = useParams({ from: "/prompts/$slug" }); const { from } = useSearch({ from: "/prompts/$slug" }); return <GalleryPage slug={slug} mode={from === "images" || from === "videos" ? from : "all"} />; } });

/** The film is a static page (public/launch.html). The dev server and hosts without clean URLs reach it through this route. */
const searchRoute = createRoute({ getParentRoute: () => root, path: "/search", component: SearchPage, validateSearch: (s: Record<string, unknown>): { q?: string; p?: string; s?: string; format?: string } => ({ q: str(s.q), p: str(s.p), s: str(s.s), format: str(s.format) }) });
const explore = createRoute({ getParentRoute: () => root, path: "/explore/$facet/$value", component: ExploreRoute });
const launch = createRoute({ getParentRoute: () => root, path: "/launch", component: function LaunchRoute() { window.location.replace("/launch.html"); return null; } });

const login = createRoute({ getParentRoute: () => root, path: "/login", component: LoginPage, validateSearch: (s: Record<string, unknown>): { next?: string } => ({ next: str(s.next) }) });
const settings = createRoute({ getParentRoute: () => root, path: "/settings", component: SettingsPage, validateSearch: (s: Record<string, unknown>): { payment?: string; status?: string } => ({ payment: str(s.payment), status: str(s.status) }) });

const tree = root.addChildren([
	home,
	skill,
	gallery,
	images,
	videos,
	audio,
	audioClip,
	prompt,
	launch,
	r("/sources", CreatorsPage),
	r("/saved", SavedPage),
	r("/reverse", ReversePage), // not launched: no navbar, footer or sitemap link
	r("/learn", LearnPage),
	r("/subscribe", SubscribePage),
	searchRoute,
	explore,
	r("/films", FilmsPage),
	r("/connect", ConnectPage),
	r("/pricing", PricingPage),
	r("/faq", FaqPage),
	r("/contact", ContactPage),
	...(BLOG ? [r("/blog", BlogPage), post] : []),
	r("/docs", () => <ContentPage name="docs" path="/docs" toc title="Docs: how to use cizle skills with Claude Code | cizle" description="Step-by-step: install a cizle skill, connect the MCP server to Claude Code, ask for a video and open the MP4. Includes search, free vs premium and troubleshooting." />),
	r("/terms", () => <ContentPage name="terms" path="/terms" title="Terms of service | cizle" description="The terms for using the cizle skills library and Premium subscription." />),
	r("/privacy", () => <ContentPage name="privacy" path="/privacy" title="Privacy policy | cizle" description="What cizle collects, who processes it and how to ask us to delete it." />),
	r("/rights", () => <ContentPage name="rights" path="/rights" title="Credits, licences and removal | cizle" description="How cizle credits creators, which content is shown in full, and how to have yours changed or removed." />),
	r("/refund", () => <ContentPage name="refund" path="/refund" title="Refund policy | cizle" description="Refunds for cizle Premium: 7 days from your first payment, no questions asked." />),
	login,
	settings,
]);

/** a skill, prompt or clip opened over its list: the page stays, only the dialog moves */
const isModalPath = (p: string) => /^\/(skills|prompts|audio)\/[^/]+\/?$/.test(p);
export const router = createRouter({ routeTree: tree, defaultViewTransition: { types: ({ fromLocation, toLocation }) => (!fromLocation || fromLocation.pathname === toLocation.pathname ? false : [isModalPath(fromLocation.pathname) || isModalPath(toLocation.pathname) ? "modal" : "page"]) }, defaultPreload: "intent", scrollRestoration: true, defaultNotFoundComponent: NotFound });
declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}
export { Outlet };
