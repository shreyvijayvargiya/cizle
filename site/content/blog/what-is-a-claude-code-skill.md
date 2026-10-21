---
title: "What is a Claude Code skill? How SKILL.md works and where to put it"
description: "Claude Code skills are markdown files that teach the agent a repeatable job. Learn the SKILL.md format, where skills live, how they differ from prompts and MCP servers, and how to install one in a minute."
date: 2026-10-21
tags: [claude code, skills, mcp]
skill: how-it-works
---
If you use Claude Code, you have probably typed the same instructions more than once: "when you write a changelog, do it like this". A skill is how you stop repeating yourself.

## What a skill is

A skill is a folder with a `SKILL.md` file. The file starts with a short header, a `name` and a `description`, followed by instructions in markdown. Claude Code reads the descriptions of the skills it can see and uses the matching one when your request fits.

```markdown
---
name: cizle-faq
description: Animated Q&A cards that answer the top questions buyers ask. Use when the user asks for a FAQ video.
---
# Product FAQ
...the guide...
```

## Where skills live

- **In a project:** `.claude/skills/<name>/SKILL.md`. Shared with everyone who uses the repository.
- **For all your projects:** `~/.claude/skills/<name>/SKILL.md`.

## Skills, prompts and MCP servers

- A **prompt** is something you paste once.
- A **skill** is a prompt Claude loads by itself when it is relevant, so you can say "make a FAQ video" without pasting anything.
- An **MCP server** gives Claude tools it did not have, such as rendering a video file.

cizle uses all three: skills hold the know-how, the MCP server does the rendering, and the prompt on each page works on its own if you prefer to paste.

## Install a cizle skill in a minute

```bash
curl -fsSL --create-dirs -o .claude/skills/cizle-faq/SKILL.md https://cizle.dev/skills/faq/SKILL.md
```

Restart Claude Code and ask: "make a FAQ video for https://your-product.com".

## Writing a good skill

1. **A precise description.** It is how Claude decides when to use the skill.
2. **A clear structure.** Numbered steps and timings beat paragraphs.
3. **Rules.** What to avoid matters as much as what to do.
4. **Truthfulness.** Tell the agent to use only facts it can find.

Want to see well-built examples? [Browse the cizle library](/): every skill is plain markdown you can read, copy and adapt.
