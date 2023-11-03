import { prepareTreemapDataItems } from '../treemap/treemap-series';
import { CategoricalChartData } from '../../../chart-data/types';
import { CategoricalChartDataOptionsInternal } from '../../../chart-data-options/types';
import { CompleteThemeSettings } from '../../../types';
import { SeriesPointStructure } from '../translations-to-highcharts';
import { getAPaletteColor } from '../pie-series';
import { scaleBrightness } from '../../../utils/color';

export const SUNBURST_ROOT_PARENT_ID = 'SUNBURST_ROOT_PARENT_ID';

export function prepareSunburstDataItems(
  chartData: CategoricalChartData,
  dataOptions: CategoricalChartDataOptionsInternal,
  themeSettings?: CompleteThemeSettings,
) {
  const rootDataItem = {
    id: SUNBURST_ROOT_PARENT_ID,
    name: dataOptions.y[0].title ?? dataOptions.y[0].name,
    custom: { level: 0, levelsCount: chartData.xAxisCount },
  };

  // prepareTreemapDataItems used here because treemap and sunburst
  // have similar data items structure, just sunburst need few more changes after
  const dataItems = prepareTreemapDataItems(chartData, dataOptions, themeSettings).map((item) => {
    if (item.parent === '') {
      return {
        ...item,
        parent: SUNBURST_ROOT_PARENT_ID,
      };
    }
    return item;
  });

  const coloredDataItems = handleSunburstSeriesColor(dataItems, themeSettings);

  return [rootDataItem, ...coloredDataItems];
}

function handleSunburstSeriesColor(
  series: SeriesPointStructure[],
  themeSettings?: CompleteThemeSettings,
) {
  const colorStepMap = {};

  return series.map((value) => {
    const parent = value?.parent || '';
    const colorStep = (colorStepMap[parent] =
      parent in colorStepMap ? (colorStepMap[parent] as number) + 1 : 0);
    const palleteColor = getAPaletteColor(
      themeSettings?.palette.variantColors,
      (value.custom?.level || 1) - 1,
    );

    return {
      ...value,
      color: scaleBrightness(palleteColor, -(colorStep * 0.1)),
    };
  });
}
