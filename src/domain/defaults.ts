import type { User } from './types';

export const DEFAULT_SUGAR_G = 25;
export const DEFAULT_SODIUM_MG = 600;

export function defaultUser(): User {
  return {
    id: 'local-user',
    email: undefined,
    createdAt: new Date().toISOString(),
    profile: {
      goalType: 'maintain',
      calorieTarget: 2000,
      macroTargets: {
        protein_g: 120,
        carb_g: 220,
        fat_g: 65,
      },
    },
    allergens: ['peanut'],
    preferences: {
      units: 'metric',
      flagThresholds: {
        sugar_g: DEFAULT_SUGAR_G,
        sodium_mg: DEFAULT_SODIUM_MG,
      },
    },
  };
}
