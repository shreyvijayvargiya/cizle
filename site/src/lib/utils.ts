import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function timeAgo(iso?: string | null) {
	if (!iso) return "—";
	const s = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
	if (s < 60) return "just now";
	if (s < 3600) return `${Math.floor(s / 60)}m ago`;
	if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
	if (s < 86400 * 7) return `${Math.floor(s / 86400)}d ago`;
	return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function hostOf(u?: string | null) {
	if (!u) return "";
	try {
		return new URL(u).hostname.replace(/^www\./, "");
	} catch {
		return u;
	}
}

export const usd = (n?: number | null, digits = 3) => (n == null ? "—" : `$${n.toFixed(digits)}`);

/** Emoji out of text we display as our own typography (card previews, titles). The prompt itself is shown untouched in its dialog. */
export const plain = (s: string | null | undefined) => String(s ?? "").replace(/[\p{Extended_Pictographic}️‍]/gu, "").replace(/[ \t]{2,}/g, " ").trim();

/** True when a label is written in Latin script (English and the other Latin-script languages): letters of any other script, such as Chinese or Japanese, make it false. Used to show only English tags and categories for now. */
export const isLatinLabel = (s: string | null | undefined) => !s || /^[\p{Script=Latin}\p{N}\p{P}\p{S}\p{Z}\p{M}]*$/u.test(s);
