import type { FoodItem } from '@/src/domain/types';
import type { NutritionDbPort } from '@/src/ports/nutrition';

const CATALOG: FoodItem[] = [
  {
    id: 'stub-chicken-breast',
    name: 'Chicken breast, grilled',
    source: 'usda',
    per100g: { kcal: 165, protein_g: 31, carb_g: 0, fat_g: 3.6, sodium_mg: 74 },
  },
  {
    id: 'stub-white-rice',
    name: 'White rice, cooked',
    source: 'usda',
    per100g: { kcal: 130, protein_g: 2.4, carb_g: 28, fat_g: 0.3 },
  },
  {
    id: 'stub-broccoli',
    name: 'Broccoli, steamed',
    source: 'usda',
    per100g: { kcal: 34, protein_g: 2.8, carb_g: 6.6, fat_g: 0.4, sugar_g: 1.5 },
  },
  {
    id: 'stub-greek-yogurt',
    name: 'Greek yogurt, plain',
    brand: 'Generic',
    source: 'off',
    per100g: { kcal: 97, protein_g: 9, carb_g: 3.6, fat_g: 5, sugar_g: 3.6, sodium_mg: 36 },
    allergens: ['dairy'],
  },
];

/** MVP stub catalog — swap for USDA / Open Food Facts / licensed DB. */
export class StubNutritionDbAdapter implements NutritionDbPort {
  async search(query: string, limit = 10): Promise<FoodItem[]> {
    const q = query.trim().toLowerCase();
    if (!q) return CATALOG.slice(0, limit);
    return CATALOG.filter((item) => item.name.toLowerCase().includes(q)).slice(0, limit);
  }

  async getById(id: string): Promise<FoodItem | null> {
    return CATALOG.find((item) => item.id === id) ?? null;
  }
}
