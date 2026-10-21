import { Link } from "@tanstack/react-router";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/misc";
import { useFaq } from "@/lib/data";
import { useHead } from "@/lib/head";
import { faqJsonLd } from "@/lib/seo";

export function FaqPage() {
	const faq = useFaq();
	useHead({ title: "FAQ: cizle skills, pricing and how it works", description: "Answers about cizle video skills for Claude Code: what is free, what Premium includes, how billing works, how to install a skill and who owns the videos.", path: "/faq", jsonLd: faq.data ? faqJsonLd(faq.data) : undefined });
	return (
		<div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
			<h1 className="text-3xl font-semibold tracking-tight">Frequently asked questions</h1>
			<p className="mt-2 text-[15px] text-muted-foreground">Everything about cizle skills, Premium and billing. Something missing? <Link to="/contact" className="underline underline-offset-2">Ask us</Link>.</p>
			{faq.isLoading ? (
				<div className="mt-8 space-y-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
			) : (
				<Accordion type="single" collapsible className="mt-8 rounded-xl border border-border bg-surface px-5">
					{(faq.data || []).map((f, i) => (
						<AccordionItem key={f.q} value={`q${i}`}>
							<AccordionTrigger>{f.q}</AccordionTrigger>
							<AccordionContent>{f.a}</AccordionContent>
						</AccordionItem>
					))}
				</Accordion>
			)}
		</div>
	);
}
