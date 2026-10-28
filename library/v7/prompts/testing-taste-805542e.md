# Testing taste

By @f · developer
Language: en · Domains: engineering · Source: P01

Source page: https://prompts.chat

```
# Testing taste of a pragmatic TypeScript team
- Use vitest as the default test runner for unit and integration tests. Confidence: 0.90
- Keep test files next to the code they cover as *.test.ts. Confidence: 0.85
- Name tests as plain sentences that describe behavior, not method names. Confidence: 0.90
- Follow arrange, act, assert with a blank line between each phase. Confidence: 0.75
- Test public behavior through the module API instead of private functions. Confidence: 0.90
- Prefer real collaborators and in-memory fakes over mocks. Confidence: 0.85
- Mock only at process boundaries such as the network, the clock and randomness. Confidence: 0.90
- Intercept HTTP with msw instead of stubbing fetch by hand. Confidence: 0.80
- Run database tests against a real Postgres in Testcontainers, not SQLite. Confidence: 0.80
- Freeze time with fake timers and pass seeds to anything random. Confidence: 0.90
- Build test data with small factory functions that accept overrides. Confidence: 0.85
- Keep snapshot tests rare and small, and review every snapshot diff. Confidence: 0.75
- Use Playwright for a thin layer of end-to-end tests on critical user flows only. Confidence: 0.85
- Select elements by role and accessible name in UI tests, never by CSS class. Confidence: 0.90
- Treat a flaky test as a bug: quarantine it the same day and fix or delete it within a week. Confidence: 0.85
- Never use sleep in tests; wait for an explicit condition instead. Confidence: 0.95
- Keep the full unit suite under one minute on a laptop. Confidence: 0.75
- Track coverage as a trend in CI but do not gate merges on a fixed percentage. Confidence: 0.70
- Add property-based tests with fast-check for parsers and pure logic. Confidence: 0.65
- Write a failing regression test before fixing every reported bug. Confidence: 0.90
- Run tests in random order to catch hidden shared state. Confidence: 0.70
```

Prompt from the public prompts.chat library (CC0), credited to its contributor.
