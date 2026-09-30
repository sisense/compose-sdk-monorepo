/* eslint-disable @typescript-eslint/no-use-before-define */
import isNumber from 'lodash-es/isNumber';

import { NOT_AVAILABLE_TEXT } from '@/shared/const';

import { CompleteNumberFormatConfig, NumberFormatConfig } from '../../../../../../types';
import {
  ColoringService,
  getColoringServiceByColorOptions,
} from '../../../../core/chart-data-options/coloring';
import { IndicatorChartDataOptions } from '../../../../core/chart-data-options/types';
import { IndicatorChartData } from '../../../../core/chart-data/types';
import {
  IndicatorChartDesignOptions,
  NumericIndicatorSubType,
} from '../../../../core/chart-options-processor/translations/design-options';
import {
  applyFormatPlainText,
  getCompleteNumberFormatConfig,
} from '../../../../core/chart-options-processor/translations/number-format-config';
import {
  AllowedIndicatorColoringTypes,
  getValueColorOptions,
} from './indicator-legacy-chart-options/override-with-value-color';
import { LegacyIndicatorChartTypes } from './types';

export type IndicatorLegacyChartDataOptions = ReturnType<typeof createLegacyChartDataOptions>;

const getValueCustomBackgroundColor = (
  chartData: IndicatorChartData,
  dataOptions: IndicatorChartDataOptions,
) => {
  const colorOptions = getValueColorOptions(dataOptions, chartData.colorConditionValues);

  if (colorOptions && chartData.value) {
    const coloringService = getColoringServiceByColorOptions(
      colorOptions,
    ) as ColoringService<AllowedIndicatorColoringTypes>;

    return coloringService.getColor(isNumber(chartData.value) ? chartData.value : 0);
  }

  return null;
};

const toThreshold = (expression: string): number =>
  expression.trim() === '' ? NaN : Number(expression);

/**
 * Builds the gauge dial segments, renaming each threshold to the `data` key the legacy renderer
 * reads.
 */
const getValueConditions = (
  chartData: IndicatorChartData,
  dataOptions: IndicatorChartDataOptions,
) => {
  const colorOptions = getValueColorOptions(dataOptions, chartData.colorConditionValues);

  if (!colorOptions || typeof colorOptions === 'string' || colorOptions.type !== 'conditional') {
    return undefined;
  }

  const conditions = (colorOptions.conditions ?? [])
    .map(({ expression, operator, color }) => ({
      data: toThreshold(expression),
      operator,
      color,
    }))
    .filter(({ data }) => Number.isFinite(data));

  return conditions.length ? conditions : undefined;
};

/**
 * Returns a min or max bound when it is a usable number, else the given default. Native
 * `Number.isFinite` rather than the lodash guard: `isNumber(NaN)` is true, and an unavailable date
 * bound arrives as NaN, which would otherwise render as an empty label.
 *
 * @param bound - The bound from the chart data, which can be missing or NaN
 * @param fallback - The value to use when the bound is not a usable number
 * @returns The bound when it is a finite number, otherwise the fallback
 */
function usableBound(bound: number | undefined, fallback: number): number {
  return typeof bound === 'number' && Number.isFinite(bound) ? bound : fallback;
}

export const createLegacyChartDataOptions = (
  chartData: IndicatorChartData,
  chartDesignOptions: IndicatorChartDesignOptions,
  dataOptions: IndicatorChartDataOptions,
) => {
  const min = usableBound(chartData.min, 0);
  const max = usableBound(chartData.max, 100);
  // an unavailable bound carries `NOT_AVAILABLE_DATA_VALUE` as its text, so it is labelled from
  // the fallback
  const minText = Number.isFinite(chartData.min) ? chartData.minText : undefined;
  const maxText = Number.isFinite(chartData.max) ? chartData.maxText : undefined;

  const numberConfigForValue = getNumberFormatConfigForColumn(dataOptions, 'value');
  const numberConfigForSecondary = getNumberFormatConfigForColumn(dataOptions, 'secondary');
  const numberConfigForMin = getNumberFormatConfigForColumn(dataOptions, 'min');
  const numberConfigForMax = getNumberFormatConfigForColumn(dataOptions, 'max');

  const valueCustomBgColor = getValueCustomBackgroundColor(chartData, dataOptions);
  const valueConditions = getValueConditions(chartData, dataOptions);

  const defaultSkin = chartDesignOptions.indicatorType === 'gauge' ? 1 : 'vertical';

  return {
    ...defaultIndicatorData,
    ...(valueCustomBgColor ? { color: valueCustomBgColor } : null),
    ...(valueConditions ? { conditions: valueConditions } : null),
    type:
      convertToLegacyChartType(
        chartDesignOptions.indicatorType,
        'numericSubtype' in chartDesignOptions ? chartDesignOptions.numericSubtype : undefined,
      ) || 'numericSimple',
    skin: chartDesignOptions.skin || defaultSkin,
    title: { text: chartDesignOptions.indicatorComponents?.title?.text ?? '' },
    min: { data: min, text: minText ?? applyFormatPlainText(numberConfigForMin, min) },
    max: { data: max, text: maxText ?? applyFormatPlainText(numberConfigForMax, max) },
    value: {
      data: chartData.value,
      text: getValueText(chartData.value, numberConfigForValue, chartData.valueText),
    },
    secondary: {
      data: chartData.secondary,
      text: getValueText(chartData.secondary, numberConfigForSecondary, chartData.secondaryText),
    },
    secondaryTitle: {
      text: chartDesignOptions.indicatorComponents?.secondaryTitle?.text ?? '',
    },
    showSecondary: chartData.secondary !== undefined,
    showTitle: !!chartDesignOptions.indicatorComponents?.title?.shouldBeShown,
    showLabels: !!chartDesignOptions.indicatorComponents?.labels?.shouldBeShown,
    showTicks: !!chartDesignOptions.indicatorComponents?.ticks?.shouldBeShown,
  };
};

function convertToLegacyChartType(
  indicatorType: IndicatorChartDesignOptions['indicatorType'],
  numericSubtype?: NumericIndicatorSubType,
): LegacyIndicatorChartTypes {
  if (indicatorType === 'numeric') {
    return numericSubtype!;
  }
  return indicatorType;
}

function getNumberFormatConfigForColumn(
  chartDataOptions: IndicatorChartDataOptions,
  columnName: keyof IndicatorChartDataOptions,
): CompleteNumberFormatConfig {
  const column = chartDataOptions[columnName]?.[0];
  return getCompleteNumberFormatConfig(
    column && 'numberFormatConfig' in column ? column.numberFormatConfig : {},
  );
}

const defaultIndicatorData = {
  color: '#00cee6',
  showSecondary: false,
};

/**
 * Returns the text an indicator field is rendered with. Availability is checked before the text, so
 * an unavailable value is never displayed as whatever text arrived with it.
 */
function getValueText(
  value: undefined | number,
  formatConfig: Required<NumberFormatConfig>,
  text?: string,
) {
  if (value === undefined) {
    return '';
  } else if (isNaN(value)) {
    return `#${NOT_AVAILABLE_TEXT}`;
  } else if (text !== undefined) {
    return text;
  } else {
    return applyFormatPlainText(formatConfig, value);
  }
}
