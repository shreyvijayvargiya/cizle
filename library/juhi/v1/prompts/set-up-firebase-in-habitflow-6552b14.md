# Set up Firebase in HabitFlow

By @llm-books · app-building
Language: en · Domains: general · Source: U04

Source page: https://github.com/llm-books/build-apps-with-ai/blob/HEAD/prompts/chapter-12/01-set-up-firebase-in-habitflow.md

```
# Set up Firebase in HabitFlow

**Chapter 12 — User Accounts And Cloud Sync**  
Used in: Step 5

---

'''
Set up Firebase in HabitFlow:

1. Install firebase package

2. Create src/services/firebase.ts with the Firebase configuration. Use these config values: {[}paste your firebaseConfig object here{]} IMPORTANT: Use initializeAuth with getReactNativePersistence and AsyncStorage for auth state persistence. Do NOT use getAuth() directly, as it does not persist login state in React Native. This ensures users stay logged in between app restarts.

3. Create src/services/authService.ts with:

- signUp(email, password): creates a new account

- logIn(email, password): signs in

- logOut(): signs out

- resetPassword(email): sends password reset email

- getCurrentUser(): returns the current user or null

- onAuthStateChanged(callback): listens for auth changes

4. Create these new screens in src/screens/:

- WelcomeScreen.tsx: HabitFlow logo (use the name in large purple text), tagline "Build better habits, one day at a time", and two buttons: "Sign Up" and "Log In"

- SignUpScreen.tsx: email input, password input with show/hide toggle, confirm password input, "Create Account" button, validation (valid email, 6+ char password, passwords match)

- LoginScreen.tsx: email input, password input, "Log In" button, "Forgot Password?" link, error display for wrong credentials

5. Update App.tsx navigation to:

- Show WelcomeScreen/SignUpScreen/LoginScreen when logged out

- Show the main tab navigator when logged in

- Use onAuthStateChanged to determine auth state

- Add a logout button on the Settings screen

6. Use the AppButton, AppTextInput, and theme from the design system
'''
```

Prompt file from a public GitHub repository, kept with its repository and path. Check the repository's licence before reusing it.
