import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { GithubIcon, Logout01Icon, Menu01Icon, Moon02Icon, Search01Icon, Settings01Icon, Sun03Icon, ComputerTerminal01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/Icon";
import { Logo } from "@/components/Logo";
import { Kbd } from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Menu, MenuContent, MenuItem, MenuLabel, MenuRadioGroup, MenuRadioItem, MenuSeparator, MenuTrigger } from "@/components/ui/menu";
import { Sheet, SheetClose, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/lib/auth";
import { NAV, SITE } from "@/lib/config";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function ThemeMenu() {
	const { theme, setTheme, resolved } = useTheme();
	return (
		<Menu>
			<MenuTrigger asChild>
				<Button variant="ghost" size="icon" aria-label="Change theme">
					<Icon icon={resolved === "dark" ? Moon02Icon : Sun03Icon} size={16} />
				</Button>
			</MenuTrigger>
			<MenuContent align="end">
				<MenuLabel>Theme</MenuLabel>
				<MenuRadioGroup value={theme} onValueChange={(v) => setTheme(v as "light" | "dark" | "system")}>
					<MenuRadioItem value="light">Light</MenuRadioItem>
					<MenuRadioItem value="dark">Dark</MenuRadioItem>
					<MenuRadioItem value="system">System</MenuRadioItem>
				</MenuRadioGroup>
			</MenuContent>
		</Menu>
	);
}

function UserMenu() {
	const { user, signOut, isPro } = useAuth();
	const navigate = useNavigate();
	if (!user) return null;
	return (
		<Menu>
			<MenuTrigger asChild>
				<button type="button" className="relative grid size-8 place-items-center overflow-hidden rounded-full border border-border bg-muted text-xs font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label="Account menu">
					{user.photo ? <img src={user.photo} alt="" referrerPolicy="no-referrer" className="size-full object-cover" /> : (user.name || user.email || "?").slice(0, 1).toUpperCase()}
					{isPro ? <span className="absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full border-2 border-background bg-brand" /> : null}
				</button>
			</MenuTrigger>
			<MenuContent align="end" className="w-56">
				<div className="px-2 py-1.5">
					<p className="truncate text-sm font-medium">{user.name}</p>
					<p className="truncate text-xs text-muted-foreground">{user.email}</p>
				</div>
				<MenuSeparator />
				<MenuItem onSelect={() => navigate({ to: "/settings" })}>
					<Icon icon={Settings01Icon} size={15} /> Settings {isPro ? <span className="ml-auto text-[10px] font-semibold text-brand">PREMIUM</span> : null}
				</MenuItem>
				<MenuItem onSelect={() => navigate({ to: "/dashboard" })}>
					<Icon icon={ComputerTerminal01Icon} size={15} /> Studio
				</MenuItem>
				<MenuSeparator />
				<MenuItem
					onSelect={async () => {
						await signOut().catch(() => {});
						toast.success("Signed out");
					}}
				>
					<Icon icon={Logout01Icon} size={15} /> Sign out
				</MenuItem>
			</MenuContent>
		</Menu>
	);
}

export function Navbar({ onSearch }: { onSearch: () => void }) {
	const { user, ready, isPro } = useAuth();
	const path = useRouterState({ select: (s) => s.location.pathname });
	const isActive = (to: string) => (to === "/" ? path === "/" || path.startsWith("/skills") : path === to || path.startsWith(`${to}/`));
	return (
		<header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
			<div className="mx-auto flex h-14 w-full max-w-7xl items-center gap-2 px-4 sm:px-6">
				<Link to="/" aria-label="cizle home" className="mr-2 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring">
					<Logo />
				</Link>
				<nav aria-label="Main" className="hidden items-center gap-0.5 md:flex">
					{NAV.map((n) => (
						<Link key={n.to} to={n.to} className={cn("rounded-md px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground", isActive(n.to) && "bg-accent font-medium text-foreground")}>
							{n.label}
						</Link>
					))}
				</nav>
				<div className="ml-auto flex items-center gap-1.5">
					<button type="button" onClick={onSearch} className="hidden h-9 w-56 items-center gap-2 rounded-lg border border-input bg-surface px-3 text-sm text-muted-foreground transition-colors hover:bg-accent lg:flex" aria-label="Search skills and pages">
						<Icon icon={Search01Icon} size={15} />
						<span className="flex-1 text-left">Search skills…</span>
						<Kbd>⌘K</Kbd>
					</button>
					<Button variant="ghost" size="icon" className="lg:hidden" onClick={onSearch} aria-label="Search skills and pages">
						<Icon icon={Search01Icon} size={16} />
					</Button>
					<Button variant="ghost" size="icon" asChild className="hidden sm:inline-flex">
						<a href={SITE.github} target="_blank" rel="noreferrer" aria-label="cizle on GitHub">
							<Icon icon={GithubIcon} size={16} />
						</a>
					</Button>
					<ThemeMenu />
					{!ready ? <span className="h-8 w-16" /> : user ? (
						<>
							{!isPro ? (
								<Button size="sm" asChild className="hidden sm:inline-flex">
									<Link to="/pricing">Get Premium</Link>
								</Button>
							) : null}
							<UserMenu />
						</>
					) : (
						<>
							<Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
								<Link to="/login" search={{}}>
									Sign in
								</Link>
							</Button>
							<Button size="sm" asChild className="hidden sm:inline-flex">
								<Link to="/pricing">Get Premium</Link>
							</Button>
						</>
					)}
					<Sheet>
						<SheetTrigger asChild>
							<Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
								<Icon icon={Menu01Icon} size={18} />
							</Button>
						</SheetTrigger>
						<SheetContent title="Menu">
							<div className="mb-3 flex items-center justify-between">
								<Logo />
							</div>
							<nav aria-label="Mobile" className="flex flex-col gap-0.5">
								{NAV.map((n) => (
									<SheetClose asChild key={n.to}>
										<Link to={n.to} className={cn("rounded-lg px-3 py-2.5 text-[15px]", isActive(n.to) ? "bg-accent font-medium" : "text-muted-foreground")}>
											{n.label}
										</Link>
									</SheetClose>
								))}
								<SheetClose asChild>
									<Link to="/contact" className="rounded-lg px-3 py-2.5 text-[15px] text-muted-foreground">
										Contact
									</Link>
								</SheetClose>
							</nav>
							<div className="mt-auto flex flex-col gap-2 pt-4">
								{user ? (
									<SheetClose asChild>
										<Button variant="outline" asChild>
											<Link to="/settings">Settings</Link>
										</Button>
									</SheetClose>
								) : (
									<SheetClose asChild>
										<Button variant="outline" asChild>
											<Link to="/login" search={{}}>
												Sign in
											</Link>
										</Button>
									</SheetClose>
								)}
								{!isPro ? (
									<SheetClose asChild>
										<Button asChild>
											<Link to="/pricing">Get Premium</Link>
										</Button>
									</SheetClose>
								) : null}
							</div>
						</SheetContent>
					</Sheet>
				</div>
			</div>
		</header>
	);
}
