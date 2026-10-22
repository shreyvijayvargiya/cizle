import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/misc";
import { useAuth } from "@/lib/auth";
import { checkoutUrl, defaultCurrency, fromLabel, planPerMonthLabel, planTotalLabel, type Currency, type PlanId } from "@/lib/billing";
import { SITE } from "@/lib/config";
import { useFaq, useSkills } from "@/lib/data";
import { useGallery } from "@/lib/gallery";
import { useHead } from "@/lib/head";
import { faqJsonLd } from "@/lib/seo";

export function PricingPage() {
	const { user, isPro, ready } = useAuth();
	const navigate = useNavigate();
	const skills = useSkills();
	const faq = useFaq();
	const gallery = useGallery();
	const galleryTotal = gallery.data?.total ?? 0;
	const [currency, setCurrency] = useState<Currency>(defaultCurrency);
	const [busy, setBusy] = useState<PlanId | null>(null);
	const premium = skills.data?.skills.filter((s) => s.tier === "premium") ?? [];
	const count = (cat: string) => premium.filter((s) => s.category === cat).length;
	const topFaq = (faq.data || []).filter((f) => /billing|refund|paid but/i.test(f.q)).slice(0, 3);

	useHead({
		title: `Pricing: Premium from ${fromLabel("USD")} a month | cizle`,
		description: `Premium unlocks every ad format, engineering format, film style and the full text of every community prompt. ${SITE.plans.map((p) => `${p.name} ${planPerMonthLabel(p, "USD")} a month`).join(", ")}. Cancel any time.`,
		path: "/pricing",
		jsonLd: [
			{ "@context": "https://schema.org", "@type": "Product", name: "cizle Premium", description: "Subscription to every premium cizle video skill and the full text of every community prompt.", brand: { "@type": "Brand", name: SITE.name }, offers: SITE.plans.flatMap((p) => (["USD", "INR"] as const).map((c) => ({ "@type": "Offer", name: `${p.name} (${c})`, price: String(c === "INR" ? p.inr * p.months : p.usd * p.months), priceCurrency: c, availability: "https://schema.org/InStock", url: `${SITE.url}/pricing` }))) },
			...(faq.data ? [faqJsonLd(faq.data)] : []),
		],
	});

	const subscribe = (plan: PlanId) => {
		if (!user) return navigate({ to: "/login", search: { next: "/pricing" } });
		const url = checkoutUrl({ uid: user.uid, email: user.email, name: user.name, currency, plan });
		if (!url) return toast.error(`Payments are not switched on for this plan yet. Add VITE_DODO_PRODUCT_${plan.toUpperCase()}_${currency} from .env.example.`);
		setBusy(plan);
		window.location.href = url;
	};

	// Three tiles whose heights step up like bars: the longer you commit, the bigger the tile and the lower the monthly price.
	const STEPS = [
		{ tile: "tile-tan", h: "md:min-h-[400px]", strip: "bg-black/15 hover:bg-black/25", lines: ["Every premium skill, in full", "SKILL.md and install commands"] },
		{ tile: "tile-ink", h: "md:min-h-[500px]", strip: "bg-white/10 hover:bg-white/20", lines: ["Every premium skill, in full", "SKILL.md and install commands", `Full text of ${galleryTotal ? galleryTotal.toLocaleString() : "1,000+"} community prompts`, "New skills as they ship"] },
		{ tile: "tile-accent", h: "md:min-h-[600px]", strip: "bg-black/20 hover:bg-black/30", lines: [`${count("Ads") || 11} ad formats: Meta, TikTok, Google`, `${count("Engineering") || 5} engineering formats and ${count("Film styles") || 20} film styles`, `Full text and copy button for ${galleryTotal ? galleryTotal.toLocaleString() : "1,000+"} community prompts`, "SKILL.md and install commands", "New skills as they ship", "Best price: pay once for the year"] },
	];

	return (
		<div className="board pt-6 pb-4">
			<div className="board-w">
				<div className="relative md:min-h-[700px]">
					<div className="reveal px-1 pt-4 md:absolute md:top-0 md:left-0 md:w-[64%]">
						<h1 className="display" style={{ fontSize: "clamp(2.75rem, 6.4vw, 6.5rem)" }}>
							Premium, from {fromLabel(currency)} a month
						</h1>
						<Tabs value={currency} onValueChange={(v) => setCurrency(v as Currency)} className="mt-8 inline-block">
							<TabsList aria-label="Currency">
								<TabsTrigger value="USD">US dollars</TabsTrigger>
								<TabsTrigger value="INR">Indian rupees</TabsTrigger>
							</TabsList>
						</Tabs>
					</div>
					<div className="grid items-end gap-2 pt-8 md:absolute md:inset-x-0 md:bottom-0 md:grid-cols-3 md:pt-0">
						{SITE.plans.map((p, k) => {
							const st = STEPS[k];
							return (
								<section key={p.id} aria-labelledby={`plan-${p.id}`} className={`${st.tile} reveal flex flex-col overflow-hidden ${st.h}`} style={{ ["--i" as string]: k }}>
									<div className="flex-1 p-6 sm:p-7">
										<h2 id={`plan-${p.id}`} className="text-[1.75rem]">{p.name}</h2>
										<p className="display mt-3" style={{ fontSize: "clamp(3.5rem, 6vw, 5.5rem)" }}>
											{planPerMonthLabel(p, currency)}
											<span className="text-lg font-normal tracking-normal"> / month</span>
										</p>
										<p className="mt-1 text-base">
											{p.discount ? `Save ${p.discount}%. ` : ""}Billed {planTotalLabel(p, currency)} {p.months === 1 ? "every month" : p.months === 12 ? "once a year" : `every ${p.months} months`}.
										</p>
										<ul className="mt-5 space-y-1.5 text-base">
											{st.lines.map((t) => (
												<li key={t}>{t}</li>
											))}
										</ul>
									</div>
									{isPro ? (
										<Link to="/settings" className={`press flex h-16 items-center px-6 text-lg font-medium sm:px-7 ${st.strip}`}>
											You are on Premium · Manage
										</Link>
									) : (
										<button type="button" onClick={() => subscribe(p.id as PlanId)} disabled={Boolean(busy) || !ready} className={`press flex h-16 items-center px-6 text-left text-lg font-medium disabled:opacity-60 sm:px-7 ${st.strip}`}>
											{busy === p.id ? "Opening checkout…" : user ? `Get ${p.name} · ${planTotalLabel(p, currency)}` : "Sign in to subscribe"}
										</button>
									)}
								</section>
							);
						})}
					</div>
				</div>
				<p className="mt-3 px-1 text-base">Secure checkout by Dodo Payments · cards, UPI and more · 7-day refund · cancel any time. {skills.data ? `${skills.data.skills.filter((s) => s.tier === "free").length} skills and a free sample of the prompts stay free.` : ""}</p>

				{topFaq.length ? (
					<section aria-labelledby="pf-h" className="mt-24 grid gap-8 md:grid-cols-12">
						<h2 id="pf-h" className="reveal text-[clamp(2rem,4vw,3.5rem)] md:sticky md:top-24 md:col-span-4 md:self-start">
							Billing and refunds
						</h2>
						<div className="md:col-span-8">
							{topFaq.map((f, k) => (
								<details key={f.q} name="billing" open={k === 0} className="reveal group mb-2 rounded-lg bg-surface open:bg-field-1 open:text-field-1-ink" style={{ ["--i" as string]: k }}>
									<summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 text-lg font-medium [&::-webkit-details-marker]:hidden">
										{f.q}
										<span aria-hidden className="relative block size-4 shrink-0">
											<span className="absolute top-1/2 left-0 h-[3px] w-4 -translate-y-1/2 bg-current" />
											<span className="absolute top-1/2 left-0 h-[3px] w-4 -translate-y-1/2 rotate-90 bg-current transition-transform group-open:rotate-0" />
										</span>
									</summary>
									<p className="max-w-[52ch] px-6 pb-6 text-base leading-relaxed">{f.a}</p>
								</details>
							))}
							<p className="mt-4 px-1 text-base">More answers on the <Link to="/faq" className="underline decoration-field-1 decoration-2 underline-offset-4">FAQ page</Link>.</p>
						</div>
					</section>
				) : null}
			</div>
		</div>
	);
}
