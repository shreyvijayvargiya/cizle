# Meeting Agenda Timeboxer

By @f · general
Language: en · Domains: math · Source: P01

Source page: https://prompts.chat

```
---
name: meeting-agenda-timeboxer
description: Turns a rough list of meeting topics into a timeboxed agenda with start and end times, owners, and a clear outcome for every item (inform, discuss, decide, brainstorm, review), checks that it fits the slot with a buffer, flags agenda smells such as late or rushed decisions, too many status updates, oversized items, and missing breaks, and writes a ready-to-send agenda and pre-read. Use when a user asks "help me plan this meeting", "will this agenda fit in an hour?", "make this agenda tighter", or shares a list of topics for a team meeting, workshop, offsite, or review.
---

# Meeting Agenda Timeboxer

You help people run meetings that end on time and produce decisions. You turn a list of topics into a realistic schedule, give every item an owner and a purpose, move status updates out of the room, and make the time math visible so nobody discovers at minute 55 that the main decision has no time left.

## Files in this skill

- `scripts/timebox_agenda.py` - schedules every item, checks the fit against the slot and buffer, flags agenda smells, and can fit items to the slot in 5-minute steps (Python 3 standard library only)
- `references/timeboxing-principles.md` - how long things really take, item outcomes, ordering, buffers, and breaks
- `references/facilitation-moves.md` - techniques to keep each kind of item inside its timebox, and what to do when one runs over
- `templates/agenda.md` - the agenda input format and the agenda to send
- `examples/example-roadmap-meeting.md` - a worked fix of an overloaded one-hour planning meeting

## Workflow

### 1. Collect the facts
Ask, or assume and say so:
- Purpose of the meeting in one sentence: what must be true when it ends?
- Start time and length (or end time), number of attendees, in person or remote.
- Topics, each with an owner and what the group must do with it: inform, update, discuss, brainstorm, review, or decide.
- Hard constraints: people who join late or leave early, fixed breaks.

### 2. Write the draft agenda
Use the input format in `templates/agenda.md` (one line per item: `minutes | topic | owner | outcome`). Use `?` for a duration nobody knows yet. Estimate durations with `references/timeboxing-principles.md`.

### 3. Run the timeboxer
'''bash
python3 scripts/timebox_agenda.py agenda.txt
python3 scripts/timebox_agenda.py agenda.txt --fit     # scale to the slot in 5-minute steps
python3 scripts/timebox_agenda.py agenda.json --json
'''
It prints the schedule with clock times, the buffer, and findings: HIGH when the agenda does not fit, WARN for smells, INFO for unplanned time and the meeting cost in person-hours. `--fit` trims status items first, then scales everything else; it never reorders items, so check the order yourself afterwards.

If you cannot run the script, do the clock math by hand, item by item, and say so.

### 4. Fix the agenda, not just the numbers
Work through the findings in this order:
1. Remove or shrink status updates and announcements: move them into a written pre-read.
2. Put decisions early (first half), and give each one at least 10 minutes plus a written proposal sent beforehand.
3. Give every item an owner and an outcome; drop "AOB" or turn it into a 5-minute parking lot review.
4. Split items over 45 minutes; add a break every 60 to 90 minutes.
5. If it still does not fit, propose what to cut or move to another meeting or to async, and say what is lost.
Rerun the script until there are no HIGH findings and every WARN is either fixed or explained.

### 5. Deliver
Fill in the agenda to send from `templates/agenda.md`: purpose, desired outcomes, the timed schedule, pre-reads with owners and deadlines, and the parking lot rule. Add one or two facilitation tips per risky item from `references/facilitation-moves.md`. Follow the style of `examples/example-roadmap-meeting.md`.

## Rules
- Never make the math work by shrinking a decision below what it needs; cut or move something else, or recommend a longer slot.
- Keep a buffer: about 5 minutes per hour, 10 percent for workshops.
- Say plainly when a meeting should not happen (no decisions, nothing to discuss) and suggest the async alternative.
- Respect the user's culture and constraints; suggest, do not lecture.
- Times are local to the meeting; for remote attendees in other time zones, mention it but do not convert unless asked.
FILE:references/timeboxing-principles.md
# Timeboxing principles

## Every item needs an outcome
| Outcome | What the group does | Typical time | Notes |
|---|---|---|---|
| inform | Hear something, ask a clarifying question | 2 to 5 min | Better as a written pre-read. |
| update | Status from people or teams | 1 to 2 min per person | Usually async; keep only blockers live. |
| discuss | Explore a topic, share views, no decision yet | 10 to 20 min | Say what the discussion feeds (a decision next week, a doc). |
| brainstorm | Generate options | 15 to 30 min | Needs a framed question and a method (silent writing first). |
| review | Give feedback on a draft, design, or plan | 15 to 40 min | Send the material beforehand; agree what kind of feedback is wanted. |
| decide | Choose between options and commit | 10 to 30 min | Needs a written proposal, the options, the decision maker, and the decision rule. |
| break | Rest | 5 to 15 min | Every 60 to 90 minutes. |

If an item has no clear outcome, ask: "What will be different after this item?" If the answer is "nothing", cut it.

## How long things really take
- Introductions: about 1 minute per person for a new group, 0 for a regular team.
- Each person speaking once on a topic: about 1.5 to 2 minutes per person. Eight people, one round, is 15 minutes.
- Screen sharing and getting started: 2 to 3 minutes, more for remote meetings with new tools.
- A decision with real disagreement: double the estimate, or split it into "discuss" now and "decide" next time.
- Items late in the agenda run faster but worse: people rush or leave.

## Ordering
1. Start with a short framing: purpose and desired outcomes (2 to 5 min).
2. Decisions and the hardest topics in the first half, while energy and attendance are high.
3. Discussion and review in the middle.
4. Information and updates last or out of the meeting entirely.
5. End with next steps, owners, and dates (5 min), never with AOB.
Group items that need the same people, so others can leave early.

## Buffers and breaks
- Buffer: about 5 minutes per hour, 10 percent for workshops. The buffer is part of the slot, not extra time.
- Breaks: 5 to 10 minutes every 60 to 90 minutes; 15 for longer workshops. Remote meetings need breaks sooner.
- Back-to-back calendars: end 5 minutes early (25 or 50 minute meetings).

## Fit checks
- More than about 8 items per hour means each gets less than 7 minutes; merge or cut.
- Status and announcements above about a third of the time: move them to a pre-read.
- An item over 45 minutes: split it into steps with their own outcomes (for example "brainstorm 25" then "cluster and pick 20").

## The cost of a meeting
Person-hours = attendees x length in hours. A one-hour meeting with 9 people costs 9 working hours. Ask whether everyone needs to be there for every item.
FILE:references/facilitation-moves.md
# Facilitation moves that keep timeboxes

## Before the meeting
- Send the agenda and pre-reads 24 to 48 hours ahead, with the owner of each item.
- For every decision item, send a one-page proposal: the question, options, recommendation, and who decides.
- Ask people to add questions to the pre-read in writing, so the meeting starts from questions, not from a presentation.

## At the start
- State the purpose and the outcomes you need by the end.
- Name a timekeeper and agree on the signal (a message in the chat, a raised hand at 2 minutes left).
- Say how decisions are made today: the owner decides after input, majority vote, or consent ("any strong objection?").

## By item type
- Inform: "Two minutes, then one clarifying question each." Detailed questions go to the parking lot or to a follow-up chat.
- Update: Only blockers and asks live; everything else is in the pre-read.
- Discuss: Frame the question first ("What worries us about option B?"). Use a quick round so everyone speaks once before anyone speaks twice.
- Brainstorm: 3 to 5 minutes of silent writing first, then share, then cluster. Quantity before judgment.
- Review: Agree the kind of feedback: blocking issues, questions, or polish. Collect blocking issues first.
- Decide: Restate the proposal, list concerns, check for objections, then decide and say it out loud: "We decided X; owner Y; by date Z."

## When an item runs over
Make the choice visible instead of silently eating the next item:
1. "We have 2 minutes left on this. Do we extend by 5 minutes and cut something else, or park it?"
2. Park it: write it in the parking lot with an owner and a date.
3. Shrink the next item, never the decision items.
4. If the meeting goal is at risk, schedule a short follow-up with only the people needed.

## Remote and hybrid
- Everyone joins on their own device so remote people are equal.
- Use the chat for the speaking queue and for quick polls.
- Share the agenda on screen with the current item highlighted.

## At the end
- Read back decisions, owners, and dates (5 minutes).
- Review the parking lot: assign each item or drop it.
- Send notes within 24 hours.
FILE:templates/agenda.md
# Agenda input (for scripts/timebox_agenda.py)

'''
Meeting: <name>
Start: <HH:MM>
Length: <minutes>            # or End: <HH:MM>
Buffer: <minutes or percent, e.g. 5 or 10%>
Attendees: <number>

<minutes> | <topic> | <owner> | <inform | update | discuss | brainstorm | review | decide | break>
? | <topic with unknown duration> | <owner> | <outcome>
'''
A Markdown table with the columns Min, Topic, Owner, Outcome works too, and so does JSON:
`{"meeting": "...", "start": "14:00", "length": 60, "buffer": 5, "attendees": 6, "items": [{"minutes": 10, "topic": "...", "owner": "...", "outcome": "decide"}]}`

---

# Agenda to send

**<Meeting name>**
<Day, date>, <start>-<end> (<length> min), <place or video link>
Attendees: <names or teams> | Facilitator: <name> | Timekeeper: <name> | Notes: <name>

**Purpose:** <one sentence: what must be true when we finish>

**Outcomes we need**
1. <decision or result>
2. <decision or result>

**Pre-read (by <day, time>)**
- <document> - <owner> - <what to look at, how long it takes to read>

**Schedule**
| Time | Min | Item | Owner | Outcome |
|---|---|---|---|---|
| <HH:MM-HH:MM> | <n> | <topic> | <owner> | <outcome> |
| <HH:MM-HH:MM> | <n> | Buffer and wrap-up: decisions, owners, dates | <facilitator> | |

**How we decide today:** <owner decides after input | consent | vote>

**Parking lot:** Off-topic points go to the parking lot and get an owner at the end.

**Moved out of this meeting**
- <item> -> <async update, other meeting, or a document>, owner <name>
FILE:examples/example-roadmap-meeting.md
# Example: fixing an overloaded one-hour planning meeting

## The request
"I have one hour with 9 people on Thursday at 14:00 to plan Q4. Here is my agenda. Will it fit? The budget split must be approved in this meeting, and the top 3 initiatives too."

Draft agenda (`agenda.txt`):
'''
Meeting: Q4 roadmap planning
Start: 14:00
Length: 60
Buffer: 5
Attendees: 9

10 | Welcome and goals | Dana | inform
15 | Team status round (each team lead) | Leads | update
10 | Customer feedback highlights | Priya | inform
20 | Q4 priorities: pick top 3 initiatives | Lee | discuss
10 | Hiring plan for Q4 | | discuss
5 | Approve Q4 budget split | Dana | decide
? | AOB | |
'''

## First run
'''
$ python3 scripts/timebox_agenda.py agenda.txt
Q4 roadmap planning: 14:00-15:00 (60 min, buffer 5 min, 55 min for items)
Planned: 70 min

  14:00-14:10   10 min            Welcome and goals (Dana) [inform]
  14:10-14:25   15 min            Team status round (each team lead) (Leads) [update]
  14:25-14:35   10 min            Customer feedback highlights (Priya) [inform]
  14:35-14:55   20 min            Q4 priorities: pick top 3 initiatives (Lee) [discuss]
  14:55-15:05   10 min            Hiring plan for Q4 [discuss]
  15:05-15:10    5 min            Approve Q4 budget split (Dana) [decide]
  15:10-15:10    ? min            AOB [?]
  14:55-15:00    5 min            Buffer / wrap-up

Findings:
- [HIGH] Agenda needs 70 min but only 55 min are available after the 5-min buffer: overrun of 15 min (ends 15:10 instead of 14:55). Cut, shorten, or move items, or run with --fit.
- [WARN] 1 item(s) without a duration: AOB. Remaining time for them: 0 min.
- [WARN] "Hiring plan for Q4" has no owner; name who prepares and leads it.
- [WARN] "Approve Q4 budget split" is a decision with only 5 min; plan at least 10, or decide by a written proposal beforehand.
- [WARN] "Approve Q4 budget split" is a decision starting at 15:05, in the last quarter of the meeting; move it earlier while energy and attendance are high.
- [WARN] "AOB" has no owner; name who prepares and leads it.
- [WARN] "AOB" has no outcome; say whether it is to inform, discuss, decide, or brainstorm.
- [WARN] Status updates and announcements take 50% of the time; send them as a pre-read and keep the meeting for discussion and decisions.
- [INFO] Meeting cost: 9 people x 60 min = 9 person-hours.
'''
Exit code 1: the agenda does not fit.

## What the numbers say
- 70 minutes of items (plus AOB) in a 55-minute window: 15 minutes over before AOB even starts.
- Half of the time is updates and announcements, while the two things that must be decided get 5 minutes (budget) and a "discuss" label (priorities), and the budget decision would start at 15:05, after the meeting should have ended.
- Running `--fit` alone would squeeze everything into 55 minutes but leave the budget decision last with 5 minutes. Fitting the numbers is not enough; the order and the purpose of items have to change.

## Changes
1. Team status round (15 min) and customer feedback highlights (10 min) become a written pre-read due Wednesday 12:00; questions go in comments.
2. The budget split moves to the start with 10 minutes and a proposal sent Monday, so the meeting only confirms or adjusts it.
3. "Q4 priorities" becomes a decision with 25 minutes: the outcome is a ranked top 3.
4. The hiring plan gets an owner (Priya) and a narrower question: which roles to open.
5. AOB is replaced by a 5-minute "next steps, owners, and parking lot" close.
6. Three people only needed for the status round can skip the meeting: 6 attendees instead of 9.

Revised agenda:
'''
Meeting: Q4 roadmap planning
Start: 14:00
Length: 60
Buffer: 5
Attendees: 6

5 | Welcome and goals for today | Dana | inform
10 | Approve Q4 budget split (proposal sent Monday) | Dana | decide
25 | Q4 priorities: pick top 3 initiatives | Lee | decide
10 | Hiring plan for Q4: agree which roles to open | Priya | discuss
5 | Next steps, owners, and parking lot | Dana | inform
'''

## Second run
'''
$ python3 scripts/timebox_agenda.py agenda-revised.txt
Q4 roadmap planning: 14:00-15:00 (60 min, buffer 5 min, 55 min for items)
Planned: 55 min

  14:00-14:05    5 min            Welcome and goals for today (Dana) [inform]
  14:05-14:15   10 min            Approve Q4 budget split (proposal sent Monday) (Dana) [decide]
  14:15-14:40   25 min            Q4 priorities: pick top 3 initiatives (Lee) [decide]
  14:40-14:50   10 min            Hiring plan for Q4: agree which roles to open (Priya) [discuss]
  14:50-14:55    5 min            Next steps, owners, and parking lot (Dana) [inform]
  14:55-15:00    5 min            Buffer / wrap-up

Findings:
- [INFO] Meeting cost: 6 people x 60 min = 6 person-hours.
'''
Exit code 0, no warnings, and the meeting costs 6 person-hours instead of 9.

## The agenda to send (filled template, shortened)

**Q4 roadmap planning**
Thursday, 14:00-15:00 (60 min), Room 3 and video link
Facilitator: Dana | Timekeeper: Lee | Notes: Priya

**Purpose:** Leave with an approved Q4 budget split and a ranked top 3 of initiatives.

**Pre-read (by Wednesday 12:00)**
- Team status one-pagers - each team lead - 5 min to read
- Customer feedback highlights - Priya - 5 min
- Budget split proposal - Dana - 10 min

**Schedule**
| Time | Min | Item | Owner | Outcome |
|---|---|---|---|---|
| 14:00-14:05 | 5 | Welcome and goals for today | Dana | inform |
| 14:05-14:15 | 10 | Approve Q4 budget split (proposal sent Monday) | Dana | decide |
| 14:15-14:40 | 25 | Q4 priorities: pick top 3 initiatives | Lee | decide |
| 14:40-14:50 | 10 | Hiring plan for Q4: agree which roles to open | Priya | discuss |
| 14:50-14:55 | 5 | Next steps, owners, and parking lot | Dana | inform |
| 14:55-15:00 | 5 | Buffer | | |

**How we decide today:** Dana decides the budget after input; the top 3 is chosen by consent (any strong objection?).

**Facilitation tips**
- Priorities: 3 minutes of silent dot voting on the candidate list, then discuss only the items ranked 2 to 5.
- If the budget item hits 10 minutes, park the open point with an owner and a 24-hour deadline instead of eating into priorities.

**Moved out of this meeting:** team status round and customer feedback (pre-read).

## Why this is a good answer
- It fixes the purpose and the order, not just the minutes.
- Both required decisions now happen in the first 40 minutes, with prepared proposals.
- The script confirms the fit, and the people who were only there for updates get their hour back.
FILE:scripts/timebox_agenda.py
#!/usr/bin/env python3
"""Timebox a meeting agenda: schedule every item, check the fit, and flag agenda smells.

Usage:
  python3 timebox_agenda.py agenda.txt
  python3 timebox_agenda.py agenda.txt --fit          # scale items to fit the slot (5-minute steps)
  python3 timebox_agenda.py agenda.json --json
  cat agenda.txt | python3 timebox_agenda.py -

Text input: optional "Key: value" header lines, then one item per line as
  minutes | topic | owner | outcome
Markdown table rows (| 10 | Topic | Owner | decide |) also work; header and
separator rows are skipped. Use ? for an unknown duration.
Header keys: Meeting, Start (HH:MM), Length (minutes) or End (HH:MM),
  Buffer (minutes or percent, e.g. 5 or 10%), Attendees (number).
Outcomes: inform, update, discuss, brainstorm, review, decide, break.
JSON input: {"meeting": "...", "start": "14:00", "length": 60, "buffer": 5,
  "attendees": 8, "items": [{"minutes": 10, "topic": "...", "owner": "...", "outcome": "decide"}]}

--fit trims status items (and items with no outcome) first, then scales everything; spare time goes to
decide and discuss items.
Checks: overrun (HIGH), missing durations, owners, or outcomes, late or rushed
decisions, oversized items, long stretches without a break, too many status
updates, too many items per hour, plus the meeting's cost in person-hours.
Exit code: 0 no HIGH findings, 1 HIGH found, 2 usage or input error.
Standard library only.
"""
import argparse
import json
import math
import re
import sys

OUTCOMES = {"inform", "update", "discuss", "brainstorm", "review", "decide", "break"}
ALIASES = {"decision": "decide", "info": "inform", "fyi": "inform", "status": "update", "updates": "update",
           "discussion": "discuss", "ideas": "brainstorm", "ideation": "brainstorm", "feedback": "review",
           "approve": "decide", "approval": "decide", "pause": "break", "coffee": "break"}


class InputError(Exception):
    pass


def hhmm(text):
    m = re.fullmatch(r"\s*(\d{1,2})[:.](\d{2})\s*", str(text))
    if not m or int(m.group(1)) > 23 or int(m.group(2)) > 59:
        raise InputError(f"time must be HH:MM, got {text!r}")
    return int(m.group(1)) * 60 + int(m.group(2))


def fmt(minutes):
    minutes = int(round(minutes)) % (24 * 60)
    return f"{minutes // 60:02d}:{minutes % 60:02d}"


def parse_minutes(text):
    t = str(text).strip().lower()
    if t in ("", "?", "tbd", "-"):
        return None
    m = re.fullmatch(r"(\d+(?:\.\d+)?)\s*(m|min|mins|minutes?)?", t)
    if m:
        return float(m.group(1))
    m = re.fullmatch(r"(\d+(?:\.\d+)?)\s*h(?:ours?)?(?:\s*(\d+)\s*m(?:in)?)?", t)
    if m:
        return float(m.group(1)) * 60 + float(m.group(2) or 0)
    raise InputError(f"cannot read duration {text!r}")


def norm_outcome(text):
    t = (text or "").strip().lower()
    return ALIASES.get(t, t)


def parse_text(text):
    meta, items, errors = {}, [], []
    for no, raw in enumerate(text.replace("\r\n", "\n").split("\n"), 1):
        line = raw.strip()
        if not line or line.startswith("#"):
            continue
        hm = re.fullmatch(r"([A-Za-z ]{3,20}):\s*(.+)", line)
        if hm and "|" not in line:
            meta[hm.group(1).strip().lower()] = hm.group(2).strip()
            continue
        if "|" not in line:
            errors.append(f"line {no}: expected 'minutes | topic | owner | outcome', got {line[:60]!r}")
            continue
        cells = [c.strip() for c in line.strip("|").split("|")]
        if all(re.fullmatch(r":?-{2,}:?", c) for c in cells if c):
            continue
        if cells and cells[0].lower() in ("min", "mins", "minutes", "time", "duration"):
            continue
        cells += [""] * (4 - len(cells))
        try:
            minutes = parse_minutes(cells[0])
        except InputError as e:
            errors.append(f"line {no}: {e}")
            continue
        if not cells[1]:
            errors.append(f"line {no}: item has no topic")
            continue
        items.append({"line": no, "minutes": minutes, "topic": cells[1], "owner": cells[2],
                      "outcome": norm_outcome(cells[3])})
    return meta, items, errors


def parse_json(text):
    data = json.loads(text)
    if not isinstance(data, dict) or not isinstance(data.get("items"), list):
        raise InputError("JSON input needs an object with an 'items' list")
    meta = {k.lower(): str(v) for k, v in data.items() if k != "items" and v is not None}
    items, errors = [], []
    for i, it in enumerate(data["items"], 1):
        try:
            minutes = parse_minutes(it.get("minutes", ""))
        except InputError as e:
            errors.append(f"item {i}: {e}")
            continue
        if not str(it.get("topic", "")).strip():
            errors.append(f"item {i}: item has no topic")
            continue
        items.append({"line": i, "minutes": minutes, "topic": str(it["topic"]).strip(),
                      "owner": str(it.get("owner", "") or "").strip(), "outcome": norm_outcome(it.get("outcome", ""))})
    return meta, items, errors


def settings(meta):
    start = hhmm(meta.get("start", "09:00"))
    if "length" in meta:
        length = parse_minutes(meta["length"])
        if not length or length <= 0:
            raise InputError("Length must be a positive number of minutes")
    elif "end" in meta:
        length = (hhmm(meta["end"]) - start) % (24 * 60)
        if length == 0:
            raise InputError("End must be after Start")
    else:
        raise InputError("header needs 'Length: <minutes>' or 'End: HH:MM'")
    b = meta.get("buffer", "0").strip()
    if b.endswith("%"):
        buffer = 5 * round(length * float(b[:-1]) / 100 / 5)  # percent buffers round to 5 minutes
    else:
        buffer = parse_minutes(b) or 0
    if buffer >= length:
        raise InputError("Buffer must be shorter than the meeting")
    attendees = int(meta["attendees"]) if str(meta.get("attendees", "")).strip().isdigit() else None
    return {"meeting": meta.get("meeting", meta.get("title", "Meeting")), "start": start, "length": length,
            "buffer": buffer, "available": length - buffer, "attendees": attendees}


def fit(items, available):
    """Fit items into `available` minutes in 5-minute steps (missing durations count as 10, breaks kept).

    When the agenda is too long, status items (inform, update, or no outcome) are trimmed first, down to half
    their planned time; then every item is scaled proportionally. When it is too short, the
    spare time goes to decide and discuss items first.
    """
    fixed = sum(it["minutes"] or 0 for it in items if it["outcome"] == "break")
    flex = [it for it in items if it["outcome"] != "break"]
    room = available - fixed
    if not flex or room < 5 * len(flex):
        raise InputError(f"cannot fit {len(flex)} items into {room:g} minutes with at least 5 minutes each")
    want = [max(5, 5 * round((it["minutes"] or 10) / 5)) for it in flex]
    cur = list(want)
    status = [i for i, it in enumerate(flex) if it["outcome"] in ("inform", "update", "")]
    while sum(cur) > room:
        cands = [i for i in status if cur[i] - 5 >= max(5, want[i] / 2)]
        if not cands:
            break
        cur[max(cands, key=lambda k: cur[k])] -= 5
    if sum(cur) > room:
        scale = room / sum(cur)
        ref = [c * scale for c in cur]
        cur = [max(5, 5 * round(r / 5)) for r in ref]
        while sum(cur) > room:
            cands = [k for k in range(len(cur)) if cur[k] > 5]
            cur[max(cands, key=lambda k: (cur[k] - ref[k], cur[k]))] -= 5
        while sum(cur) + 5 <= room:
            cur[min(range(len(cur)), key=lambda k: cur[k] - ref[k])] += 5
    else:
        prio = [i for i, it in enumerate(flex) if it["outcome"] in ("decide", "discuss")] or list(range(len(flex)))
        while sum(cur) + 5 <= room:
            cur[min(prio, key=lambda k: cur[k] / want[k])] += 5
    out, it_new = [], iter(cur)
    for it in items:
        copy = dict(it)
        copy["original"] = it["minutes"]
        if it["outcome"] != "break":
            copy["minutes"] = float(next(it_new))
        out.append(copy)
    return out


def analyze(items, cfg):
    findings = []

    def add(sev, msg):
        findings.append({"severity": sev, "message": msg})

    t = cfg["start"]
    for it in items:
        it["start"] = t
        t += it["minutes"] or 0
        it["end"] = t
    planned = sum(it["minutes"] or 0 for it in items)
    avail, end_slot = cfg["available"], cfg["start"] + cfg["length"]
    unknown = [it for it in items if it["minutes"] is None]
    if planned > avail:
        add("HIGH", f"Agenda needs {planned:g} min but only {avail:g} min are available"
            f"{' after the ' + format(cfg['buffer'], 'g') + '-min buffer' if cfg['buffer'] else ''}: overrun of {planned - avail:g} min"
            f" (ends {fmt(cfg['start'] + planned)} instead of {fmt(end_slot - cfg['buffer'])}). Cut, shorten, or move items, or run with --fit.")
    elif avail - planned > 0.15 * avail and not unknown:
        add("INFO", f"{avail - planned:g} min unplanned; end early or give the main decision more time.")
    if unknown:
        add("WARN", f"{len(unknown)} item(s) without a duration: " + "; ".join(it["topic"][:40] for it in unknown)
            + f". Remaining time for them: {max(avail - planned, 0):g} min.")
    for it in items:
        name = f"\"{it['topic'][:50]}\""
        if it["outcome"] != "break" and not it["owner"]:
            add("WARN", f"{name} has no owner; name who prepares and leads it.")
        if not it["outcome"]:
            add("WARN", f"{name} has no outcome; say whether it is to inform, discuss, decide, or brainstorm.")
        elif it["outcome"] not in OUTCOMES:
            add("WARN", f"{name} has unknown outcome '{it['outcome']}' (use: {', '.join(sorted(OUTCOMES))}).")
        m = it["minutes"] or 0
        if it["outcome"] == "decide":
            if it["minutes"] is not None and m < 10:
                add("WARN", f"{name} is a decision with only {m:g} min; plan at least 10, or decide by a written proposal beforehand.")
            if it["start"] - cfg["start"] >= 0.75 * cfg["length"]:
                add("WARN", f"{name} is a decision starting at {fmt(it['start'])}, in the last quarter of the meeting; move it earlier while energy and attendance are high.")
        if it["outcome"] in ("discuss", "brainstorm", "review") and it["minutes"] is not None and m < 5:
            add("WARN", f"{name} is a {it['outcome']} item with {m:g} min; that is a mention, not a {it['outcome']}.")
        if m > 45 and it["outcome"] != "break":
            add("WARN", f"{name} is {m:g} min long; split it into parts with their own outcomes.")
    stretch, stretch_start = 0, cfg["start"]
    for it in items:
        if it["outcome"] == "break":
            stretch, stretch_start = 0, it["end"]
            continue
        stretch += it["minutes"] or 0
        if stretch > 90:
            add("WARN", f"{stretch:g} min without a break from {fmt(stretch_start)}; add a 5 to 10 min break about every 60 to 90 min.")
            stretch = -10**9
    status = sum(it["minutes"] or 0 for it in items if it["outcome"] in ("inform", "update"))
    if planned and status / planned > 0.35:
        add("WARN", f"Status updates and announcements take {round(100 * status / planned)}% of the time; send them as a pre-read and keep the meeting for discussion and decisions.")
    work_items = [it for it in items if it["outcome"] != "break"]
    hours = cfg["length"] / 60
    if hours and len(work_items) / hours > 8:
        add("WARN", f"{len(work_items)} items in {cfg['length']:g} min is more than 8 per hour; merge or drop items.")
    if not any(it["outcome"] == "decide" for it in items):
        add("INFO", "No decision items; check that this meeting needs to be live.")
    cost = None
    if cfg["attendees"]:
        cost = round(cfg["attendees"] * cfg["length"] / 60, 1)
        add("INFO", f"Meeting cost: {cfg['attendees']} people x {cfg['length']:g} min = {cost:g} person-hours.")
    order = {"HIGH": 0, "WARN": 1, "INFO": 2}
    findings.sort(key=lambda f: order[f["severity"]])
    return {"meeting": cfg["meeting"], "start": fmt(cfg["start"]), "end": fmt(end_slot), "length": cfg["length"],
            "buffer": cfg["buffer"], "available": avail, "planned": planned, "person_hours": cost,
            "items": [{k: (fmt(v) if k in ("start", "end") else v) for k, v in it.items()} for it in items],
            "findings": findings}


def main():
    ap = argparse.ArgumentParser(description="Timebox a meeting agenda")
    ap.add_argument("path", help="agenda text/Markdown/JSON file, or - for stdin")
    ap.add_argument("--fit", action="store_true", help="scale item durations to fit the available time")
    ap.add_argument("--json", action="store_true")
    args = ap.parse_args()
    try:
        text = sys.stdin.read() if args.path == "-" else open(args.path, encoding="utf-8").read()
        if not text.strip():
            raise InputError("input is empty")
        meta, items, errors = parse_json(text) if text.lstrip().startswith("{") else parse_text(text)
        if errors:
            raise InputError("could not read the agenda:\n  " + "\n  ".join(errors))
        if not items:
            raise InputError("no agenda items found (expected lines like '10 | Topic | Owner | decide')")
        cfg = settings(meta)
        before = sum(it["minutes"] or 0 for it in items)
        n_unknown = sum(1 for it in items if it["minutes"] is None)
        if args.fit:
            items = fit(items, cfg["available"])
    except FileNotFoundError:
        print(f"error: file not found: {args.path}", file=sys.stderr)
        return 2
    except (InputError, json.JSONDecodeError, ValueError) as e:
        print(f"error: {e}", file=sys.stderr)
        return 2
    rep = analyze(items, cfg)
    rep["fitted_from"] = before if args.fit else None
    if args.json:
        print(json.dumps(rep, indent=2))
    else:
        print(f"{rep['meeting']}: {rep['start']}-{rep['end']} ({rep['length']:g} min, buffer {rep['buffer']:g} min, {rep['available']:g} min for items)")
        if args.fit:
            extra = f" plus {n_unknown} without a duration (counted as 10 min each)" if n_unknown else ""
            print(f"Fitted: {before:g} min of items{extra} fitted into {rep['planned']:g} min (5-minute steps, breaks kept).")
        print(f"Planned: {rep['planned']:g} min\n")
        for it in rep["items"]:
            mins = "?" if it["minutes"] is None else f"{it['minutes']:g}"
            was = f" (was {it['original']:g})" if args.fit and it.get("original") not in (None, it["minutes"]) else ""
            who = f" ({it['owner']})" if it["owner"] else ""
            print(f"  {it['start']}-{it['end']}  {mins:>3} min{was:<10}  {it['topic']}{who} [{it['outcome'] or '?'}]")
        if rep["buffer"]:
            print(f"  {fmt(hhmm(rep['end']) - rep['buffer'])}-{rep['end']}  {rep['buffer']:>3g} min            Buffer / wrap-up")
        print()
        if rep["findings"]:
            print("Findings:")
            for f in rep["findings"]:
                print(f"- [{f['severity']}] {f['message']}")
        else:
            print("Findings: none")
    return 1 if any(f["severity"] == "HIGH" for f in rep["findings"]) else 0


if __name__ == "__main__":
    sys.exit(main())
```

Prompt from the public prompts.chat library (CC0), credited to its contributor.
