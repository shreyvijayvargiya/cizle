/**
 * HTML frame templates for the URL → video pipeline. Each scene becomes one
 * full-resolution HTML page that is rendered to PNG by Puppeteer, then animated by FFmpeg.
 */

import { isStyled, normalizeStyle, styledFrame } from "./styles.js";

export const ASPECTS = {
	"16:9": { width: 1920, height: 1080 },
	"9:16": { width: 1080, height: 1920 },
	"4:5": { width: 1080, height: 1350 },
	"1:1": { width: 1080, height: 1080 },
};

const FONT_LINK =
	'<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">';

const HAND_FONT_LINK = '<link href="https://fonts.googleapis.com/css2?family=Caveat:wght@500;700&display=swap" rel="stylesheet">';

export function escapeHtml(s) {
	return String(s ?? "")
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;");
}

function safeColor(c, fallback) {
	return /^#[0-9a-f]{3,8}$/i.test(String(c || "").trim()) ? c.trim() : fallback;
}

export function normalizeTheme(theme = {}) {
	const mode = theme.mode === "light" ? "light" : "dark";
	return {
		style: normalizeStyle(theme.style),
		mode,
		background: safeColor(theme.background, mode === "light" ? "#f7f7fb" : "#0b0d17"),
		accent: safeColor(theme.accent, "#7c5cff"),
		text: safeColor(theme.text, mode === "light" ? "#11131c" : "#f5f6fb"),
	};
}

function page({ width, height, theme, body, extraCss = "", bare = false }) {
	return `<!doctype html><html><head><meta charset="utf-8">${FONT_LINK}${bare ? HAND_FONT_LINK : ""}<style>
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:${width}px;height:${height}px;overflow:hidden}
body{background:${theme.background};color:${theme.text};font-family:Inter,'Segoe UI',Helvetica,Arial,sans-serif;position:relative;-webkit-font-smoothing:antialiased}
.glow{position:absolute;inset:0;background:radial-gradient(60% 50% at 20% 10%,${theme.accent}55,transparent 70%),radial-gradient(50% 50% at 90% 90%,${theme.accent}33,transparent 70%)}
.grid{position:absolute;inset:0;background-image:linear-gradient(${theme.text}0d 1px,transparent 1px),linear-gradient(90deg,${theme.text}0d 1px,transparent 1px);background-size:64px 64px;mask-image:radial-gradient(70% 70% at 50% 50%,#000,transparent)}
.accent{color:${theme.accent}}
.pill{display:inline-block;padding:10px 22px;border-radius:999px;background:${theme.accent};color:#fff;font-weight:800;letter-spacing:.02em}
${extraCss}
</style></head><body>${bare ? "" : '<div class="glow"></div><div class="grid"></div>'}${body}</body></html>`;
}

/** Scale typography to the shorter side so 9:16 and 1:1 stay legible. */
function unit({ width, height }) {
	return Math.min(width, height) / 1080;
}

function titleFrame({ size, theme, visual }) {
	const u = unit(size);
	return page({
		...size,
		theme,
		body: `<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:${120 * u}px">
<h1 style="font-size:${112 * u}px;font-weight:800;line-height:1.05;letter-spacing:-.03em;max-width:90%">${escapeHtml(visual.title)}</h1>
${visual.subtitle ? `<p style="margin-top:${36 * u}px;font-size:${44 * u}px;opacity:.75;max-width:80%;line-height:1.3">${escapeHtml(visual.subtitle)}</p>` : ""}
<div style="margin-top:${56 * u}px;width:${140 * u}px;height:${8 * u}px;border-radius:8px;background:${theme.accent}"></div>
</div>`,
	});
}

