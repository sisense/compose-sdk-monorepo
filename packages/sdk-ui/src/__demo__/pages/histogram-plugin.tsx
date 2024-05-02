import { createDataOptionsFromPanels } from '@/dashboard-widget/translate-widget-data-options';
import { WidgetModel } from '@/models/widget';
import { Color } from '@/types';
import { Filter } from '@sisense/sdk-data';
import { Histogram } from './histogram-page/Histogram';

export const histogramCreateChartProps = (
  w: WidgetModel,
  variantColors: Color[],
  filters: Filter[],
) => {
  const dataOptions = createDataOptionsFromPanels(w.pluginPanels, variantColors);

  return {
    dataSource: w.dataSource,
    dataOptions: {
      category: dataOptions.categories.map((d) => d.column),
      value: dataOptions.value[0].column.aggregation
        ? dataOptions.value[0].column.attribute
        : dataOptions.value[0].column,
    },
    filters,
    styleOptions: {
      binCount: w.pluginStyles.BinCount !== 1 ? w.pluginStyles.BinCount : 'auto',
    },
  };
};

export const histogramPlugin = {
  pluginType: 'composeSdkHistogram',
  Plugin: Histogram,
  createChartProps: histogramCreateChartProps,
};
