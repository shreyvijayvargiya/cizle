# Prompt harvester

One CLI, one API endpoint, one sources graph. It walks the graph with a pointer, scrapes each source, and stores the result as local files. There is no database. The files are the memory, so you can stop it at any time and run it again to resume.

```bash
npm run harvest -- --list                    # sources in walk order
npm run harvest -- -s G01,G02,W01 -p 3       # three sources at once
npm run harvest                              # everything enabled, 3 at a time, for hours
npm run harvest -- --status                  # what is done, what is next
npm run harvest -- --retry                   # rerun failed / blocked / needs_adapter / under_target sources
npm run harvest -- --fresh -s G01            # throw away G01's saved data and start over
npm run test:harvest
```

Ctrl-C stops after the current batch. Press it twice to quit at once. The next run continues where it stopped.
Exit codes: `0` ok, `2` some source failed, was blocked, or needs an adapter, `3` another run holds the lock, `130` stopped.

## The one endpoint

`POST /api/harvest` (`server/index.js`) is the only route. The body is JSON with an `action`:

| action | does |
| --- | --- |
| `run` (default) | starts a run and streams NDJSON events. Options: `sources`, `parallel`, `limit`, `batch_size`, `batch_pause_ms`, `source_pause_ms`, `retry`, `fresh` |
| `status` | the graph, per-source state and the pointer |
| `stop` | stops the running harvest after the current batch |

A run keeps going if the client disconnects. A second run gets `409` (`RUNNING` or `LOCKED`). The CLI and the API share one lock file, so only one of them can run at a time.

## Pacing

| what | value |
| --- | --- |
| sources in parallel | at most 3 |
| items fetched together inside a source | up to 20, with no sleep inside the batch |
| pause between batches | 8 s (`batch_pause_ms`; Prompt Motion also honours its robots.txt crawl-delay) |
| pause after a source finishes | 8 s per slot (`source_pause_ms`), not after the last one |
| retries | exponential backoff, `Retry-After` honoured; 403 and 429 mark the source `blocked` instead of hammering it |

Set `HARVEST_CONTACT` to an email so sites can reach you. Defaults live in `defaults` in `sources.graph.json`.

## Sources graph (`sources.graph.json`)

`nodes` are sources and `edges` say which comes next from `start`. Unreached nodes are appended, so the graph cannot hide a source. Each node: `id`, `name`, `adapter`, `config`, `min_records` (default 100), `enabled`, `verified`, `expect`.

Adapters:

- `json-dataset`: one JSON file, cached, then processed in batches from disk. Needs a `mapper` from `server/harvest/adapters/mappers.js`.
- `github-files`: a directory of JSON files. Uses a sparse, blobless `git clone`, or the Trees API plus raw URLs.
- `prompt-motion`: prompt-motion.com. Reference use only (`ai-train=no`).
- `sitemap-gallery`: a generic gallery. List by `sitemap`, `page` (`?page=N`, 20 pages at once), `scroll` (headless Chrome, set `CHROME_PATH`) or `single`. It probes 5 pages first. If none yields a prompt, the source ends as `needs_adapter` with a diagnostic in `meta.json`, so it never crawls blind.

The `sitemap-gallery` nodes (W03, W05, W06, W07, W08) were written from search results, not from the live sites, so they may end as `needs_adapter`. Read `data/<id>/meta.json` → `diagnostic`, adjust `config.list` / `config.detail`, then `--retry`.

## Files (`harvest/data/`, git-ignored; override with `HARVEST_DIR`)

```
state.json              pointer + status per source
.lock                   pid + heartbeat (stale after 45 s)
<id>/records.jsonl      one record per line, append-only, deduped by id (a torn last line is ignored)
<id>/cursor.json        where the source stopped (batch index, listed urls)
<id>/meta.json          counts, policy (robots / content-signal), diagnostic
<id>/failed.json        items that errored
<id>/raw/               cached downloads
```

Statuses: `pending`, `running`, `partial`, `done`, `under_target` (finished with fewer than `min_records`), `failed`, `blocked`, `needs_adapter`.

## Adding a source

1. Add a node to `sources.graph.json` (and an edge).
2. If it is a plain JSON dataset or file directory, add a mapper. If it is a gallery, try `sitemap-gallery` first. Otherwise add `server/harvest/adapters/<name>.js` exporting `{ id, run(ctx) }` and register it in `adapters/index.js`. Use `ctx.mapBatches(items, fn)` for batching, pauses and cursor saving, and `ctx.emitRecord(buildRecord(...))` to store.

## Rights

