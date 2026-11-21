import type { LabelParseResult } from '@/src/domain/types';
import type { OcrPort } from '@/src/ports/ocr';

/** MVP stub — replace with cloud OCR / on-device label parser. */
export class StubOcrAdapter implements OcrPort {
  async parseLabel(imageUri: string): Promise<LabelParseResult> {
    const rawText = [
      'Nutrition Facts',
      'Serving Size 1 bar (40g)',
      'Calories 190',
      'Total Fat 8g',
      'Sodium 140mg',
      'Total Carbohydrate 22g',
      'Total Sugars 12g',
      'Protein 7g',
      'Ingredients: oats, sugar, peanut butter, salt',
    ].join('\n');

    return {
      items: [
        {
          label: 'Snack bar (1 serving)',
          grams: 40,
          servingCount: 1,
          confidence: 0.7,
          macros: {
            kcal: 190,
            protein_g: 7,
            carb_g: 22,
            fat_g: 8,
            sugar_g: 12,
            sodium_mg: 140,
          },
        },
      ],
      totals: {
        kcal: 190,
        protein_g: 7,
        carb_g: 22,
        fat_g: 8,
        sugar_g: 12,
        sodium_mg: 140,
      },
      rawText,
      confidence: 0.7,
      ingredientsText: 'oats, sugar, peanut butter, salt',
      flags: [
        {
          type: 'needs_review',
          message: 'OCR estimate — edit any values that look wrong.',
          severity: 'info',
        },
      ],
      providerMeta: { adapter: 'stub-ocr', imageUri },
    };
  }
}
