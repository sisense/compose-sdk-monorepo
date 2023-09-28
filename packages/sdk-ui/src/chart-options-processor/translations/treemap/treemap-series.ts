import { CategoricalChartData } from '../../../chart-data/types';
import { getColorSetting, SeriesPointStructure } from '../translations-to-highcharts';
import { CategoricalChartDataOptionsInternal } from '../../../chart-data-options/types';
import { CompleteThemeSettings } from '../../../types';
import { getAPaletteColor } from '../pie-series';

export function prepareTreemapDataItems(
  chartData: CategoricalChartData,
  dataOptions: CategoricalChartDataOptionsInternal,
  themeSettings?: CompleteThemeSettings,
): SeriesPointStructure[] {
  if (!chartData.series[0]) {
    return [];
  }

  const parentDataItems = createTreemapParents(chartData);
  const childDataItems = chartData.series[0].data.map((item) => {
    return {
      value: item.value,
      name: item.xDisplayValue?.slice(-1).toString(),
      parent: item.xValue?.slice(0, -1).join('_'),
      custom: {
        level: chartData.xAxisCount,
        levelsCount: chartData.xAxisCount,
      },
    };
  });

  return handleTreemapSeriesColor(
    [...parentDataItems, ...childDataItems],
    dataOptions,
    themeSettings,
  );
}

function createTreemapParents(chartData: CategoricalChartData): SeriesPointStructure[] {
  const map: { [key: string]: SeriesPointStructure } = {};
  chartData.xValues.forEach((value) => {
    value.rawValues!.slice(0, -1).forEach((name, index) => {
      const id = value.xValues.slice(0, index + 1).join('_');
      map[id] = {
        id,
        name: name as string,
        parent: value.rawValues!.slice(0, index).join('_'),
        custom: {
          level: index + 1,
          levelsCount: chartData.xAxisCount,
        },
      };
    });
  });

  return Object.values(map);
}

function handleTreemapSeriesColor(
  series: SeriesPointStructure[],
  dataOptions: CategoricalChartDataOptionsInternal,
  themeSettings?: CompleteThemeSettings,
) {
  const coloringLevel = dataOptions.breakBy.map((item) => item.isColored).indexOf(true) + 1;
  const coloringSeriesIndexMap = new Map();

  return series.map((item) => {
    if (item.custom!.level === coloringLevel) {
      if (!coloringSeriesIndexMap.has(item.name)) {
        coloringSeriesIndexMap.set(item.name, coloringSeriesIndexMap.size);
      }

      return {
        ...item,
        color:
          getColorSetting(dataOptions, item.name as string) ??
          getAPaletteColor(
            themeSettings?.palette.variantColors,
            coloringSeriesIndexMap.get(item.name) as number,
          ),
      };
    }
    return item;
  });
}
