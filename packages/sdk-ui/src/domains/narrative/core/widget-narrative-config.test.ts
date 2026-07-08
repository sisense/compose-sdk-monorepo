import { describe, expect, it } from 'vitest';

import { getCompleteWidgetNarrativeConfig } from './widget-narrative-config.js';

describe('getCompleteWidgetNarrativeConfig', () => {
  describe('heightFraction', () => {
    it('defaults to undefined when not provided', () => {
      expect(getCompleteWidgetNarrativeConfig({}).heightFraction).toBeUndefined();
    });

    it('passes through the provided value', () => {
      expect(getCompleteWidgetNarrativeConfig({ heightFraction: 0.4 }).heightFraction).toBe(0.4);
    });

    it('rejects invalid values', () => {
      expect(
        getCompleteWidgetNarrativeConfig({ heightFraction: -0.1 }).heightFraction,
      ).toBeUndefined();
      expect(
        getCompleteWidgetNarrativeConfig({ heightFraction: 1.1 }).heightFraction,
      ).toBeUndefined();
      expect(
        getCompleteWidgetNarrativeConfig({ heightFraction: NaN }).heightFraction,
      ).toBeUndefined();
      expect(
        getCompleteWidgetNarrativeConfig({ heightFraction: Infinity }).heightFraction,
      ).toBeUndefined();
    });

    it('accepts inclusive boundaries', () => {
      expect(getCompleteWidgetNarrativeConfig({ heightFraction: 0 }).heightFraction).toBe(0);
      expect(getCompleteWidgetNarrativeConfig({ heightFraction: 1 }).heightFraction).toBe(1);
    });
  });
});
