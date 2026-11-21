/** Lightweight smoke for flag rules (mirrors src/flags/checkFlags.ts defaults). */
import assert from 'node:assert/strict';

const DEFAULT_SUGAR_G = 25;
const DEFAULT_SODIUM_MG = 600;

function checkFlags({ user, totals, items, ingredientsText }) {
  const flags = [];
  const sugarLimit = user.preferences.flagThresholds?.sugar_g ?? DEFAULT_SUGAR_G;
  const sodiumLimit = user.preferences.flagThresholds?.sodium_mg ?? DEFAULT_SODIUM_MG;

  if ((totals.sugar_g ?? 0) >= sugarLimit) {
    flags.push({ type: 'sugar_high' });
  }
  if ((totals.sodium_mg ?? 0) >= sodiumLimit) {
    flags.push({ type: 'sodium_high' });
  }

  const haystack = [ingredientsText ?? '', ...items.map((i) => i.label)]
    .join(' ')
    .toLowerCase();

  for (const allergen of user.allergens) {
    if (haystack.includes(allergen.toLowerCase())) {
      flags.push({ type: 'allergen_match' });
    }
  }
  return flags;
}

const flags = checkFlags({
  user: {
    allergens: ['peanut'],
    preferences: { flagThresholds: {} },
  },
  totals: { sugar_g: 30, sodium_mg: 700 },
  items: [{ label: 'Snack with peanut butter' }],
  ingredientsText: 'oats, sugar, peanut butter, salt',
});

assert.ok(flags.some((f) => f.type === 'sugar_high'));
assert.ok(flags.some((f) => f.type === 'sodium_high'));
assert.ok(flags.some((f) => f.type === 'allergen_match'));
console.log('smoke-flags: ok');
