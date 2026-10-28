# Build the HabitDetailScreen

By @llm-books · app-building
Language: en · Domains: math, data, history · Source: U04

Source page: https://github.com/llm-books/build-apps-with-ai/blob/HEAD/prompts/chapter-10/01-build-the-habitdetailscreen.md

```
# Build the HabitDetailScreen

**Chapter 10 — Habit Detail Screen Streaks and History**  
Used in: Step 2

---

'''
Build the HabitDetailScreen. When a user taps a habit card on the Today Screen, navigate to this screen passing the habit ID as a route parameter.

1. Header showing the habit icon (large, in a colored circle), the habit name, and the habit color as accent throughout

2. A large streak counter: big number with "day streak" label and fire emoji. If streak is 0, show "Start your streak today!"

3. A stats row with three small cards side by side:

- Total completions (number)

- Completion rate (percentage, calculated from createdAt to today)

- Best streak ever (number)

4. A monthly calendar heatmap:

- Shows current month in a grid (Sun-Sat columns)

- Completed days filled with the habit color

- Incomplete days in light gray

- Today outlined with a border

- Future days dimmed

- Left/right arrow buttons to browse previous/next months

- Tapping a past day toggles its completion status

5. A "Weekly Pattern" section: 7 small bars (Mon-Sun) showing completion count per weekday across all time

6. An edit button (pencil icon) in the top-right header that navigates to EditHabitScreen

7. A "Delete Habit" button at the bottom in red, with a confirmation alert before deleting Load habit data from habitStorage using the ID. Calculate all statistics from the completions object. After deleting, navigate back to Today.
'''
```

Prompt file from a public GitHub repository, kept with its repository and path. Check the repository's licence before reusing it.
