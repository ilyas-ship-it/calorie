import type { MealEntry, Recommendation, User } from '@/src/domain/types';

/** Port: rules / ML recommendations from meal + profile. */
export interface RecommendationsPort {
  recommend(user: User, meal: MealEntry): Promise<Recommendation[]>;
}
