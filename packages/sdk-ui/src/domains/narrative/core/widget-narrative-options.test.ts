import { describe, expect, it } from 'vitest';

import { getCompleteWidgetNarrativeOptions } from './widget-narrative-options.js';

describe('getCompleteWidgetNarrativeOptions', () => {
  describe('heightFraction', () => {
    it('defaults to undefined when not provided', () => {
      expect(getCompleteWidgetNarrativeOptions({}).heightFraction).toBeUndefined();
    });

    it('passes through the provided value', () => {
      expect(getCompleteWidgetNarrativeOptions({ heightFraction: 0.4 }).heightFraction).toBe(0.4);
    });

    it('rejects invalid values', () => {
      expect(
        getCompleteWidgetNarrativeOptions({ heightFraction: -0.1 }).heightFraction,
      ).toBeUndefined();
      expect(
        getCompleteWidgetNarrativeOptions({ heightFraction: 1.1 }).heightFraction,
      ).toBeUndefined();
      expect(
        getCompleteWidgetNarrativeOptions({ heightFraction: NaN }).heightFraction,
      ).toBeUndefined();
      expect(
        getCompleteWidgetNarrativeOptions({ heightFraction: Infinity }).heightFraction,
      ).toBeUndefined();
    });

    it('accepts inclusive boundaries', () => {
      expect(getCompleteWidgetNarrativeOptions({ heightFraction: 0 }).heightFraction).toBe(0);
      expect(getCompleteWidgetNarrativeOptions({ heightFraction: 1 }).heightFraction).toBe(1);
    });
  });
});
