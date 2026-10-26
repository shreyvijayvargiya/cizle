# Chrome extension spider crawler that summarizes webpage text live

By @AnatoliKopadze
Language: ? · Domains: science, product · Source: V04

Original post: https://x.com/AnatoliKopadze/status/2106011248265486693

Source page: https://data.openchamber.dev/opus-5-5-videos/v/anatolikopadze-2106011248265486693

Demo video: https://video.twimg.com/amplify_video/2106011038499983360/vid/avc1/1824x1306/CAYMOHhEMBdVcX09.mp4?tag=29

```
Build a Chrome extension (Manifest V3) called "TL;DR Crawler" that works on any normal web page.

WHAT IT DOES
Click the toolbar icon: a line-drawn spider appears on the current page, follows your cursor (also while scrolling), reads the text it walks over and builds a short TL;DR in a floating panel. Click the icon again: everything disappears and the page is exactly as before.

1. TOGGLE
- background.js: chrome.action.onClicked injects content.js with chrome.scripting.executeScript.
- content.js checks a global flag. If the crawler is already running, it shuts down and cleans up. Otherwise it starts. Only one instance per tab, ever.

2. FIND THE TEXT
- Find the main readable area: prefer <article> or <main>, otherwise the element with the most paragraph text. Skip nav, header, footer, aside, menus, forms, code, ads and hidden elements.
- Collect text blocks (p, li, blockquote, h2-h4) and split them into sentences. Store each sentence as a DOM Range (sentences can span links and bold text, so do NOT wrap them in elements).
- Watch the area with a debounced MutationObserver (1s) to pick up text loaded later (infinite scroll, lazy content).

3. PICK KEY SENTENCES
- Score each sentence: +2 digits, +2 for %, $, €, million, billion; +1.5 for words like first, record, launch, announce, new, only, biggest, fastest, warns, raises, cuts; +0.3 per capitalized name (max +2); -2 if under 40 or over 260 characters.
- Mark the top 25% as key sentences (min 5, max 80), spread so most paragraphs get one.
- Summaries, max 9 words each:
  - If an API key is set: send all key sentences in ONE request to Claude and ask for a JSON array of short, plain summaries (max 9 words, keep numbers and names exactly, no hype). Request again in batches when new text appears.
  - Without a key: fallback summary = the sentence with filler openers removed (and, but, however, also, according to), cut at a word boundary with "…".

4. THE SPIDER
- Shadow DOM host at document root containing a full-screen fixed <canvas> (pointer-events: none, z-index 2147483646) and the panel.
- Look: small rounded-rectangle body, abdomen ellipse, head with two white eyes, outlines in #5ab8ff. 8 legs as 3px blue lines with pink (#ff4f7a) joint dots, two segments each with inverse kinematics, knees bending outward.
- Gait: two alternating leg groups. A foot steps only when it's ~80px from its ideal spot and the other group is planted. Steps last 0.13s with a small lift, landing slightly ahead in the walking direction.
- Movement: target = cursor position + scroll, so it follows while scrolling. Max ~420 px/s, smooth acceleration, stops ~40px from the cursor, turns smoothly toward its direction. If the cursor is idle for 8s, it wanders around the viewport.
- requestAnimationFrame with a fixed 1/120s physics step. Support devicePixelRatio and window resize.

5. CRAWLING
- Every 80ms and on every foot landing, find the text under the spider with document.caretRangeFromPoint (ignore the extension's own elements).
- If that point is inside a key sentence not yet found: highlight it with the CSS Custom Highlight API (::highlight(tldr-found) with a soft yellow background) and add its summary to the panel.
- If a foot lands on a normal word: in ~25% of cases glitch just that word. Wrap only that word in a span (it's a single text node, so it's safe) and apply one random effect: monospace font, blue outline, blue highlight, slight rotation, wide letter-spacing, blur or uppercase. Max 2 effects per word. Record every change so it can be undone.

6. PANEL
- Top-right, draggable by its header, inside the Shadow DOM so site CSS can't affect it.
- Dark (#16181c), mono title "TL;DR" in yellow (#ffd166), a "found / total" counter, a pink progress bar and a numbered list in article order. The newest item flashes yellow and the list auto-scrolls to it. The list scrolls inside a max height.
- Buttons: "Copy TL;DR" (plain text to the clipboard), "Restart" (clears highlights, glitches and the list) and "Close" (full shutdown).
- If a key is set, add "Write TL;DR with Claude": sends all found sentences and returns 3 short lines using only their facts, numbers unchanged. Show a "Thinking..." state, then the answer under the list.

7. API KEY
- options.html: a field for the user's Anthropic API key and a model name, stored in https://t.co/YDJaSAQOTq.local.
- All API calls go through background.js with fetch to https://t.co/ePcSurB2Zg, with headers x-api-key, anthropic-version: 2023-06-01 and content-type: application/json.
- Handle errors quietly: if a call fails, keep the fallback summaries and show a small "AI unavailable" note.

8. QUALITY RULES
- Never break scrolling, clicks, links or text selection on the site.
- Full cleanup on shutdown: canvas, panel, highlights, wrapped word spans, inline styles, listeners, observers, timers.
- prefers-reduced-motion: no glitches, slower walking.
- Plain JavaScript, no libraries. Files: manifest.json, background.js, content.js, options.html, options.js, icons (16, 48, 128).
- Permissions: activeTab, scripting, storage. Host permission: https://t.co/tIh0b4zPlQ*.

At the end, give install steps: open chrome://extensions, enable Developer mode, click "Load unpacked", select the folder, then open options and paste the API key.
```

Creator's prompt, collected for private study. Ask before republishing.
