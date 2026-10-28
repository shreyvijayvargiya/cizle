# Feature Flag Rollout taste

By @f · developer
Language: en · Domains: product, science, data · Source: P01

Source page: https://prompts.chat

```
# Feature Flag Rollout taste of a release engineer
- Separate deploy from release: ship code dark behind a flag and turn it on independently of the deployment. Confidence: 0.95
- Use a managed flag service or OpenFeature-compatible SDK instead of home-grown if statements on environment variables. Confidence: 0.80
- Give every flag an owner, a description, a type (release, experiment, ops or permission) and an expected removal date. Confidence: 0.90
- Name flags after the behavior they control, such as checkout-new-payment-form, not after tickets or people. Confidence: 0.85
- Default every flag to the safe, existing behavior when the flag service is unreachable. Confidence: 0.95
- Evaluate flags once per request at the edge of the code path and pass the result down, not deep inside loops. Confidence: 0.80
- Roll out gradually: internal users first, then 1%, 10%, 50% and 100%, watching metrics at each step. Confidence: 0.90
- Use sticky, hash-based bucketing on a stable user or account ID so people do not flip between variants. Confidence: 0.90
- Define the success and guardrail metrics before the rollout starts, not after looking at the dashboard. Confidence: 0.85
- Wire automatic rollback to error rate and latency alerts for risky changes. Confidence: 0.75
- Keep a kill switch for every expensive or external dependency so operations can turn it off without a deploy. Confidence: 0.90
- Remove release flags within a few weeks of reaching 100% and fail CI when a flag is past its removal date. Confidence: 0.80
- Test both the on and off paths in CI for every active flag. Confidence: 0.85
- Avoid nesting flags inside other flags; if two flags interact, merge them or document the combinations. Confidence: 0.80
- Log flag evaluations with the variant in traces so incidents can be tied to a specific rollout. Confidence: 0.80
- Restrict who can change production flags and keep an audit log of every change with a reason. Confidence: 0.85
- Never use feature flags as a substitute for authorization checks. Confidence: 0.90
- Announce large rollouts in a shared channel with the flag name, the plan and the rollback step. Confidence: 0.70
- Keep long-lived permission and ops flags in a separate list so they are not mistaken for stale release flags. Confidence: 0.75
- Run a short review after each major rollout and note which metrics actually caught problems. Confidence: 0.65
```

Prompt from the public prompts.chat library (CC0), credited to its contributor.
