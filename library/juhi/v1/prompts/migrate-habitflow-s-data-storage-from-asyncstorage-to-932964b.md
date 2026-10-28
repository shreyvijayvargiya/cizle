# Migrate HabitFlow's data storage from AsyncStorage to…

By @llm-books · app-building
Language: en · Domains: general · Source: U04

Source page: https://github.com/llm-books/build-apps-with-ai/blob/HEAD/prompts/chapter-12/03-migrate-habitflows-data-storage-from-asyncstorage.md

```
# Migrate HabitFlow's data storage from AsyncStorage to…

**Chapter 12 — User Accounts And Cloud Sync**  
Used in: Step 6

---

'''
Migrate HabitFlow's data storage from AsyncStorage to Firestore:

1. Create src/services/firestoreService.ts that mirrors habitStorage.ts but uses Firestore:

- Store habits at users/{userId}/habits/{habitId}

- All the same functions: getAllHabits, saveHabit, updateHabit, deleteHabit, toggleCompletion, getStreak

- Use real-time listeners (onSnapshot) so changes sync instantly

2. Create Firestore security rules (print them so I can copy to Firebase console): - Users can only read/write their own habits

3. Keep AsyncStorage as an offline cache:

- Write to both Firestore and AsyncStorage

- Load from AsyncStorage first (fast), then sync from Firestore

- App should work without internet

4. On first login, migrate any existing AsyncStorage habits to Firestore

5. Update all screens to use firestoreService instead of habitStorage
'''
```

Prompt file from a public GitHub repository, kept with its repository and path. Check the repository's licence before reusing it.
