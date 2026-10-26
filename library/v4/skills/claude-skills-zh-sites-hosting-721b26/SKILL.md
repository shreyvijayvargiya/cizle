---
name: sites-hosting
description: "网站发布与托管。发布用 Sites 建好的网站并管理托管。"
---

# Sites hosting

Use native Sites connector calls and their argument schemas. Copy IDs and cursors unchanged from the Site's manifest or tool responses.

Only the Site-owning agent operates its checkout and Sites tools through handoff. Asset and research subagents return their results; an independent background task can own a Site. Keep hosting internals out of user-facing messages: give a short publishing update, then the URL or a plain-language blocker.

## Rules

- Publish new sites and edits by default, including subsequent turns. Respect explicit local-only, save-without-deploying, and do-not-publish requests.
- New sites start private. Preserve the current audience unless the user requests a change. Native runtime approvals and access checks apply; no separate conversational deployment confirmation is needed.
- Publishing needs no additional browser testing or visual QA.
- Preserve the optional deployment thumbnail at `public/screenshot.jpeg` (`screenshot.jpeg` under `static.directory` for buildless sites). Create or refresh it only for an explicit Sites deployment-thumbnail request, not a generic screenshot request. Its absence or capture failure never blocks publishing.
- Store only `project_id`, optional `static` configuration, logical `d1`/`r2` bindings, and requested supported `capabilities` in `.openai/hosting.json`. Manage runtime values through Sites.

## Site workflow

Run the bundled script directly in the selected checkout. It owns checkout preparation, ordered checks/build, source push, packaging, and archive validation:

```sh
node <plugin-root>/scripts/site-workflow.mjs --project-id <project_id>
```

Launch with `exec_command(tty: true, yield_time_ms: 1000)`. After `Ready for Site workflow JSON on stdin (input is hidden).`, send one newline-terminated JSON object through `write_stdin` with `yield_time_ms: 30000`. Wait for successful exit and return the final JSON line to the model.

Input contains `credential` plus the fields below. Reuse registration's credential or obtain one from native `create_source_repository_write_credential`. Keep credentials in session memory and stdin, out of shell arguments and files. Use absolute plugin, checkout, and archive paths and literal command arguments. The result contains `project_id`, `checkout_path`, verified `commit_sha`, and, for publishing, `archive`.

## Open a Site

- **Existing:** Reuse its `project_id`, call `get_site`, and run the script without `archivePath` before editing. Retain its result as `source` and use its `checkout_path`; pass it back when publishing. Restore missing source into an empty directory.
- **New:** Once project files exist, start [Registration](../sites-building/references/registration.md). The script prepares the new checkout automatically when publishing.

Overlap registration, dependency installation, asset work, and discovery of native save/deploy/status tools with authoring. Collect each result before its dependent step. Reuse successful setup and checks/builds while their inputs remain unchanged.

For starters, follow [Execution profile](../sites-building/SKILL.md#execution-profile) and its setup reference in the selected checkout. Plain static HTML needs neither profile configuration nor installation.

## Fast publish sequence

Reuse a matching archive-backed saved version for unchanged source, or continue an existing deployment to [Handoff](#handoff). Otherwise run the script once with:

- `source`: the prior opening result, when available.
- `commands`: remaining checks/builds as argument arrays, in order, after edits and required installation/assets finish. Generate changed D1 migrations before building. Use `["node", "<plugin-root>/scripts/build-site.mjs"]` for generated output; plain static HTML needs no build. Server frameworks must produce Cloudflare Workers-compatible output.
- `archivePath`: the absolute output archive path.

After the script succeeds, make a separate native call using its returned `project_id`, `commit_sha`, and `archive`:

- **Private:** use `save_version_and_deploy_private` when exposed; otherwise `save_site_version` then `deploy_private_site_version`.
- **Other audiences:** use `save_site_version` then `deploy_site_version`.

Native tools upload the archive; keep it unchanged until saving succeeds. Reuse returned version IDs, including `saved_version_id`, and skip saving an already archive-backed version. A source-only version still needs its matching archive. Return the full native result.

When the Site needs `OPENAI_API_KEY`, use the [OpenAI Developers](plugin://openai-developers@openai-curated-remote) plugin's `openai-platform-api-key` skill with user approval and configure the key as a Site secret before deployment. If unavailable, ask the user to enable that plugin.

## Deployment audience

Reuse ownership and audience from opening: private for a new owner-only Site or one confirmed owner-private for the selected account; otherwise use its known audience. If unknown or changed (`site_not_owner_only`), resolve it with `get_site` and respect the user's sharing restrictions before deploying. Never use private deployment as an access probe.

## Handoff

For `pending`, `building`, or `publishing`, poll `get_deployment_status` in a short `functions.exec` loop. A `succeeded` result with a URL completes verification; if its URL is missing, make one same-ID status call. Return the literal URL only from a successful native result, or report the user-visible blocker.

In a visible foreground task, use `open_in_codex` or equivalent when available, reusing the existing Site tab and stable tab ID. A failed browser handoff does not block returning the URL. Skip browser handoff for background tasks. Do not fetch the deployed URL or navigate an agent browser there merely to finish publishing; cloud-browser QA uses [managed preview](../sites-building/references/preview/managed-linux.md).
