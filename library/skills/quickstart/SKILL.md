---
name: cizle-quickstart
description: Getting started in 30 seconds, click by click or command by command, for people who just signed up. Use when the user asks for a quickstart for their product, brand or article.
---
# Quickstart

Getting started in 30 seconds, click by click or command by command, for people who just signed up.

## How to use this skill

1. Call the cizle MCP `guide` tool for the storyboard format, then `read_prompt` if you need the library entry (`type:quickstart`).
2. Read the user's product page or repo, then write a storyboard that follows the guide below.
3. Call `create_video` with `type: "quickstart"` and the storyboard. Poll `get_video` until the MP4 is ready.

If the cizle MCP server is not connected, follow the guide and give the user the storyboard, one scene at a time, ready to paste into their video tool.

## Guide

**Goal:** activation. A new user watches 30 seconds and does the first useful thing without reading the docs. Best embedded in onboarding emails, the docs home and the README.

## Structure and motion
1. **Promise (2-3 s)** `title`: "Your first <result> in 30 seconds".
2. **The steps (10-12 s)** `steps`: three or four short imperative steps. If a step is a command, follow it with a `code` scene (at most 14 lines, from CODE_FILES or the README).
3. **First result (4-5 s)** `screenshot`: what success looks like on screen, captioned "You should see this".
4. **Next step (3 s)** `bullets`: two follow-ups from the docs ("Add a teammate", "Connect GitHub").
5. **Outro (3 s)** `outro`: the docs URL, not a sales line.

## In each style
- **Clean:** steps beside real screens, code in a dark panel.
- **Clay:** big friendly numbered buttons, each one pressing in.
- **Glass:** a frosted terminal card over a soft glow.
- **Isometric:** the steps as a path of blocks leading to the result block.
- **Hand-drawn:** a numbered cheat sheet with the command underlined.
- **ASCII:** the real shell session: `$ npm i ...`, output lines typed in. The best style for developer tools.

## Rules
- Commands, flags and file names must be exactly as in the sources. Never invent a command or an option.
- Prefer the shortest path to a visible result, not the full feature tour.
- Say what the user should see at the end, so they know it worked.

---
Source: https://cizle.dev/skills/quickstart · cizle skills marketplace
