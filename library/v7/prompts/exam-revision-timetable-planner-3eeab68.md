# Exam Revision Timetable Planner

By @f · general
Language: en · Domains: education, nature · Source: P01

Source page: https://prompts.chat

```
---
name: exam-revision-timetable-planner
description: Builds a day-by-day exam revision timetable from your exam dates, subject weights and confidence. Splits study hours into focused sessions, gives weak and heavy subjects more time, interleaves subjects, switches to practice questions in the last week before each exam, puts a timed past paper the day before, and respects rest and off days. Flags too few sessions per topic and back-to-back exams. Includes a stdlib Python planner with --self-test.
---

# Exam Revision Timetable Planner

You help students turn a stressful exam season into a realistic plan: which subject to study in each session, every day, until the last exam. You use evidence-based techniques (spacing, retrieval practice, interleaving, past papers), keep the plan humane with rest and sleep, and make the trade-offs visible when there is not enough time for everything.

## Files in this skill

- `scripts/revision_plan.py` - reads a subjects CSV and prints the subject table, a day-by-day timetable and findings (Python 3 standard library only)
- `references/study-techniques.md` - what to do inside a session: retrieval practice, spacing, interleaving, past papers, and what to avoid
- `references/scheduling-rules.md` - how the script assigns priorities, targets, session types and findings, and how to tune it
- `templates/revision-plan.md` - the plan to hand back: overview, weekly timetable, session routine, check-in points
- `examples/winter-exams.csv` - five university exams between 2 and 11 December with topic counts

## Workflow

### 1. Gather the facts
Ask for each exam: subject, date, how much it counts (credits, percentage of the final grade, or importance 1-5), confidence from 1 (lost) to 5 (solid), and the number of topics or chapters. Then ask for the first revision day, realistic hours on weekdays and weekends (after classes, work, commute), preferred session length (50/10 by default, 25/5 Pomodoro for low focus), a weekly rest day and any days that are already taken.

### 2. Run the planner
'''
python3 scripts/revision_plan.py examples/winter-exams.csv --start 2026-11-16 --weekday-hours 3 --weekend-hours 5 --rest-day Sun --off 2026-11-21 --day-start 16:00
python3 scripts/revision_plan.py my-exams.csv --start 2026-05-04 --session-min 25 --break-min 5 --json
python3 scripts/revision_plan.py --self-test
'''
Exit code 1 means a HIGH finding (fewer sessions than topics), 2 means bad input.

### 3. Fix the trade-offs
For UNDER_COVERED or TIGHT: add hours, start earlier, lower the target for strong subjects, or agree which low-yield topics to skim (use the syllabus weighting or past-paper frequency). For BACK_TO_BACK: move the second subject's practice before the first exam. Check the plan with the student: is it doable on a bad day? Leave slack rather than cramming every evening.

### 4. Deliver
Fill `templates/revision-plan.md`: the overview table, the timetable by week, the session routine from `references/study-techniques.md`, and two check-in dates to re-rate confidence and rerun the script.

## Example result
For `examples/winter-exams.csv` from 16 November with 3 h on weekdays, 5 h on Saturdays, Sundays and 21 November off: 25 days, 57 sessions of 50 minutes (47.5 h). Organic Chemistry (weight 5, confidence 2) and Microeconomics (4, 2) get 15 and 16 sessions, European History (3, 4) gets 6. Each subject ends with practice questions and a timed past paper the day before its exam. Findings: Statistics (10 sessions for 8 topics) and European History (6 for 6) are TIGHT, and European History and Microeconomics are BACK_TO_BACK on 7 and 8 December.

## Rules

- Plan with the hours the student really has, not the hours they wish they had; protect sleep (no sessions late at night before exams).
- Every session ends with retrieval (questions, blank-page recall, flashcards), not only rereading or highlighting.
- Keep at least one rest day or two half days a week; burnout costs more than one lost day.
- Re-plan after each check-in or exam instead of following a broken plan.
- Do not do graded coursework for the student; help with planning and study methods. If a student shows signs of serious stress or panic, encourage them to talk to student support or a doctor.
FILE:references/study-techniques.md
# Study Techniques

What to do inside each session. Ordered by strength of evidence (Dunlosky et al. 2013, "Improving Students' Learning With Effective Learning Techniques", rated practice testing and distributed practice as high utility).

## Retrieval practice (high)
Bring information back from memory instead of reading it again: answer questions, write everything you remember on a blank page, then check against notes and fill the gaps in another colour. Flashcards work if you answer before flipping. Getting it wrong first and then correcting also helps learning.

## Spacing (high)
Spread sessions on a subject over many days instead of one long block. A simple review rhythm for each topic: the next day, after 3 days, after a week, then before the exam. The timetable interleaves subjects across days; start each session with 5 minutes of recall on the previous session of that subject to build the spacing in.

## Interleaving (moderate)
Mix problem types inside a subject (for maths and sciences: different kinds of problems in one set, not 20 of the same) so you practise choosing the method, which the exam requires.

## Past papers (high for exams)
Do at least one complete paper under timed conditions before each exam, then mark it with the official mark scheme and list the lost marks by topic. The script puts one on the day before each exam; add earlier ones if papers are available.

## Elaboration and self-explanation (moderate)
Ask "why does this work?" and "how does this connect to X?", explain a concept out loud as if teaching it, draw a concept map from memory.

## Low value on their own
Rereading, highlighting and copying notes feel productive but give little long-term gain. Use them only as a first pass before retrieval.

## Session routine (50/10 default)
1. 5 min: recall from memory what you did last time for this subject.
2. 30 min: learn or practise one topic (Learn + recall) or do questions (Practice questions).
3. 10 min: close the book and test yourself; mark what you missed.
4. 5 min: write down three questions you could not answer for next time.
5. 10 min break away from the screen: move, drink water.
For short attention spans use 25/5 sessions (`--session-min 25 --break-min 5`) and a longer break every four.

## Sleep, food and the day before
Sleep consolidates memory; all-nighters reduce exam performance. Keep the night before the exam for light review and sleep. Eat regular meals, move every day, and keep the phone in another room during sessions.
FILE:references/scheduling-rules.md
# Scheduling Rules

How `scripts/revision_plan.py` builds the timetable.

## Sessions per day
Sessions that fit in the daily hours: `floor((hours * 60 + break) / (session + break))`. With 50/10 sessions: 3 h -> 3 sessions, 5 h -> 5 sessions. Rest days (`--rest-day`) and `--off` dates have none. On an exam day only half the sessions are planned (the exam takes the rest), and only for later exams.

## Priority and target
- priority = weight x (6 - confidence). Weight 5, confidence 2 -> 20; weight 3, confidence 4 -> 6.
- target sessions = all sessions available before that exam x priority / sum of all priorities (at least 1).
Weight can be credits or a 1-5 importance score; only the ratios matter, so use the same scale for every subject.

## Choosing each session
For every session the script picks among subjects whose exam is still ahead and that have fewer than `--max-same` (default 2) sessions that day:
1. subjects still below their target first;
2. then a different subject from the previous session (interleaving);
3. then the highest remaining need per day left until the exam;
4. ties go to the higher priority, then the earlier exam.
The day before an exam starts with a timed past paper for that subject.

## Session types
- Learn + recall: until 60 % of the subject's target is done and more than 7 days before its exam.
- Mixed review: after 60 % of the target, more than 7 days out.
- Practice questions: in the last 7 days before the exam.
- Past paper (timed): the day before the exam.

## Findings
| Code | Severity | Rule | Typical fix |
|---|---|---|---|
| UNDER_COVERED | HIGH | sessions < topics | more hours, earlier start, skim low-yield topics |
| TIGHT | MEDIUM | sessions < 1.5 x topics | accept a single pass, or take time from strong subjects |
| BELOW_TARGET | MEDIUM | planned < 60 % of target | the exam is early; start that subject first |
| BACK_TO_BACK | MEDIUM | exams on consecutive days | front-load practice for the second exam |
| SAME_DAY | MEDIUM | two exams on one day | treat both as one block in the last week |
| NO_REST_DAY | LOW | plan > 10 days with no rest day or off days | add `--rest-day` |
| LONG_DAYS | LOW | more than 8 h a day | cap at 5-6 focused hours |

## Tuning
- More time for one subject: raise its weight or lower its confidence and rerun.
- Fewer subject switches: `--max-same 3`.
- Clock times: `--day-start 09:00` adds start and end times, with breaks between sessions.
- Re-plan: after each check-in, update confidence and `--start`, and rerun; finished exams drop out of the CSV.
FILE:templates/revision-plan.md
# Revision plan: <name>, <exam season>

**Period:** <16 Nov to 11 Dec 2026>   **Hours:** <3 h weekdays, 5 h Saturdays>   **Rest:** <Sundays + 21 Nov>
**Sessions:** <57 x 50 min (47.5 h)>   **Session rhythm:** <50 min study / 10 min break>

## Exams and priorities
| Subject | Exam | Weight | Confidence | Topics | Sessions planned | Notes |
|---|---|---|---|---|---|---|
| <Organic Chemistry> | <Wed 2 Dec> | <5> | <2> | <9> | <15> | <past paper 1 Dec> |

## Week 1: <16-22 Nov>
| Day | Session 1 | Session 2 | Session 3 | Session 4 | Session 5 |
|---|---|---|---|---|---|
| <Mon 16 Nov> | <16:00 Organic Chemistry: Learn> | <17:00 Microeconomics: Learn> | <...> | | |

## Week 2: <...>
<...>

## Session routine
1. 5 min recall of last session (blank page)
2. 30 min learn or practise one topic
3. 10 min self-test, mark the misses
4. 5 min: three open questions for next time
5. 10 min break away from the screen

## Trade-offs agreed
- <Statistics is TIGHT: one full pass, second pass only on topics 5-8 (most marks in past papers)>
- <European History / Microeconomics back to back: Microeconomics practice done by 5 Dec>

## Check-ins
- <Sun 22 Nov>: re-rate confidence 1-5 per subject, rerun the planner
- <Sun 29 Nov>: same, adjust the last 10 days

## Wellbeing
- Sleep: <in bed by 23:30, no study after 22:00 the night before exams>
- Daily movement: <30 min walk>
- If it gets too much: <talk to ... / student support contact>
FILE:examples/winter-exams.csv
subject,exam_date,weight,confidence,topics
Organic Chemistry,2026-12-02,5,2,9
Statistics,2026-12-04,4,3,8
European History,2026-12-07,3,4,6
Microeconomics,2026-12-08,4,2,7
Academic English,2026-12-11,2,4,4
FILE:scripts/revision_plan.py
#!/usr/bin/env python3
"""Exam revision timetable planner (Python 3 standard library only).

Reads a CSV of subjects with exam dates, weight and confidence, splits the
available study time into focused sessions, and builds a day-by-day timetable
that gives weak, heavy subjects more time, interleaves subjects, stops new work
on a subject after its exam, moves from learning to practice questions in the
last week before each exam and puts a timed past paper on the day before.

CSV columns (header required; ; or , separated):
  subject, exam_date (YYYY-MM-DD), weight (1-5 or credits), confidence (1-5), topics (optional)

Usage:
  python3 revision_plan.py exams.csv --start 2026-11-16 --weekday-hours 3 --weekend-hours 5
  python3 revision_plan.py exams.csv --start 2026-11-16 --rest-day Sun --off 2026-11-28,2026-11-29 --day-start 16:00
  python3 revision_plan.py --self-test
Exit codes: 0 = plan fits, 1 = HIGH findings (not enough sessions), 2 = bad input.
"""
import argparse, csv, datetime as dt, io, json, sys

DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
SEV = {"HIGH": 0, "MEDIUM": 1, "LOW": 2}


class InputError(Exception):
    pass


def parse_date(s, what):
    try:
        return dt.date.fromisoformat(s.strip())
    except ValueError:
        raise InputError(f"{what} '{s}' must be YYYY-MM-DD")


def read_subjects(text):
    sample = text[:2000]
    delim = ";" if sample.count(";") > sample.count(",") else ","
    rd = csv.DictReader(io.StringIO(text), delimiter=delim)
    if not rd.fieldnames:
        raise InputError("empty CSV")
    fields = [f.strip().lower() for f in rd.fieldnames]
    missing = [c for c in ("subject", "exam_date", "weight", "confidence") if c not in fields]
    if missing:
        raise InputError("missing columns: " + ", ".join(missing))
    subs = []
    for i, raw in enumerate(rd, start=2):
        r = {k.strip().lower(): (v or "").strip() for k, v in raw.items() if k}
        if not any(r.values()):
            continue
        try:
            w = float(r["weight"].replace(",", "."))
            c = int(r["confidence"])
            t = int(r["topics"]) if r.get("topics") else None
        except ValueError:
            raise InputError(f"row {i}: weight, confidence and topics must be numbers")
        if w <= 0:
            raise InputError(f"row {i}: weight must be positive")
        if not 1 <= c <= 5:
            raise InputError(f"row {i}: confidence must be 1 (weak) to 5 (strong)")
        if not r["subject"]:
            raise InputError(f"row {i}: subject is empty")
        subs.append({"subject": r["subject"], "exam": parse_date(r["exam_date"], f"row {i}: exam_date"),
                     "weight": w, "confidence": c, "topics": t})
    if not subs:
        raise InputError("no subjects in CSV")
    return subs


def slots_for(hours, session, brk):
    """Number of sessions that fit in `hours` with a break between sessions."""
    mins = hours * 60
    if mins < session:
        return 0
    return int((mins + brk) // (session + brk))


def plan(subs, start, weekday_hours=3.0, weekend_hours=5.0, session=50, brk=10, rest_day=None,
         off=(), max_same=2, day_start=None):
    if session < 15 or brk < 0:
        raise InputError("session must be at least 15 minutes and break not negative")
    for s in subs:
        if s["exam"] <= start:
            raise InputError(f"{s['subject']}: exam {s['exam']} is not after the start date {start}")
    last = max(s["exam"] for s in subs)
    exam_days = {}
    for s in subs:
        exam_days.setdefault(s["exam"], []).append(s["subject"])
    for s in subs:
        s["priority"] = s["weight"] * (6 - s["confidence"])
    days = []
    d = start
    while d < last:
        if d in off or (rest_day is not None and d.weekday() == rest_day):
            n = 0
        else:
            n = slots_for(weekend_hours if d.weekday() >= 5 else weekday_hours, session, brk)
            if d in exam_days:
                n //= 2  # the exam takes half the day
        days.append((d, n))
        d += dt.timedelta(days=1)
    # target sessions: share of the slots available before each exam, by priority
    total_p = sum(s["priority"] for s in subs)
    for s in subs:
        before = sum(n for day, n in days if day < s["exam"])
        s["target"] = max(1, round(before * s["priority"] / total_p))
        s["planned"] = 0
    timetable = []
    for day, n in days:
        today, used = [], {}
        live = [s for s in subs if s["exam"] > day]
        # the day before an exam: a timed past paper first
        for s in live:
            if (s["exam"] - day).days == 1 and len(today) < n:
                today.append((s["subject"], "Past paper (timed)")); used[s["subject"]] = 1; s["planned"] += 1
        while len(today) < n:
            cands = [s for s in live if used.get(s["subject"], 0) < max_same]
            if not cands:
                break
            prev = today[-1][0] if today else None

            def score(s):
                days_left = max(1, (s["exam"] - day).days)
                need = (s["target"] - s["planned"]) / days_left
                # subjects still below target first, then interleave (avoid repeating the previous subject)
                return (s["planned"] < s["target"], s["subject"] != prev, need, s["priority"], -s["exam"].toordinal())
            s = max(cands, key=score)
            left = (s["exam"] - day).days
            kind = "Practice questions" if left <= 7 else ("Learn + recall" if s["planned"] < s["target"] * 0.6 else "Mixed review")
            today.append((s["subject"], kind)); used[s["subject"]] = used.get(s["subject"], 0) + 1; s["planned"] += 1
        timed = []
        t = day_start
        for subj, kind in today:
            if t is not None:
                end = t + session
                timed.append({"subject": subj, "kind": kind, "time": f"{t // 60:02d}:{t % 60:02d}-{end // 60:02d}:{end % 60:02d}"})
                t = end + brk
            else:
                timed.append({"subject": subj, "kind": kind})
        timetable.append({"date": day.isoformat(), "dow": DAYS[day.weekday()], "exams": exam_days.get(day, []), "sessions": timed})
    findings = []
    for s in subs:
        if s["topics"]:
            if s["planned"] < s["topics"]:
                findings.append(("HIGH", "UNDER_COVERED", f"{s['subject']}: {s['planned']} sessions for {s['topics']} topics; add hours, drop low-yield topics or start earlier"))
            elif s["planned"] < 1.5 * s["topics"]:
                findings.append(("MEDIUM", "TIGHT", f"{s['subject']}: {s['planned']} sessions for {s['topics']} topics leaves little time for a second pass"))
        if s["planned"] < 0.6 * s["target"]:
            findings.append(("MEDIUM", "BELOW_TARGET", f"{s['subject']}: {s['planned']} of {s['target']} target sessions fit before the exam"))
    dates = sorted(exam_days)
    for a, b in zip(dates, dates[1:]):
        if (b - a).days <= 1:
            findings.append(("MEDIUM", "BACK_TO_BACK", f"exams on {a} ({', '.join(exam_days[a])}) and {b} ({', '.join(exam_days[b])}); finish the second subject's practice before the first exam"))
    for day, subjects in exam_days.items():
        if len(subjects) > 1:
            findings.append(("MEDIUM", "SAME_DAY", f"{len(subjects)} exams on {day}: {', '.join(subjects)}"))
    if rest_day is None and len(days) > 10 and not off:
        findings.append(("LOW", "NO_REST_DAY", "no rest day in a plan longer than 10 days; take at least half a day off each week"))
    if max(weekday_hours, weekend_hours) > 8:
        findings.append(("LOW", "LONG_DAYS", "more than 8 hours of revision a day rarely stays productive; keep 5-6 focused hours"))
    findings.sort(key=lambda f: SEV[f[0]])
    total_sessions = sum(len(t["sessions"]) for t in timetable)
    return {
        "subjects": [{"subject": s["subject"], "exam": s["exam"].isoformat(), "weight": s["weight"], "confidence": s["confidence"],
                      "priority": s["priority"], "topics": s["topics"], "target": s["target"], "planned": s["planned"],
                      "hours": round(s["planned"] * session / 60, 1)} for s in sorted(subs, key=lambda x: x["exam"])],
        "summary": {"start": start.isoformat(), "last_exam": last.isoformat(), "days": len(days), "sessions": total_sessions,
                    "study_hours": round(total_sessions * session / 60, 1), "session_min": session, "break_min": brk},
        "timetable": timetable,
        "findings": [{"severity": a, "code": b, "message": c} for a, b, c in findings],
    }


def to_markdown(p):
    s = p["summary"]
    out = ["# Revision timetable", "",
           f"{s['start']} to {s['last_exam']}: {s['days']} days, {s['sessions']} sessions of {s['session_min']} min ({s['study_hours']} h of focused study), {s['break_min']} min breaks",
           "", "| Subject | Exam | Weight | Confidence | Priority | Topics | Target | Planned | Hours |", "|---|---|---|---|---|---|---|---|---|"]
    for x in p["subjects"]:
        out.append(f"| {x['subject']} | {x['exam']} | {x['weight']:g} | {x['confidence']} | {x['priority']:g} | {x['topics'] or '-'} | {x['target']} | {x['planned']} | {x['hours']} |")
    out += ["", "## Day by day", ""]
    for t in p["timetable"]:
        head = f"- **{t['dow']} {t['date']}**" + (f" (EXAM: {', '.join(t['exams'])})" if t["exams"] else "")
        if not t["sessions"]:
            out.append(head + ": rest")
            continue
        parts = [(f"{x['time']} " if "time" in x else "") + f"{x['subject']} ({x['kind']})" for x in t["sessions"]]
        out.append(head + ": " + "; ".join(parts))
    out += ["", "## Findings"]
    out += [f"- {f['severity']} {f['code']}: {f['message']}" for f in p["findings"]] or ["- none"]
    out += ["", "Start each session with 5 minutes of recall from memory on the previous session of that subject, and end with 3 questions you could not answer."]
    return "\n".join(out)


def self_test():
    res = []

    def check(name, cond):
        res.append(cond)
        print(("PASS " if cond else "FAIL ") + name)

    D = dt.date
    S = lambda name, exam, w=1, c=3, t=None: {"subject": name, "exam": exam, "weight": w, "confidence": c, "topics": t}
    check("slots: 3 h of 50+10 = 3", slots_for(3, 50, 10) == 3)
    check("slots: 50 min fits exactly 1", slots_for(50 / 60, 50, 10) == 1)
    check("slots: under one session = 0", slots_for(0.5, 50, 10) == 0)
    check("slots: 25+5 in 2 h = 4", slots_for(2, 25, 5) == 4)
    p = plan([S("A", D(2026, 1, 8))], D(2026, 1, 5), weekday_hours=2, weekend_hours=2, session=50, brk=10)
    check("no sessions on or after exam day", all(t["date"] < "2026-01-08" for t in p["timetable"]))
    check("day before exam starts with past paper", p["timetable"][-1]["sessions"][0]["kind"] == "Past paper (timed)")
    check("practice questions in last 7 days", all(x["kind"] != "Learn + recall" for t in p["timetable"] for x in t["sessions"]))
    subs = [S("Weak", D(2026, 3, 1), w=3, c=1), S("Strong", D(2026, 3, 1), w=3, c=5)]
    p = plan(subs, D(2026, 2, 1), weekday_hours=3, weekend_hours=3, max_same=3)
    pl = {x["subject"]: x["planned"] for x in p["subjects"]}
    check("weak subject gets more sessions", pl["Weak"] > 3 * pl["Strong"])
    check("priority = weight x (6 - confidence)", p["subjects"][0]["priority"] in (15, 3))
    p = plan([S("A", D(2026, 3, 1)), S("B", D(2026, 3, 1))], D(2026, 2, 1), weekday_hours=3, weekend_hours=3)
    check("max 2 sessions of one subject per day", all(
        sum(1 for x in t["sessions"] if x["subject"] == subj) <= 2 for t in p["timetable"] for subj in "AB"))
    check("subjects interleaved while both need time", all(t["sessions"][i]["subject"] != t["sessions"][i + 1]["subject"]
                                      for t in p["timetable"][:10] for i in range(len(t["sessions"]) - 1)))
    p = plan([S("A", D(2026, 2, 16))], D(2026, 2, 2), rest_day=6)
    check("rest day empty", all(not t["sessions"] for t in p["timetable"] if t["dow"] == "Sun"))
    p = plan([S("A", D(2026, 2, 6))], D(2026, 2, 2), off={D(2026, 2, 3)})
    check("off day empty", not [t for t in p["timetable"] if t["date"] == "2026-02-03"][0]["sessions"])
    p = plan([S("A", D(2026, 2, 5)), S("B", D(2026, 2, 9))], D(2026, 2, 2), weekday_hours=4)
    day5 = [t for t in p["timetable"] if t["date"] == "2026-02-05"][0]
    check("exam day: half the slots, other subject only", len(day5["sessions"]) == 2 and all(x["subject"] == "B" for x in day5["sessions"]))
    p = plan([S("A", D(2026, 2, 5), t=20)], D(2026, 2, 2))
    check("UNDER_COVERED HIGH", p["findings"][0]["code"] == "UNDER_COVERED")
    p = plan([S("A", D(2026, 2, 20), t=11)], D(2026, 2, 2), weekday_hours=1, weekend_hours=1, rest_day=6)
    check("TIGHT", any(f["code"] == "TIGHT" for f in p["findings"]))
    p = plan([S("A", D(2026, 2, 9)), S("B", D(2026, 2, 10)), S("C", D(2026, 2, 10))], D(2026, 2, 2))
    codes = [f["code"] for f in p["findings"]]
    check("BACK_TO_BACK and SAME_DAY", "BACK_TO_BACK" in codes and "SAME_DAY" in codes)
    check("NO_REST_DAY", "NO_REST_DAY" in [f["code"] for f in plan([S("A", D(2026, 3, 1))], D(2026, 2, 1))["findings"]])
    check("LONG_DAYS", "LONG_DAYS" in [f["code"] for f in plan([S("A", D(2026, 2, 5))], D(2026, 2, 2), weekend_hours=10)["findings"]])
    p = plan([S("A", D(2026, 2, 5))], D(2026, 2, 2), day_start=9 * 60)
    check("clock times with --day-start", p["timetable"][0]["sessions"][1]["time"] == "10:00-10:50")
    subs = read_subjects("subject;exam_date;weight;confidence;topics\nMaths;2026-12-03;4,5;2;9\n")
    check("semicolon CSV + decimal comma", subs[0]["weight"] == 4.5 and subs[0]["topics"] == 9)
    for bad, why in [("subject,exam_date\nA,2026-01-01\n", "missing columns"),
                     ("subject,exam_date,weight,confidence\nA,2026-13-01,1,3\n", "bad date"),
                     ("subject,exam_date,weight,confidence\nA,2026-01-01,1,9\n", "confidence out of range"),
                     ("subject,exam_date,weight,confidence\nA,2026-01-01,x,3\n", "non-number")]:
        try:
            read_subjects(bad); check("rejects " + why, False)
        except InputError:
            check("rejects " + why, True)
    try:
        plan([S("A", D(2026, 1, 1))], D(2026, 1, 1)); check("rejects exam not after start", False)
    except InputError:
        check("rejects exam not after start", True)
    passed = sum(res)
    print(f"{passed}/{len(res)} passed")
    return 0 if passed == len(res) else 1


def main():
    ap = argparse.ArgumentParser(description="Exam revision timetable planner")
    ap.add_argument("csv", nargs="?", help="subjects CSV")
    ap.add_argument("--start", help="first revision day YYYY-MM-DD (default today)")
    ap.add_argument("--weekday-hours", type=float, default=3.0)
    ap.add_argument("--weekend-hours", type=float, default=5.0)
    ap.add_argument("--session-min", type=int, default=50, help="focused session length (default 50)")
    ap.add_argument("--break-min", type=int, default=10, help="break between sessions (default 10)")
    ap.add_argument("--rest-day", choices=DAYS, help="weekly day off")
    ap.add_argument("--off", default="", help="comma-separated dates with no revision (YYYY-MM-DD)")
    ap.add_argument("--max-same", type=int, default=2, help="max sessions of one subject per day (default 2)")
    ap.add_argument("--day-start", help="clock time of the first session HH:MM (adds times to the timetable)")
    ap.add_argument("--json", action="store_true")
    ap.add_argument("--self-test", action="store_true")
    a = ap.parse_args()
    if a.self_test:
        return self_test()
    if not a.csv:
        ap.error("give a CSV, or --self-test")
    try:
        with open(a.csv, encoding="utf-8-sig") as fh:
            subs = read_subjects(fh.read())
        start = parse_date(a.start, "--start") if a.start else dt.date.today()
        off = {parse_date(x, "--off") for x in a.off.split(",") if x.strip()}
        ds = None
        if a.day_start:
            try:
                h, m = map(int, a.day_start.split(":")); assert 0 <= h < 24 and 0 <= m < 60
            except Exception:
                raise InputError("--day-start must be HH:MM")
            ds = h * 60 + m
        p = plan(subs, start, a.weekday_hours, a.weekend_hours, a.session_min, a.break_min,
                 DAYS.index(a.rest_day) if a.rest_day else None, off, a.max_same, ds)
    except (OSError, InputError) as e:
        print(f"error: {e}", file=sys.stderr)
        return 2
    print(json.dumps(p, indent=2) if a.json else to_markdown(p))
    return 1 if any(f["severity"] == "HIGH" for f in p["findings"]) else 0


if __name__ == "__main__":
    sys.exit(main())
```

Prompt from the public prompts.chat library (CC0), credited to its contributor.
