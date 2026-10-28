# Add local push notification reminders to HabitFlow using…

By @llm-books · app-building
Language: en · Domains: product · Source: U04

Source page: https://github.com/llm-books/build-apps-with-ai/blob/HEAD/prompts/chapter-13/01-add-local-push-notification-reminders-to-habitflow.md

```
# Add local push notification reminders to HabitFlow using…

**Chapter 13 — Push Notifications Daily Reminders**  
Used in: Step 2

---

'''
Add local push notification reminders to HabitFlow using expo-notifications:

1. Install expo-notifications and expo-device

2. Create src/services/notificationService.ts with:

- requestPermission(): asks for notification permission, returns true/false

- scheduleHabitReminder(habit): schedules a daily recurring notification at the habit's reminderTime. Title: "HabitFlow", Body: "Time to: {[}habit name{]}"

- cancelHabitReminder(habitId): cancels notifications for a specific habit

- rescheduleAll(habits): cancels all and reschedules (use after bulk changes)

3. On first app launch, show an explanation screen before requesting permission: "HabitFlow can send you daily reminders for each habit. You choose the time for each one." with an "Enable Reminders" button that triggers the permission request

4. When a habit is created (AddHabitScreen), automatically schedule its reminder

5. When a habit is edited, reschedule its reminder

6. When a habit is deleted, cancel its reminder

7. When a notification is tapped, navigate to that habit's detail screen

8. On the Settings screen, add a Notifications section with:

- A master toggle to enable/disable all notifications

- When disabled, cancel all; when re-enabled, reschedule all

9. For testing, add a temporary "Test Notification" button on Settings that schedules a notification for 5 seconds from now
'''
```

Prompt file from a public GitHub repository, kept with its repository and path. Check the repository's licence before reusing it.
