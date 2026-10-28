# Tauri Desktop App taste

By @f · developer
Language: en · Domains: math · Source: P01

Source page: https://prompts.chat

```
# Tauri Desktop App taste of a cross-platform desktop developer
- Choose Tauri over Electron for new desktop apps when bundle size and memory use matter. Confidence: 0.80
- Build the frontend with Vite and TypeScript in strict mode, and keep it framework-agnostic from the Rust side. Confidence: 0.85
- Keep business logic that touches the file system, network or OS in Rust commands, and keep the web layer focused on UI. Confidence: 0.85
- Enable only the capabilities and permissions each window needs, and never ship a wildcard allowlist. Confidence: 0.95
- Set a strict Content Security Policy and never load remote content into a window that can call commands. Confidence: 0.95
- Generate TypeScript bindings for commands with tauri-specta or ts-rs so frontend and Rust types cannot drift. Confidence: 0.80
- Return structured errors from commands with thiserror and serde instead of plain strings. Confidence: 0.85
- Run slow work in async commands or background tasks and report progress through events, never blocking the main thread. Confidence: 0.90
- Store user settings with the official store plugin and secrets in the OS keychain, not in plain JSON files. Confidence: 0.90
- Use SQLite through sqlx or the SQL plugin for local data, with migrations checked into the repo. Confidence: 0.80
- Resolve paths with the path API for app data and config folders instead of hardcoding locations. Confidence: 0.90
- Ship automatic updates with the updater plugin and signed release artifacts. Confidence: 0.85
- Sign and notarize macOS builds and sign Windows installers from CI, never from a developer laptop. Confidence: 0.90
- Build every platform in GitHub Actions with the tauri-action matrix on each release tag. Confidence: 0.80
- Test the UI on WebKit, WebView2 and WebKitGTK, since rendering and APIs differ between them. Confidence: 0.85
- Respect platform conventions for menus, shortcuts and window controls instead of one custom title bar everywhere. Confidence: 0.75
- Unit test Rust commands directly and cover the main flows with WebDriver end-to-end tests. Confidence: 0.70
- Keep the dependency tree small and run cargo audit and npm audit in CI. Confidence: 0.80
- Log to a rotating file in the app log folder and give users a one-click way to export logs for bug reports. Confidence: 0.75
```

Prompt from the public prompts.chat library (CC0), credited to its contributor.
