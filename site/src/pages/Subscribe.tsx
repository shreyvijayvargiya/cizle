import { Link } from "@tanstack/react-router";
import { SubscribeForm } from "@/components/SubscribeForm";
import { useHead } from "@/lib/head";
import { SITE } from "@/lib/config";

export function SubscribePage() {
	useHead({ title: "Subscribe: new cizle prompts and skills in your inbox", description: "Get each new video prompt, image prompt and Claude Code skill by email the day it lands. Free, and every prompt credits its creator.", path: "/subscribe" });
	return (
		<div className="board pt-6 pb-4">
			<div className="board-w grid gap-2 lg:grid-cols-12">
				<div className="tile reveal flex min-h-[320px] flex-col justify-end p-6 sm:p-8 lg:col-span-7">
					<h1 className="display" style={{ fontSize: "clamp(2.75rem, 6vw, 6.5rem)" }}>New prompts, in your inbox</h1>
					<p className="mt-5 max-w-[48ch] text-lg">Each new video prompt, image prompt and Claude Code skill, the day it lands. No spam, and you can leave with one click. <Link to="/" className="underline decoration-field-1 decoration-2 underline-offset-4">Browse what is there now</Link>.</p>
				</div>
				<div className="tile-ink reveal flex min-h-[320px] flex-col justify-between gap-6 p-6 sm:p-8 lg:col-span-5" style={{ ["--i" as string]: 1 }}>
					<p className="statement">{SITE.tagline}. Free to read and copy.</p>
					<SubscribeForm source="subscribe-page" stacked cta="Subscribe" className="relative" />
				</div>
			</div>
		</div>
	);
}
