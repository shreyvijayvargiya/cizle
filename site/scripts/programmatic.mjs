/**
 * Tier 10 programmatic pages: ten families of static, crawlable pages built from the library itself.
 *   /for/<use-case>  /styles/<style>  /models/<model>  /languages/<code>  /creators/<handle>
 *   /best/<topic>    /how-to/<task>   /alternatives/<tool>  /glossary/<term>  /templates/<type>
 * Quality guard: a page is written only when it has enough items to be worth reading (MIN_ITEMS, creators MIN_CREATOR).
 * Every page has a plain-markdown twin at <route>.md, and every family gets its own sitemap.
 */
import fs from "node:fs";
import path from "node:path";

const MIN_ITEMS = 6;
const MIN_CREATOR = 3;
const SHOWN = 60;

const blob = (g) => `${g.title || ""} ${g.preview || ""} ${g.category || ""} ${(g.tags || []).join(" ")}`.toLowerCase();
/** Topic pages match on the title, category and tags only: the preview text mentions too many things in passing. */
const strict = (g) => `${g.title || ""} ${g.category || ""} ${(g.tags || []).join(" ")}`.toLowerCase();
const sblob = (s) => `${s.name} ${s.summary} ${s.category} ${(s.tags || []).join(" ")} ${(s.bestFor || []).join?.(" ") || ""}`.toLowerCase();
const rank = (a, b) => Number(Boolean(b.hasVideo)) - Number(Boolean(a.hasVideo)) || (b.chars || 0) - (a.chars || 0);
const top = (counts, n = 3) => Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, n).map(([k]) => k);
const tally = (list, f) => list.reduce((m, x) => { const k = f(x); if (k) m[k] = (m[k] || 0) + 1; return m; }, {});
const title = (s) => s.replace(/-/g, " ").replace(/^./, (c) => c.toUpperCase());

/* ------------------------------------------------------------------ the authored parts */
const USE_CASES = [
	["product-launch-video", "Product launch videos", /launch|product (reveal|video|demo)|unbox|announce|teaser/, "A launch video has one job: make people want to try the thing in the first three seconds."],
	["saas-demo-video", "SaaS and app demo videos", /saas|dashboard|app (demo|promo)|product ui|feature tour|walkthrough|onboarding/, "Demo videos for software show the product doing its job. These prompts script the screens, the cursor and the cuts."],
	["ad-creative", "Ad creative: TikTok, Reels and short ads", /\bads?\b|advert|tiktok|reels|instagram|commercial|promo/, "Short ads live or die in the hook. These prompts set the first frame, the pacing and the call to action."],
	["explainer-video", "Explainer videos", /explain|how .{1,20} works|concept|tutorial|visuali[sz]ation/, "An explainer turns one idea into a sequence people can follow without sound."],
	["logo-and-title-intros", "Logo reveals, intros and title cards", /logo|\bintro\b|title card|sting|opener|kinetic|typograph/, "Logo reveals and title cards are short, so every frame of motion has to earn its place."],
	["data-visualization", "Data visualisation and animated charts", /chart|graph|metrics|data viz|visuali[sz]/, "Animated charts make numbers readable at a glance: what grows, what drops, where to look."],
	["game-trailers-and-scenes", "Game scenes and trailers", /\bgames?\b|trailer|\brpg\b|pixel|level/, "Game scenes and trailers need a world, a rule and a payoff in a few seconds."],
	["short-film-and-stories", "Short films and stories", /\bstory|stories|short film|narrative|cinematic|\bfilm\b/, "Short films need a clear look and one idea. These prompts fix the look so you can focus on the idea."],
	["3d-animation", "3D animation and WebGL scenes", /\b3d\b|three\.?js|webgl|isometric|low.?poly|blender/, "3D scenes written as prompts: geometry, light and a camera move, rendered in the browser."],
	["music-and-audio-visuals", "Music and audio visuals", /music|audio|\bbeat\b|visuali[sz]er|\bsong\b|sound/, "Visuals that move with sound: beats, waveforms and lyrics set to motion."],
	["education-and-lessons", "Education and lesson videos", /\blearn|lesson|education|teach|course|student/, "Lesson videos work when one concept is shown, then repeated in a new way."],
];

