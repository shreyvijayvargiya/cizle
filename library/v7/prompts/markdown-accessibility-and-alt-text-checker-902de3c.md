# Markdown Accessibility and Alt Text Checker

By @f · general
Language: en · Domains: general · Source: P01

Source page: https://prompts.chat

```
---
name: markdown-accessibility-checker
description: Reviews Markdown documentation (READMEs, docs sites, wikis, blog posts, changelogs) for accessibility - missing or poor image alt text, heading structure, vague or duplicate link text, bare URLs, empty table headers, color-only instructions, ALL CAPS, and emoji bullets - then writes good alt text for each image from context and returns a fix list or a corrected file. Use when a user asks to "check my README for accessibility", "write alt text for these images", "make our docs screen reader friendly", or wants an accessibility check for Markdown in CI.
---

# Markdown Accessibility Checker

You make Markdown documents work for everyone, including people who use screen readers, keyboard navigation, magnification, or reading aids. You find the problems a script can detect, then do the part a script cannot: write meaningful alt text and link text that fit the document's purpose.

## Files in this skill

- `scripts/check_md_a11y.py` - scans Markdown files or folders and reports problems with line numbers and severities (Python 3 standard library only)
- `references/alt-text-guide.md` - how to write alt text by image type (screenshots, diagrams, charts, photos, logos, badges, decorative images)
- `references/structure-and-links.md` - headings, link text, tables, lists, emphasis, and what each rule in the script means
- `templates/a11y-review.md` - the review report and the alt text worksheet
- `examples/example-readme-review.md` - a worked review of a project README

## Workflow

### 1. Scope the review
Ask which files or folders to check, who reads them (developers, end users, students), and whether the user wants a report, a corrected file, or both. If the documents are rendered by a site generator, ask whether it adds its own page title (then the Markdown may not need an H1).

### 2. Run the checker
'''bash
python3 scripts/check_md_a11y.py README.md docs/
python3 scripts/check_md_a11y.py docs/ --json
python3 scripts/check_md_a11y.py docs/ --fail-on warn     # for CI
'''
It ignores fenced code blocks and inline code. HIGH means content is lost for some readers (missing alt, empty link, empty heading), WARN should be fixed, INFO needs a human look. If you cannot run the script, check the same rules by reading the file and say so.

### 3. Write alt text
For every image flagged, and for every image with existing alt text, decide its purpose using `references/alt-text-guide.md`:
- Read the text around it: what is the image for at this point in the document?
- If you can see the image, describe what matters for that purpose. If you cannot, ask the user, or write a clearly marked draft from the file name and context (for example "DRAFT: check against the image").
- Decorative images get empty alt text; in Markdown prefer removing them, or use HTML `<img alt="">`.
Fill in the alt text worksheet in `templates/a11y-review.md`.

### 4. Fix structure and links
Apply `references/structure-and-links.md`: one H1, no skipped levels, real headings instead of bold lines, descriptive unique link text, tables with headers, instructions that do not rely on color alone.

### 5. Deliver
- Report: fill in `templates/a11y-review.md`, as in `examples/example-readme-review.md`, with the most important fixes first.
- Corrected file: return the full Markdown with fixes applied and a short change list. Do not change meaning, code samples, or links' destinations.
- Rerun the checker on the corrected file and include the before and after counts.

## Rules
- Never invent what an image shows. If you have not seen it, mark the alt text as a draft.
- Keep alt text short (usually under 150 characters); put long explanations (charts, diagrams) in the text or a caption and say so in the alt.
- Do not start alt text with "image of" or "picture of".
- Remember that automated checks find only part of the problems; always mention what still needs a manual check (color contrast in images, reading order, video captions).
- Respect the author's voice; fix accessibility, not style.
FILE:references/alt-text-guide.md
# Alt text guide

Alt text replaces the image for people who cannot see it. Ask: "If I read this document aloud, what would I say at this point instead of showing the image?" The answer depends on why the image is there, not only on what is in it.

## Basics
- Be specific and short: usually 5 to 20 words, rarely more than 150 characters.
- Lead with the important part. Do not start with "image of", "picture of", or "screenshot of" unless the type itself matters ("Screenshot" can help when the reader needs to find the same screen).
- End with a period so screen readers pause.
- Do not repeat the caption or the sentence next to the image word for word.
- Include text that appears in the image if the reader needs it (button labels, error messages).

## By image type

### Screenshots of an app or website
State the screen and the one thing the reader should notice.
- Weak: "screenshot"
- Better: "Settings screen with the Units toggle set to Metric."

### Hero images and banners
If it only sets the mood, it is decorative. If it shows the product, describe it in one sentence.
- "Trailhead Weather on a phone, showing a three-day forecast for a mountain pass."

### Diagrams and flowcharts
Give the main idea in the alt, and the full structure in the text or a list right after the image.
- Alt: "Architecture diagram: the mobile app calls the API, which reads from a forecast cache and a weather provider. Details in the list below."

### Charts and graphs
Give the type, the subject, and the key takeaway; put the data in a table if readers need numbers.
- "Line chart of daily active users, January to June 2026, rising from 2,000 to 9,500 with a dip in April."

### Photos
Describe what matters for the document's purpose: subject, action, setting.
- "Snow-covered ridge trail with orange marker poles leading to a hut."

### Logos
Use the organization or product name, plus "logo" only if it helps: "Trailhead Weather logo."
When the logo is a link, describe the destination: "Trailhead Weather home."

### Badges (build status, version, license)
Write the information the badge shows: "Build: passing", "License: MIT", "Version 2.4.1".

### Icons inside text or links
If the icon has a function, describe the function ("Download"); if it repeats nearby text, it is decorative.

### Animated GIFs and short videos
Describe what happens: "Animation: dragging a pin onto the map adds a new trailhead to the list." Videos also need captions and, for important content, a text alternative.

### Decorative images
Dividers, background textures, and purely visual flourishes. In HTML use `alt=""` so screen readers skip them. In Markdown, `![](divider.png)` is ambiguous (often a mistake), so prefer removing the image or using `<img src="divider.png" alt="">`.

## Common mistakes
- File names as alt text: "IMG_2041.jpg", "hero-final-v3".
- One word: "image", "logo", "chart".
- Keyword stuffing for search engines.
- Different alt text for the same image used in several places.
- Describing colors or layout when the reader needs the information, not the look.
FILE:references/structure-and-links.md
# Structure, links, and what each rule means

Screen reader users often jump through a document by headings or by links. Good structure is what makes that possible.

## Headings
| Rule | Severity | Why | Fix |
|---|---|---|---|
| empty-heading | HIGH | An empty heading is announced as "heading level 2" with nothing after it. | Add text or remove the #. |
| no-h1 | WARN | The page has no title in the heading outline. | Start with one `# Title`. Skip this if the site generator adds the H1 from front matter. |
| multiple-h1 | WARN | Several titles confuse the outline. | Keep one H1; use `##` for sections. |
| heading-skip | WARN | Jumping from H2 to H4 suggests a missing section. | Use the next level down (H3). Pick levels for structure, not for font size. |
| fake-heading | INFO | A bold line looks like a heading but is not in the outline. | Use a real heading if it starts a section; keep bold if it is just emphasis. |
| no-headings | INFO | Long text without headings is hard to scan. | Add section headings every few paragraphs. |

