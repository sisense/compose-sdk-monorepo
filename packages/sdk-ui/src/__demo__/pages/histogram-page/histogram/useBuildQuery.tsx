import { filterFactory, measureFactory } from '@sisense/sdk-data';
import type { DataSource, Filter, Measure, QueryResultData } from '@sisense/sdk-data';
import { useMemo } from 'react';
import type { HistogramDataOptions, HistogramStyleOptions } from '../Histogram';

const MAX_BARS = 60;
const MIN_BARS = 3;

const binLabel = (min: number, max: number, precision = 6) => {
  const binMidValue = (max + min) / 2.0;
  if (!precision || precision < 0) return `${binMidValue}`;

  const scaleFactor = Math.pow(10, precision);

  return `${Math.round(binMidValue * scaleFactor) / scaleFactor}`;
};

// Widget plug-in buildQuery: git bin frequency per cateogry
export const useBuildQuery = ({
  dataSource,
  minMaxData,
  dataOptions,
  filters,
  styleOptions,
}: {
  dataSource?: DataSource;
  minMaxData?: QueryResultData;
  dataOptions: HistogramDataOptions;
  filters?: Filter[];
  styleOptions?: HistogramStyleOptions;
}) => {
  const countMeas = useMemo(
    () => measureFactory.count(dataOptions.value, 'count'),
    [dataOptions.value],
  );

  const binMeasures = useMemo<Measure[] | undefined>(() => {
    if (!minMaxData) return undefined;
    const firstRow = minMaxData.rows[0];
    if (!firstRow || firstRow?.some((r) => !r)) return undefined;

    const minIndex = 0;
    const maxIndex = minIndex + 1;
    const countIndex = maxIndex + 1;

    const minValue = firstRow[minIndex]?.data as number;
    const maxValue = firstRow[maxIndex]?.data as number;
    const count = firstRow[countIndex]?.data as number;

    let binCount =
      !styleOptions?.binCount || styleOptions.binCount === 'auto'
        ? Math.floor(Math.sqrt(count))
        : styleOptions.binCount;

    binCount = Math.max(binCount, MIN_BARS);
    binCount = Math.min(binCount, MAX_BARS);

    const binRange = (maxValue - minValue) / binCount;
    return Array(binCount)
      .fill(0)
      .map((_v, index) => {
        const min = minValue + index * binRange;
        const max = min + binRange;
        const binFilter = filterFactory.between(dataOptions.value, min, max);
        return measureFactory.measuredValue(
          countMeas,
          [binFilter],
          binLabel(min, max, styleOptions?.binSizePrecision),
        );
      });
  }, [
    countMeas,
    dataOptions.value,
    minMaxData,
    styleOptions?.binCount,
    styleOptions?.binSizePrecision,
  ]);

  if (!binMeasures) {
    return {
      measures: [],
      dimensions: [],
      enabled: false,
    };
  }

  return {
    dataSource,
    measures: binMeasures,
    filters,
    dimensions: dataOptions.category,
    enabled: true,
  };
};
