/**
 * Environment placeholders for future API providers.
 * Do not put real secrets in source. Use Expo public env vars or EAS secrets later.
 *
 * Copy `.env.example` → `.env` and fill when wiring real providers.
 */
export const env = {
  visionApiUrl: process.env.EXPO_PUBLIC_VISION_API_URL ?? '',
  visionApiKey: process.env.EXPO_PUBLIC_VISION_API_KEY ?? '',
  ocrApiUrl: process.env.EXPO_PUBLIC_OCR_API_URL ?? '',
  ocrApiKey: process.env.EXPO_PUBLIC_OCR_API_KEY ?? '',
  nutritionDbUrl: process.env.EXPO_PUBLIC_NUTRITION_DB_URL ?? '',
  nutritionDbKey: process.env.EXPO_PUBLIC_NUTRITION_DB_KEY ?? '',
  authUrl: process.env.EXPO_PUBLIC_AUTH_URL ?? '',
  /** Soft paywall / premium feature flag for commercialization stub. */
  featurePremiumStub: process.env.EXPO_PUBLIC_FEATURE_PREMIUM === 'true',
  /** Optional UX hint for web/demo testing (demo button is always available). */
  webDemo: process.env.EXPO_PUBLIC_WEB_DEMO === 'true',
};

export function hasVisionConfig(): boolean {
  return Boolean(env.visionApiUrl && env.visionApiKey);
}

export function hasOcrConfig(): boolean {
  return Boolean(env.ocrApiUrl && env.ocrApiKey);
}
