---
name: sdk
description: "Codex SDK 集成开发。用 TypeScript/Python SDK 做 agent 生命周期、流式输出、本地/云端执行等集成。"
---


# Codex SDK

Build integrations with TypeScript `@cursor/sdk` or Python `cursor-sdk` / `cursor_sdk` when these are the requested or established packages. Preserve the user's selected library and runtime; identify the installed dependency and version before applying version-sensitive API details.

Use repository code and installed types first, then current primary documentation when needed: [TypeScript SDK](https://cursor.com/docs/sdk/typescript), [Python SDK](https://cursor.com/docs/sdk/python). This skill is guidance, not a substitute for the current package contract.

## Choose the shape

Infer language from the request and target codebase. Ask only when the integration location or language remains materially ambiguous. For the selected SDK version, choose a one-shot prompt for one request, a persistent agent for streaming/follow-ups, or resume for an existing agent. Set the intended local/cloud runtime explicitly so the default cannot send work to the wrong environment.

Read [API patterns and runtime details](references/api-patterns.md) for implementation examples, lifecycle handling, failures, MCP, or later inspection. Load the relevant sections rather than treating every example as mandatory. Verify model IDs and availability from the actual model list; examples are not a recommendation to hardcode an old default.

## Invariants to preserve

- Use supported disposal/context-manager patterns and await the terminal run result before claiming completion.
- Distinguish transport/startup errors, failed runs, cancellation, and unknown completion. Check run IDs/state before retrying when execution may have started; a retryable transport error alone is not proof an external side effect did not happen.
- Bound retries and honor backoff. Preserve user scope for cloud runs, PR creation, reviewer requests, and other external effects.
- Pass secrets through supported credential/environment mechanisms without printing them. Inspect actual ambient-settings behavior before relying on user machine defaults.
- Keep agent IDs and run IDs distinct. Verify supported operations on resumed/detached handles.
- Inline MCP configuration may need to be supplied again on resume, and per-send overrides can replace rather than merge servers; confirm the installed version's behavior.

Produce the working integration and run meaningful checks suited to its actual risk. Do not add an unrelated Canvas or an extra confirmation just because the integration contains structured output.
