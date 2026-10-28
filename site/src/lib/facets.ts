import { languageOf } from "@/lib/languages";

/**
 * Facets people can browse by, worked out in the browser from what every prompt and skill already carries (language, title, tags, preview).
 * Nothing is stored per version: the same rules apply to old and new data, so a new harvest shows up under the right country, tool and topic.
 */
export type Facets = { country?: string; tools: string[]; topic?: string };

/** language code → the country where it is mostly spoken (shown as "Country · by language"). English is not tied to one country. */
const COUNTRY: Record<string, string> = {
	zh: "China", ja: "Japan", ko: "South Korea", ru: "Russia", hi: "India", bn: "Bangladesh", ur: "Pakistan", fa: "Iran", he: "Israel", ar: "Arab world", tr: "Turkey",
	vi: "Vietnam", th: "Thailand", id: "Indonesia", ms: "Malaysia", fil: "Philippines", nl: "Netherlands", pl: "Poland", uk: "Ukraine", cs: "Czechia", sk: "Slovakia",
	hu: "Hungary", ro: "Romania", bg: "Bulgaria", sr: "Serbia", hr: "Croatia", el: "Greece", sv: "Sweden", da: "Denmark", no: "Norway", fi: "Finland", de: "Germany",
	fr: "France", es: "Spain", pt: "Brazil", it: "Italy", ta: "India", te: "India", mr: "India", gu: "India", kn: "India", ml: "India", pa: "India", sw: "Kenya & Tanzania",
	en: "English-speaking",
};
const TAG_COUNTRIES = ["USA", "UK", "France", "Germany", "India", "Brazil", "Spain", "Mexico", "Turkey", "Vietnam", "Russia", "Indonesia"];
/** the country a harvest source stamped on the record as a tag (USA, UK, France, Germany, India), else the main country of its language */
export const countryOf = (lang?: string, tags?: string[]) => TAG_COUNTRIES.find((c) => tags?.includes(c)) ?? COUNTRY[lang || "en"];
const FLAGS: Record<string, string> = { USA: "🇺🇸", UK: "🇬🇧", France: "🇫🇷", Germany: "🇩🇪", India: "🇮🇳", Brazil: "🇧🇷", Spain: "🇪🇸", Mexico: "🇲🇽", Turkey: "🇹🇷", Vietnam: "🇻🇳", Russia: "🇷🇺", Indonesia: "🇮🇩", China: "🇨🇳", Japan: "🇯🇵", "South Korea": "🇰🇷" };
export const countryFlag = (name: string) => {
	if (FLAGS[name]) return FLAGS[name];
	const code = Object.keys(COUNTRY).find((c) => COUNTRY[c] === name);
	return code ? (name === "English-speaking" ? "🌐" : languageOf(code).flag) : "🌐";
};

const TOOLS: [string, RegExp][] = [
	["Remotion", /remotion/i], ["HyperFrames", /hyperframes?|html-video|html video/i], ["Three.js / WebGL", /three\.?js|webgl|\bglsl\b|shader/i], ["Blender", /blender/i],
	["After Effects", /after ?effects|\bAE\b/i], ["Manim", /manim/i], ["GSAP", /gsap/i], ["Lottie", /lottie/i], ["Canvas / p5.js", /\bcanvas\b|p5\.?js/i], ["D3 / charts", /\bd3\b|d3\.js/i],
	["FFmpeg", /ffmpeg/i], ["Seedance", /seedance|即梦|豆包/i], ["Veo", /\bveo\b/i], ["Sora", /\bsora\b/i], ["Kling", /kling|可灵/i], ["Midjourney", /midjourney/i], ["ComfyUI", /comfyui/i],
	["Claude Opus", /opus/i], ["Figma", /figma/i],
];
const TOPICS: [string, RegExp][] = [
	["Business (non-SaaS)", /small business|restaurant|retail|real estate|invoice|quote|proposal|sales|accounting|legal|kmu|unternehmen|artisan|commerce|entreprise/i],
	["Product & ads", /product|advert|\bads?\b|commercial|launch|promo|saas|brand|广告|产品|发布|电商/i],
	["Explainers & education", /explain|educat|tutorial|lesson|teach|course|whiteboard|diagram|science|math|history|讲解|科普|教学|教育/i],
	["Social media", /tiktok|reels?|shorts?|instagram|youtube|caption|social|短视频|抖音|小红书/i],
	["Data & charts", /\bdata\b|chart|graph|infographic|dashboard|statistic|数据|图表/i],
	["Music & audio", /music|audio|podcast|beat|sound|song|音乐|音频/i],
	["Film & cinema", /cinema|film|movie|trailer|cinematic|director|storyboard|short drama|电影|短剧|分镜|导演/i],
	["Anime & illustration", /anime|manga|illustrat|cartoon|comic|动漫|二次元|插画|漫画|アニメ/i],
	["Portrait & fashion", /portrait|fashion|magazine|model|photograph|selfie|人物|摄影|杂志|写真|时尚/i],
	["Poster & graphic design", /poster|typograph|kinetic|logo|lower third|layout|海报|字体|排版|封面/i],
	["3D & games", /\b3d\b|game|gaming|pixel|isometric|webgl|游戏|三维/i],
	["Nature & travel", /nature|travel|landscape|city|map|animal|food|风景|旅行|城市|美食/i],
	["Entertainment", /entertain|storytelling|screenplay|bollywood|role.?play|jokes?\b|poem|lyrics|movie script|娱乐|故事/i],
	["Code & developer", /code|developer|\bapi\b|engineering|terminal|github|programming|开发|编程/i],
];

export function facetsOf(lang: string | undefined, tags: string[] | undefined, ...parts: (string | string[] | null | undefined)[]): Facets {
	const text = [tags, ...parts].flat().filter(Boolean).join(" \n ").slice(0, 3000);
	// a source can name the domain itself with a tag (Education, Business, Entertainment)
	const tagTopic = tags?.includes("Education") ? "Explainers & education" : tags?.includes("Business") ? "Business (non-SaaS)" : tags?.includes("Entertainment") ? "Entertainment" : undefined;
	return { country: countryOf(lang, tags), tools: TOOLS.filter(([, re]) => re.test(text)).map(([n]) => n), topic: tagTopic ?? TOPICS.find(([, re]) => re.test(text))?.[0] };
}

/** how many items carry each value, biggest first */
export function countBy<T>(list: T[], pick: (x: T) => string | string[] | undefined) {
	const m: Record<string, number> = {};
	for (const x of list) for (const v of [pick(x)].flat()) if (v) m[v] = (m[v] || 0) + 1;
	return Object.entries(m).sort((a, b) => b[1] - a[1]);
}
export const TOOL_NAMES = TOOLS.map(([n]) => n);
export const TOPIC_NAMES = TOPICS.map(([n]) => n);
