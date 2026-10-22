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
npm run enrich -- --again --import         # refresh everything, then re-run gallery:import so dropped prompts can return
```
For each entry, in order: (1) the X embed endpoint `cdn.syndication.twimg.com` (mp4 variants, poster, text; no browser, no login); (2) the source page in Puppeteer: `<video>`, `og:video`, JSON-LD and the **Copy prompt** button (the clipboard write is intercepted, so it works headless); (3) the X post in Chrome, only with `--x-browser` (X's terms restrict automated access, so it is opt-in). robots.txt is honoured for source pages. Set `CHROME_PATH` if Chrome is not found.

What it will and will not change: it fills a missing video or poster; it replaces a prompt only with a longer one from the Copy prompt button, or a longer tweet when the stored prompt is a cut-off copy of it. A promotional tweet never replaces a real prompt.

Files, all in `site/`:
| file | what |
| --- | --- |
| `content/gallery-enrichment.json` | one record per entry: status (ok, none, failed, blocked), attempts, updates, what was found, which source. `gallery:import` applies it, so a re-import keeps the work |
| `content/gallery.jsonl` | the library, patched in place |
| `content/library-state.json` | the library's git-status-like state: `updated_at`, `updates` (runs that changed something), `runs`, `totals`, `enrichment` counts, `files` (sha1, bytes, lines, `added`/`modified`/`unchanged` against the previous run), `last` run with its changes, and the last 100 runs |
| `logs/<time>-<command>.log`, `logs/runs.jsonl` | a log per run of `enrich`, `import`, `media` and `seed` (git-ignored). `harvest/logs/` for the harvester |
