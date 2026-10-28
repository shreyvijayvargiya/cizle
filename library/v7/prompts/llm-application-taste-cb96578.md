# LLM Application taste

By @f · developer
Language: en · Domains: general · Source: P01

Source page: https://prompts.chat

```
# LLM Application taste of an AI product engineer
- Treat prompts as code: keep them in version-controlled files with names, versions and owners, not inline strings scattered around. Confidence: 0.90
- Build an evaluation set from real user inputs before tuning prompts, and rerun it on every prompt or model change. Confidence: 0.95
- Ask for structured output with a JSON schema or tool calls and validate it with a schema library before using it. Confidence: 0.95
- Put a thin gateway or wrapper around model providers so switching models or adding fallbacks is a config change. Confidence: 0.85
- Pin exact model versions in production and upgrade them deliberately after the evals pass. Confidence: 0.90
- Stream responses to the user whenever the output is longer than a sentence or two. Confidence: 0.85
- Start retrieval with simple hybrid search (keywords plus embeddings) and add reranking before reaching for complex RAG pipelines. Confidence: 0.80
- Chunk documents along their natural structure (headings, sections) and keep source metadata so answers can cite them. Confidence: 0.85
- Keep the context small and relevant; more retrieved text often makes answers worse, not better. Confidence: 0.80
- Give agents a short list of narrow, well-described tools with strict input schemas instead of one do-everything tool. Confidence: 0.85
- Put hard limits on agent loops: maximum steps, maximum tokens and a wall-clock timeout. Confidence: 0.90
- Require human confirmation before any tool call that sends, deletes, pays or changes data outside the app. Confidence: 0.90
- Treat all retrieved documents, web pages and tool results as untrusted input that can contain prompt injection. Confidence: 0.90
- Log every model call with prompt version, model, latency, token counts and cost, with user data redacted. Confidence: 0.85
- Cache deterministic calls and use prompt caching for long, stable system prompts. Confidence: 0.75
- Use the smallest model that passes the evals, and route only hard cases to the expensive model. Confidence: 0.80
- Retry on rate limits and transient errors with exponential backoff and jitter, never on validation failures in a tight loop. Confidence: 0.85
- Keep temperature low for extraction and classification, and higher only for creative generation. Confidence: 0.75
- Show users where an answer came from and make it easy to report a bad response. Confidence: 0.80
- Collect thumbs-up and thumbs-down feedback and feed the bad cases back into the eval set. Confidence: 0.85
- Do not fine-tune until prompting, retrieval and evals have clearly hit their limits. Confidence: 0.70
```

Prompt from the public prompts.chat library (CC0), credited to its contributor.
