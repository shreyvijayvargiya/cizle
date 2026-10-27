import { useState } from "react";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { AuthForm } from "@/components/AuthForm";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useHead } from "@/lib/head";

export function LoginPage() {
	const { user } = useAuth();
	const search = useSearch({ strict: false }) as { next?: string };
	const navigate = useNavigate();
	const [mode, setMode] = useState<"in" | "up">("in");
	useHead({ title: "Sign in | cizle", description: "Sign in to unlock premium cizle skills.", path: "/login", noindex: true });

	const done = () => {
		const next = search.next && search.next.startsWith("/") && !search.next.startsWith("//") ? search.next : "/";
		navigate({ to: next as "/" });
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
			<p className="mt-1 mb-6 text-sm text-muted-foreground">{mode === "in" ? "Sign in to unlock your Premium skills." : "Free to join. Upgrade whenever you like."}</p>
			<AuthForm initialMode="in" onModeChange={setMode} onDone={done} />
		</div>
	);
}
