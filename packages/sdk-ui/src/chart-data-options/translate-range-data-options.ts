import {
  AreaRangeMeasureColumn,
  RangeChartDataOptions,
  RangeChartDataOptionsInternal,
  StyledMeasureColumn,
  ValueStyle,
} from './types';
import { translateColumnToCategory, translateColumnToValue } from './utils';

export function translateRangeChartDataOptions(
  areaRange: RangeChartDataOptions,
): RangeChartDataOptionsInternal {
  const y = areaRange.value.map((v) => {
    // if chart type specified
    if ((v as ValueStyle)?.chartType) {
      return [translateColumnToValue(v as StyledMeasureColumn)];
    }

    const { lowerBound, upperBound, ...styles } = v as AreaRangeMeasureColumn;

    return [
      translateColumnToValue({
        column: lowerBound,
        ...styles,
      } as StyledMeasureColumn),
      translateColumnToValue({
        column: upperBound,
        ...styles,
      } as StyledMeasureColumn),
    ];
  });

  const cartesianValues = y.flat();
  const rangeValues = y.filter((v) => v.length === 2);
  const seriesValues = y.filter((v) => v.length === 1).flat();

  return {
    x: areaRange.category.map(translateColumnToCategory),
    breakBy: areaRange.breakBy?.map(translateColumnToCategory) || [],
    y: cartesianValues,
    rangeValues: rangeValues,
    seriesValues: seriesValues,
    seriesToColorMap: areaRange.seriesToColorMap,
  };
}
