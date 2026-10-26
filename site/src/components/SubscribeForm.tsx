import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { firebaseConfigured, loadFirebase } from "@/lib/firebase";

const KEY = "cizle-subscribed";
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const remembered = () => {
	try {
		return localStorage.getItem(KEY) === "1";
	} catch {
		return false;
	}
};

/** Collects an email into Firestore (`subscribers/<email>`, create-only: see firestore.rules). Asking twice with the same address counts as done. */
export function SubscribeForm({ source = "landing", className, stacked = false, cta = "Get new prompts" }: { source?: string; className?: string; stacked?: boolean; cta?: string }) {
	const [email, setEmail] = useState("");
	const [trap, setTrap] = useState("");
	const [busy, setBusy] = useState(false);
	const [done, setDone] = useState(remembered);

	async function submit(e: React.FormEvent) {
		e.preventDefault();
		const value = email.trim().toLowerCase();
		if (!EMAIL.test(value)) return void toast.error("Enter a valid email address");
		if (trap) return setDone(true); // a bot filled the hidden field: pretend it worked
		if (!firebaseConfigured) return void toast.error("Sign-ups are not set up yet. Try again soon.");
		setBusy(true);
		try {
			const { db, fsMod } = await loadFirebase();
			await fsMod.setDoc(fsMod.doc(db, "subscribers", value), { email: value, source, createdAt: fsMod.serverTimestamp() });
			setDone(true);
		} catch (err) {
			// the rules only allow creating a subscriber, so an address that is already there is refused: that is a success to the visitor
			if ((err as { code?: string })?.code === "permission-denied") setDone(true);
			else toast.error("Could not save your email. Try again.");
		} finally {
			setBusy(false);
		}
		try {
			localStorage.setItem(KEY, "1");
		} catch {
			/* private window */
		}
	}

	if (done) return <p className={className} role="status">You are on the list. New prompts land in your inbox.</p>;
	return (
		<form onSubmit={submit} className={className} aria-label="Get new prompts by email">
			<div className={stacked ? "flex flex-col gap-2" : "flex flex-col gap-2 sm:flex-row"}>
				<Input type="email" inputMode="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" aria-label="Email address" className={stacked ? "" : "sm:max-w-xs"} />
				{/* bots fill every field; people never see this one */}
				<input type="text" tabIndex={-1} autoComplete="off" aria-hidden value={trap} onChange={(e) => setTrap(e.target.value)} className="absolute -left-[9999px] size-0 opacity-0" />
				<Button type="submit" size="lg" disabled={busy}>
					{busy ? "Adding…" : cta}
				</Button>
			</div>
			<p className="mt-2 text-sm text-muted-foreground">One email when new prompts land. No spam, leave any time.</p>
		</form>
	);
}
