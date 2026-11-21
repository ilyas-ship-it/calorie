import { StubAuthAdapter } from '@/src/adapters/stubAuth';
import { StubBillingAdapter } from '@/src/adapters/stubBilling';
import { StubNutritionDbAdapter } from '@/src/adapters/stubNutritionDb';
import { StubOcrAdapter } from '@/src/adapters/stubOcr';
import { StubRecommendationsAdapter } from '@/src/adapters/stubRecommendations';
import { StubVisionAdapter } from '@/src/adapters/stubVision';
import { AsyncStorageMealAdapter } from '@/src/adapters/asyncStorageMeals';
import type {
  AuthPort,
  BillingPort,
  MealStoragePort,
  NutritionDbPort,
  OcrPort,
  RecommendationsPort,
  VisionPort,
} from '@/src/ports';

/**
 * Composition root — swap adapters here without touching UI screens.
 * UI imports `services`, never vendor SDKs.
 */
export type AppServices = {
  vision: VisionPort;
  ocr: OcrPort;
  nutrition: NutritionDbPort;
  recommendations: RecommendationsPort;
  auth: AuthPort;
  billing: BillingPort;
  storage: MealStoragePort;
};

export const services: AppServices = {
  vision: new StubVisionAdapter(),
  ocr: new StubOcrAdapter(),
  nutrition: new StubNutritionDbAdapter(),
  recommendations: new StubRecommendationsAdapter(),
  auth: new StubAuthAdapter(),
  billing: new StubBillingAdapter(),
  storage: new AsyncStorageMealAdapter(),
};
