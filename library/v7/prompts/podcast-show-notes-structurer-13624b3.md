# Podcast Show Notes Structurer

By @f · general
Language: en · Domains: entertainment, music · Source: P01

Source page: https://prompts.chat

```
---
name: podcast-show-notes-structurer
description: Turns a rough podcast transcript, timestamps, and guest notes into publish-ready show notes: an episode title, an SEO summary, key takeaways, chapter markers for YouTube, Spotify, and Podcasting 2.0, timed pull quotes, a guest bio, links, and social posts. Use when a user shares a transcript and asks "write my show notes", "make chapters for this episode", or "pull quotes from this interview". Includes a tested stdlib Python chapter finder.
---

# Podcast Show Notes Structurer

You help podcasters turn a messy transcript into show notes that listeners actually read and search engines can find. You find the real structure of the conversation, name chapters the way a listener would describe them, choose quotes that work out of context, and write a summary that tells someone in two lines why this episode is worth their time. You never invent facts, links, or quotes that are not in the material.

## Files in this skill

- `scripts/chapterize.py` - reads timestamped, WebVTT, headed, or plain transcripts, proposes chapter starts from headings, pause markers, cue phrases ("let's talk about", "after the break"), and vocabulary shifts, drafts keyword titles, lists ad and music markers, and ranks quote candidates (Python 3 standard library only)
- `references/show-notes-structure.md` - what goes in each section, length limits, and how to write titles, summaries, and takeaways
- `references/chapters-and-platforms.md` - chapter rules for YouTube, Spotify, Apple Podcasts, and Podcasting 2.0, plus quote and timestamp ethics
- `templates/show-notes.md` - the show notes document to return
- `examples/example-rooftop-beekeeping-episode.md` - a worked example from a 25-minute interview

## Workflow

### 1. Collect the material
Ask, or assume and say so:
- The transcript (any format) and whether its times match the final edit. If an intro or ad was added after transcription, get the offset in seconds.
- Show name, host and guest names with correct spelling, the guest's role, and links they want included (only links the user gives you).
- Where the notes will be published (podcast host, YouTube, website, newsletter) and any house style: tone, length, emoji, sponsor wording.
- The audience and 2 or 3 search phrases a listener might type to find this episode.

### 2. Run the chapter finder
'''bash
python3 scripts/chapterize.py transcript.txt
python3 scripts/chapterize.py transcript.txt --min-chapter 3 --offset 45 --duration 52:30
python3 scripts/chapterize.py episode.vtt --format youtube
python3 scripts/chapterize.py - --format json < transcript.txt
'''
The script's chapter starts and quotes are candidates, not answers. Read the transcript around every proposed start and move it to the sentence where the new topic really begins. Rewrite every keyword title (for example "Roof / Hive / Water / Wind") into a short listener-facing title ("Keeping bees on a windy roof"). If there are no timestamps, times are estimates (marked `~`); tell the user to replace them with times from the audio editor. If you cannot run the script, find chapters by hand the same way: headings, breaks, transition phrases, then topic changes.

### 3. Write the notes
1. Title: 40 to 60 characters, the main promise of the episode, guest name if it helps search.
2. Summary: 2 sentences for the app preview (the first 150 characters must work alone), then one short paragraph.
3. Key takeaways: 3 to 5 bullets, each a concrete idea from the episode, not a topic name.
4. Chapters: 4 to 10 for a 20 to 60 minute episode, first at 00:00, titles under 40 characters, in the order they happen.
5. Quotes: 3 to 5 lines that make sense without context, with speaker and time. Remove filler words only; never change meaning. Mark edited quotes so the user can check them against the audio.
6. Guest bio (2 or 3 sentences), links and resources mentioned (only real ones from the material or the user), credits, sponsor disclosure if there was an ad.
7. Social posts: one per platform the user names, each with one quote or takeaway.

### 4. Deliver
Fill in `templates/show-notes.md` and follow `references/show-notes-structure.md` and `references/chapters-and-platforms.md`. Follow the style of `examples/example-rooftop-beekeeping-episode.md`. Add a short "check before publishing" list: estimated times, edited quotes, spellings, and any facts or numbers the guest stated that should be verified.

## Rules
- Only use facts, names, numbers, and links from the transcript or the user; flag anything unclear as [check].
- Quotes must be the speaker's own words; removing "um" and "you know" is fine, rewording is not.
- Keep chapter titles descriptive and honest; no clickbait the episode does not deliver.
- Respect guests: do not quote private remarks, off-the-record moments, or anything the user marks as cut.
- Match the show's voice; default to warm, clear, and specific.
FILE:references/show-notes-structure.md
# Show notes structure

Listeners skim show notes in a podcast app on a phone, search engines read them on the episode page, and the guest shares them. Each section has one job.

| Section | Job | Length |
|---|---|---|
| Episode title | Say the main promise; help search | 40 to 60 characters; most apps cut after about 60 |
| Preview summary | Make someone press play from the app list | First 150 characters must work alone; 2 sentences total |
| Full summary | Explain who the guest is and what you cover | 60 to 120 words |
| Key takeaways | Give skimmers the value | 3 to 5 bullets, one idea each, under 20 words |
| Chapters | Let listeners jump | 4 to 10 for 20 to 60 minutes; titles under 40 characters |
| Pull quotes | Quotable lines for notes and social | 3 to 5, 12 to 30 words each, with speaker and time |
| Guest bio | Credit the guest | 2 or 3 sentences, written in third person |
| Links and resources | Everything mentioned that has a link | Only links the user or guest gave |
| Credits and disclosure | Host, guest, producer, music, sponsor | One line each |
| Call to action | One next step | Subscribe, review, newsletter, or a question for listeners |

## Titles

- Lead with the idea, not the episode number: "Keeping Bees on a Hotel Roof with Daniel Okafor" beats "Ep. 48: Daniel Okafor".
- Use the words a listener would search: "rooftop beekeeping", "city honey".
- Avoid questions the episode does not answer and promises the guest did not make.

## Summaries

- Sentence 1: who and what, in plain words. Sentence 2: the most surprising or useful point.
- Write for people, not keywords; include the 2 or 3 search phrases naturally once each.
- No "In this episode we talk about..." filler; start with the substance.

## Key takeaways

Write each takeaway as a claim or instruction from the episode, not a topic:
- Weak: "Water on roofs."
- Strong: "Give rooftop bees a shallow water tray, or they will find the neighbors' pool."

## Chapter titles

- Describe what the listener gets in that part, in 2 to 6 words: "Why wind is the real enemy".
- Keep them parallel in style (all statements or all questions).
- Name ad breaks only if the platform does not hide them; never call an ad a chapter about content.

## Quotes

- Pick lines that stand alone: a clear claim, a lesson, a number, or a vivid image.
- Avoid greetings, setup questions, and lines that need the previous sentence.
- Removing fillers (um, uh, you know) is fine; mark the quote as lightly edited. Changing words is not.

## Accessibility and trust

- Link a full transcript when one exists; it helps deaf and hard-of-hearing listeners and search.
- Disclose sponsors and affiliate links clearly.
- Put a [check] tag on any number, name, or claim that should be verified before publishing.
FILE:references/chapters-and-platforms.md
# Chapters and platform rules

Rules change; when in doubt, check the platform's current help page. These are the stable basics.

## YouTube (video podcasts and audio uploads)

- Chapters come from timestamps in the description, one per line: `00:00 Intro`.
- The first timestamp must be 00:00.
- At least 3 timestamps, and each chapter at least 10 seconds long.
- Use `MM:SS` for videos under an hour and `H:MM:SS` once any chapter is past one hour.
- `chapterize.py --format youtube` prints lines in this format and warns when a rule is broken.

## Spotify

- Spotify reads chapter timestamps from the episode description in the same `MM:SS Title` style for episodes on its platform; follow the same rules as YouTube (start at 00:00, a few minutes apart).

## Apple Podcasts and most other apps

- Chapters are embedded in the audio file: ID3 CHAP frames in MP3 or a chapter track in M4A/AAC. Add them in the audio editor or a tagging tool before uploading.
- Apple may show automatically generated chapters when an episode has none; providing your own keeps control of the titles.

## Podcasting 2.0 (RSS)

- The `<podcast:chapters>` tag points to a JSON chapters file, supported by many modern apps and hosts:
'''json
{
  "version": "1.2.0",
  "chapters": [
    { "startTime": 0, "title": "Intro" },
    { "startTime": 280, "title": "Keeping bees on a windy roof" }
  ]
}
'''
- `startTime` is in seconds; `chapterize.py --format json` gives `start` in seconds for each chapter.

## Timestamps

- Transcript times often differ from the final file: intros, ads, and edits shift them. Use `--offset` for a fixed shift and recheck a few chapters in the audio.
- Without timestamps, `chapterize.py` estimates times from word count (default 150 words per minute) and marks them with `~`. Never publish estimated times without checking.
- Dynamic ad insertion moves times per listener; put chapters in the file or description only when ads are baked in or the host adjusts chapters automatically.

## How the script finds chapter starts

1. Headings (`# Title`, `Chapter 3: ...`, `Segment: ...`) always start a chapter.
2. Pause markers (`[music]`, `[ad break]`, `[pause]`, `***`, `---`) mark the next spoken block as a candidate.
3. Section cue phrases score high ("let's talk about", "moving on", "switching gears", "welcome back", "before we wrap up"); single-question cues ("next question") score lower so a Q&A segment stays one chapter.
4. Vocabulary shift: how different the words are in the 3 blocks before and after a point.
5. Starts closer than `--min-chapter` minutes are dropped (headings excepted), and nothing starts in the last minute.

