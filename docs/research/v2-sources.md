# Harvest v2 sources

Found on 2026-10-22 by four parallel research passes (GitHub worldwide, datasets and non-English repos, websites, community platforms; ~120 searches), checked against everything in `harvest/sources.graph.json` and `docs/research/opus-5.5-prompt-sources.md`. Run them with `npm run harvest:v2` (graph: `harvest/sources.v2.graph.json`, ids `N01..`).

The honest finding: the Opus 5.5 video-prompt ecosystem is a few hundred creators' X posts, re-published by many repos. Most "new" repos are mirrors of yihui-dev (G01). After de-duplication, v2 adds roughly **100 + 79 + 29 prompts that are new by text, plus ~400 more from the X index (N03), and about 84 demo videos for prompts we already have**, not thousands.

## Added (enabled)

| id | source | what | verified | new to us |
| --- | --- | --- | --- | --- |
| N07 | Li-Evan/awesome-opus-5.5-video-prompts | 334 prompts in 9 YAML files, each with **direct mp4 (HD) and poster urls** | cloned, parsed, harvested here: 334 records, 322 with mp4 | 98 new prompts; 84 existing prompts get a video |
| N01 | HiAPIAI/awesome-opus-5-5-video-styles | 425 cases with full prompt (MIT; derived from G01) | cloned, harvested here: 425 records | 79 |
| N02 | mailes/awesome-claude-5-5-videos | 489 Opus 5.5 prompts in one JSON (MIT; WorkSkill) | cloned, harvested here: 489 records | 29 |
| N03 | zhuyansen/awesome-opus-5.5-video | index of 2,010 X posts; 500 say where their prompt is (the post, or the author's reply: up to 19k chars) | index cloned and counted; **the tweet lookups were not reachable from the sandbox** (adapter tested against a fake X) | 413 new posts with a prompt |

N03 uses the new `x-index` adapter: it reads the tweet the index points at (FixTweet, then vxTwitter, then X embed) and records the main post, so it merges with other sources by post id. This is the author-reply route that `enrich` could not do alone.

## Found but off until checked from an open network (`enabled: false`)

| id | source | evidence | to check |
| --- | --- | --- | --- |
| N04 | workskill.tools/ai-videos/opus-5-5 | sister site of skillry.dev; each page "Prompt & live remake" (URL pattern from N02's files) | `npm run harvest:v2 -- -s N04 --limit 20`, read `harvest/data/N04/meta.json` |
| N05 | wutuobangai.top Opus 5.5 gallery (Chinese) | repo says 646 free cases with one-click copy | page structure unknown; prompts need `gallery:translate` |
| N06 | data.openchamber.dev/opus-5-5-videos | search snippets: 5,104 videos, 845 with prompts, updated daily | strongest lead; may offer a JSON file that `json-dataset` can read |

## Rejected (and why)

Mirrors of G01 with no new prompts: billyhetech (703 of 703 already ours), sunsiyuan (702 of 703), vswanagan, Smith-106 (forks). Too small or no prompt text: chuspeeism (~36 prompts), joeseesun (18-54), apimodels (60), Yeadon8888 (53), jinhanbuilds (22), Vincentwei1021 (15), sandbase-lab (400 videos with mp4 but 87 prompts), xianyu110 / OasisAtlas / PHY041 (image mirror, HTML docs, analysis notes), and single articles with 20-30 prompts (woshipm, bnext, ai-bot.cn, dsebastien, pasqualepillitteri). Reddit, Hacker News, Bluesky, Qiita, Zenn and dev.to could not be reached from the research sandbox: untested, not rejected.

## After you run it

`npm run harvest:v2` harvests N07, N01, N02, N03, looks up the video and full prompt of each new record (X embed, FixTweet, vxTwitter, source page), merges them with the existing library by X post id and updates it (`gallery:import`). Each run adds a line to `harvest/changelog.jsonl` and `site/content/library-changelog.jsonl` (`npm run changelog`).
