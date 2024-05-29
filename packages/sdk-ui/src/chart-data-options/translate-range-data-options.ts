import { RangeChartDataOptions, RangeChartDataOptionsInternal, StyledMeasureColumn } from './types';
import { translateColumnToCategory, translateColumnToValue } from './utils';

export function translateRangeChartDataOptions(
  areaRange: RangeChartDataOptions,
): RangeChartDataOptionsInternal {
  const y = areaRange.value.map((v) => {
    const { lowerBound, upperBound, ...styles } = v;

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

  return {
    x: areaRange.category.map(translateColumnToCategory),
    breakBy: areaRange.breakBy?.map(translateColumnToCategory) || [],
    y: cartesianValues,
    rangeValues: y,
    seriesToColorMap: areaRange.seriesToColorMap,
  };
}
