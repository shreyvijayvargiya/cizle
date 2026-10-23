import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { CopyButton } from "@/components/CopyButton";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { SITE } from "@/lib/config";
import { firebaseConfigured, loadFirebase } from "@/lib/firebase";
import { useHead } from "@/lib/head";

const MCP = `${SITE.url}/mcp`;
const TOOLS = [
	["search", "Find skills and prompts by what you want to make. Leave the query empty to browse. Pages of up to 50, with a cursor for the next page."],
	["get", "Open one item in full: the prompt, the SKILL.md and the install command."],
	["categories", "Every category, with how many free and premium items it holds."],
	["whoami", "Whether you are connected and whether Premium is active."],
] as const;
const ASKS = [
	"Find a free launch video skill and show me the top five prompts for it.",
	"List every free prompt about product demos in a table, page by page.",
	"Open the glass product render skill and use it for my product page.",
];

function Code({ children, label }: { children: string; label: string }) {
	return (
		<div className="mt-3">
			<pre className="overflow-x-auto rounded-lg bg-background/60 p-4 font-mono text-base leading-snug whitespace-pre-wrap break-all">{children}</pre>
			<div className="mt-2">
				<CopyButton text={children} label={label} done="Copied" variant="outline" />
			</div>
		</div>
	);
}