## Links
| Rule | Severity | Why | Fix |
|---|---|---|---|
| empty-link | HIGH | The link has no accessible name. | Add descriptive text. |
| vague-link | WARN | "Click here" or "read more" means nothing in a list of links. | Name the destination: "download the latest release", "setup guide". |
| same-text-different-url | WARN | Two links called "docs" that go to different places are indistinguishable. | Make each text unique: "API reference", "setup guide". |
| url-as-link-text | INFO | Long URLs are read character by character. | Use a short description; keep the URL only if readers must copy it. |
| bare-url | INFO | Same as above, and not always clickable. | Wrap in a descriptive link. |

Link text tips: put the important words first, keep it short, say when a link opens a file ("pricing sheet (PDF, 2 MB)"), and do not use "link" in the text.

## Images
| Rule | Severity | Why |
|---|---|---|
| img-missing-alt | HIGH | `![](file.png)` gives no alternative; some readers announce the file name. |
| img-no-alt | HIGH | `<img>` without an alt attribute; screen readers fall back to the file name. |
| img-generic-alt | WARN | "image", "screenshot", "logo" alone carry no information. |
| img-filename-alt | WARN | "IMG_2041.jpg" is not a description. |
| img-long-alt | WARN | Very long alt text cannot be navigated; move details to the text. |
| img-redundant-alt | INFO | "Image of" is redundant; screen readers already say "image". |
| img-decorative | INFO | `alt=""` hides the image; confirm it is truly decorative. |