const STYLES = [
	["papercut", "Papercut", /paper.?cut|cut.?paper|layered paper/, "Layered paper with soft shadows between the sheets."],
	["anime", "Anime", /anime|manga|cel.?shad/, "Anime looks: cel shading, strong outlines, expressive motion."],
	["pixel-art", "Pixel art", /pixel|8.?bit|16.?bit|retro game/, "Pixel art and retro game graphics, built from hard-edged squares."],
	["low-poly", "Low poly", /low.?poly/, "Low-poly 3D: flat-shaded facets and clean colour."],
	["isometric", "Isometric", /isometric/, "Isometric scenes seen from a fixed three-quarter angle."],
	["hand-drawn", "Hand-drawn and sketch", /hand.?drawn|pencil|sketch|doodle|crayon|ink drawing/, "Pencil, ink and crayon looks that appear stroke by stroke."],
	["retro-and-vintage", "Retro and vintage", /retro|vintage|\bcrt\b|\b80s\b|\b90s\b|film grain|vhs/, "Retro looks: CRT glow, VHS noise, film grain and old-print colour."],
	["noir-and-black-and-white", "Noir and black and white", /\bnoir\b|black and white|monochrome|grayscale|greyscale/, "High-contrast monochrome with deep shadows."],
	["cyberpunk-and-neon", "Cyberpunk and neon", /cyberpunk|neon|synthwave|futuristic/, "Neon light, wet streets and a near-future mood."],
	["claymation-and-stop-motion", "Claymation and stop motion", /clay|stop.?motion|plasticine/, "Handmade, slightly uneven motion with a tactile look."],
	["watercolor", "Watercolour and painted", /water.?colou?r|oil paint|impasto|painterly|gouache/, "Painted looks with visible brush and bleeding colour."],
	["glitch", "Glitch and distortion", /glitch|datamosh|distort|chromatic/, "Digital glitch: RGB split, scan lines and broken frames."],
	["minimal", "Minimal and clean", /minimal|clean|flat design|swiss/, "Calm, clean layouts with a lot of empty space."],
	["cinematic", "Cinematic", /cinematic|anamorphic|film look|lens flare|shallow depth/, "A film look: wide frame, depth, light and a deliberate camera."],
	["photoreal", "Photoreal", /photo.?real|realistic|hyper.?real|lifelike/, "Lifelike footage with natural light and real materials."],
	["cartoon", "Cartoon", /cartoon|toon|rubber hose|2d animation/, "Cartoon looks, from rubber-hose to modern flat animation."],
];

const GLOSSARY = [
	["dolly-shot", "Dolly shot", /dolly/, "A dolly shot moves the camera smoothly toward or away from the subject, on a track or wheeled platform in real filmmaking. In a video prompt, \"slow dolly in\" tells the model to push toward the subject at an even pace, which adds focus and tension without cutting."],
	["tracking-shot", "Tracking shot", /tracking|follow(ing)? shot/, "A tracking shot keeps the camera moving alongside or behind a subject. In a prompt, say who or what is tracked and from which side, for example \"tracking shot from behind, a runner crossing a bridge\"."],
	["orbit-shot", "Orbit shot", /orbit/, "An orbit shot circles the camera around a subject while keeping it centred. It reveals shape and depth, so it suits products, characters and 3D scenes. Ask for one direction and a slow speed."],
	["crane-shot", "Crane shot", /crane|aerial|drone/, "A crane or drone shot lifts or lowers the camera to show scale and surroundings. Prompts usually pair it with a start and end height, such as \"rising crane shot from the lake to the ridge\"."],
	["handheld-shot", "Handheld shot", /handheld|shaky|found footage/, "Handheld footage is slightly unsteady on purpose, which feels documentary and close. It works for realism; avoid it when you want a clean, premium look."],
	["aspect-ratio", "Aspect ratio", /aspect ratio|9:16|16:9|vertical|portrait|widescreen/, "Aspect ratio is the width to height of the frame: 16:9 is wide (YouTube, web), 9:16 is vertical (TikTok, Reels, Shorts) and 1:1 is square. State it in the prompt, because layout and safe areas change with it."],
	["frame-rate", "Frame rate (fps)", /\bfps\b|frame rate|24 ?fps|30 ?fps|60 ?fps/, "Frame rate is how many frames play each second. 24 fps looks filmic, 30 fps looks like standard video and 60 fps looks smooth and fast. Mention it when motion feel matters."],
	["keyframe", "Keyframe", /keyframe/, "A keyframe marks a value at a moment in time (position, size, opacity), and the software fills in the frames between. Prompts that list keyframes with times give predictable motion."],
	["easing", "Easing", /\beas(e|ing)\b|ease-?out|ease-?in/, "Easing shapes how motion starts and stops. Ease-out starts fast and settles gently, which feels natural for things arriving; ease-in-out suits travel across the frame. Linear motion looks mechanical."],
	["motion-graphics", "Motion graphics", /motion graphic|kinetic|animated (text|chart|infographic)/, "Motion graphics are animated text, shapes and diagrams rather than filmed footage. They are used for explainers, titles, charts and product demos."],
	["storyboard", "Storyboard", /storyboard|scene by scene|shot list/, "A storyboard is a sequence of frames or scenes that plans a video before it is made. A good prompt describes it as numbered scenes with a time and a visual for each."],
	["text-to-video", "Text-to-video", /text.to.video|video prompt/, "Text-to-video generates a clip from a written prompt alone. Results depend heavily on how specific the prompt is about camera, subject, light and timing."],
	["image-to-video", "Image-to-video", /image.to.video|animate (the|this) image/, "Image-to-video starts from a still picture and animates it. The prompt then describes only the motion: what moves, how fast and where the camera goes."],
	["depth-of-field", "Depth of field", /depth of field|bokeh|shallow focus|rack focus/, "Depth of field is how much of the scene is in focus. A shallow depth of field blurs the background and isolates the subject; a rack focus shifts the sharp area from one subject to another."],
	["rim-light", "Rim light", /rim light|backlight|back light|edge light|glow/, "A rim light hits the subject from behind so its edge glows. It separates a dark subject from a dark background and is a quick way to look premium."],
	["claude-code-skill", "Claude Code skill", /skill|claude code/, "A Claude Code skill is a folder with a SKILL.md file that teaches the agent one repeatable job. Claude reads the description and uses the skill when a request matches it."],
];

