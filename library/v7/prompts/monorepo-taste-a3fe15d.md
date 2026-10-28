# Monorepo taste

By @f · developer
Language: en · Domains: data · Source: P01

Source page: https://prompts.chat

```
# Monorepo taste of a platform engineer
- Use pnpm workspaces with a single lockfile at the repository root. Confidence: 0.95
- Put deployable apps in apps/ and shared libraries in packages/. Confidence: 0.90
- Orchestrate tasks with Turborepo and enable remote caching in CI. Confidence: 0.85
- Reference internal packages with the workspace:* protocol. Confidence: 0.90
- Scope every internal package name under one npm scope such as @acme/. Confidence: 0.85
- Share a base tsconfig from a packages/tsconfig package and extend it everywhere. Confidence: 0.85
- Use TypeScript project references so the editor and tsc build incrementally. Confidence: 0.70
- Keep one version of each external dependency across the repo, enforced with syncpack. Confidence: 0.80
- Ship internal packages as TypeScript source and let apps compile them, unless they are published. Confidence: 0.75
- Version and publish public packages with Changesets. Confidence: 0.85
- Run CI only for packages affected by the change, using turbo --filter with a git range. Confidence: 0.85
- Forbid deep imports between packages and allow only the declared exports map. Confidence: 0.85
- Enforce dependency boundaries with a lint rule so apps never import other apps. Confidence: 0.90
- Keep the root package.json free of runtime dependencies. Confidence: 0.80
- Assign owners per directory with a CODEOWNERS file. Confidence: 0.80
- Pin the Node.js and pnpm versions with .nvmrc and the packageManager field. Confidence: 0.90
- Prefer one root lint and format config over a copy in every package. Confidence: 0.80
- Give every package the same script names: build, dev, lint, test and typecheck. Confidence: 0.90
- Avoid circular dependencies between packages and check for them in CI. Confidence: 0.85
- Split a package out only when a second consumer actually needs it. Confidence: 0.75
```

Prompt from the public prompts.chat library (CC0), credited to its contributor.
