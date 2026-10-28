# React State Management taste

By @f · developer
Language: en · Domains: product · Source: P01

Source page: https://prompts.chat

```
# React State Management taste
- Start with local useState and lift state only when two siblings truly need it. Confidence: 0.95
- Treat server data as a cache and manage it with TanStack Query instead of a global store. Confidence: 0.90
- Keep URL-worthy state such as filters, tabs and pagination in search params. Confidence: 0.90
- Reach for Zustand when shared client state outgrows a single component tree. Confidence: 0.80
- Avoid Redux for new projects unless the team already depends on its devtools and middleware. Confidence: 0.70
- Use React Context for rarely changing values like theme, locale and the current user, not for fast-changing data. Confidence: 0.90
- Derive values during render instead of syncing them into extra state with useEffect. Confidence: 0.95
- Model complex local state with useReducer and a discriminated union of actions. Confidence: 0.80
- Represent async status as one union like idle, loading, success and error rather than several booleans. Confidence: 0.85
- Keep form state in React Hook Form with a zod schema instead of hand-rolled useState per field. Confidence: 0.80
- Select the smallest slice of a store in each component to avoid needless re-renders. Confidence: 0.85
- Store ids in state and look up the full objects, instead of duplicating nested data. Confidence: 0.80
- Use optimistic updates for quick user actions and roll back on error. Confidence: 0.75
- Never mutate state objects in place; return new objects or use Immer for deep updates. Confidence: 0.90
- Keep persisted state small and versioned when saving it to localStorage. Confidence: 0.75
- Reset component state by changing its key instead of writing reset effects. Confidence: 0.80
- Colocate stores with the feature that owns them rather than in one global store folder. Confidence: 0.75
- Type every store and context value explicitly and avoid any in state shapes. Confidence: 0.90
```

Prompt from the public prompts.chat library (CC0), credited to its contributor.
