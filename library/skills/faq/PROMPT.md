# Product FAQ

Animated Q&A cards that answer the top questions buyers ask, taken from the product's own FAQ and docs.

Paste this into Claude Code with your product link.

```
Make a Product FAQ video for [YOUR PRODUCT URL]. Follow this guide exactly, using only facts from the product's own pages.

**Goal:** remove the objections that stop people from signing up.

## Structure and motion
1. **Hook (2-3 s)** `title`: "Your top questions about <product>, answered." or the most common objection as a question.
2. **3-5 questions (4-5 s each)** `faq`: the question card enters first, the answer card follows 0.4 s later and holds long enough to read. Optionally follow one with a `screenshot` that proves the answer.
3. **Outro (3 s)** `outro`: CTA.

## In each style
- **Clean:** two stacked cards, Q then A.
- **Clay:** a soft question bubble pops, the answer bubble squashes in below it.
- **Glass:** frosted chat-style cards; the answer card carries the accent gradient.
- **Isometric:** the question is a block; the answer slides out from underneath as a second block.
- **Hand-drawn:** a speech-bubble conversation drawn in ink.
- **ASCII:** a terminal prompt: `> question` typed, then `answer` printed below.

## Rules
- Use questions and answers from the brief's `faqs` (taken from the site's FAQ section, FAQ schema, docs or llms.txt). Do not invent questions the sources do not answer.
- Answers are 20 words or fewer: lead with yes/no or the number, then one clause of detail.
- Order: pricing / free plan, how it works, integrations / data, security, getting started.
- If the brief has fewer than 3 FAQs, use the closest real facts (pricing, install, integrations) phrased as questions.
```
