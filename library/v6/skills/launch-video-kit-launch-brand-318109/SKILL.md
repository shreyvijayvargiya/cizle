---
name: launch-brand
description: Build the brand kit a launch film uses from a website. Runs tools/brand-from-url.mjs on the reader's site to extract branding (colours, fonts, logo, name, tagline, copy, product images), then reviews the preview sheet with the reader and fixes any wrong role by hand. Use for "brand from website", "brand kit", "extract branding", "get our colours and fonts", "use our logo", or before the first launch film for a new brand.
---

# Launch brand

Every launch film reads its look from `brand/brand.json`. This skill makes that file from the reader's
own website, checks it, and hands it to `launch-film`. Run it once per brand, again when the site's
look changes.

## 1. Extract

```bash
npm install                                   # once: puppeteer and its Chrome
node tools/brand-from-url.mjs https://your-site.com --out brand
```

It opens the page at 1920x1080, dismisses cookie banners, scrolls once so lazy content loads, and writes:

| File | What |
|---|---|
| `brand.json` | The roles the film uses. The only file the film reads. |
| `evidence.json` | What each role was decided from: computed styles, CSS colour variables, pixel histograms, button and link colours, font faces, every logo candidate with its score and reason. |
| `logo.svg` or `logo.png` | The logo for light grounds. `logo-on-dark.*` for dark grounds, `mark.svg` when an icon-only mark is separable. |
| `fonts/` | The display and body font files the page actually loaded (Google Fonts are fetched from the css2 API when the page does not serve them). |
| `screens/hero.png`, `screens/full.png` | The first viewport and the full page (capped at 6000 px). |
| `images/` | The largest content images, usually product shots. |
| `preview.png` | One sheet: logo on ground and on dark, every colour role, the display font with the highlight, a dark hero card, the accent button. |

Flags: `--no-fonts` skips font files, `--max-images 0` skips images. A local page works too
(`node tools/brand-from-url.mjs ./site/index.html`). After editing `brand.json` by hand, re-render the
sheet with `node tools/brand-from-url.mjs --preview --out brand`.

## 2. Review (never skip)

Read `preview.png` and `screens/hero.png` side by side. The roles are heuristics; the sheet shows in
10 seconds whether they picked right. Check, in this order:

1. **Logo on ground and on dark.** Both must read. A logo that disappears on dark needs a light
   version: ask the reader for their file, or edit the colours inside `logo-on-dark.svg`.
2. **Accent.** It should be the colour people associate with the brand, usually the main button.
   `evidence.json` lists `accent_candidates` with their votes. Swap in the right hex when it chose a
   hero illustration colour or a status colour.
3. **Ground and ink.** Statement scenes sit on `ground` with `ink` type. They must match the site's
   feel (warm off-white, pure white, a tinted paper).
4. **Dark.** Hero cards use `dark`. It should look like the brand's own dark section, not a random
   near-black. If the site has none, the tool darkens the accent; check that it looks intended.
5. **Fonts.** The display font must render in the sheet's hero words. `evidence.json` under `fonts`
   shows which files were found.
6. **Name and tagline.** The tagline sits under the name in the lockup: 2 to 8 words, the site's own words.

Fix wrong values directly in `brand.json`, re-render the preview, show it to the reader, and only then
set `"reviewed": true`. Record anything you changed by hand in one line in your reply.

## What each role does in the film

| Role | Used for |
|---|---|
| `ground` | Every statement scene, the product walkthrough's floor, the end lockup. |
| `surface` | Cards, chips and windows on the ground. |
| `ink`, `ink_secondary` | Hero words and supporting words on light grounds. |
| `accent` | Sparingly: 1 element per scene (a button press, the switch, the done state). Never a whole ground unless the brief asks for an accent hero card. |
| `accent_ink` | Text on the accent. |
| `dark`, `dark_ink` | Hard-cut hero cards, the dark moments. |
| `accent_on_dark` | Key words on dark cards (the accent lightened until it reads; `dark_ink` for monochrome brands). |
| `highlight` | A soft marker behind 1 or 2 key words per line, never more. |
| `success`, `danger` | Checks, done states, the rare failure word. |
| `fonts.display` | Hero words (weight and tracking from the site's h1). |
| `fonts.body` | Supporting lines, UI chips. |
| `logo`, `name`, `tagline`, `domain` | The name beat on the cut and the end lockup. |
| `copy` | Words for the script. The film speaks the site's language; `launch-story` starts from `copy.h1`, `copy.subhead`, `copy.h2` and `copy.features`. |
| `images` | Candidate product shots. Real product screens or recordings from the reader beat anything scraped. |

## Fallbacks

- **No logo found.** The tool falls back to the site icon and says so. Ask the reader for an SVG
  (best) or a transparent PNG at 1000 px wide or more; put it in `brand/` and point `logo.file` at it.
- **Dark-mode site.** `mode` is `dark`. The page's background becomes `dark`, and `ground` and `ink`
  are derived for light statement scenes. If the brand wants dark statement scenes too, swap `ground`
  and `dark` (and `ink` and `dark_ink`) by hand.
- **Monochrome brand.** No saturated colour won a vote, so `accent` is the main button colour (often
  black) and `highlight` is a light grey. Ask the reader whether they have a signature colour; if not,
  keep it monochrome and let type and motion carry the film.
- **Web font not downloadable.** Some foundries block direct downloads. Install the font locally
  (the film falls back to installed fonts by family name) or pick the closest open font from Google
  Fonts and put its files in `brand/fonts/`.
- **Font licensing.** A web licence does not always cover video. Before the film ships, confirm the
  display and body fonts are licensed for video or motion use, or use an open (OFL) font.
- **The reader has a brand guide.** Their guide wins. Enter its values into `brand.json` by hand
  (keep the same keys), put the logo files in `brand/`, re-render the preview and mark it reviewed.
- **The site blocks headless browsers.** Save the page from a normal browser (File, Save Page As,
  complete) and run the tool on the saved HTML file.

## Hand-off

`launch-film` reads `brand/brand.json` at build time. A film built on `"reviewed": false` is a draft;
say so when you show it.
