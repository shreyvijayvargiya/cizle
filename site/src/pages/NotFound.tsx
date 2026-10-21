import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useHead } from "@/lib/head";

export function NotFound() {
	useHead({ title: "Page not found | cizle", description: "That page does not exist.", path: "/404", noindex: true });
	return (
		<div className="mx-auto w-full max-w-md px-4 py-28 text-center">
			<p className="text-sm font-medium text-brand">404</p>
			<h1 className="mt-2 text-2xl font-semibold tracking-tight">We could not find that page</h1>
			<p className="mt-2 text-sm text-muted-foreground">It may have moved. Try the skills library or press ⌘K to search.</p>
			<Button className="mt-6" asChild><Link to="/">Back to all skills</Link></Button>
		</div>
	);
}
