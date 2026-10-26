---
name: create-hook
description: "创建事件钩子。识别运行环境后按钩子 schema 注册指定行为。"
---


# Create Hooks

Create or update the event hook the user requested. Resolve the target agent/editor and the hook schema it actually supports before writing configuration; a shared product name alone does not establish the config path, event names, or script working directory.

Inspect existing project/user hook configuration, the relevant runtime help or installed schema, and current official documentation as needed. The supplied [hooks reference](references/hooks-format.md) describes the `.cursor/hooks.json` runtime: read it only if that is the confirmed target. For another runtime, use its documented format rather than copying event names into a guessed path.

Infer scope, event, filtering, and behavior from the request. Ask only for an unresolved decision that materially affects the behavior. Preserve unrelated hooks and do not add network, approval, or denial policies the user did not request.

## Implementation and verification

- Choose the narrowest supported event and match only the intended actions.
- Use an interpreter available to the actual hook process. On Windows, use an explicit supported command such as PowerShell or Python when appropriate; do not assume Bash, shebang execution, or `chmod` semantics.
- Read and write only the event's documented JSON fields. Keep diagnostic output separate from protocol stdout and redact credentials.
- Make failure behavior match the requested purpose. An audit-only hook should not accidentally become an enforcement hook.
- Back up the existing configuration before changing it and validate syntax and script behavior with representative inputs.
- Verify the live hook is loaded and fires for the relevant event when the environment allows it. If only the file and script were checked, state that runtime acceptance remains unverified.

Keep matchers simple; test JavaScript-style regexes for the `.cursor` runtime rather than using POSIX character classes. Any end-to-end test must stay within the user-authorized side effects.
