# Set up Firebase Crashlytics and Analytics for HabitFlow

By @llm-books · app-building
Language: en · Domains: general · Source: U04

Source page: https://github.com/llm-books/build-apps-with-ai/blob/HEAD/prompts/chapter-22/01-set-up-firebase-crashlytics-and-analytics-for-habi.md

```
# Set up Firebase Crashlytics and Analytics for HabitFlow

**Chapter 22 — Maintaining And Updating HabitFlow**  
Used in: Step 1

---

'''
Set up Firebase Crashlytics and Analytics for HabitFlow: IMPORTANT: We previously installed the firebase JS SDK for auth and Firestore. Crashlytics requires the React Native Firebase packages instead. Please:

1. Install @react-native-firebase/app, @react-native-firebase/crashlytics, and @react-native-firebase/analytics

2. Add the necessary Expo config plugins in app.json for these packages

3. Configure Crashlytics to automatically capture all crashes and non-fatal errors

4. Add analytics events for key user actions:

- habit_created (with habit frequency as a parameter)

- habit_completed (with streak length as a parameter)

- habit_deleted

- all_habits_completed_today

- screen_viewed (for each screen)

5. Log user properties: total_habits, longest_streak, account_age_days

6. Show me how to view crash reports and analytics in the Firebase console

7. Tell me if I need to rebuild my development build after these changes
'''
```

Prompt file from a public GitHub repository, kept with its repository and path. Check the repository's licence before reusing it.
