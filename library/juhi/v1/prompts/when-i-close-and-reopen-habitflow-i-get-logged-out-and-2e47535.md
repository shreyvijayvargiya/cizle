# When I close and reopen HabitFlow, I get logged out and…

By @llm-books · app-building
Language: en · Domains: general · Source: U04

Source page: https://github.com/llm-books/build-apps-with-ai/blob/HEAD/prompts/chapter-12/02-when-i-close-and-reopen-habitflow-i-get-logged-out.md

```
# When I close and reopen HabitFlow, I get logged out and…

**Chapter 12 — User Accounts And Cloud Sync**  
Used in: Step 5

---

'''
When I close and reopen HabitFlow, I get logged out and have to sign in again. The login should persist between app restarts. Make sure firebase.ts uses initializeAuth with getReactNativePersistence and AsyncStorage instead of getAuth(). The getAuth() function does not persist auth state in React Native.
'''
```

Prompt file from a public GitHub repository, kept with its repository and path. Check the repository's licence before reusing it.
