import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { Dialog as D } from "radix-ui";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { AuthForm } from "@/components/AuthForm";
import { Icon } from "@/components/Icon";
import { useAuth } from "@/lib/auth";
import { track } from "@/lib/funnel";

/** What a visitor who is not signed in sees on the landing page and in the gallery: this many random video prompts, then the sign-in wall. */
export const GUEST_LIMIT = 24;

type Gate = { locked: boolean; ready: boolean; openGate: (why?: string) => void };
const Ctx = createContext<Gate>({ locked: false, ready: false, openGate: () => {} });
export const useGate = () => useContext(Ctx);

/**
 * The sign-in wall. `locked` is true for a visitor without an account (and while the sign-in state is still loading, so a guest never
 * flashes the full library). It stays false when Firebase is not configured, so a build without keys is not locked out of its own gallery.
 * `openGate(why)` shows the modal; it opens nothing until the sign-in state is known, and never for crawlers.
 */
export function GateProvider({ children }: { children: ReactNode }) {
	const { user, ready, configured } = useAuth();
	const [open, setOpen] = useState(false);
	const [why, setWhy] = useState("");
	const locked = configured && !user;

	const openGate = useCallback(
		(reason = "") => {
			if (!configured || !ready || user) return;
			if (typeof navigator !== "undefined" && /bot|crawl|spider|headless|lighthouse|prerender/i.test(navigator.userAgent)) return;
			setWhy(reason);
			setOpen(true);
			track("gate_views", { once: true });
		},
		[configured, ready, user],
	);
	useEffect(() => {
		if (user) setOpen(false);
	}, [user]);

	const value = useMemo(() => ({ locked, ready, openGate }), [locked, ready, openGate]);
	return (
		<Ctx.Provider value={value}>
			{children}
			<D.Root open={open && !user} onOpenChange={setOpen}>
				<D.Portal>
					<D.Overlay className="fixed inset-0 z-[70] bg-black/55 backdrop-blur-sm data-[state=open]:animate-[fade-in_.15s_ease-out]" />
					<D.Content aria-describedby="gate-desc" className="fixed top-1/2 left-1/2 z-[70] max-h-[calc(100dvh-1.5rem)] w-[min(26rem,calc(100vw-1.5rem))] -translate-x-1/2 -translate-y-1/2 overflow-y-auto overscroll-contain rounded-2xl bg-background p-6 shadow-2xl outline-none [animation:pop-in-c_.2s_var(--ease-out)] sm:p-7">
						<D.Close asChild>
							<button type="button" aria-label="Close" className="absolute top-3 right-3 grid size-9 place-items-center rounded-full text-muted-foreground outline-none hover:bg-tile-2 focus-visible:ring-2 focus-visible:ring-ring">
								<Icon icon={Cancel01Icon} size={17} />
							</button>
						</D.Close>
						<D.Title className="display pr-8" style={{ fontSize: "clamp(1.9rem, 5vw, 2.6rem)" }}>Sign in to see everything</D.Title>
						<D.Description id="gate-desc" className="mt-2 mb-5 text-base text-muted-foreground">
							Free account, no card. {why ? `Sign in to ${why}.` : "Browse, search and open every prompt."}
						</D.Description>
						<AuthForm onDone={() => setOpen(false)} />
						<button type="button" onClick={() => setOpen(false)} className="mt-4 w-full text-center text-sm text-muted-foreground underline underline-offset-2 hover:text-foreground">
							Keep looking at the {GUEST_LIMIT} samples
						</button>
					</D.Content>
				</D.Portal>
			</D.Root>
		</Ctx.Provider>
	);
}
