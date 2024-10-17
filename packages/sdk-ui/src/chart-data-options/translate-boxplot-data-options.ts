import {
  analyticsFactory,
  Attribute,
  CalculatedMeasureColumn,
  Column,
  MeasureColumn,
} from '@sisense/sdk-data';
import {
  BoxplotChartDataOptions,
  BoxplotChartCustomDataOptions,
  BoxplotChartDataOptionsInternal,
  StyledColumn,
  BoxWhiskerType,
  StyledMeasureColumn,
} from './types';
import { getDataOptionTitle, splitColumn, normalizeColumn, normalizeMeasureColumn } from './utils';

const boxWhiskerValues = (target: Attribute, type: BoxWhiskerType) => {
  switch (type) {
    case 'iqr':
      return analyticsFactory.boxWhiskerIqrValues(target);
    case 'extremums':
      return analyticsFactory.boxWhiskerExtremumsValues(target);
    case 'standardDeviation':
      return analyticsFactory.boxWhiskerStdDevValues(target);
  }
};

const boxWhiskerOutliers = (target: Attribute, type: BoxWhiskerType): Attribute | undefined => {
  switch (type) {
    case 'iqr':
      return analyticsFactory.boxWhiskerIqrOutliers(target);
    case 'standardDeviation':
      return analyticsFactory.boxWhiskerStdDevOutliers(target);
  }
  return undefined;
};

export const generateBoxplotValues = (
  targetValue: Column | StyledColumn,
  boxType: BoxWhiskerType,
  outliersEnabled: boolean,
) => {
  const { column: targetColumn, style: valueStyle } = splitColumn(targetValue);
  let values: (MeasureColumn | CalculatedMeasureColumn | StyledMeasureColumn)[] = boxWhiskerValues(
    targetColumn as Attribute,
    boxType,
  );
  let outliers: Column | StyledColumn | undefined;

  if (valueStyle) {
    values = values.map(
      (value) =>
        ({
          column: value,
          ...valueStyle,
        } as StyledMeasureColumn),
    );
  }

  if (outliersEnabled) {
    outliers = boxWhiskerOutliers(targetColumn as Attribute, boxType);

    if (outliers && valueStyle) {
      outliers = {
        column: outliers,
        ...valueStyle,
      };
    }
  }

  return {
    values,
    outliers,
  };
};

const isBoxplotCustomDataOptions = (
  dataOptions: BoxplotChartDataOptions | BoxplotChartCustomDataOptions,
): dataOptions is BoxplotChartCustomDataOptions => dataOptions.value.length > 1;

export const translateBoxplotDataOptions = (
  boxplotDataOptions: BoxplotChartDataOptions | BoxplotChartCustomDataOptions,
): BoxplotChartDataOptionsInternal => {
  const { category } = boxplotDataOptions;
  let values: (MeasureColumn | CalculatedMeasureColumn | StyledMeasureColumn)[];
  let outliers: Column | StyledColumn | undefined;
  let valueTitle: string;

  if (isBoxplotCustomDataOptions(boxplotDataOptions)) {
    values = boxplotDataOptions.value as (
      | MeasureColumn
      | CalculatedMeasureColumn
      | StyledMeasureColumn
    )[];
    valueTitle = boxplotDataOptions.valueTitle;
    outliers = boxplotDataOptions.outliers?.[0];
  } else {
    const { outliersEnabled, boxType } = boxplotDataOptions;
    const targetValue = normalizeColumn(boxplotDataOptions.value[0]);
    const { values: generatedValues, outliers: generatedOutliers } = generateBoxplotValues(
      targetValue,
      boxType,
      !!outliersEnabled,
    );
    values = generatedValues;
    outliers = generatedOutliers;
    valueTitle = getDataOptionTitle(targetValue);
  }

  const [boxMin, boxMedian, boxMax, whiskerMin, whiskerMax, outliersCount] = values;

  return {
    category: category[0] && normalizeColumn(category[0]),
    boxMin: boxMin && normalizeMeasureColumn(boxMin),
    boxMedian: boxMedian && normalizeMeasureColumn(boxMedian),
    boxMax: boxMax && normalizeMeasureColumn(boxMax),
    whiskerMin: whiskerMin && normalizeMeasureColumn(whiskerMin),
    whiskerMax: whiskerMax && normalizeMeasureColumn(whiskerMax),
    outliersCount: outliersCount && normalizeMeasureColumn(outliersCount),
    outliers: outliers && normalizeColumn(outliers),
    valueTitle,
  };
};