const TEMPLATES = [
	["product-reveal", "Product reveal", /reveal|unbox|product/, "Build one self-contained scene, {W}x{H}, that plays a {SECONDS}-second reveal of {PRODUCT}. Look: {BACKGROUND} background with one {ACCENT} accent light. Camera: {CAMERA_MOVE}. Action: the {PRODUCT} rises into frame and turns to face the viewer. Text: the headline \"{HEADLINE}\" types in below it. Timing: eased motion, hold the last frame for one second."],
	["saas-launch-video", "SaaS launch video", /saas|launch|dashboard|app/, "Make a {SECONDS}-second launch video for {PRODUCT}, a {WHAT_IT_DOES}. Scene 1 (0-3s): the problem in one line. Scene 2 (3-9s): the product screen with the key feature {FEATURE}. Scene 3 (9-{SECONDS}s): the result as a number and the call to action \"{CTA}\". Colours: {BRAND_COLOURS}. Vertical 9:16, large text, one idea per scene."],
	["explainer-video", "Explainer video", /explain|concept|how .* works/, "Create a {SECONDS}-second explainer of {CONCEPT} for {AUDIENCE}. Open with the question people ask. Show the idea in three steps, each as a simple diagram that builds on the last. End with one sentence that sums it up. Style: {STYLE}. No jargon, large type, calm pacing."],
	["ad-hook", "Ad hook (first 3 seconds)", /\bads?\b|hook|tiktok|reels/, "Write the first 3 seconds of a {PLATFORM} ad for {PRODUCT}. Frame 1: {OPENING_VISUAL}. Text on screen: \"{HOOK_LINE}\". Camera: {CAMERA_MOVE}. Then cut to the product in use. Keep it vertical, fast and loud enough to stop a scroll."],
	["logo-reveal", "Logo reveal", /logo|intro|title/, "Animate the logo of {BRAND} in {SECONDS} seconds on a {BACKGROUND} background. The shapes assemble, then the wordmark appears with {EASING} easing, then everything settles. Accent colour {ACCENT}. Hold the final frame for one second."],
	["data-chart", "Animated data chart", /chart|data|graph|metrics/, "Animate a {CHART_TYPE} chart of {DATA_DESCRIPTION} in {SECONDS} seconds. Axes draw first, then the data grows in with ease-out. Highlight {KEY_POINT} with the accent colour {ACCENT} and a label. Clean background, readable numbers, final frame holds."],
	["short-story", "Three-scene short story", /story|stories|short film|narrative/, "Tell a three-scene story in {SECONDS} seconds: {CHARACTER} wants {GOAL}. Scene 1: set up the place and the want. Scene 2: the obstacle. Scene 3: the payoff. Look: {STYLE}. Camera: one named move per scene. No dialogue, music-led pacing."],
	["game-scene", "Game scene", /\bgames?\b|pixel|rpg|level/, "Build a playable-looking {STYLE} game scene, {W}x{H}: a {HERO} in {WORLD}. Show one core rule ({RULE}) happening on screen, a score or health indicator, and a camera that follows the hero. {SECONDS} seconds, loops cleanly."],
];

