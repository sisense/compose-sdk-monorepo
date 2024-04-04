import { HighchartsOptionsInternal } from './chart-options-service';
import {
  applyCommonHighchartsOptions,
  DEFAULT_ANIMATION_DURATION_MS_INIT,
  DEFAULT_ANIMATION_DURATION_MS_UPDATE,
} from './common-highcharts-option-service';

describe('applyCommonHighchartsOptions', () => {
  it('should apply common options', () => {
    const chartOptions = {} as HighchartsOptionsInternal;

    const result = applyCommonHighchartsOptions(chartOptions, true);

    expect(result).toEqual({
      accessibility: { enabled: true },
      chart: { animation: { duration: DEFAULT_ANIMATION_DURATION_MS_UPDATE } },
      plotOptions: {
        series: { animation: { duration: DEFAULT_ANIMATION_DURATION_MS_INIT } },
      },
      boost: { useGPUTranslations: true, usePreAllocated: true },
    });
  });
});
