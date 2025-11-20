import type { Font, Paint } from 'canvaskit-wasm';
import type { WondTextMetrics } from '../interfaces';

export const measureText = (text: string, font: Font, paint: Paint): WondTextMetrics => {
  const glyphIDs = font.getGlyphIDs(text);
  const glyphWidths = font.getGlyphWidths(glyphIDs, paint);
  const width = Array.from(glyphWidths).reduce((sum, w) => sum + w, 0);
  const metrics = font.getMetrics();
  const height = Math.abs(metrics.ascent) + metrics.descent;
  const baseline = Math.abs(metrics.ascent);
  return { width, height, baseline };
};