const HOWTO = [
	["write-a-video-prompt", "How to write an AI video prompt", "Most weak AI video comes from a vague prompt, not a weak model. Write the prompt in a fixed order and keep each part short.", [
		["1. Camera", "Name one move: slow dolly in, orbit, tracking shot, locked-off or handheld. One move per clip; cut clips together if you need more."],
		["2. Subject and setting", "Say who or what is on screen and where, in plain nouns."],
		["3. Action", "One thing happens. If two things must happen, make two clips."],
		["4. Look", "Name the light and colour: rim light, warm sunset, neon, flat studio light, a palette of three colours."],
		["5. Timing", "State the length and how motion eases, and say what the last frame holds."],
	], /dolly|orbit|tracking|camera|cinematic/],
	["prompt-camera-movements", "How to prompt camera movements", "Camera movement is the cheapest way to make a clip feel directed. Use film terms; models respond far better to them than to words like dynamic.", [
		["Push in / pull out", "Use \"slow dolly in\" or \"slow dolly out\" for focus and release."],
		["Move around", "Use \"orbit left around the subject\" to show shape and depth."],
		["Follow", "Use \"tracking shot from behind\" to move with a subject."],
		["Rise and reveal", "Use \"rising crane shot\" or a drone move to show scale."],
		["Stay still", "Use \"locked-off frame\" when motion in the scene should carry the clip."],
	], /dolly|orbit|tracking|crane|drone|camera/],
	["make-a-vertical-video-prompt", "How to prompt vertical 9:16 video", "Vertical video for TikTok, Reels and Shorts needs a different layout from wide video: the subject sits centre, text is large and the top and bottom are partly covered by the app.", [
		["State the format", "Write 9:16, 1080x1920 at the start of the prompt."],
		["Keep important things central", "Keep the subject and text between about 160 px and 1760 px from the top."],
		["Make text big", "Use large type, three to six words per line, high contrast."],
		["Hook early", "Put the most striking frame in the first second."],
		["Short and clear", "Aim for 8 to 20 seconds with one idea."],
	], /vertical|9:16|tiktok|reels|shorts/],
	["install-a-claude-code-skill", "How to install a Claude Code skill", "A Claude Code skill is a folder with a SKILL.md file. Installing one means putting that folder where Claude Code looks for skills.", [
		["Find a skill", "Open a skill page on cizle and copy its install command or its SKILL.md."],
		["Put it in place", "Save it as a folder in your personal skills directory (~/.claude/skills/<name>/SKILL.md) or in a project (.claude/skills/<name>/SKILL.md)."],
		["Restart or reload", "Start a new Claude Code session so it picks the skill up."],
		["Use it", "Ask for the job the skill describes; Claude uses the skill whose description matches."],
	], /skill|claude code/],
	["reuse-a-prompt-from-the-library", "How to reuse a prompt and make it yours", "The fastest way to a good result is to start from a prompt that already worked and change only what is yours.", [
		["Pick by result", "Open the prompt whose demo looks like what you want. The demo proves the prompt works."],
		["Change the subject first", "Swap the product, character or place and keep the camera, light and timing."],
		["Change one thing at a time", "If the result drifts, undo the last change; do not edit five things at once."],
		["Keep the credit", "If you share the prompt, name its creator: every prompt on cizle links to its source."],
	], /./],
	["make-a-saas-launch-video-with-claude-code", "How to make a SaaS launch video with Claude Code", "You can brief Claude Code with a skill and your product link and get a short launch video back as a rendered file.", [
		["Choose a skill", "Pick a launch or product-video skill from the library."],
		["Give it your product", "Paste the skill's prompt into Claude Code together with your product link and one sentence about who it is for."],
		["Review the storyboard", "Check the scenes and the text before anything renders; fix wording first."],
		["Render and export", "Render the video and export the file in the aspect ratio you need."],
	], /saas|launch|product/],
];

