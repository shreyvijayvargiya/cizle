# How to use cizle skills

cizle skills are markdown guides that teach Claude Code how to plan one kind of video: the scenes, the timing, the on-screen text, the rules that keep it truthful. This page takes you from zero to your first rendered video.

## Quick start

> Fastest: [connect cizle to Claude](/connect) with one command, then ask Claude to find a skill for you.

1. **Pick a skill.** Open the [skills library](/) and search or filter. Start with a free one such as *Product showcase* or *Launch announcement*.
2. **Copy the prompt or install the skill.** Every skill page has a **Copy prompt** button and an install command. The command saves a `SKILL.md` into your project so Claude Code finds it automatically.
3. **Connect cizle to Claude Code (once).** The MCP server renders storyboards into MP4 files on your machine.
4. **Ask Claude Code for the video.** Give it your product link.
5. **Open the MP4.** cizle saves it locally and tells Claude where it is.

## Install a skill

Free skills install with one command from your project folder:

```bash
curl -fsSL --create-dirs -o .claude/skills/cizle-faq/SKILL.md https://cizle.dev/skills/faq/SKILL.md
```

Claude Code loads skills from `.claude/skills/<name>/SKILL.md` in the project (or `~/.claude/skills` for every project). Each skill page also has a **Copy SKILL.md** button.

## Connect the cizle MCP server

You need Node.js 20.12 or newer.

```bash
git clone https://github.com/shreyvijayvargiya/cizle
cd cizle
npm install
npm run mcp:install
```

`mcp:install` registers the server with Claude Code for every project. It gives Claude these tools: `guide`, `list_prompts`, `read_prompt`, `create_video`, `get_video`, `create_banners`, and a few more for products and status.

## Use cizle inside Claude (MCP)

The fastest way to use the library is to connect it to Claude. Claude can then search every skill and prompt, show you a table, and open the one you choose, without you leaving the chat. Open the [Connect page](/connect) for the copy-ready commands.

**Free, no sign-in.** In Claude Code, run this once:

```bash
claude mcp add --transport http cizle https://cizle.dev/mcp
```

For Claude Desktop, add `cizle` to your config with `npx -y mcp-remote https://cizle.dev/mcp` (the [Connect page](/connect) has the exact JSON).

### What Claude can do with it

| Tool | What it does |
|---|---|
| `search` | Find skills and prompts. With no query it browses. Returns a table and up to 50 rows per page, with a cursor for the next page. |
| `get` | Open one item in full: the prompt, the SKILL.md and the install command. |
| `categories` | Every category with how many items it holds. |

Try asking Claude:

> Find a free launch video skill and show me the top five prompts for it.

> List every free prompt about product demos in a table, page by page.

> Open the glass product render skill and use it for my product page.

To list everything, Claude calls `search` again with the cursor it was given until there is no next page. Each row has an **Id** such as `skill:showcase` or `prompt:night-forest-website-with-fireflies-comparison-9502411`; that is what `get` takes.

### The command line

Claude Code can also use the library from a terminal, and so can you. In the cizle folder:

```bash
node server/cli/cizle.js search "launch video" --tier free
node server/cli/cizle.js search --kind prompt --all
node server/cli/cizle.js get skill:showcase
node server/cli/cizle.js login YOUR_TOKEN
```

`search` prints a table. Add `--all` to follow every page, or `--json` for data. Everything in the library is free; no token is needed.

## Ask for a video

Open Claude Code in any folder and say:

> Use the product FAQ skill to make a video for https://your-product.com

Claude reads your pages, writes a storyboard that follows the skill, and calls `create_video`. A render takes one to three minutes. Claude checks `get_video` and gives you the path of the finished MP4.

## Without Claude Code

The prompt on each skill page works on its own. Paste it into any coding agent or chat model together with your product link, and ask for the storyboard scene by scene. You can then use the storyboard in your own video tool.

## Search the library

Press <kbd>⌘</kbd> + <kbd>K</kbd> (or <kbd>Ctrl</kbd> + <kbd>K</kbd>) anywhere on the site to search every skill and jump to any page. On the home page, use the filters for category, platform, format and aspect ratio.

## Free and open source

Every skill and every prompt is free, with the full prompt, the SKILL.md and the install command. The library is also on [GitHub](https://github.com/shreyvijayvargiya/cizle) as one markdown file per prompt.