Prompts and videos belong to their creators. Records keep the author, post URL and source URL, and store media as links, not copies. Check each source's `meta.json` → `policy` before reusing text; Prompt Motion signals reference use only.

## Putting harvested prompts on the website (claude/marketplace)

```bash
cd site
npm run gallery:import          # harvest/data/*/records.jsonl → content/gallery.jsonl (merged by X post id and prompt text)
npm run content                 # → public/gallery.json (cards and previews; premium full text is never written here)
npm run seed:gallery            # full text of premium prompts → Firestore "gallery" (needs a service account, see seed:premium)
git add content/gallery.jsonl && git commit
```
About one prompt in ten is a free sample (readable in full); the rest show the creator, a preview and the original links to everyone, and the full text only to subscribers.

### Quality checks (run before publishing)
`gallery:import` drops prompts that are too short, partial, symbol-only or near-duplicates, and moves the best 12% of the rest (picked separately among prompts with and without a video) to free; one-liners that have a video are free too. It needs two things only you can supply:
```bash
npm run gallery:media           # HEAD-checks every poster and mp4 from a machine that can reach the media hosts → content/media-status.json
npm run gallery:import -- --untranslated todo.json   # lists non-English prompts that still need a translation
# put translations in content/gallery-translations.json as { "<id>": { "title": "...", "text": "..." } }, then import again
npm run gallery:import && npm run content
```
Dead videos are removed; a prompt with no working video and no working poster is dropped. Non-English prompts without a translation are hidden until translated.

## Enriching the library: `npm run enrich`

The harvest only has what a dataset lists, so many prompts have no video, a poster only, or a cut-off prompt. The enricher visits each prompt's original source and fills the gaps. One CLI, one endpoint (`POST /api/enrich`: `run`, `status`, `stop`), one engine.

