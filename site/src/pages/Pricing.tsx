import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { CheckmarkCircle02Icon } from "@hugeicons/core-free-icons";
import { toast } from "sonner";
import { Icon } from "@/components/Icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/misc";
import { useAuth } from "@/lib/auth";
import { checkoutUrl, defaultCurrency, priceLabel, type Currency } from "@/lib/billing";
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
	const [busy, setBusy] = useState(false);
	const premium = skills.data?.skills.filter((s) => s.tier === "premium") ?? [];
	const count = (cat: string) => premium.filter((s) => s.category === cat).length;
	const freeCount = skills.data?.skills.filter((s) => s.tier === "free").length ?? SITE.freeCount;
	const topFaq = (faq.data || []).filter((f) => /billing|refund|paid but/i.test(f.q)).slice(0, 3);

	useHead({
		title: `Pricing: ${freeCount} free skills, Premium ${priceLabel("USD")}/month | cizle`,
		description: `cizle is free for ${freeCount} skills. Premium is ${priceLabel("USD")} or ${priceLabel("INR")} a month and unlocks every ad format, engineering format and film style. Cancel any time.`,
		path: "/pricing",
		jsonLd: [
			{ "@context": "https://schema.org", "@type": "Product", name: "cizle Premium", description: "Monthly subscription to every premium cizle video skill.", brand: { "@type": "Brand", name: SITE.name }, offers: [{ "@type": "Offer", price: String(SITE.price.usd), priceCurrency: "USD", availability: "https://schema.org/InStock", url: `${SITE.url}/pricing` }, { "@type": "Offer", price: String(SITE.price.inr), priceCurrency: "INR", availability: "https://schema.org/InStock", url: `${SITE.url}/pricing` }] },
			...(faq.data ? [faqJsonLd(faq.data)] : []),
		],
	});

	const subscribe = () => {
		if (!user) return navigate({ to: "/login", search: { next: "/pricing" } });
		const url = checkoutUrl({ uid: user.uid, email: user.email, name: user.name, currency });
		if (!url) return toast.error("Payments are not switched on yet. Add the Dodo product ids from .env.example.");
		setBusy(true);
		window.location.href = url;
	};

	return (
		<div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
			<header className="mx-auto max-w-2xl text-center">
				<h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">Start free. Go Premium when you run ads.</h1>
				<p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">{freeCount} skills are free for good. Premium adds every ad format, the engineering formats and 20 film styles, for the price of one coffee a week.</p>
				<Tabs value={currency} onValueChange={(v) => setCurrency(v as Currency)} className="mt-6 inline-block">
					<TabsList aria-label="Currency">
						<TabsTrigger value="USD">US dollars</TabsTrigger>
						<TabsTrigger value="INR">Indian rupees</TabsTrigger>
					</TabsList>
				</Tabs>
			</header>

			<div className="mt-10 grid gap-5 md:grid-cols-2">
				<section aria-labelledby="free-h" className="flex flex-col rounded-2xl border border-border bg-surface p-6">
					<h2 id="free-h" className="text-lg font-semibold">Free</h2>
					<p className="mt-1 text-sm text-muted-foreground">Everything you need for your first videos.</p>
					<p className="mt-5 text-4xl font-semibold tracking-tight">{currency === "INR" ? "₹0" : "$0"}<span className="text-sm font-normal text-muted-foreground"> forever</span></p>
					<ul className="mt-6 flex-1 space-y-2.5 text-sm">
						{[`${freeCount} free skills with the full prompt`, "SKILL.md and install command for each", "Product, launch, explainer and social proof videos", "Code walkthrough for developer tools", "Browse the whole prompt gallery, with creator credit and a preview", "Free gallery samples in full", "Docs and the cizle MCP server (open source)"].map((t) => (
							<li key={t} className="flex gap-2"><Icon icon={CheckmarkCircle02Icon} size={16} className="mt-0.5 text-success" />{t}</li>
						))}
					</ul>
					<Button variant="outline" className="mt-8" asChild>
						<Link to="/">Browse free skills</Link>
					</Button>
				</section>

				<section aria-labelledby="pro-h" className="relative flex flex-col rounded-2xl border-2 border-foreground bg-surface p-6 shadow-lg shadow-black/5">
					<Badge tone="warning" className="absolute -top-2.5 left-6">Most popular</Badge>
					<h2 id="pro-h" className="text-lg font-semibold">Premium</h2>
					<p className="mt-1 text-sm text-muted-foreground">Ads, engineering formats and film styles.</p>
					<p className="mt-5 text-4xl font-semibold tracking-tight">
						{priceLabel(currency)}
						<span className="text-sm font-normal text-muted-foreground"> / month</span>
					</p>
					<p className="mt-1 text-xs text-muted-foreground">{currency === "INR" ? `or ${priceLabel("USD")} in US dollars` : `or ${priceLabel("INR")} in Indian rupees`} · cancel any time</p>
					<ul className="mt-6 flex-1 space-y-2.5 text-sm">
						{[
							`Everything in Free`,
							`${count("Ads") || 11} ad formats: Meta, TikTok and Google`,
							`${count("Engineering") || 5} engineering formats: podcast, system design, deep dive`,
							`${count("Film styles") || 20} film styles, from watercolor to dark keynote`,
							"Full prompts, SKILL.md and install commands",
							`Full text and copy button for ${galleryTotal ? galleryTotal.toLocaleString() : "1,000+"} community prompts in the gallery`,
							"New skills added to your plan as they ship",
						].map((t) => (
							<li key={t} className="flex gap-2"><Icon icon={CheckmarkCircle02Icon} size={16} className="mt-0.5 text-brand" />{t}</li>
						))}
					</ul>
					{isPro ? (
						<Button className="mt-8" asChild>
							<Link to="/settings">You are on Premium · Manage</Link>
						</Button>
					) : (
						<Button className="mt-8" size="lg" onClick={subscribe} disabled={busy || !ready}>
							{busy ? "Opening checkout…" : user ? `Get Premium · ${priceLabel(currency)}/month` : "Sign in to subscribe"}
						</Button>
					)}
					<p className="mt-3 text-center text-xs text-muted-foreground">Secure checkout by Dodo Payments · cards, UPI and more · 7-day refund</p>
				</section>
			</div>

			{topFaq.length ? (
				<section aria-labelledby="pf-h" className="mx-auto mt-14 max-w-3xl">
					<h2 id="pf-h" className="text-lg font-semibold tracking-tight">Billing and refunds</h2>
					<dl className="mt-4 divide-y divide-border rounded-xl border border-border bg-surface">
						{topFaq.map((f) => (
							<div key={f.q} className="p-4">
								<dt className="text-sm font-medium">{f.q}</dt>
								<dd className="mt-1 text-sm leading-relaxed text-muted-foreground">{f.a}</dd>
							</div>
						))}
					</dl>
					<p className="mt-3 text-sm text-muted-foreground">More answers on the <Link to="/faq" className="underline underline-offset-2">FAQ page</Link>.</p>
				</section>
			) : null}
		</div>
	);
}
