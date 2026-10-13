/**
 * Static ad banners. The same prompt library drives them: an ad type with `output: banner` tells the writer
 * (Claude Code, or the director model) to produce banner copy instead of a storyboard, and this module draws it
 * as PNGs in the chosen style, one per copy per size. No FFmpeg, no audio, no model call.
 *
 * Sizes are common placements. They change over time, so check the platform's current ad specs before you run them.
 */
import fsp from "fs/promises";
import path from "path";
import { FONTS, normalizeStyle, palette } from "./styles.js";

export const BANNER_SIZES = {
	"1200x628": { width: 1200, height: 628, label: "Landscape 1.91:1", where: "Google responsive display, Meta link ads" },
	"1200x1200": { width: 1200, height: 1200, label: "Square 1:1", where: "Google responsive display, Meta feed" },
	"1080x1080": { width: 1080, height: 1080, label: "Square 1:1", where: "Meta feed, carousel" },
	"1080x1350": { width: 1080, height: 1350, label: "Portrait 4:5", where: "Meta feed" },
	"1080x1920": { width: 1080, height: 1920, label: "Vertical 9:16", where: "Meta Stories and Reels, TikTok" },
	"300x250": { width: 300, height: 250, label: "Medium rectangle", where: "Google display" },
	"336x280": { width: 336, height: 280, label: "Large rectangle", where: "Google display" },
	"728x90": { width: 728, height: 90, label: "Leaderboard", where: "Google display" },
	"970x250": { width: 970, height: 250, label: "Billboard", where: "Google display" },
	"300x600": { width: 300, height: 600, label: "Half page", where: "Google display" },
	"160x600": { width: 160, height: 600, label: "Wide skyscraper", where: "Google display" },
	"320x50": { width: 320, height: 50, label: "Mobile banner", where: "Google display" },
};
export const DEFAULT_BANNER_SIZES = ["1200x628", "1200x1200", "300x250", "728x90"];
export const MAX_BANNER_COPIES = 3;

const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const clip = (s, n) => String(s ?? "").replace(/\s+/g, " ").trim().slice(0, n);
const safeImage = (u) => (/^(https:\/\/|data:image\/(png|jpeg|webp);base64,)/i.test(String(u || "")) ? String(u) : "");

/** Sizes the writer asked for, validated; falls back to the defaults. */
export function pickSizes(sizes) {
	const ok = (Array.isArray(sizes) ? sizes : []).map(String).filter((s) => BANNER_SIZES[s]);
	return [...new Set(ok.length ? ok : DEFAULT_BANNER_SIZES)];
}

/** Clean up banner copy: short fields, no empty banners, at most MAX_BANNER_COPIES. */
export function sanitizeBanners(list, brand = "") {
	return (Array.isArray(list) ? list : [])
		.map((b) => ({
			headline: clip(b?.headline, 64),
			subhead: clip(b?.subhead, 110),
			cta: clip(b?.cta, 24),
			offer: clip(b?.offer, 24),
			brand: clip(b?.brand || brand, 40),
			image: safeImage(b?.image),
		}))
		.filter((b) => b.headline)
		.slice(0, MAX_BANNER_COPIES);
}

/** strip: 728x90, 320x50 (3:1 or wider and short) · wide: 1200x628, 970x250, 300x250 · tall: 160x600, 1080x1920 · box: squares and 4:5. */
function mode(w, h) {
	const r = w / h;
	if (r >= 3 && h <= 120) return "strip";
	if (r >= 1.25) return "wide";
	if (r < 0.7) return "tall";
	return "box";
}

