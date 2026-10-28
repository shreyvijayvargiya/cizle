# Create a complete design system for HabitFlow

By @llm-books · app-building
Language: en · Domains: scifi · Source: U04

Source page: https://github.com/llm-books/build-apps-with-ai/blob/HEAD/prompts/chapter-11/01-create-a-complete-design-system-for-habitflow.md

```
# Create a complete design system for HabitFlow

**Chapter 11 — Design System And Visual Polish**  
Used in: Step 2

---

'''
Create a complete design system for HabitFlow:

1. Create src/theme.ts with:

- Colors: primary (#6C3483), secondary (#A569BD), accent (#F39C12), background (#FAFAFA), card (#FFFFFF), text (#2C3E50), textLight (#7F8C8D), success (#27AE60), error (#E74C3C)

- Typography sizes: title (24), heading (20), body (16), caption (13), button (16)

- Spacing: xs (4), sm (8), md (16), lg (24), xl (32)

- BorderRadius: sm (8), md (12), lg (16), full (999)

- Shadows: a standard card shadow object that works on both iOS (shadowColor etc.) and Android (elevation)

2. Create reusable components in src/components/:

- AppButton.tsx: primary, secondary, outline variants with optional loading spinner. Props: title, onPress, variant, loading, disabled

- Card.tsx: a shadowed container. Props: children, style

- AppTextInput.tsx: styled input with label, optional error message, optional left icon. Props: label, value, onChangeText, error, icon

- Header.tsx: screen header with title, optional back button, optional right action button

- EmptyState.tsx: centered icon, title, subtitle. Props: icon, title, subtitle

- LoadingScreen.tsx: full-screen spinner with optional message

3. Refactor ALL existing screens to use the theme constants and new components. Replace all hardcoded colors, sizes, and spacing with theme values. Replace inline buttons with AppButton, replace raw TextInputs with AppTextInput, etc.
'''
```

Prompt file from a public GitHub repository, kept with its repository and path. Check the repository's licence before reusing it.
