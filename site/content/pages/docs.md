# How to use cizle

cizle is a free library of video prompts, image prompts and Claude Code skills. A skill is a markdown guide that teaches Claude Code how to plan one kind of video: the scenes, the timing, the on-screen text, the rules that keep it truthful. This page takes you from zero to your first rendered video.

## Quick start

> Fastest: [connect cizle to Claude](/connect) with one command, then ask Claude to find a skill for you.

1. **Make a free account.** [Sign in](/login) with Google or email to open the whole library. Without an account you see a sample of 24 prompts.
2. **Pick a skill or a prompt.** Open the [library](/) or the [gallery](/gallery) and search or filter. Start with a skill such as *Product showcase* or *Launch announcement*.
3. **Copy the prompt or install the skill.** Every skill page has a **Copy prompt** button and an install command. The command saves a `SKILL.md` into your project so Claude Code finds it automatically.
4. **Connect cizle to Claude Code (once).** The MCP server renders storyboards into MP4 files on your machine.
5. **Ask Claude Code for the video.** Give it your product link, and open the MP4 when it is done.

## Install a skill

Skills install with one command from your project folder:

```bash
curl -fsSL --create-dirs -o .claude/skills/cizle-faq/SKILL.md https://cizle.dev/skills/faq/SKILL.md
```

Claude Code loads skills from `.claude/skills/<name>/SKILL.md` in the project (or `~/.claude/skills` for every project).

## Use cizle inside Claude (MCP)

The fastest way to use the library is to connect it to Claude. Claude can then search every skill and prompt, show you a table, and open the one you choose, without you leaving the chat. [Sign in](/login) and open the [MCP page](/connect) for copy-ready commands. There is no token or API key to manage.

In Claude Code, run this once:

```bash
claude mcp add --transport http cizle {{MCP_URL}}
```

For Claude Desktop, add `cizle` to your config with `npx -y mcp-remote {{MCP_URL}}` (the [MCP page](/connect) has the exact JSON).

### What Claude can do with it

| Tool | What it does |
|---|---|
| `search` | Find skills and prompts. With no query it browses. Returns a table and up to 50 rows per page, with a cursor for the next page. |
| `get` | Open one item in full: the prompt, the SKILL.md and the install command. |
| `categories` | Every category with its counts. |
| `whoami` | Shows the connection status. |

Try asking Claude:

> Find a launch video skill and show me the top five prompts for it.

> List every prompt about product demos in a table, page by page.

> Open the glass product render skill and use it for my product page.

To list everything, Claude calls `search` again with the cursor it was given until there is no next page. Each row has an **Id** such as `skill:showcase` or `prompt:night-forest-website-with-fireflies-comparison-9502411`; that is what `get` takes.

### The command line

Claude Code can also use the library from a terminal, and so can you. In the cizle folder:

```bash
node server/cli/cizle.js search "launch video"
node server/cli/cizle.js search --kind prompt --all
node server/cli/cizle.js get skill:showcase
```

`search` prints a table. Add `--all` to follow every page, or `--json` for data.

## Render videos on your machine

You need Node.js 20.12 or newer.

```bash
git clone https://github.com/shreyvijayvargiya/cizle
cd cizle
npm install
npm run mcp:install
```

`mcp:install` registers the local server with Claude Code for every project. It gives Claude these tools: `guide`, `list_prompts`, `read_prompt`, `create_video`, `get_video`, `create_banners`, and a few more for products and status.

Then open Claude Code in any folder and say:

> Use the product FAQ skill to make a video for https://your-product.com

Claude reads your pages, writes a storyboard that follows the skill, and calls `create_video`. A render takes one to three minutes. Claude checks `get_video` and gives you the path of the finished MP4.

## Without Claude Code

The prompt on each skill page works on its own. Paste it into any coding agent or chat model together with your product link, and ask for the storyboard scene by scene. You can then use the storyboard in your own video tool.

## Search the library

Press <kbd>⌘</kbd> + <kbd>K</kbd> (or <kbd>Ctrl</kbd> + <kbd>K</kbd>) anywhere on the site to search every skill and jump to any page. On the home page, use the filters for category, platform, format, aspect ratio and language.

## Troubleshooting

- **I only see 24 prompts.** Sign in. The full library, search and filters open with a free account.
- **Claude does not see the skill.** Check the file is at `.claude/skills/cizle-<name>/SKILL.md` and restart Claude Code.
- **`create_video` is missing.** Run `npm run mcp:install` again and restart Claude Code.
- **The MCP command fails.** Check that the address ends in `/mcp` and that you can open it from your network. [Contact us](/contact) if it still does not connect.