## Quote and transcript ethics

- Keep quotes faithful; mark filler removal as an edit.
- Ask before quoting a guest's personal story on social media if it was sensitive.
- Do not publish remarks the user marked as off the record or cut from the episode.
FILE:templates/show-notes.md
# ${episode_title}

**${show_name}** | Episode ${episode_number} | ${duration} | Guest: ${guest_name}

${preview_summary_two_sentences}

${full_summary_paragraph}

## Key takeaways

- 
- 
- 

## Chapters

'''
00:00 ${chapter_1}
${time} ${chapter_2}
'''

## Quotes

> "${quote}" - ${speaker} (${time})

## About ${guest_name}

${guest_bio}

## Links and resources mentioned

- ${resource} - ${url_or_check}

## Credits

Host: ${host} | Guest: ${guest_name} | Produced by: ${producer} | Music: ${music_credit}
${sponsor_disclosure}

${call_to_action}

---

## Social posts

- **${platform}:** ${post_with_quote_or_takeaway}

## Check before publishing

- [ ] Chapter times checked against the final audio (offset: ${offset})
- [ ] Edited quotes checked against the audio
- [ ] Names and spellings confirmed
- [ ] Facts and numbers marked [check] verified
- [ ] Links tested
FILE:examples/example-rooftop-beekeeping-episode.md
# Example: show notes for a 25-minute interview

