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
		<div className="board pt-6 pb-4">
			<div className="board-w grid gap-8 md:grid-cols-12">
				<div className="md:col-span-4 md:sticky md:top-24 md:self-start">
					<h1 className="display reveal" style={{ fontSize: "clamp(2.75rem, 6vw, 6rem)" }}>
						Questions, answered
					</h1>
					<p className="reveal mt-6 max-w-[34ch] text-lg" style={{ ["--i" as string]: 1 }}>
						Everything about cizle skills, Premium and billing. Something missing? <Link to="/contact" className="underline decoration-field-1 decoration-2 underline-offset-4">Ask us</Link>.
					</p>
					<Link to="/contact" className="press reveal mt-6 inline-flex h-12 items-center rounded-lg bg-primary px-6 text-base font-medium text-primary-foreground hover:bg-primary/85" style={{ ["--i" as string]: 2 }}>
						Ask a question
					</Link>
				</div>
				<div className="md:col-span-8">
					{faq.isLoading ? (
						<div className="space-y-2">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-[72px]" />)}</div>
					) : (
						<Accordion type="single" collapsible defaultValue="q0">
							{(faq.data || []).map((f, i) => (
								<AccordionItem key={f.q} value={`q${i}`}>
									<AccordionTrigger>{f.q}</AccordionTrigger>
									<AccordionContent>{f.a}</AccordionContent>
								</AccordionItem>
							))}
						</Accordion>
					)}
				</div>
			</div>
		</div>
	);
}
