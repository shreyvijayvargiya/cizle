# Add sharing and rating features to HabitFlow

By @llm-books · app-building
Language: en · Domains: math, product · Source: U04

Source page: https://github.com/llm-books/build-apps-with-ai/blob/HEAD/prompts/chapter-20/02-add-sharing-and-rating-features-to-habitflow.md

```
# Add sharing and rating features to HabitFlow

**Chapter 20 — Marketing And Growth**  
Used in: Step 2

---

'''
Add sharing and rating features to HabitFlow:

1. A "Share HabitFlow" button on the Settings screen that uses React Native's Share API to open the native share sheet with: "I'm building better habits with HabitFlow! Track your daily habits and build streaks. Try it free: {[}app store link{]}"

2. A "Share My Progress" button on the Statistics screen that generates a shareable text summary: "This month I completed {[}X{]} habits with a {[}Y{]}% success rate. My best streak is {[}Z{]} days! #HabitFlow"

3. A rating prompt that appears after the user completes a 7-day streak on any habit. Use expo-store-review to trigger the native review dialog. Only show the prompt once. If the user dismisses it, do not show it again.
'''
```

Prompt file from a public GitHub repository, kept with its repository and path. Check the repository's licence before reusing it.