/* ------------------------------------------------------------------ the builder */
export function buildProgrammatic({ skills, items, creators, dist, abs, esc, document, out, today, siteConfig, versions }) {
	const made = {}; // family -> [{ route, priority }]
	const skipped = [];
	const list = (items || []).filter((g) => g.slug);
	const matchItems = (re, full = false) => list.filter((g) => re.test(full ? blob(g) : strict(g))).sort(rank);
	const matchSkills = (re) => (skills || []).filter((s) => re.test(sblob(s)));
	const itemLi = (g) => `<li><a href="${abs(`/prompts/${g.slug}`)}">${esc(g.title)}</a>${g.author ? ` by ${esc(g.author)}` : ""}${g.category ? ` · ${esc(g.category)}` : ""}${g.hasVideo ? " · demo video" : ""}<br><small>${esc(String(g.preview || "").slice(0, 170))}</small></li>`;
	const skillLi = (s) => `<li><a href="${abs(`/skills/${s.slug}`)}">${esc(s.name)}</a> · ${esc(s.category)}<br><small>${esc(s.summary)}</small></li>`;
	const itemMd = (g) => `- [${g.title}](${abs(`/prompts/${g.slug}`)})${g.author ? ` by ${g.author}` : ""}${g.category ? `, ${g.category}` : ""}: ${String(g.preview || "").slice(0, 140).replace(/\s+/g, " ")}`;
	const skillMd = (s) => `- [${s.name}](${abs(`/skills/${s.slug}`)}): ${s.summary}`;

	function stats(group) {
		const cats = tally(group, (g) => g.category);
		const by = tally(group, (g) => (g.handle ? `@${g.handle}` : ""));
		return { cats: top(cats, 3), by: top(by, 3), withVideo: group.filter((g) => g.hasVideo).length };
	}
	const intro = (label, n, st, extra = "") => `${n.toLocaleString()} ${label} in the cizle library${st.withVideo ? `, ${st.withVideo.toLocaleString()} of them with a demo video` : ""}. ${st.cats.length ? `Most are filed under ${st.cats.join(", ")}.` : ""} ${st.by.length ? `Frequent creators here: ${st.by.join(", ")}.` : ""} ${extra} Every prompt credits its creator and links to the original.`.replace(/\s+/g, " ").trim();

	function page({ family, slug, h1, titleTag, description, introText, sections = [], itemsList = [], skillList = [], faq = [], mdExtra = "", priority = 0.6, kind = "CollectionPage" }) {
		const route = `/${family}/${slug}`;
		const crumbs = [["Home", "/"], [title(family === "how-to" ? "How to" : family), `/${family}`], [h1, route]];
		const faqHtml = faq.length ? `<h2>Questions</h2>${faq.map(([q, a]) => `<h3>${esc(q)}</h3><p>${esc(a)}</p>`).join("")}` : "";
		const body = `<nav aria-label="Breadcrumb">${crumbs.map(([n, p], i) => (i < crumbs.length - 1 ? `<a href="${p}">${esc(n)}</a>` : esc(n))).join(" / ")}</nav><article><h1>${esc(h1)}</h1><p>${esc(introText)}</p>` +
			sections.map(([h, html]) => `<h2>${esc(h)}</h2>${html}`).join("") +
			(itemsList.length ? `<h2>Prompts</h2><ul>${itemsList.slice(0, SHOWN).map(itemLi).join("")}</ul>` : "") +
			(skillList.length ? `<h2>Claude Code skills</h2><ul>${skillList.slice(0, 20).map(skillLi).join("")}</ul>` : "") +
			faqHtml + `<p><a href="/explore/category/${encodeURIComponent((itemsList[0]?.category) || "motion")}">Open the full library</a> · <a href="/search?q=${encodeURIComponent(h1.toLowerCase())}">Search for "${esc(h1.toLowerCase())}"</a></p></article>`;
		const ld = [
			{ "@context": "https://schema.org", "@type": kind, name: h1, description, url: abs(route), isPartOf: { "@type": "WebSite", name: siteConfig.name, url: abs("/") } },
			{ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: crumbs.map(([n, p], i) => ({ "@type": "ListItem", position: i + 1, name: n, item: abs(p) })) },
			...(itemsList.length ? [{ "@context": "https://schema.org", "@type": "ItemList", numberOfItems: itemsList.length, itemListElement: itemsList.slice(0, SHOWN).map((g, i) => ({ "@type": "ListItem", position: i + 1, url: abs(`/prompts/${g.slug}`), name: g.title })) }] : []),
			...(faq.length ? [{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) }] : []),
		];
		out(route, document({ title: titleTag, description, path: route, body, ld, type: "article" }));
		const md = `# ${h1}\n\n${introText}\n\n${sections.map(([h, html]) => `## ${h}\n\n${html.replace(/<li>/g, "- ").replace(/<\/li>/g, "\n").replace(/<[^>]+>/g, "")}\n`).join("\n")}${itemsList.length ? `## Prompts\n\n${itemsList.slice(0, SHOWN).map(itemMd).join("\n")}\n\n` : ""}${skillList.length ? `## Claude Code skills\n\n${skillList.slice(0, 20).map(skillMd).join("\n")}\n\n` : ""}${faq.length ? `## Questions\n\n${faq.map(([q, a]) => `**${q}**\n${a}`).join("\n\n")}\n\n` : ""}${mdExtra}Source: ${abs(route)}\n`;
		fs.writeFileSync(path.join(dist, `${route.slice(1)}.md`), md);
		(made[family] ||= []).push({ route, name: h1, priority });
	}
	const skip = (family, slug, why) => skipped.push(`${family}/${slug}: ${why}`);
	const faqFor = (h1, n) => [
		[`Are these ${h1.toLowerCase()} prompts free?`, "Yes. Everything in the library is free to read and copy, and every prompt credits its creator."],
		[`How many prompts are there for ${h1.toLowerCase()}?`, `${n.toLocaleString()} prompts and skills match this page right now. The library grows as new ones are added.`],
	];

	/* 1. use cases */
	for (const [slug, name, re, lead] of USE_CASES) {
		const g = matchItems(re), s = matchSkills(re);
		if (g.length + s.length < MIN_ITEMS) { skip("for", slug, `${g.length + s.length} items`); continue; }
		const st = stats(g);
		page({ family: "for", slug, h1: name, titleTag: `${name}: ${g.length + s.length} prompts and skills to copy | cizle`, description: `${g.length + s.length} AI video prompts and Claude Code skills for ${name.toLowerCase()}, with demos and creator credit. Free to copy.`, introText: `${lead} ${intro("prompts and skills", g.length + s.length, st)}`, itemsList: g, skillList: s, faq: faqFor(name, g.length + s.length), priority: 0.7 });
	}

	/* 2. styles */
	for (const [slug, name, re, lead] of STYLES) {
		const g = matchItems(re), s = matchSkills(re);
		if (g.length + s.length < MIN_ITEMS) { skip("styles", slug, `${g.length + s.length} items`); continue; }
		const st = stats(g);
		page({ family: "styles", slug, h1: `${name} prompts`, titleTag: `${name} AI video and image prompts (${g.length + s.length}) | cizle`, description: `${g.length + s.length} ${name.toLowerCase()} prompts for AI video and image generation. ${lead}`, introText: `${lead} ${intro(`${name.toLowerCase()} prompts and skills`, g.length + s.length, st)}`, itemsList: g, skillList: s, faq: faqFor(`${name} prompts`, g.length + s.length), priority: 0.65 });
	}

	/* 3. models and tools */
	{
		const byModel = {};
		for (const g of list) { const m = /opus 5\.5/i.test(g.model || "") ? "Opus 5.5" : g.model; if (m) (byModel[m] ||= []).push(g); }
		for (const [model, group] of Object.entries(byModel)) {
			const slug = model.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
			if (group.length < MIN_ITEMS) { skip("models", slug, `${group.length} items`); continue; }
			const st = stats(group);
			page({ family: "models", slug, h1: `${model} prompts`, titleTag: `${model} prompts: ${group.length.toLocaleString()} examples with demos | cizle`, description: `${group.length.toLocaleString()} prompts written for ${model}, each with its creator and, where available, a demo video. Free to copy.`, introText: `${intro(`${model} prompts`, group.length, st, `They were written for ${model}, so you can reuse them as they are.`)}`, itemsList: group.sort(rank), faq: faqFor(`${model} prompts`, group.length), priority: 0.7 });
		}
		const cc = (skills || []).filter((s) => /claude code|skill/i.test(`${s.platform} ${s.name} ${s.summary}`));
		if (cc.length >= MIN_ITEMS) page({ family: "models", slug: "claude-code", h1: "Claude Code skills", titleTag: `Claude Code skills for video: ${cc.length} to install | cizle`, description: `${cc.length} Claude Code skills that turn a request into a finished video: launch videos, ads, explainers and film styles.`, introText: `${cc.length} skills for Claude Code in the cizle library. Each is a folder with a SKILL.md that teaches Claude one repeatable job. Pick one, install it and ask for the video you want.`, skillList: cc, faq: [["What is a Claude Code skill?", "A skill is a folder with a SKILL.md file that teaches Claude Code one repeatable job."], ["How do I install one?", "Copy the install command on the skill page, or save the SKILL.md under ~/.claude/skills/<name>/ or .claude/skills/<name>/."]], priority: 0.7 });
	}

	/* 4. languages (only the languages whose prompts we list as pages) */
	{
		const byLang = tally(list, (g) => g.lang || "en");
		const all = { ...(versions || {}) };
		for (const [code, n] of Object.entries(byLang)) {
			if (n < MIN_ITEMS) continue;
			const group = list.filter((g) => (g.lang || "en") === code).sort(rank);
			const st = stats(group);
			const name = { en: "English", zh: "Chinese", ja: "Japanese", ko: "Korean", ru: "Russian", es: "Spanish", fr: "French", de: "German", hi: "Hindi" }[code] || code;
			page({ family: "languages", slug: code, h1: `${name} prompts`, titleTag: `${name} AI video and image prompts (${group.length.toLocaleString()}) | cizle`, description: `${group.length.toLocaleString()} ${name} prompts for AI video and image generation, with creator credit. The library has prompts in 12 languages.`, introText: intro(`${name} prompts`, group.length, st, `The wider library has prompts in 12 languages; browse them all with the language filter.`), itemsList: group, faq: faqFor(`${name} prompts`, group.length), priority: 0.6 });
		}
	}

	/* 5. creators */
	{
		const by = {};
		for (const g of list) if (g.handle) (by[g.handle] ||= []).push(g);
		for (const [handle, group] of Object.entries(by)) {
			if (group.length < MIN_CREATOR) continue;
			const author = group[0].author || `@${handle}`;
			const st = stats(group);
			const slug = handle.toLowerCase().replace(/[^a-z0-9_-]/g, "");
			if (!slug) continue;
			page({ family: "creators", slug, h1: `${author.replace(/^@/, "")}: prompts on cizle`, titleTag: `${author.replace(/^@/, "")}: ${group.length} prompts and demos | cizle`, description: `${group.length} AI prompts by ${author} in the cizle library, with demos and links to the original posts.`, introText: `${author} has ${group.length} prompts in the cizle library${st.cats.length ? `, mostly ${st.cats.join(", ")}` : ""}. Each links to the original post, and the creator keeps the credit. Their profile: https://x.com/${handle}.`, itemsList: group.sort(rank), faq: [[`Who made these prompts?`, `${author} (https://x.com/${handle}). cizle credits creators and links to the source; creators can ask for a change or removal at ${siteConfig.email}.`]], priority: 0.5, kind: "ProfilePage" });
		}
	}

	/* 6. best-of lists: chosen by clear rules, said on the page */
	{
		const lists = [
			["ai-video-prompts", "Best AI video prompts to copy", (g) => g.hasVideo && (g.chars || 0) >= 500, "Prompts that have a demo video and a detailed written prompt (500+ characters), longest first."],
			["motion-graphics-prompts", "Best motion graphics prompts", (g) => /motion|kinetic|animated (text|chart)/.test(strict(g)) && g.hasVideo, "Motion graphics prompts that have a demo video."],
			["product-video-prompts", "Best product video prompts", (g) => /product|launch|unbox|reveal/.test(strict(g)) && g.hasVideo, "Product and launch prompts that have a demo video."],
			["3d-scene-prompts", "Best 3D scene prompts", (g) => /\b3d\b|three\.?js|webgl|isometric|low.?poly/.test(strict(g)) && g.hasVideo, "3D and WebGL scene prompts that have a demo video."],
			["explainer-video-prompts", "Best explainer video prompts", (g) => /explain|concept|visuali[sz]ation|tutorial/.test(strict(g)) && g.hasVideo, "Explainer and visualisation prompts that have a demo video."],
		];
		for (const [slug, name, fn, rule] of lists) {
			const g = list.filter(fn).sort((a, b) => (b.chars || 0) - (a.chars || 0)).slice(0, 30);
			if (g.length < MIN_ITEMS) { skip("best", slug, `${g.length} items`); continue; }
			page({ family: "best", slug, h1: name, titleTag: `${name} (${g.length} picked) | cizle`, description: `${g.length} ${name.toLowerCase().replace("best ", "")} with demos and creator credit. How they were chosen is explained on the page.`, introText: `How this list is chosen: ${rule} It is not a vote or a quality ranking; it is a clear rule so you can see why each prompt is here. ${intro("prompts", g.length, stats(g))}`, itemsList: g, faq: [["How are these chosen?", rule]], priority: 0.7 });
		}
		const feat = (skills || []).filter((s) => s.featured).slice(0, 15);
		if (feat.length >= MIN_ITEMS) page({ family: "best", slug: "claude-code-skills-for-video", h1: "Best Claude Code skills for video", titleTag: `Best Claude Code skills for video (${feat.length}) | cizle`, description: `${feat.length} featured Claude Code skills for making videos: launch, ads, explainers and film styles.`, introText: `How this list is chosen: skills that cizle features in the library. ${feat.length} skills, each a folder with a SKILL.md you can install in Claude Code.`, skillList: feat, faq: [["How are these chosen?", "They are the skills cizle marks as featured."]], priority: 0.7 });
	}

	/* 7. how-to guides (written by hand, with matching prompts) */
	for (const [slug, name, lead, steps, re] of HOWTO) {
		const g = matchItems(re, true).slice(0, 12);
		if (g.length < 3) { skip("how-to", slug, `${g.length} examples`); continue; }
		const stepsHtml = `<ol>${steps.map(([h, t]) => `<li><strong>${esc(h)}</strong>: ${esc(t)}</li>`).join("")}</ol>`;
		const ld = null;
		page({ family: "how-to", slug, h1: name, titleTag: `${name} | cizle`, description: `${lead} Step by step, with examples from the library.`.slice(0, 200), introText: lead, sections: [["Steps", stepsHtml]], itemsList: g, faq: [[`What do I need for this?`, "A free account is not needed to read and copy prompts. Use any tool you like; the prompts are plain text."]], priority: 0.7, kind: "Article" });
	}

	/* 8. alternatives: only where we have sourced facts */
	{
		const slug = "higgsfield";
		const g = matchItems(/video|motion|cinematic/).slice(0, 10);
		page({ family: "alternatives", slug, h1: "Higgsfield alternatives", titleTag: "Higgsfield alternatives for AI video, and where to find prompts | cizle", description: "Tools other roundups list as Higgsfield alternatives, how to choose, and why a prompt library helps whichever you pick.", introText: "People look for Higgsfield alternatives for a free plan, a different look or more control. Roundups from other sites group the options this way; pricing changes often, so check each vendor's current plans.", sections: [["What other roundups say", "<ul><li>LTX Studio's own 2026 roundup names LTX Studio for full production workflows, Runway for experimental creative work, Kling for cinematic realism, Pika for quick social clips and Hailuo for low-cost experimenting (source: ltx.studio/blog/best-higgsfield-alternatives).</li><li>An AlternativeTo listing names Wan as a free, open-source option (source: alternativeto.net/software/higgsfield).</li><li>Tool Junction lists several alternatives with free plans, including Seedance, Vidu and Veed (source: tooljunction.io).</li><li>OpenArt's comparison says Higgsfield dropped its free tier after a late-2025 pricing change, and that OpenArt has a credit-based free tier (source: openart.ai/blog/best-higgsfield-alternatives).</li></ul>"], ["How to choose", "<p>Pick by the job: quick social clips, a film look, a free tier or a full production workflow. Try two tools with the same prompt and keep the one whose result you prefer.</p>"], ["Where cizle fits", "<p>cizle is not a video generator. It is a free library of prompts and Claude Code skills you can use with any of these tools, each with a demo and a credit to its creator.</p>"]], itemsList: g, faq: [["Is cizle a Higgsfield alternative?", "No. cizle is a prompt library, not a generator. It helps whichever generator you choose."]], priority: 0.6 });
	}

	/* 9. glossary */
	for (const [slug, name, re, def] of GLOSSARY) {
		const g = matchItems(re, true).slice(0, 8);
		if (g.length < 3) { skip("glossary", slug, `${g.length} examples`); continue; }
		page({ family: "glossary", slug, h1: name, titleTag: `${name}: what it means in AI video prompts | cizle`, description: def.slice(0, 190), introText: def, sections: [["Used in these prompts", `<p>${g.length} examples from the library that use ${esc(name.toLowerCase())}.</p>`]], itemsList: g, faq: [[`What is ${name.toLowerCase()}?`, def]], priority: 0.5, kind: "DefinedTerm" });
	}

	/* 10. templates */
	for (const [slug, name, re, tpl] of TEMPLATES) {
		const g = matchItems(re).slice(0, 12);
		if (g.length < 3) { skip("templates", slug, `${g.length} examples`); continue; }
		const slots = [...new Set(tpl.match(/\{[A-Z_]+\}/g))];
		page({ family: "templates", slug, h1: `${name} prompt template`, titleTag: `${name} prompt template: fill in the blanks | cizle`, description: `A fill-in-the-blanks prompt template for a ${name.toLowerCase()}, with ${g.length} real examples from the library.`, introText: `Copy this template, replace each {PLACEHOLDER} with your own detail and paste it into your video or image tool. ${g.length} real examples below show how others did it.`, sections: [["Template", `<pre><code>${esc(tpl)}</code></pre>`], ["Placeholders to fill", `<ul>${slots.map((s) => `<li><code>${esc(s)}</code></li>`).join("")}</ul>`]], itemsList: g, faq: [["How do I use this template?", "Replace every placeholder in braces with your own detail, keep the structure, and run it in your tool. Change one thing at a time if you need to adjust."]], priority: 0.6, mdExtra: `## Template\n\n${tpl}\n\n` });
	}

	/* hubs: one per family, listing every page that passed the guard */
	const FAMILY_NAMES = { for: "Use cases", styles: "Styles", models: "Models and tools", languages: "Languages", creators: "Creators", best: "Best-of lists", "how-to": "How-to guides", alternatives: "Alternatives", glossary: "Glossary", templates: "Prompt templates" };
	for (const [family, pages] of Object.entries(made)) {
		if (family === "creators") continue; // the creators hub is the app's own page
		const route = `/${family}`;
		const name = FAMILY_NAMES[family];
		const body = `<h1>${esc(name)}</h1><p>${pages.length} pages in the cizle library.</p><ul>${pages.map((p) => `<li><a href="${p.route}">${esc(p.name)}</a></li>`).join("")}</ul>`;
		out(route, document({ title: `${name} | cizle prompt library`, description: `${pages.length} ${name.toLowerCase()} pages in the cizle prompt library of AI video prompts, image prompts and Claude Code skills.`, path: route, body, ld: [{ "@context": "https://schema.org", "@type": "CollectionPage", name, url: abs(route) }] }));
		fs.writeFileSync(path.join(dist, `${family}.md`), `# ${name}\n\n${pages.map((p) => `- [${p.name}](${abs(p.route)})`).join("\n")}\n`);
		pages.unshift({ route, name, priority: 0.6 });
	}

	/* per-family sitemaps plus one index */
	const sm = (urls) => `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `<url><loc>${abs(u.route)}</loc><lastmod>${today}</lastmod><priority>${u.priority}</priority></url>`).join("\n")}\n</urlset>\n`;
	const files = [];
	for (const [family, pages] of Object.entries(made)) {
		const file = `sitemap-${family}.xml`;
		fs.writeFileSync(path.join(dist, file), sm(pages));
		files.push(file);
	}
	const total = Object.values(made).reduce((a, p) => a + p.length, 0);
	return { made, files, total, skipped };
}