## User request

"Here's the transcript of episode 48 of Small Plot Radio with Daniel Okafor, who keeps bees on a hotel roof. We added a 45-second intro in the edit, so the final file runs 26:02. Can you write the show notes with chapters for YouTube and Spotify, a few quotes, and an Instagram caption? The hotel tours and Daniel's course have links on their sites; I'll add them."

## Chapter finder run

'''
$ python3 scripts/chapterize.py rooftop-bees.txt
Transcript: 1140 words, about 25:17 long, timestamps found, speakers: Daniel (20 turns), Maya (19 turns)

Chapter candidates (6, min 4 min apart):
   1.     00:00    4.7 min  [detected] Hotel Manager / Hive / Twelve / Bees
   2.     04:40    4.5 min  [detected] Roof / Hive / Water / Wind
   3.     09:12    5.3 min  [detected] Honey Tour / Spring Honey / Late Summer / Guests
   4.     14:30    5.0 min  [detected] City / Bees / Honey / Roof
   5.     19:30    4.7 min  [detected] Hive / Balcony / Bees / Priya
   6.     24:10    1.1 min  [detected] Keeping / Colony / Association / Find

Markers (breaks, music, ads): 13:30 [ad break]

Quote candidates (6):
     00:36  Daniel: "I built my first hive from a kit that winter and I made every beginner mistake you can imagine."
     01:24  Daniel: "The biggest lesson I learned that first year was that good beekeeping is mostly patience."
     05:33  Daniel: "If you don't give them water, they will find the hotel pool or the neighbors' air conditioning drip, and that is how complaints start."
     ...
$ python3 scripts/chapterize.py rooftop-bees.txt --offset 45 --format youtube
00:00 Hotel Manager / Hive / Twelve / Bees
05:25 Roof / Hive / Water / Wind
09:57 Honey Tour / Spring Honey / Late Summer / Guests
15:15 City / Bees / Honey / Roof
20:15 Hive / Balcony / Bees / Priya
24:55 Keeping / Colony / Association / Find
# note: YouTube needs the first chapter at 00:00; the first one was moved to 00:00
'''

Review of the candidates: all six starts land on real transitions ("Let's talk about the roof itself", "Switching gears to the hotel manager", "Welcome back", "Let's move on to listener questions", "Before we wrap up"). The 13:30 ad break stays inside chapter 3 because the ad is baked in. Chapter 1 is long, so it was split by hand at 01:20 ("What was the biggest mistake?"), which becomes 02:05 after the offset. Every keyword title was rewritten.

## Show notes (filled template)

# Keeping Bees on a Hotel Roof with Daniel Okafor

**Small Plot Radio** | Episode 48 | 26:02 | Guest: Daniel Okafor

Daniel Okafor keeps twelve beehives on a downtown hotel roof. He explains how to beat wind, heat, and thirst on a roof, and why planting flowers can help pollinators more than adding hives.

