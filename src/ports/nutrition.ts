import type { FoodItem } from '@/src/domain/types';

/** Port: nutrition database lookup. */
export interface NutritionDbPort {
  search(query: string, limit?: number): Promise<FoodItem[]>;
  getById(id: string): Promise<FoodItem | null>;
}
