import { describe, expect, it } from 'vitest';

import { ChartStyleOptions, SankeyStyleOptions } from '@/types';

import { designOptionsTranslators } from './index';

describe('sankey designOptionsTranslators', () => {
  it('maps orientation vertical to design orientation', () => {
    const design = designOptionsTranslators.translateStyleOptionsToDesignOptions({
      orientation: 'vertical',
    } as SankeyStyleOptions);
    expect(design.orientation).toBe('vertical');
  });

  it('defaults to horizontal', () => {
    const design = designOptionsTranslators.translateStyleOptionsToDesignOptions(
      {} as SankeyStyleOptions,
    );
    expect(design.orientation).toBe('horizontal');
  });

  it('getDefaultStyleOptions returns horizontal orientation and legend off', () => {
    const defaults = designOptionsTranslators.getDefaultStyleOptions();
    expect(defaults.orientation).toBe('horizontal');
    expect(defaults.legend?.enabled).toBe(false);
    expect(defaults.nodeWidth).toBe(20);
  });

  it('isCorrectStyleOptions accepts plain style objects', () => {
    expect(designOptionsTranslators.isCorrectStyleOptions({} as ChartStyleOptions)).toBe(true);
  });

  it('isCorrectStyleOptions rejects null and arrays', () => {
    expect(
      designOptionsTranslators.isCorrectStyleOptions(null as unknown as ChartStyleOptions),
    ).toBe(false);
    expect(designOptionsTranslators.isCorrectStyleOptions([] as unknown as ChartStyleOptions)).toBe(
      false,
    );
  });
});