```bash
npm run enrich -- --status                 # library totals, what is enriched, library update state
npm run enrich -- --limit 20               # try 20 entries first
npm run enrich                             # everything not visited yet, 5 pages at a time, then the next 5
npm run enrich -- -p 10 --loop             # 10 at a time; loop for hours: rest 30 min, come back for new, failed and stale entries
npm run enrich -- --report                 # coverage: videos, complete prompts, why the rest have none, by source
npm run enrich -- --again                  # refresh everything (a pass publishes new videos by itself)
```
For each entry, in order, and only while it still lacks a video or has a cut-off prompt: (1) the X embed endpoint `cdn.syndication.twimg.com`; (2) the FixTweet API `api.fxtwitter.com` (mp4, poster, and the full text of long tweets); (3) the vxTwitter API `api.vxtwitter.com`; (4) the source page in Puppeteer: `<video>`, `og:video`, JSON-LD, network mp4 and the **Copy prompt** button (the clipboard write is intercepted, so it works headless); (5) the X post in Chrome, only with `--x-browser` (X's terms restrict automated access, so it is opt-in). robots.txt is honoured for source pages. Set `CHROME_PATH` if Chrome is not found. Override the endpoints with `ENRICH_SYNDICATION_URL`, `ENRICH_FXTWITTER_URL`, `ENRICH_VXTWITTER_URL`.

**No demo video, no listing.** A prompt without a working video is not shown on the site. It waits in `content/gallery-pending.jsonl` with the reason it has no video, and is published into `gallery.jsonl` (tier and all) as soon as enrichment finds one: enrich runs `gallery:import` itself after each pass (`--no-import` to skip). `gallery:import` works with or without `harvest/data` (without it, it re-curates the library files).

**Coverage report:** `npm run enrich -- --report` (also in `--status`, in `POST /api/enrich {"action":"status"}`, and in `library-state.json` after every run) shows how many prompts have a demo video and a complete prompt, why the rest do not (`post deleted`, `post has no video`, `HLS only`, `blocked`, `unreachable`, `not visited yet`), which route found each video, and the breakdown by source.

What it will and will not change: it fills a missing video or poster; it replaces a prompt only with a longer one from the Copy prompt button, or a longer tweet when the stored prompt is a cut-off copy of it. A promotional tweet never replaces a real prompt.

Files, all in `site/`:
| file | what |
| --- | --- |
| `content/gallery-enrichment.json` | one record per entry: status (ok, none, failed, blocked), attempts, updates, what was found, which source. `gallery:import` applies it, so a re-import keeps the work |
| `content/gallery.jsonl` | the library, patched in place |
| `content/library-state.json` | the library's git-status-like state: `updated_at`, `updates` (runs that changed something), `runs`, `totals`, `enrichment` counts, `files` (sha1, bytes, lines, `added`/`modified`/`unchanged` against the previous run), `last` run with its changes, and the last 100 runs |
| `logs/<time>-<command>.log`, `logs/runs.jsonl` | a log per run of `enrich`, `import`, `media` and `seed` (git-ignored). `harvest/logs/` for the harvester |

### Translating non-English prompts: `npm run gallery:translate`
Prompts that are not in English (the YouMind source is multilingual) are hidden until translated. `cd site && npm run gallery:translate` asks an OpenRouter model (default `google/gemini-2.5-flash`, change with `--model`) to translate them, 5 per request, 3 requests at once, checks each result (complete, English, title in English) and retries a bad one once. It saves `content/gallery-translations.json` after every batch (stop and run again to resume), then runs `gallery:import`. Key: `OPENROUTER_API_KEY` or the dashboard Settings. Try `-- --limit 20` first.


## Harvest v2: complete records, refreshes, and a changelog

**The harvest now enriches as it goes.** When a source finishes, its records that lack a demo video or have a cut-off prompt are looked up with the same routes as `npm run enrich` (X embed, FixTweet, vxTwitter, the source page in Chrome with its Copy prompt button) and the result goes into `site/content/gallery-enrichment.json`, which `gallery:import` applies. One shared limiter keeps it at 5 lookups at once across all sources (`--enrich-parallel`, max 10). When the run added records it then runs `gallery:import`, so the library is updated with nothing else to run. In the repo these are on by default; `--no-enrich` and `--no-import` turn them off, and a custom `HARVEST_DIR` (tests, scratch) turns them off. `npm run enrich` is for refreshes and retries.

```bash
npm run harvest                       # new and unfinished sources: harvest, look up video + prompt, update the library
npm run harvest -- --refresh          # look for NEW items in finished sources (stored records kept; only new pages/entries are fetched)
npm run harvest -- --refresh -p 3     # for hours: three sources at a time
```

**Adding a dataset source is config only.** In `sources.graph.json` use adapter `json-dataset` (one JSON array) or `github-files` (one JSON file per prompt) with `"mapper": "generic"` and a field map, e.g. `"fields": { "id": "slug", "prompt": "body.prompt", "title": "name", "author": "by.handle", "post_url": "tweet", "video": "media.mp4", "poster": "media.thumb", "tags": "tags", "date": "created_at" }`. Only `prompt` is required. A record with an X link gets the post id as its id, so the same prompt found by two sources merges into one.

**The changelog (a git log for the data).** Every harvest, import, enrich, translate, media check and seed appends a commit-style entry, chained to the previous one by `parent`:
```
harvest/changelog.jsonl               what each harvest run added, per source ("harvest: +112 records (G07 +100 new source, W06 +12)")
site/content/library-changelog.jsonl  library runs ("enrich: +42 videos, +3 full prompts from 60 visits")
npm run changelog                     print both like `git log --oneline` (-- --full for bodies, -- --scope harvest, -- --json)
```
Entry: `{ id, parent, at, scope, cmd, message, body[], stats, ids, ok, run }`. Both files are committed, so the history travels with the repo. `site/content/library-state.json` is the current state (like `git status`); the changelog is the history (like `git log`).


## Premium gallery text: no Firebase seeding by default
`npm run content` writes the full text of each premium prompt to `site/public/gallery/text/<id>.json` and the page fetches it only when a signed-in subscriber opens the prompt. That is a **soft gate**: the page hides the text from everyone else, but the file URL is public, so anyone who finds it can read it. It needs no Firebase read, no service account and no `seed:gallery`. For a strict gate set `VITE_GALLERY_TEXT=firestore` (text stays out of the site and is read from Firestore by subscribers; run `npm run seed:gallery` after each library update). Firebase is still used for sign-in and the subscription check.


## Prompts with an image but no video

Harvest v2 sources N01, N02 and N03 ship no video, so their prompts depend on enrichment (the harvest does it as each source finishes; `npm run enrich` repeats it). Find out what is missing and why:
```bash
npm run enrich -- --report                       # per source: with video / waiting, and why the rest have none
npm run enrich -- -s N01,N02,N03,N07 --retry     # only the v2 prompts, again, including failed/blocked ones
npm run enrich -- -s N01,N02,N03 --x-browser     # also open the X post in Chrome when the APIs have no video
```
Routes for an X post: X embed, FixTweet, vxTwitter, **yt-dlp** (used when it is installed: `brew install yt-dlp`; `--no-ytdlp` skips it), then the source page in Chrome, then (opt-in) the post itself in Chrome. Cards with a video play a muted preview on hover; a prompt with no working video stays out of the gallery until one is found.