function bulletsFrame({ size, theme, visual }) {
	const u = unit(size);
	const items = (visual.items || []).slice(0, 4);
	return page({
		...size,
		theme,
		body: `<div style="position:absolute;inset:0;display:flex;flex-direction:column;justify-content:center;padding:${130 * u}px">
<h2 style="font-size:${84 * u}px;font-weight:800;letter-spacing:-.02em;margin-bottom:${56 * u}px">${escapeHtml(visual.title)}</h2>
${items
	.map(
		(it, i) => `<div style="display:flex;align-items:center;gap:${32 * u}px;margin:${18 * u}px 0;font-size:${52 * u}px;font-weight:600">
<span class="pill" style="font-size:${34 * u}px;min-width:${72 * u}px;text-align:center">${i + 1}</span><span>${escapeHtml(it)}</span></div>`,
	)
	.join("")}
</div>`,
	});
}

function statsFrame({ size, theme, visual }) {
	const u = unit(size);
	const items = (visual.items || []).slice(0, 4);
	const vertical = size.height > size.width;
	return page({
		...size,
		theme,
		body: `<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;gap:${40 * u}px;flex-direction:${vertical ? "column" : "row"};flex-wrap:wrap;padding:${100 * u}px">
${items
	.map(
		(it) => `<div style="min-width:${340 * u}px;padding:${56 * u}px ${48 * u}px;border-radius:${36 * u}px;background:${theme.text}0f;border:2px solid ${theme.accent}66;text-align:center">
<div class="accent" style="font-size:${110 * u}px;font-weight:800;letter-spacing:-.03em">${escapeHtml(it.value)}</div>
<div style="margin-top:${12 * u}px;font-size:${36 * u}px;opacity:.75;text-transform:uppercase;letter-spacing:.08em">${escapeHtml(it.label)}</div></div>`,
	)
	.join("")}
</div>`,
	});
}

function outroFrame({ size, theme, visual }) {
	const u = unit(size);
	return page({
		...size,
		theme,
		body: `<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:${120 * u}px">
<h1 style="font-size:${104 * u}px;font-weight:800;letter-spacing:-.03em">${escapeHtml(visual.title)}</h1>
${visual.cta ? `<p style="margin-top:${32 * u}px;font-size:${46 * u}px;opacity:.8">${escapeHtml(visual.cta)}</p>` : ""}
${visual.url ? `<div class="pill" style="margin-top:${60 * u}px;font-size:${44 * u}px;padding:${22 * u}px ${48 * u}px">${escapeHtml(visual.url)}</div>` : ""}
</div>`,
	});
}

function faqFrame({ size, theme, visual }) {
	const u = unit(size) * (size.height > size.width ? 1.3 : 1); // phone-readable in 9:16
	return page({
		...size,
		theme,
		body: `<div style="position:absolute;inset:0;display:flex;flex-direction:column;justify-content:center;padding:${110 * u}px;gap:${44 * u}px">
<div style="display:flex;gap:${28 * u}px;align-items:flex-start">
<span class="pill" style="font-size:${40 * u}px;padding:${10 * u}px ${24 * u}px">Q</span>
<p style="font-size:${66 * u}px;font-weight:800;line-height:1.15;letter-spacing:-.02em">${escapeHtml(visual.question)}</p></div>
<div style="display:flex;gap:${28 * u}px;align-items:flex-start;padding:${36 * u}px;border-radius:${28 * u}px;background:${theme.text}0d;border:2px solid ${theme.accent}55">
<span style="font-size:${40 * u}px;font-weight:800;color:${theme.accent};padding:${10 * u}px ${8 * u}px">A</span>
<p style="font-size:${46 * u}px;line-height:1.35;opacity:.92">${escapeHtml(visual.answer)}</p></div>
</div>`,
	});
}

