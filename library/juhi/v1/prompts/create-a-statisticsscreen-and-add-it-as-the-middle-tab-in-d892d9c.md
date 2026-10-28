# Create a StatisticsScreen and add it as the middle tab in…

By @llm-books · app-building
Language: en · Domains: data, math · Source: U04

Source page: https://github.com/llm-books/build-apps-with-ai/blob/HEAD/prompts/chapter-14/01-create-a-statisticsscreen-and-add-it-as-the-middle.md

```
# Create a StatisticsScreen and add it as the middle tab in…

**Chapter 14 — Statistics Screen Charts and Analytics**  
Used in: Step 2

---

'''
Create a StatisticsScreen and add it as the middle tab in the bottom navigation (between Today and Settings) with a bar-chart-outline icon.

1. Install react-native-chart-kit

2. The screen should show: a. Summary header with 3 large stats cards:

- Current best active streak across all habits

- Total completions this month

- Average daily completion rate this month (percentage) b. A "Weekly Completion Rate" line chart: completion percentage for each of the last 8 weeks. X-axis shows week labels ("W1", "W2"...), Y-axis 0-100%. c. A "Daily Pattern" bar chart: average completions by day of week (Mon-Sun) across all habits and all time. d. A "Habit Leaderboard" section: all habits ranked by completion rate, each showing the habit icon and color, name, a horizontal progress bar showing the rate, and the streak count.

3. Add a month selector at the top (left/right arrows and month name) so users can view stats for previous months

4. If there is less than 1 week of data, show a friendly message: "Keep going! Stats will appear after your first week."

5. Use the theme colors. Make the charts use the primary purple. Calculate all data from the habits loaded via firestoreService (or habitStorage if offline).
'''
```

Prompt file from a public GitHub repository, kept with its repository and path. Check the repository's licence before reusing it.
