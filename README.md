# Calorie AI

Cross-platform Expo (React Native) MVP scaffold for plate vision + nutrition-label OCR calorie tracking, with confirm-before-log UX and modular provider seams.

MVP cut: see Project docs (`mvp-plan.md`) — photo → estimate → edit → confirm → history, plus profile/goals, flags, and recommendations stubs.

## Browser (web)

Requires Node 20+ and the web packages already in this repo (`react-dom`, `react-native-web`, `@expo/metro-runtime`).

```bash
npm install
npm run web
# same as: npx expo start --web
```

Then open the URL Expo prints (usually `http://localhost:8081` — press `w` if the CLI started without opening a browser).

**Web capture notes**

- Camera is limited in the browser. Use **Choose file** (file picker) or **Demo photo** on the Capture tab.
- The full confirm-before-log loop works the same: Estimate → editable Review → Confirm → History.
- Local data uses AsyncStorage (browser `localStorage` under the hood).

## Phone (Expo Go)

1. Install **Expo Go** on your iPhone or Android.
2. From the project root:

```bash
npm install
npx expo start
```

3. Scan the QR code shown in the terminal (or Dev Tools):
   - **iOS:** Camera app or Expo Go
   - **Android:** Expo Go’s built-in QR scanner
4. Same Wi‑Fi as your computer (or use tunnel: `npx expo start --tunnel` if LAN discovery fails).

Camera and gallery use the device APIs. If camera permission is denied, use **Gallery** or **Demo photo** — review/confirm still works.

Other scripts:

```bash
npm run android
npm run ios
npm run typecheck
npm run smoke
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
src/platform/        Web / native helpers (capture fallbacks)
src/flags/           Sugar / sodium / allergen rules
src/config/env.ts    Env placeholders
```

## Screens (MVP shell)

- **Today** — remaining calories, quick Plate/Label actions, flags + tips
- **Capture** — camera/gallery/file picker/demo photo, Plate vs Label mode
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

Optional for local web testing only (no secrets required for stubs):

| Variable | Purpose |
| --- | --- |
| `EXPO_PUBLIC_WEB_DEMO` | Set `true` to hint UI toward demo-photo defaults (optional; demo button always available) |

## Notes

- AI estimates are assistive; users must **Confirm** before a meal is stored.
- Local persistence uses AsyncStorage for the scaffold; SQLite / sync can replace `MealStoragePort` later.
- Stack: Expo SDK 58, Expo Router, TypeScript. Web + Expo Go are first-class test targets for this MVP shell.
