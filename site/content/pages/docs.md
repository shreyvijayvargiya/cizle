# How to use cizle skills

cizle skills are markdown guides that teach Claude Code how to plan one kind of video: the scenes, the timing, the on-screen text, the rules that keep it truthful. This page takes you from zero to your first rendered video.

## Quick start

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

Claude Code loads skills from `.claude/skills/<name>/SKILL.md` in the project (or `~/.claude/skills` for every project). Premium skills show the same command once you are subscribed, plus a **Copy SKILL.md** button.

## Connect the cizle MCP server

You need Node.js 20.12 or newer.

```bash
git clone https://github.com/shreyvijayvargiya/cizle
cd cizle
npm install
npm run mcp:install
```

`mcp:install` registers the server with Claude Code for every project. It gives Claude these tools: `guide`, `list_prompts`, `read_prompt`, `create_video`, `get_video`, `create_banners`, and a few more for products and status.

## Ask for a video

Open Claude Code in any folder and say:

> Use the product FAQ skill to make a video for https://your-product.com

Claude reads your pages, writes a storyboard that follows the skill, and calls `create_video`. A render takes one to three minutes. Claude checks `get_video` and gives you the path of the finished MP4.

## Without Claude Code

The prompt on each skill page works on its own. Paste it into any coding agent or chat model together with your product link, and ask for the storyboard scene by scene. You can then use the storyboard in your own video tool.

## Search the library

Press <kbd>⌘</kbd> + <kbd>K</kbd> (or <kbd>Ctrl</kbd> + <kbd>K</kbd>) anywhere on the site to search every skill and jump to any page. On the home page, use the filters for category, platform, format, aspect ratio and access.

## Free and premium

- **Free:** 20 skills, forever, with the full prompt, the SKILL.md and the install command.
- **Premium ($10/month):** ad formats for Meta, TikTok and Google, engineering and technical formats, and 20 film styles. Locked skills show their summary and scene list so you can see what you are getting.

To upgrade, [sign in](/login) and open [pricing](/pricing). After payment you return to Settings and Premium unlocks automatically.

## Troubleshooting

- **Claude does not see the skill.** Check the file is at `.claude/skills/cizle-<name>/SKILL.md` and restart Claude Code.
- **`create_video` is missing.** Run `npm run mcp:install` again and restart Claude Code.
- **Paid but still locked.** Open Settings. The page updates on its own when the payment is confirmed, usually within seconds. If not, [contact us](/contact).
