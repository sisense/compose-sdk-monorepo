import cloneDeep from 'lodash/cloneDeep';
import { defaultTickerOptions } from '@/charts/indicator/indicator-legacy-chart-options/default-options';
import { GaugeOptions, LegacyIndicatorChartOptions } from '@/charts/indicator/types';

export function prepareTickerOptions(container: HTMLElement, options: LegacyIndicatorChartOptions) {
  const tickerOptions = cloneDeep(defaultTickerOptions);

  tickerOptions.forceTickerView = options.forceTickerView;
  tickerOptions.fontFamily = options.fontFamily;
  tickerOptions.backgroundColor = options.backgroundColor;
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
