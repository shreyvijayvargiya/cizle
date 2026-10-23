/**
 * Animated render styles. Every scene type (title, bullets, stats, quote, faq, glossary, comparison, code,
 * screenshot, sketch diagram, outro) is drawn by one layout, dressed by one of five styles:
 *
 *   sketch     hand-drawn: paper, wobbly ink, hand lettering, doodles
 *   clay       soft claymation: puffy pastel blobs, squash-and-stretch pops
 *   glass      glassmorphism: frosted cards over drifting colour orbs
 *   isometric  extruded slabs and floating isometric cubes
 *   ascii      terminal: monospace, double-line boxes, typed text, falling characters
 *
 * The HTML uses only CSS animations (entrance + ambient). The renderer pauses them and seeks frame by frame
 * (browser.renderSequence), so what you see in the video is exactly what the browser drew.
 */

export const STYLE_IDS = ["default", "sketch", "clay", "glass", "isometric", "ascii"];
export const isStyled = (s) => Boolean(s) && s !== "default" && STYLE_IDS.includes(s);
export const normalizeStyle = (s) => (STYLE_IDS.includes(s) ? s : "default");

const esc = (s) =>
	String(s ?? "")
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;");

export const FONTS = {
	sketch: ["Caveat:wght@500;700", "'Caveat','Segoe Print','Bradley Hand','Comic Sans MS',cursive"],
	clay: ["Fredoka:wght@500;600;700", "'Fredoka','Nunito','Baloo 2','Trebuchet MS',system-ui,sans-serif"],
	glass: ["Inter:wght@400;600;800", "Inter,'Segoe UI',Helvetica,Arial,sans-serif"],
	isometric: ["Space+Grotesk:wght@500;700", "'Space Grotesk',Inter,'Segoe UI',Helvetica,sans-serif"],
	ascii: ["JetBrains+Mono:wght@400;700", "'JetBrains Mono','SFMono-Regular',Menlo,Consolas,monospace"],
};

/** Palette per style. Brand accent (theme.accent) tints highlights where it stays legible. */
export function palette(style, theme) {
	const brand = /^#[0-9a-f]{6}$/i.test(theme.accent || "") ? theme.accent : null;
	switch (style) {
		case "sketch":
			return { bg: "#fbf8f1", text: "#23211d", accent: "#2f5bea", card: "#ffffffb3", soft: "#23211d14" };
		case "clay":
			return { bg: "#f4ede4", text: "#3a2e29", accent: brand || "#ff7a59", card: "#fff8f0", soft: "#3a2e2914" };
		case "glass":
			return { bg: "#0a0e1f", text: "#f4f6ff", accent: brand || "#7c5cff", card: "#ffffff1f", soft: "#ffffff22" };
		case "isometric":
			return { bg: "#eef2f9", text: "#16213a", accent: brand || "#3b6cff", card: "#ffffff", soft: "#16213a12" };
		default:
			return { bg: "#050a06", text: "#38ff85", accent: "#ffcf4a", card: "#08150c", soft: "#38ff8522" };
	}
}