function glossaryFrame({ size, theme, visual }) {
	const u = unit(size) * (size.height > size.width ? 1.3 : 1); // phone-readable in 9:16
	return page({
		...size,
		theme,
		body: `<div style="position:absolute;inset:0;display:flex;flex-direction:column;justify-content:center;padding:${120 * u}px">
<p style="font-size:${30 * u}px;text-transform:uppercase;letter-spacing:.18em;opacity:.6;margin-bottom:${24 * u}px">${escapeHtml(visual.label || "Glossary")}</p>
<h1 class="accent" style="font-size:${104 * u}px;font-weight:800;letter-spacing:-.03em;line-height:1">${escapeHtml(visual.term)}</h1>
<div style="width:${120 * u}px;height:${8 * u}px;border-radius:8px;background:${theme.accent};margin:${40 * u}px 0"></div>
<p style="font-size:${50 * u}px;line-height:1.35;max-width:95%">${escapeHtml(visual.definition)}</p>
${visual.example ? `<p style="margin-top:${36 * u}px;font-size:${36 * u}px;opacity:.7;font-style:italic">e.g. ${escapeHtml(visual.example)}</p>` : ""}
</div>`,
	});
}

function comparisonFrame({ size, theme, visual }) {
	const u = unit(size);
	const cols = (visual.columns || []).slice(0, 3);
	const rows = (visual.rows || []).slice(0, 5);
	const vertical = size.height > size.width;
	const font = (vertical ? 36 : 40) * u;
	return page({
		...size,
		theme,
		body: `<div style="position:absolute;inset:0;display:flex;flex-direction:column;justify-content:center;padding:${90 * u}px">
${visual.title ? `<h2 style="font-size:${72 * u}px;font-weight:800;letter-spacing:-.02em;margin-bottom:${44 * u}px">${escapeHtml(visual.title)}</h2>` : ""}
<table style="width:100%;border-collapse:separate;border-spacing:0;font-size:${font}px;border-radius:${24 * u}px;overflow:hidden;border:2px solid ${theme.text}22">
<thead><tr><th style="padding:${24 * u}px;text-align:left;background:${theme.text}0d"></th>${cols
			.map(
				(c, i) =>
					`<th style="padding:${24 * u}px;text-align:center;font-weight:800;${i === 0 ? `background:${theme.accent};color:#fff` : `background:${theme.text}0d`}">${escapeHtml(c)}</th>`,
			)
			.join("")}</tr></thead>
<tbody>${rows
			.map(
				(r) =>
					`<tr><td style="padding:${22 * u}px ${24 * u}px;border-top:1px solid ${theme.text}1f;opacity:.75">${escapeHtml(r.label)}</td>${cols
						.map(
							(_, i) =>
								`<td style="padding:${22 * u}px;text-align:center;border-top:1px solid ${theme.text}1f;font-weight:${i === 0 ? 800 : 500};${i === 0 ? `background:${theme.accent}1a` : ""}">${escapeHtml(r.values?.[i] ?? "—")}</td>`,
						)
						.join("")}</tr>`,
			)
			.join("")}</tbody></table></div>`,
	});
}

function quoteFrame({ size, theme, visual }) {
	const u = unit(size);
	return page({
		...size,
		theme,
		body: `<div style="position:absolute;inset:0;display:flex;flex-direction:column;justify-content:center;padding:${130 * u}px">
<div class="accent" style="font-size:${220 * u}px;line-height:.6;font-weight:800;font-family:Georgia,serif">“</div>
<p style="font-size:${68 * u}px;font-weight:700;line-height:1.2;letter-spacing:-.02em;max-width:95%">${escapeHtml(visual.text)}</p>
${visual.author ? `<p style="margin-top:${40 * u}px;font-size:${36 * u}px;opacity:.7">— ${escapeHtml(visual.author)}</p>` : ""}
</div>`,
	});
}

/**
 * Screenshot inside a browser window mock-up, blurred copy as backdrop, kinetic caption on top.
 * Returns html plus the window box so the camera can zoom toward the frame's focus point.
 */
