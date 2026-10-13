import { useEffect, useState, type ReactNode } from "react";
import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import {
	BookOpen01Icon,
	Cancel01Icon,
	ComputerIcon,
	ComputerTerminal01Icon,
	DashboardSquare01Icon,
	GithubIcon,
	GridViewIcon,
	Menu01Icon,
	Moon02Icon,
	Package01Icon,
	PlusSignIcon,
	QuillWrite01Icon,
	Search01Icon,
	Settings01Icon,
	SidebarLeftIcon,
	StarIcon,
	Sun03Icon,
	Video01Icon,
} from "@hugeicons/core-free-icons";
import { Tooltip } from "radix-ui";
import { Icon } from "@/components/Icon";
import { CommandMenu } from "@/components/CommandMenu";
import { ProductSwitcher } from "@/components/ProductSwitcher";
import { SyncBadge } from "@/components/SyncBadge";
import { Button } from "@/components/ui/button";
import { Menu, MenuContent, MenuRadioGroup, MenuRadioItem, MenuTrigger } from "@/components/ui/menu";
import { useSettings, useVideos } from "@/lib/api";
import { REPO_URL } from "@/lib/constants";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { useWorkspace } from "@/lib/workspace";

const NAV = [
	{ to: "/", label: "Dashboard", icon: DashboardSquare01Icon, exact: true },
	{ to: "/create", label: "Create video", icon: PlusSignIcon },
	{ to: "/videos", label: "Videos", icon: Video01Icon },
	{ to: "/gallery", label: "Gallery", icon: GridViewIcon },
	{ to: "/product", label: "Product", icon: Package01Icon },
	{ to: "/prompts", label: "Prompts", icon: QuillWrite01Icon },
	{ to: "/claude", label: "Claude Code", icon: ComputerTerminal01Icon },
	{ to: "/docs", label: "Docs", icon: BookOpen01Icon },
	{ to: "/settings", label: "Settings", icon: Settings01Icon },
] as const;

function Sidebar({ collapsed, mobileOpen, onClose }: { collapsed: boolean; mobileOpen: boolean; onClose: () => void }) {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const { slug } = useWorkspace();
	const videos = useVideos(slug);
	const recent = (videos.data || []).slice(0, 6);
	const slim = collapsed && !mobileOpen;
	return (
		<>
			{mobileOpen ? <button aria-label="Close menu" className="fixed inset-0 z-40 bg-black/30 md:hidden" onClick={onClose} /> : null}
			<aside
				className={cn(
					"fixed inset-y-2 left-2 z-50 flex flex-col rounded-xl border border-border bg-surface transition-[width,transform] duration-200 md:static md:inset-auto md:z-auto md:translate-x-0",
					slim ? "w-[60px]" : "w-60",
					mobileOpen ? "translate-x-0" : "-translate-x-[120%]",
				)}
			>
				<div className={cn("flex h-14 items-center gap-2.5 px-3", slim && "justify-center px-0")}>
					<Link to="/" onClick={onClose} className="flex min-w-0 items-center gap-2.5">
						<span className="relative flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
							<svg viewBox="0 0 24 24" className="size-3.5 fill-current" aria-hidden>
								<path d="M7 4.5v15l12-7.5z" />
							</svg>
							<span className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-brand ring-2 ring-surface" />
						</span>
						{slim ? null : (
							<span className="leading-tight">
								<span className="block text-sm font-semibold tracking-tight">cizle</span>
								<span className="block text-[11px] text-muted-foreground">Local video studio</span>
							</span>
						)}
					</Link>
					{mobileOpen ? (
						<Button variant="ghost" size="icon-sm" className="ml-auto md:hidden" onClick={onClose} aria-label="Close menu">
							<Icon icon={Cancel01Icon} />
						</Button>
					) : null}
				</div>
				<div className="px-2 pb-2">
					<ProductSwitcher slim={slim} onNavigate={onClose} />
				</div>
				<nav className="flex flex-col gap-0.5 px-2">
					{NAV.map((item) => {
						const active = "exact" in item && item.exact ? pathname === item.to : pathname === item.to || pathname.startsWith(`${item.to}/`);
						return (
							<Link
								key={item.to}
								to={item.to}
								onClick={onClose}
								title={slim ? item.label : undefined}
								className={cn(
									"flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-sm transition-colors",
									slim && "justify-center px-0",
									active ? "bg-accent font-medium text-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground",
								)}
							>
								<Icon icon={item.icon} size={17} />
								{slim ? null : item.label}
							</Link>
						);
					})}
				</nav>
				{slim ? null : (
					<div className="mt-4 min-h-0 flex-1 overflow-y-auto border-t border-border px-2 pt-3">
						<p className="px-2.5 pb-1.5 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">Recent</p>
						{recent.length ? (
							recent.map((v) => (
								<Link
									key={v.id}
									to="/videos/$id"
									params={{ id: v.id }}
									onClick={onClose}
									className={cn(
										"flex h-8 items-center gap-2 rounded-lg px-2.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground",
										pathname === `/videos/${v.id}` && "bg-accent text-foreground",
									)}
								>
									<span
										className={cn(
											"size-1.5 shrink-0 rounded-full",
											v.status === "success" ? "bg-success" : v.status === "failed" ? "bg-danger" : v.status === "partial" ? "bg-warning" : v.status === "cancelled" ? "bg-muted-foreground/50" : "animate-pulse bg-info",
										)}
									/>
									<span className="truncate">{v.title}</span>
								</Link>
							))
						) : (
							<p className="px-2.5 text-sm text-muted-foreground">No videos yet</p>
						)}
					</div>
				)}
				{slim ? <div className="flex-1" /> : null}
				{slim ? null : <SyncBadge />}
				<div className={cn("border-t border-border p-3 text-[11px] text-muted-foreground", slim && "hidden")}>Runs on this machine · MIT</div>
			</aside>
		</>
	);
}

