---
name: "openai-docs"
description: "查 OpenAI 官方文档。查 OpenAI 产品/API、Codex 配置、模型、skill 的一手资料，疑难杂症以官方为准。"
metadata:
  short-description: "Official OpenAI docs and Codex guidance"
---

# OpenAI Docs

Provide current, cited OpenAI product, API, model, and Codex guidance.

## Establish the needed evidence

- For local setup or troubleshooting, inspect the relevant local state first. Consult official documentation for unresolved product behavior and changing facts. A documentation lookup should not delay an otherwise supported local repair or backup.
- For documentation questions, use an available official search/retrieval tool, or official-domain web search. If the user supplied a specific official URL, open it directly. Read the actual relevant page before citing it; do not rely on a search snippet.
- Preserve explicitly requested models, products, and scope. If the first source is insufficient, retrieve the next relevant official source.
- For a simple factual answer, use the fetched source directly; open route references only when they add information the task needs. Prefer `learn.chatgpt.com` for ChatGPT Work.

## Choose one primary route

Choose the relevant route; read its reference only when the task needs the specialized workflow:

- **Explicitly requested local documentation integration:** Read [integration guidance](references/mcp-diagnostics.md) only when the user explicitly requests that local integration.
- **Model migration, upgrades, or model-specific prompting:** Read [model-migration.md](references/model-migration.md) for actual migration planning, implementation, dynamic target resolution, or prompt changes. Preserve an explicitly requested target.
- **Model selection and comparisons:** Read [model-selection.md](references/model-selection.md) only when nuanced current, latest, default, cost, latency, quality, or modality tradeoffs need more guidance. Do not run a migration resolver for selection alone.
- **Product, API, ChatGPT Work, and mixed Chat/Work/Codex documentation:** Read [official-docs.md](references/official-docs.md) only when fetched official pages leave source selection, API schemas, or the requested implementation unresolved. This route is not manual-first.
- **Explicitly broad Codex setup, orientation, or cross-topic synthesis:** Read [codex-self-knowledge.md](references/codex-self-knowledge.md) when the eligible Codex manual or deeper Codex procedures are needed.

Start with the relevant reference. Read additional references or run helpers only to resolve a concrete remaining question; do not load every route by default.

## Source and execution boundaries

- Search, open, fetch, and cite only `developers.openai.com`, `platform.openai.com`, and `learn.chatgpt.com`. Cite the page that supports the claim. State uncertainty when official sources do not establish pricing, availability, account access, limits, or behavior.
- Preserve an explicitly requested model for selection, migration, and prompting. Resolve an unspecified latest or current migration target only after searching and fetching current official guidance.
- Use `references/latest-model.md` only as a disclosed fallback after current official model guidance does not answer the question. Read `references/upgrading-to-gpt-6-astra.md` only for an actual, requested GPT-6 migration; read `references/prompting-guide.md` only for requested prompting work.
- Before an operation that actually requires authenticated OpenAI API access, use `openai-platform-api-key` when available. Local code edits, offline tests, documentation, conceptual examples, and model selection do not by themselves require credentials. Do not start a credential-setup flow unless the requested operation needs it.
- Say "OpenAI Docs" or "official OpenAI documentation" in user-facing answers. Keep exact official citations and examples concise.
