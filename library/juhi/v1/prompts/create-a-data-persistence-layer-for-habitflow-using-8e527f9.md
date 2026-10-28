# Create a data persistence layer for HabitFlow using…

By @llm-books · app-building
Language: en · Domains: general · Source: U04

Source page: https://github.com/llm-books/build-apps-with-ai/blob/HEAD/prompts/chapter-08/01-create-a-data-persistence-layer-for-habitflow-usin.md

```
# Create a data persistence layer for HabitFlow using…

**Chapter 8 — Saving Data Making Habits Persist**  
Used in: Step 2

---

'''
Create a data persistence layer for HabitFlow using AsyncStorage:

1. Install @react-native-async-storage/async-storage

2. Create src/services/habitStorage.ts with these functions:

- getAllHabits(): loads all habits from storage, returns an array

- saveHabit(habit): saves a new habit with a unique ID (use Date.now().toString())

- updateHabit(id, updates): updates specific fields of a habit

- deleteHabit(id): removes a habit

- toggleCompletion(id, dateString): toggles whether a habit is complete for a given date

- getStreak(habit): calculates current streak (consecutive completed days ending today or yesterday). Use the device local timezone for all date comparisons, never UTC Each habit object should have: id, name, icon, color, frequency (array of day names), reminderTime, createdAt, completions (object mapping date strings to boolean)

3. Modify TodayScreen to:

- Remove all hardcoded sample data

- Load habits from storage when the screen gains focus (use useFocusEffect)

- Call toggleCompletion when a checkbox is tapped

- Recalculate progress after toggling

- Show the empty state when there are no habits

4. Modify AddHabitScreen to:

- Call saveHabit with the form data when Create is tapped

- Navigate back to Today after saving

5. Add a loading spinner while data loads

6. Add try/catch error handling around all storage operations
'''
```

Prompt file from a public GitHub repository, kept with its repository and path. Check the repository's licence before reusing it.
