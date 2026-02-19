import cloneDeep from 'lodash-es/cloneDeep';

import { defaultTickerOptions } from '@/domains/visualizations/components/chart/components/indicator/indicator-legacy-chart-options/default-options';
import {
  GaugeOptions,
  LegacyIndicatorChartOptions,
} from '@/domains/visualizations/components/chart/components/indicator/types';

export function prepareTickerOptions(container: HTMLElement, options: LegacyIndicatorChartOptions) {
  const tickerOptions = cloneDeep(defaultTickerOptions);

  tickerOptions.forceTickerView = options.forceTickerView;
  tickerOptions.fontFamily = options.fontFamily;
  tickerOptions.backgroundColor = options.backgroundColor;
  tickerOptions.value.color = options.value.color;
  tickerOptions.title.color = options.title.color;
  tickerOptions.secondaryTitle.color = options.secondaryTitle.color;
  tickerOptions.secondaryValue.color = options.secondaryTitle.color;

  if ((options as GaugeOptions).tickerBarHeight) {
    const barHeight = (options as GaugeOptions).tickerBarHeight as number;
    tickerOptions.barHeight = barHeight;
    tickerOptions.tickerBarHeight = barHeight + 2;
  }

  if (tickerOptions.forceTickerView) {
    tickerOptions.height = container.offsetHeight;
  }

  return tickerOptions;
}
