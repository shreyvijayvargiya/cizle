import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { toast } from "sonner";
import { CheckmarkCircle02Icon, Loading03Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/Icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { OptionSelect } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/misc";
import { useAuth } from "@/lib/auth";
import { fromLabel, portalUrl } from "@/lib/billing";
import { celebrate } from "@/lib/confetti";
import { DEV_UNLOCK, SITE } from "@/lib/config";
import { useHead } from "@/lib/head";
import { useTheme } from "@/lib/theme";

const fmt = (d: Date | null) => (d ? d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }) : "");

/**
 * Where Dodo sends people back after paying (?payment=success). The webhook flips users/{uid} a few seconds later; this page is
 * subscribed to that document, so it celebrates and updates the moment Premium is live, without a reload.
 */
export function SettingsPage() {
	const { user, ready, sub, isPro, signOut, configured } = useAuth();
	const { theme, setTheme } = useTheme();
	const navigate = useNavigate();
	const search = useSearch({ strict: false }) as { payment?: string; status?: string };
	const paid = search.payment === "success" && !["failed", "cancelled", "canceled"].includes(String(search.status || "").toLowerCase());
	const [waiting, setWaiting] = useState(paid);
	const [slow, setSlow] = useState(false);
	const celebrated = useRef(false);
	useHead({ title: "Settings and billing | cizle", description: "Your cizle account and subscription.", path: "/settings", noindex: true });

	useEffect(() => {
		if (search.payment && search.payment !== "success") toast.error("The payment did not go through. You were not charged. Try again from the pricing page.");
		if (search.status && ["failed", "cancelled", "canceled"].includes(search.status.toLowerCase())) toast.error("The payment was not completed. You were not charged.");
	}, [search.payment, search.status]);

	useEffect(() => {
		if (!paid) return;
		if (isPro && !celebrated.current) {
			celebrated.current = true;
			setWaiting(false);
			celebrate();
			toast.success("Payment received. Premium is unlocked!", { description: "Every premium skill is now open to you." });
			navigate({ to: "/settings", search: {}, replace: true });
			return;
		}
		if (!isPro) {
			const t = setTimeout(() => setSlow(true), 25_000);
			return () => clearTimeout(t);
		}
	}, [paid, isPro, navigate]);

	if (!ready) return <div className="mx-auto max-w-3xl space-y-4 px-4 py-12"><Skeleton className="h-8 w-48" /><Skeleton className="h-40" /><Skeleton className="h-40" /></div>;
	if (!user) {
		return (
			<div className="mx-auto w-full max-w-md px-4 py-24 text-center">
				<h1 className="display" style={{ fontSize: "clamp(2.25rem, 5vw, 4rem)" }}>Sign in to see your settings</h1>
				<p className="mt-1 text-sm text-muted-foreground">Your subscription and account live here.</p>
				<Button className="mt-5" asChild><Link to="/login" search={{ next: "/settings" }}>Sign in</Link></Button>
			</div>
		);
	}
	const portal = portalUrl();
	return (
		<div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
			<h1 className="display" style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)" }}>Settings</h1>
			<p className="mt-1 text-sm text-muted-foreground">Your account, subscription and preferences.</p>

			{waiting && !isPro ? (
				<div role="status" className="mt-6 flex items-start gap-3 rounded-lg border border-brand/30 bg-brand/5 p-4">
					<Icon icon={Loading03Icon} size={18} className="mt-0.5 animate-spin text-brand" />
					<div>
						<p className="text-sm font-medium">Confirming your payment…</p>
						<p className="mt-0.5 text-xs text-muted-foreground">This usually takes a few seconds. This page updates by itself, no need to refresh.{slow ? <> It is taking longer than usual. If Premium is still locked in a minute, <Link to="/contact" className="underline underline-offset-2">contact us</Link> with the email you paid with.</> : null}</p>
					</div>
				</div>
			) : null}

			<div className="mt-6 space-y-5">
				<Card>
					<CardHeader><CardTitle>Account</CardTitle><CardDescription>Signed in with {user.email ? "email or Google" : "Google"}.</CardDescription></CardHeader>
					<CardContent className="flex flex-wrap items-center justify-between gap-4">
						<div className="flex min-w-0 items-center gap-3">
							<span className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-full border border-border bg-muted text-sm font-semibold">{user.photo ? <img src={user.photo} alt="" referrerPolicy="no-referrer" className="size-full object-cover" /> : (user.name || "?").slice(0, 1).toUpperCase()}</span>
							<div className="min-w-0"><p className="truncate text-sm font-medium">{user.name}</p><p className="truncate text-sm text-muted-foreground">{user.email}</p></div>
						</div>
						<Button variant="outline" onClick={async () => { await signOut().catch(() => {}); toast.success("Signed out"); navigate({ to: "/" }); }}>Sign out</Button>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<div className="flex items-center justify-between gap-2"><CardTitle>Subscription</CardTitle><Badge tone={isPro ? "success" : "outline"}>{isPro ? "Premium" : "Free"}</Badge></div>
						<CardDescription>{isPro ? (sub.cancelAtPeriodEnd ? `Your plan ends on ${fmt(sub.proUntil)}. You keep every premium skill until then.` : sub.proUntil ? `Active. Renews on ${fmt(sub.proUntil)}.` : "Active.") : `You are on the free plan with ${SITE.freeCount} skills.`}</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						{isPro ? (
							<ul className="space-y-1.5 text-sm">
								{["Every premium skill, in full", "SKILL.md and install commands", "New skills as they are published"].map((t) => <li key={t} className="flex gap-2"><Icon icon={CheckmarkCircle02Icon} size={16} className="mt-0.5 text-success" />{t}</li>)}
							</ul>
						) : (
							<p className="text-sm text-muted-foreground">Unlock ad formats, engineering formats and 20 film styles from {fromLabel("USD")} or {fromLabel("INR")} a month.</p>
						)}
						<div className="flex flex-wrap gap-2">
							{isPro ? (
								<>
									<Button asChild><Link to="/">Browse premium skills</Link></Button>
									{portal ? <Button variant="outline" asChild><a href={portal} target="_blank" rel="noreferrer">Manage billing</a></Button> : <Button variant="outline" asChild><Link to="/contact">Cancel or change plan</Link></Button>}
								</>
							) : (
								<Button asChild><Link to="/pricing">Get Premium</Link></Button>
							)}
						</div>
						{!configured && !DEV_UNLOCK ? <p className="text-xs text-warning">Firebase is not configured here, so subscription status cannot load.</p> : null}
					</CardContent>
				</Card>

				<Card>
					<CardHeader><CardTitle>Preferences</CardTitle><CardDescription>Saved in this browser.</CardDescription></CardHeader>
					<CardContent className="flex items-center justify-between gap-4">
						<label htmlFor="s-theme" className="text-sm">Theme</label>
						<OptionSelect id="s-theme" value={theme} onValueChange={(v) => setTheme(v as "light" | "dark" | "system")} options={[{ value: "system", label: "System" }, { value: "light", label: "Light" }, { value: "dark", label: "Dark" }]} className="w-40" />
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
