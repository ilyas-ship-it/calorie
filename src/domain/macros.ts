import type { Macros, PortionEstimate } from './types';

export function emptyMacros(): Macros {
  return { kcal: 0, protein_g: 0, carb_g: 0, fat_g: 0, sugar_g: 0, sodium_mg: 0 };
}

export function sumMacros(parts: Macros[]): Macros {
  return parts.reduce(
    (acc, m) => ({
      kcal: acc.kcal + (m.kcal || 0),
      protein_g: acc.protein_g + (m.protein_g || 0),
      carb_g: acc.carb_g + (m.carb_g || 0),
      fat_g: acc.fat_g + (m.fat_g || 0),
      sugar_g: (acc.sugar_g || 0) + (m.sugar_g || 0),
      sodium_mg: (acc.sodium_mg || 0) + (m.sodium_mg || 0),
    }),
    emptyMacros(),
  );
}

export function totalsFromItems(items: PortionEstimate[]): Macros {
  return sumMacros(items.map((i) => i.macros ?? emptyMacros()));
}

export function roundMacros(m: Macros): Macros {
  return {
    kcal: Math.round(m.kcal),
    protein_g: Math.round(m.protein_g * 10) / 10,
    carb_g: Math.round(m.carb_g * 10) / 10,
    fat_g: Math.round(m.fat_g * 10) / 10,
    sugar_g: m.sugar_g !== undefined ? Math.round(m.sugar_g * 10) / 10 : undefined,
    sodium_mg: m.sodium_mg !== undefined ? Math.round(m.sodium_mg) : undefined,
  };
}

export function newId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}
