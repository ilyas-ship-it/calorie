import type { PlateEstimateResult } from '@/src/domain/types';
import type { VisionPort } from '@/src/ports/vision';

/** MVP stub — replace with cloud vision or on-device model behind the same port. */
export class StubVisionAdapter implements VisionPort {
  async estimatePlate(imageUri: string): Promise<PlateEstimateResult> {
    return {
      items: [
        {
          label: 'Grilled chicken',
          grams: 150,
          confidence: 0.62,
          macros: { kcal: 248, protein_g: 46, carb_g: 0, fat_g: 5.4 },
        },
        {
          label: 'Rice',
          grams: 180,
          confidence: 0.55,
          macros: { kcal: 234, protein_g: 4.3, carb_g: 51, fat_g: 0.4 },
        },
        {
          label: 'Broccoli',
          grams: 80,
          confidence: 0.48,
          macros: { kcal: 27, protein_g: 2.2, carb_g: 5.2, fat_g: 0.3, sugar_g: 1.2 },
        },
      ],
      totals: {
        kcal: 509,
        protein_g: 52.5,
        carb_g: 56.2,
        fat_g: 6.1,
        sugar_g: 1.2,
        sodium_mg: 420,
      },
      confidence: 0.55,
      flags: [
        {
          type: 'needs_review',
          message: 'Estimate — please verify portions before logging.',
          severity: 'info',
        },
      ],
      providerMeta: { adapter: 'stub-vision', imageUri },
    };
  }
}
