# Install React Navigation for HabitFlow

By @llm-books · app-building
Language: en · Domains: general · Source: U04

Source page: https://github.com/llm-books/build-apps-with-ai/blob/HEAD/prompts/chapter-05/03-install-react-navigation-for-habitflow.md

```
# Install React Navigation for HabitFlow

**Chapter 5 — Creating The HabitFlow Project**  
Used in: Step 9

---

'''
Install React Navigation for HabitFlow. I need:

1. Install these packages: @react-navigation/native, @react-navigation/bottom-tabs, @react-navigation/stack, react-native-screens, react-native-safe-area-context

2. Create a src/screens/ folder with these placeholder screen files:

- TodayScreen.tsx (shows centered text "Today Screen")

- AddHabitScreen.tsx (shows "Add Habit Screen")

- EditHabitScreen.tsx (shows "Edit Habit Screen")

- HabitDetailScreen.tsx (shows "Habit Detail Screen")

- SettingsScreen.tsx (shows "Settings Screen")

3. Update App.tsx to set up:

- A bottom tab navigator with two tabs: "Today" and "Settings"

- The Today tab uses a stack navigator containing: TodayScreen, AddHabitScreen, EditHabitScreen, and HabitDetailScreen

- Use Ionicons for tab bar icons (home-outline for Today, settings-outline for Settings)

- Hide the header for the tab navigator

- Use a purple (#6C3483) tint color for the active tab
'''
```

Prompt file from a public GitHub repository, kept with its repository and path. Check the repository's licence before reusing it.