/** Connect cizle to Claude: the MCP address, a token for Premium, and the CLI. The free library needs no sign-in. */
export function ConnectPage() {
	const { user, isPro, ready } = useAuth();
	const [token, setToken] = useState("");
	const [busy, setBusy] = useState(false);
	const [tab, setTab] = useState<"code" | "desktop" | "cli">("code");

	useHead({
		title: "Use cizle inside Claude: the MCP server | cizle",
		description: "Connect cizle to Claude with one command. Search every video skill and prompt from the chat, open the free ones, and unlock Premium with a token. Also a CLI for Claude Code.",
		path: "/connect",
	});

	async function idToken() {
		if (!firebaseConfigured) throw new Error("Sign-in is not set up on this deployment yet.");
		const { auth } = await loadFirebase();
		const u = auth.currentUser;
		if (!u) throw new Error("Sign in first.");
		return u.getIdToken(true);
	}
	async function make() {
		setBusy(true);
		try {
			const res = await fetch("/api/v1/token", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ idToken: await idToken() }) });
			const body = await res.json().catch(() => ({}));
			if (!res.ok) throw new Error(body.error || "Could not make a token.");
			setToken(body.token);
			toast.success("Token made. Copy it now, it is only shown once.");
		} catch (e) {
			toast.error(e instanceof Error ? e.message : "Could not make a token.");
		} finally {
			setBusy(false);
		}
	}
	async function revoke() {
		setBusy(true);
		try {
			const res = await fetch("/api/v1/token/revoke", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ idToken: await idToken() }) });
			if (!res.ok) throw new Error("Could not revoke.");
			setToken("");
			toast.success("Every earlier token is revoked.");
		} catch (e) {
			toast.error(e instanceof Error ? e.message : "Could not revoke.");
		} finally {
			setBusy(false);
		}
	}

	const t = token || "YOUR_TOKEN";
	const free = `claude mcp add --transport http cizle ${MCP}`;
	const paid = `claude mcp add --transport http cizle ${MCP} --header "Authorization: Bearer ${t}"`;
	const desktop = JSON.stringify({ mcpServers: { cizle: { command: "npx", args: ["-y", "mcp-remote", MCP, ...(token || isPro ? ["--header", `Authorization: Bearer ${t}`] : [])] } } }, null, 2);
	const cli = `git clone ${SITE.github}\ncd cizle && npm install\nnode server/cli/cizle.js search "launch video"${token ? `\nnode server/cli/cizle.js login ${t}` : ""}`;

	return (
		<div className="board pt-6 pb-4">
			<div className="board-w">
				<h1 className="display reveal" style={{ fontSize: "clamp(2.75rem, 7vw, 7rem)" }}>
					Use cizle
					<br />
					inside Claude
				</h1>
				<p className="reveal mt-6 max-w-[48ch] text-lg" style={{ ["--i" as string]: 1 }}>
					One command, and Claude can search every skill and prompt in the library, show you a table, and open the one you pick. Free items need no sign-in. Premium opens with a token.
				</p>

				<div className="mt-8 grid gap-2 md:grid-cols-12">
					<section className="tile reveal p-6 sm:p-8 md:col-span-7" aria-labelledby="c1">
						<h2 id="c1" className="statement">1. Connect, free</h2>
						<div role="tablist" aria-label="Where you use Claude" className="mt-4 flex flex-wrap gap-2">
							{([["code", "Claude Code"], ["desktop", "Claude Desktop"], ["cli", "Terminal CLI"]] as const).map(([k, l]) => (
								<button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={`press h-11 rounded-lg px-5 text-base font-medium ${tab === k ? "bg-primary text-primary-foreground" : "bg-tile-2 hover:bg-muted"}`}>{l}</button>
							))}
						</div>
						{tab === "code" ? (
							<>
								<p className="mt-4 text-base">Run this once in a terminal. Then ask Claude Code for a skill.</p>
								<Code label="Copy command">{free}</Code>
							</>
						) : tab === "desktop" ? (
							<>
								<p className="mt-4 text-base">Add this to your Claude Desktop config (Settings, Developer, Edit config), then restart it. It uses <code>mcp-remote</code> to reach the server.</p>
								<Code label="Copy config">{desktop}</Code>
							</>
						) : (
							<>
								<p className="mt-4 text-base">No MCP needed. Claude Code can run the CLI in a terminal, and so can you.</p>
								<Code label="Copy commands">{cli}</Code>
								<p className="mt-3 text-base">Try <code>cizle search --kind prompt --tier free --all</code> for every free prompt as one table.</p>
							</>
						)}
					</section>

					<section className="tile-accent reveal p-6 sm:p-8 md:col-span-5" style={{ ["--i" as string]: 1 }} aria-labelledby="c2">
						<h2 id="c2" className="statement">2. Premium, with a token</h2>
						{!ready ? null : !user ? (
							<>
								<p className="mt-4 text-base">Sign in with the account you subscribed with, then make a token here.</p>
								<Button className="mt-4" variant="secondary" size="lg" asChild><Link to="/login" search={{ next: "/connect" }}>Sign in</Link></Button>
							</>
						) : (
							<>
								<p className="mt-4 text-base">{isPro ? "Premium is active. A token opens every skill and prompt in Claude." : "You are signed in, but Premium is not active. A token still works for the free library."}</p>
								{!isPro ? <Button className="mt-3" variant="secondary" asChild><Link to="/pricing">See Premium</Link></Button> : null}
								<div className="mt-4 flex flex-wrap gap-2">
									<Button size="lg" variant="secondary" onClick={make} disabled={busy}>{token ? "Make another token" : "Make my token"}</Button>
									<Button size="lg" variant="outline" onClick={revoke} disabled={busy}>Revoke all</Button>
								</div>
								{token ? (
									<>
										<p className="mt-4 text-base">Copy it now. It is shown once and lasts 180 days.</p>
										<Code label="Copy Claude Code command">{paid}</Code>
										<div className="mt-2"><CopyButton text={token} label="Copy token only" done="Token copied" variant="outline" /></div>
									</>
								) : null}
							</>
						)}
						<p className="mt-4 text-base">Your plan is checked on every request, so if Premium lapses the token goes back to the free library by itself.</p>
					</section>
				</div>

				<div className="mt-2 grid gap-2 md:grid-cols-12">
					<section className="tile reveal p-6 sm:p-8 md:col-span-7" aria-labelledby="c3">
						<h2 id="c3" className="statement">What Claude can do</h2>
						<dl className="mt-4 grid gap-3 text-base">
							{TOOLS.map(([n, d]) => (
								<div key={n} className="grid gap-1 sm:grid-cols-[8rem_1fr]">
									<dt className="font-medium"><code>{n}</code></dt>
									<dd>{d}</dd>
								</div>
							))}
						</dl>
					</section>
					<section className="tile reveal p-6 sm:p-8 md:col-span-5" style={{ ["--i" as string]: 1 }} aria-labelledby="c4">
						<h2 id="c4" className="statement">Try asking</h2>
						<ul className="mt-4 space-y-3 text-base">
							{ASKS.map((a) => (
								<li key={a} className="rounded-lg bg-background/50 p-3">{a}</li>
							))}
						</ul>
						<p className="mt-4 text-base">Full steps and troubleshooting are in the <Link to="/docs" className="underline decoration-2 underline-offset-4">docs</Link>.</p>
					</section>
				</div>
			</div>
		</div>
	);
}
