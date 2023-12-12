import { prepareTreemapDataItems } from '../treemap/treemap-series';
import { CategoricalChartData } from '../../../chart-data/types';
import { CategoricalChartDataOptionsInternal } from '../../../chart-data-options/types';
import { CompleteThemeSettings } from '../../../types';
import { SeriesPointStructure } from '../translations-to-highcharts';
import { getPaletteColor } from '../../../chart-data-options/coloring/utils';
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

  const coloredDataItems = handleSunburstSeriesColor(dataItems, dataOptions, themeSettings);

  return [rootDataItem, ...coloredDataItems];
}

function handleSunburstSeriesColor(
  series: SeriesPointStructure[],
  dataOptions: CategoricalChartDataOptionsInternal,
  themeSettings?: CompleteThemeSettings,
) {
  const seriesColorMapByLevels = prepareColorMapByLevels(dataOptions);
  const colorStepMap = {};

  return series.map((value) => {
    const parent = value?.parent || '';
    const colorBySeriesName =
      seriesColorMapByLevels[value.custom?.level || '']?.[value?.name || ''];
    const colorStep = (colorStepMap[parent] =
      parent in colorStepMap ? (colorStepMap[parent] as number) + 1 : 0);
    const paletteColor = getPaletteColor(
      themeSettings?.palette.variantColors,
      (value.custom?.level || 1) - 1,
    );

    return {
      ...value,
      color: colorBySeriesName || scaleBrightness(paletteColor, -(colorStep * 0.1)),
    };
  });
}

function prepareColorMapByLevels(dataOptions: CategoricalChartDataOptionsInternal) {
  return dataOptions.breakBy.reduce((map, column, index) => {
    if (dataOptions?.seriesToColorMap?.[column.name]) {
      map[index + 1] = dataOptions.seriesToColorMap[column.name];
    }
    return map;
  }, {});
}
