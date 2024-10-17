import {
  AreaRangeMeasureColumn,
  RangeChartDataOptions,
  RangeChartDataOptionsInternal,
  StyledMeasureColumn,
  ValueStyle,
} from './types';
import { normalizeColumn, normalizeMeasureColumn, safeMerge } from './utils';

export function translateRangeChartDataOptions(
  areaRange: RangeChartDataOptions,
): RangeChartDataOptionsInternal {
  const y = areaRange.value.map((v) => {
    // if chart type specified
    if ((v as ValueStyle)?.chartType) {
      return [normalizeMeasureColumn(v as StyledMeasureColumn)];
    }

    const { lowerBound, upperBound, title, ...styles } = v as AreaRangeMeasureColumn;

    return [
      normalizeMeasureColumn({
        column: safeMerge(lowerBound, { title }),
        ...styles,
      } as StyledMeasureColumn),
      normalizeMeasureColumn({
        column: safeMerge(upperBound, { title }),
        ...styles,
      } as StyledMeasureColumn),
    ];
  });

  const cartesianValues = y.flat();
  const rangeValues = y.filter((v) => v.length === 2);
  const seriesValues = y.filter((v) => v.length === 1).flat();

  return {
    x: areaRange.category.map(normalizeColumn),
    breakBy: areaRange.breakBy?.map(normalizeColumn) || [],
    y: cartesianValues,
    rangeValues: rangeValues,
    seriesValues: seriesValues,
    seriesToColorMap: areaRange.seriesToColorMap,
  };
}