See `alt-text-guide.md` for how to write the text.

## Tables
- table-empty-header (WARN): every column needs a header so screen readers can announce "Pro, Forecast days, 10". Add a header such as "Feature" to the first column.
- Use tables for data, not for layout. Keep them small; split very wide tables.

## Other rules
- color-only (WARN): "Press the green button" fails for color-blind readers and screen reader users. Name the button: "Select Save (the green button)".
- all-caps (INFO): long ALL CAPS text is harder to read, and some screen readers spell short caps words letter by letter. Use normal case and bold for emphasis.
- emoji-bullet (INFO): emoji are read aloud by name ("white heavy check mark Hourly forecasts"). Use normal list markers, and keep emoji rare and meaningful.

## Not checked by the script (check by hand)
- Whether alt text is accurate and useful.
- Color contrast and text inside images (screenshots with tiny text, charts with low contrast).
- Reading order of complex layouts, and HTML blocks embedded in Markdown.
- Captions and transcripts for videos and audio.
- Plain language: short sentences, defined jargon, and descriptive section names.
FILE:templates/a11y-review.md
# Accessibility Review: <document or folder>

Date: <YYYY-MM-DD>
Files checked: <n> (<list or folder>)
Audience: <who reads these docs>
Checker run: `python3 scripts/check_md_a11y.py <paths>` -> HIGH <n>, WARN <n>, INFO <n>

## Top fixes (most impact first)
1. <fix> (<file:line>)
2. <fix>
3. <fix>

## Alt text worksheet
| File:line | Image | Purpose in the document | Current alt | New alt | Seen the image? |
|---|---|---|---|---|---|
| | | informative / functional / decorative / complex | | | yes / draft |

## Headings
- Current outline: <H1 ... / H2 ... / H4 ...>
- Proposed outline: <H1 ... / H2 ... / H3 ...>

## Links
| File:line | Current text | New text | Destination |
|---|---|---|---|
| | | | |

## Other findings
| File:line | Rule | Change |
|---|---|---|
| | | |

## After fixes
Checker rerun: HIGH <n>, WARN <n>, INFO <n> (remaining INFO items explained below).
- <INFO item: reason it is acceptable>

## Manual checks still needed
- <for example: contrast of text inside screenshots, video captions>
FILE:examples/example-readme-review.md
# Example: accessibility review of a project README

## The request
"Our open source app's README gets a lot of traffic. A user who relies on a screen reader said it is hard to follow. Can you check it and fix it? The hero image is the app on a phone with the 3-day forecast; app-main.png is the main screen with hourly temperature, wind, and snow line; the badge is our build status."

## Checker run (before)
'''
$ python3 scripts/check_md_a11y.py README.md
Markdown accessibility check: 1 file(s), 3 image(s)
HIGH 2  WARN 8  INFO 5

README.md (3 images, 4 headings): 15 finding(s)
     3  HIGH  img-missing-alt          Image hero.png has empty alt text; describe it, or confirm it is purely decorative.
     5  INFO  all-caps                 Long ALL CAPS text is hard to read and some screen readers spell it letter by letter.
     9  WARN  vague-link               Link text "here" does not say where it goes; describe the destination.
     9  WARN  vague-link               Link text "click here" does not say where it goes; describe the destination.
    11  WARN  img-generic-alt          Alt text "screenshot" for app-main.png is generic; say what the image shows or why it is there.
    13  HIGH  img-no-alt               <img src="docs/img/badge.svg"> has no alt attribute.
    15  WARN  heading-skip             Heading level jumps from H2 to H4 ("Configuration"); use H3.
    17  WARN  color-only               Instruction relies on color; add the label, shape, or position too.
    19  INFO  fake-heading             Bold line "Features" looks like a heading; use a real # heading if it starts a section.
    21  INFO  emoji-bullet             Emoji used as a bullet is read aloud by name; use a list marker and put meaning in words.
    22  INFO  emoji-bullet             Emoji used as a bullet is read aloud by name; use a list marker and put meaning in words.
    24  WARN  table-empty-header       Table header has 1 empty cell(s); every column needs a header.
    28  WARN  same-text-different-url  Link text "docs" points to 2 different URLs; make each text unique.
    28  INFO  bare-url                 Bare URL https://example.org/docs; screen readers spell it out. Use [descriptive text](https://example.org/docs).
    35  WARN  multiple-h1              2 H1 headings (lines 1, 35); keep one title and use ## for sections.
'''
The `![](not-an-image.png)` inside the bash code block and the inline code example on the last line were correctly ignored.

