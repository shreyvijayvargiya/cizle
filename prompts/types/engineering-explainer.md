---
name: Engineering Explainer
description: Turns a technical blog, tutorial or architecture article into a structured visual lesson with diagrams, code highlights and step-by-step narration.
kind: type
engine: article
aspect: "16:9"
duration: 60
content_types: [technical_blog, programming_tutorial, architecture_article]
platforms: [youtube, linkedin, x]
visual_style: animated_diagrams
style: sketch
for: [devtool, ai, b2b, solo]
---
# Engineering Explainer

**Goal:** a technical reader understands how one system works after one watch. Example: "How React Server Components Actually Work".

## Inputs
- `title`: the article title.
- `content`: the source article (one URL).

## Structure and motion
1. **The question (4-5 s)** `title`: the problem in one line, as a question the reader already has.
2. **The mental model (8-10 s)** `sketch`: a diagram with 3-5 labelled components. Components appear one by one as the narration names them.
3. **How it works, step by step (3-5 steps, 8-10 s each)** `sketch` or `code`: one step per scene, numbered. Highlight the line or component that matters, dim the rest. Arrows animate in the direction data flows.
4. **The gotcha (6 s)** `bullets`: the most common misunderstanding or trade-off.
5. **Recap and outro (5 s)** `bullets` then `outro`: three takeaways, then the link to the article.

## Rules
- Use only facts, names and code from the article. Never invent benchmarks, APIs or version numbers.
- One idea per video. Name the concept in plain words first, the jargon second.
- Code scenes are 12 lines or fewer, copied from the article, with a caption saying what to notice.
- Narration explains what the diagram shows; it never reads code symbol by symbol.
- Every scene's prompt for a video model states the diagram layout, the animation order and the on-screen labels.