function screenshotFrame({ size, theme, visual, scene, image }) {
	const u = unit(size);
	const { width, height } = size;
	const caption = String(scene.on_screen_text || "").trim();
	const capH = caption ? 150 * u : 0;
	const chrome = image.chrome !== false;
	const bar = chrome ? 46 * u : 0;
	const pad = 70 * u;
	const availW = width - pad * 2;
	const availH = height - pad * 2 - capH - bar;
	const ar = image.width / image.height;
	let winW = availW;
	let imgH = winW / ar;
	if (imgH > availH) {
		imgH = availH;
		winW = imgH * ar;
	}
	const left = (width - winW) / 2;
	const top = pad + capH + (availH - imgH) / 2;
	const dots = ["#ff5f57", "#febc2e", "#28c840"]
		.map((c) => `<i style="display:inline-block;width:${14 * u}px;height:${14 * u}px;border-radius:50%;background:${c};margin-right:${9 * u}px"></i>`)
		.join("");
	const html = page({
		...size,
		theme,
		extraCss: image.backdropUrl
			? `.bg{position:absolute;inset:0;background:url(${image.backdropUrl}) center/cover;opacity:.5}`
			: `.bg{position:absolute;inset:-60px;background:url(${image.dataUrl}) center/cover;filter:blur(40px) saturate(1.2);opacity:.45}`,
		body: `<div class="bg"></div>
${caption ? `<div style="position:absolute;left:0;right:0;top:${pad * 0.7}px;text-align:center"><span style="display:inline-block;font-size:${66 * u}px;font-weight:800;letter-spacing:-.02em;padding:${14 * u}px ${36 * u}px;border-radius:${22 * u}px;background:${theme.background}d9;border-bottom:${8 * u}px solid ${theme.accent}">${escapeHtml(caption)}</span></div>` : ""}
<div style="position:absolute;left:${left}px;top:${top}px;width:${winW}px;border-radius:${20 * u}px;overflow:hidden;box-shadow:0 ${40 * u}px ${120 * u}px #000a;border:1px solid #ffffff22">
${chrome ? `<div style="height:${bar}px;background:#1e1f26;display:flex;align-items:center;padding-left:${20 * u}px">${dots}
${visual.url ? `<span style="margin-left:${24 * u}px;font-size:${20 * u}px;color:#aab;font-family:'JetBrains Mono',monospace">${escapeHtml(visual.url)}</span>` : ""}</div>` : ""}
<img src="${image.dataUrl}" style="display:block;width:${winW}px;height:${imgH}px">
</div>`,
	});
	const fx = image.focus?.x ?? 0.5;
	const fy = image.focus?.y ?? 0.4;
	return {
		html,
		focus: {
			x: (left + fx * winW) / width,
			y: (top + bar + fy * imgH) / height,
		},
	};
}

const KEYWORDS =
	/\b(import|from|export|default|const|let|var|function|return|async|await|if|else|for|while|class|new|def|fn|pub|use|struct|impl|package|func|type|interface|extends|try|catch|throw|true|false|null|None|self|this)\b/g;

