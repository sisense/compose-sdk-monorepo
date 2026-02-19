import { getDataOptionTitle } from '@/domains/visualizations/core/chart-data-options/utils';
import { getExplicitColorSteps, scaleBrightness } from '@/shared/utils/color';

import { CompleteThemeSettings, UniformDataColorOptions } from '../../../../../../types';
import { getPaletteColor } from '../../../chart-data-options/coloring/utils';
import { CategoricalChartDataOptionsInternal } from '../../../chart-data-options/types';
import { CategoricalChartData } from '../../../chart-data/types';
import { SeriesPointStructure } from '../translations-to-highcharts';
import { prepareTreemapDataItems } from '../treemap/treemap-series';

export const SUNBURST_ROOT_PARENT_ID = 'SUNBURST_ROOT_PARENT_ID';

export function prepareSunburstDataItems(
  chartData: CategoricalChartData,
  dataOptions: CategoricalChartDataOptionsInternal,
  themeSettings?: CompleteThemeSettings,
) {
  const rootDataItem = {
    id: SUNBURST_ROOT_PARENT_ID,
    name: getDataOptionTitle(dataOptions.y[0]),
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

  const sortedDataItems = sortSunburstDataItems(dataItems);
  const coloredAndSortedDataItems = handleSunburstSeriesColor(
    sortedDataItems,
    dataOptions,
    themeSettings,
  );

  return [rootDataItem, ...coloredAndSortedDataItems];
}

function handleSunburstSeriesColor(
  series: SeriesPointStructure[],
  dataOptions: CategoricalChartDataOptionsInternal,
  themeSettings?: CompleteThemeSettings,
) {
  const MAX_BRIGHTNESS_PERCENT = 0.3;
  const seriesColorMapByLevels = prepareColorMapByLevels(dataOptions);

  const levelsMembersTotals = dataOptions.breakBy.map(() => new Map<string, number>());
  series.forEach((item) => {
    const relatedMap = levelsMembersTotals[item.custom!.level! - 1];
    if (relatedMap) {
      const prevTotal = relatedMap.get(item.name!) ?? 0;
      const itemValue = item.value ?? (item.custom?.subtotalValue as number) ?? 0;
      relatedMap.set(item.name!, prevTotal + itemValue);
    }
  });

  const levelsWithSortedMembers = levelsMembersTotals.map((levelTotals) => {
    return Array.from(levelTotals.entries())
      .sort(([, valueA], [, valueB]) => valueA - valueB)
      .map(([key]) => key);
  });

  const levelsMembersColorMaps = levelsWithSortedMembers.map((levelSortedMembers, index) => {
    const map = new Map<string, string>();
    const paletteColor = getPaletteColor(themeSettings?.palette.variantColors, index);
    const color =
      (dataOptions.breakBy[index]?.color as UniformDataColorOptions)?.color || paletteColor;
    const colorSteps = getExplicitColorSteps(
      scaleBrightness(color, MAX_BRIGHTNESS_PERCENT),
      scaleBrightness(color, -MAX_BRIGHTNESS_PERCENT),
      levelSortedMembers.length,
    );

    levelSortedMembers.forEach((member, index) => {
      map.set(member, colorSteps[index]);
    });

    return map;
  });

  return series.map((item) => {
    const colorBySeriesName = seriesColorMapByLevels[item.custom?.level || '']?.[item?.name || ''];
    const colorFromColorMap = levelsMembersColorMaps[item.custom!.level! - 1]?.get(item.name!);

    return {
      ...item,
      color: colorBySeriesName || colorFromColorMap,
    };
  });
}

function prepareColorMapByLevels(dataOptions: CategoricalChartDataOptionsInternal) {
  return dataOptions.breakBy.reduce((map, { column }, index) => {
    if (dataOptions?.seriesToColorMap?.[column.name]) {
      map[index + 1] = dataOptions.seriesToColorMap[column.name];
    }
    return map;
  }, {});
}

function sortSunburstDataItems(items: SeriesPointStructure[]): SeriesPointStructure[] {
  const byParentMap = new Map<string, SeriesPointStructure[]>();
  const parentsTotalMap = new Map<string, number>();

  items.forEach((item) => {
    if (item.parent) {
      if (!byParentMap.has(item.parent)) {
        byParentMap.set(item.parent, []);
      }
      byParentMap.get(item.parent)!.push(item);
    }
  });

  Array.from(byParentMap.values())
    .sort((itemA, itemB) => {
      return (itemB[0]?.custom?.level ?? 0) - (itemA[0]?.custom?.level ?? 0);
    })
    .forEach((items) => {
      items.forEach((item) => {
        const value = item.value ?? parentsTotalMap.get(item.id!) ?? 0;
        const currentTotal = parentsTotalMap.get(item.parent!) || 0;
        parentsTotalMap.set(item.parent!, currentTotal + value);

        if (item.id) {
          item.custom!.subtotalValue = parentsTotalMap.get(item.id);
        }
      });
    });

  const result: SeriesPointStructure[] = [];
  byParentMap.forEach((children) => {
    children.sort((itemA, itemB) => {
      const valueA = itemA.value ?? parentsTotalMap.get(itemA.id!) ?? 0;
      const valueB = itemB.value ?? parentsTotalMap.get(itemB.id!) ?? 0;
      return valueA - valueB;
    });
    result.push(...children);
  });

  return result;
}
