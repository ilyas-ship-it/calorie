import { DEFAULT_SODIUM_MG, DEFAULT_SUGAR_G } from '@/src/domain/defaults';
import type { Flag, Macros, PortionEstimate, User } from '@/src/domain/types';

/**
 * Allergen safety: prefer over-flagging (false positives) over misses.
 * Sugar/sodium use profile thresholds or documented defaults.
 */
export function checkFlags(input: {
  user: User;
  totals: Macros;
  items: PortionEstimate[];
  ingredientsText?: string;
}): Flag[] {
  const flags: Flag[] = [];
  const sugarLimit = input.user.preferences.flagThresholds?.sugar_g ?? DEFAULT_SUGAR_G;
  const sodiumLimit = input.user.preferences.flagThresholds?.sodium_mg ?? DEFAULT_SODIUM_MG;

  if ((input.totals.sugar_g ?? 0) >= sugarLimit) {
    flags.push({
      type: 'sugar_high',
      message: `Sugar ${input.totals.sugar_g}g is at or above your ${sugarLimit}g threshold.`,
      severity: 'warning',
    });
  }

  if ((input.totals.sodium_mg ?? 0) >= sodiumLimit) {
    flags.push({
      type: 'sodium_high',
      message: `Sodium ${input.totals.sodium_mg}mg is at or above your ${sodiumLimit}mg threshold.`,
      severity: 'warning',
    });
  }

  const haystack = [
    input.ingredientsText ?? '',
    ...input.items.map((i) => i.label),
  ]
    .join(' ')
    .toLowerCase();

  for (const allergen of input.user.allergens) {
    const needle = allergen.toLowerCase();
    if (!needle) continue;
    if (haystack.includes(needle)) {
      flags.push({
        type: 'allergen_match',
        message: `Possible ${allergen} match in this meal — verify ingredients.`,
        severity: 'critical',
        relatedAllergen: allergen,
      });
    } else if (needle === 'dairy' && /\b(milk|cheese|yogurt|whey|casein)\b/.test(haystack)) {
      flags.push({
        type: 'possible_allergen',
        message: `Possible dairy-related ingredient detected — please verify.`,
        severity: 'warning',
        relatedAllergen: allergen,
      });
    } else if (needle === 'gluten' && /\b(wheat|barley|rye|malt)\b/.test(haystack)) {
      flags.push({
        type: 'possible_allergen',
        message: `Possible gluten-related ingredient detected — please verify.`,
        severity: 'warning',
        relatedAllergen: allergen,
      });
    }
  }

  return flags;
}
