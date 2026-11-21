import type { LabelParseResult } from '@/src/domain/types';

/** Port: nutrition-label OCR + macro parse. UI must not call vendors directly. */
export interface OcrPort {
  parseLabel(imageUri: string): Promise<LabelParseResult>;
}
