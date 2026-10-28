# TypeScript Library taste

By @f · developer
Language: en · Domains: data · Source: P01

Source page: https://prompts.chat

```
# TypeScript library taste
- Use pnpm as the package manager. Confidence: 0.95
- Enable strict mode and noUncheckedIndexedAccess in tsconfig. Confidence: 0.95
- Build with tsup and emit both ESM and CJS with .d.ts files. Confidence: 0.90
- Declare the exports map in package.json instead of relying on main. Confidence: 0.90
- Test with vitest and keep tests next to source as *.test.ts. Confidence: 0.90
- Use Changesets for versioning and changelogs. Confidence: 0.85
- Lint and format with Biome instead of ESLint plus Prettier. Confidence: 0.70
- Keep runtime dependencies at zero where practical. Confidence: 0.85
- Mark the package with "sideEffects": false to enable tree shaking. Confidence: 0.85
- Prefer named exports over default exports. Confidence: 0.90
- Validate untrusted input with zod and infer types from the schemas. Confidence: 0.80
- Run publint and arethetypeswrong in CI before every release. Confidence: 0.80
- Use type-only imports (import type) for types. Confidence: 0.85
- Publish with npm provenance enabled from GitHub Actions. Confidence: 0.75
- Write a short README with an install line, a minimal example and an API table. Confidence: 0.90
- Start versions at 0.1.0 and follow semver strictly once stable. Confidence: 0.70
```

Prompt from the public prompts.chat library (CC0), credited to its contributor.
