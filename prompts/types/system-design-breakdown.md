---
name: System Design Breakdown
description: Turns architecture, scalability and infrastructure content into a visual journey of a request through services, databases, queues, caches and external APIs.
kind: type
engine: article
aspect: "16:9"
duration: 75
content_types: [architecture_article, infrastructure, backend_engineering, scalability]
platforms: [youtube, linkedin, x]
visual_style: architecture_diagrams
style: isometric
for: [devtool, b2b, ai, solo]
---
# System Design Breakdown

**Goal:** the viewer can redraw the architecture from memory. Example: "How to Design a Job Queue for a SaaS Product".

## Inputs
- `title`: the article title.
- `content`: the source article (one URL).

## Structure and motion
1. **The requirement (5 s)** `title`: what the system must do and the scale or constraint that makes it hard.
2. **The big picture (8-10 s)** `sketch`: the whole architecture with every box labelled, built up one component at a time.
3. **Follow one request (4-6 numbered stages, 8 s each):** a highlighted packet travels through client, API, queue, workers, cache and database. Each stage shows a number badge and a one-line label.
4. **Bottlenecks (8 s):** the failing or slow component pulses; a callout names the limit and the fix the article chose.
5. **Trade-offs (8 s)** `bullets`: a two-column comparison of the option chosen vs the alternative.
6. **Outro (4 s):** the link to the article.

## Rules
- Draw only components the article mentions. Never add a cache, queue or service it does not describe.
- Number every stage and keep numbers consistent between the diagram and the narration.
- State every figure (latency, throughput, cost) exactly as the article does, with its unit.
- Each scene prompt specifies the layout, which element is highlighted and the direction of the data flow animation.