function ThemeMenu() {
	const { theme, resolved, setTheme } = useTheme();
	return (
		<Menu>
			<MenuTrigger asChild>
				<Button variant="ghost" size="icon" aria-label="Theme">
					<Icon icon={resolved === "dark" ? Moon02Icon : Sun03Icon} size={17} />
				</Button>
			</MenuTrigger>
			<MenuContent align="end" className="min-w-36">
				<MenuRadioGroup value={theme} onValueChange={(v) => setTheme(v as "light" | "dark" | "system")}>
					<MenuRadioItem value="light">
						<Icon icon={Sun03Icon} size={14} /> Light
					</MenuRadioItem>
					<MenuRadioItem value="dark">
						<Icon icon={Moon02Icon} size={14} /> Dark
					</MenuRadioItem>
					<MenuRadioItem value="system">
						<Icon icon={ComputerIcon} size={14} /> System
					</MenuRadioItem>
				</MenuRadioGroup>
			</MenuContent>
		</Menu>
	);
}

export function AppShell({ children }: { children?: ReactNode }) {
	const [collapsed, setCollapsed] = useState(() => {
		try {
			return localStorage.getItem("cizle-sidebar") === "1";
		} catch {
			return false;
		}
	});
	const [mobileOpen, setMobileOpen] = useState(false);
	const [cmdOpen, setCmdOpen] = useState(false);
	const settings = useSettings();
	useEffect(() => {
		try {
			localStorage.setItem("cizle-sidebar", collapsed ? "1" : "0");
		} catch {
			/* storage unavailable */
		}
	}, [collapsed]);
	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
				e.preventDefault();
				setCmdOpen((o) => !o);
			}
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, []);

	return (
		<Tooltip.Provider>
			<div className="flex h-dvh gap-2 overflow-hidden p-2">
				<Sidebar collapsed={collapsed} mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
				<div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-border bg-surface">
					<header className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-3">
						<Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(true)} aria-label="Open menu">
							<Icon icon={Menu01Icon} size={18} />
						</Button>
						<Button variant="ghost" size="icon" className="hidden md:inline-flex" onClick={() => setCollapsed((c) => !c)} aria-label="Toggle sidebar">
							<Icon icon={SidebarLeftIcon} size={18} />
						</Button>
						<button
							type="button"
							onClick={() => setCmdOpen(true)}
							className="flex h-9 w-full max-w-md items-center gap-2 rounded-lg border border-border bg-background/60 px-3 text-sm text-muted-foreground transition-colors hover:bg-accent"
						>
							<Icon icon={Search01Icon} size={15} />
							<span className="truncate">Search videos and prompts</span>
							<kbd className="ml-auto hidden rounded border border-border bg-surface px-1.5 font-mono text-[10px] sm:inline">⌘K</kbd>
						</button>
						<div className="ml-auto flex items-center gap-1">
							{settings.data && !settings.data.openrouter_api_key_set ? (
								<Link to="/settings" className="mr-1 hidden rounded-md border border-warning/30 bg-warning/10 px-2 py-1 text-xs font-medium text-warning lg:inline-block">
									OpenRouter key (not needed for Claude Code)
								</Link>
							) : null}
							<ThemeMenu />
							<Button variant="ghost" size="icon" asChild>
								<a href={REPO_URL} target="_blank" rel="noreferrer" aria-label="GitHub">
									<Icon icon={GithubIcon} size={17} />
								</a>
							</Button>
							<Button variant="outline" size="sm" className="hidden sm:inline-flex" asChild>
								<a href={REPO_URL} target="_blank" rel="noreferrer">
									<Icon icon={StarIcon} size={14} /> Star on GitHub
								</a>
							</Button>
						</div>
					</header>
					<main className="min-h-0 flex-1 overflow-y-auto">{children ?? <Outlet />}</main>
				</div>
			</div>
			<CommandMenu open={cmdOpen} onOpenChange={setCmdOpen} />
		</Tooltip.Provider>
	);
}

export function Page({ title, description, actions, children, wide }: { title: string; description?: string; actions?: ReactNode; children: ReactNode; wide?: boolean }) {
	return (
		<div className={cn("mx-auto w-full px-4 py-6 sm:px-6 sm:py-8", wide ? "max-w-6xl" : "max-w-5xl")}>
			<div className="mb-6 flex flex-wrap items-end justify-between gap-3">
				<div>
					<h1 className="text-xl font-semibold tracking-tight">{title}</h1>
					{description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
				</div>
				{actions ? <div className="flex items-center gap-2">{actions}</div> : null}
			</div>
			{children}
		</div>
	);
}