## The review (filled template, shortened)

# Accessibility Review: README.md

Audience: hikers and contributors, many arriving from search.
Checker run: HIGH 2, WARN 8, INFO 5.

### Top fixes
1. Give the hero image and the build badge real alt text (lines 3 and 13).
2. Replace "here" and "click here" with link text that names the destination (line 9).
3. Fix the outline: "Configuration" becomes H3, "Features" becomes a real H3, and the second H1 "Contributing" becomes H2.
4. Name the Save button instead of only its color (line 17).
5. Give the first table column a header (line 24).

### Alt text worksheet
| File:line | Image | Purpose | Current alt | New alt | Seen? |
|---|---|---|---|---|---|
| README.md:3 | hero.png | informative: shows the product | (empty) | Trailhead Weather on a phone, showing a three-day forecast for a mountain pass. | described by the user |
| README.md:11 | app-main.png | informative: what the main screen shows | screenshot | Main screen with hourly temperature, wind, and snow line for the selected trailhead. | described by the user |
| README.md:13 | badge.svg | informative: build status | (no alt) | Build: passing | described by the user |

### Headings
- Before: H1 Trailhead Weather / H2 Install / H4 Configuration / H1 Contributing (plus a bold "Features" line).
- After: H1 Trailhead Weather / H2 Install / H3 Configuration / H3 Features / H2 Contributing.

### Links
| Line | Current text | New text | Destination |
|---|---|---|---|
| 9 | here | Download the latest release | https://example.org/releases |
| 9 | click here | setup guide | docs/guides/setup.md |
| 28 | docs (bare URL + "docs") | API reference | https://example.org/docs |
| 28 | docs | setup guide | docs/guides/setup.md |

### Other findings
| Line | Rule | Change |
|---|---|---|
| 5 | all-caps | Normal case inside the bold note. |
| 17 | color-only | "Select Save (the green button at the bottom of Settings)". |
| 21-22 | emoji-bullet | Normal "-" list items. |
| 24 | table-empty-header | First column header "Feature". |

### Corrected README (excerpt)
'''markdown
# Trailhead Weather

![Trailhead Weather on a phone, showing a three-day forecast for a mountain pass.](docs/img/hero.png)

Trailhead Weather shows mountain forecasts for hikers. **Note: this project is still in beta and things will break often.**

## Install

[Download the latest release](https://example.org/releases), or follow the [setup guide](docs/guides/setup.md).

<img src="docs/img/badge.svg" width="90" alt="Build: passing">

### Configuration

Select Save (the green button at the bottom of Settings) to save your settings.

### Features

- Hourly forecasts
- Avalanche bulletins

| Feature | Free | Pro |
|---|---|---|
| Forecast days | 3 | 10 |
'''

### After fixes
'''
$ python3 scripts/check_md_a11y.py README-fixed.md
Markdown accessibility check: 1 file(s), 3 image(s)
HIGH 0  WARN 0  INFO 0
'''

### Manual checks still needed
- The hero image has small text on the phone screen; the alt text carries the key message, so that is fine here.
- If the README is ever turned into a docs site page, confirm the site does not add a second H1.

