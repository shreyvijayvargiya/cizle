import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight01Icon, ComputerTerminal01Icon, LockIcon } from "@hugeicons/core-free-icons";
import { CopyButton } from "@/components/CopyButton";
import { Icon } from "@/components/Icon";
import { SkillThumb } from "@/components/SkillThumb";
import { StoryboardDemo } from "@/components/StoryboardDemo";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/misc";
import { useAuth } from "@/lib/auth";
import { fromLabel } from "@/lib/billing";
import { DEV_UNLOCK } from "@/lib/config";
import { usePremiumBody, useSkills, type SkillDetail } from "@/lib/data";

/** What a visitor needs to unlock, said in one place so the prompt panel and the action bar agree. */
export function useUnlock(skill: SkillDetail | undefined) {
	const { isPro, user, ready } = useAuth();
	const body = usePremiumBody(skill?.locked ? skill.slug : undefined, isPro);
	const unlocked = !skill?.locked || isPro;
	return {
		unlocked,
		ready,
		loggedIn: Boolean(user),
		loading: Boolean(skill?.locked) && isPro && body.isLoading,
		error: body.error as Error | null,
		promptText: skill?.promptText ?? body.data?.promptText ?? null,
		skillMd: skill?.skillMd ?? body.data?.skillMd ?? null,
	};
}

/** The action bar: copy the prompt, copy the install command, or unlock. Used at the top of the page and pinned in the dialog. */
export function SkillActions({ skill, className }: { skill: SkillDetail; className?: string }) {
	const u = useUnlock(skill);
	const navigate = useNavigate();
	if (!u.unlocked)
		return (
			<div className={className}>
				<Button onClick={() => navigate(u.loggedIn ? { to: "/pricing" } : { to: "/login", search: { next: `/skills/${skill.slug}` } })}>
					<Icon icon={LockIcon} size={14} /> {u.loggedIn ? `Unlock with Premium · from ${fromLabel("USD")}/mo` : "Sign in to unlock"}
				</Button>
				<Button variant="outline" asChild>
					<Link to="/pricing">See what's included</Link>
				</Button>
			</div>
		);
	return (
		<div className={className}>
			<CopyButton text={u.promptText || ""} label="Copy prompt" done="Prompt copied. Paste it into Claude Code." variant="default" size="default" disabled={!u.promptText} />
			<CopyButton text={skill.cli} label="Copy install command" done="Install command copied. Run it in your project." />
		</div>
	);
}

function CodeBlock({ title, children, copy }: { title: string; children: string; copy?: { text: string; label: string } }) {
	return (
		<div className="overflow-hidden rounded-lg border border-border bg-muted/50">
			<div className="flex items-center justify-between gap-2 border-b border-border px-3 py-1.5">
				<span className="text-xs font-medium text-muted-foreground">{title}</span>
				{copy ? <CopyButton text={copy.text} label={copy.label} variant="ghost" /> : null}
			</div>
			<pre className="skill-pre max-h-80 overflow-auto p-3 font-mono text-[14px] leading-relaxed">{children}</pre>
		</div>
	);
}

function LockedPrompt({ skill }: { skill: SkillDetail }) {
	const u = useUnlock(skill);
	const navigate = useNavigate();
	const items = skill.scenes.length ? skill.scenes : skill.anatomy;
	return (
		<div className="relative overflow-hidden rounded-lg border border-border bg-muted/40">
			<div aria-hidden className="select-none p-4 font-mono text-[14px] leading-relaxed text-muted-foreground blur-[5px]">
				{items.map((s) => (
					<p key={s.n}>
						{s.n}. {s.name} {s.time ? `(${s.time})` : ""} {s.visual ? `\`${s.visual}\`` : ""}: ━━━━ ━━━━━━━ ━━━━ ━━━━━━ ━━━ ━━━━━━━━━ ━━━━━
					</p>
				))}
				<p>## Rules · ━━━━ ━━━━━━ ━━━ ━━━━━━━ ━━━━ ━━━━━━━━━</p>
			</div>
			<div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-surface/70 p-4 text-center ">
				<span className="grid size-10 place-items-center rounded-full bg-primary text-primary-foreground">
					<Icon icon={LockIcon} size={18} />
				</span>
				<div>
					<p className="text-sm font-semibold">The full prompt is part of Premium</p>
					<p className="mt-0.5 text-xs text-muted-foreground">Scene by scene text, rules and the SKILL.md for Claude Code. From {fromLabel("USD")}/month, cancel any time.</p>
				</div>
				<Button size="sm" onClick={() => navigate(u.loggedIn ? { to: "/pricing" } : { to: "/login", search: { next: `/skills/${skill.slug}` } })}>
					{u.loggedIn ? "Get Premium" : "Sign in to get Premium"}
				</Button>
			</div>
		</div>
	);
}