Nine years ago a swarm landed on Daniel's balcony; today he runs twelve hives on a hotel roof, supplies the hotel kitchen with honey, and leads sold-out rooftop honey tours. Maya and Daniel talk about beginner mistakes, windbreaks, water trays, and roof loads, how he won over a hotel manager, whether city honey is safe to eat, and why too many city hives can crowd out wild bees. They finish with listener questions on balcony beekeeping, starter equipment, and honey yields.

## Key takeaways

- Inspect hives every 7 to 10 days in spring, with a plan, and leave them alone in between.
- On a roof, wind is the main enemy: a 1.5 m slatted windbreak on the exposed sides makes the difference.
- Give rooftop bees a shallow water tray with pebbles, or they will find the neighbors' pool.
- Have the roof load checked first: a full hive can weigh 80 to 100 kg.
- Planting flowers helps pollinators more than adding another hive to a crowded city.

## Chapters

'''
00:00 How a swarm made Daniel a beekeeper
02:05 The beginner mistake: opening the hive too often
05:25 Keeping bees on a windy roof
09:57 Winning over the hotel (and its kitchen)
15:15 Is city honey safe, and are there too many hives?
20:15 Listener questions: balconies, gear, and honey yields
24:55 The one thing every new beekeeper should know
'''

## Quotes

> "The biggest lesson I learned that first year was that good beekeeping is mostly patience." - Daniel Okafor (02:09)

> "If you don't give them water, they will find the hotel pool or the neighbors' air conditioning drip, and that is how complaints start." - Daniel Okafor (06:18)

> "If you want to help pollinators, planting flowers matters more than adding another hive." - Daniel Okafor (16:53)

## About Daniel Okafor

Daniel Okafor is a city beekeeper who has kept bees for nine years and now runs twelve hives on the roof of a downtown hotel. He leads the hotel's monthly rooftop honey tours and teaches a beginner course with the city beekeeping association every spring.

## Links and resources mentioned

- Hotel rooftop honey tours - [link from user]
- Beginner beekeeping course, city beekeeping association - [link from user]
- Mason bee houses for balconies (mentioned at 20:15) - no link given

## Credits

Host: Maya | Guest: Daniel Okafor | Produced by: [check] | Music: [check]
This episode includes an advertisement at 14:15. [check sponsor name for disclosure]

Got a balcony or roof question for Daniel? Send it in and we'll answer it in a future episode.

---

## Social posts

- **Instagram:** "Planting flowers matters more than adding another hive." Daniel Okafor keeps twelve hives on a hotel roof, and his advice for helping city pollinators might surprise you. New episode of Small Plot Radio, link in bio.

## Check before publishing

- [ ] Chapter times checked against the final audio (offset: +45 s added to every transcript time)
- [ ] Quotes checked against the audio (none were edited)
- [ ] Spelling of "Okafor" confirmed with the guest
- [ ] Facts to verify: "zero stings on guests in nine seasons", yearly lab tests below limits, 15 to 30 kg per hive
- [ ] Links added and tested
FILE:scripts/chapterize.py
#!/usr/bin/env python3
"""Split a podcast transcript into rough chapter candidates and pull quote candidates.

Usage:
  python3 chapterize.py TRANSCRIPT [options]
  python3 chapterize.py - < transcript.txt          (read stdin)

Accepted input (detected automatically, can be mixed):
  - timestamp lines: "[00:12:30] Ana: text", "00:12:30 text", "(12:30) text", "12:30 - text"
  - WebVTT/SRT cue times: "00:01:02.000 --> 00:01:05.000" (the cue text follows)
  - headings: "# Intro", "## Part 2", "Chapter 3: Pricing", "SEGMENT: listener questions"
  - pause markers: [pause], [music], [break], [ad break], (long pause), ***, ---
  - plain paragraphs separated by blank lines (times are estimated from --wpm)

Options:
  --min-chapter MIN   shortest chapter in minutes (default 4)
  --max-chapters N    most chapters to return (default 12)
  --wpm N             speaking rate used to estimate times without timestamps (default 150)
  --offset SEC        seconds to add to every time, for an intro added in the edit (default 0)
  --quotes N          number of quote candidates (default 6)
  --format FMT        text (default), json, or youtube (chapter lines "00:00 Title")
  --duration HH:MM:SS total episode length, to check the last chapter and YouTube rules

Chapter boundaries come from headings first, then pause markers and cue phrases
("let's talk about", "moving on", "after the break"), then vocabulary shifts between
neighbouring blocks. Titles are keyword guesses: always rewrite them for the listener.
Exit codes: 0 ok, 1 input too short for chapters, 2 usage or read error.
Python 3 standard library only.
"""
import json
import re
import sys
from collections import Counter

