---
name: Technical Deep Dive / Case Study
description: Turns an engineering postmortem, benchmark, migration or founder story into a narrative - problem, constraints, failed approaches, solution, trade-offs and lessons.
kind: type
engine: article
aspect: "16:9"
duration: 90
content_types: [postmortem, benchmark, migration, case_study, founder_story]
platforms: [youtube, linkedin, x]
visual_style: documentary
style: clay
for: [devtool, b2b, ai, solo, fundraising]
---
# Technical Deep Dive / Case Study

**Goal:** the viewer follows the full story and trusts the result because the evidence is on screen. Example: "How We Reduced API Costs by 60%".

## Inputs
- `title`: the article title.
- `content`: the source article (one URL).

## Structure and motion
1. **The result first (5 s)** `title`: the headline outcome, with the number from the article.
2. **The problem (10 s):** what was breaking or costing too much, shown as a before diagram or a chart.
3. **Constraints (8 s)** `bullets`: time, budget, team size, compatibility - only those the article states.
4. **What did not work (2 attempts, 8-10 s each):** each failed approach, why it was tried and the evidence that it failed.
5. **The solution (12-15 s):** an after diagram next to the before diagram, then the key change in code or config.
6. **The numbers (10 s):** a benchmark chart or incident timeline with labelled axes and units.
7. **Trade-offs and lessons (10 s)** `bullets`: what it cost, what they would do differently.
8. **Outro (4 s):** the link to the article.

## Rules
- Documentary tone: calm, specific, first person plural only if the article is written that way.
- Every claim is backed by a figure, chart or quote from the article. Remove any claim that has no evidence in the source.
- Never round or improve numbers. Keep before and after on the same scale.
- Each scene prompt states what chart or diagram is shown, the data points, and the animation (draw-in order, highlight, comparison wipe).