## Why this is a good answer
- Alt text describes each image's purpose, using what the user said the images show instead of guessing.
- Links and headings are fixed for how screen reader users navigate: by link list and by heading outline.
- The fix is verified by rerunning the checker, and the remaining manual checks are listed honestly.
FILE:scripts/check_md_a11y.py
#!/usr/bin/env python3
"""Check Markdown files for common accessibility problems.

Usage:
  python3 check_md_a11y.py README.md docs/            # files and folders (*.md, *.markdown)
  python3 check_md_a11y.py docs/ --json
  cat page.md | python3 check_md_a11y.py -
  python3 check_md_a11y.py docs/ --fail-on warn      # exit 1 on WARN too (for CI)

Checks (code blocks and inline code are ignored):
  images   missing alt text, file-name or generic alt ("image", "screenshot"),
           redundant "image of ..." openers, very long alt, HTML <img> without alt,
           empty alt (fine only for decorative images)
  headings no H1 or more than one H1, skipped levels (H2 -> H4), empty headings,
           bold lines used as fake headings
  links    empty link text, vague text ("click here", "read more", "here"),
           bare URLs, the same text pointing to different URLs
  tables   empty header cells
  other    ALL CAPS sentences, emoji used as bullets, color-only instructions
Severities: HIGH (blocks understanding), WARN (should fix), INFO (check by hand).
Exit code: 0 no HIGH, 1 HIGH found (or WARN with --fail-on warn), 2 usage error.
Standard library only.
"""
import argparse
import json
import os
import re
import sys

GENERIC_ALT = {"image", "img", "picture", "pic", "photo", "screenshot", "screen shot", "graphic", "icon",
               "logo", "diagram", "chart", "figure", "untitled", "alt", "alt text", "banner", "placeholder"}
VAGUE_LINK = {"click here", "here", "click", "read more", "more", "learn more", "link", "this", "this link",
              "this page", "go", "details", "more info", "info", "see here", "check it out"}
REDUNDANT_START = re.compile(r"^(an? )?(image|picture|photo|screenshot|graphic) (of|showing)\b", re.I)
FILE_ALT = re.compile(r"^[\w\-. ]+\.(png|jpe?g|gif|svg|webp|bmp|tiff?)$|^(img|image|dsc|screenshot)[_\- ]?\d+", re.I)
IMG_MD = re.compile(r"!\[([^\]]*)\]\(\s*<?([^)\s>]*)>?(?:\s+\"[^\"]*\")?\s*\)")
IMG_REF = re.compile(r"!\[([^\]]*)\]\[[^\]]*\]")
LINK_MD = re.compile(r"(?<!!)\[([^\]]*)\]\(\s*<?([^)\s>]*)>?(?:\s+\"[^\"]*\")?\s*\)")
HTML_IMG = re.compile(r"<img\b[^>]*>", re.I)
BARE_URL = re.compile(r"(?<![(<\"'=\[])\bhttps?://[^\s)>\]]+")
COLOR_ONLY = re.compile(r"\b(click|press|tap|select|choose|use)\b[^.]{0,30}\b(red|green|blue|yellow|orange|purple)\b(?! *\()", re.I)
EMOJI_BULLET = re.compile(r"^\s*[\u2705\u274c\u2b50\u27a1\u2714\u2716\U0001F300-\U0001FAFF]\ufe0f?\s+\S")


def strip_inline_code(line):
    return re.sub(r"`+[^`]*`+", lambda m: " " * len(m.group(0)), line)


