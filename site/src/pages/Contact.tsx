import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Mail01Icon } from "@hugeicons/core-free-icons";
import { CopyButton } from "@/components/CopyButton";
import { Icon } from "@/components/Icon";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { OptionSelect } from "@/components/ui/select";
import { useAuth } from "@/lib/auth";
import { SITE } from "@/lib/config";
import { useHead } from "@/lib/head";

const TOPICS = ["Question about skills", "Payment or Premium access", "Refund", "Partnership or press", "Something else"];

/** No server: the form opens your mail app with the message filled in. */
export function ContactPage() {
	const { user } = useAuth();
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [topic, setTopic] = useState(TOPICS[0]);
	const [message, setMessage] = useState("");
	useHead({ title: "Contact cizle: questions, billing and refunds", description: `Email ${SITE.email} for questions about cizle skills, Premium access, billing or refunds. We reply within one working day.`, path: "/contact" });
	const send = (e: React.FormEvent) => {
		e.preventDefault();
		if (message.trim().length < 10) return toast.error("Tell us a little more so we can help.");
		const body = `${message.trim()}\n\n${name || user?.name || ""}\n${email || user?.email || ""}`;
		window.location.href = `mailto:${SITE.email}?subject=${encodeURIComponent(`[cizle] ${topic}`)}&body=${encodeURIComponent(body)}`;
		toast.success("Opening your email app. If nothing opens, copy our address and write to us.");
	};
	return (
		<div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
			<h1 className="text-3xl font-semibold tracking-tight">Contact us</h1>
			<p className="mt-2 max-w-xl text-[15px] text-muted-foreground">A real person reads every message, usually within one working day. For payment issues include the email you paid with.</p>
			<div className="mt-8 grid gap-6 md:grid-cols-[1fr_16rem]">
				<form onSubmit={send} className="space-y-4 rounded-2xl border border-border bg-surface p-5 sm:p-6">
					<div className="grid gap-4 sm:grid-cols-2">
						<div className="space-y-1.5"><Label htmlFor="c-name">Name</Label><Input id="c-name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} placeholder={user?.name || "Your name"} /></div>
						<div className="space-y-1.5"><Label htmlFor="c-email">Email</Label><Input id="c-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={user?.email || "you@company.com"} /></div>
					</div>
					<div className="space-y-1.5"><Label htmlFor="c-topic">Topic</Label><OptionSelect id="c-topic" value={topic} onValueChange={setTopic} options={TOPICS.map((t) => ({ value: t, label: t }))} className="w-full" /></div>
					<div className="space-y-1.5"><Label htmlFor="c-msg">Message</Label><Textarea id="c-msg" rows={6} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="How can we help?" required /></div>
					<Button type="submit">Send message</Button>
				</form>
				<aside className="space-y-3">
					<div className="rounded-2xl border border-border bg-surface p-5">
						<span className="grid size-9 place-items-center rounded-lg bg-muted"><Icon icon={Mail01Icon} size={17} /></span>
						<p className="mt-3 text-sm font-medium">Email</p>
						<a href={`mailto:${SITE.email}`} className="text-sm text-muted-foreground underline underline-offset-2">{SITE.email}</a>
						<div className="mt-3"><CopyButton text={SITE.email} label="Copy address" done="Email address copied" /></div>
					</div>
					<p className="px-1 text-xs text-muted-foreground">Looking for answers first? Try the <Link className="underline underline-offset-2" to="/faq">FAQ</Link> and the <Link className="underline underline-offset-2" to="/docs">docs</Link>.</p>
				</aside>
			</div>
		</div>
	);
}
