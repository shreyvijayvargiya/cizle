# Prepare HabitFlow for Apple App Store production release

By @llm-books · app-building
Language: en · Domains: product · Source: U04

Source page: https://github.com/llm-books/build-apps-with-ai/blob/HEAD/prompts/chapter-19/01-prepare-habitflow-for-apple-app-store-production-r.md

```
# Prepare HabitFlow for Apple App Store production release

**Chapter 19 — Publishing To The Apple App Store**  
Used in: Step 2

---

'''
Prepare HabitFlow for Apple App Store production release:

1. Remove the temporary "Test Notification" button from Settings

2. Remove the "Generate Test Data" button from Settings if it exists

3. Remove all console.log statements from production code

4. Make sure the privacy policy URL is accessible from within the app (add it to the Settings screen under an "About" or "Legal" section)

5. Verify the app version in app.json is "1.0.0" and the iOS buildNumber is "1"

6. Make sure all Info.plist permission strings are clear and user-friendly (camera: "HabitFlow uses the camera to attach progress photos to your habits", notifications: "HabitFlow sends daily reminders for your habits at the times you choose")
'''
```

Prompt file from a public GitHub repository, kept with its repository and path. Check the repository's licence before reusing it.