def check_text(text, name):
    findings = []

    def add(sev, line, rule, msg):
        findings.append({"file": name, "line": line, "severity": sev, "rule": rule, "message": msg})

    lines = text.replace("\r\n", "\n").split("\n")
    in_fence, fence = False, ""
    headings, link_targets = [], {}
    images = 0
    prev_blank = True
    for no, raw in enumerate(lines, 1):
        stripped = raw.strip()
        m = re.match(r"^\s{0,3}(`{3,}|~{3,})", raw)
        if m:
            if not in_fence:
                in_fence, fence = True, m.group(1)[0] * 3
            elif stripped.startswith(fence):
                in_fence = False
            continue
        if in_fence or raw.startswith("    ") and prev_blank and not stripped.startswith(("-", "*", "+")):
            prev_blank = not stripped if not in_fence else prev_blank
            continue
        line = strip_inline_code(raw)
        hm = re.match(r"^\s{0,3}(#{1,6})(\s+|$)(.*?)\s*#*\s*$", line)
        if hm:
            level, title = len(hm.group(1)), hm.group(3).strip()
            headings.append((no, level, title))
            if not title:
                add("HIGH", no, "empty-heading", f"Empty H{level} heading; screen reader users navigate by headings.")
        elif re.fullmatch(r"\s*(\*\*|__)[^*_]{2,80}(\*\*|__):?\s*", line) and prev_blank:
            add("INFO", no, "fake-heading", f"Bold line \"{stripped.strip('*_:')}\" looks like a heading; use a real # heading if it starts a section.")
        images += len(IMG_MD.findall(line)) + len(IMG_REF.findall(line)) + len(HTML_IMG.findall(line))
        for alt, src in IMG_MD.findall(line):
            check_alt(add, no, alt, src)
        for alt in IMG_REF.findall(line):
            check_alt(add, no, alt, "(reference)")
        for tag in HTML_IMG.findall(line):
            am = re.search(r"\balt\s*=\s*(\"([^\"]*)\"|'([^']*)'|(\S+))", tag, re.I)
            src = re.search(r"\bsrc\s*=\s*[\"']?([^\"'\s>]+)", tag, re.I)
            src = src.group(1) if src else "?"
            if not am:
                add("HIGH", no, "img-no-alt", f"<img src=\"{src}\"> has no alt attribute.")
            else:
                check_alt(add, no, am.group(2) if am.group(2) is not None else (am.group(3) if am.group(3) is not None else am.group(4)), src, html=True)
        no_images = IMG_MD.sub(" ", line)
        for text_, url in LINK_MD.findall(no_images):
            label = re.sub(r"[*_`]", "", text_).strip()
            if not label:
                add("HIGH", no, "empty-link", f"Link to {url or '(no url)'} has no text; screen readers will read the URL or nothing.")
            elif label.lower().rstrip(".!:") in VAGUE_LINK:
                add("WARN", no, "vague-link", f"Link text \"{label}\" does not say where it goes; describe the destination.")
            elif re.fullmatch(r"https?://\S+", label):
                add("INFO", no, "url-as-link-text", f"Link text is a raw URL ({label[:60]}); use a short description.")
            if label:
                link_targets.setdefault(label.lower(), {}).setdefault(url, no)
        for url in BARE_URL.findall(LINK_MD.sub(" ", no_images)):
            add("INFO", no, "bare-url", f"Bare URL {url[:60]}; screen readers spell it out. Use [descriptive text]({url[:40]}).")
        if "|" in line and re.match(r"^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$", line) and no > 1:
            header = lines[no - 2].strip().strip("|")
            cells = [c.strip() for c in header.split("|")]
            if any(not c for c in cells):
                add("WARN", no - 1, "table-empty-header", f"Table header has {sum(1 for c in cells if not c)} empty cell(s); every column needs a header.")
        run = longest = 0
        for w in re.findall(r"[A-Za-z]+", line):
            run = run + 1 if w.isupper() and (len(w) > 1 or w in "AI") else 0
            longest = max(longest, run)
        if longest >= 5 and not hm:
            add("INFO", no, "all-caps", "Long ALL CAPS text is hard to read and some screen readers spell it letter by letter.")
        if EMOJI_BULLET.match(line):
            add("INFO", no, "emoji-bullet", "Emoji used as a bullet is read aloud by name; use a list marker and put meaning in words.")
        cm = COLOR_ONLY.search(line)
        if cm:
            between = line[cm.end(1):cm.start(2)]
            inside_parens = line[:cm.start(2)].count("(") > line[:cm.start(2)].count(")")
            names_label = re.match(r"\s+(\*\*|\"|')?[A-Z]", between)  # "Select Save ..." or "Press **Save**"
            if inside_parens or names_label:
                cm = None
        if cm:
            add("WARN", no, "color-only", "Instruction relies on color; add the label, shape, or position too.")
        prev_blank = not stripped

    h1 = [h for h in headings if h[1] == 1]
    if headings and not h1:
        add("WARN", headings[0][0], "no-h1", "Document has no H1; start with one # title.")
    if len(h1) > 1:
        add("WARN", h1[1][0], "multiple-h1", f"{len(h1)} H1 headings (lines {', '.join(str(h[0]) for h in h1)}); keep one title and use ## for sections.")
    for (pno, plev, _), (no, lev, title) in zip(headings, headings[1:]):
        if lev > plev + 1:
            add("WARN", no, "heading-skip", f"Heading level jumps from H{plev} to H{lev} (\"{title[:50]}\"); use H{plev + 1}.")
    if not headings and len([l for l in lines if l.strip()]) > 15:
        add("INFO", 1, "no-headings", "Long document with no headings; add headings so readers can navigate.")
    for label, targets in link_targets.items():
        if len(targets) > 1 and label not in VAGUE_LINK:
            first = min(targets.values())
            add("WARN", first, "same-text-different-url", f"Link text \"{label}\" points to {len(targets)} different URLs; make each text unique.")
    order = {"HIGH": 0, "WARN": 1, "INFO": 2}
    findings.sort(key=lambda f: (f["line"], order[f["severity"]]))
    return findings, len(headings), images


