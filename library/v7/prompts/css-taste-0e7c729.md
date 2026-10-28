# CSS taste

By @f · developer
Language: en · Domains: general · Source: P01

Source page: https://prompts.chat

```
# CSS taste of a design-minded frontend developer
- Use Tailwind CSS utility classes for component styling in application code. Confidence: 0.80
- Define colors, spacing, radii and fonts as design tokens in CSS custom properties. Confidence: 0.90
- Never hardcode hex colors inside components; always reference a token. Confidence: 0.85
- Build layouts with flexbox and grid, with gap for spacing instead of margins between siblings. Confidence: 0.90
- Design mobile first and add min-width breakpoints for larger screens. Confidence: 0.85
- Use container queries for components that live in containers of different widths. Confidence: 0.75
- Use rem for font sizes and spacing, and px only for hairline borders. Confidence: 0.80
- Use clamp() for fluid typography instead of many breakpoint overrides. Confidence: 0.75
- Keep specificity flat: single class selectors, no IDs, and no !important outside utilities. Confidence: 0.90
- Use cascade layers to order reset, base, components and utilities. Confidence: 0.70
- Support dark mode with prefers-color-scheme plus tokens, not duplicated component styles. Confidence: 0.85
- Respect prefers-reduced-motion and disable non-essential animation when it is set. Confidence: 0.90
- Never remove focus outlines; style them with :focus-visible instead. Confidence: 0.95
- Meet WCAG AA contrast for all text and interactive elements. Confidence: 0.90
- Animate only transform and opacity for smooth, cheap transitions. Confidence: 0.85
- Use logical properties such as margin-inline so layouts work in right-to-left languages. Confidence: 0.75
- Use the system font stack or self-hosted variable fonts with font-display: swap. Confidence: 0.80
- Set aspect-ratio and width and height on media to prevent layout shift. Confidence: 0.85
- Use native CSS nesting sparingly and never more than two levels deep. Confidence: 0.70
- Sort Tailwind classes automatically with the Prettier plugin. Confidence: 0.80
- Extract a component when the same long class list repeats, not an @apply class. Confidence: 0.75
- Make sure nothing scrolls horizontally at a 320px viewport width. Confidence: 0.85
```

Prompt from the public prompts.chat library (CC0), credited to its contributor.
