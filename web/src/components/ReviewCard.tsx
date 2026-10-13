import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { AiMagicIcon, AlertCircleIcon, ArrowLeft01Icon, ArrowRight01Icon, Cancel01Icon, CheckmarkCircle02Icon, InformationCircleIcon, Loading03Icon, PencilEdit02Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/Icon";
import { Button } from "@/components/ui/button";
import type { Prompt, Review, ReviewQuestion } from "@/lib/api";
import { STYLES, STYLE_LABEL } from "@/lib/constants";
import { cn, usd } from "@/lib/utils";

/** Answers keyed by question field. Radio questions hold one string, checkbox questions an array. `prompt_id` is a custom library prompt. */
export type ReviewAnswers = Partial<Record<ReviewQuestion["field"] | "type" | "tone" | "style", string | string[]>> & { prompt_id?: string };
export type AnswerKey = keyof ReviewAnswers;

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

/** The settings the card shows as chosen: the review's suggestion, overridden by the founder's answers. */
export function effectiveChoice(review: Review, answers: ReviewAnswers) {
	const s = review.suggestion;
	return {
		type: one(answers.type) ?? s.type,
		tone: one(answers.tone) ?? s.tone,
		aspect: (one(answers.aspect) ?? s.aspect) as Review["suggestion"]["aspect"],
		audio: (one(answers.audio) ?? s.audio) as Review["suggestion"]["audio"],
		duration_sec: Number(one(answers.duration_sec) ?? s.duration_sec),
	};
}

/** One selectable row: a real radio button or checkbox with a label and optional description. */
function Choice({ kind, name, checked, onChange, label, hint, reveal }: { kind: "radio" | "checkbox"; name: string; checked: boolean; onChange: () => void; label: string; hint?: string; reveal?: boolean }) {
	const ref = useRef<HTMLLabelElement>(null);
	// Long lists open with the current choice in view.
	useEffect(() => {
		if (reveal && checked) ref.current?.scrollIntoView({ block: "nearest" });
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	return (
		<label ref={ref} className={cn("flex cursor-pointer items-start gap-2.5 rounded-lg border px-3 py-2 transition-colors", checked ? "border-brand/40 bg-brand/5" : "border-border hover:bg-accent")}>
			<input type={kind} name={name} checked={checked} onChange={onChange} className="mt-0.5 size-4 shrink-0 accent-[var(--brand)]" />
			<span className="min-w-0 text-sm">
				<span className="block leading-snug">{label}</span>
				{hint ? <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">{hint}</span> : null}
			</span>
		</label>
	);
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
	return (
		<div>
			<p className="mb-1.5 text-xs font-medium text-muted-foreground">{title}</p>
			<div className="space-y-1.5">{children}</div>
		</div>
	);
}

/**
 * Docked above the composer input, one step at a time like Claude's question card:
 *   1. the library prompts the review picked (type, tone, your prompts), changeable as radio buttons
 *   2. each question, as radio buttons or checkboxes (never typed answers)
 *   last. a summary with the final prompt (read-only until you press Edit) and Approve.
 * Only Approve calls the create API.
 */
export function ReviewCard({
	review,
	answers,
	setAnswer,
	library,
	loadedPromptId,
	style,
	prompt,
	setPrompt,
	onApprove,
	onCancel,
	busy,
}: {
	review: Review;
	answers: ReviewAnswers;
	setAnswer: (key: AnswerKey, v: string | string[]) => void;
	library: Prompt[];
	loadedPromptId: string | null;
	/** The composer's style choice ("auto" = from the tone or type). */
	style: string;
	prompt: string;
	setPrompt: (v: string) => void;
	onApprove: () => void;
	onCancel: () => void;
	busy: boolean;
}) {
	const saving = review.intent === "save_prompt";
	const types = library.filter((p) => p.kind === "type");
	const tones = library.filter((p) => p.kind === "tone");
	const customs = library.filter((p) => p.kind === "custom");
	const choice = effectiveChoice(review, answers);
	const promptId = answers.prompt_id !== undefined ? answers.prompt_id : loadedPromptId || "";
	const styleValue = one(answers.style) ?? style;

	// Step 0 is the prompt step (video flow only); questions follow; the last step is the summary.
	const steps = useMemo(() => (saving ? ["summary"] : ["prompt", ...review.questions.map((q) => q.field), "summary"]), [saving, review.questions]);
	const [step, setStep] = useState(0);
	const [editing, setEditing] = useState(false);
	const [showFile, setShowFile] = useState(false);
	const current = steps[Math.min(step, steps.length - 1)];
	const q = review.questions.find((x) => x.field === current);
	const last = current === "summary";
	const free = (one(answers.model_tier) ?? (review.cost?.free ? "free" : "paid")) === "free";
	const typeName = types.find((t) => t.slug === choice.type)?.name || (choice.type === "auto" ? "Let cizle pick" : choice.type);
	const toneName = tones.find((t) => t.slug === choice.tone)?.name || (choice.tone === "auto" ? "Best tone" : choice.tone);

	const toggle = (field: ReviewQuestion["field"], value: string) => {
		const cur = answers[field];
		const list = Array.isArray(cur) ? cur : cur ? [cur] : [];
		setAnswer(field, list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
	};
	const selected = (field: ReviewQuestion["field"], value: string, multi: boolean, fallback?: string) => {
		const cur = answers[field];
		if (multi) return Array.isArray(cur) ? cur.includes(value) : cur === value;
		return (one(cur) ?? fallback) === value;
	};
	const fallbackFor = (field: ReviewQuestion["field"]) => (field === "aspect" ? choice.aspect : field === "audio" ? choice.audio : field === "duration_sec" ? String(choice.duration_sec) : field === "model_tier" ? (review.cost?.free ? "free" : "paid") : undefined);

	return (
		<div className="mb-2 rounded-2xl border border-border bg-surface shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(0,0,0,0.12)]">
			<div className="flex items-center gap-2 px-4 pt-3.5">
				<Icon icon={AiMagicIcon} size={15} className="shrink-0 text-brand" />
				<p className="min-w-0 flex-1 truncate text-sm font-medium">{last ? review.summary : current === "prompt" ? "Which prompt should I use?" : q?.text}</p>
				{steps.length > 1 ? (
					<span className="shrink-0 text-xs text-muted-foreground tabular-nums">
						{Math.min(step, steps.length - 1) + 1} of {steps.length}
					</span>
				) : null}
				<button type="button" aria-label="Dismiss review" onClick={onCancel} className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground">
					<Icon icon={Cancel01Icon} size={14} />
				</button>
			</div>

			<div className="max-h-[46vh] overflow-y-auto px-4 pt-3 pb-1">
				{current === "prompt" ? (
					<div className="space-y-3.5">
						<Section title="Video type from your library">
							<Choice kind="radio" name="rv-type" checked={choice.type === "auto"} onChange={() => setAnswer("type", "auto")} label="Let cizle pick" hint="The best fit for the page" />
							{types.map((t) => (
								<Choice key={t.slug} kind="radio" name="rv-type" checked={choice.type === t.slug} onChange={() => setAnswer("type", t.slug)} label={t.name} hint={t.description} reveal />
							))}
						</Section>
						<Section title="Tone">
							<Choice kind="radio" name="rv-tone" checked={choice.tone === "auto"} onChange={() => setAnswer("tone", "auto")} label="Best tone for the product" />
							{tones.map((t) => (
								<Choice key={t.slug} kind="radio" name="rv-tone" checked={choice.tone === t.slug} onChange={() => setAnswer("tone", t.slug)} label={t.name} hint={t.description} />
							))}
						</Section>
						<Section title="Animated style">
							{STYLES.map((s) => (
								<Choice key={s.value} kind="radio" name="rv-style" checked={styleValue === s.value} onChange={() => setAnswer("style", s.value)} label={s.label} hint={s.hint} />
							))}
						</Section>
						{customs.length ? (
							<Section title="Your prompts">
								<Choice kind="radio" name="rv-custom" checked={!promptId} onChange={() => setAnswer("prompt_id", "")} label="None" />
								{customs.map((c) => (
									<Choice key={c.id} kind="radio" name="rv-custom" checked={promptId === c.id} onChange={() => setAnswer("prompt_id", c.id)} label={c.name} hint={c.description} />
								))}
							</Section>
						) : null}
					</div>
				) : q ? (
					<div className="space-y-1.5">
						{q.multi ? <p className="mb-1 text-xs text-muted-foreground">Select all that apply</p> : null}
						{q.options.map((o) => (
							<Choice
								key={o.value}
								kind={q.multi ? "checkbox" : "radio"}
								name={`rv-${q.field}`}
								checked={selected(q.field, o.value, q.multi, fallbackFor(q.field))}
								onChange={() => (q.multi ? toggle(q.field, o.value) : setAnswer(q.field, o.value))}
								label={o.label}
							/>
						))}
					</div>
				) : (
					<div className="space-y-3 pb-1">
						{saving && review.save_prompt ? (
							<div className="rounded-lg border border-dashed border-border p-2.5">
								<p className="text-xs text-muted-foreground">
									New prompt in your library · <span className="font-medium text-foreground">{review.save_prompt.name}</span>
									{review.save_prompt.type ? ` · type ${review.save_prompt.type}` : ""}
								</p>
								<p className="mt-1 text-xs">{review.save_prompt.description}</p>
								<button type="button" className="mt-1 text-xs underline" onClick={() => setShowFile((v) => !v)}>
									{showFile ? "Hide file" : "Preview the file"}
								</button>
								{showFile ? <pre className="mt-1.5 max-h-48 overflow-auto rounded-md bg-muted p-2 text-[11px] leading-relaxed whitespace-pre-wrap">{review.save_prompt.body}</pre> : null}
							</div>
						) : (
							<>
								<dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
									<dt className="text-muted-foreground">Prompt</dt>
									<dd>
										{typeName} · {toneName} · {STYLE_LABEL[styleValue] || styleValue}
										{promptId ? ` · ${library.find((c) => c.id === promptId)?.name || promptId}` : ""}
									</dd>
									<dt className="text-muted-foreground">Format</dt>
									<dd>
										{choice.aspect} · {choice.duration_sec}s · {choice.audio === "voice" ? "voice-over" : choice.audio === "music" ? "music only" : "silent"}
									</dd>
									{review.questions
										.filter((x) => x.field === "audience" || x.field === "key_takeaway")
										.map((x) => (
											<FragmentRow key={x.field} label={x.field === "audience" ? "Audience" : "Takeaway"} value={[answers[x.field]].flat().filter(Boolean).join(", ") || "Not set"} />
										))}
									<dt className="text-muted-foreground">Cost</dt>
									<dd>{free ? "Free models" : review.cost ? `≈ ${usd(review.cost.total_usd)}` : "—"}</dd>
								</dl>
								{review.checks.length || review.existing.length || review.notes.length ? (
									<ul className="space-y-1">
										{review.checks.map((c, i) => (
											<li key={i} className={cn("flex items-start gap-1.5 text-xs", c.level === "warn" ? "text-warning" : "text-muted-foreground")}>
												<Icon icon={c.level === "warn" ? AlertCircleIcon : InformationCircleIcon} size={13} className="mt-px shrink-0" />
												<span>{c.text}</span>
											</li>
										))}
										{review.existing.map((e) => (
											<li key={e.id} className="pl-5 text-xs">
												<Link to="/videos/$id" params={{ id: e.id }} className="underline">
													{e.title}
												</Link>
												<span className="text-muted-foreground">
													{" "}
													· {e.type} · {e.aspect} · {e.status}
												</span>
											</li>
										))}
										{review.notes.map((n, i) => (
											<li key={`n${i}`} className="flex items-start gap-1.5 text-xs text-muted-foreground">
												<Icon icon={InformationCircleIcon} size={13} className="mt-px shrink-0" />
												<span>{n}</span>
											</li>
										))}
									</ul>
								) : null}
								<div>
									<div className="mb-1 flex items-center justify-between">
										<p className="text-xs font-medium text-muted-foreground">Final prompt</p>
										<button type="button" onClick={() => setEditing((v) => !v)} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
											<Icon icon={PencilEdit02Icon} size={12} /> {editing ? "Done" : "Edit"}
										</button>
									</div>
									{editing ? (
										<textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={4} autoFocus className="block w-full resize-y rounded-lg border border-border bg-transparent px-2.5 py-2 text-sm leading-relaxed outline-none focus:border-ring/60" />
									) : (
										<p className="rounded-lg bg-muted/60 px-2.5 py-2 text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground">{prompt || "No extra direction."}</p>
									)}
								</div>
							</>
						)}
					</div>
				)}
			</div>

			<div className="flex items-center justify-between gap-2 px-3 pt-2 pb-3">
				<Button variant="ghost" size="sm" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0 || busy}>
					<Icon icon={ArrowLeft01Icon} size={13} /> Back
				</Button>
				<div className="flex items-center gap-1.5">
					{steps.length > 1 && !last ? (
						<Button variant="ghost" size="sm" onClick={() => setStep(steps.length - 1)} disabled={busy}>
							Skip to review
						</Button>
					) : null}
					{last ? (
						<Button size="sm" onClick={onApprove} disabled={!review.can_approve || busy}>
							<Icon icon={busy ? Loading03Icon : CheckmarkCircle02Icon} size={14} className={busy ? "animate-spin" : ""} />
							{saving ? "Save prompt" : "Approve and create"}
						</Button>
					) : (
						<Button size="sm" onClick={() => setStep((s) => s + 1)}>
							Next <Icon icon={ArrowRight01Icon} size={13} />
						</Button>
					)}
				</div>
			</div>
		</div>
	);
}

function FragmentRow({ label, value }: { label: string; value: string }) {
	return (
		<>
			<dt className="text-muted-foreground">{label}</dt>
			<dd>{value}</dd>
		</>
	);
}
