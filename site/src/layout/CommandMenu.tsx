import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { BookOpen01Icon, CreditCardIcon, GithubIcon, LockIcon, Logout01Icon, Mail01Icon, Moon02Icon, Search01Icon, Settings01Icon, SparklesIcon, Sun03Icon, UserIcon } from "@hugeicons/core-free-icons";
import { toast } from "sonner";
import { Icon } from "@/components/Icon";
import { Badge } from "@/components/ui/badge";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, Kbd } from "@/components/ui/command";
import { Dialog, DialogContent } from "@/components/ui/menu";
import { useAuth } from "@/lib/auth";
import { SITE } from "@/lib/config";
import { usePosts, useSkills, useFuse } from "@/lib/data";
import { useTheme } from "@/lib/theme";

type Action = { id: string; label: string; icon: Parameters<typeof Icon>[0]["icon"]; run: () => void; hint?: string; keywords?: string };

/** ⌘K / Ctrl+K: jump to any page, any skill or any article, and run account actions. Skills use the same Fuse index as the home page. */
export function CommandMenu({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
	const navigate = useNavigate();
	const { user, signOut, isPro } = useAuth();
	const { resolved, setTheme } = useTheme();
	const skills = useSkills();
	const posts = usePosts();
	const fuse = useFuse(skills.data?.skills);
	const [q, setQ] = useState("");

	const go = (fn: () => void) => () => {
		onOpenChange(false);
		setQ("");
		fn();
	};
	const actions: Action[] = useMemo(
		() => [
			{ id: "skills", label: "Browse all skills", icon: Search01Icon, run: () => navigate({ to: "/" }), keywords: "home library" },
			{ id: "gallery", label: "Prompt gallery", icon: SparklesIcon, run: () => navigate({ to: "/gallery" }), keywords: "community prompts opus motion video" },
			{ id: "pricing", label: "Pricing", icon: CreditCardIcon, run: () => navigate({ to: "/pricing" }), keywords: "plans subscribe premium" },
			{ id: "docs", label: "Docs: how to use skills", icon: BookOpen01Icon, run: () => navigate({ to: "/docs" }), keywords: "help guide install mcp" },
			{ id: "blog", label: "Blog", icon: SparklesIcon, run: () => navigate({ to: "/blog" }), keywords: "articles examples" },
			{ id: "mcp", label: "Use cizle in Claude (MCP)", icon: SparklesIcon, run: () => navigate({ to: "/connect" }), keywords: "claude connect mcp cli token" },
			{ id: "faq", label: "FAQ", icon: BookOpen01Icon, run: () => navigate({ to: "/faq" }), keywords: "questions" },
			{ id: "contact", label: "Contact", icon: Mail01Icon, run: () => navigate({ to: "/contact" }), keywords: "support email" },
			...(user
				? [
						{ id: "settings", label: "Settings and billing", icon: Settings01Icon, run: () => navigate({ to: "/settings" }), keywords: "account subscription" },
						{ id: "out", label: "Sign out", icon: Logout01Icon, run: () => void signOut().then(() => toast.success("Signed out")).catch(() => {}) },
					]
				: [{ id: "in", label: "Sign in", icon: UserIcon, run: () => navigate({ to: "/login", search: {} }), keywords: "login account" }]),
			...(isPro ? [] : [{ id: "upgrade", label: `Get Premium · from $${Math.min(...SITE.plans.map((p) => p.usd))}/month`, icon: LockIcon, run: () => navigate({ to: "/pricing" }), keywords: "upgrade unlock pay" }]),
			{ id: "theme", label: resolved === "dark" ? "Switch to light theme" : "Switch to dark theme", icon: resolved === "dark" ? Sun03Icon : Moon02Icon, run: () => setTheme(resolved === "dark" ? "light" : "dark"), keywords: "dark light mode" },
			{ id: "gh", label: "cizle on GitHub", icon: GithubIcon, run: () => window.open(SITE.github, "_blank", "noopener"), keywords: "source code" },
		],
		[navigate, user, isPro, resolved, setTheme, signOut],
	);

	const term = q.trim().toLowerCase();
	const shownActions = term ? actions.filter((a) => `${a.label} ${a.keywords || ""}`.toLowerCase().includes(term)) : actions.slice(0, 6);
	const shownSkills = term ? fuse.search(term).slice(0, 8).map((r) => r.item) : (skills.data?.skills || []).filter((s) => s.featured).slice(0, 6);
	const shownPosts = term ? (posts.data || []).filter((p) => `${p.title} ${p.description} ${p.tags.join(" ")}`.toLowerCase().includes(term)).slice(0, 3) : [];

	return (
		<Dialog
			open={open}
			onOpenChange={(o) => {
				onOpenChange(o);
				if (!o) setQ("");
			}}
		>
			<DialogContent title="Search skills and pages" className="top-[10vh] max-w-xl sm:top-[14vh]">
				<Command shouldFilter={false} loop>
					<CommandInput autoFocus value={q} onValueChange={setQ} placeholder="Search skills, pages and articles…" />
					<CommandList>
						<CommandEmpty>No results for “{q}”. Try “ad”, “faq” or “launch”.</CommandEmpty>
						{shownSkills.length ? (
							<CommandGroup heading={term ? "Skills" : "Popular skills"}>
								{shownSkills.map((s) => (
									<CommandItem key={s.slug} value={`skill-${s.slug}`} onSelect={go(() => navigate({ to: "/skills/$slug", params: { slug: s.slug }, search: {} }))}>
										<Icon icon={s.tier === "premium" ? LockIcon : SparklesIcon} size={15} className="text-muted-foreground" />
										<span className="min-w-0 flex-1 truncate">{s.name}</span>
										<span className="hidden text-xs text-muted-foreground sm:inline">{s.category}</span>
										<Badge tone={s.tier === "free" ? "success" : "warning"}>{s.tier === "free" ? "Free" : "Pro"}</Badge>
									</CommandItem>
								))}
							</CommandGroup>
						) : null}
						{shownPosts.length ? (
							<CommandGroup heading="Articles">
								{shownPosts.map((p) => (
									<CommandItem key={p.slug} value={`post-${p.slug}`} onSelect={go(() => navigate({ to: "/blog/$slug", params: { slug: p.slug } }))}>
										<Icon icon={BookOpen01Icon} size={15} className="text-muted-foreground" />
										<span className="min-w-0 flex-1 truncate">{p.title}</span>
									</CommandItem>
								))}
							</CommandGroup>
						) : null}
						{shownActions.length ? (
							<CommandGroup heading={term ? "Pages and actions" : "Go to"}>
								{shownActions.map((a) => (
									<CommandItem key={a.id} value={`action-${a.id}`} onSelect={go(a.run)}>
										<Icon icon={a.icon} size={15} className="text-muted-foreground" />
										{a.label}
									</CommandItem>
								))}
							</CommandGroup>
						) : null}
					</CommandList>
					<div className="flex items-center justify-between border-t border-border px-3 py-2 text-xs text-muted-foreground">
						<span className="flex items-center gap-1.5">
							<Kbd>↑</Kbd>
							<Kbd>↓</Kbd> to move <Kbd>↵</Kbd> to open
						</span>
						<span className="flex items-center gap-1.5">
							<Kbd>esc</Kbd> to close
						</span>
					</div>
				</Command>
			</DialogContent>
		</Dialog>
	);
}