const DECOR = {
	default: (p) => `.card{background:linear-gradient(135deg,${p.accent}22,transparent 60%),${p.bg}}.cta{background:${p.accent};color:#fff;border-radius:999px}.offer{background:${p.text};color:${p.bg};border-radius:8px}`,
	sketch: (p) => `.card{background:${p.bg};border:3px solid ${p.text}}.hl{text-decoration:underline wavy ${p.accent};text-decoration-thickness:.06em;text-underline-offset:.12em}.cta{background:transparent;color:${p.accent};border:3px solid ${p.accent};border-radius:14px 22px 16px 24px}.offer{border:3px dashed ${p.text};border-radius:12px;transform:rotate(-3deg)}`,
	clay: (p) => `.card{background:${p.bg};box-shadow:inset 0 0 0 .6em ${p.card}}.cta{background:${p.accent};color:#fff;border-radius:999px;box-shadow:0 .35em 0 #0003}.offer{background:${p.card};border-radius:999px;box-shadow:0 .25em 0 #0002}`,
	glass: (p) => `.card{background:radial-gradient(60% 80% at 15% 10%,${p.accent}66,transparent 60%),radial-gradient(50% 70% at 90% 90%,#2dd4bf44,transparent 60%),${p.bg}}.cta{background:${p.accent};color:#fff;border-radius:999px}.offer{background:#ffffff22;border:1px solid #ffffff44;border-radius:12px;backdrop-filter:blur(8px)}`,
	isometric: (p) => `.card{background:${p.bg}}.card:after{content:"";position:absolute;right:-6%;bottom:-8%;width:34%;aspect-ratio:1;background:${p.accent};transform:rotate(45deg) skew(-10deg,-10deg);opacity:.9;box-shadow:.4em .4em 0 ${p.text}22}.cta{background:${p.accent};color:#fff;border-radius:8px;box-shadow:.25em .25em 0 ${p.text}33}.offer{background:${p.text};color:${p.bg};border-radius:6px}`,
	ascii: (p) => `.card{background:${p.bg};border:2px double ${p.text}}.cta{background:${p.accent};color:#000;border-radius:0}.cta:before{content:"> "}.offer{border:1px solid ${p.accent};color:${p.accent};border-radius:0}`,
};

