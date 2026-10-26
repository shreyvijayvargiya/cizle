---
name: create-subagent
description: "创建自定义子代理。为专门任务定制子代理（代码审查、调试、领域助手等）。"disable-model-invocation: true
---


# Create Custom Subagents

Create the reusable agent requested by the user. Distinguish persistent agent configuration from launching a one-off collaborator in this conversation.

## Resolve the supported mechanism

Use the current agent catalog, runtime configuration, and official documentation to identify how the target host registers custom agents. Do not assume `.cursor/agents/*.md` is consumed by every Codex runtime. If the target supports that format, read [file-based agent format](references/file-based-agents.md); otherwise use its actual schema and supported model/permission fields.

For a temporary independent task, current collaboration tools may be sufficient; follow their actual schema rather than inventing `subagent_type` or model IDs. A temporary spawned agent does not prove persistent registration.

## Author and validate

Infer the task, scope, and reusable knowledge from the request. Keep the description precise: name the tasks that need this specialist instead of adding “use proactively” or “after every code edit” to all agents. Preserve explicit model choices and do not broaden permissions.

Write only the task-specific prompt, necessary output expectations, and boundaries that change behavior. Honor the requested project or personal location after resolving the runtime convention. Avoid installing unrelated example agents.

Verify configuration syntax and references, then confirm runtime discovery when possible. A small independent invocation is useful when it can meaningfully test the agent within authorized scope. Report separately what was written, what loaded, and what actually ran. If persistence is unavailable, preserve the prepared prompt and identify that specific limitation without claiming installation succeeded.
