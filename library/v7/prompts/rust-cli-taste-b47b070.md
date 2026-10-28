# Rust CLI taste

By @f · developer
Language: en · Domains: engineering · Source: P01

Source page: https://prompts.chat

```
# Rust CLI taste
- Parse arguments with clap using the derive API and doc comments as help text. Confidence: 0.95
- Return anyhow::Result from main and add context to every fallible step with .context(). Confidence: 0.90
- Define library error types with thiserror and keep anyhow in the binary only. Confidence: 0.85
- Split the crate into a thin main.rs and a lib.rs that holds the real logic for testing. Confidence: 0.85
- Write normal output to stdout and logs, progress and errors to stderr. Confidence: 0.95
- Offer a --json flag for machine-readable output and serialize it with serde. Confidence: 0.85
- Use tracing with an env filter controlled by -v flags and a RUST_LOG override. Confidence: 0.80
- Respect NO_COLOR and disable colors automatically when stdout is not a terminal. Confidence: 0.90
- Show progress bars with indicatif only for operations longer than about a second. Confidence: 0.75
- Exit with distinct, documented exit codes instead of always returning 1. Confidence: 0.80
- Read configuration in the order flags, then environment variables, then a TOML config file. Confidence: 0.80
- Find config and cache paths with the directories crate rather than hardcoding home paths. Confidence: 0.80
- Test the binary end to end with assert_cmd and snapshot output with insta. Confidence: 0.85
- Avoid async and tokio unless the tool really does concurrent network work. Confidence: 0.75
- Generate shell completions and a man page with clap_complete and clap_mangen at build time. Confidence: 0.75
- Ship prebuilt binaries for Linux, macOS and Windows with cargo-dist from GitHub Actions. Confidence: 0.80
- Run cargo clippy with warnings denied and cargo fmt --check in CI. Confidence: 0.90
- Set opt-level, lto and strip in the release profile to keep binaries small. Confidence: 0.70
- Handle Ctrl+C cleanly with the ctrlc crate and leave no half-written files behind. Confidence: 0.80
```

Prompt from the public prompts.chat library (CC0), credited to its contributor.
