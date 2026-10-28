# Lesson Plan Designer and Timing Checker

By @f · general
Language: en · Domains: education · Source: P01

Source page: https://prompts.chat

```
---
name: lesson-plan-timing-checker
description: Designs and reviews single-lesson plans for teachers, tutors, and trainers - writes measurable objectives, builds a timed sequence of activities that fits the period, and checks the plan for timing overruns, objectives without practice or assessment, long lecture blocks for the learners' age, and missing openings or closures. Use when a user asks for a lesson plan, shares one for feedback, needs to fit a lesson into a fixed period, or prepares a workshop or training session.
---

# Lesson Plan Designer and Timing Checker

You help educators plan lessons that fit the clock and actually reach their objectives. Every objective gets practice and a check for understanding, and every minute is accounted for.

## Files in this skill

- `scripts/check_lesson_plan.py` - parses a lesson plan in the template format and reports timing and alignment issues (Python 3 standard library only)
- `references/lesson-structure.md` - lesson phases, timing rules of thumb by age, and active learning patterns
- `references/objective-verbs.md` - measurable verbs by thinking level, and verbs to avoid
- `templates/lesson-plan.md` - the plan format the script reads
- `examples/example-photosynthesis-plan.md` - a full plan for a 50-minute grade 6 science lesson, with the checker output and fixes

## Workflow

### 1. Gather the context
Ask for (or assume and state): subject and topic, learner age or grade, period length in minutes, group size, prior knowledge, materials or technology available, and any learners who need adaptations. For adult training, ask about the learners' job context.

### 2. Write objectives
Two to four objectives, each starting with a measurable verb from `references/objective-verbs.md` and finishing the sentence "By the end of the lesson, learners will be able to ...". Give each an ID (O1, O2, ...).

### 3. Build the sequence
Follow the phases in `references/lesson-structure.md`: opening, instruction, guided practice, independent or group practice, check for understanding, closure. Assign minutes, a grouping (whole class, pairs, groups, individual), and the objective IDs each segment serves. Keep direct instruction blocks within the age guideline.

Write the plan in the format of `templates/lesson-plan.md` so it can be checked.

### 4. Check
'''bash
python3 scripts/check_lesson_plan.py plan.md
python3 scripts/check_lesson_plan.py plan.md --json
'''
The checker reports total time versus the period, objectives without practice or a check, unknown objective IDs, long instruction blocks, the teacher talk share, vague objective verbs, and missing opening or closure. Exit code 1 means at least one HIGH issue.

If scripts cannot run, do the same checks by hand and say so.

### 5. Revise and deliver
Fix every HIGH issue and explain the MEDIUM ones you kept on purpose. Deliver the final plan, a materials list, one adaptation for learners who need more support and one extension for fast finishers, and the checker summary, as in `examples/example-photosynthesis-plan.md`.

## Rules
- Keep the plan realistic: include transition time when the grouping changes, and a 3 to 5 minute buffer in plans over 40 minutes.
- Do not invent school policies, curriculum codes, or standards; ask for them or leave a placeholder.
- Keep safety in mind for practical activities (labs, sports, tools) and add a safety note when relevant.
- Use inclusive, age-appropriate examples.
FILE:references/lesson-structure.md
# Lesson Structure

## Phases (a common, flexible sequence)
| Phase | Purpose | Typical share of time |
|---|---|---|
| Opening (warm-up) | Activate prior knowledge, hook interest, share the objectives | 5-10 percent |
| Direct instruction | Model the new idea or skill, with examples | 15-25 percent |
| Guided practice | Learners try with support; teacher checks and corrects | 20-30 percent |
| Independent or group practice | Learners apply on their own or together | 20-30 percent |
| Check for understanding | Evidence that each objective was reached (exit ticket, quiz, demo) | 5-10 percent |
| Closure (wrap-up) | Summarize, connect to next lesson, reflect | 5 percent |

This follows the "I do, we do, you do" idea (gradual release of responsibility). Discussion-based or project lessons can reorder phases, but every objective still needs practice and a check.

## Segment types used by the checker
`warm-up`, `direct-instruction`, `guided-practice`, `independent-practice`, `group-work`, `discussion`, `check`, `transition`, `wrap-up`, `buffer`.

## Attention guideline for direct instruction
A rule of thumb: keep any single block of teacher explanation to roughly these limits, then switch to an activity, even a 1-minute pair talk.

| Learners | Max minutes per instruction block |
|---|---|
| Kindergarten to grade 2 | 8 |
| Grades 3-5 | 12 |
| Grades 6-8 | 15 |
| Grades 9-12 | 18 |
| Adults | 20 |

These are planning guidelines, not research limits; adjust for the group.

## Teacher talk share
Aim for direct instruction to be no more than about 40 percent of the lesson. More than that usually means too little practice.

## Active learning patterns (quick to insert)
- Think-pair-share (3-5 minutes)
- Mini whiteboards: everyone answers, teacher scans (2 minutes)
- Card sort or matching (5-10 minutes)
- Jigsaw groups for reading (15-20 minutes)
- Exit ticket: 2-3 questions mapped to the objectives (3-5 minutes)

## Timing tips
- Add 1-2 minutes of transition whenever grouping changes (whole class to groups).
- Plans over 40 minutes should keep a 3-5 minute buffer.
- Put the check for understanding before the closure, not after the bell.
FILE:references/objective-verbs.md
# Measurable Objective Verbs

Good objectives describe something you can see or hear learners do. Pattern:
"Learners will be able to [verb] [content] [condition or standard]."
Example: "Learners will be able to label the inputs and outputs of photosynthesis on a diagram with no more than one error."

## Verbs by thinking level (based on the revised Bloom's taxonomy)
| Level | Verbs |
|---|---|
| Remember | list, name, define, recall, label, identify |
| Understand | explain, describe, summarize, classify, compare, paraphrase |
| Apply | use, solve, calculate, demonstrate, apply, carry out |
| Analyze | distinguish, organize, examine, contrast, diagnose, outline |
| Evaluate | judge, justify, critique, defend, assess, recommend |
| Create | design, compose, construct, plan, produce, invent |

## Verbs to avoid (not observable)
understand, know, learn, appreciate, be aware of, be familiar with, grasp, realize, believe.
Rewrite them: "understand fractions" becomes "compare two fractions using a number line".

## Checklist for each objective
- Starts with one observable verb.
- Names the content precisely.
- Can be checked within this lesson (not "by the end of the year").
- Has at least one practice segment and one check that use it.
FILE:templates/lesson-plan.md
# Lesson: {{title}}
Subject: {{subject}}
Grade: {{K-12 number, K, or adult}}
Duration: {{period length in minutes, number only}}
Group size: {{number}}

## Objectives
- O1: {{measurable verb}} {{content}}
- O2: {{measurable verb}} {{content}}

## Materials
- {{item}}

## Segments
<!-- One line per segment: - [minutes] type | grouping | objective IDs (comma separated, or -) | what happens -->
<!-- type: warm-up, direct-instruction, guided-practice, independent-practice, group-work, discussion, check, transition, wrap-up, buffer -->
<!-- grouping: whole class, pairs, groups, individual -->
- [5] warm-up | whole class | O1 | {{hook or question}}
- [10] direct-instruction | whole class | O1 | {{what is modeled}}
- [10] guided-practice | pairs | O1, O2 | {{activity}}
- [15] independent-practice | individual | O2 | {{activity}}
- [5] check | individual | O1, O2 | {{exit ticket questions}}
- [5] wrap-up | whole class | - | {{summary and link to next lesson}}

## Adaptations
- Support: {{adaptation}}
- Extension: {{extension}}

## Safety notes
- {{only if relevant}}
FILE:examples/example-photosynthesis-plan.md
# Example: reviewing and fixing a grade 6 science plan

## First draft (as written by the teacher)

'''
# Lesson: How plants make food
Subject: Science
Grade: 6
Duration: 50
Group size: 26

## Objectives
- O1: Understand photosynthesis
- O2: Label the inputs and outputs of photosynthesis on a diagram
- O3: Explain why leaves are usually green

## Segments
- [5] warm-up | whole class | O1 | Show a wilted plant and a healthy plant: what is different?
- [25] direct-instruction | whole class | O1, O2 | Slides on chloroplasts, light, water, carbon dioxide, glucose, oxygen
- [15] guided-practice | pairs | O2 | Label a blank diagram together, then compare with another pair
- [10] check | individual | O2 | Exit ticket: label a new diagram
'''

## Checker output

'''
$ python3 scripts/check_lesson_plan.py draft.md
Lesson: How plants make food (grade 6, 50 min)
Planned: 55 min in 4 segments
[HIGH] plan: timing: Plan is 55 min but the period is 50 min (5 min over)
[HIGH] O1: no-practice: Objective O1 has no practice segment
[HIGH] O3: no-practice: Objective O3 has no practice segment
[MEDIUM] segment 2: long-instruction: Direct instruction of 25 min exceeds the 15 min guideline for grade 6
[MEDIUM] O1: no-check: Objective O1 is never checked (add a check segment)
[MEDIUM] O3: no-check: Objective O3 is never checked (add a check segment)
[MEDIUM] plan: talk-share: Direct instruction is 45% of planned time (guideline: 40% or less)
[MEDIUM] plan: closure: No wrap-up segment
[LOW] O1: vague-verb: Objective O1 starts with "understand"; use a measurable verb
[LOW] plan: no-buffer: Lesson over 40 min with no buffer segment; keep 3-5 min spare

3 HIGH, 5 MEDIUM, 2 LOW
'''

## Revised plan

'''
# Lesson: How plants make food
Subject: Science
Grade: 6
Duration: 50
Group size: 26

## Objectives
- O1: Describe in one sentence what plants need to make their own food
- O2: Label the inputs and outputs of photosynthesis on a diagram
- O3: Explain why leaves are usually green

## Segments
- [5] warm-up | whole class | O1 | Show a wilted plant and a healthy plant: what is different?
- [12] direct-instruction | whole class | O1, O2 | Short slides on light, water, carbon dioxide, glucose, oxygen
- [3] discussion | pairs | O1 | Think-pair-share: finish the sentence "Plants make food by ..."
- [10] guided-practice | pairs | O2 | Label a blank diagram together, then compare with another pair
- [2] transition | whole class | - | Hand out leaf samples and hand lenses
- [7] group-work | groups | O3 | Look at green and variegated leaves, record which parts are green and why
- [5] check | individual | O1, O2, O3 | Exit ticket: one sentence, one diagram, one "why green" question
- [3] wrap-up | whole class | - | Share two exit ticket answers, preview tomorrow's light experiment
- [3] buffer | whole class | - | Spare time; if unused, extend the leaf observation
'''

## Checker output after the fix

'''
$ python3 scripts/check_lesson_plan.py revised.md
Lesson: How plants make food (grade 6, 50 min)
Planned: 50 min in 9 segments

0 HIGH, 0 MEDIUM, 0 LOW
'''

## What changed and why
- Cut the lecture from 25 to 12 minutes and added a think-pair-share for O1, which fixes the attention guideline, the talk share, and the missing O1 practice.
- Rewrote O1 with a measurable verb ("describe").
- Added a group activity for O3 so every objective is practiced, and widened the exit ticket to check all three.
- Added a wrap-up, a transition, and a 3-minute buffer; the plan now fits exactly 50 minutes.

## Adaptations
- Support: a word bank (light, water, carbon dioxide, glucose, oxygen) printed on the diagram sheet.
- Extension: predict what happens to a plant kept in green light only, and explain why.
FILE:scripts/check_lesson_plan.py
#!/usr/bin/env python3
"""Check a lesson plan (templates/lesson-plan.md format) for timing and alignment.

Usage:
  python3 check_lesson_plan.py PLAN.md [--json]
  python3 check_lesson_plan.py - < PLAN.md

Reads the header fields (Grade, Duration), the objectives (- O1: ...) and the
segments (- [minutes] type | grouping | objective IDs | description), then
reports: total time versus the period, objectives without practice or a check,
unknown objective IDs, long direct-instruction blocks for the grade, the
teacher talk share, vague objective verbs, a missing opening or closure, and
a missing buffer in long lessons.
Exit code: 0 = no HIGH issues, 1 = at least one HIGH issue, 2 = cannot parse.
"""
import argparse
import json
import re
import sys

TYPES = {"warm-up", "direct-instruction", "guided-practice", "independent-practice",
         "group-work", "discussion", "check", "transition", "wrap-up", "buffer"}
PRACTICE = {"guided-practice", "independent-practice", "group-work", "discussion"}
VAGUE = {"understand", "know", "learn", "appreciate", "grasp", "realize", "believe",
         "be aware", "be familiar"}
SEG_RE = re.compile(r"^\s*-\s*\[(\d+)\]\s*([^|]+)\|([^|]*)\|([^|]*)\|(.*)$")
OBJ_RE = re.compile(r"^\s*-\s*(O\d+)\s*:\s*(.+)$", re.I)
FIELD_RE = re.compile(r"^\s*(Grade|Duration|Subject|Group size)\s*:\s*(.+?)\s*$", re.I)
TITLE_RE = re.compile(r"^#\s*Lesson\s*:\s*(.+)$", re.I)


def max_instruction(grade):
    g = str(grade).strip().lower()
    if g in ("k", "kindergarten"):
        return 8
    if g in ("adult", "adults", "university", "college"):
        return 20
    if g.isdigit():
        n = int(g)
        return 8 if n <= 2 else 12 if n <= 5 else 15 if n <= 8 else 18
    return 15


def parse(text):
    plan = {"title": None, "grade": None, "duration": None, "objectives": {}, "segments": []}
    for line in text.splitlines():
        if line.strip().startswith("<!--"):
            continue
        if m := TITLE_RE.match(line):
            plan["title"] = m.group(1).strip()
        elif m := FIELD_RE.match(line):
            key, val = m.group(1).lower(), m.group(2)
            if key == "grade":
                plan["grade"] = val
            elif key == "duration":
                num = re.match(r"\d+", val)
                plan["duration"] = int(num.group()) if num else None
        elif m := SEG_RE.match(line):
            ids = [x.strip().upper() for x in m.group(4).split(",") if x.strip() and x.strip() != "-"]
            plan["segments"].append({
                "minutes": int(m.group(1)), "type": m.group(2).strip().lower(),
                "grouping": m.group(3).strip().lower(), "objectives": ids,
                "description": m.group(5).strip()})
        elif m := OBJ_RE.match(line):
            plan["objectives"][m.group(1).upper()] = m.group(2).strip()
    return plan


def check(plan):
    issues = []

    def add(sev, where, code, msg):
        issues.append({"severity": sev, "where": where, "code": code, "message": msg})

    segs, objs, dur = plan["segments"], plan["objectives"], plan["duration"]
    total = sum(s["minutes"] for s in segs)
    if dur is None:
        add("HIGH", "header", "no-duration", "Missing 'Duration: <minutes>' line")
    elif total > dur:
        add("HIGH", "plan", "timing", f"Plan is {total} min but the period is {dur} min ({total - dur} min over)")
    elif dur - total > 5:
        add("MEDIUM", "plan", "timing", f"Plan is {total} min, {dur - total} min shorter than the {dur} min period")
    if not objs:
        add("HIGH", "objectives", "no-objectives", "No objectives found (- O1: ...)")
    for i, s in enumerate(segs, 1):
        if s["type"] not in TYPES:
            add("MEDIUM", f"segment {i}", "unknown-type", f"Unknown segment type '{s['type']}'")
        for oid in s["objectives"]:
            if oid not in objs:
                add("HIGH", f"segment {i}", "unknown-objective", f"Segment refers to {oid}, which is not defined")
    limit = max_instruction(plan["grade"] or "")
    for i, s in enumerate(segs, 1):
        if s["type"] == "direct-instruction" and s["minutes"] > limit:
            add("MEDIUM", f"segment {i}", "long-instruction",
                f"Direct instruction of {s['minutes']} min exceeds the {limit} min guideline for grade {plan['grade']}")
    for oid, text in objs.items():
        practiced = any(oid in s["objectives"] and s["type"] in PRACTICE for s in segs)
        checked = any(oid in s["objectives"] and s["type"] == "check" for s in segs)
        if not practiced:
            add("HIGH", oid, "no-practice", f"Objective {oid} has no practice segment")
        if not checked:
            add("MEDIUM", oid, "no-check", f"Objective {oid} is never checked (add a check segment)")
        first = text.lower().split()
        if first and (first[0] in VAGUE or " ".join(first[:2]) in VAGUE):
            add("LOW", oid, "vague-verb", f"Objective {oid} starts with \"{first[0]}\"; use a measurable verb")
    if total:
        talk = sum(s["minutes"] for s in segs if s["type"] == "direct-instruction")
        share = round(100 * talk / total)
        if share > 40:
            add("MEDIUM", "plan", "talk-share", f"Direct instruction is {share}% of planned time (guideline: 40% or less)")
    types = [s["type"] for s in segs]
    if segs and "warm-up" not in types:
        add("LOW", "plan", "opening", "No warm-up segment")
    if segs and "wrap-up" not in types:
        add("MEDIUM", "plan", "closure", "No wrap-up segment")
    if dur and dur > 40 and "buffer" not in types and total >= dur:
        add("LOW", "plan", "no-buffer", "Lesson over 40 min with no buffer segment; keep 3-5 min spare")
    return total, issues


def main(argv=None):
    ap = argparse.ArgumentParser(description="Check a lesson plan for timing and alignment.")
    ap.add_argument("file", help="plan file in templates/lesson-plan.md format, or - for stdin")
    ap.add_argument("--json", action="store_true", help="print JSON")
    a = ap.parse_args(argv)
    try:
        text = sys.stdin.read() if a.file == "-" else open(a.file, encoding="utf-8").read()
    except OSError as e:
        print(f"error: {e}", file=sys.stderr)
        return 2
    plan = parse(text)
    if not plan["segments"]:
        print("error: no segments found; use lines like '- [10] guided-practice | pairs | O1 | ...'", file=sys.stderr)
        return 2
    total, issues = check(plan)
    order = {"HIGH": 0, "MEDIUM": 1, "LOW": 2}
    issues.sort(key=lambda x: order[x["severity"]])
    if a.json:
        print(json.dumps({"plan": plan, "planned_minutes": total, "issues": issues}, indent=2))
    else:
        print(f"Lesson: {plan['title'] or '(untitled)'} (grade {plan['grade'] or '?'}, {plan['duration'] or '?'} min)")
        print(f"Planned: {total} min in {len(plan['segments'])} segments")
        for i in issues:
            print(f"[{i['severity']}] {i['where']}: {i['code']}: {i['message']}")
        c = {k: sum(1 for i in issues if i["severity"] == k) for k in order}
        print(f"\n{c['HIGH']} HIGH, {c['MEDIUM']} MEDIUM, {c['LOW']} LOW")
    return 1 if any(i["severity"] == "HIGH" for i in issues) else 0


if __name__ == "__main__":
    sys.exit(main())
```

Prompt from the public prompts.chat library (CC0), credited to its contributor.
