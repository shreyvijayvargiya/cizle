# SRT Subtitle Quality Checker

By @f · general
Language: en · Domains: entertainment, education, gaming · Source: P01

Source page: https://prompts.chat

```
---
name: srt-subtitle-quality-checker
description: Checks SRT and WebVTT subtitle files for broken or overlapping timings, numbering gaps, empty cues, reading speed above a characters-per-second limit, long or extra lines, cues that flash by or linger, unbalanced tags, and sound labels, then rewrites and retimes the problem cues and can shift the whole file. Use when a user shares subtitles or captions and asks "check my subtitles", "why are these captions hard to read?", "fix the timing", or "make these subtitles follow the guidelines".
---

# SRT Subtitle Quality Checker

You help video makers, translators, and accessibility teams ship subtitles that people can actually read. You find timing errors that break players, cues that appear too briefly or carry too much text, and lines that are too long, and you fix them by rewriting the text more concisely and adjusting times, without changing the meaning.

## Files in this skill

- `scripts/check_subtitles.py` - parses SRT and WebVTT, checks timing, numbering, reading speed, line length, line count, duration, gaps, tags, and sound labels, and can shift every timestamp (Python 3 standard library only)
- `references/subtitle-guidelines.md` - common limits for reading speed, line length, duration, gaps, line breaks, and when to use SDH labels
- `references/condensing-techniques.md` - how to shorten subtitle text without losing meaning, and how to retime cues
- `templates/subtitle-review.md` - the review report to return
- `examples/example-workshop-video.md` - a worked review of a short tutorial video

## Workflow

### 1. Collect the facts
Ask, or assume and say so:
- The file (SRT or VTT) and the video length; frame rate if known (24, 25, or 30 fps).
- Audience and style guide: general adult viewers, children, a platform guide, or the client's own limits.
- Subtitle type: same-language captions, translation, or SDH (for deaf and hard-of-hearing viewers, with sound labels).
- Whether you may rewrite text or only retime it.

### 2. Run the checker
'''bash
python3 scripts/check_subtitles.py movie.srt
python3 scripts/check_subtitles.py movie.srt --max-cps 15 --max-line 37   # children or stricter guides
python3 scripts/check_subtitles.py movie.vtt --json
python3 scripts/check_subtitles.py movie.srt --shift -1200 > movie-synced.srt   # whole file 1.2 s earlier
'''
Defaults: 17 characters per second, 42 characters per line, 2 lines, 0.833 to 7 seconds on screen, 83 ms minimum gap. Pick limits from `references/subtitle-guidelines.md` to match the audience. If you cannot run the script, check the cues by hand: duration, characters divided by seconds, longest line, and overlaps with the next cue.

### 3. Fix in this order
1. HIGH findings first: overlaps, out-of-order cues, end before start, bad timestamps, empty cues. These break players or hide text.
2. Reading speed: extend the cue into free time before or after it (respect the minimum gap and shot changes the user mentions), otherwise condense the text with `references/condensing-techniques.md`, otherwise split the cue in two at a natural pause.
3. Line length and line count: rebreak at natural phrase boundaries; keep the top line shorter when possible; never break between an article and its noun.
4. Too short or too long on screen: merge very short cues with a neighbor, split long ones.
5. INFO items: renumber, balance tags, remove sound labels from non-SDH files, chain cues (0 ms gap) or leave a visible gap.
Rerun the checker on the corrected file until there are no HIGH findings and every WARN is fixed or explained.

### 4. Deliver
Fill in `templates/subtitle-review.md`: summary with counts before and after, the limits used, a table of changed cues (old and new times and text), and the full corrected file in the same format as the input. Follow the style of `examples/example-workshop-video.md`.

## Rules
- Never change the meaning, tone, or speaker of a line; condense filler, not content.
- Keep names, numbers, and technical terms exactly; if a term is wrong, flag it instead of guessing.
- Timing changes must stay in sync with the speech: extend a cue only into silence, by at most about 0.5 s before speech starts or 1 s after it ends, unless the user allows more.
- Keep the input format (SRT stays SRT, VTT stays VTT) and the original encoding (UTF-8).
- Say clearly which findings you could not fix without hearing the audio or seeing the video.
FILE:references/subtitle-guidelines.md
# Subtitle guidelines: common limits

Different broadcasters and platforms publish their own style guides. The values below are common starting points; always prefer the client's or platform's guide when one exists, and say which limits you used.

## Reading speed (characters per second, CPS)

CPS = visible characters in the cue (letters, digits, spaces, punctuation; not tags) divided by seconds on screen.

| Audience | Typical CPS limit |
|---|---|
| General adult viewers, same-language or translated | 15 to 17 |
| Fast-paced adult content where the guide allows it | up to 20 |
| Children (around 6 to 11 years) | 12 to 13 |
| Learners of the language, SDH with heavy sound labels | 13 to 15 |

Words per minute is an older measure; around 160 to 180 wpm corresponds to about 15 to 17 CPS in English.

## Line length and line count

- 37 to 42 characters per line for most Latin-script languages; 42 is the most common modern limit.
- Maximum 2 lines per cue. A third line covers the picture and is hard to read.
- Use one line when the text fits on one line; break into two only when needed.

## Duration on screen

- Minimum: about 5/6 of a second (20 frames at 24 fps), even for a single word, so the eye registers it.
- Maximum: about 7 seconds. Longer cues get reread and feel stuck; split them.

## Gaps between cues

- Chained cues: 0 ms gap is fine when the speech is continuous.
- Otherwise leave at least 2 frames (83 ms at 24 fps, 80 ms at 25 fps) so viewers notice that the text changed.
- Gaps between 1 ms and 2 frames cause a visible flicker and should be closed or widened.

## Line breaks

Break lines at natural linguistic units:
- After punctuation (comma, full stop) when possible.
- Before conjunctions (and, but, because) and prepositions.
- Never between an article and its noun, an adjective and its noun, a first and last name, or a verb and its auxiliary.
- Prefer a pyramid shape (shorter top line) when both breaks are equally good.

## Timing to speech and shots

- Start the cue when the speech starts (a few frames early is fine), end it no more than about 1 second after the speech ends.
- Avoid carrying a cue across a hard shot change; end it a couple of frames before the cut or start it after.

## SDH and captions

- Sound labels like [door slams] or (MUSIC) and speaker IDs belong in SDH/closed captions, not in standard translated subtitles.
- Keep labels short, lower case in square brackets is the most common modern style, and place them where the sound happens.

## Formatting

- Italics for off-screen voices, voice-over, songs, and foreign words, if the guide uses them. Every opening tag needs a closing tag in the same cue.
- No full stops at the end of single-line fragments is a style choice; follow the guide.
- SRT: cue number, timestamp line `00:01:02,500 --> 00:01:04,000`, text, blank line. VTT: `WEBVTT` header, optional cue id, timestamps with a dot `00:01:02.500`.
FILE:references/condensing-techniques.md
# Condensing and retiming subtitles

When a cue is too fast to read, try these in order. Stop as soon as the cue fits the limits.

## 1. Use free time first (no text change)

- Look at the gap before and after the cue. Extend the start up to about 0.5 s earlier if nobody else is speaking, and the end up to about 1 s later if the next cue starts later.
- Keep the minimum gap (2 frames) to the neighbors, or chain at 0 ms.
- Required time for a cue = characters / CPS limit. Example: 68 characters at 17 CPS need 4.0 s.

## 2. Cut filler, keep content

Remove words that the viewer hears or sees anyway:
- Hesitations and fillers: "well", "you know", "I mean", "um", "so, basically".
- Repetitions: "very, very" -> "very"; false starts.
- Greetings and names already obvious from the picture.
- Tag questions when tone is clear: "It's ready, isn't it?" -> "It's ready?" only if the meaning stays.

## 3. Use shorter forms

| Long | Short |
|---|---|
| we are going to | we'll |
| at this point in time | now |
| in order to | to |
| a large number of | many |
| it is not possible to | you can't |
| I would like to show you | let me show you |
| due to the fact that | because |

Contractions are usually fine in subtitles; follow the guide for formal content.

## 4. Simplify structure

- Turn passive into active: "The bowl was cleaned by the artist" -> "The artist cleans the bowl".
- Replace a clause with a single word when possible.
- Split one long sentence into two shorter cues at a natural pause.

## 5. Split or merge cues

- Split a cue longer than about 7 s, or one with a 3rd line, at a pause or punctuation; give each half time in proportion to its characters.
- Merge a cue under about 0.8 s with its neighbor when it is the same speaker and the result fits the limits.

## What never to cut

- Names, numbers, quantities, dates, technical terms, and negations ("not", "never").
- Words that carry the joke, the twist, or the emotion of the line.
- Information the viewer needs later in the video.

## Retiming the whole file

If every cue is early or late by the same amount, shift the whole file instead of editing cues:

'''bash
python3 scripts/check_subtitles.py movie.srt --shift 1500 > movie-shifted.srt    # 1.5 s later
python3 scripts/check_subtitles.py movie.srt --shift -800 > movie-shifted.srt    # 0.8 s earlier
'''

If the drift grows over time (in sync at the start, late at the end), the frame rate is probably wrong (for example 23.976 vs 25 fps); a constant shift will not fix it. Say so and ask for the frame rate of the video.
FILE:templates/subtitle-review.md
# Subtitle review: ${file_name}

**Video:** ${video_title} (${duration}, ${fps} fps)
**Type:** ${type: translation / same-language captions / SDH}
**Limits used:** ${cps} chars/s, ${line} chars/line, ${lines} lines, ${min_dur} to ${max_dur} s on screen, ${gap} ms minimum gap (${source_of_limits})

## Summary

| | Before | After |
|---|---|---|
| Cues | | |
| HIGH | | |
| WARN | | |
| INFO | | |
| Average chars/s | | |

Main problems in one or two sentences.

## Changes

| Cue | Problem | Old time | New time | Old text | New text |
|---|---|---|---|---|---|
| | | | | | |

## Not fixed (needs audio or video)

- Cue ..., reason ...

## Notes for the editor

- Style choices made (italics, contractions, labels).
- Anything to check against the picture (shot changes, on-screen text).

## Corrected file

'''
(full corrected SRT or VTT here, same format as the input)
'''
FILE:examples/example-workshop-video.md
# Example: subtitle review of a short tutorial video

## User request

"Here are the English subtitles for our 25-second kintsugi workshop clip. Viewers say they can't keep up. Can you check them and fix what's wrong? General adult audience, normal subtitles, not SDH."

## Input (excerpt of interview.srt)

'''
2
00:00:03,250 --> 00:00:04,000
Today we are going to look at how to repair a cracked ceramic bowl with gold.

3
00:00:03,900 --> 00:00:06,500
[HAMMER TAPPING]
First, clean the edges.

5
00:00:07,000 --> 00:00:16,000
<i>This technique is called kintsugi.
'''

## Checker run

'''
$ python3 scripts/check_subtitles.py interview.srt
interview.srt (SRT): 8 cues, 00:00:01,000 to 00:00:24,000, avg 16.3 chars/s, avg 2.37 s on screen
  HIGH 3  WARN 9  INFO 3
  HIGH overlap          cue 3 @ 00:00:03,900: overlaps the previous cue by 100 ms; end the previous cue at 00:00:03,817
  HIGH end-before-start cue 8 @ 00:00:21,000: ends at 00:00:20,500, not after its start
  HIGH empty-cue        cue 9 @ 00:00:22,000: cue has no visible text
  WARN too-short        cue 2 @ 00:00:03,250: on screen 0.75 s (minimum 0.83 s)
  WARN reading-speed    cue 2 @ 00:00:03,250: 102.7 chars/s (limit 17); needs 4.53 s on screen or about 64 fewer chars
  ...
'''

## Review (filled template, shortened)

**Limits used:** 17 chars/s, 42 chars/line, 2 lines, 0.833 to 7 s, 83 ms gap (common general-audience values; no client guide given).

| | Before | After |
|---|---|---|
| Cues | 8 | 8 |
| HIGH | 3 | 0 |
| WARN | 9 | 0 |
| INFO | 3 | 0 |

Main problems: cue 2 carried a whole sentence for under a second, two cues had broken times, a 9-second cue lingered, and cue 7 had three long lines. All fixed by condensing filler, using the silence after the speech, and splitting one cue.

| Cue | Problem | Old time | New time | Old text | New text |
|---|---|---|---|---|---|
| 2 | 102.7 chars/s, 77-char line, overlap with 3 | 03,250-04,000 | 03,300-06,600 | Today we are going to look at how to repair a cracked ceramic bowl with gold. | Today we'll repair a cracked bowl / with lacquer and gold. |
| 3 | sound label in non-SDH file, overlap | 03,900-06,500 | 06,700-08,200 | [HAMMER TAPPING] / First, clean the edges. | First, clean the edges. |
| 4 (was 5) | 9 s on screen, unclosed italics, numbering gap | 07,000-16,000 | 08,300-11,000 | `<i>`This technique is called kintsugi. | `<i>`This technique is called kintsugi.`</i>` |
| 5 (was 6) | 0.4 s on screen | 16,000-16,400 | 16,000-16,900 | Okay. | Okay. |
| 6 and 7 (was 7) | 56 chars/s, 3 lines, 67-char line | 17,000-19,000 | 17,000-21,000 and 21,100-22,800 | You will need lacquer, a fine brush, and gold powder, and patience, / lots of patience, / because each layer must dry. | You'll need lacquer, a fine brush, / gold powder, and lots of patience. + Each layer must dry first. |
| 8 (was 8) | ends before it starts | 21,000-20,500 | 22,900-24,000 | Let's start. | Let's start. |
| 9 | empty cue | 22,000-24,000 | removed | | |

Note: the old cue 2 was shortened ("look at how to", "ceramic") only where the picture already shows it; "lacquer" was added because the speaker names it a few seconds later and the viewer needs it.

**Not fixed:** none, but please confirm against the video that the speaker pauses after "gold" (cue 2 now runs 2.6 s longer, into what looks like silence) and that "Let's start." is spoken at about 22.9 s.

Corrected file rechecked:

'''
$ python3 scripts/check_subtitles.py interview-fixed.srt
interview-fixed.srt (SRT): 8 cues, 00:00:01,000 to 00:00:24,000, avg 14.5 chars/s, avg 2.17 s on screen
  HIGH 0  WARN 0  INFO 0
  no problems found
'''
FILE:scripts/check_subtitles.py
#!/usr/bin/env python3
"""Check SRT or WebVTT subtitle files for timing and readability problems.

Usage:
  python3 check_subtitles.py FILE [FILE ...] [options]
  python3 check_subtitles.py - < movie.srt          (read stdin)

Options:
  --max-cps N        maximum characters per second (default 17)
  --max-line N       maximum characters per line (default 42)
  --max-lines N      maximum lines per cue (default 2)
  --min-dur S        minimum cue duration in seconds (default 0.833, 20 frames at 24 fps)
  --max-dur S        maximum cue duration in seconds (default 7.0)
  --min-gap MS       minimum gap between cues in milliseconds (default 83, 2 frames at 24 fps)
  --shift MS         print the file with every timestamp shifted by MS (may be negative) and exit
  --json             print findings as JSON
  --fail-on LEVEL    exit 1 if any finding is at least LEVEL: high (default), warn, info

Findings: HIGH = broken or overlapping timing, unreadable numbering, empty cue;
WARN = reading speed, line length, too many lines, too short or long on screen;
INFO = tiny gaps, unbalanced tags, hearing-impaired brackets, statistics.
Exit codes: 0 ok, 1 findings at or above --fail-on, 2 usage or parse error.
Python 3 standard library only.
"""
import json
import math
import re
import sys

TS = re.compile(r"^\s*(\d{1,2}:)?(\d{1,2}):(\d{2})[,.](\d{1,3})\s*-->\s*(\d{1,2}:)?(\d{1,2}):(\d{2})[,.](\d{1,3})(.*)$")
TAG = re.compile(r"</?[^>]+>|\{\\[^}]*\}")
LEVELS = {"info": 0, "warn": 1, "high": 2}


def to_ms(h, m, s, ms):
    h = int(h[:-1]) if h else 0
    return ((h * 60 + int(m)) * 60 + int(s)) * 1000 + int(ms.ljust(3, "0"))


def fmt(ms, vtt=False):
    sign = "-" if ms < 0 else ""
    ms = abs(ms)
    h, rem = divmod(ms, 3600000)
    m, rem = divmod(rem, 60000)
    s, rem = divmod(rem, 1000)
    sep = "." if vtt else ","
    return f"{sign}{h:02d}:{m:02d}:{s:02d}{sep}{rem:03d}"


def parse(text):
    """Return (cues, errors, is_vtt). Each cue: dict(index, start, end, lines, line_no)."""
    text = text.replace("\r\n", "\n").replace("\r", "\n").lstrip("\ufeff")
    is_vtt = text.lstrip().startswith("WEBVTT")
    blocks = re.split(r"\n\s*\n", text.strip("\n"))
    cues, errors = [], []
    line_no = 1
    for block in blocks:
        lines = block.split("\n")
        start_line = line_no
        line_no += len(lines) + 1
        if is_vtt and (lines[0].startswith("WEBVTT") or lines[0].startswith("NOTE") or lines[0].startswith("STYLE") or lines[0].startswith("REGION")):
            continue
        ts_i = next((i for i, ln in enumerate(lines[:3]) if "-->" in ln), None)
        if ts_i is None:
            errors.append({"level": "high", "rule": "unparsed-block", "line": start_line,
                           "message": f"block without a timestamp line: {lines[0][:50]!r}"})
            continue
        m = TS.match(lines[ts_i])
        if not m:
            errors.append({"level": "high", "rule": "bad-timestamp", "line": start_line + ts_i,
                           "message": f"cannot read timestamp {lines[ts_i].strip()!r} (expected 00:01:02,500 --> 00:01:04,000)"})
            continue
        g = m.groups()
        index = lines[0].strip() if ts_i == 1 else None
        cues.append({"index": index, "start": to_ms(*g[0:4]), "end": to_ms(*g[4:8]),
                     "lines": [ln for ln in lines[ts_i + 1:]], "line_no": start_line})
    return cues, errors, is_vtt


def visible(line):
    return TAG.sub("", line).strip()


def check(cues, errors, opts, is_vtt):
    out = list(errors)

    def add(level, rule, cue, msg):
        out.append({"level": level, "rule": rule, "line": cue["line_no"],
                    "cue": cue["index"] or "-", "time": fmt(cue["start"], is_vtt), "message": msg})

    if not is_vtt:
        expected = 1
        for c in cues:
            if c["index"] is None or not c["index"].isdigit():
                add("high", "bad-number", c, f"cue number missing or not a number: {c['index']!r}")
            elif int(c["index"]) != expected:
                add("warn", "numbering", c, f"cue number {c['index']} but expected {expected} (renumber the file)")
                expected = int(c["index"])
            expected += 1
    prev = None
    for c in cues:
        dur = (c["end"] - c["start"]) / 1000
        text_lines = [visible(ln) for ln in c["lines"] if visible(ln)]
        chars = sum(len(ln) for ln in text_lines)
        if c["end"] <= c["start"]:
            add("high", "end-before-start", c, f"ends at {fmt(c['end'], is_vtt)}, not after its start")
        if not text_lines:
            add("high", "empty-cue", c, "cue has no visible text")
        if prev is not None:
            gap = c["start"] - prev["end"]
            if c["start"] < prev["start"]:
                add("high", "out-of-order", c, f"starts before the previous cue ({fmt(prev['start'], is_vtt)}); sort by time")
            elif gap < 0:
                add("high", "overlap", c, f"overlaps the previous cue by {-gap} ms; end the previous cue at {fmt(c['start'] - opts['min_gap'], is_vtt)}")
            elif 0 < gap < opts["min_gap"]:
                add("info", "tiny-gap", c, f"only {gap} ms after the previous cue; use 0 ms (chained) or at least {opts['min_gap']} ms so the change is visible")
        if c["end"] > c["start"] and text_lines:
            if dur < opts["min_dur"]:
                add("warn", "too-short", c, f"on screen {dur:.2f} s (minimum {opts['min_dur']:.2f} s)")
            if dur > opts["max_dur"]:
                add("warn", "too-long", c, f"on screen {dur:.2f} s (maximum {opts['max_dur']:.1f} s); split it or shorten the time")
            cps = chars / dur if dur > 0 else float("inf")
            if cps > opts["max_cps"]:
                need = chars / opts["max_cps"]
                cut = max(1, math.ceil(chars - opts["max_cps"] * dur))
                add("warn", "reading-speed", c, f"{cps:.1f} chars/s (limit {opts['max_cps']:g}); needs {need:.2f} s on screen or about {cut} fewer chars")
        for ln in text_lines:
            if len(ln) > opts["max_line"]:
                add("warn", "line-length", c, f"line has {len(ln)} chars (limit {opts['max_line']}): {ln[:60]!r}")
        if len(text_lines) > opts["max_lines"]:
            add("warn", "too-many-lines", c, f"{len(text_lines)} lines (limit {opts['max_lines']})")
        raw = " ".join(c["lines"])
        for tag in ("i", "b", "u"):
            if len(re.findall(rf"<{tag}>", raw, re.I)) != len(re.findall(rf"</{tag}>", raw, re.I)):
                add("info", "unbalanced-tag", c, f"<{tag}> tags are not balanced in this cue")
        if re.search(r"\[[^\]]+\]|\([A-Z][A-Z ]+\)", raw):
            add("info", "sdh-label", c, "contains a sound or speaker label in brackets; keep it only in SDH/CC files")
        prev = c
    return out


def stats(cues, is_vtt=False):
    if not cues:
        return {}
    total_chars = sum(len(visible(ln)) for c in cues for ln in c["lines"])
    total_time = sum(max(c["end"] - c["start"], 0) for c in cues) / 1000
    return {"cues": len(cues), "first": fmt(cues[0]["start"], is_vtt), "last_end": fmt(max(c["end"] for c in cues), is_vtt),
            "avg_cps": round(total_chars / total_time, 1) if total_time else None,
            "avg_duration_s": round(total_time / len(cues), 2)}


def shift_text(text, delta):
    def rep(m):
        g = m.groups()
        vtt = "." in m.group(0).split("-->")[0]
        a = max(to_ms(*g[0:4]) + delta, 0)
        b = max(to_ms(*g[4:8]) + delta, 0)
        return f"{fmt(a, vtt)} --> {fmt(b, vtt)}{g[8]}"
    return "\n".join(TS.sub(rep, ln) if "-->" in ln else ln
                     for ln in text.replace("\r\n", "\n").split("\n"))


def main(argv):
    opts = {"max_cps": 17.0, "max_line": 42, "max_lines": 2, "min_dur": 0.833, "max_dur": 7.0,
            "min_gap": 83, "json": False, "fail_on": "high", "shift": None}
    files = []
    it = iter(argv)
    try:
        for a in it:
            if a == "--json":
                opts["json"] = True
            elif a in ("--max-cps", "--min-dur", "--max-dur"):
                opts[a[2:].replace("-", "_")] = float(next(it))
            elif a in ("--max-line", "--max-lines", "--min-gap", "--shift"):
                opts[a[2:].replace("-", "_")] = int(next(it))
            elif a == "--fail-on":
                opts["fail_on"] = next(it).lower()
                if opts["fail_on"] not in LEVELS:
                    raise ValueError("--fail-on must be high, warn, or info")
            elif a in ("-h", "--help"):
                print(__doc__)
                return 0
            elif a.startswith("--"):
                raise ValueError(f"unknown option {a}")
            else:
                files.append(a)
    except (StopIteration, ValueError) as e:
        print(f"error: {e or 'option needs a value'}", file=sys.stderr)
        return 2
    if not files:
        print("error: give at least one .srt or .vtt file, or - for stdin", file=sys.stderr)
        return 2
    report, worst = [], -1
    for f in files:
        try:
            text = sys.stdin.read() if f == "-" else open(f, encoding="utf-8-sig").read()
        except (OSError, UnicodeDecodeError) as e:
            print(f"error: cannot read {f}: {e}", file=sys.stderr)
            return 2
        if opts["shift"] is not None:
            sys.stdout.write(shift_text(text, opts["shift"]))
            return 0
        cues, errors, is_vtt = parse(text)
        if not cues:
            print(f"error: {f}: no subtitle cues found (is this an SRT or WebVTT file?)", file=sys.stderr)
            return 2
        findings = check(cues, errors, opts, is_vtt)
        for x in findings:
            worst = max(worst, LEVELS[x["level"]])
        report.append({"file": f, "format": "vtt" if is_vtt else "srt", "stats": stats(cues, is_vtt), "findings": findings})
    if opts["json"]:
        print(json.dumps(report, indent=2))
    else:
        for r in report:
            counts = {lv: sum(1 for x in r["findings"] if x["level"] == lv) for lv in ("high", "warn", "info")}
            st = r["stats"]
            print(f"{r['file']} ({r['format'].upper()}): {st['cues']} cues, {st['first']} to {st['last_end']}, "
                  f"avg {st['avg_cps']} chars/s, avg {st['avg_duration_s']} s on screen")
            print(f"  HIGH {counts['high']}  WARN {counts['warn']}  INFO {counts['info']}")
            for x in sorted(r["findings"], key=lambda x: (-LEVELS[x["level"]], x["line"])):
                where = f"cue {x.get('cue', '-')} @ {x['time']}" if "time" in x else f"line {x['line']}"
                print(f"  {x['level'].upper():<4} {x['rule']:<16} {where}: {x['message']}")
            if not r["findings"]:
                print("  no problems found")
    return 1 if worst >= LEVELS[opts["fail_on"]] else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
```

Prompt from the public prompts.chat library (CC0), credited to its contributor.
