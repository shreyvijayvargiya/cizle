# Swagger Api Synchronization

By @nurullah · general
Language: en · Domains: agriculture, history, engineering · Source: P01

Source page: https://prompts.chat

```
# Set up an OpenAPI spec-sync workflow in this project

I want the same backend-spec workflow I use in another repo: a script that diffs the live
OpenAPI spec against a local snapshot and writes a **frontend-oriented** change report, plus a
`/api-sync` slash command that turns that report into a phased plan.

Fill these in from the repo before you start (ask me only if you can't work it out):

- **Spec source**: find it yourself — see Part 0. Don't ask me for the URL until you've looked.
  Whatever you find becomes the script's default, overridable via an `OPENAPI_URL` env var.
- **Snapshot path**: `api-spec/openapi.yaml`  ·  **Report path**: `api-spec/CHANGES.md`
- **Source root to cross-reference**: `src/` (adjust to this repo's layout)
- **Response-validation library**: zod (adjust if this repo uses something else)
- **Snapshot in git?** Keep the yaml **gitignored** (too large/noisy for history) but **commit
  `CHANGES.md`** — the generated report is the durable record of what changed and when. Also
  ignore `api-spec/openapi-*.yaml` and `api-spec/CHANGES-*.md` (dated manual archives).

Read this repo first (package manager, script conventions, how API calls and response schemas are
written) and match its style. Don't invent paths — grep for the real ones.

---

## Part 0 — find the spec before you write anything

Do this first and tell me what you found. Don't guess a URL, and don't ask me until this comes up
empty.

**1. The docs — cheapest place, and usually right.** `README.md`, `CLAUDE.md`,
`AGENTS.md`, `CONTRIBUTING.md`, anything under `docs/`, `.github/`, `.cursor/rules/`, a
`*.http`/`*.rest` scratch file, or a wiki checkout. The URL is often in prose ("API docs:
…/swagger"), in a setup step, or next to the backend repo link:

'''bash
grep -rniE 'swagger|openapi|api-?docs|redoc|\/v3\/api-docs' --include='*.md' --include='*.mdx' --include='*.txt' --include='*.http' --include='*.rest' . | grep -v node_modules
'''

Two gotchas: a **Swagger UI link** (`…/swagger-ui/index.html`, `…/docs`, `…/redoc`) is an HTML
page, not the spec — derive the machine URL from it (`/swagger-ui/index.html` →
`/v3/api-docs`, `/docs` → `/openapi.json`, `/redoc` → the `spec-url` in its HTML) and verify with
curl. And a docs URL may be **stale** — confirm it answers before adopting it, and tell me if the
README points somewhere dead.

**2. A spec file already in or near the repo** — someone usually vendored one:

'''bash
find . -path ./node_modules -prune -o -iregex '.*\(swagger\|openapi\|api-docs\).*\.\(ya?ml\|json\)' -print
git ls-files | grep -iE 'swagger|openapi|api-docs'
'''

Also check `node_modules/.cache/`, `.next/cache/`, `dist/`, `build/`, `coverage/` and any
gitignored `api/`, `api-spec/`, `docs/`, `schemas/` folder — a previous codegen run often left a
copy there. A stale cached copy is still useful: it's a **baseline to seed the snapshot with**,
so the first real diff is meaningful instead of "everything is new". If you find one, say how
old it is (`git log -1` / file mtime) before deciding to trust it.

**3. A generator config that already names the source** — this is the highest-signal hit, because
it points at whatever URL or path the team actually uses:

'''bash
grep -rniE 'openapi|swagger|api-docs' --include='*.json' --include='*.ts' --include='*.js' --include='*.mjs' --include='*.yaml' --include='*.yml' --include='.env*' --include='Makefile' --include='*.sh' -l . | grep -v node_modules
'''

Look specifically for: `openapi-typescript` / `orval.config.*` / `kubb.config.*` /
`swagger-typescript-api` / `@hey-api/openapi-ts` config, an `openapi`-ish npm script in
package.json, a `.env*` API base URL, `docker-compose.yml` service URLs, CI workflow steps, or a
committed generated client whose header comment cites its source spec.

**4. Derive it from the API base URL.** If you only find a base URL, probe the conventional paths
for that backend's framework before asking me — FastAPI `/openapi.json`, Spring/springdoc
`/v3/api-docs` (+ `.yaml`), ASP.NET `/swagger/v1/swagger.json`, NestJS `/api-json`, Rails/rswag
`/api-docs/v1/swagger.yaml`, plus plain `/openapi.yaml` and `/swagger.json`:

'''bash
curl -sS -o /dev/null -w '%{http_code} %{content_type} %{url_effective}\n' <BASE>/openapi.json
'''

Report which ones answered. If they all need auth, say so — don't bake a token into the script.

**5. Nothing works?** Then ask me, and tell me what you ruled out.

### If the spec isn't reachable over HTTP

Don't force the fetch design. Make the source a single `SPEC_SOURCE` that may be **a URL, a local
path, or a shell command** (e.g. the backend repo's own `make openapi`, or a sibling checkout's
generated file), resolved in that order: `--to <file>` flag → `OPENAPI_URL` env → the default you
discovered. Everything downstream — diff, report, snapshot — is unchanged. Say in `CLAUDE.md`
which one this repo uses and how to refresh it.

## Part 1 — `scripts/sync-api.mjs`

A single dependency-light Node ESM script (`js-yaml` is the only new dep; use the repo's package
manager). Flags:

'''
node scripts/sync-api.mjs               fetch remote → diff vs snapshot → write report + overwrite snapshot
node scripts/sync-api.mjs --check       diff only, snapshot untouched, exit 1 if it drifted (CI-friendly)
node scripts/sync-api.mjs --from <file> diff against <file> instead of the snapshot
node scripts/sync-api.mjs --to <file>   treat <file> as "remote" instead of fetching (offline)
node scripts/sync-api.mjs --json        also print the raw diff as JSON on stdout
'''

Add `"sync:api": "node scripts/sync-api.mjs"` to package.json.

**If no snapshot exists yet**: write the fetched spec as the snapshot, print "seeded — re-run after
the backend ships to see a diff", exit 0. Never report the whole API as "new". Exception: if Part 0
turned up an older cached/vendored spec, seed the snapshot from **that** instead and run a real
diff against the live spec on the first run — tell me the cached copy's date so I know what the
baseline means.

### What it must diff

Flatten `paths` into a `"GET /a/b"` → operation map and diff operations *and*
`components.schemas` separately:

**Operations**
- added / removed / changed
- params: new ones (flag `required`), required↔optional flips, enum values added/removed —
  key a param by `in:name` (or `ref:Name` for `$ref` params), not by array index
- request body and success-response schema: if the `$ref` name changed, report the rename; if the
  shape is **inline** (no `$ref`), diff its properties here — an unnamed schema is diffed here or
  nowhere. Resolve `allOf: [$ref]` wrappers to the underlying name, and render `oneOf`/`anyOf`
  unions as `A | B` (gaining/losing a union member is a real behavioural change).
- new/removed non-2xx status codes
- security requirement changes, newly `deprecated`

**Schemas**
- properties added (mark required) / removed / retyped
- enum values added or removed (on the schema and on each property, including `items.enum`)
- required↔optional flips

### The two things that make this report worth having

1. **`error_code` extraction from response prose.** Machine error codes are usually documented
   nowhere but each non-2xx response's `description` text ("… already an active member
   (already_member)"), so a new branch we need to handle looks like *nothing changed* to a
   schema-level diff. Parse them by **context, not vocabulary**: tokens inside `(...)`, tokens
   after `error_code`-ish prose, and any snake_case token that appears in some schema's literal
   `error_code` enum. Do **not** filter out tokens that collide with field names or enum values —
   those collisions are exactly the codes that matter most. Drop tokens introduced by "field X"
   phrasing (those are field names, not codes). Report added codes, and for a code that stopped
   being documented, grep the source for `"that_code"` and say **which file branches on it** —
   that's a dead branch.

2. **Cross-reference every change against the actual code.** Load every source file once via
   `git ls-files --cached --others --exclude-standard <src root>` (include untracked so a call
   site added this session counts; skip files listed but deleted from the working tree), then:
   - **Call sites** for a path: turn path params into single-segment wildcards and require the
     match to end at a quote/backtick/`?` so `/orgs/{id}` doesn't match `/orgs/${id}/archive`.
     Every removed/changed operation lists its call sites, or "⬜ no call site".
   - **Schema mirrors**: find the file holding our response-validation mirror of a spec schema —
     match `fooBarSchema` anywhere, plus the bare PascalCase name **only inside a `schemas.ts`**
     (elsewhere it collides with unrelated TS identifiers). Adapt the naming convention to
     whatever this repo actually uses — grep first.
   - A new operation whose path is already referenced in `src/` gets a "⚠️ path already
     referenced — check the method" note.

### Report format (`api-spec/CHANGES.md`)

Header with generation date, baseline label, spec `info.version`, and before→after operation and
schema counts; then a small added/removed/changed table; then sections, in this order:

- `## 🔴 Removed operations — breaking if we call them` (with call sites)
- `## 🟠 Changed operations` (nested bullets per change + call sites)
- `## 🟢 New operations`, grouped by path area (first segment, with sensible special cases for
  this API's prefixes) — summary, response schema, request-body schema
- `## 🔴 Removed schemas` (with mirror files)
- `## 🟠 Changed schemas` — **mirrored ones sorted first and bolded with the mirror file**, since
  those are what can break parsing today; the rest are informational
- `## 🟢 New schemas` (one comma-separated line)

If nothing changed, the body is exactly "No changes since the last snapshot." Top the file with
"do not edit by hand".

Keep the script commented where a decision is non-obvious (the error_code heuristic, the path
matcher's end anchor, why untracked files are included) — future-me reads those.

## Part 2 — `.claude/commands/api-sync.md`

A slash command (`/api-sync [scope]`, scope optional, also accepts `implement`) that runs the
workflow. Frontmatter: `description` + `argument-hint`. Steps:

1. **Diff** — run `npm run sync:api`, read `api-spec/CHANGES.md`. Call out the two judgement
   calls the report can flag but not decide: a changed **request body** on a live call site is
   actionable even with no schema mirror (we build bodies by hand), and a new **`error_code`** is
   a branch we don't have yet — if it's a field error it must render inline on the field, not
   just as a toast. If the report says no changes, say so and stop — don't invent work.
2. **Classify every item** into: Breaking (P0) · Silently wrong — a mirrored schema gained a
   required field or an enum grew values our validator rejects (P0) · Now-incomplete — a
   hand-built request body gained a field, or a new `error_code` we don't branch on (P1) ·
   Un-mocks a screen (P1) · Extends a screen (P2) · Net-new feature (P3) · Backend-only (drop).
   Never skip an item; if it fits nowhere, list it as an open question. Verify each
   classification against the code rather than assuming — open the named mirror file, grep for
   the mock fixture, confirm the screen exists.
3. **Write the plan** — a dated section in `ROADMAP.md` (or this repo's equivalent; create one if
   there's none), ordered by those priorities and phased so each phase ships independently. Per
   item: the endpoints and files that change, what the user can do afterwards that they can't
   today (the point of the work — not "wire endpoint X"), and whether it's blocked and on whom.
   One line per item. Then update whatever coverage/tracker docs this repo keeps.
4. **Report back in chat** — what the backend shipped in one plain-language paragraph, anything
   broken right now with the file to fix, the phases one line each, and genuine questions for the
   backend dev only. Stop there; only if the argument contains `implement`, build **Phase 1 only**,
   then run this repo's typecheck + lint and report before continuing.

## Part 3 — wire it in

- Add the gitignore entries.
- Add a short **Backend-change workflow** section to `CLAUDE.md` (create it if missing): the
  snapshot is local and gitignored, `CHANGES.md` is the committed record, `CHANGES.md` is
  generated so never hand-edit it, `/api-sync` when the backend dev says something shipped,
  `npm run sync:api -- --check` to detect drift, and the habit of archiving a dated
  `api-spec/openapi-YYYY-MM-DD.yaml` before a big backend change as a committed reference point.
- Seed the snapshot by running the script once, and show me the first report — plus a one-line
  note on where the spec came from and, if you seeded from a cached copy, how stale it was.
```

Prompt from the public prompts.chat library (CC0), credited to its contributor.
