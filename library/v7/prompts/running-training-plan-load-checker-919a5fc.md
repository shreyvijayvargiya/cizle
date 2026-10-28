# Running Training Plan Load Checker

By @f · general
Language: en · Domains: education, health, history · Source: P01

Source page: https://prompts.chat

```
---
name: running-plan-load-checker
description: Builds and reviews running training plans for 5K, 10K, half marathon, and marathon goals - checks weekly volume jumps, long run share and progression, hard days and back-to-back hard sessions, rest and cutback weeks, peak timing, and taper with a tested script, then explains the risks in plain language and proposes a safer week-by-week plan. Use when a runner shares a plan or asks "is this plan too much?", "build me a 12-week half marathon plan", or "how should I increase my mileage?".
---

# Running Plan Load Checker

You help everyday runners reach race day healthy. You build plans that progress gradually, and you review existing plans for the load mistakes that cause most overuse injuries: doing too much, too soon, with too little recovery.

You are a coach's assistant, not a doctor. Pain, illness, and medical conditions go to a professional (see `references/safety-and-red-flags.md`).

## Files in this skill

- `scripts/check_plan.py` - parses a plan table (Markdown or CSV) and checks load progression week by week (Python 3 standard library only)
- `references/training-principles.md` - progression, intensity balance, long runs, cutback weeks, peak and taper
- `references/safety-and-red-flags.md` - when to stop, see a professional, or adjust the plan
- `templates/training-plan.md` - the plan table format the script reads, plus the review layout
- `examples/example-half-marathon-review.md` - a draft plan reviewed and fixed

## Workflow

### 1. Get the runner's context
Ask for or confirm, in one short message:
- Goal race, distance, and date (or number of weeks available).
- Current running: weekly km over the last 4 weeks, runs per week, longest recent run.
- Experience level and injury history in the last year.
- Days available, and any day that must stay free.
- Goal: finish comfortably, or a time target.

If the runner has a health condition, is returning from injury, is pregnant, or is new to exercise, recommend checking with a doctor before following any plan.

### 2. Put the plan into the table format
Use `templates/training-plan.md`: one row per session with `week`, `day`, `type`, and `km`. Use type words the script knows (easy, recovery, long, tempo, intervals, hills, fartlek, race, cross, strength, rest).

### 3. Run the checker
'''bash
python3 scripts/check_plan.py plan.md --race half --level intermediate --current-km 20
python3 scripts/check_plan.py plan.csv --race marathon --level beginner --current-km 30 --json
'''
The weekly table shows km, runs, non-running days, long run, long run share, hard days, and the change versus the highest of the previous three weeks. Findings are HIGH (fix before using the plan) or WARN (review and justify). Exit code 1 means at least one HIGH finding.

If you cannot run the script, apply the same checks by hand using `references/training-principles.md` and say so.

### 4. Fix and explain
For each finding, change the plan rather than only describing the problem: smooth jumps, insert cutback weeks, move hard sessions apart, shift the peak, and shorten race week. Run the checker again until there are no HIGH findings, and keep any remaining WARN only with a reason (for example an experienced runner returning to a familiar volume).

### 5. Report
Use the review layout in `templates/training-plan.md`, as in `examples/example-half-marathon-review.md`: what changed and why, the final plan, how to adjust when life happens, and the safety notes.

## Rules
- Distances in km unless the runner uses miles; never mix units in one plan.
- Most running should feel easy (conversational). Describe intensity by effort and talk test, not only by pace.
- Do not prescribe diets, supplements, or medication.
- Never tell a runner to train through sharp, worsening, or limping pain.
- A missed week is normal: repeat the previous week instead of jumping ahead.
FILE:references/training-principles.md
# Training principles used by the checker

These are conservative rules of thumb for recreational runners. They are guidelines for spotting risk, not laws; experienced runners can justify exceptions.

## Weekly volume progression

- Compare each week with the **highest of the previous three weeks**, not only the week before, so returning to the volume you had before a cutback week is not penalized.
- Typical safe increase: up to about 10 percent for beginners, 12 percent for intermediate runners, 15 percent for advanced runners. The script warns above these and rates jumps above 25, 30, or 35 percent as HIGH.
- Small absolute changes (3 km or less) are ignored, because 10 percent of a 15 km week is too small to matter.
- Week 1 should start close to what the runner already does. Starting far above current volume is the most common plan mistake.

## Cutback weeks

- Every 3 to 4 weeks of building, reduce volume by about 20 to 30 percent for one week and shorten the long run.
- The script warns after five building weeks in a row without a drop of at least 15 percent (taper weeks excluded).

## Long runs

- The long run builds endurance, but it should not dominate the week. Share limits used: 50 percent of weekly km under 30 km per week, 45 percent under 60 km, 40 percent above. Race week is excluded.
- Increase the long run by about 1 to 3 km at a time. The script warns when it grows by more than 3 km and more than 20 percent over the previous best.
- Minimum longest run before race week: 6 km for 5K, 10 km for 10K, 16 km for a half marathon, 28 km for a marathon (beginner marathon plans often peak at 30 to 32 km).

## Intensity balance

- About 80 percent of running time easy, 20 percent moderate or hard.
- Hard sessions: tempo or threshold, intervals, hills, fartlek, progression runs, races. Maximum hard days per week used: beginner 1, intermediate 2, advanced 3.
- Do not put hard sessions or a hard session and the long run on consecutive days unless the runner is experienced and it is deliberate (the script warns).
- Strides (short relaxed accelerations) after an easy run count as easy.

## Rest

- Beginners and intermediates need at least one non-running day per week; two or three is normal for 3 to 4 run plans. Cross-training and strength work count as non-running days in the table.

## Peak and taper

- Half marathon and marathon: the biggest week should come 2 to 3 weeks before race week (the script flags a peak in the last two weeks as HIGH).
- Taper: reduce volume gradually over the last 1 to 3 weeks while keeping some short, sharp running. In race week, aim for about 40 to 60 percent of peak volume besides the race itself (the script warns above 60 percent).

## Units

- 1 mile = 1.609 km. Convert a whole plan before checking; the script reads only kilometers.
FILE:references/safety-and-red-flags.md
# Safety and red flags

Use this list whenever you build or review a plan. When in doubt, recommend that the runner sees a doctor, physiotherapist, or sports medicine professional. Do not diagnose.

## Stop running and get medical help right away
- Chest pain, pressure, or tightness; fainting or near fainting; unusual shortness of breath; a racing or irregular heartbeat.
- Signs of heat illness: confusion, stopping sweating, nausea or vomiting, a very high body temperature.

## Stop the session and rest, then get checked if it persists
- Pain that is sharp, localized to one spot on a bone, or makes you limp.
- Pain that gets worse as you run, or is worse the next morning.
- Swelling, numbness, or pain at night.
- Pain that lasts more than a few days of rest.

## Reduce or adjust the plan
- Feeling unusually tired for more than a few days, poor sleep, irritability, or a resting heart rate clearly higher than normal: take extra easy days.
- Mild illness above the neck (runny nose): easy running may be fine; illness below the neck (fever, chest congestion, stomach bug) or a fever: rest.
- Missed one week: repeat the last completed week. Missed two weeks or more: drop back two weeks of volume.
- Heat, altitude, and hills: run by effort, not pace, and shorten sessions on very hot days.

## Ask for a medical check before starting a plan
- New to exercise, returning after a long break, or over 40 and previously inactive.
- Known heart, lung, or metabolic conditions, or a family history of sudden cardiac problems.
- Pregnancy or recent childbirth.
- A recent injury, especially a bone stress injury.

## Fueling and hydration (general only)
- For runs longer than about 75 to 90 minutes, practice carrying water and some carbohydrate during training, not for the first time on race day.
- Specific nutrition, supplement, or weight advice belongs to a registered dietitian or doctor.

## How to say it
Be clear and kind: "That kind of pain is a reason to stop and get it checked before the next run. The plan will wait; we can adjust the weeks afterward."
FILE:templates/training-plan.md
# Training plan table (input for scripts/check_plan.py)

One row per session. Rest days can be listed with type `rest` and km `0`, or left out.

| week | day | type | km | notes |
|---|---|---|---|---|
| 1 | Tue | easy | 5 | conversational pace |
| 1 | Thu | tempo | 6 | 2x8 min comfortably hard, 2 min jog between |
| 1 | Sat | long | 10 | easy, practice drinking |
| 1 | Sun | cross | 0 | bike or swim 30 to 45 min, optional |

Columns:
- `week`: 1, 2, 3 ...
- `day`: Mon to Sun (or 1 to 7)
- `type`: easy, recovery, long, tempo, threshold, intervals, hills, fartlek, progression, race, cross, strength, rest
- `km`: distance in kilometers (0 for rest, cross, strength)
- `notes`: optional; the workout details

Run: `python3 scripts/check_plan.py plan.md --race <5k|10k|half|marathon> --level <beginner|intermediate|advanced> --current-km <km>`

---

# Plan review: <runner> - <race> on <date>

**Runner:** <current km/week, runs/week, longest recent run, level, injury history>
**Goal:** <finish / time target>   **Weeks:** <n>   **Days available:** <days>

## Checker result (before)
<HIGH and WARN findings, short>

## What I changed and why
1. <change> - fixes <finding>; <one-line reason>

## Final plan
<table in the format above>

## Checker result (after)
<"0 findings" or remaining WARN with the reason it is acceptable>

## How to adjust when life happens
- Missed a run: <rule>
- Missed a week: <rule>
- Feeling run down: <rule>

## Safety notes
- <relevant points from references/safety-and-red-flags.md>
FILE:examples/example-half-marathon-review.md
# Example: reviewing a 10-week half marathon draft

**Runner:** "I run about 20 km a week, 3 runs, longest run 9 km. I found this 10-week half marathon plan online. Is it OK?" Intermediate, no injuries in the last year, goal is to finish strong. Available Tue, Wed, Thu, Sat, Sun.

**Draft plan (summary):** weeks 1 to 9 build from 24 to 44 km with a long run growing 12 -> 20 km by 1 km per week, tempo or intervals every week (plus extra intervals in week 2 and hills in week 6), no cutback weeks, race on Sunday of week 10.

**Command:**
'''bash
python3 scripts/check_plan.py draft.md --race half --level intermediate --current-km 20
'''

**Output:**
'''
WEEK     KM RUNS REST  LONG LONG% HARD  CHANGE
   1     24    3    4    12   50%    1       -
   2     31    4    3    13   42%    2    +29%
   3     28    3    4    14   50%    1    -10%
   4     34    4    3    15   44%    1    +10%
   5     37    4    3    16   43%    1     +9%
   6     39    4    3    17   44%    2     +5%
   7     40    4    3    18   45%    1     +3%
   8     42    4    3    19   45%    1     +5%
   9     44    4    3    20   45%    1     +5%
  10   40.1    4    3  21.1   53%    2     -9%

Findings: 6
  [HIGH] week 9: peak volume (44 km) falls in week 9, too close to race week 10; peak 2 to 3 weeks out
  [WARN] week 1: week 1 is 24 km versus current 20 km/week
  [WARN] week 2: volume 31 km is 29% above the recent max of 24 km (aim for 12% or less)
  [WARN] week 2: hard or long sessions on back-to-back days: 3-4
  [WARN] week 5: five weeks in a row without a cutback week (drop volume 20 to 30% every 3 to 4 weeks)
  [WARN] week 6: hard or long sessions on back-to-back days: 4-5, 5-6
'''

---

# Plan review: half marathon in 12 weeks

**Runner:** 20 km/week, 3 runs, longest recent run 9 km, intermediate, no recent injuries
**Goal:** finish strong   **Weeks:** 12 (race moved to week 12 by starting two weeks earlier)   **Days available:** Tue, Wed, Thu, Sat, Sun

## Checker result (before)
1 HIGH (peak in the week before the race, so no taper) and 5 WARN (start too high, a 29 percent jump in week 2, back-to-back hard days in weeks 2 and 6, no cutback week).

## What I changed and why
1. Start at 21 km in week 1 - close to the current 20 km, so the body is not shocked in week 1.
2. Grow about 2 km per week (6 to 10 percent) - removes the week 2 jump.
3. Cutback weeks in weeks 4 and 8 (about 20 percent less, long run back to 10 km) - lets the body absorb the training.
4. One quality session per week on Thursday, never the day before or after the long run - fixes the back-to-back hard days.
5. Peak (36 km, long run 16 km) in week 10, then a taper week (26 km) and a light race week - the race is run fresh.
6. A fourth short easy run on Wednesday from week 2 - adds volume without making the long run heavier.

## Final plan

| week | km | Tue | Wed | Thu | Sat | Sun |
|---|---|---|---|---|---|---|
| 1 | 21 | easy 5 | - | easy 6 + strides | long 10 | - |
| 2 | 23 | easy 5 | easy 3 | tempo 5 (2x8 min) | long 10 | - |
| 3 | 25 | easy 6 | easy 3 | tempo 5 (2x10 min) | long 11 | - |
| 4 | 20 | easy 5 | - | easy 5 | long 10 | - |
| 5 | 27 | easy 6 | easy 4 | intervals 6 (5x1 km) | long 11 | - |
| 6 | 29 | easy 6 | easy 4 | tempo 7 (3x10 min) | long 12 | - |
| 7 | 31 | easy 6 | easy 5 | intervals 7 (6x1 km) | long 13 | - |
| 8 | 25 | easy 6 | easy 4 | easy 5 | long 10 | - |
| 9 | 34 | easy 7 | easy 5 | tempo 7 (2x15 min) | long 15 | - |
| 10 | 36 | easy 7 | easy 6 | intervals 7 (5x1.6 km) | long 16 | - |
| 11 | 26 | easy 6 | easy 4 | tempo 5 (20 min at goal pace) | long 11 | - |
| 12 | 30.1 | easy 5 + strides | - | easy 4 | - | RACE 21.1 |

Week 5 also has an optional 40-minute bike ride on Monday.

## Checker result (after)
`python3 scripts/check_plan.py revised.md --race half --level intermediate --current-km 20` -> `Findings: 0`, exit code 0.

## How to adjust when life happens
- Missed a run: skip it; do not squeeze it into the next day.
- Missed a week: repeat the last week you completed, then continue.
- Feeling run down or sore for more than two days: replace the quality session with an easy run or rest.

## Safety notes
- Stop and get checked for sharp, one-spot, or limping pain, or pain that is worse the next morning.
- Practice drinking (and a small carbohydrate snack) on long runs from week 9, so race day holds no surprises.
FILE:scripts/check_plan.py
#!/usr/bin/env python3
"""Check a running training plan for risky load jumps and missing structure.

Usage:
  python3 check_plan.py plan.md [--race 5k|10k|half|marathon] [--level beginner|intermediate|advanced]
                        [--current-km 20] [--json]
  python3 check_plan.py plan.csv ...
  cat plan.md | python3 check_plan.py - ...

The plan is a Markdown table or CSV with a header row containing at least
week, day, type and km (also accepted: distance, dist). Optional columns are
ignored. One row per session; rest days may be listed or left out.
  day:  Mon..Sun, Monday..Sunday or 1..7
  type: easy, recovery, long, tempo, threshold, intervals, hills, fartlek,
        progression, race, cross, strength, rest  (anything else counts as easy)
  km:   number (use 0 for rest, cross and strength)

Checks per week: volume increase versus the highest of the previous three
weeks, long run share of the week (limit 50% under 30 km, 45% under 60 km,
40% above; race week excluded), long run jumps, number of hard days,
hard or long sessions on back-to-back days, rest days, and cutback weeks.
Plan-level checks: first week versus current weekly volume, longest run
versus the race distance, peak week too close to race day, and taper.
Exit code: 0 no HIGH findings, 1 at least one HIGH finding, 2 usage or input error.
Standard library only.
"""
import csv
import io
import json
import re
import sys

DAYS = {"mon": 1, "tue": 2, "wed": 3, "thu": 4, "fri": 5, "sat": 6, "sun": 7}
HARD = {"tempo", "threshold", "intervals", "interval", "hills", "hill", "fartlek", "progression", "race", "speed", "track"}
NON_RUN = {"rest", "cross", "strength", "off", "yoga", "bike", "swim"}
RACE_KM = {"5k": 5.0, "10k": 10.0, "half": 21.1, "marathon": 42.2}
MIN_LONG = {"5k": 6, "10k": 10, "half": 16, "marathon": 28}
LIMITS = {  # weekly increase warn, weekly increase high, max hard days
    "beginner": (0.10, 0.25, 1),
    "intermediate": (0.12, 0.30, 2),
    "advanced": (0.15, 0.35, 3),
}


def long_share_limit(week_km):
    """Low-volume weeks naturally have a bigger long-run share."""
    return 0.50 if week_km < 30 else 0.45 if week_km < 60 else 0.40


def usage(msg):
    print(f"error: {msg}\n", file=sys.stderr)
    print(__doc__.strip().split("\n\n")[1], file=sys.stderr)
    sys.exit(2)


def read_rows(text):
    lines = [ln for ln in text.splitlines() if ln.strip()]
    if not lines:
        return []
    if lines[0].lstrip().startswith("|") or sum(ln.count("|") >= 3 for ln in lines) > len(lines) / 2:
        rows = []
        for ln in lines:
            if "|" not in ln or re.match(r"^\s*\|?\s*:?-{2,}", ln):
                continue
            rows.append([c.strip() for c in ln.strip().strip("|").split("|")])
    else:
        rows = list(csv.reader(io.StringIO("\n".join(lines))))
    header = [h.strip().lower() for h in rows[0]]
    out = []
    for r in rows[1:]:
        out.append({header[i]: (r[i].strip() if i < len(r) else "") for i in range(len(header))})
    return out


def num(value):
    m = re.search(r"\d+(?:[.,]\d+)?", value or "")
    return float(m.group(0).replace(",", ".")) if m else 0.0


def parse(rows):
    if not rows:
        raise ValueError("no table rows found")
    keys = rows[0].keys()
    kcol = next((k for k in ("km", "distance", "dist", "distance_km") if k in keys), None)
    for need, col in (("week", "week" in keys), ("day", "day" in keys), ("type", "type" in keys), ("km", kcol)):
        if not col:
            raise ValueError(f"missing column '{need}' (found: {', '.join(keys)})")
    sessions = []
    for i, r in enumerate(rows, 2):
        w = num(r["week"])
        d = r["day"].strip().lower()
        day = DAYS.get(d[:3]) if d[:3] in DAYS else (int(d) if d.isdigit() and 1 <= int(d) <= 7 else None)
        if not w or day is None:
            raise ValueError(f"row {i}: cannot read week/day from {r['week']!r}/{r['day']!r}")
        t = (r["type"].strip().lower().split() or ["easy"])[0]
        km = num(r[kcol])
        sessions.append({"week": int(w), "day": day, "type": t, "km": 0.0 if t in NON_RUN else km})
    return sessions


def analyze(sessions, race, level, current_km):
    warn_up, high_up, max_hard = LIMITS[level]
    weeks = {}
    for s in sessions:
        weeks.setdefault(s["week"], []).append(s)
    findings, table = [], []

    def add(sev, week, msg):
        findings.append({"severity": sev, "week": week, "message": msg})

    prev_long = []
    week_nums = sorted(weeks)
    for idx, w in enumerate(week_nums):
        ss = sorted(weeks[w], key=lambda s: s["day"])
        runs = [s for s in ss if s["km"] > 0]
        total = round(sum(s["km"] for s in runs), 1)
        run_days = sorted({s["day"] for s in runs})
        longest = max((s["km"] for s in runs), default=0.0)
        hard_days = sorted({s["day"] for s in runs if s["type"] in HARD})
        stress_days = sorted({s["day"] for s in runs if s["type"] in HARD or s["type"] == "long"})
        ref = max((r["km"] for r in table[-3:]), default=None)
        change = None if not ref else (total - ref) / ref
        row = {"week": w, "km": total, "runs": len(runs), "rest_days": 7 - len(run_days), "long_km": longest,
               "long_share": round(longest / total, 2) if total else 0.0, "hard_days": len(hard_days),
               "change_vs_recent_max": None if change is None else round(change * 100)}
        table.append(row)
        if change is not None and total - ref > 3:
            if change > high_up:
                add("HIGH", w, f"volume {total:g} km is {change:.0%} above the recent max of {ref:g} km (limit {high_up:.0%})")
            elif change > warn_up:
                add("WARN", w, f"volume {total:g} km is {change:.0%} above the recent max of {ref:g} km (aim for {warn_up:.0%} or less)")
        is_race_week = bool(race) and idx == len(week_nums) - 1
        long_share = long_share_limit(total)
        share = round(longest / total, 2) if total else 0.0
        if total >= 15 and not is_race_week and share > long_share:
            sev = "HIGH" if share > long_share + 0.15 else "WARN"
            add(sev, w, f"long run {longest:g} km is {share:.0%} of the week's {total:g} km (aim for {long_share:.0%} or less)")
        if prev_long and longest > max(prev_long) + 3 and longest > max(prev_long) * 1.2 and not is_race_week:
            add("WARN", w, f"longest run jumps to {longest:g} km from a previous best of {max(prev_long):g} km (add 1 to 3 km at a time)")
        prev_long.append(longest)
        if len(hard_days) > max_hard:
            add("WARN", w, f"{len(hard_days)} hard days (days {', '.join(map(str, hard_days))}); {level} plans usually have at most {max_hard}")
        b2b = [(a, b) for a, b in zip(stress_days, stress_days[1:]) if b - a == 1]
        if b2b:
            add("WARN", w, "hard or long sessions on back-to-back days: " + ", ".join(f"{a}-{b}" for a, b in b2b))
        if len(run_days) == 7 and level != "advanced":
            add("WARN", w, "no rest day this week")

    # cutback weeks: in any 5 consecutive weeks of build-up, expect one week at least 15% below the week before
    build = [r for r in table]
    if race and len(build) >= 3:
        build = build[:-2]  # leave the taper out
    streak = 0
    for i, r in enumerate(build):
        if i and build[i - 1]["km"] and r["km"] <= build[i - 1]["km"] * 0.85:
            streak = 0
        else:
            streak += 1
        if streak == 5:
            add("WARN", r["week"], "five weeks in a row without a cutback week (drop volume 20 to 30% every 3 to 4 weeks)")
            streak = 0

    if current_km is not None and table:
        first = table[0]["km"]
        if current_km == 0 and first > 10:
            add("HIGH", table[0]["week"], f"week 1 starts at {first:g} km from no running; begin with run-walk sessions")
        elif current_km and (first - current_km) / current_km > high_up and first - current_km > 3:
            add("HIGH", table[0]["week"], f"week 1 is {first:g} km but current volume is {current_km:g} km/week ({(first - current_km) / current_km:.0%} jump)")
        elif current_km and (first - current_km) / current_km > warn_up and first - current_km > 3:
            add("WARN", table[0]["week"], f"week 1 is {first:g} km versus current {current_km:g} km/week")

    if race and table:
        peak = max(table, key=lambda r: r["km"])
        last = table[-1]["week"]
        race_rows = [s for s in sessions if s["type"] == "race"]
        if not race_rows:
            add("INFO", last, "no session with type 'race'; the last week is treated as race week")
        build_long = max((r["long_km"] for r in table[:-1]), default=0)
        if build_long < MIN_LONG[race]:
            add("HIGH" if race in ("half", "marathon") else "WARN", None,
                f"longest training run before race week is {build_long:g} km; for a {race} aim for at least {MIN_LONG[race]} km")
        if len(table) >= 3 and race in ("half", "marathon") and peak["week"] >= last - 1:
            add("HIGH", peak["week"], f"peak volume ({peak['km']:g} km) falls in week {peak['week']}, too close to race week {last}; peak 2 to 3 weeks out")
        if len(table) >= 2:
            race_km = sum(s["km"] for s in sessions if s["type"] == "race")
            race_week_other = table[-1]["km"] - race_km
            if peak["km"] and race_week_other > 0.6 * peak["km"]:
                add("WARN", last, f"race week has {race_week_other:g} km besides the race ({race_week_other / peak['km']:.0%} of peak); taper to about 40 to 60%")
    return table, findings


def main(argv):
    opts = {"race": None, "level": "intermediate", "current": None, "json": False}
    paths = []
    it = iter(argv)
    for a in it:
        if a == "--race":
            opts["race"] = (next(it, "") or "").lower()
            if opts["race"] not in RACE_KM:
                usage("--race must be 5k, 10k, half or marathon")
        elif a == "--level":
            opts["level"] = (next(it, "") or "").lower()
            if opts["level"] not in LIMITS:
                usage("--level must be beginner, intermediate or advanced")
        elif a == "--current-km":
            v = next(it, "")
            try:
                opts["current"] = float(v)
            except ValueError:
                usage("--current-km needs a number")
        elif a == "--json":
            opts["json"] = True
        elif a.startswith("--"):
            usage(f"unknown option {a}")
        else:
            paths.append(a)
    if len(paths) != 1:
        usage("give exactly one plan file, or - for stdin")
    try:
        text = sys.stdin.read() if paths[0] == "-" else open(paths[0], encoding="utf-8").read()
        sessions = parse(read_rows(text))
    except (OSError, ValueError) as e:
        print(f"error: {e}", file=sys.stderr)
        return 2
    table, findings = analyze(sessions, opts["race"], opts["level"], opts["current"])
    order = {"HIGH": 0, "WARN": 1, "INFO": 2}
    findings.sort(key=lambda f: (order[f["severity"]], f["week"] or 0))
    if opts["json"]:
        print(json.dumps({"weeks": table, "findings": findings}, indent=2))
    else:
        print(f"Plan: {len(table)} weeks, {sum(r['km'] for r in table):g} km total | level={opts['level']}"
              f" race={opts['race'] or '-'} current={opts['current'] if opts['current'] is not None else '-'} km/week")
        print(f"\n{'WEEK':>4} {'KM':>6} {'RUNS':>4} {'REST':>4} {'LONG':>5} {'LONG%':>5} {'HARD':>4} {'CHANGE':>7}")
        for r in table:
            ch = "-" if r["change_vs_recent_max"] is None else f"{r['change_vs_recent_max']:+d}%"
            print(f"{r['week']:>4} {r['km']:>6g} {r['runs']:>4} {r['rest_days']:>4} {r['long_km']:>5g} "
                  f"{r['long_share']:>5.0%} {r['hard_days']:>4} {ch:>7}")
        print(f"\nFindings: {len(findings)}")
        for f in findings:
            where = f"week {f['week']}" if f["week"] else "plan"
            print(f"  [{f['severity']}] {where}: {f['message']}")
        if not findings:
            print("  none - load progression looks reasonable")
    return 1 if any(f["severity"] == "HIGH" for f in findings) else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
```

Prompt from the public prompts.chat library (CC0), credited to its contributor.