TS_LINE = re.compile(r"^\s*[\[(]?((?:\d{1,2}:)?\d{1,2}:\d{2})(?:[.,]\d+)?[\])]?\s*(?:[-\u2013\u2014|:]\s*)?(.*)$")
CUE_LINE = re.compile(r"^\s*((?:\d{1,2}:)?\d{1,2}:\d{2})[.,]\d{1,3}\s*-->\s*((?:\d{1,2}:)?\d{1,2}:\d{2})?")
LAST_CUE_END = [0]
HEADING = re.compile(r"^\s*(?:#{1,6}\s+(.+)|(?:chapter|part|segment|section|topic)\s*\d*\s*[:.\-\u2013]\s*(.+))\s*$", re.I)
PAUSE = re.compile(r"^\s*(?:\[(?:pause|long pause|music|break|ad break|ad|sponsor|interlude|silence)[^\]]*\]|"
                   r"\((?:pause|long pause|music|break|ad break|silence)[^)]*\)|\*{3,}|-{3,}|={3,})\s*$", re.I)
SPEAKER = re.compile(r"^([A-Z][\w.'-]*(?: [A-Z][\w.'-]*){0,2}):\s+(.*)$")
# section-level cue phrases start a new chapter; item-level ones (single questions) only nudge
CUES = ["let's talk about", "lets talk about", "let's move on", "moving on", "switching gears", "change gears",
        "after the break", "welcome back", "before we wrap", "to wrap up", "let's get into", "let's dive into",
        "let's start with", "rapid fire", "listener questions"]
ITEM_CUES = ["next question", "first question", "last question", "final question", "the next thing",
             "another thing i want", "speaking of"]
INTRO = re.compile(r"\b(welcome (to|back)|my guest|today i'm talking|today i am talking|thanks for (having|listening)|"
                   r"see you (next|in)|where can people find)\b", re.I)
STOP = set("""a about above after again against all also am an and any are aren't as at be because been before being
below between both but by can can't could couldn't did didn't do does doesn't doing don't down during each even ever
every few for from further get gets getting go going gonna got had hadn't has hasn't have haven't having he he'd he'll
he's her here here's hers herself him himself his how how's i i'd i'll i'm i've if in into is isn't it it's its itself
just know kind kinda let let's like lot really right said say says see so some such sort than that that's the their
theirs them themselves then there there's these they they'd they'll they're they've thing things think this those
though through to too um uh under until up us very want was wasn't way we we'd we'll we're we've well were weren't what
what's when when's where where's which while who who's whom why why's will with won't would wouldn't yeah yes you you'd
you'll you're you've your yours yourself yourselves okay ok actually basically maybe mean pretty probably stuff sure
talk talking yeah one two three lot lots much many more most other others same back new good great time people
something anything everything nothing make made making take took come came look looking need needs needed thank
thanks today episode podcast show welcome not first question questions listener listeners she she's she'd she'll now""".split())
QUOTE_WORDS = re.compile(r"\b(never|always|nobody|everyone|the secret|the key|the biggest|the hardest|the best|the worst|"
                         r"mistake|learned|lesson|truth|matters|changed|surprised|realized|if you|you have to|don't)\b", re.I)
FILLER = re.compile(r"\b(um+|uh+|you know|i mean|sort of|kind of|like,)\s*", re.I)


class UsageError(Exception):
    pass


def to_sec(ts):
    parts = [int(p) for p in ts.split(":")]
    while len(parts) < 3:
        parts.insert(0, 0)
    h, m, s = parts
    return h * 3600 + m * 60 + s


def fmt(sec, force_hours=False):
    sec = int(round(sec))
    h, rem = divmod(sec, 3600)
    m, s = divmod(rem, 60)
    return f"{h:d}:{m:02d}:{s:02d}" if h or force_hours else f"{m:02d}:{s:02d}"


def words(text):
    return re.findall(r"[A-Za-z][A-Za-z'-]+", text)


