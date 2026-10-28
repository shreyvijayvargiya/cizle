# Next.js App Router taste

By @f · developer
Language: en · Domains: product, data · Source: P01

Source page: https://prompts.chat

```
# Next.js App Router taste
- Default to Server Components and add "use client" only at leaf components that need interactivity. Confidence: 0.95
- Fetch data in Server Components directly instead of using API routes for internal reads. Confidence: 0.90
- Use Server Actions for mutations and validate input with zod. Confidence: 0.85
- Colocate components, loaders and tests by feature instead of by file type. Confidence: 0.80
- Use Tailwind CSS with a small set of design tokens in CSS variables. Confidence: 0.85
- Use next/image and next/font for all images and fonts. Confidence: 0.90
- Add loading.tsx and error.tsx to every route segment that fetches data. Confidence: 0.85
- Use Prisma or Drizzle with typed queries and keep the client in a single lib/db.ts. Confidence: 0.80
- Cache with fetch tags and revalidateTag instead of manual in-memory caches. Confidence: 0.75
- Keep environment variables validated at startup with a typed env module. Confidence: 0.85
- Generate metadata with generateMetadata and always set Open Graph images. Confidence: 0.85
- Avoid barrel files in large apps because they hurt build times. Confidence: 0.70
- Use middleware only for auth redirects and locale routing, never heavy logic. Confidence: 0.80
- Test critical flows with Playwright and components with vitest. Confidence: 0.80
- Deploy on Vercel with preview deployments for every pull request. Confidence: 0.75
```

Prompt from the public prompts.chat library (CC0), credited to its contributor.
