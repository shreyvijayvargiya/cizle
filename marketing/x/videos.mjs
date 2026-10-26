/** The first X batch. Facts used here: 2,000+ library prompts, 20 free, $20/mo, $15/mo for 6 months, $10/mo for 12 months, every prompt credits its creator. */
const U = "cizle.dev";
const V = (id, slug, theme, duration, beats, post, aspect = "9:16") => ({ id, slug, title: slug, theme, duration, aspect, beats, post });

export const VIDEOS = [
	V("01", "hero-30s", "teal", 30, [
		{ type: "title", at: 0, to: 3.6, text: "Stop *prompting blind.", sub: "Every great AI video starts with a prompt that already worked." },
		{ type: "stat", at: 3.6, to: 8, value: 2000, suffix: "+", sub: "video, image and HTML prompts in one library" },
		{ type: "type", at: 8, to: 14.5, label: "Copy a prompt", text: "A 15 second papercut film, deep red paper, camera glides over folded layers, soft shadows…", speed: 3.6, sub: "Paste it. Make it yours." },
		{ type: "cards", at: 14.5, to: 20.5, label: "Browse by look", items: [{ t: "Papercut red", s: "film", bg: "linear-gradient(135deg,#9d1c1c,#e0483b)" }, { t: "Shadow puppet", s: "film", bg: "linear-gradient(135deg,#2a2a35,#8a6b3d)" }, { t: "Ukiyo-e", s: "film", bg: "linear-gradient(135deg,#143a63,#d9c28a)", fg: "#fff" }, { t: "Pixel RPG", s: "film", bg: "linear-gradient(135deg,#2c5e2e,#7bd35a)" }] },
		{ type: "list", at: 20.5, to: 25.5, label: "Always fair", items: [{ t: "Creators credited", n: "✓" }, { t: "20 prompts free", n: "✓" }, { t: "Claude Code skills", n: "✓" }] },
		{ type: "cta", at: 25.5, to: 30, text: "Find your prompt.", url: U, sub: "Free to start" },
	], `Most AI video is a prompting problem.\n\ncizle is a library of 2,000+ video, image and HTML prompts, each credited to its creator, plus Claude Code skills.\n\n20 are free. Find yours: ${U}`),

	V("02", "prompt-reveal-papercut", "red", 12, [
		{ type: "title", at: 0, to: 2.8, text: "The prompt behind *this look.", sub: "Papercut red, 15 seconds" },
		{ type: "type", at: 2.8, to: 9.4, label: "Prompt", text: "A paper-cut diorama in deep red. Layers fold open like a book, a tiny paper fox crosses a bridge, soft shadows between each sheet, slow dolly in.", speed: 4.4 },
		{ type: "cta", at: 9.4, to: 12, text: "Copy it.", url: U },
	], `A whole film style in one paragraph.\n\nPapercut red: copy the prompt, change the fox. ${U}`),

	V("03", "before-after", "violet", 15, [
		{ type: "title", at: 0, to: 2.6, text: "Same idea. *Better prompt.", sub: "Watch the difference" },
		{ type: "split", at: 2.6, to: 11, left: { h: "Plain prompt", t: "make a cool video of a product" }, right: { h: "cizle prompt", t: "9:16, 8 s product reveal. Near-black stage, one teal rim light, the box opens, the product rises and turns, headline types in at 104 px. Slow eased motion, hold the last frame." } },
		{ type: "cta", at: 11, to: 15, text: "Start from what worked.", url: U },
	], `The difference between a vague prompt and a working one is specifics: size, light, timing, motion.\n\nThe library is full of working ones. ${U}`),

	V("04", "features-search", "teal", 20, [
		{ type: "title", at: 0, to: 3.4, text: "One search box. *Every style.", sub: "Press ⌘K anywhere" },
		{ type: "type", at: 3.4, to: 8.5, label: "Search", text: "launch video for a saas", speed: 1.8 },
		{ type: "list", at: 8.5, to: 15.5, label: "Matches", items: [{ t: "Phone unboxing reveal", r: "9:16" }, { t: "Metrics counter launch", r: "9:16" }, { t: "Command palette demo", r: "16:9" }] },
		{ type: "cta", at: 15.5, to: 20, text: "Search the library.", url: U },
	], `Search by what you are making, not what the prompt is called.\n\n⌘K on ${U}`),

	V("05", "collection-films", "amber", 20, [
		{ type: "title", at: 0, to: 3.2, text: "Film looks, *ready to copy.", sub: "A collection of prompt styles" },
		{ type: "cards", at: 3.2, to: 11, label: "Film styles", items: [{ t: "Papercut red", bg: "linear-gradient(135deg,#9d1c1c,#e0483b)" }, { t: "Shadow puppet", bg: "linear-gradient(135deg,#2a2a35,#8a6b3d)" }, { t: "Ukiyo-e", bg: "linear-gradient(135deg,#143a63,#d9c28a)" }, { t: "Backrooms", bg: "linear-gradient(135deg,#6b5f1f,#d8c85a)" }, { t: "Rubber hose", bg: "linear-gradient(135deg,#222,#aaa)" }, { t: "Pixel RPG", bg: "linear-gradient(135deg,#2c5e2e,#7bd35a)" }] },
		{ type: "stat", at: 11, to: 16, value: 20, sub: "prompts are free to copy right now" },
		{ type: "cta", at: 16, to: 20, text: "Pick a look.", url: U },
	], `Papercut. Shadow puppet. Ukiyo-e. Backrooms. Pixel RPG.\n\nFilm looks you can copy, not describe. ${U}`),

	V("06", "pricing-15s", "violet", 15, [
		{ type: "title", at: 0, to: 2.6, text: "Start *free.", sub: "20 prompts free" },
		{ type: "list", at: 2.6, to: 11.5, label: "Premium", items: [{ t: "1 month", r: "$20/mo" }, { t: "6 months", r: "$15/mo" }, { t: "12 months", r: "$10/mo" }] },
		{ type: "cta", at: 11.5, to: 15, text: "Half off a year.", url: U },
	], `Free: 20 prompts.\nPremium: $20/mo, $15/mo for 6 months, $10/mo for 12 months.\n\n${U}`),

	V("07", "faq-20s", "teal", 20, [
		{ type: "title", at: 0, to: 2.6, text: "3 questions, *20 seconds.", sub: "" },
		{ type: "list", at: 2.6, to: 9, label: "Is it free?", items: [{ t: "20 prompts are free", n: "✓" }, { t: "Premium unlocks the rest", n: "✓" }] },
		{ type: "list", at: 9, to: 14.5, label: "Whose prompts?", items: [{ t: "Creators, credited on every page", n: "✓" }, { t: "Takedown on request", n: "✓" }] },
		{ type: "list", at: 14.5, to: 17.5, label: "Which tools?", items: [{ t: "Video, image, HTML, Claude Code", n: "✓" }] },
		{ type: "cta", at: 17.5, to: 20, text: "More answers.", url: `${U}/faq` },
	], `Is it free? 20 prompts, yes.\nWhose prompts? Creators', credited.\nWhich tools? Video, image, HTML and Claude Code.\n\n${U}/faq`),

	V("08", "claude-code-skills", "amber", 20, [
		{ type: "title", at: 0, to: 3.2, text: "Teach Claude Code *once.", sub: "Install a skill. Stop repeating yourself." },
		{ type: "type", at: 3.2, to: 10.5, label: "Terminal", text: "$ cp -r skills/launch-video ~/.claude/skills/\n$ claude\n> make a 15s launch video for my app", speed: 4 },
		{ type: "list", at: 10.5, to: 16.5, label: "You get", items: [{ t: "A scripted scene", n: "1" }, { t: "A rendered video", n: "2" }, { t: "A poster frame", n: "3" }] },
		{ type: "cta", at: 16.5, to: 20, text: "Browse the skills.", url: U },
	], `A Claude Code skill is a markdown file that teaches the agent one job.\n\nInstall it once, reuse it. ${U}`),

	V("09", "creators-credited", "red", 15, [
		{ type: "title", at: 0, to: 3, text: "Every prompt has *a name.", sub: "The creator's, on the page" },
		{ type: "list", at: 3, to: 11, label: "On every prompt", items: [{ t: "Creator credit", n: "✓" }, { t: "Link to the source", n: "✓" }, { t: "Takedown on request", n: "✓" }] },
		{ type: "cta", at: 11, to: 15, text: "Made by people.", url: U },
	], `A prompt library is only fair if the people who wrote the prompts are on it.\n\nEvery prompt on cizle credits its creator and links the source. ${U}`),

	V("10", "build-in-public", "teal", 15, [
		{ type: "stat", at: 0, to: 4.5, value: 2184, sub: "gallery entries, and counting" },
		{ type: "list", at: 4.5, to: 11.5, label: "This week", items: [{ t: "Rights and takedown pages", n: "✓" }, { t: "Version history", n: "✓" }, { t: "Video demos for premium skills", n: "✓" }] },
		{ type: "cta", at: 11.5, to: 15, text: "Following along?", url: U },
	], `Shipped this week on cizle: rights and takedown pages, version history, video demos for premium skills.\n\n${U}`),
];
