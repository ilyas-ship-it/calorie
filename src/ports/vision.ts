import type { PlateEstimateResult } from '@/src/domain/types';

/** Port: plate food detection + portion heuristics. UI must not call vendors directly. */
export interface VisionPort {
  estimatePlate(imageUri: string): Promise<PlateEstimateResult>;
}
