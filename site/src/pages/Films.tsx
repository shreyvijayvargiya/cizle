import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { CopyButton } from "@/components/CopyButton";
import { Input } from "@/components/ui/input";
import { OptionSelect } from "@/components/ui/select";
import { useHead } from "@/lib/head";

const LOOKS = ["CG render", "hand-drawn", "clay", "glass", "isometric", "terminal"];

/** The same prompt the second film builds, so what you copy here matches what the film shows. */
export function buildPrompt(p: { name: string; does: string; url: string; look: string }) {
	const n = p.name.trim() || "my product", u = p.url.trim(), d = p.does.trim();
	return `Use the cizle MCP tools to make a launch video for ${n}${u ? ` (${u})` : ""}.\n${d ? `What it does: ${d}.\n` : ""}Read ${u || "my product page"} first and use only facts you find there. Do not invent features, numbers or quotes.\nType: launch. Look: ${p.look}. 16:9, about 30 seconds, with a voice-over if one is available, otherwise music.\nEnd on one clear call to action with my link. When it is done, give me the path to the MP4.`;
}

const FILMS = [
	{ href: "/launch.html", img: "/films/film-1.jpg", tag: "Film one", title: "The prompt library, in your hands", text: "Touch real prompts from the library, type into a live terminal and watch five looks go by. About a minute, with music and a narrator.", alt: "Film one: a field of video prompt tiles with the number 1,487" },
	{ href: "/launch2.html", img: "/films/film-2.jpg", tag: "Film two", title: "The render, in CG", text: "Fly through the library, then watch Claude Code and cizle render a video. At the end it carries your product's name.", alt: "Film two: glass slabs of video prompts flying past the camera" },
] as const;

export function FilmsPage() {
	const [p, setP] = useState({ name: "", does: "", url: "", look: "CG render" });
	const prompt = useMemo(() => buildPrompt(p), [p]);
	const filmTwo = useMemo(() => {
		const q = new URLSearchParams();
		if (p.name.trim()) q.set("name", p.name.trim());
		if (p.does.trim()) q.set("does", p.does.trim());
		if (p.url.trim()) q.set("url", p.url.trim());
		if (p.look !== "CG render") q.set("look", p.look);
		return `/launch2.html${q.toString() ? `?${q}` : ""}#5`;
	}, [p]);
	useHead({
		title: "Launch films: watch two, make one for your product | cizle",
		description: "Two interactive launch films built in code, with music and a narrator. Type your product, copy the prompt and paste it into Claude Code to make your own launch video.",
		path: "/films",
	});
	const set = (k: keyof typeof p) => (e: { target: { value: string } }) => setP((s) => ({ ...s, [k]: e.target.value }));

	return (
		<div className="board pt-6 pb-4">
			<div className="board-w">
				<h1 className="display reveal" style={{ fontSize: "clamp(2.75rem, 7vw, 7rem)" }}>
					Watch two films,
					<br />
					make your own
				</h1>
				<p className="reveal mt-6 max-w-[46ch] text-lg" style={{ ["--i" as string]: 1 }}>
					Both films are built in code and play with sound. When you are done watching, type your product below and copy the prompt into Claude Code.
				</p>

				<ul className="mt-8 grid grid-cols-[minmax(0,1fr)] gap-2 md:grid-cols-2">
					{FILMS.map((f, i) => (
						<li key={f.href} className="reveal" style={{ ["--i" as string]: i }}>
							<a href={f.href} className="lift group flex h-full flex-col overflow-hidden rounded-lg bg-surface outline-none transition-colors hover:bg-tile-2 focus-visible:ring-2 focus-visible:ring-ring">
								<div className="relative aspect-video overflow-hidden bg-field-2">
									<img src={f.img} alt={f.alt} loading="lazy" className="size-full object-cover" />
									<span className="absolute bottom-3 left-3 rounded-lg bg-background px-4 py-2 text-base font-medium">Play with sound</span>
								</div>
								<div className="p-5">
									<p className="text-base text-muted-foreground">{f.tag}</p>
									<h2 className="mt-1 text-2xl leading-tight tracking-[-0.03em]">{f.title}</h2>
									<p className="mt-2 text-base">{f.text}</p>
								</div>
							</a>
						</li>
					))}
				</ul>

				<section aria-labelledby="mine" className="mt-2 grid gap-2 md:grid-cols-12">
					<div className="tile reveal p-6 sm:p-8 md:col-span-5">
						<h2 id="mine" className="statement">Make one for your product</h2>
						<div className="mt-5 space-y-4">
							<label className="block text-base">
								<span className="mb-1 block text-muted-foreground">Product name</span>
								<Input value={p.name} onChange={set("name")} maxLength={28} placeholder="Acme" />
							</label>
							<label className="block text-base">
								<span className="mb-1 block text-muted-foreground">What it does, in one line</span>
								<Input value={p.does} onChange={set("does")} maxLength={80} placeholder="Invoices that send themselves" />
							</label>
							<label className="block text-base">
								<span className="mb-1 block text-muted-foreground">Product link</span>
								<Input value={p.url} onChange={set("url")} maxLength={120} inputMode="url" placeholder="https://acme.com" />
							</label>
							<div className="text-base">
								<span className="mb-1 block text-muted-foreground">Look</span>
								<OptionSelect aria-label="Look" value={p.look === "CG render" ? "" : p.look} onValueChange={(v) => setP((s) => ({ ...s, look: v || "CG render" }))} emptyLabel="CG render" options={LOOKS.slice(1).map((l) => ({ value: l, label: l }))} />
							</div>
						</div>
					</div>
					<div className="tile-accent reveal p-6 sm:p-8 md:col-span-7" style={{ ["--i" as string]: 1 }}>
						<h2 className="statement">Your prompt</h2>
						<textarea readOnly value={prompt} aria-label="Your prompt" className="mt-4 h-56 w-full resize-none rounded-lg bg-background/15 p-4 font-mono text-base leading-snug text-inherit outline-none focus-visible:ring-2 focus-visible:ring-ring" />
						<div className="mt-4 flex flex-wrap gap-2">
							<CopyButton text={prompt} label="Copy prompt" done="Prompt copied" variant="default" size="lg" />
							<a href={filmTwo} className="press inline-flex h-12 items-center rounded-lg bg-background px-6 text-base font-medium text-foreground hover:bg-tile-2">Preview film two with my product</a>
						</div>
						<ol className="mt-6 grid gap-2 text-base sm:grid-cols-3">
							<li><strong>1. Copy</strong> the prompt.</li>
							<li><strong>2. Paste</strong> it into Claude Code, with the cizle tools <Link to="/docs" className="underline underline-offset-4">connected</Link>.</li>
							<li><strong>3. Open</strong> the MP4 it renders on your machine.</li>
						</ol>
						<p className="mt-4 text-base">It works with the free skills. <Link to="/pricing" className="underline underline-offset-4">Premium</Link> opens the rest, and the <Link to="/gallery" className="underline underline-offset-4">prompt gallery</Link> has 396 free prompts to start from.</p>
					</div>
				</section>
			</div>
		</div>
	);
}
