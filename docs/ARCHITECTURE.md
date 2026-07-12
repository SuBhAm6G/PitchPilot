# PitchPilot Architecture: The Deterministic Engine Pattern

At the core of PitchPilot is a rigorous architectural philosophy: **Business logic must be completely decoupled from the UI and framework.**

## The 10 Engines

PitchPilot uses 10 pure, deterministic engines to power its context-awareness. These live in `lib/engine/`.

1. **Context Decision Engine**: Maps `UserProfile` + `StadiumState` → prioritized `ContextRecommendation[]`.
2. **Crowd Analytics Engine**: Calculates zone density levels and identifies bottlenecks.
3. **Wait Time Engine**: Estimates queue wait times using service-rate modeling.
4. **Incident Engine**: Prioritizes incidents by severity and assigns staff.
5. **Match Engine**: Generates match-context recommendations for goals, cards, and phases.
6. **Navigation Engine**: Uses Dijkstra's algorithm for shortest-path routing between 9 stadium zones.
7. **Emergency Engine**: Provides evacuation routing with zone compromise detection.
8. **Itinerary Engine**: Generates phase-aware personal match-day planning.
9. **Weather Engine**: Issues temperature and condition-based advisories.
10. **Sentiment Engine**: Computes crowd sentiment scoring from match events and incidents.

## Why Deterministic Engines?

1. **Testability**: Pure functions (same input always equals same output) are incredibly easy to test. PitchPilot has over 160 unit tests that run in milliseconds because they don't rely on the DOM or React.
2. **Framework Agnosticism**: If FIFA decides to rewrite the app in React Native, Flutter, or Vue, the engines can be copied over directly without modification.
3. **Offline Fallback**: By placing the logic in pure engines rather than LLMs, we guarantee that the app will function even if the internet goes down or the AI API key is missing. The `aiService` uses these engines to generate fallback chat replies instantly.
4. **Explainability**: Unlike LLMs, deterministic engines are 100% predictable. A security officer knows *exactly* why an incident was prioritized a certain way.