def check_alt(add, no, alt, src, html=False):
    a = alt.strip()
    base = os.path.basename(src) if src else ""
    if a == "" and html:
        add("INFO", no, "img-decorative", f"<img src=\"{base}\"> has alt=\"\" (marked decorative); confirm it carries no information.")
        return
    if a == "" and src:
        add("HIGH", no, "img-missing-alt", f"Image {base or src} has empty alt text; describe it, or confirm it is purely decorative.")
        return
    low = a.lower().rstrip(".")
    if low in GENERIC_ALT:
        add("WARN", no, "img-generic-alt", f"Alt text \"{a}\" for {base} is generic; say what the image shows or why it is there.")
    elif FILE_ALT.search(a) or (base and low == os.path.splitext(base)[0].lower()):
        add("WARN", no, "img-filename-alt", f"Alt text \"{a}\" looks like a file name; describe the image instead.")
    elif REDUNDANT_START.match(a):
        add("INFO", no, "img-redundant-alt", f"Alt text starts with \"{' '.join(a.split()[:3])}\"; screen readers already say 'image', so start with the content.")
    if len(a) > 150:
        add("WARN", no, "img-long-alt", f"Alt text is {len(a)} characters; keep it under about 150 and move details to the surrounding text or a caption.")


def collect(paths):
    files = []
    for p in paths:
        if p == "-":
            files.append("-")
        elif os.path.isdir(p):
            for root, dirs, names in os.walk(p):
                dirs[:] = sorted(d for d in dirs if not d.startswith(".") and d != "node_modules")
                files += [os.path.join(root, n) for n in sorted(names) if n.lower().endswith((".md", ".markdown"))]
        elif os.path.isfile(p):
            files.append(p)
        else:
            raise FileNotFoundError(p)
    return files


def main():
    ap = argparse.ArgumentParser(description="Markdown accessibility checker")
    ap.add_argument("paths", nargs="+", help="Markdown files, folders, or - for stdin")
    ap.add_argument("--json", action="store_true")
    ap.add_argument("--fail-on", choices=["high", "warn"], default="high")
    args = ap.parse_args()
    try:
        files = collect(args.paths)
    except FileNotFoundError as e:
        print(f"error: path not found: {e}", file=sys.stderr)
        return 2
    if not files:
        print("error: no Markdown files (*.md, *.markdown) found", file=sys.stderr)
        return 2
    all_findings, stats = [], []
    for f in files:
        text = sys.stdin.read() if f == "-" else open(f, encoding="utf-8", errors="replace").read()
        name = "<stdin>" if f == "-" else f
        found, nhead, images = check_text(text, name)
        stats.append({"file": name, "images": images, "headings": nhead, "findings": len(found)})
        all_findings += found
    counts = {s: sum(1 for x in all_findings if x["severity"] == s) for s in ("HIGH", "WARN", "INFO")}
    if args.json:
        print(json.dumps({"files": stats, "counts": counts, "findings": all_findings}, indent=2))
    else:
        print(f"Markdown accessibility check: {len(files)} file(s), {sum(s['images'] for s in stats)} image(s)")
        print(f"HIGH {counts['HIGH']}  WARN {counts['WARN']}  INFO {counts['INFO']}")
        for s in stats:
            items = [x for x in all_findings if x["file"] == s["file"]]
            print(f"\n{s['file']} ({s['images']} images, {s['headings']} headings): {len(items)} finding(s)")
            for x in items:
                print(f"  {x['line']:>4}  {x['severity']:<4}  {x['rule']:<24} {x['message']}")
        print("\nAutomated checks cover only part of accessibility; review alt text meaning, reading order, and contrast by hand.")
    bad = counts["HIGH"] + (counts["WARN"] if args.fail_on == "warn" else 0)
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main())
```

Prompt from the public prompts.chat library (CC0), credited to its contributor.
