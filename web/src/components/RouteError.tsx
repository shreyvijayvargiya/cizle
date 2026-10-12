import { Link } from "@tanstack/react-router";
import { Alert02Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/Icon";
import { Button } from "@/components/ui/button";

/** Shown instead of a blank page when a screen throws, so one broken page never takes the dashboard down. */
export function RouteError({ error, reset }: { error: unknown; reset?: () => void }) {
	return (
		<div className="mx-auto max-w-lg px-4 py-16 text-center">
			<span className="mx-auto flex size-10 items-center justify-center rounded-xl bg-danger/10 text-danger">
				<Icon icon={Alert02Icon} size={20} />
			</span>
			<h1 className="mt-4 text-base font-semibold tracking-tight">This page hit a problem</h1>
			<p className="mt-1 text-sm text-muted-foreground">The rest of the dashboard still works. Try again, or go back to the dashboard.</p>
			<pre className="mt-4 max-h-32 overflow-auto rounded-lg border border-border bg-muted p-3 text-left font-mono text-[11px] text-muted-foreground">{error instanceof Error ? error.message : String(error)}</pre>
			<div className="mt-4 flex justify-center gap-2">
				<Button variant="outline" onClick={() => (reset ? reset() : window.location.reload())}>
					Try again
				</Button>
				<Button asChild>
					<Link to="/">Back to dashboard</Link>
				</Button>
			</div>
		</div>
	);
}
