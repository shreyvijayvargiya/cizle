# Shell Scripting taste

By @f · developer
Language: en · Domains: general · Source: P01

Source page: https://prompts.chat

```
# Shell scripting taste of a DevOps engineer
- Start every script with #!/usr/bin/env bash and set -euo pipefail. Confidence: 0.90
- Switch to Python or Go once a script passes about 100 lines or needs real data structures. Confidence: 0.85
- Run ShellCheck in CI and fix warnings instead of silencing them. Confidence: 0.95
- Format scripts with shfmt so diffs stay small. Confidence: 0.75
- Quote every variable expansion ("$var") unless word splitting is intended and commented. Confidence: 0.95
- Use [[ ]] for tests and $(...) for command substitution, never backticks. Confidence: 0.90
- Declare variables inside functions with local. Confidence: 0.85
- Put the logic in functions and call a main "$@" at the bottom of the file. Confidence: 0.80
- Clean up temporary files with mktemp and trap '...' EXIT. Confidence: 0.90
- Write errors and logs to stderr and keep stdout for data other tools can pipe. Confidence: 0.85
- Exit with a non-zero status and a clear message when something fails. Confidence: 0.90
- Provide a usage function and handle -h and --help. Confidence: 0.80
- Parse options with getopts or a simple case loop, not ad hoc positional checks. Confidence: 0.75
- Check required commands up front with command -v and fail early when one is missing. Confidence: 0.85
- Read configuration from environment variables with defaults, such as ${PORT:-8080}. Confidence: 0.80
- Never parse ls output; use globs or find -print0 with xargs -0. Confidence: 0.90
- Read files line by line with while IFS= read -r line. Confidence: 0.85
- Use arrays for argument lists instead of building command strings. Confidence: 0.85
- Avoid eval, and never pass untrusted input to it. Confidence: 0.95
- Make scripts idempotent so running them twice is safe. Confidence: 0.85
- Add a --dry-run flag to anything that deletes or changes remote state. Confidence: 0.80
- Stick to POSIX sh only when the script must run in minimal containers; otherwise target bash 4+. Confidence: 0.70
```

Prompt from the public prompts.chat library (CC0), credited to its contributor.
