# Household Chore Rotation Planner

By @f · general
Language: en · Domains: data, health · Source: P01

Source page: https://prompts.chat

```
---
name: household-chore-rotation-planner
description: Plans a fair, rotating weekly chore schedule for a household: weighs each chore by minutes and frequency, respects capacity shares and "cannot do" limits, rotates jobs week to week, and reports each person's load against a fair target. Use when roommates or families argue about chores or ask "who does what this month?". Includes a stdlib Python planner with --self-test.
---

# Household Chore Rotation Planner

You help households (roommates, couples, families with kids) split chores fairly and rotate them so nobody is stuck with the worst jobs forever. You measure fairness in minutes, not in number of tasks, adjust for each person's capacity, respect real limits (age, allergies, health, skills), and produce a schedule people can stick on the fridge. You stay neutral and kind; you never take sides in a household argument.

## Files in this skill

- `scripts/chore_rotation.py` - builds a multi-week rotation from a JSON list of people and chores and reports minutes vs fair target per person (Python 3 standard library only)
- `references/chore-time-estimates.md` - typical minutes for common chores to use as defaults
- `references/fairness-and-agreements.md` - how to set shares, handle swaps, and run a short house meeting
- `templates/rotation-chart.md` - printable weekly chart plus a house agreement section
- `examples/household.json` - four-person sample household with constraints

## Workflow

### 1. Gather the household
Ask for:
- People and their capacity: full share (1.0), reduced share (for example 0.5 for a young child or someone working night shifts), or larger share by agreement
- Hard limits: chores someone cannot do (`cannot`), or chores only certain people can do (`only`, for example cooking or driving)
- Chores with realistic minutes per session and times per week; use `references/chore-time-estimates.md` when unsure
- How many weeks to plan (4 is a good default) and any preferences ("I would rather cook than clean the bathroom")

### 2. Build the input and run the planner
'''
python3 scripts/chore_rotation.py examples/household.json
python3 scripts/chore_rotation.py my-house.json --weeks 6 --json
python3 scripts/chore_rotation.py --self-test
'''
Exit code 1 means a chore has no eligible person (fix the `cannot`/`only` lists); 2 means bad input.

### 3. Check fairness
Read the "Overall fairness" table. Within about 10% of target is good. If someone is far off, adjust minutes, split a big chore (for example "Laundry - wash" and "Laundry - fold"), or change shares by agreement, then rerun.

### 4. Apply preferences
The planner balances minutes; it does not know who hates what. Offer swaps of similar minutes between people, and keep the totals close. If a heavy chore lands on the same person every week because of constraints, say so and suggest splitting it.

### 5. Deliver
Fill `templates/rotation-chart.md` with the weekly tables, a short house agreement (swap rules, what "done" means, a monthly check-in), and a friendly group message under 80 words announcing the plan.

## Rules

- Fairness is measured in minutes weighted by agreed shares, not task counts.
- Never assign unsafe chores to children (sharp tools, strong chemicals, ladders, hot ovens without supervision).
- Keep the tone neutral; describe loads with numbers, not blame.
- Invisible work counts: planning meals, booking repairs, and buying supplies can be added as chores with minutes.
FILE:references/chore-time-estimates.md
# Typical chore times (defaults, adjust to your home)

| Chore | Minutes per session | Common frequency |
|---|---|---|
| Dishes / load and unload dishwasher | 15-25 | daily |
| Cook dinner | 30-60 | 3-7 per week |
| Meal planning and grocery list | 20-30 | weekly |
| Grocery run | 45-75 | weekly |
| Laundry (wash, dry, fold, put away) | 40-60 per load | 2-4 loads per week |
| Bathroom clean (sink, toilet, shower, floor) | 30-45 | weekly |
| Kitchen deep clean (counters, stovetop, fridge wipe) | 30-40 | weekly |
| Vacuum and mop | 30-45 | 1-2 per week |
| Dusting | 15-20 | weekly |
| Trash and recycling out | 5-10 | 2-3 per week |
| Change bed linens | 15 per bed | every 1-2 weeks |
| Water plants | 5-15 | 2 per week |
| Pet feeding | 5 | daily, often twice |
| Litter box / pet cleanup | 5 | daily |
| Dog walk | 20-30 | 1-3 per day |
| Mow lawn | 40-60 | weekly in season |
| Clean oven | 30-45 | monthly |
| Pay bills and admin | 20-30 | weekly |

Tips
- Time one session with a phone timer if people disagree about how long a chore takes.
- Split chores that are both long and unpopular so they can rotate more easily.
- Seasonal chores (snow shoveling, gutters) can be added only for the weeks they apply.
FILE:references/fairness-and-agreements.md
# Fairness and house agreements

## Setting shares
- Start everyone at 1.0. Lower shares only by explicit agreement (age, health, very long work hours, exams).
- Children: roughly 0.25-0.5 with age-appropriate chores only.
- Someone who pays more rent or does more invisible work may get a lower chore share; write it down.

## What "done" means
Agree on a one-line definition per chore, for example "Dishes: sink empty, counters wiped, dishwasher running".

## Swaps
- Swaps are fine if both people agree and minutes are similar.
- Post swaps in the group chat so nobody is surprised.
- A missed chore is made up within 48 hours or swapped, not silently skipped.

## 15-minute monthly check-in
1. Each person: one thing working, one thing not (2 minutes each).
2. Look at the fairness table; adjust minutes or shares if reality changed.
3. Decide on one improvement for next month.
4. Regenerate the rotation.

## Handling conflict
- Talk about the system, not the person ("Bathroom keeps slipping on Thursdays" instead of "You never clean").
- If one person carries far more invisible work, add it to the chore list with minutes.
FILE:templates/rotation-chart.md
# Chore Rotation - <household name>

**Period:** <start date> to <end date>  **People:** <names and shares>

## Week 1 (<dates>)
| Chore | Who | Done? |
|---|---|---|
| | | [ ] |

## Week 2 (<dates>)
| Chore | Who | Done? |
|---|---|---|
| | | [ ] |

## Fairness (minutes)
| Person | Share | Minutes | Target | Deviation |
|---|---|---|---|---|

## House agreement
- "Done" means:
- Swap rule:
- Missed chore rule:
- Monthly check-in date:

## Group message
> Hi all! New chore rotation for <period> is on the fridge and pinned here. Loads are balanced by time. Swaps are fine, just post them. Check-in on <date>.
FILE:examples/household.json
{
  "weeks": 4,
  "people": [
    {"name": "Leyla", "share": 1.0},
    {"name": "Tom", "share": 1.0, "cannot": ["Litter box"]},
    {"name": "Deniz", "share": 0.5, "cannot": ["Clean oven", "Mow lawn"]},
    {"name": "Sam", "share": 0.75}
  ],
  "chores": [
    {"name": "Dishes", "minutes": 20, "times_per_week": 7},
    {"name": "Cook dinner", "minutes": 45, "times_per_week": 3, "only": ["Leyla", "Tom", "Sam"]},
    {"name": "Laundry", "minutes": 40, "times_per_week": 2},
    {"name": "Bathroom clean", "minutes": 40, "times_per_week": 1},
    {"name": "Vacuum and mop", "minutes": 35, "times_per_week": 2},
    {"name": "Trash and recycling", "minutes": 10, "times_per_week": 3},
    {"name": "Grocery run", "minutes": 60, "times_per_week": 1},
    {"name": "Litter box", "minutes": 5, "times_per_week": 7},
    {"name": "Water plants", "minutes": 10, "times_per_week": 2},
    {"name": "Mow lawn", "minutes": 50, "times_per_week": 1},
    {"name": "Clean oven", "minutes": 30, "times_per_week": 1}
  ]
}
FILE:scripts/chore_rotation.py
#!/usr/bin/env python3
"""Fair household chore rotation planner (Python 3 standard library only).

Input JSON:
{
  "weeks": 4,
  "people": [{"name": "Ana", "share": 1.0, "cannot": ["Mow lawn"]}, ...],
  "chores": [{"name": "Dishes", "minutes": 20, "times_per_week": 7, "only": ["Ana", "Ben"]}, ...]
}
  share: relative capacity (1.0 = normal; 0.5 = half load, e.g. a child or someone with long shifts)
  cannot / only: hard constraints (allergies, age, physical limits, skills)

Algorithm per week: chores sorted by weekly minutes (largest first) go to the eligible person with the
lowest (load / share); ties are broken in favor of someone who did NOT have that chore last week,
so chores rotate. Reports per-person minutes, target minutes, and deviation.
Exit code: 0 OK, 1 if a chore has no eligible person, 2 on bad input.
"""
import argparse
import json
import sys


class PlanError(ValueError):
    pass


def validate(data):
    people = data.get("people") or []
    chores = data.get("chores") or []
    if not people:
        raise PlanError("need at least one person")
    if not chores:
        raise PlanError("need at least one chore")
    names = [p["name"] for p in people]
    if len(set(names)) != len(names):
        raise PlanError("duplicate person names")
    for p in people:
        if float(p.get("share", 1.0)) <= 0:
            raise PlanError(f"share must be > 0 for {p['name']}")
    for c in chores:
        if float(c.get("minutes", 0)) <= 0 or float(c.get("times_per_week", 1)) <= 0:
            raise PlanError(f"minutes and times_per_week must be > 0 for {c.get('name')}")
        for n in c.get("only", []):
            if n not in names:
                raise PlanError(f"chore {c['name']} lists unknown person {n}")
    return people, chores


def weekly_minutes(chore):
    return float(chore["minutes"]) * float(chore.get("times_per_week", 1))


def eligible(person, chore):
    if chore.get("only") and person["name"] not in chore["only"]:
        return False
    return chore["name"] not in person.get("cannot", [])


def plan_week(people, chores, last_week=None):
    """Return (assignment {chore: person}, loads {person: minutes}, unassigned [chore])."""
    last_week = last_week or {}
    loads = {p["name"]: 0.0 for p in people}
    assignment = {}
    unassigned = []
    order = sorted(chores, key=lambda c: (-weekly_minutes(c), c["name"]))
    for c in order:
        cands = [p for p in people if eligible(p, c)]
        if not cands:
            unassigned.append(c["name"])
            continue
        w = weekly_minutes(c)

        def key(p):
            share = float(p.get("share", 1.0))
            after = (loads[p["name"]] + w) / share
            repeat = 1 if last_week.get(c["name"]) == p["name"] else 0
            return (round(after, 6), repeat, p["name"])

        # prefer rotation when loads are close: compare within a 10% band of the best option
        ranked = sorted(cands, key=key)
        best = key(ranked[0])[0]
        band = [p for p in ranked if key(p)[0] <= best * 1.10 + 1e-9]
        band.sort(key=lambda p: (key(p)[1], key(p)[0], p["name"]))
        chosen = band[0]
        assignment[c["name"]] = chosen["name"]
        loads[chosen["name"]] += w
    return assignment, loads, unassigned


def fairness(people, loads):
    total = sum(loads.values())
    total_share = sum(float(p.get("share", 1.0)) for p in people)
    rows = []
    for p in people:
        target = total * float(p.get("share", 1.0)) / total_share
        got = loads[p["name"]]
        dev = (got - target) / target * 100 if target else 0.0
        rows.append({"name": p["name"], "minutes": round(got, 1), "target": round(target, 1),
                     "deviation_pct": round(dev, 1)})
    return rows


def plan(data):
    people, chores = validate(data)
    weeks = int(data.get("weeks", 4))
    result = []
    cumulative = {p["name"]: 0.0 for p in people}
    last = None
    for wk in range(1, weeks + 1):
        assignment, loads, unassigned = plan_week(people, chores, last)
        for k, v in loads.items():
            cumulative[k] += v
        result.append({"week": wk, "assignment": assignment, "fairness": fairness(people, loads),
                       "unassigned": unassigned})
        last = assignment
    return {"weeks": result, "overall": fairness(people, cumulative)}


def render(res):
    out = []
    for w in res["weeks"]:
        out.append(f"## Week {w['week']}")
        out.append("| Chore | Who |")
        out.append("|---|---|")
        for chore, who in sorted(w["assignment"].items()):
            out.append(f"| {chore} | {who} |")
        for u in w["unassigned"]:
            out.append(f"| {u} | UNASSIGNED (no eligible person) |")
        out.append("")
    out.append("## Overall fairness (minutes across all weeks)")
    out.append("| Person | Minutes | Target | Deviation |")
    out.append("|---|---|---|---|")
    for r in res["overall"]:
        out.append(f"| {r['name']} | {r['minutes']} | {r['target']} | {r['deviation_pct']:+.1f}% |")
    return "\n".join(out)


def self_test():
    base = {
        "weeks": 4,
        "people": [{"name": "Ana"}, {"name": "Ben"}, {"name": "Cem", "share": 0.5, "cannot": ["Mow lawn"]}],
        "chores": [
            {"name": "Dishes", "minutes": 20, "times_per_week": 7},
            {"name": "Laundry", "minutes": 60, "times_per_week": 2},
            {"name": "Bathroom", "minutes": 45, "times_per_week": 1},
            {"name": "Vacuum", "minutes": 30, "times_per_week": 2},
            {"name": "Trash", "minutes": 5, "times_per_week": 3},
            {"name": "Mow lawn", "minutes": 50, "times_per_week": 1},
            {"name": "Feed cat", "minutes": 5, "times_per_week": 14, "only": ["Cem", "Ana"]},
        ],
    }
    res = plan(base)
    w1 = res["weeks"][0]["assignment"]
    lawn_never_cem = all(w["assignment"]["Mow lawn"] != "Cem" for w in res["weeks"])
    cat_ok = all(w["assignment"]["Feed cat"] in ("Cem", "Ana") for w in res["weeks"])
    dishes_people = {w["assignment"]["Dishes"] for w in res["weeks"]}
    overall = {r["name"]: r for r in res["overall"]}
    max_dev = max(abs(r["deviation_pct"]) for r in res["overall"])
    two = plan({"weeks": 2, "people": [{"name": "A"}, {"name": "B"}],
                "chores": [{"name": "X", "minutes": 10}, {"name": "Y", "minutes": 10}]})
    rotated = two["weeks"][0]["assignment"]["X"] != two["weeks"][1]["assignment"]["X"]
    orphan = plan({"weeks": 1, "people": [{"name": "A", "cannot": ["Z"]}], "chores": [{"name": "Z", "minutes": 5}]})
    errors = []
    for bad in ({"people": [], "chores": [{"name": "x", "minutes": 1}]},
                {"people": [{"name": "A"}, {"name": "A"}], "chores": [{"name": "x", "minutes": 1}]},
                {"people": [{"name": "A", "share": 0}], "chores": [{"name": "x", "minutes": 1}]},
                {"people": [{"name": "A"}], "chores": [{"name": "x", "minutes": 0}]},
                {"people": [{"name": "A"}], "chores": [{"name": "x", "minutes": 1, "only": ["Q"]}]}):
        try:
            plan(bad)
            errors.append(False)
        except PlanError:
            errors.append(True)
    cases = [
        ("all_chores_assigned_w1", len(w1), 7),
        ("weekly_minutes", weekly_minutes(base["chores"][0]), 140.0),
        ("cannot_respected", lawn_never_cem, True),
        ("only_respected", cat_ok, True),
        ("dishes_rotate", len(dishes_people) >= 2, True),
        ("half_share_lower_load", overall["Cem"]["minutes"] < overall["Ana"]["minutes"], True),
        ("overall_fair_within_25pct", max_dev <= 25.0, True),
        ("targets_sum_to_total", round(sum(r["target"] for r in res["overall"]), 0) == round(sum(r["minutes"] for r in res["overall"]), 0), True),
        ("equal_tie_rotates", rotated, True),
        ("orphan_reported", orphan["weeks"][0]["unassigned"], ["Z"]),
        ("bad_inputs_rejected", errors, [True] * 5),
        ("render_has_header", render(res).startswith("## Week 1"), True),
    ]
    failed = 0
    for name, got, expected in cases:
        ok = got == expected
        failed += not ok
        print(f"{'PASS' if ok else 'FAIL'}  {name}: got={got!r} expected={expected!r}")
    print(f"\n{len(cases) - failed}/{len(cases)} passed")
    return 1 if failed else 0


def main(argv=None):
    p = argparse.ArgumentParser(description="Plan a fair, rotating household chore schedule.")
    p.add_argument("input", nargs="?", help="JSON file with weeks, people, chores")
    p.add_argument("--weeks", type=int, help="override number of weeks")
    p.add_argument("--json", action="store_true")
    p.add_argument("--self-test", action="store_true")
    a = p.parse_args(argv)
    if a.self_test:
        return self_test()
    if not a.input:
        p.error("give an input JSON file, or --self-test")
    try:
        with open(a.input, encoding="utf-8") as fh:
            data = json.load(fh)
        if a.weeks:
            data["weeks"] = a.weeks
        res = plan(data)
    except (OSError, json.JSONDecodeError, PlanError, KeyError) as e:
        print(f"error: {e}", file=sys.stderr)
        return 2
    print(json.dumps(res, indent=2) if a.json else render(res))
    return 1 if any(w["unassigned"] for w in res["weeks"]) else 0


if __name__ == "__main__":
    sys.exit(main())
```

Prompt from the public prompts.chat library (CC0), credited to its contributor.
