/**
 * Quality gate for the gallery: language, junk, near-duplicates, a score, and who gets the free samples.
 * Runs inside `npm run gallery:import`, so the committed gallery.jsonl only holds prompts worth showing.
 */
const EN_WORDS = new Set("the a an and or to of in on for with is are be you your it that this as at by from will make create use using video animation scene text then each into can should must not no".split(" "));

/** Rough language of a prompt: "en", a script (ja, zh, ko, ru, ar, hi, th) or "other" (Latin script but not English). */
export function detectLang(text) {
	const s = String(text).slice(0, 1500);
	const letters = s.replace(/[^\p{L}]/gu, "");
	if (!letters) return "en";
	const count = (re) => (s.match(re) || []).length;
	const n = letters.length;
	if (count(/[぀-ヿ]/g) / n > 0.03) return "ja";
	if (count(/[가-힯]/g) / n > 0.1) return "ko";
	if (count(/[一-鿿]/g) / n > 0.1) return "zh";
	if (count(/[Ѐ-ӿ]/g) / n > 0.2) return "ru";
	if (count(/[؀-ۿ]/g) / n > 0.2) return "ar";
	if (count(/[ऀ-ॿ]/g) / n > 0.2) return "hi";
	if (count(/[฀-๿]/g) / n > 0.2) return "th";
	const w = s.toLowerCase().match(/[a-zà-ÿ']+/g) || [];
	const en = w.filter((x) => EN_WORDS.has(x)).length / Math.max(1, w.length);
	// "other" = few English function words AND some tell-tale non-English ones, so English text with brand names is not flagged
	const foreign = w.filter((x) => /^(el|la|los|las|una|un|que|para|con|das|der|die|und|ist|wie|mit|une|des|les|est|pour|uma|não|para|com|bir|ve|bu|için|della|per|che)$/.test(x)).length / Math.max(1, w.length);
	return w.length > 12 && en < 0.06 && foreign > 0.03 ? "other" : "en";
}

export const LANG_NAME = { ja: "Japanese", zh: "Chinese", ko: "Korean", ru: "Russian", ar: "Arabic", hi: "Hindi", th: "Thai", other: "another language" };
export const MIN_CHARS = 100;
export const PREMIUM_MIN_CHARS = 200; // below this a prompt is a one-liner: shown only with a working video, and always free

/** Why an entry should not be shown, or null. */
export function junkReason(e) {
	if (e.text.length < MIN_CHARS) return "too short";
	if (e.partial && e.text.length < 300) return "partial and short";
	if (!e.video && e.text.length < PREMIUM_MIN_CHARS) return "short one-liner without a video";
	const alnum = e.text.replace(/[^\p{L}\p{N}]/gu, "").length;
	if (alnum < e.text.length * 0.4) return "mostly symbols";
	if ((e.text.match(/https?:\/\/\S+/g) || []).join("").length > e.text.length * 0.5) return "mostly links";
	return null;
}

/** Higher is better. A working mp4 and a substantial, complete, English prompt rank first. */
export function score(e) {
	const n = e.text.length;
	let s = 0;
	if (e.video) s += 35;
	if (e.poster) s += 5;
	s += n < 300 ? 5 : n < 1500 ? 25 : n < 4000 ? 30 : n < 8000 ? 18 : 8;
	s += e.partial ? -15 : 5;
	s += Math.min(10, 5 * ((e.sources?.length || 1) - 1));
	if (e.tags?.length) s += 3;
	if (e.model) s += 3;
	if (e.translatedFrom) s -= 3; // a translation is good, an original English prompt is a little better
	return s;
}

const prefixKey = (t) => String(t).toLowerCase().replace(/\W+/g, " ").trim().slice(0, 90);

/** Keep at most `max` entries that begin with the same words (the same template prompt posted by many people). */
export function capNearDuplicates(items, max = 2) {
	const seen = new Map();
	const keep = [];
	for (const e of [...items].sort((a, b) => b.score - a.score)) {
		const k = prefixKey(e.text);
		const n = seen.get(k) || 0;
		if (n >= max) {
			e.dropped = "near-duplicate";
			continue;
		}
		seen.set(k, n + 1);
		keep.push(e);
	}
	return keep;
}

export const FREE_SHARE = 0.12;

/** The free samples: the best 12%, at most a fifth of them from one category, so the free set shows the range. */
export function assignTiers(items, share = FREE_SHARE) {
	// One-liners (with a video) are not worth a paywall: free. The curated samples are the best 12% of the rest, picked separately among
	// prompts with a video and without, so Premium keeps good videos too (and the free set is not only videos).
	const simple = items.filter((e) => e.text.length < PREMIUM_MIN_CHARS);
	const rest = items.filter((e) => e.text.length >= PREMIUM_MIN_CHARS);
	const free = new Set();
	for (const group of [rest.filter((e) => e.video), rest.filter((e) => !e.video)]) {
		const want = Math.round(group.length * share);
		const cap = Math.max(2, Math.ceil(want * 0.2));
		const perCat = new Map();
		let n = 0;
		for (const e of [...group].sort((a, b) => b.score - a.score || a.id.localeCompare(b.id))) {
			if (n >= want) break;
			if (e.partial || (!e.video && e.text.length < 300)) continue;
			const c = e.category || "other";
			if ((perCat.get(c) || 0) >= cap) continue;
			perCat.set(c, (perCat.get(c) || 0) + 1);
			free.add(e.id);
			n++;
		}
	}
	for (const e of rest) e.tier = free.has(e.id) ? "free" : "premium";
	for (const e of simple) e.tier = "free";
	return [...rest, ...simple];
}
