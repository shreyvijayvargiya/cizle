import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { ComputerIcon, Bookmark01Icon, Logout01Icon, Menu01Icon, Moon02Icon, Search01Icon, Settings01Icon, Sun03Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/Icon";
import { Logo } from "@/components/Logo";
import { Kbd } from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Menu, MenuContent, MenuItem, MenuLabel, MenuRadioGroup, MenuRadioItem, MenuSeparator, MenuTrigger } from "@/components/ui/menu";
import { Sheet, SheetClose, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/lib/auth";
import { requestShuffle } from "@/lib/gallery";
import { NAV, PREMIUM } from "@/lib/config";
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
					<MenuRadioItem value="light" icon={Sun03Icon}>Light</MenuRadioItem>
					<MenuRadioItem value="dark" icon={Moon02Icon}>Dark</MenuRadioItem>
					<MenuRadioItem value="system" icon={ComputerIcon}>System</MenuRadioItem>
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
				<button type="button" className="relative grid size-8 place-items-center overflow-hidden rounded-full bg-muted text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label="Account menu">
					{user.photo ? <img src={user.photo} alt="" referrerPolicy="no-referrer" className="size-full object-cover" /> : (user.name || user.email || "?").slice(0, 1).toUpperCase()}
					{isPro ? <span className="absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full bg-brand" /> : null}
				</button>
			</MenuTrigger>
			<MenuContent align="end" className="w-56">
				<div className="px-2 py-1.5">
					<p className="truncate text-sm font-medium">{user.name}</p>
					<p className="truncate text-xs text-muted-foreground">{user.email}</p>
				</div>
				<MenuSeparator />
				<MenuItem onSelect={() => navigate({ to: "/saved" })}>
					<Icon icon={Bookmark01Icon} size={15} /> Saved
				</MenuItem>
				<MenuItem onSelect={() => navigate({ to: "/settings" })}>
					<Icon icon={Settings01Icon} size={15} /> Settings {isPro ? <span className="ml-auto text-sm font-semibold text-brand">Premium</span> : null}
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
	// The top row is itself a row of tiles: the mark, the links, the tools, the one action. Solid, no blur, no line.
	return (
		<header className="board sticky top-0 z-40 bg-background pt-3 pb-2">
			<div className="board-w flex h-[60px] items-stretch gap-2">
				<Link to="/" aria-label="cizle home: shuffle the videos" onClick={() => (requestShuffle(), window.scrollTo({ top: 0, behavior: "smooth" }))} className="press reveal flex shrink-0 items-center rounded-lg bg-surface px-3.5 outline-none focus-visible:ring-2 focus-visible:ring-ring lg:px-4">
					<Logo className="[&_svg]:h-[28px]" />
				</Link>
				<nav aria-label="Main" className="reveal hidden min-w-0 flex-1 items-center gap-1 overflow-x-auto rounded-lg bg-surface px-2 [scrollbar-width:none] lg:flex [&::-webkit-scrollbar]:hidden" style={{ ["--i" as string]: 1 }}>
					{NAV.map((n) => (
						<Link key={n.to} to={n.to} className={cn("press rounded-md px-3.5 py-2 text-base text-foreground transition-colors hover:bg-tile-2", isActive(n.to) && "bg-field-1 font-medium text-field-1-ink hover:bg-field-1")}>
							{n.label}
						</Link>
					))}
				</nav>
				<div className="ml-auto flex items-stretch gap-2 lg:ml-0">
					<button type="button" onClick={onSearch} style={{ ["--i" as string]: 2 }} className="press reveal flex w-[60px] items-center justify-center gap-2 rounded-lg bg-surface px-4 text-base text-foreground transition-colors hover:bg-tile-2 md:w-40 md:justify-start lg:w-60" aria-label="Search skills and prompts">
						<Icon icon={Search01Icon} size={18} />
						<span className="hidden flex-1 text-left md:inline">Search</span>
						<Kbd className="hidden lg:inline-flex">⌘K</Kbd>
					</button>
					<div className="hidden items-center rounded-lg bg-surface px-1 lg:flex">
						<ThemeMenu />
					</div>
					{!ready ? null : user ? (
						<>
							{!isPro && PREMIUM ? (
								<Link to="/pricing" className="press hidden items-center rounded-lg bg-field-1 px-5 text-base font-medium text-field-1-ink transition-colors hover:bg-field-1/85 sm:flex">
									Get Premium
								</Link>
							) : null}
							<div className="flex items-center rounded-lg bg-surface px-3">
								<UserMenu />
							</div>
						</>
					) : (
						<>
							<Link to="/saved" aria-label="Saved" title="Saved" className="press hidden items-center rounded-lg bg-surface px-4 text-foreground transition-colors hover:bg-tile-2 lg:flex">
								<Icon icon={Bookmark01Icon} size={18} />
							</Link>
							<Link to="/login" search={{}} className="press hidden items-center rounded-lg bg-surface px-5 text-base text-foreground transition-colors hover:bg-tile-2 lg:flex">
								Sign in
							</Link>
							{PREMIUM ? (
								<Link to="/pricing" className="press hidden items-center rounded-lg bg-field-1 px-5 text-base font-medium text-field-1-ink transition-colors hover:bg-field-1/85 sm:flex">
									Get Premium
								</Link>
							) : (
								<Link to="/subscribe" className="press hidden items-center rounded-lg bg-field-1 px-5 text-base font-medium text-field-1-ink transition-colors hover:bg-field-1/85 sm:flex">
									Subscribe
								</Link>
							)}
						</>
					)}
					<Sheet>
						<SheetTrigger asChild>
							<button type="button" className="press flex w-[60px] items-center justify-center rounded-lg bg-surface text-foreground lg:hidden" aria-label="Open menu">
								<Icon icon={Menu01Icon} size={22} />
							</button>
						</SheetTrigger>
						<SheetContent title="Menu">
							<div className="mb-3 flex items-center justify-between">
								<Logo />
								<ThemeMenu />
							</div>
							<nav aria-label="Mobile" className="flex flex-col gap-1">
								{NAV.map((n) => (
									<SheetClose asChild key={n.to}>
										<Link to={n.to} className={cn("rounded-lg px-4 py-3 text-lg", isActive(n.to) ? "bg-field-1 font-medium text-field-1-ink" : "bg-surface text-foreground")}>
											{n.label}
										</Link>
									</SheetClose>
								))}
								<SheetClose asChild>
									<Link to="/saved" className="rounded-lg bg-surface px-4 py-3 text-lg text-foreground">
										Saved
									</Link>
								</SheetClose>
								<SheetClose asChild>
									<Link to="/contact" className="rounded-lg bg-surface px-4 py-3 text-lg text-foreground">
										Contact
									</Link>
								</SheetClose>
							</nav>
							<div className="mt-auto flex flex-col gap-2 pt-4">
								{user ? (
									<SheetClose asChild>
										<Button variant="outline" size="lg" asChild>
											<Link to="/settings">Settings</Link>
										</Button>
									</SheetClose>
								) : (
									<SheetClose asChild>
										<Button variant="outline" size="lg" asChild>
											<Link to="/login" search={{}}>
												Sign in
											</Link>
										</Button>
									</SheetClose>
								)}
								{!isPro && PREMIUM ? (
									<SheetClose asChild>
										<Button variant="brand" size="lg" asChild>
											<Link to="/pricing">Get Premium</Link>
										</Button>
									</SheetClose>
								) : null}
								{!PREMIUM && !user ? (
									<SheetClose asChild>
										<Button variant="brand" size="lg" asChild>
											<Link to="/subscribe">Subscribe</Link>
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
