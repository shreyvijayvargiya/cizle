# Jetpack Compose Android App taste

By @f · developer
Language: en · Domains: scifi, product · Source: P01

Source page: https://prompts.chat

```
# Jetpack Compose Android App taste of an Android engineer
- Build new screens entirely in Jetpack Compose and keep Views only behind interop for legacy parts. Confidence: 0.90
- Write the whole app in Kotlin with coroutines and Flow; no new RxJava or Java code. Confidence: 0.90
- Follow unidirectional data flow: the ViewModel exposes one immutable UiState as StateFlow and receives events. Confidence: 0.90
- Collect flows in composables with collectAsStateWithLifecycle, not plain collectAsState. Confidence: 0.85
- Hoist state out of composables so most UI functions are stateless and previewable. Confidence: 0.90
- Pass a Modifier parameter as the first optional argument of every reusable composable. Confidence: 0.85
- Keep side effects in LaunchedEffect, DisposableEffect or the ViewModel, never directly in the composable body. Confidence: 0.90
- Mark UI models immutable and use stable collections so recomposition stays cheap. Confidence: 0.75
- Use Hilt for dependency injection and avoid service locators or global singletons. Confidence: 0.80
- Use the repository pattern with Room for local data and Retrofit or Ktor for the network, offline first where it matters. Confidence: 0.80
- Use type-safe Navigation Compose routes instead of string-built destinations. Confidence: 0.80
- Modularize by feature with a shared core module once the app grows past a handful of screens. Confidence: 0.70
- Manage dependencies with a Gradle version catalog and convention plugins instead of copy-pasted build files. Confidence: 0.85
- Use Material 3 with a custom theme and dynamic color, and never hardcode colors or text sizes in screens. Confidence: 0.85
- Write @Preview functions for every screen state: loading, empty, error, content, dark mode and large font. Confidence: 0.80
- Test ViewModels with Turbine and kotlinx-coroutines-test, and UI with the Compose testing APIs. Confidence: 0.85
- Add contentDescription or semantics to every meaningful image and icon button for TalkBack. Confidence: 0.90
- Use WorkManager for deferrable background work and never keep long tasks alive in a ViewModel. Confidence: 0.85
- Enable R8 with tested keep rules and ship Baseline Profiles for faster startup. Confidence: 0.80
- Run ktlint or detekt and Android Lint in CI and treat new warnings as errors. Confidence: 0.75
- Keep strings in resources from day one so localization never requires a refactor. Confidence: 0.85
```

Prompt from the public prompts.chat library (CC0), credited to its contributor.
