# React Native App taste

By @f · developer
Language: en · Domains: scifi, product, data · Source: P01

Source page: https://prompts.chat

```
# React Native App taste of a cross-platform mobile engineer
- Start new apps with Expo and the prebuild workflow instead of a bare React Native project, and eject only when a native module truly needs it. Confidence: 0.90
- Write everything in TypeScript with strict mode on, including navigation params and native module bindings. Confidence: 0.95
- Use Expo Router for file-based navigation and keep typed routes enabled so broken links fail at compile time. Confidence: 0.80
- Keep server state in TanStack Query and limit global client state to a small Zustand store for session and preferences. Confidence: 0.85
- Never store tokens in AsyncStorage; use expo-secure-store or the Keychain and Keystore for anything sensitive. Confidence: 0.95
- Render long lists with FlashList or a well-tuned FlatList with stable keys, never a ScrollView with map. Confidence: 0.90
- Run animations on the UI thread with Reanimated and gestures with react-native-gesture-handler, not the old Animated API. Confidence: 0.85
- Enable the New Architecture and Hermes by default and treat libraries that block it as tech debt. Confidence: 0.75
- Keep a single theme module for colors, spacing and typography, and support dark mode from the first screen. Confidence: 0.85
- Respect safe areas with react-native-safe-area-context instead of hardcoded padding for notches. Confidence: 0.90
- Put platform-specific code in .ios.tsx and .android.tsx files rather than scattering Platform.OS checks. Confidence: 0.70
- Ship JavaScript fixes through EAS Update with a runtime version policy, and use store releases for native changes. Confidence: 0.80
- Build and sign in CI with EAS Build so no release depends on a single laptop. Confidence: 0.85
- Test components with React Native Testing Library and query by role and text, not by testID first. Confidence: 0.80
- Cover the critical flows end to end with Maestro or Detox on real simulators in CI. Confidence: 0.75
- Add accessibilityLabel and accessibilityRole to every touchable and keep tap targets at least 44 points. Confidence: 0.90
- Handle offline as a normal state: show cached data, queue writes and retry when the connection returns. Confidence: 0.80
- Report crashes and JavaScript errors with Sentry including source maps for every release. Confidence: 0.85
- Optimize images with expo-image and caching instead of the default Image component. Confidence: 0.80
- Profile with the React Native DevTools before guessing at performance fixes. Confidence: 0.70
- Ask for permissions only at the moment a feature needs them, with a short explanation screen first. Confidence: 0.90
```

Prompt from the public prompts.chat library (CC0), credited to its contributor.
