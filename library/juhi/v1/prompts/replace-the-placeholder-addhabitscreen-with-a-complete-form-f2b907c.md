# Replace the placeholder AddHabitScreen with a complete form

By @llm-books · app-building
Language: en · Domains: health, nature · Source: U04

Source page: https://github.com/llm-books/build-apps-with-ai/blob/HEAD/prompts/chapter-07/01-replace-the-placeholder-addhabitscreen-with-a-comp.md

```
# Replace the placeholder AddHabitScreen with a complete form

**Chapter 7 — The Add Habit Screen**  
Used in: Step 2

---

'''
Replace the placeholder AddHabitScreen with a complete form. The screen should have:

1. A text input for the habit name (required, max 50 characters) with a character counter

2. An icon picker section: a grid of 20 Ionicons suitable for habits (water-outline, book-outline, fitness-outline, flower-outline, moon-outline, musical-note-outline, leaf-outline, heart-outline, bicycle-outline, walk-outline, cafe-outline, bed-outline, code-slash-outline, language-outline, briefcase-outline, camera-outline, globe-outline, nutrition-outline, eye-outline, hand-left-outline). Tapping an icon selects it with a visible purple highlight.

3. A color picker: 8 color circles in a row (blue #3498DB, green #27AE60, orange #E67E22, purple #8E44AD, red #E74C3C, teal #17A589, pink #E91E63, yellow #F1C40F). Tapping selects with a checkmark overlay.

4. A frequency selector: 7 day buttons labeled M T W T F S S that toggle on/off. Default: all weekdays on.

5. A reminder time picker using a time selector component

6. A "Create Habit" button at the bottom that is disabled and gray until a name is entered, then becomes purple and active

7. Validation: if the user taps Create without a name, show a red error message below the name input After creating, log the habit data to the console and navigate back to the Today screen. Style consistently with TodayScreen.
'''
```

Prompt file from a public GitHub repository, kept with its repository and path. Check the repository's licence before reusing it.