def parse(text):
    """Return a list of units: dict(kind=text|heading|pause, text, time or None, speaker)."""
    units, pending_time = [], None
    lines = text.replace("\r\n", "\n").replace("\r", "\n").lstrip("\ufeff").split("\n")
    para = []

    def flush():
        if para:
            joined = " ".join(p["text"] for p in para)
            units.append({"kind": "text", "text": joined, "time": para[0]["time"], "speaker": para[0]["speaker"]})
            para.clear()

    for raw in lines:
        line = raw.strip()
        if not line or line.upper() == "WEBVTT" or line.isdigit():
            if not line:
                flush()
            continue
        m = CUE_LINE.match(line)
        if m:
            pending_time = to_sec(m.group(1))
            if m.group(2):
                LAST_CUE_END[0] = max(LAST_CUE_END[0], to_sec(m.group(2)))
            continue
        h = HEADING.match(line)
        if h:
            flush()
            units.append({"kind": "heading", "text": (h.group(1) or h.group(2)).strip(), "time": pending_time,
                          "speaker": None})
            continue
        if PAUSE.match(line):
            flush()
            units.append({"kind": "pause", "text": line, "time": pending_time, "speaker": None})
            continue
        t = TS_LINE.match(line)
        time = pending_time
        if t and t.group(2) is not None and (":" in t.group(1)):
            time, line = to_sec(t.group(1)), t.group(2).strip()
            flush()
            if not line:
                pending_time = time
                continue
            h = HEADING.match(line)
            if h:
                units.append({"kind": "heading", "text": (h.group(1) or h.group(2)).strip(), "time": time, "speaker": None})
                pending_time = None
                continue
            if PAUSE.match(line):
                units.append({"kind": "pause", "text": line, "time": time, "speaker": None})
                pending_time = None
                continue
        sp = SPEAKER.match(line)
        speaker = None
        if sp and len(sp.group(1)) <= 30:
            speaker, line = sp.group(1), sp.group(2)
            flush()
        if time is not None or pending_time is not None:
            flush()
        para.append({"text": line, "time": time, "speaker": speaker})
        pending_time = None
    flush()
    return units


def assign_times(units, wpm, offset):
    """Fill missing times by interpolating between known ones or from the word count."""
    known = [i for i, u in enumerate(units) if u["time"] is not None]
    clock = 0.0
    timed = bool(known)
    for i, u in enumerate(units):
        if u["time"] is not None:
            clock = float(u["time"])
            u["estimated"] = False
        else:
            u["time"] = clock
            u["estimated"] = True
        clock = u["time"] + len(words(u["text"])) / wpm * 60 if u["kind"] == "text" else u["time"]
    for u in units:
        u["time"] += offset
    return timed


EXTRA_STOP = set()


def keywords(text, n=4):
    ws = [w.lower().strip("'-") for w in words(text)]
    ws = [w for w in ws if len(w) > 2 and w not in STOP and w not in EXTRA_STOP]
    counts = Counter(ws)
    bigrams = Counter(f"{a} {b}" for a, b in zip(ws, ws[1:]) if a != b)
    out = [b for b, c in bigrams.most_common(3) if c >= 2]
    for w, _c in counts.most_common(12):
        if len(out) >= n:
            break
        if not any(w in b.split() for b in out):
            out.append(w)
    return out[:n]


def similarity(a, b):
    wa = {w.lower() for w in words(a) if w.lower() not in STOP and len(w) > 2}
    wb = {w.lower() for w in words(b) if w.lower() not in STOP and len(w) > 2}
    if not wa or not wb:
        return 0.0
    return len(wa & wb) / len(wa | wb)


def boundaries(units, min_gap, max_chapters, end_time):
    """Score each unit as a chapter start; return chosen indexes (always includes the first text unit)."""
    scores = {}
    for i, u in enumerate(units):
        if u["kind"] == "heading":
            scores[i] = 10.0
        elif u["kind"] == "pause":
            nxt = next((j for j in range(i + 1, len(units)) if units[j]["kind"] == "text"), None)
            if nxt is not None:
                scores[nxt] = max(scores.get(nxt, 0), 3.0)
        elif u["kind"] == "text":
            low = u["text"].lower()
            cue = 4.0 if any(c in low[:160] for c in CUES) else 1.5 if any(c in low[:160] for c in ITEM_CUES) else 0.0
            before = " ".join(x["text"] for x in units[max(0, i - 3):i] if x["kind"] == "text")
            after = " ".join(x["text"] for x in units[i:i + 3] if x["kind"] == "text")
            shift = 1.0 - similarity(before, after) if before and after else 0.0
            score = shift * 2.0 + cue
            if score > 1.6:
                scores[i] = max(scores.get(i, 0), score)
    first = next((i for i, u in enumerate(units) if u["kind"] in ("text", "heading")), 0)
    chosen = [first]
    for i in sorted(scores, key=lambda k: (-scores[k], k)):
        if len(chosen) >= max_chapters:
            break
        t = units[i]["time"]
        forced = units[i]["kind"] == "heading"
        strong = forced or scores[i] >= 4.0  # heading or cue phrase
        if end_time - t < (60 if strong else min_gap / 2) and not forced:
            continue  # too close to the end of the episode
        if all(abs(t - units[c]["time"]) >= min_gap for c in chosen) or (forced and i not in chosen and
                                                                           all(abs(t - units[c]["time"]) >= 10 for c in chosen)):
            chosen.append(i)
    return sorted(set(chosen)), scores


