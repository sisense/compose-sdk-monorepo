import { HighchartsOptionsInternal } from './chart_options_service';
import { applyAccessibilityToChart } from './accessibility_option_service';

describe('applyAccessibilityToChart', () => {
  it('should disable accessibility options', () => {
    const chartOptions = {} as HighchartsOptionsInternal;

    const result = applyAccessibilityToChart(chartOptions);

    expect(result).toEqual({
      accessibility: {
        enabled: false,
      },
    });
  });
});
