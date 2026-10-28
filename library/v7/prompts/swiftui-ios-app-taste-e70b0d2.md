# SwiftUI iOS App taste

By @f · developer
Language: en · Domains: product · Source: P01

Source page: https://prompts.chat

```
# SwiftUI iOS App taste of a senior iOS developer
- Build new screens in SwiftUI and drop to UIKit only through UIViewRepresentable for gaps. Confidence: 0.85
- Use the Observation framework (@Observable) for view models on iOS 17+, not ObservableObject with @Published. Confidence: 0.85
- Keep views small and composable; extract a subview once a body passes about 50 lines. Confidence: 0.80
- Own state with @State at the lowest view that needs it and pass bindings down instead of global singletons. Confidence: 0.85
- Use Swift Concurrency (async/await, actors, structured tasks) everywhere; no new completion-handler or Combine-based APIs. Confidence: 0.85
- Start async work with the .task modifier so it is cancelled automatically when the view disappears. Confidence: 0.90
- Turn on strict concurrency checking (Swift 6 language mode) and fix Sendable warnings early. Confidence: 0.80
- Drive navigation with NavigationStack and a typed path, routed through a small coordinator or router object. Confidence: 0.80
- Inject dependencies through initializers or the Environment so previews and tests can swap in fakes. Confidence: 0.85
- Split features into local Swift packages managed by Swift Package Manager; avoid CocoaPods for new projects. Confidence: 0.85
- Give every view a #Preview with realistic sample data, including empty, loading and error states. Confidence: 0.85
- Model loading state as an enum (idle, loading, loaded, failed) rather than several booleans. Confidence: 0.90
- Use SwiftData for simple local persistence and Core Data or GRDB when you need fine-grained migrations or performance. Confidence: 0.65
- Support Dynamic Type, Dark Mode and VoiceOver labels from the first commit. Confidence: 0.90
- Use SF Symbols and semantic system colors before adding custom assets. Confidence: 0.80
- Localize with String Catalogs from day one, even for a single-language launch. Confidence: 0.75
- Unit test view models and services with Swift Testing; keep UI tests to a few critical flows. Confidence: 0.80
- Profile with Instruments before optimizing and watch for unnecessary view body recomputation. Confidence: 0.75
- Never block the main thread with networking, decoding or disk I/O. Confidence: 0.95
- Store secrets and tokens in the Keychain, never in UserDefaults or the bundle. Confidence: 0.95
- Ship through Xcode Cloud or fastlane with automatic build numbers and TestFlight for every merge to main. Confidence: 0.75
- Use a structured Logger (os.Logger) with categories instead of print statements. Confidence: 0.85
```

Prompt from the public prompts.chat library (CC0), credited to its contributor.
