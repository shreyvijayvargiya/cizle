import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { AiMagicIcon, AlertCircleIcon, Cancel01Icon, CheckmarkCircle02Icon, InformationCircleIcon, Loading03Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/Icon";
import { Button } from "@/components/ui/button";
import type { Review, ReviewQuestion } from "@/lib/api";
import { cn, usd } from "@/lib/utils";

export type ReviewAnswers = Partial<Record<ReviewQuestion["field"], string>>;

/** The settings the card shows as chosen: the model's suggestion, overridden by the founder's answers. */
export function effectiveChoice(review: Review, answers: ReviewAnswers) {
	const s = review.suggestion;
	return {
		type: answers.type ?? s.type,
		tone: answers.tone ?? s.tone,
		aspect: (answers.aspect ?? s.aspect) as Review["suggestion"]["aspect"],
		audio: (answers.audio ?? s.audio) as Review["suggestion"]["audio"],
		duration_sec: Number(answers.duration_sec ?? s.duration_sec),
	};
}

function Question({ q, value, onChange, fallback }: { q: ReviewQuestion; value: string | undefined; onChange: (v: string) => void; fallback?: string }) {
	const current = value ?? fallback;
	return (
		<div>
			<p className="mb-1.5 text-[13px] font-medium">{q.text}</p>
			{q.options.length ? (
				<div className="flex flex-wrap gap-1.5">
					{q.options.map((o) => (
						<button
							key={o.value}
							type="button"
							onClick={() => onChange(o.value)}
							className={cn("rounded-lg border px-2.5 py-1 text-xs transition-colors", current === o.value ? "border-brand/40 bg-brand/10 font-medium text-brand" : "border-border hover:bg-accent")}
						>
							{o.label}
						</button>
					))}
				</div>
			) : (
				<input
					value={value || ""}
					onChange={(e) => onChange(e.target.value)}
					placeholder="Type a short answer (optional)"
					className="h-8 w-full rounded-lg border border-border bg-transparent px-2.5 text-sm outline-none placeholder:text-muted-foreground/70 focus:border-ring/60"
				/>
			)}
		</div>
	);
}

/**
 * Sits above the composer input. Shows what the review found, asks its questions, lets the founder edit
 * the final prompt, and only the Approve button calls the create API.
 */
export function ReviewCard({
	review,
	answers,
	setAnswer,
	prompt,
	setPrompt,
	onApprove,
	onCancel,
	busy,
}: {
	review: Review;
	answers: ReviewAnswers;
	setAnswer: (field: ReviewQuestion["field"], v: string) => void;
	prompt: string;
	setPrompt: (v: string) => void;
	onApprove: () => void;
	onCancel: () => void;
	busy: boolean;
}) {
	const [showFile, setShowFile] = useState(false);
	const saving = review.intent === "save_prompt";
	const choice = effectiveChoice(review, answers);
	const tier = answers.model_tier;
	const free = tier ? tier === "free" : review.cost?.free;

	return (
		<div className="border-b border-border px-4 pt-3.5 pb-3.5">
			<div className="flex items-start gap-2">
				<Icon icon={AiMagicIcon} size={16} className="mt-0.5 shrink-0 text-brand" />
				<div className="min-w-0 flex-1">
					<p className="text-sm font-medium">{review.summary}</p>
					{!saving ? (
						<p className="mt-0.5 text-xs text-muted-foreground">
							{review.engine === "article" ? "Sketch video + prompt pack" : `${choice.aspect} · ${choice.duration_sec}s · ${choice.audio === "voice" ? "voice-over" : choice.audio === "music" ? "music only" : "silent"}`}
							{review.cost ? ` · ${free ? "Free" : `≈ ${usd(review.cost.total_usd)}`}` : ""}
						</p>
					) : null}
				</div>
				<button type="button" aria-label="Dismiss review" onClick={onCancel} className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground">
					<Icon icon={Cancel01Icon} size={14} />
				</button>
			</div>

			{review.checks.length || review.existing.length || review.notes.length ? (
				<ul className="mt-2.5 space-y-1">
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

			{review.questions.length ? (
				<div className="mt-3 space-y-3">
					{review.questions.map((q) => (
						<Question
							key={q.field}
							q={q}
							value={answers[q.field]}
							onChange={(v) => setAnswer(q.field, v)}
							fallback={q.field === "type" || q.field === "tone" || q.field === "aspect" || q.field === "audio" ? String(choice[q.field]) : q.field === "duration_sec" ? String(choice.duration_sec) : undefined}
						/>
					))}
				</div>
			) : null}

			{saving && review.save_prompt ? (
				<div className="mt-3 rounded-lg border border-dashed border-border p-2.5">
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
				<div className="mt-3">
					<p className="mb-1 text-[11px] font-medium text-muted-foreground">Final prompt (edit it if you like)</p>
					<textarea
						value={prompt}
						onChange={(e) => setPrompt(e.target.value)}
						rows={3}
						className="block w-full resize-y rounded-lg border border-border bg-transparent px-2.5 py-2 text-sm leading-relaxed outline-none focus:border-ring/60"
					/>
				</div>
			)}

			<div className="mt-3 flex items-center justify-end gap-2">
				<Button variant="ghost" size="sm" onClick={onCancel} disabled={busy}>
					Cancel
				</Button>
				<Button size="sm" onClick={onApprove} disabled={!review.can_approve || busy}>
					<Icon icon={busy ? Loading03Icon : CheckmarkCircle02Icon} size={14} className={busy ? "animate-spin" : ""} />
					{saving ? "Save prompt" : "Approve and create"}
				</Button>
			</div>
		</div>
	);
}
