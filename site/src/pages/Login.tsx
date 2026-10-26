import { useState } from "react";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { toast } from "sonner";
import { Alert02Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/Icon";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/misc";
import { friendlyAuthError, useAuth } from "@/lib/auth";
import { useHead } from "@/lib/head";

const GoogleMark = () => (
	<svg width="16" height="16" viewBox="0 0 48 48" aria-hidden><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z" /><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z" /><path fill="#FBBC05" d="M10.5 28.7a14.5 14.5 0 0 1 0-9.4l-7.9-6.1a24 24 0 0 0 0 21.6l7.9-6.1z" /><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.9 2.3-8.4 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z" /></svg>
);

export function LoginPage() {
	const { signInGoogle, signInEmail, signUpEmail, resetPassword, user, configured } = useAuth();
	const search = useSearch({ strict: false }) as { next?: string };
	const navigate = useNavigate();
	const [mode, setMode] = useState<"in" | "up">("in");
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState("");
	useHead({ title: "Sign in | cizle", description: "Sign in to unlock premium cizle skills.", path: "/login", noindex: true });

	const done = () => {
		toast.success(mode === "up" ? "Account created. Welcome to cizle." : "Signed in");
		const next = search.next && search.next.startsWith("/") && !search.next.startsWith("//") ? search.next : "/";
		navigate({ to: next as "/" });
	};
	const run = async (fn: () => Promise<void>) => {
		setBusy(true);
		setError("");
		try {
			await fn();
			done();
		} catch (e) {
			setError(friendlyAuthError(e));
		} finally {
			setBusy(false);
		}
	};

	const forgot = async () => {
		if (!email) return setError("Enter your email first, then press Forgot password.");
		setBusy(true);
		setError("");
		try {
			await resetPassword(email);
			toast.success("Password reset email sent. Check your inbox.");
		} catch (e) {
			setError(friendlyAuthError(e));
		} finally {
			setBusy(false);
		}
	};

	if (user) {
		return (
			<div className="mx-auto w-full max-w-sm px-4 py-24 text-center">
				<p className="text-sm text-muted-foreground">You are signed in as <strong className="text-foreground">{user.email}</strong>.</p>
				<Button className="mt-4" asChild><Link to="/">Browse skills</Link></Button>
			</div>
		);
	}
	return (
		<div className="mx-auto w-full max-w-sm px-4 py-12 sm:py-20">
			<h1 className="display" style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)" }}>{mode === "in" ? "Welcome back" : "Create your account"}</h1>
			<p className="mt-1 text-sm text-muted-foreground">{mode === "in" ? "Sign in to unlock your Premium skills." : "Free to join. Upgrade whenever you like."}</p>
			{!configured ? (
				<p className="mt-4 flex gap-2 rounded-lg border border-warning/30 bg-warning/10 p-3 text-xs text-warning"><Icon icon={Alert02Icon} size={15} className="mt-0.5" />{import.meta.env.DEV ? "Local build: add the Firebase keys to site/.env to enable sign-in." : "Sign-in is temporarily unavailable. Please try again soon."}</p>
			) : null}
			<Tabs value={mode} onValueChange={(v) => { setMode(v as "in" | "up"); setError(""); }} className="mt-6">
				<TabsList className="w-full"><TabsTrigger value="in" className="flex-1 justify-center">Sign in</TabsTrigger><TabsTrigger value="up" className="flex-1 justify-center">Create account</TabsTrigger></TabsList>
			</Tabs>
			<Button variant="outline" className="mt-4 w-full" disabled={busy} onClick={() => run(signInGoogle)}><GoogleMark /> Continue with Google</Button>
			<div className="my-5 flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />or with email<span className="h-px flex-1 bg-border" /></div>
			<form className="space-y-3" onSubmit={(e) => { e.preventDefault(); run(() => (mode === "in" ? signInEmail(email, password) : signUpEmail(email, password, name))); }}>
				{mode === "up" ? <div className="space-y-1.5"><Label htmlFor="l-name">Name</Label><Input id="l-name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" /></div> : null}
				<div className="space-y-1.5"><Label htmlFor="l-email">Email</Label><Input id="l-email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" /></div>
				<div className="space-y-1.5">
					<div className="flex items-center justify-between"><Label htmlFor="l-pw">Password</Label>
						{mode === "in" ? <button type="button" className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground" onClick={forgot}>Forgot password?</button> : null}
					</div>
					<Input id="l-pw" type="password" required minLength={6} autoComplete={mode === "in" ? "current-password" : "new-password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" />
				</div>
				{error ? <p role="alert" className="rounded-lg border border-danger/30 bg-danger/5 p-2.5 text-xs text-danger">{error}</p> : null}
				<Button type="submit" className="w-full" disabled={busy}>{busy ? "One moment…" : mode === "in" ? "Sign in" : "Create account"}</Button>
			</form>
			<p className="mt-5 text-center text-xs text-muted-foreground">By continuing you agree to the <Link to="/terms" className="underline underline-offset-2">terms</Link> and <Link to="/privacy" className="underline underline-offset-2">privacy policy</Link>.</p>
		</div>
	);
}
