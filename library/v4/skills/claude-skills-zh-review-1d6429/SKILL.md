---
name: review
description: "代码审查总入口。按需调度 Bugbot 或安全审查子代理。"
disable-model-invocation: true
---


# Review

Select the review from the request. For bugs and general correctness, use [review-bugbot](../review-bugbot/SKILL.md); for a security review, use [review-security](../review-security/SKILL.md). If the user explicitly asks to choose a service or the distinction changes the scope, ask a short question. Do not ask again when the requested review is already clear.

Perform the selected review against the requested changes. Its workflow must use tools actually available in the current host and accurately name the reviewer that ran.
