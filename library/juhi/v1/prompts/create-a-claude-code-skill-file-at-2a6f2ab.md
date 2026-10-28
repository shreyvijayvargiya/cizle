# Create a Claude Code skill file at

By @llm-books · app-building
Language: en · Domains: general · Source: U04

Source page: https://github.com/llm-books/build-apps-with-ai/blob/HEAD/prompts/chapter-11/02-create-a-claude-code-skill-file-at.md

```
# Create a Claude Code skill file at

**Chapter 11 — Design System And Visual Polish**  
Used in: Step 3

---

'''
Create a Claude Code skill file at .claude/skills/habitflow-screens.md with these instructions: # HabitFlow Screen Standards When creating or modifying any screen in HabitFlow, always follow these rules:

1. Import all colors, typography, spacing, and shadows from src/theme.ts. Never hardcode colors or sizes.

2. Wrap screen content in SafeAreaView to handle notches and status bars on all devices.

3. Include a loading state using the LoadingScreen component while data is being fetched.

4. Use AppButton for all buttons (primary, secondary, or outline variant as appropriate).

5. Use AppTextInput for all text inputs, with proper labels and error messages.

6. Use the Card component for any elevated/shadowed container.

7. Add the screen to the analytics tracking (screen_viewed event).

8. Support dark mode by using theme colors that adapt to the system color scheme.

9. Handle the empty state with the EmptyState component when there is no data to display.

10. All text must use the typography sizes from the theme: title (24), heading (20), body (16), caption (13).
'''
```

Prompt file from a public GitHub repository, kept with its repository and path. Check the repository's licence before reusing it.
