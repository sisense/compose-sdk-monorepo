import { describe, expect, it } from 'vitest';

import { designOptionsTranslators } from './index.js';

describe('Treemap Design Options Translators', () => {
  it('should translate style options to design options', () => {
    const styleOptions = {
      labels: {
        category: [{ enabled: true }],
      },
      tooltip: {
        mode: 'value' as const,
      },
    };

    const result = designOptionsTranslators.translateStyleOptionsToDesignOptions(styleOptions);
    expect(result).toBeDefined();
  });

  it('should identify correct style options', () => {
    const styleOptions = {
      labels: {
        category: [{ enabled: true }],
      },
    };

    expect(designOptionsTranslators.isCorrectStyleOptions(styleOptions as any)).toBe(true);
  });
});