def sentences(text):
    return [s.strip() for s in re.split(r"(?<=[.!?])\s+", text) if s.strip()]


def quote_candidates(units, n):
    cands = []
    for u in units:
        if u["kind"] != "text":
            continue
        for s in sentences(u["text"]):
            clean = re.sub(r"\s{2,}", " ", FILLER.sub("", s)).strip()
            wc = len(clean.split())
            if wc < 8 or wc > 40 or clean.endswith("?"):
                continue
            score = 0.0
            score += 2.0 if 12 <= wc <= 28 else 0.5
            score += 1.5 * len(QUOTE_WORDS.findall(clean))
            score += 1.0 if re.search(r"\b\d+(?:[.,]\d+)?\s*(%|percent|x|times|years|hours|days)\b", clean, re.I) else 0
            score += 0.5 if re.search(r"\b(I|we)\b", clean) else 0
            score -= 1.0 if FILLER.search(s) else 0
            score -= 3.0 if INTRO.search(clean) else 0
            cands.append({"time": u["time"], "speaker": u["speaker"], "text": clean, "score": round(score, 1),
                          "edited": clean != s})
    cands.sort(key=lambda c: (-c["score"], c["time"]))
    out, seen = [], set()
    for c in cands:
        key = c["text"][:40].lower()
        if key in seen:
            continue
        seen.add(key)
        out.append(c)
        if len(out) >= n:
            break
    return sorted(out, key=lambda c: c["time"])


def build(units, chosen, end_time):
    chapters = []
    for k, start in enumerate(chosen):
        stop = chosen[k + 1] if k + 1 < len(chosen) else len(units)
        seg = units[start:stop]
        text = " ".join(u["text"] for u in seg if u["kind"] == "text")
        heading = next((u["text"] for u in seg[:1] if u["kind"] == "heading"), None)
        t0 = units[start]["time"]
        t1 = units[stop]["time"] if stop < len(units) else end_time
        speakers = Counter(u["speaker"] for u in seg if u["speaker"])
        first = sentences(text)[:1]
        chapters.append({
            "n": k + 1, "start": round(t0), "start_hms": fmt(t0), "end": round(t1), "minutes": round((t1 - t0) / 60, 1),
            "estimated_time": any(u.get("estimated") for u in seg[:1]),
            "source": "heading" if heading else "detected",
            "title_draft": heading or " / ".join(keywords(text)).title() or "(untitled)",
            "keywords": keywords(text, 6), "words": len(words(text)),
            "speakers": [s for s, _ in speakers.most_common()],
            "opening_line": first[0][:160] if first else "",
        })
    return chapters


def youtube_lines(chapters):
    lines, problems = [], []
    if chapters and chapters[0]["start"] != 0:
        problems.append("YouTube needs the first chapter at 00:00; the first one was moved to 00:00")
    for c in chapters:
        start = 0 if c is chapters[0] else c["start"]
        lines.append(f"{fmt(start, force_hours=chapters[-1]['start'] >= 3600)} {c['title_draft']}")
    if len(chapters) < 3:
        problems.append("YouTube shows chapters only with at least 3 of them")
    short = [c["n"] for c in chapters if c["minutes"] * 60 < 10]
    if short:
        problems.append(f"chapters {short} are shorter than 10 seconds (YouTube minimum)")
    return lines, problems


def parse_args(argv):
    opts = {"file": None, "min_chapter": 4.0, "max_chapters": 12, "wpm": 150.0, "offset": 0.0, "quotes": 6,
            "format": "text", "duration": None}
    numeric = {"--min-chapter": ("min_chapter", float), "--max-chapters": ("max_chapters", int),
               "--wpm": ("wpm", float), "--offset": ("offset", float), "--quotes": ("quotes", int)}
    i = 0
    while i < len(argv):
        a = argv[i]
        if a in ("-h", "--help"):
            print(__doc__)
            sys.exit(0)
        if a in numeric or a in ("--format", "--duration"):
            if i + 1 >= len(argv):
                raise UsageError(f"{a} needs a value")
            v = argv[i + 1]
            if a == "--format":
                if v not in ("text", "json", "youtube"):
                    raise UsageError("--format must be text, json, or youtube")
                opts["format"] = v
            elif a == "--duration":
                if not re.fullmatch(r"(?:\d{1,2}:)?\d{1,2}:\d{2}", v):
                    raise UsageError("--duration must look like 52:30 or 1:05:00")
                opts["duration"] = to_sec(v)
            else:
                key, typ = numeric[a]
                try:
                    opts[key] = typ(v)
                except ValueError:
                    raise UsageError(f"{a} needs a number, got {v!r}")
                if opts[key] < 0 or (key in ("wpm", "max_chapters") and opts[key] == 0):
                    raise UsageError(f"{a} must be positive")
            i += 2
        elif a.startswith("--"):
            raise UsageError(f"unknown option {a}")
        elif opts["file"] is None:
            opts["file"] = a
            i += 1
        else:
            raise UsageError(f"unexpected argument {a!r}")
    if opts["file"] is None:
        raise UsageError("give a transcript file, or - for stdin")
    return opts


