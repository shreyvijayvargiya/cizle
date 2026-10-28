# Vue App taste

By @f · developer
Language: en · Domains: product · Source: P01

Source page: https://prompts.chat

```
# Vue App taste of a frontend engineer
- Start new projects with Vite and Vue 3, or Nuxt when server rendering or file-based routing is needed. Confidence: 0.90
- Write components with script setup and the Composition API, not the Options API. Confidence: 0.90
- Use TypeScript everywhere and check templates with vue-tsc in CI. Confidence: 0.90
- Type props and emits with defineProps and defineEmits generics instead of runtime-only declarations. Confidence: 0.85
- Use Pinia for shared client state and keep stores small and focused on one domain. Confidence: 0.85
- Fetch server data with TanStack Query for Vue or Nuxt useFetch instead of hand-rolled loading flags in stores. Confidence: 0.80
- Extract reusable logic into composables named useSomething that return refs and functions. Confidence: 0.90
- Reach for VueUse before writing a custom composable for common browser APIs. Confidence: 0.75
- Prefer computed over watch, and use watch only for side effects. Confidence: 0.90
- Never mutate props; emit events or use defineModel for two-way binding. Confidence: 0.95
- Always give v-for items a stable key from the data, never the index. Confidence: 0.90
- Never combine v-if and v-for on the same element. Confidence: 0.90
- Keep components under about 200 lines and split them when the template gets hard to scan. Confidence: 0.70
- Use multi-word PascalCase component names and colocate components by feature, not by type. Confidence: 0.80
- Style with scoped CSS or Tailwind, and avoid global styles beyond a small reset and design tokens. Confidence: 0.75
- Lazy load route components with dynamic imports in Vue Router. Confidence: 0.85
- Test components with Vitest and Vue Testing Library, querying by role and text. Confidence: 0.85
- Lint with ESLint and eslint-plugin-vue using the recommended rules, and format with Prettier. Confidence: 0.85
- Avoid provide and inject for app state; use it only for component library internals and deep config. Confidence: 0.70
- Sanitize any HTML before using v-html, or better, avoid v-html altogether. Confidence: 0.95
```

Prompt from the public prompts.chat library (CC0), credited to its contributor.