/** Tiny tokenizer-free highlighter: comments, strings, keywords, numbers. */
function highlight(line) {
	const out = [];
	const re = /(\/\/.*$|#(?!!).*$|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/g;
	let last = 0;
	let m;
	while ((m = re.exec(line))) {
		out.push({ t: line.slice(last, m.index), k: "code" });
		out.push({ t: m[0], k: /^(\/\/|#)/.test(m[0]) ? "com" : "str" });
		last = m.index + m[0].length;
	}
	out.push({ t: line.slice(last), k: "code" });
	return out
		.map(({ t, k }) => {
			const e = escapeHtml(t);
			if (k === "com") return `<span style="color:#6b7394;font-style:italic">${e}</span>`;
			if (k === "str") return `<span style="color:#a5e075">${e}</span>`;
			return e
				.replace(KEYWORDS, '<span style="color:#c792ea">$1</span>')
				.replace(/\b(\d+(?:\.\d+)?)\b/g, '<span style="color:#f78c6c">$1</span>');
		})
		.join("");
}

function codeFrame({ size, theme, visual, code }) {
	const u = unit(size);
	const lines = code?.lines || ["// file not found"];
	const fontPx = Math.min(36 * u, ((size.height - 360 * u) / Math.max(lines.length, 8)) * 0.78);
	return page({
		...size,
		theme,
		body: `<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:${80 * u}px">
${visual.caption ? `<h2 style="font-size:${58 * u}px;font-weight:800;margin-bottom:${36 * u}px;text-align:center">${escapeHtml(visual.caption)}</h2>` : ""}
<div style="width:100%;max-width:${1500 * u}px;border-radius:${22 * u}px;overflow:hidden;background:#0f111a;box-shadow:0 ${30 * u}px ${100 * u}px #000b;border:1px solid #ffffff1a">
<div style="padding:${16 * u}px ${24 * u}px;background:#1a1c25;color:#9aa3c7;font:${24 * u}px 'JetBrains Mono',monospace;border-bottom:2px solid ${theme.accent}">${escapeHtml(visual.file || "")}</div>
<pre style="padding:${28 * u}px ${32 * u}px;color:#e6e9f5;font:${fontPx}px/1.45 'JetBrains Mono',Menlo,monospace;white-space:pre-wrap;word-break:break-word">${lines
			.map(
				(l, i) => `<span style="color:#4b5270;display:inline-block;width:3ch;text-align:right;margin-right:2ch">${(code?.startLine || 1) + i}</span>${highlight(l)}`,
			)
			.join("\n")}</pre></div></div>`,
	});
}

/**
 * Sketch Explainer frame: paper background, wobbly ink outlines, hand-written labels. `visual.nodes` (2-4 short
 * labels) are drawn as boxes joined by arrows, so a scene reads as a small diagram.
 */
function sketchFrame({ size, theme, visual }) {
	const u = unit(size);
	const portrait = size.height > size.width;
	const ink = theme.text;
	const nodes = (Array.isArray(visual.nodes) ? visual.nodes : []).map((n) => String(n).slice(0, 28)).filter(Boolean).slice(0, 4);
	const label = String(visual.label || visual.title || "").slice(0, 60);
	const hand = "'Caveat','Segoe Print','Bradley Hand','Comic Sans MS',cursive";
	const box = (text) => `<div class="rough" style="padding:${34 * u}px ${54 * u}px;border:${7 * u}px solid ${ink};border-radius:${26 * u}px ${34 * u}px ${24 * u}px ${38 * u}px;font-family:${hand};font-weight:700;font-size:${100 * u}px;line-height:1.05;text-align:center;background:#ffffffb3;max-width:${portrait ? 86 : 30}%">${escapeHtml(text)}</div>`;
	const arrow = portrait
		? `<svg class="rough" width="${110 * u}" height="${180 * u}" viewBox="0 0 90 150"><path d="M45 6 C 40 50, 50 90, 45 134" fill="none" stroke="${theme.accent}" stroke-width="${7}" stroke-linecap="round"/><path d="M22 112 L45 140 L68 112" fill="none" stroke="${theme.accent}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></svg>`
		: `<svg class="rough" width="${150 * u}" height="${90 * u}" viewBox="0 0 150 90"><path d="M6 45 C 50 40, 90 50, 134 45" fill="none" stroke="${theme.accent}" stroke-width="7" stroke-linecap="round"/><path d="M112 22 L140 45 L112 68" fill="none" stroke="${theme.accent}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
	const diagram = nodes.length >= 2 ? nodes.map((n, i) => (i ? arrow : "") + box(n)).join("") : label ? box(label) : "";
	const heading = nodes.length >= 2 && label ? `<h1 style="font-family:${hand};font-weight:700;font-size:${(portrait ? 124 : 100) * u}px;line-height:1.02;text-align:center;max-width:90%">${escapeHtml(label)}<svg width="100%" height="${26 * u}" viewBox="0 0 400 26" preserveAspectRatio="none" style="display:block;margin-top:${6 * u}px"><path d="M4 16 C 60 4, 120 24, 200 12 S 340 20, 396 8" fill="none" stroke="${theme.accent}" stroke-width="6" stroke-linecap="round"/></svg></h1>` : "";
	return page({
		...size,
		theme,
		bare: true,
		extraCss: `body{background-image:radial-gradient(${ink}14 1.2px,transparent 1.4px);background-size:${28 * u}px ${28 * u}px}.rough{filter:url(#rough)}`,
		body: `<svg width="0" height="0" style="position:absolute"><filter id="rough"><feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="7"/><feDisplacementMap in="SourceGraphic" scale="${7 * u}"/></filter></svg>
<div style="position:absolute;top:${48 * u}px;left:${56 * u}px;font-family:${hand};font-size:${44 * u}px;opacity:.55">${visual.index && visual.total ? `${visual.index} / ${visual.total}` : ""}</div>
<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:${52 * u}px;padding:${130 * u}px ${70 * u}px">
${heading}
<div style="display:flex;flex-direction:${portrait ? "column" : "row"};align-items:center;justify-content:center;gap:${24 * u}px;width:100%">${diagram}</div>
</div>`,
	});
}

/**
 * @param {{ scene: object, size: { width: number, height: number }, theme: object,
 *   image?: { dataUrl: string, width: number, height: number, focus?: object }, code?: { lines: string[], startLine: number } }} p
 * @returns {{ html: string, focus: { x: number, y: number } }}
 */
export function buildFrameHtml({ scene, size, theme, image, code }) {
	const visual = scene.visual || {};
	const center = { x: 0.5, y: 0.5 };
	if (isStyled(theme.style)) return { html: styledFrame({ style: theme.style, size, theme, visual, scene, image, code }), focus: center };
	// The plain look has no steps, plans or timeline layout: draw them as bullets or stats.
	if (visual.type === "steps") return { html: bulletsFrame({ size, theme, visual: { title: visual.title, items: (visual.items || []).map((it, n) => `${n + 1}. ${it.label}`) } }), focus: center };
	if (visual.type === "timeline") return { html: bulletsFrame({ size, theme, visual: { title: visual.title, items: (visual.items || []).map((it) => `${it.when}: ${it.label}`) } }), focus: center };
	if (visual.type === "plans") return { html: statsFrame({ size, theme, visual: { items: (visual.items || []).map((it) => ({ label: `${it.name}${it.for ? ` · ${it.for}` : ""}`, value: it.price })) } }), focus: center };
	switch (visual.type) {
		case "screenshot":
		case "image":
			if (image) return screenshotFrame({ size, theme, visual, scene, image });
			return { html: titleFrame({ size, theme, visual: { title: scene.on_screen_text || "" } }), focus: center };
		case "quote":
			return { html: quoteFrame({ size, theme, visual }), focus: center };
		case "faq":
			return { html: faqFrame({ size, theme, visual }), focus: { x: 0.5, y: 0.4 } };
		case "glossary":
			return { html: glossaryFrame({ size, theme, visual }), focus: center };
		case "comparison":
			return { html: comparisonFrame({ size, theme, visual }), focus: center };
		case "bullets":
			return { html: bulletsFrame({ size, theme, visual }), focus: center };
		case "stats":
			return { html: statsFrame({ size, theme, visual }), focus: center };
		case "code":
			return { html: codeFrame({ size, theme, visual, code }), focus: center };
		case "sketch":
			return { html: sketchFrame({ size, theme, visual }), focus: center };
		case "outro":
			return { html: outroFrame({ size, theme, visual }), focus: center };
		default:
			return { html: titleFrame({ size, theme, visual }), focus: center };
	}
}