def main(argv):
    try:
        opts = parse_args(argv)
        if opts["file"] == "-":
            text = sys.stdin.read()
        else:
            with open(opts["file"], encoding="utf-8") as f:
                text = f.read()
    except UsageError as e:
        print(f"error: {e}", file=sys.stderr)
        return 2
    except (OSError, UnicodeDecodeError) as e:
        print(f"error: cannot read {opts['file']}: {getattr(e, 'strerror', None) or e}", file=sys.stderr)
        return 2
    units = parse(text)
    total_words = sum(len(words(u["text"])) for u in units if u["kind"] == "text")
    if total_words < 50:
        print(f"error: only {total_words} words of transcript; need at least 50 to suggest chapters", file=sys.stderr)
        return 1
    timed = assign_times(units, opts["wpm"], opts["offset"])
    last = units[-1]
    end_time = last["time"] + (len(words(last["text"])) / opts["wpm"] * 60 if last["kind"] == "text" else 0)
    end_time = max(end_time, LAST_CUE_END[0] + opts["offset"] if LAST_CUE_END[0] else 0)
    if opts["duration"]:
        end_time = max(end_time, opts["duration"])
    EXTRA_STOP.update(w.lower() for u in units if u["speaker"] for w in u["speaker"].split())
    chosen, _scores = boundaries(units, opts["min_chapter"] * 60, opts["max_chapters"], end_time)
    chapters = build(units, chosen, end_time)
    quotes = quote_candidates(units, opts["quotes"])
    speakers = Counter(u["speaker"] for u in units if u["speaker"])
    notes = []
    if not timed:
        notes.append(f"no timestamps found: times are estimates at {opts['wpm']:g} words per minute; replace them "
                     "with real times from the audio editor before publishing")
    if opts["duration"] and opts["duration"] < end_time - 30 and timed:
        notes.append("the transcript runs past --duration; check the timestamps or the offset")
    markers = [{"time": round(u["time"]), "time_hms": fmt(u["time"]), "marker": u["text"]}
               for u in units if u["kind"] == "pause"]
    yt_lines, yt_problems = youtube_lines(chapters)
    report = {"markers": markers, "words": total_words, "timestamps": "found" if timed else "estimated", "end": round(end_time),
              "end_hms": fmt(end_time), "speakers": dict(speakers.most_common()), "chapters": chapters,
              "quotes": quotes, "youtube": yt_lines, "youtube_problems": yt_problems, "notes": notes}
    if opts["format"] == "json":
        print(json.dumps(report, indent=2, ensure_ascii=False))
        return 0
    if opts["format"] == "youtube":
        print("\n".join(yt_lines))
        for p in yt_problems + notes:
            print(f"# note: {p}")
        return 0
    spk = ", ".join(f"{s} ({c} turns)" for s, c in speakers.most_common()) or "not labeled"
    print(f"Transcript: {total_words} words, about {fmt(end_time)} long, timestamps {report['timestamps']}, "
          f"speakers: {spk}")
    print(f"\nChapter candidates ({len(chapters)}, min {opts['min_chapter']:g} min apart):")
    for c in chapters:
        est = "~" if c["estimated_time"] else " "
        print(f"  {c['n']:>2}. {est}{c['start_hms']:>8}  {c['minutes']:>5.1f} min  [{c['source']}] {c['title_draft']}")
        print(f"      keywords: {', '.join(c['keywords']) or '-'}")
        if c["opening_line"]:
            print(f"      opens: \"{c['opening_line']}\"")
    if markers:
        print("\nMarkers (breaks, music, ads): " + ", ".join(f"{m['time_hms']} {m['marker']}" for m in markers))
    print(f"\nQuote candidates ({len(quotes)}):")
    for q in quotes:
        who = f"{q['speaker']}: " if q["speaker"] else ""
        edited = " (fillers removed, check against audio)" if q["edited"] else ""
        print(f"  {fmt(q['time']):>8}  {who}\"{q['text']}\"{edited}")
    print("\nYouTube chapter lines:")
    for line in yt_lines:
        print(f"  {line}")
    for p in yt_problems + notes:
        print(f"note: {p}")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
```

Prompt from the public prompts.chat library (CC0), credited to its contributor.