/** Style CSS. `u` scales everything to the shorter side so 9:16, 1:1 and 16:9 all stay legible. */
function css(style, p, size) {
	const u = Math.min(size.width, size.height) / 1080;
	const [, font] = FONTS[style];
	const U = (n) => `${Math.round(n * u * 10) / 10}px`;
	const base = `
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:${size.width}px;height:${size.height}px;overflow:hidden}
body{font-family:${font};color:${p.text};background:${p.bg};position:relative;-webkit-font-smoothing:antialiased}
.bg{position:absolute;inset:0;overflow:hidden}
.stage{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:${U(36)};padding:${U(110)} ${U(80)};text-align:center}
.row{display:flex;gap:${U(28)};flex-wrap:wrap;justify-content:center;width:100%}
.col{display:flex;flex-direction:column;gap:${U(26)};width:100%;align-items:center}
.h1{font-size:${U(118)};line-height:1.02;font-weight:800;letter-spacing:-.02em;max-width:94%}
.h2{font-size:${U(84)};line-height:1.05;font-weight:800;max-width:94%}
.sub{font-size:${U(50)};line-height:1.25;opacity:.78;max-width:84%}
.lbl{font-size:${U(36)};opacity:.7;text-transform:uppercase;letter-spacing:.08em}
.num{font-size:${U(120)};font-weight:800;line-height:1}
.card{padding:${U(34)} ${U(46)};font-size:${U(58)};line-height:1.2;font-weight:600;max-width:92%;width:max-content;min-width:${U(260)}}
.card.wide{width:92%}
.pill{display:inline-block;padding:${U(18)} ${U(44)};font-size:${U(50)};font-weight:800;border-radius:999px;background:${p.accent};color:#fff}
.mono{font-family:'JetBrains Mono',Menlo,Consolas,monospace}
.tbl{border-collapse:separate;border-spacing:${U(10)};font-size:${U(40)};width:94%}
.tbl th,.tbl td{padding:${U(20)} ${U(22)};border-radius:${U(18)}}
.tbl td:first-child,.tbl th:first-child{text-align:left;opacity:.8}
.device{width:90%;overflow:hidden;position:relative}
.device .bar{display:flex;gap:${U(10)};padding:${U(18)} ${U(24)}}
.device .bar i{width:${U(18)};height:${U(18)};border-radius:50%;background:currentColor;opacity:.35}
.device img{display:block;width:100%;max-height:${Math.round(size.height * 0.56)}px;object-fit:cover;object-position:top}
.code{font-family:'JetBrains Mono',Menlo,Consolas,monospace;font-size:${U(34)};text-align:left;white-space:pre;line-height:1.5;padding:${U(30)} ${U(40)};max-width:94%;overflow:hidden}
.arrow{display:block}
.card.code{font-size:${U(30)};font-weight:500;width:94%;max-width:94%}
.badge{display:inline-flex;align-items:center;justify-content:center;flex:none;width:${U(88)};height:${U(88)};border-radius:50%;font-size:${U(50)};font-weight:800;background:${p.accent};color:#fff}
.stepcard{display:flex;align-items:center;gap:${U(32)};text-align:left;width:92%}
.detail{font-size:${U(38)};font-weight:500;opacity:.72;margin-top:${U(6)}}
.chip{display:inline-block;padding:${U(8)} ${U(24)};border-radius:999px;font-size:${U(34)};font-weight:800;text-transform:uppercase;letter-spacing:.06em;background:${p.accent};color:#fff}
.plan{display:flex;justify-content:space-between;align-items:center;gap:${U(26)};text-align:left;width:92%}
.plan .price{font-size:${U(78)};font-weight:800;line-height:1}
.plan .perk{font-size:${U(36)};font-weight:500;opacity:.72;margin-top:${U(6)}}
.tl{display:flex;flex-direction:column;gap:${U(30)};width:92%;position:relative;padding-left:${U(60)}}
.tl:before{content:"";position:absolute;left:${U(18)};top:${U(30)};bottom:${U(30)};width:${U(8)};border-radius:${U(8)};background:${p.accent};opacity:.55}
.tl .item{position:relative;text-align:left}
.tl .item:before{content:"";position:absolute;left:${U(-60)};top:${U(34)};width:${U(44)};height:${U(44)};border-radius:50%;background:${p.accent};border:${U(8)} solid ${p.bg}}
.tl .card{margin-top:${U(14)};width:100%;max-width:100%}
.in{animation:var(--enter) .8s cubic-bezier(.2,.9,.25,1.15) both;animation-delay:calc(var(--i,0) * .16s + .05s)}
`;
	switch (style) {
		case "sketch":
			return `${base}
body{background-image:radial-gradient(${p.text}14 1.2px,transparent 1.4px);background-size:${U(28)} ${U(28)}}
.h1,.h2,.card,.pill,.num,.sub{font-weight:700}
.h1{font-size:${U(132)}}.h2{font-size:${U(96)}}.card{font-size:${U(70)}}.sub{font-size:${U(58)}}
.card{background:${p.card};border:${U(6)} solid ${p.text};border-radius:${U(26)} ${U(34)} ${U(24)} ${U(38)};filter:url(#rough)}
.pill{border:${U(6)} solid ${p.text};filter:url(#rough);background:${p.accent}}
.tbl th,.tbl td{border:${U(4)} solid ${p.text};filter:url(#rough)}
.device{border:${U(7)} solid ${p.text};border-radius:${U(30)};background:#fff;filter:url(#rough)}
.code{background:#fff;border:${U(6)} solid ${p.text};border-radius:${U(26)};filter:url(#rough)}
.rough{filter:url(#rough)}
.uline path{stroke-dasharray:420;stroke-dashoffset:420;animation:draw 1s .5s ease-out both}
.arrow path{stroke-dasharray:260;stroke-dashoffset:260;animation:draw .7s ease-out both;animation-delay:calc(var(--i,0) * .16s + .3s)}
.doodle{position:absolute;opacity:.5;animation:wob 4s ease-in-out infinite alternate}
@keyframes sk{0%{transform:scale(.55) rotate(-5deg);opacity:0}60%{transform:scale(1.07) rotate(1.5deg);opacity:1}100%{transform:scale(1) rotate(0)}}
@keyframes draw{to{stroke-dashoffset:0}}
@keyframes wob{from{transform:translateY(0) rotate(-6deg)}to{transform:translateY(${U(-26)}) rotate(7deg)}}
.badge{border:${U(6)} solid ${p.text};filter:url(#rough);background:#fff;color:${p.text}}
.chip{border:${U(4)} solid ${p.text};background:#fff;color:${p.text};filter:url(#rough)}
.tl:before{background:${p.text};opacity:.8;filter:url(#rough)}
.tl .item:before{background:#fff;border:${U(6)} solid ${p.text}}
.stage{--enter:sk}`;
		case "clay":
			return `${base}
.h1,.h2{text-shadow:0 ${U(6)} 0 #ffffffb0}
.card{background:${p.card};border-radius:${U(64)};box-shadow:inset 0 ${U(-16)} ${U(26)} #00000014,inset 0 ${U(12)} ${U(20)} #ffffffe0,0 ${U(30)} ${U(44)} ${U(-16)} #3a2e2955;font-weight:600}
.pill{box-shadow:inset 0 ${U(-10)} ${U(18)} #00000026,inset 0 ${U(8)} ${U(14)} #ffffff66,0 ${U(18)} ${U(28)} ${U(-10)} ${p.accent}88;border-radius:999px}
.tbl th,.tbl td{background:${p.card};box-shadow:inset 0 ${U(-8)} ${U(14)} #0000000f,inset 0 ${U(6)} ${U(10)} #fff}
.device{border-radius:${U(56)};background:${p.card};box-shadow:inset 0 ${U(-14)} ${U(24)} #00000012,inset 0 ${U(10)} ${U(16)} #ffffffe0,0 ${U(34)} ${U(50)} ${U(-18)} #3a2e2966;padding:${U(18)}}
.device img{border-radius:${U(38)}}
.code{background:#3a2e29;color:#ffe9d6;border-radius:${U(50)};box-shadow:inset 0 ${U(10)} ${U(16)} #ffffff1c,0 ${U(30)} ${U(44)} ${U(-16)} #3a2e2977}
.blob{position:absolute;border-radius:46% 54% 58% 42%/48% 44% 56% 52%;box-shadow:inset 0 ${U(-30)} ${U(50)} #00000018,inset 0 ${U(24)} ${U(40)} #ffffff99,0 ${U(40)} ${U(60)} ${U(-24)} #3a2e2955;animation:drift 6s ease-in-out infinite alternate}
@keyframes cl{0%{transform:translateY(${U(120)}) scale(.7,.45);opacity:0}45%{transform:translateY(${U(-30)}) scale(.94,1.1);opacity:1}65%{transform:translateY(0) scale(1.07,.93)}82%{transform:scale(.98,1.03)}100%{transform:none}}
@keyframes drift{from{transform:translate(0,0) rotate(0) scale(1)}to{transform:translate(${U(34)},${U(-46)}) rotate(14deg) scale(1.06)}}
.badge{box-shadow:inset 0 ${U(-8)} ${U(14)} #00000030,inset 0 ${U(6)} ${U(10)} #ffffff77,0 ${U(14)} ${U(22)} ${U(-8)} ${p.accent}88}
.chip{box-shadow:inset 0 ${U(-6)} ${U(10)} #00000026,inset 0 ${U(5)} ${U(8)} #ffffff66}
.tl:before{box-shadow:inset 0 ${U(-4)} ${U(6)} #00000022}
.stage{--enter:cl}`;
		case "glass":
			return `${base}
body{background:radial-gradient(120% 90% at 20% 0%,#1d1a4a,${p.bg} 60%)}
.h1,.h2{text-shadow:0 ${U(8)} ${U(40)} #00000066}
.card{background:linear-gradient(135deg,#ffffff2e,#ffffff10);border:${U(2)} solid #ffffff40;border-radius:${U(48)};backdrop-filter:blur(${U(34)}) saturate(1.5);-webkit-backdrop-filter:blur(${U(34)}) saturate(1.5);box-shadow:0 ${U(30)} ${U(70)} ${U(-20)} #000000aa,inset 0 ${U(2)} 0 #ffffff55}
.pill{background:linear-gradient(135deg,${p.accent},#ff5cc8);box-shadow:0 ${U(18)} ${U(50)} ${U(-12)} ${p.accent}}
.tbl th,.tbl td{background:#ffffff14;border:${U(2)} solid #ffffff30;backdrop-filter:blur(${U(20)})}
.device{border-radius:${U(40)};background:#ffffff12;border:${U(2)} solid #ffffff44;backdrop-filter:blur(${U(24)});box-shadow:0 ${U(40)} ${U(80)} ${U(-24)} #000000bb}
.code{background:#0a0e1fcc;border:${U(2)} solid #ffffff33;border-radius:${U(36)};backdrop-filter:blur(${U(20)})}
.orb{position:absolute;border-radius:50%;filter:blur(${U(70)});opacity:.85;animation:orb 7s ease-in-out infinite alternate}
@keyframes gl{0%{transform:translateY(${U(60)}) scale(.94);opacity:0;filter:blur(${U(18)})}100%{transform:none;opacity:1;filter:blur(0)}}
@keyframes orb{from{transform:translate(0,0) scale(1)}to{transform:translate(${U(90)},${U(-120)}) scale(1.25)}}
.badge{background:linear-gradient(135deg,${p.accent},#ff5cc8);box-shadow:0 ${U(12)} ${U(34)} ${U(-8)} ${p.accent}}
.chip{background:linear-gradient(135deg,${p.accent},#ff5cc8)}
.tl:before{background:linear-gradient(180deg,${p.accent},#ff5cc8);opacity:.9}
.tl .item:before{background:#fff;box-shadow:0 0 ${U(24)} ${p.accent}}
.stage{--enter:gl}`;
		case "isometric":
			return `${base}
body{background:linear-gradient(180deg,#f6f8fd,${p.bg})}
.grid{position:absolute;inset:-20%;background-image:repeating-linear-gradient(30deg,${p.text}10 0 ${U(2)},transparent ${U(2)} ${U(90)}),repeating-linear-gradient(150deg,${p.text}10 0 ${U(2)},transparent ${U(2)} ${U(90)});animation:gridmove 12s linear infinite}
.h1,.h2{text-shadow:${U(5)} ${U(5)} 0 ${p.accent}33}
.card{background:${p.card};border:${U(4)} solid ${p.text};border-radius:${U(18)};box-shadow:${[1,2,3,4,5,6,7,8,9,10,11,12].map((n) => `${U(n)} ${U(n)} 0 ${p.accent}`).join(",")},${U(22)} ${U(26)} ${U(34)} #16213a44;transform:translateX(${U(-6)})}
.pill{border-radius:${U(16)};border:${U(4)} solid ${p.text};box-shadow:${[1,2,3,4,5,6,7,8].map((n) => `${U(n)} ${U(n)} 0 ${p.text}`).join(",")}}
.tbl th,.tbl td{background:#fff;border:${U(3)} solid ${p.text};border-radius:${U(8)};box-shadow:${U(5)} ${U(5)} 0 ${p.accent}}
.device{background:#fff;border:${U(5)} solid ${p.text};border-radius:${U(18)};box-shadow:${[1,2,3,4,5,6,7,8,9,10,11,12,13,14].map((n) => `${U(n)} ${U(n)} 0 ${p.accent}`).join(",")},${U(26)} ${U(30)} ${U(40)} #16213a44}
.code{background:${p.text};color:#dfe8ff;border-radius:${U(16)};box-shadow:${[1,2,3,4,5,6,7,8,9,10].map((n) => `${U(n)} ${U(n)} 0 ${p.accent}`).join(",")}}
.cube{position:absolute;transform-style:preserve-3d;transform:rotateX(-35.264deg) rotateY(45deg);animation:cube 4.5s ease-in-out infinite alternate}
.cube i{position:absolute;inset:0;border:${U(3)} solid ${p.text}}
.cube i:nth-child(1){transform:translateZ(var(--s))}
.cube i:nth-child(2){transform:rotateY(-90deg) translateZ(var(--s))}
.cube i:nth-child(3){transform:rotateX(90deg) translateZ(var(--s))}
@keyframes iso{0%{transform:translate(${U(-110)},${U(110)}) translateX(${U(-6)});opacity:0}100%{transform:translateX(${U(-6)});opacity:1}}
@keyframes cube{from{margin-top:0}to{margin-top:${U(-46)}}}
@keyframes gridmove{to{transform:translate(${U(90 * 0.866)},${U(45)})}}
.badge{border-radius:${U(14)};border:${U(4)} solid ${p.text};box-shadow:${[1,2,3,4,5,6].map((n) => `${U(n)} ${U(n)} 0 ${p.text}`).join(",")}}
.chip{border-radius:${U(8)};border:${U(3)} solid ${p.text};box-shadow:${[1,2,3,4].map((n) => `${U(n)} ${U(n)} 0 ${p.text}`).join(",")}}
.tl:before{border-radius:0;background:${p.text};opacity:.9;width:${U(6)}}
.tl .item:before{border-radius:${U(8)};background:${p.accent};border:${U(5)} solid ${p.text}}
.stage{--enter:iso}`;
		default:
			return `${base}
body{text-shadow:0 0 ${U(14)} ${p.text}99}
.h1,.h2{font-weight:700;letter-spacing:0;text-transform:none}
.h1{font-size:${U(104)}}.h2{font-size:${U(78)}}.sub{font-size:${U(42)}}.card{font-size:${U(48)};font-weight:700}.num{font-size:${U(104)}}
.card{background:${p.card};border:${U(7)} double ${p.text};border-radius:0;box-shadow:0 0 ${U(40)} ${p.text}33,inset 0 0 ${U(30)} ${p.text}14;text-align:left}
.pill{background:${p.text};color:#04100a;border-radius:0;text-shadow:none}
.tbl th,.tbl td{background:${p.card};border:${U(3)} solid ${p.text};border-radius:0}
.device{background:${p.card};border:${U(7)} double ${p.text};border-radius:0}
.code{background:${p.card};border:${U(7)} double ${p.text};border-radius:0;color:${p.text}}
.scan{position:absolute;inset:0;background:repeating-linear-gradient(0deg,#00000066 0 ${U(3)},transparent ${U(3)} ${U(7)});pointer-events:none;animation:scan 8s linear infinite}
.vig{position:absolute;inset:0;background:radial-gradient(120% 100% at 50% 50%,transparent 55%,#000000dd);pointer-events:none}
.rain{position:absolute;top:0;white-space:pre;font-family:'JetBrains Mono',monospace;font-size:${U(34)};line-height:1.1;color:${p.text};opacity:.16;text-shadow:none;animation:rain var(--d) linear infinite}
.caret{display:inline-block;width:.5em;height:.95em;background:${p.text};vertical-align:-.12em;margin-left:.2em;animation:blink 1s steps(1) infinite}
.type{animation:typed var(--t,1s) steps(var(--n,24)) both;animation-delay:calc(var(--i,0) * .22s + .1s)}
@keyframes asc{0%{clip-path:inset(0 100% 0 0);opacity:0}1%{opacity:1}100%{clip-path:inset(0 0 0 0)}}
@keyframes typed{from{clip-path:inset(0 100% 0 0)}to{clip-path:inset(0 0 0 0)}}
@keyframes blink{50%{opacity:0}}
@keyframes rain{from{transform:translateY(${U(-1600)})}to{transform:translateY(0)}}
@keyframes scan{to{background-position:0 ${U(70)}}}
.badge{border-radius:0;background:transparent;color:${p.text};border:${U(6)} double ${p.text};width:auto;min-width:${U(110)};padding:0 ${U(14)};font-size:${U(44)}}
.chip{border-radius:0;background:${p.text};color:#04100a;text-shadow:none}
.tl:before{background:${p.text};border-radius:0;width:${U(4)}}
.tl .item:before{border-radius:0;background:${p.text};border:${U(6)} solid ${p.bg}}
.plan .price{color:${p.accent};text-shadow:0 0 ${U(18)} ${p.accent}99}
.stage{--enter:asc}`;
	}
}

