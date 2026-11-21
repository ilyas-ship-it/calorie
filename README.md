# Calorie AI

Cross-platform Expo (React Native) MVP scaffold for plate vision + nutrition-label OCR calorie tracking, with confirm-before-log UX and modular provider seams.

MVP cut: see Project docs (`mvp-plan.md`) — photo → estimate → edit → confirm → history, plus profile/goals, flags, and recommendations stubs.

## Run

```bash
npm install
npx expo start
```

Then open in Expo Go, iOS Simulator, Android emulator, or web (`w` in the CLI).

Other scripts:

```bash
npm run android
npm run ios
npm run web
npm run typecheck
```

## Architecture seams (ports / adapters)

UI screens call **ports** via `src/services/appServices.ts`. They must not import vendor SDKs directly.

| Seam | Port | MVP adapter |
| --- | --- | --- |
| Vision | `VisionPort.estimatePlate()` | `StubVisionAdapter` |
| OCR | `OcrPort.parseLabel()` | `StubOcrAdapter` |
| Nutrition DB | `NutritionDbPort` | `StubNutritionDbAdapter` |
| Recommendations | `RecommendationsPort` | `StubRecommendationsAdapter` (rules) |
| Auth | `AuthPort` | `StubAuthAdapter` |
| Billing | `BillingPort` | `StubBillingAdapter` (`isPremium` flag) |
| Storage | `MealStoragePort` | `AsyncStorageMealAdapter` |

Swap an adapter in `src/services/appServices.ts` when wiring a real provider. Flag rules live in `src/flags/checkFlags.ts` (prefer over-flagging allergens).

```
app/                 Expo Router screens (UI shell)
src/domain/          Shared types + macro helpers
src/ports/           Interfaces only
src/adapters/        Stub / local implementations
src/services/        Composition root
src/flags/           Sugar / sodium / allergen rules
src/config/env.ts    Env placeholders
```

## Screens (MVP shell)

- **Today** — remaining calories, quick Plate/Label actions, flags + tips
- **Capture** — camera/gallery, Plate vs Label mode
- **Review plate / label** — editable estimates, Confirm & log
- **History** — meal list + 7-day progress bars
- **Profile** — goals, allergens, flag thresholds, auth stub
- **Paywall** — copy-only soft paywall behind billing seam

## Environment variables

Copy `.env.example` → `.env`. All keys are placeholders — do not invent or commit real API keys.

| Variable | Purpose |
| --- | --- |
| `EXPO_PUBLIC_VISION_API_URL` / `_KEY` | Future vision provider |
| `EXPO_PUBLIC_OCR_API_URL` / `_KEY` | Future OCR provider |
| `EXPO_PUBLIC_NUTRITION_DB_URL` / `_KEY` | Future nutrition DB |
| `EXPO_PUBLIC_AUTH_URL` | Future auth backend |
| `EXPO_PUBLIC_FEATURE_PREMIUM` | Billing stub (`true`/`false`) |

## Notes

- AI estimates are assistive; users must **Confirm** before a meal is stored.
- Local persistence uses AsyncStorage for the scaffold; SQLite / sync can replace `MealStoragePort` later.
- Stack: Expo SDK 58, Expo Router, TypeScript.
