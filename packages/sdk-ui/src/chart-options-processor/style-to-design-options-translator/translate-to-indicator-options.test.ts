import { IndicatorStyleOptions } from '../../types';
import { IndicatorChartDesignOptions } from '../translations/design-options';
import { getIndicatorChartDesignOptions } from './translate-to-indicator-options';

describe('getIndicatorChartDesignOptions', () => {
  it('should return design options for numeric indicator', () => {
    const styleOptions: IndicatorStyleOptions = {
      subtype: 'indicator/numeric',
      numericSubtype: 'numericSimple',
      skin: 'vertical',
    };
    const result = getIndicatorChartDesignOptions(
      styleOptions,
    ) as IndicatorChartDesignOptions<'numeric'>;
    expect(result.indicatorType).toBe('numeric');
    expect(result.numericSubtype).toBe('numericSimple');
    expect(result.skin).toBe('vertical');
    expect(result.indicatorComponents).toBeDefined();
  });

  it('should return design options for gauge indicator', () => {
    const styleOptions: IndicatorStyleOptions = {
      subtype: 'indicator/gauge',
      skin: 1,
    };
    const result = getIndicatorChartDesignOptions(styleOptions);
    expect(result.indicatorType).toBe('gauge');
    expect(result.skin).toBe(1);
    expect(result.indicatorComponents).toBeDefined();
  });
});
