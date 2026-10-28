# Error Handling taste

By @f · developer
Language: en · Domains: engineering, data · Source: P01

Source page: https://prompts.chat

```
# Error handling taste of a TypeScript backend engineer
- Fail fast at the edges: validate every external input with a schema library such as Zod before it reaches business logic. Confidence: 0.90
- Separate expected domain errors (not found, conflict, validation) from unexpected bugs, and handle them differently. Confidence: 0.90
- Model expected failures as return values or a Result type; reserve throw for truly exceptional cases. Confidence: 0.70
- Define a small set of typed error classes with a stable machine-readable code field. Confidence: 0.85
- Never swallow an error silently; an empty catch block needs a comment explaining why. Confidence: 0.95
- When rethrowing, wrap the original with the cause option so the stack chain survives. Confidence: 0.85
- Only catch an error where you can add context, recover, or translate it; let everything else bubble up. Confidence: 0.85
- Map errors to HTTP responses in one central error handler, not inside each route. Confidence: 0.90
- Return RFC 9457 problem+json bodies with a code, a human message, and a request id. Confidence: 0.75
- Never leak stack traces, SQL, or internal hostnames to API clients. Confidence: 0.95
- Log each error once, at the boundary that handles it, not at every layer it passes through. Confidence: 0.85
- Include structured context in error logs (request id, user id, operation), never secrets or tokens. Confidence: 0.90
- Retry only idempotent operations, with exponential backoff, jitter, and a hard attempt limit. Confidence: 0.90
- Put a timeout on every network call; a missing timeout is a bug. Confidence: 0.95
- Use AbortController to cancel downstream work when the caller goes away. Confidence: 0.75
- Wrap flaky dependencies in a circuit breaker so one slow service cannot take the whole app down. Confidence: 0.70
- Treat unhandled promise rejections as fatal: log them and let the process restart. Confidence: 0.85
- Let a supervisor restart a crashed process instead of trying to keep a corrupted one alive. Confidence: 0.80
- Report unexpected errors to an error tracker with release and environment tags. Confidence: 0.85
- Write tests for failure paths, not only the happy path. Confidence: 0.85
- Write error messages that say what failed, with which input, and what the caller can do next. Confidence: 0.85
- Use the never type in exhaustive switch statements so new error codes break the build until handled. Confidence: 0.75
```

Prompt from the public prompts.chat library (CC0), credited to its contributor.
