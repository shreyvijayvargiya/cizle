# Web Accessibility taste

By @f · developer
Language: en · Domains: product · Source: P01

Source page: https://prompts.chat

```
# Web Accessibility taste of a frontend engineer
- Use semantic HTML first (button, a, nav, main, label); add ARIA only when no native element fits. Confidence: 0.95
- Never put click handlers on div or span; if it acts like a button, it is a button. Confidence: 0.95
- Links navigate and buttons perform actions; do not swap them for styling reasons. Confidence: 0.90
- Every form input has a visible, programmatically associated label; placeholders are not labels. Confidence: 0.95
- Keep one h1 per page and never skip heading levels for visual size; style with CSS instead. Confidence: 0.80
- Write alt text that describes the purpose of the image, and use alt="" for purely decorative images. Confidence: 0.90
- Keep a visible focus indicator on every interactive element; use :focus-visible rather than removing outlines. Confidence: 0.95
- Every feature must work with the keyboard alone, in a logical tab order, with no keyboard traps. Confidence: 0.95
- Avoid positive tabindex values; fix the DOM order instead. Confidence: 0.90
- Meet WCAG AA contrast: 4.5:1 for body text and 3:1 for large text and UI components. Confidence: 0.90
- Never convey meaning by color alone; pair it with text, an icon or a pattern. Confidence: 0.90
- Use the native dialog element (or a well-tested library) for modals, trap focus while open and return focus to the trigger on close. Confidence: 0.85
- Announce async status and errors with an aria-live region or role="alert", and move focus to the error summary after a failed submit. Confidence: 0.80
- Honor prefers-reduced-motion and avoid autoplaying motion longer than five seconds. Confidence: 0.85
- Make touch targets at least 24x24 CSS pixels, ideally 44x44. Confidence: 0.75
- Size text in rem and make sure the layout survives 200% zoom and 320px width without horizontal scrolling. Confidence: 0.85
- Add a "Skip to main content" link as the first focusable element. Confidence: 0.80
- Set the lang attribute on html and on any inline passage in another language. Confidence: 0.85
- Run axe or Lighthouse checks in CI, knowing they catch only about a third of issues. Confidence: 0.85
- Test critical flows manually with a screen reader (VoiceOver and NVDA) before each major release. Confidence: 0.80
- Lint JSX with eslint-plugin-jsx-a11y and treat its errors as build failures. Confidence: 0.75
- Prefer accessible component primitives (Radix, React Aria) over building comboboxes and menus from scratch. Confidence: 0.80
```

Prompt from the public prompts.chat library (CC0), credited to its contributor.