/** HTML for one banner at one size. Text is fitted by a short script (the renderer waits for it). */
export function bannerHtml({ style, size, theme = {}, banner }) {
	const s = normalizeStyle(style);
	const key = s === "default" ? "glass" : s; // fonts: the plain look uses Inter, like glass
	const p = s === "default" ? { ...palette("sketch", theme), bg: "#ffffff", text: "#111827", accent: /^#[0-9a-f]{6}$/i.test(theme.accent || "") ? theme.accent : "#2f5bea" } : palette(s, theme);
	const [fontSpec, font] = FONTS[key];
	const { width: W, height: H } = size;
	const m = mode(W, H);
	const u = Math.min(W, H);
	const pad = Math.round(Math.max(6, u * (m === "strip" ? 0.1 : 0.06)));
	const img = banner.image ? `<div class="img"><img src="${esc(banner.image)}" alt=""></div>` : "";
	const showSub = banner.subhead && m !== "strip" && !(m === "wide" && H < 200);
	const html = `<!doctype html><html><head><meta charset="utf-8"><link href="https://fonts.googleapis.com/css2?family=${fontSpec}&display=swap" rel="stylesheet"><style>
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:${W}px;height:${H}px;overflow:hidden}
body{font-family:${font};color:${p.text}}
.card{position:relative;width:${W}px;height:${H}px;padding:${pad}px;display:flex;overflow:hidden;gap:${pad}px;align-items:center;justify-content:space-between;flex-direction:${m === "tall" || m === "box" ? "column" : "row"};${m === "tall" || m === "box" ? "justify-content:center;text-align:center;" : ""}}
.txt{position:relative;z-index:1;display:flex;flex-direction:column;gap:${Math.round(pad * 0.6)}px;min-width:0;flex:1;${m === "strip" ? "flex-direction:row;align-items:center;" : ""}}
.brand{font-size:${Math.round(Math.max(9, u * (m === "strip" ? 0.16 : 0.035)))}px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;opacity:.75;${m === "strip" ? "flex:none;" : ""}}
.brand,.sub,.offer{flex:none}
.hl{flex:none;font-weight:800;line-height:1.05;letter-spacing:-.01em;${m === "strip" ? "flex:1 1 0;min-width:0;" : ""}max-height:${m === "strip" ? H - pad * 2 : Math.round(H * (m === "tall" ? 0.34 : 0.42))}px;overflow:hidden}
.sub{opacity:.82;line-height:1.25;overflow:hidden;max-height:${Math.round(H * 0.22)}px}
.cta{position:relative;z-index:1;flex:none;font-weight:800;padding:${Math.round(u * (m === "strip" ? 0.1 : 0.04))}px ${Math.round(u * (m === "strip" ? 0.2 : 0.08))}px;font-size:${Math.round(Math.max(10, u * (m === "strip" ? 0.2 : 0.05)))}px;white-space:nowrap}
.offer{position:relative;z-index:1;flex:none;font-weight:800;padding:${Math.round(u * 0.015)}px ${Math.round(u * 0.03)}px;font-size:${Math.round(Math.max(9, u * (m === "strip" ? 0.14 : 0.04)))}px;align-self:${m === "tall" || m === "box" ? "center" : "flex-start"}}
.img{position:relative;z-index:1;flex:${m === "wide" ? "0 0 38%" : m === "strip" ? "0 0 0" : "0 0 34%"};align-self:stretch;min-height:0;border-radius:${Math.round(u * 0.03)}px;overflow:hidden;display:${m === "strip" ? "none" : "block"}}
.img img{width:100%;height:100%;object-fit:cover;display:block}
.act{display:flex;flex-direction:${m === "tall" || m === "box" ? "column" : m === "strip" ? "row" : "column"};align-items:center;gap:${pad}px;flex:none;position:relative;z-index:1}
${DECOR[s](p)}
</style></head><body><div class="card">
<div class="txt">${banner.brand && !(m === "strip" && W < 400) ? `<div class="brand">${esc(banner.brand)}</div>` : ""}<div class="hl" data-fit="${m === "strip" ? Math.round(H * 0.4) : Math.round(u * (m === "tall" ? 0.13 : 0.15))}">${esc(banner.headline)}</div>${showSub ? `<div class="sub" data-fit="${Math.round(u * 0.045)}">${esc(banner.subhead)}</div>` : ""}</div>
${img}
<div class="act">${banner.offer && m !== "strip" ? `<div class="offer">${esc(banner.offer)}</div>` : ""}${banner.cta ? `<div class="cta">${esc(banner.cta)}</div>` : ""}</div>
</div><script>
for(const el of document.querySelectorAll("[data-fit]")){let f=+el.dataset.fit;const min=Math.max(8,f*0.4);el.style.fontSize=f+"px";while((el.scrollHeight>el.clientHeight+1||el.scrollWidth>el.clientWidth+1)&&f>min){f-=1;el.style.fontSize=f+"px"}}
</script></body></html>`;
	return html;
}

/**
 * Render banners to PNG files in dir. `renderHtml(htmlList, {width, height})` is the browser's batch screenshot.
 * Returns [{ file, size, width, height, copy, headline }] with file relative to baseDir.
 */
export async function renderBanners({ banners, sizes, style, theme, dir, baseDir, renderHtml }) {
	await fsp.mkdir(dir, { recursive: true });
	const out = [];
	for (const id of sizes) {
		const size = BANNER_SIZES[id];
		const htmls = banners.map((banner) => bannerHtml({ style, size, theme, banner }));
		const pngs = await renderHtml(htmls, size);
		for (let i = 0; i < pngs.length; i++) {
			const file = path.join(dir, `${i + 1}-${id}.png`);
			await fsp.writeFile(file, pngs[i]);
			out.push({ file: path.relative(baseDir, file), size: id, width: size.width, height: size.height, label: size.label, copy: i + 1, headline: banners[i].headline });
		}
	}
	return out;
}
