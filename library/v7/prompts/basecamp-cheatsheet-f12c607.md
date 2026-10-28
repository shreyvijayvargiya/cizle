# Basecamp cheatsheet

By @dillonbowen123@gmail.com · general
Language: en · Domains: health · Source: P01

Source page: https://prompts.chat

```
Generate a single-page, print-optimized cheat sheet + pocket reference card for Basecamp + the official Basecamp CLI (basecamp).

Design constraints (non-negotiable):
- One US Letter page (8.5×11"), portrait, 0.4" margins maximum.
- High-density but instantly scannable. Zero fluff. Every line earns its space.
- Visual hierarchy: bold section headers, monospace for every command, subtle visual separators.
- Two logical zones on the page:
  1. Left 60% → Core CLI reference (commands + patterns)
  2. Right 40% → Agent invariants, profiles, config, mental models, troubleshooting
- Bottom strip (full width) → One-line “Daily Agent Loop” and the single most important rule.
- Use pure Markdown + minimal CSS that prints cleanly (or generate a polished PDF/DOCX if the tool supports it). No decorative graphics that waste ink or space.
- Must be usable both as a desk reference (printed once, laminated preferred) and as a quick “always look at” card.

Content requirements (drawn from Basecamp CLI Mastery principles):

1. Installation & Auth (ultra-compact)
2. Profiles (multi-agent identities) — create / set-default / per-command usage
3. Project-local config (.basecamp/config.json) — exact recommended structure + how agents must use it
4. Agent Invariants (the 6 non-negotiable rules) — numbered, bold, impossible to miss
5. Output modes table: --json / --agent / --jq / --md / --ids-only + when to use each
6. Core command patterns (the real workhorses only):
   - Discovery & navigation
   - Todos (create, list, complete, assign, sweep, due dates)
   - Cards / Kanban (create, move, done)
   - Messages / Chat / Comments (including deterministic mentions)
   - Files & attachments
   - Reports, gauges, schedule
7. Breadcrumb chaining & --agent --help introspection habit
8. Mentions pattern: [@Name](mention:SGID) preferred form
9. Daily agent loop pattern (one tight example)
10. Troubleshooting one-liners (doctor, auth, noninteractive, config check)

Tone & style of the sheet itself:
- Extremely high signal. Ruthless prioritization.
- Commands shown with the most common useful flags already attached.
- Prefer real, copy-pasteable examples over abstract descriptions.
- Assume the reader is an AI agent or power user who will run these in a terminal.

Output format preference:
- First deliver a clean, print-ready Markdown version that can be pasted into a browser or Markdown-to-PDF tool.
- If the environment supports it, also produce a polished single-page PDF optimized for printing (high contrast, no color backgrounds that waste ink).

Finally, add a tiny footer line: “Basecamp CLI Mastery — Agent-First Reference | Follow the breadcrumbs.”

Make the sheet so good that someone would actually print it, laminate it, and keep it next to their keyboard forever.
```

Prompt from the public prompts.chat library (CC0), credited to its contributor.
