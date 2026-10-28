# Prompt 02: LLM Wiki Repo Explainer

By @tonbistudio · prompts
Language: en · Domains: data, education, scifi · Source: M03

Source page: https://github.com/tonbistudio/hyperframes-prompts/blob/HEAD/prompts/02-llm-wiki-repo.md

```
Create a 35-second 16:9 HyperFrames repo explainer for the LLM Wiki demo.

Source material:
Use the LLM Wiki repo or implementation source provided in this project.
If a repo URL is available, inspect the README, file tree, examples, CLI commands, and architecture before writing the final composition.
Also use Andrej Karpathy's LLM Wiki pattern as conceptual background:
https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f

If the featured implementation is llm-wiki, use:
https://github.com/tonbistudio/llm-wiki

Goal:
Explain why an LLM Wiki is useful and show the implementation as a practical repo people can understand quickly.

Audience:
AI builders, research-heavy founders, agent builders, and technical viewers who understand the pain of scattered notes, repeated RAG queries, and context that does not compound.

Core idea:
Traditional RAG rediscovers knowledge at query time. An LLM Wiki compiles knowledge into a persistent, interlinked markdown knowledge base that gets better over time.

Suggested hook:
"RAG forgets. Wikis compound."

Format:
35 seconds, 16:9 landscape, 1920x1080.
Technical but visually clean.
No talking head.
The video should work silently with captions.

Visual style:
Use Swiss Pulse with Data Drift accents.
Clean technical diagrams, markdown pages, file trees, terminal commands, graph connections, and subtle neural/data atmosphere.

Use:
- dark or off-white technical background
- markdown document cards
- file tree animation
- wikilink graph nodes
- terminal typing
- flowchart from raw sources to wiki pages to query answers
- code snippets only where they help
- clean labels, large readable type

Avoid:
- pretending it is a chatbot app if it is not
- inventing features not in the repo
- vague AI brain visuals
- generic robot imagery
- unreadable code walls
- over-explaining implementation details

Scene structure:

Scene 1: 0-4 seconds
Hook.
Open on many scattered source cards: papers, articles, transcripts, notes, links.
A query box asks the same question repeatedly.
The cards shuffle and reset, implying repeated rediscovery.

Text:
"RAG forgets."

Then cut to a structured markdown wiki graph.

Text:
"Wikis compound."

Motion:
- scattered cards drift
- query resets
- hard cut into organized graph
- graph links snap into place

Scene 2: 4-10 seconds
Problem.
Show a simple before/after.

Before:
Raw docs go into a query and produce a one-off answer.

After:
Raw docs become pages, pages link to each other, and answers draw from persistent structure.

Caption:
"Stop re-reading the same sources from scratch."

Motion:
- left side fades as one-off answer disappears
- right side grows into interlinked pages
- arrows connect source to entity page to concept page to query answer

Scene 3: 10-17 seconds
Architecture.
Show the LLM Wiki structure as a clean file tree:

wiki/
  SCHEMA.md
  index.md
  log.md
  raw/
  entities/
  concepts/
  comparisons/
  queries/

Caption:
"A knowledge base made of plain markdown."

Motion:
- terminal command initializes the wiki
- folders expand one by one
- markdown pages slide out from folders
- wikilinks appear between pages

Scene 4: 17-24 seconds
Ingest flow.
Show one source being ingested.

Flow:
source URL or paper
raw markdown capture
entity extraction
concept extraction
cross-references
index update
log entry

Caption:
"Each source strengthens the graph."

Motion:
- source card moves through pipeline
- key entities highlight
- new pages appear
- graph gains 3 to 5 new edges
- log entry stamps in

Scene 5: 24-30 seconds
Query payoff.
Show a question entering the wiki.
Instead of searching the web from scratch, the answer is synthesized from existing pages.
Show cited page cards:
[[entity-page]]
[[concept-page]]
[[comparison-page]]

Caption:
"Answers come from compiled knowledge, not vibes."

Motion:
- query enters search box
- relevant pages light up
- answer panel assembles from page snippets
- citations snap into the bottom of the frame

Scene 6: 30-35 seconds
Repo CTA.
Show the GitHub repo card, README, star button, and a tiny terminal command or install path if present in the repo.

Text:
"Build a wiki your agents can actually remember."

CTA:
"Clone the repo. Try the pattern."

Motion:
- repo card rises into center
- file tree and graph sit behind it
- final logo or title lockup

Technical direction:
Inspect the actual repo before generating code. Do not invent commands, package names, or features. If a command is not clearly present in the README, use a generic visual terminal line instead of a fake install command.
Use deterministic GSAP timelines. Use flowchart, file-tree, terminal typing, and graph animations. Keep all text readable at 1080p.

Deliverables:
Create DESIGN.md, SCRIPT.md, STORYBOARD.md, and the HyperFrames composition. Provide 5 still-frame checkpoints before final render:
1. RAG forgets / Wikis compound hook
2. before/after architecture frame
3. wiki file tree frame
4. ingest pipeline frame
5. repo CTA frame
```

Prompt file from a public GitHub repository, kept with its repository and path. Check the repository's licence before reusing it.
