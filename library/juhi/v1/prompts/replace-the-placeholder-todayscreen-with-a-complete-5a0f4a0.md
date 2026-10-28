# Replace the placeholder TodayScreen with a complete…

By @llm-books · app-building
Language: en · Domains: health, nature · Source: U04

Source page: https://github.com/llm-books/build-apps-with-ai/blob/HEAD/prompts/chapter-06/01-replace-the-placeholder-todayscreen-with-a-complet.md

```
# Replace the placeholder TodayScreen with a complete…

**Chapter 6 — Building The Today Screen**  
Used in: Step 2

---

'''
Replace the placeholder TodayScreen with a complete implementation. The screen should have:

1. A header section at the top showing:

- Today's date in friendly format ("Wednesday, January 15")

- A greeting based on time of day ("Good morning!" / "Good afternoon!" / "Good evening!")

- A circular progress ring showing completed vs total habits (e.g., "4/6")

2. A scrollable list of habit cards using FlatList. Each card shows:

- A colored circle on the left with an Ionicons icon inside

- The habit name in bold

- A small streak counter with a fire emoji ("12 days")

- A circular checkbox on the right that fills with the habit's color when tapped

3. A floating "+" button (FAB) in the bottom-right corner positioned above the tab bar

4. An empty state when there are no habits: centered text saying "No habits yet" with a subtitle "Tap + to start building your first habit" Use this hardcoded sample data for now:

- name: "Drink water", icon: "water-outline", color: "#3498DB", streak: 12, completedToday: true

- name: "Read 30 minutes", icon: "book-outline", color: "#27AE60", streak: 5, completedToday: false

- name: "Morning exercise", icon: "fitness-outline", color: "#E67E22", streak: 0, completedToday: false

- name: "Meditate", icon: "flower-outline", color: "#8E44AD", streak: 23, completedToday: true

- name: "No sugar", icon: "close-circle-outline", color: "#E74C3C", streak: 3, completedToday: false

- name: "Journal", icon: "pencil-outline", color: "#17A589", streak: 8, completedToday: false Make checkboxes toggleable using React state. Update the progress ring when checkboxes change. Use clean styling with card shadows and generous spacing.
'''
```

Prompt file from a public GitHub repository, kept with its repository and path. Check the repository's licence before reusing it.