/** Animated backdrop for each style. */
function decor(style, p, size) {
	const u = Math.min(size.width, size.height) / 1080;
	const w = size.width;
	const h = size.height;
	switch (style) {
		case "clay": {
			const blobs = [
				[0.1, 0.06, 360, p.accent, 0],
				[0.78, 0.18, 260, "#8fd3c8", -1.6],
				[0.64, 0.8, 420, "#ffd36e", -3],
				[0.04, 0.72, 280, "#b9a7ff", -2],
			];
			return blobs.map(([x, y, s, c, d]) => `<div class="blob" style="left:${x * w}px;top:${y * h}px;width:${s * u}px;height:${s * u}px;background:${c};opacity:.9;animation-delay:${d}s"></div>`).join("");
		}
		case "glass": {
			const orbs = [
				[0.1, 0.05, 620, p.accent, 0],
				[0.6, 0.55, 700, "#ff5cc8", -2.5],
				[0.5, 0.0, 480, "#33d6ff", -4.5],
			];
			return orbs.map(([x, y, s, c, d]) => `<div class="orb" style="left:${x * w}px;top:${y * h}px;width:${s * u}px;height:${s * u}px;background:${c};animation-delay:${d}s"></div>`).join("");
		}
		case "isometric": {
			const cubes = [
				[0.08, 0.1, 150, p.accent, 0],
				[0.8, 0.22, 110, "#ffb02e", -1.5],
				[0.72, 0.78, 170, "#3ddc97", -3],
				[0.1, 0.8, 120, "#ff5c7a", -2],
			];
			const face = (c, shade) => `<i style="background:${c};filter:brightness(${shade})"></i>`;
			return `<div class="grid"></div>${cubes.map(([x, y, s, c, d]) => `<div class="cube" style="--s:${(s * u) / 2}px;left:${x * w}px;top:${y * h}px;width:${s * u}px;height:${s * u}px;animation-delay:${d}s">${face(c, 1.1)}${face(c, 0.85)}${face(c, 1.3)}</div>`).join("")}`;
		}
		case "ascii": {
			const chars = "01アイウエオカキクケコ{}<>/=+*#%$";
			const cols = Math.ceil(w / (34 * u * 0.9));
			let out = "";
			for (let i = 0; i < cols; i++) {
				let col = "";
				for (let j = 0; j < 90; j++) col += `${chars[(i * 7 + j * 13) % chars.length]}\n`;
				out += `<pre class="rain" style="left:${Math.round(i * 34 * u * 0.9)}px;--d:${9 + (i % 5) * 2.2}s;animation-delay:-${(i * 1.3) % 9}s">${col}</pre>`;
			}
			return `${out}<div class="scan"></div><div class="vig"></div>`;
		}
		case "sketch": {
			const doodles = [
				[0.07, 0.08, `<path d="M20 4 L24 16 L37 16 L27 24 L31 37 L20 29 L9 37 L13 24 L3 16 L16 16 Z" fill="none" stroke="${p.accent}" stroke-width="3" stroke-linejoin="round"/>`, 0],
				[0.84, 0.1, `<path d="M3 20 C10 5, 18 35, 26 20 S 36 8, 40 20" fill="none" stroke="${p.text}" stroke-width="3" stroke-linecap="round"/>`, -1.2],
				[0.82, 0.84, `<circle cx="20" cy="20" r="14" fill="none" stroke="${p.accent}" stroke-width="3"/><path d="M13 20 L19 26 L28 14" fill="none" stroke="${p.accent}" stroke-width="3" stroke-linecap="round"/>`, -2.4],
				[0.06, 0.86, `<path d="M4 34 L34 6 M34 6 L22 8 M34 6 L32 18" fill="none" stroke="${p.text}" stroke-width="3" stroke-linecap="round"/>`, -3.1],
			];
			return doodles.map(([x, y, d, delay]) => `<svg class="doodle" style="left:${x * w}px;top:${y * h}px;animation-delay:${delay}s" width="${84 * u}" height="${84 * u}" viewBox="0 0 40 40">${d}</svg>`).join("");
		}
		default:
			return "";
	}
}