export function SkillContent({ skill }: { skill: SkillDetail }) {
	const u = useUnlock(skill);
	const all = useSkills();
	const related = (skill.related || []).map((s) => all.data?.skills.find((x) => x.slug === s)).filter(Boolean) as NonNullable<typeof all.data>["skills"];
	return (
		<div className="space-y-8">
			<header>
				<div className="flex flex-wrap items-center gap-1.5">
					<Badge tone={skill.tier === "free" ? "success" : "warning"}>{skill.tier === "free" ? "Free" : "Premium"}</Badge>
					<Badge tone="outline">{skill.category}</Badge>
					{skill.duration ? <Badge tone="outline">{skill.duration} seconds</Badge> : null}
					<Badge tone="outline">{skill.aspect}</Badge>
					{skill.platform !== "Any" ? <Badge tone="outline">{skill.platform}</Badge> : null}
					<Badge tone="outline">{skill.format}</Badge>
				</div>
				<p className="mt-3 max-w-3xl text-base leading-relaxed text-muted-foreground">{skill.summary}</p>
				<SkillActions skill={skill} className="mt-4 flex flex-wrap gap-2" />
			</header>

			<section aria-labelledby="demo-h">
				<h2 id="demo-h" className="mb-3 text-sm font-semibold">
					Demo
				</h2>
				{skill.video ? (
					<video className="mb-3 w-full rounded-lg border border-border bg-black" controls autoPlay muted loop playsInline preload="auto" poster={skill.poster || undefined} src={skill.video} aria-label={`${skill.name} example video`} />
				) : null}
				{skill.scenes.length || skill.anatomy.length ? (
					<StoryboardDemo scenes={skill.scenes} anatomy={skill.anatomy} aspect={skill.aspect} label={skill.scenes.length ? "Scene by scene" : "What the style defines"} />
				) : (
					<SkillThumb skill={{ ...skill, scenes: [], anatomy: [] }} className="max-w-md" />
				)}
			</section>

			<section aria-labelledby="prompt-h">
				<h2 id="prompt-h" className="mb-3 text-sm font-semibold">
					Prompt
				</h2>
				{!u.unlocked ? (
					<LockedPrompt skill={skill} />
				) : u.loading ? (
					<Skeleton className="h-48" />
				) : u.error ? (
					<p className="rounded-lg border border-danger/30 bg-danger/5 p-3 text-sm text-danger">{u.error.message}</p>
				) : (
					<CodeBlock title="Paste this into Claude Code with your product link" copy={{ text: u.promptText || "", label: "Copy prompt" }}>
						{u.promptText || ""}
					</CodeBlock>
				)}
			</section>

			<section aria-labelledby="cli-h">
				<h2 id="cli-h" className="mb-3 text-sm font-semibold">
					Install as a Claude Code skill
				</h2>
				{u.unlocked ? (
					<div className="space-y-2">
						<CodeBlock title="Run in your project folder" copy={{ text: skill.cli, label: "Copy command" }}>
							{skill.cli}
						</CodeBlock>
						{skill.locked ? (
							<p className="text-xs text-muted-foreground">
								Premium skills are not served as public files. Press <strong>Copy SKILL.md</strong>, then save it to <code className="rounded bg-muted px-1 font-mono text-xs">.claude/skills/cizle-{skill.slug}/SKILL.md</code>.{" "}
								<CopyButton text={u.skillMd || ""} label="Copy SKILL.md" variant="outline" disabled={!u.skillMd} />
							</p>
						) : null}
					</div>
				) : (
					<CodeBlock title="Run in your project folder (unlocks with Premium)">{`curl -fsSL --create-dirs -o .claude/skills/cizle-${skill.slug}/SKILL.md …`}</CodeBlock>
				)}
				<p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
					<Icon icon={ComputerTerminal01Icon} size={13} /> New to skills? The <Link to="/docs" className="underline underline-offset-2">docs</Link> take you from zero to a rendered video in five steps.
				</p>
			</section>

			<section aria-labelledby="explain-h" className="grid gap-6 md:grid-cols-2">
				<div>
					<h2 id="explain-h" className="mb-3 text-sm font-semibold">
						How it works
					</h2>
					<div className="prose-cizle" dangerouslySetInnerHTML={{ __html: skill.explanationHtml }} />
				</div>
				<div>
					<h2 id="howto-h" className="mb-3 text-sm font-semibold">
						How to use it
					</h2>
					<div className="prose-cizle" dangerouslySetInnerHTML={{ __html: skill.howtoHtml }} />
				</div>
			</section>

			<section aria-labelledby="faq-h">
				<h2 id="faq-h" className="mb-1 text-sm font-semibold">
					Questions
				</h2>
				<Accordion type="single" collapsible>
					{skill.faq.map((f, i) => (
						<AccordionItem key={f.q} value={`q${i}`}>
							<AccordionTrigger>{f.q}</AccordionTrigger>
							<AccordionContent>{f.a}</AccordionContent>
						</AccordionItem>
					))}
				</Accordion>
			</section>

			{related.length ? (
				<section aria-labelledby="rel-h">
					<h2 id="rel-h" className="mb-3 text-sm font-semibold">
						Related skills
					</h2>
					<ul className="grid gap-2 sm:grid-cols-3">
						{related.map((r) => (
							<li key={r.slug}>
								<Link to="/skills/$slug" params={{ slug: r.slug }} className="flex h-full items-center justify-between gap-2 rounded-lg border border-border p-3 text-sm hover:bg-accent">
									<span className="min-w-0">
										<span className="block truncate font-medium">{r.name}</span>
										<span className="block text-xs text-muted-foreground">{r.tier === "free" ? "Free" : "Premium"}</span>
									</span>
									<Icon icon={ArrowRight01Icon} size={14} className="shrink-0 text-muted-foreground" />
								</Link>
							</li>
						))}
					</ul>
				</section>
			) : null}

			{skill.credit ? (
				<p className="text-xs text-muted-foreground">
					Style prompt by {skill.credit.author}, {skill.credit.license} licence
					{skill.credit.source ? (
						<>
							{" · "}
							<a href={skill.credit.source} target="_blank" rel="noreferrer" className="underline underline-offset-2">
								source
							</a>
						</>
					) : null}
					.
				</p>
			) : null}
			{DEV_UNLOCK ? <p className="text-xs text-warning">Dev unlock is on: premium content is served by the local dev server.</p> : null}
		</div>
	);
}
