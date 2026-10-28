# Code Review taste

By @f · developer
Language: en · Domains: product, history · Source: P01

Source page: https://prompts.chat

```
# Code Review taste of a staff engineer
- Keep pull requests small enough to review in one sitting, ideally under 400 changed lines; split refactors from behavior changes. Confidence: 0.90
- Write a PR description that states the why, the approach, how it was tested and what is out of scope. Confidence: 0.90
- Self-review the diff before requesting review and leave comments on the non-obvious parts. Confidence: 0.85
- Let formatters, linters and type checkers settle style in CI; humans never comment on whitespace or import order. Confidence: 0.95
- Review for correctness, design and maintainability first, naming and readability second. Confidence: 0.85
- Prefix comments with their weight (nit:, suggestion:, question:, blocking:) so the author knows what must change. Confidence: 0.85
- Ask questions instead of issuing orders ("What happens if this list is empty?"). Confidence: 0.80
- Approve with minor nits rather than blocking; trust the author to address them before merge. Confidence: 0.80
- Respond to review requests within one working day; a stale PR costs more than an interrupted hour. Confidence: 0.85
- Require tests for every bug fix that would have failed before the fix. Confidence: 0.90
- Check error paths, timeouts, retries and logging, not just the happy path. Confidence: 0.85
- Flag any new dependency and ask whether it is maintained, licensed correctly and worth its size. Confidence: 0.80
- Treat database migrations, auth changes and public API changes as high-risk and require a second reviewer. Confidence: 0.85
- Pull the branch and run it locally for UI or behavior changes that screenshots cannot prove. Confidence: 0.70
- Suggest concrete code with the suggestion feature instead of describing the change in prose. Confidence: 0.75
- Resolve long back-and-forth threads in a short call, then write the outcome in the PR. Confidence: 0.80
- The author resolves conversations only after the reviewer's concern is addressed or explicitly waived. Confidence: 0.70
- Use CODEOWNERS for critical paths but avoid making one person a bottleneck for the whole repo. Confidence: 0.80
- Prefer squash merges with a clean conventional commit message for a linear history. Confidence: 0.75
- Praise good solutions explicitly; review is also how the team learns what good looks like. Confidence: 0.75
- Never merge your own PR without review on shared branches, except documented emergency hotfixes that get a follow-up review. Confidence: 0.85
```

Prompt from the public prompts.chat library (CC0), credited to its contributor.