const ROUGH = `<svg width="0" height="0" style="position:absolute"><filter id="rough"><feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="7"/><feDisplacementMap in="SourceGraphic" scale="6"/></filter></svg>`;

const el = (cls, content, i = 0, extra = "") => `<div class="${cls} in" style="--i:${i};${extra}">${content}</div>`;
const typed = (text, style, i = 0) => (style === "ascii" ? `<span class="type" style="--i:${i};--n:${Math.min(22, Math.max(4, String(text).length))};--t:${Math.min(1.2, 0.3 + String(text).length * 0.03)}s">${esc(text)}</span>` : esc(text));
const heading = (cls, text, style, i = 0) => (style === "ascii" ? `<div class="${cls}">${style === "ascii" ? "&gt; " : ""}${typed(text, style, i)}<span class="caret"></span></div>` : el(cls, esc(text), i));

function sketchDiagram(visual, style, p, u) {
	const portrait = u.portrait;
	const nodes = (Array.isArray(visual.nodes) ? visual.nodes : []).map((n) => String(n).slice(0, 28)).filter(Boolean).slice(0, 4);
	const label = String(visual.label || visual.title || "").slice(0, 60);
	const arrow = portrait
		? `<svg class="arrow" width="${110 * u.k}" height="${170 * u.k}" viewBox="0 0 90 140"><path d="M45 6 C 40 50, 50 90, 45 128" fill="none" stroke="${p.accent}" stroke-width="7" stroke-linecap="round"/><path d="M22 106 L45 134 L68 106" fill="none" stroke="${p.accent}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></svg>`
		: `<svg class="arrow" width="${170 * u.k}" height="${110 * u.k}" viewBox="0 0 140 90"><path d="M6 45 C 50 40, 90 50, 128 45" fill="none" stroke="${p.accent}" stroke-width="7" stroke-linecap="round"/><path d="M106 22 L134 45 L106 68" fill="none" stroke="${p.accent}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
	const parts = [];
	if (label) parts.push(el("h2 h1", esc(label), 0));
	if (nodes.length >= 2) {
		const seq = nodes.map((n, i) => (i ? `<div class="in" style="--i:${i * 2 - 1}">${arrow}</div>` : "") + el("card", esc(n), i * 2));
		parts.push(`<div style="display:flex;flex-direction:${portrait ? "column" : "row"};align-items:center;justify-content:center;gap:${24 * u.k}px">${seq.join("")}</div>`);
	}
	return parts.join("");
}

/**
 * @returns {string} full HTML for one scene in the given style
 */
export function styledFrame({ style, size, theme, visual, scene, image, code }) {
	const p = palette(style, theme);
	const k = Math.min(size.width, size.height) / 1080;
	const ctx = { portrait: size.height > size.width, k };
	let body = "";
	switch (visual.type) {
		case "title":
			body = heading("h1", visual.title, style, 0) + (visual.subtitle ? el("sub", esc(visual.subtitle), 2) : "");
			break;
		case "bullets":
			body = (visual.title ? heading("h2", visual.title, style, 0) : "") + `<div class="col">${(visual.items || []).slice(0, 4).map((t, n) => el("card", (style === "ascii" ? "[x] " : "") + esc(t), n + 1)).join("")}</div>`;
			break;
		case "stats":
			body = `<div class="row">${(visual.items || []).slice(0, 4).map((it, n) => el("card", `<div class="num">${esc(it.value)}</div><div class="lbl" style="margin-top:${12 * k}px">${esc(it.label)}</div>`, n, "text-align:center")).join("")}</div>`;
			break;
		case "quote":
			body = el("card wide", `<div class="num" style="opacity:.4;line-height:.6">“</div><div style="font-size:${62 * k}px;line-height:1.25">${esc(visual.text)}</div>${visual.author ? `<div class="lbl" style="margin-top:${20 * k}px">${esc(visual.author)}</div>` : ""}`, 0);
			break;
		case "faq":
			body = el("lbl", "Question", 0) + el("card wide", esc(visual.question), 1) + el("lbl", "Answer", 3) + el("card wide", esc(visual.answer), 4);
			break;
		case "glossary":
			body = (visual.label ? el("lbl", esc(visual.label), 0) : "") + heading("h1", visual.term, style, 1) + el("card wide", esc(visual.definition), 3) + (visual.example ? el("sub", esc(visual.example), 4) : "");
			break;
		case "comparison": {
			const cols = (visual.columns || []).slice(0, 3);
			const rows = (visual.rows || []).slice(0, 5);
			body = (visual.title ? heading("h2", visual.title, style, 0) : "") + el("tbl-wrap", `<table class="tbl"><thead><tr><th></th>${cols.map((c, n) => `<th style="${n === 0 ? `background:${p.accent};color:#fff` : ""}">${esc(c)}</th>`).join("")}</tr></thead><tbody>${rows.map((r) => `<tr><td>${esc(r.label)}</td>${cols.map((_, n) => `<td>${esc(r.values?.[n] ?? "—")}</td>`).join("")}</tr>`).join("")}</tbody></table>`, 1, "width:100%");
			break;
		}
		case "code": {
			const raw = (code?.lines || []).slice(0, 14).map((l) => String(l).slice(0, 50));
			// Short snippets get bigger type: fit the longest line (plus its line number) into the card.
			const longest = Math.max(12, ...raw.map((l) => l.length + 5));
			// Usable width: the stage minus its side padding, 94% of that, minus the card padding and border.
			const usable = (size.width - 160 * k) * 0.94 - 96 * k;
			const px = Math.round(Math.max(26 * k, Math.min(62 * k, usable / (longest * 0.64))));
			const lines = raw.map((l, n) => `${String((code?.startLine || 1) + n).padStart(3, " ")}  ${esc(l)}`).join("\n");
			body = (visual.caption ? el("lbl", esc(visual.caption), 0) : "") + el("code card", lines || esc(visual.file || ""), 1, `font-size:${px}px`);
			break;
		}
		case "screenshot":
		case "image":
			body = (scene?.on_screen_text ? el("pill", esc(scene.on_screen_text), 0) : "") + (image ? el("device", `${image.chrome ? `<div class="bar"><i></i><i></i><i></i></div>` : ""}<img src="${image.dataUrl}" alt="">`, 1) : heading("h1", scene?.on_screen_text || "", style, 0));
			break;
		case "steps":
			body = (visual.title ? heading("h2", visual.title, style, 0) : "") + `<div class="col">${(visual.items || []).slice(0, 4).map((it, n) => el("card stepcard", `<span class="badge">${style === "ascii" ? `[${n + 1}]` : n + 1}</span><div><div>${esc(it.label)}</div>${it.detail ? `<div class="detail">${esc(it.detail)}</div>` : ""}</div>`, n + 1)).join("")}</div>`;
			break;
		case "plans": {
			const items = (visual.items || []).slice(0, 3);
			const card = (it, n) =>
				ctx.portrait
					? el("card plan", `<div><div class="lbl" style="opacity:.8">${esc(it.name)}</div><div style="margin-top:${6 * k}px">${esc(it.for || "")}</div>${Array.isArray(it.perks) && it.perks.length ? `<div class="perk">${it.perks.slice(0, 3).map(esc).join(" · ")}</div>` : ""}</div><div class="price">${esc(it.price)}</div>`, n + 1)
					: el("card", `<div class="lbl">${esc(it.name)}</div><div class="num" style="margin:${14 * k}px 0">${esc(it.price)}</div><div style="font-size:${40 * k}px">${esc(it.for || "")}</div>`, n + 1, "text-align:center;min-width:" + 360 * k + "px");
			body = (visual.title ? heading("h2", visual.title, style, 0) : "") + `<div class="${ctx.portrait ? "col" : "row"}">${items.map(card).join("")}</div>`;
			break;
		}
		case "timeline":
			body = (visual.title ? heading("h2", visual.title, style, 0) : "") + `<div class="tl">${(visual.items || []).slice(0, 4).map((it, n) => el("item", `<span class="chip">${esc(it.when)}</span>${el("card", esc(it.label), 0)}`, n + 1)).join("")}</div>`;
			break;
		case "sketch":
			body = sketchDiagram(visual, style, p, ctx);
			break;
		case "outro":
			body = heading("h1", visual.title, style, 0) + el("pill", esc(visual.cta), 2) + (visual.url ? el("sub", esc(visual.url), 3) : "");
			break;
		default:
			body = heading("h1", visual.title || scene?.on_screen_text || "", style, 0);
	}
	const [fontQuery] = FONTS[style];
	const fonts = `<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=${fontQuery}&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">`;
	const counter = visual.index && visual.total && style === "sketch" ? `<div style="position:absolute;top:${48 * k}px;left:${56 * k}px;font-size:${44 * k}px;opacity:.55">${visual.index} / ${visual.total}</div>` : "";
	return `<!doctype html><html><head><meta charset="utf-8">${fonts}<style>${css(style, p, size)}</style></head><body style="--u:${k}px">${style === "sketch" ? ROUGH : ""}<div class="bg">${decor(style, p, size)}</div>${counter}<div class="stage">${body}</div></body></html>`;
}
