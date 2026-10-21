---
title: "How to make a SaaS launch video with Claude Code (no editor, no API key)"
description: "A step-by-step guide to turning a product link into a 30-second animated launch video using Claude Code, a cizle skill and the cizle MCP server, all on your own machine."
date: 2026-10-21
tags: [launch video, claude code, saas marketing]
skill: launch
---
A launch video used to mean a freelancer, a week and a few hundred dollars. With Claude Code and a video skill you can go from a product link to a rendered MP4 in about five minutes. This guide shows exactly how, using the free **Launch announcement** skill.

## What you need

- Claude Code installed.
- Node.js 20.12 or newer.
- A public link to your product: a homepage, a docs page or a GitHub repository.

No video editor, no stock footage and no separate AI video subscription.

## Step 1: install the skill

A skill is a markdown file that tells Claude how to do one job well. The launch skill describes the structure of a good launch video: a hook, the problem, the product in action, proof and one call to action. Save it into your project:

```bash
curl -fsSL --create-dirs -o .claude/skills/cizle-launch/SKILL.md https://cizle.dev/skills/launch/SKILL.md
```

## Step 2: connect the renderer

The cizle MCP server turns a storyboard into an MP4 on your machine. Set it up once:

```bash
git clone https://github.com/shreyvijayvargiya/cizle
cd cizle && npm install && npm run mcp:install
```

## Step 3: ask for the video

Open Claude Code and say: "Use the launch announcement skill to make a video for https://your-product.com". Claude reads your pages, writes a storyboard that follows the skill, and calls the render tool. A render takes one to three minutes.

## Why a skill beats a blank prompt

A blank prompt gives you whatever the model improvises. A skill gives it a proven structure and rules: keep the hook under three seconds, use only claims that appear on your site, end on one action. The result is a video that sounds like your product instead of generic marketing copy.

## Tips for a better video

1. **Link to the page that explains the product best.** Pricing and docs pages give Claude real numbers to use.
2. **Pick the format for the channel.** 9:16 for Reels, TikTok and Shorts; 16:9 for YouTube and your landing page.
3. **Check every claim.** The skill tells Claude to stick to your pages, but you are the editor.

Ready to try it? [Browse the free skills](/) and pick one.
