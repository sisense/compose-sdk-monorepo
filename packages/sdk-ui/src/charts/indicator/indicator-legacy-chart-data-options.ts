/* eslint-disable @typescript-eslint/no-use-before-define */
import {
  applyFormatPlainText,
  getCompleteNumberFormatConfig,
} from '../../chart-options-processor/translations/number-format-config';
import { IndicatorChartDataOptions } from '../../chart-data-options/types';
import {
  IndicatorChartDesignOptions,
  NumericIndicatorSubType,
} from '../../chart-options-processor/translations/design-options';
import { IndicatorChartData } from '../../chart-data/types';
import { LegacyIndicatorChartTypes } from './types';
import { CompleteNumberFormatConfig, NumberFormatConfig } from '../../types';
import {
  AllowedIndicatorColoringTypes,
  getValueColorOptions,
} from './indicator-legacy-chart-options/override-with-value-color';
import {
  ColoringService,
  getColoringServiceByColorOptions,
} from '../../chart-data-options/coloring';
import isNumber from 'lodash/isNumber';

export type IndicatorLegacyChartDataOptions = ReturnType<typeof createLegacyChartDataOptions>;

const getValueCustomBackgroundColor = (
  chartData: IndicatorChartData,
  chartDataOptions: IndicatorChartDataOptions,
) => {
  const colorOptions = getValueColorOptions(chartDataOptions);

  if (colorOptions && chartData.value) {
    const coloringService = getColoringServiceByColorOptions(
      colorOptions,
    ) as ColoringService<AllowedIndicatorColoringTypes>;

    return coloringService.getColor(isNumber(chartData.value) ? chartData.value : 0);
  }

  return null;
};

export const createLegacyChartDataOptions = (
  chartData: IndicatorChartData,
  chartDesignOptions: IndicatorChartDesignOptions,
  chartDataOptions: IndicatorChartDataOptions,
) => {
  const min = isNumber(chartData.min) ? chartData.min : 0;
  const max = isNumber(chartData.max) ? chartData.max : 100;

  const numberConfigForValue = getNumberFormatConfigForColumn(chartDataOptions, 'value');
  const numberConfigForSecondary = getNumberFormatConfigForColumn(chartDataOptions, 'secondary');
  const numberConfigForMin = getNumberFormatConfigForColumn(chartDataOptions, 'min');
  const numberConfigForMax = getNumberFormatConfigForColumn(chartDataOptions, 'max');

  const valueCustomBgColor = getValueCustomBackgroundColor(chartData, chartDataOptions);

  const defaultSkin = chartDesignOptions.indicatorType === 'gauge' ? 1 : 'vertical';

  return {
    ...defaultIndicatorData,
    ...(valueCustomBgColor ? { color: valueCustomBgColor } : null),
    type:
      convertToLegacyChartType(
        chartDesignOptions.indicatorType,
        'numericSubtype' in chartDesignOptions ? chartDesignOptions.numericSubtype : undefined,
      ) || 'numericSimple',
    skin: chartDesignOptions.skin || defaultSkin,
    title: { text: chartDesignOptions.indicatorComponents?.title?.text ?? '' },
    min: { data: min, text: applyFormatPlainText(numberConfigForMin, min) },
    max: { data: max, text: applyFormatPlainText(numberConfigForMax, max) },
    value: {
      data: chartData.value,
      text: getValueText(chartData.value, numberConfigForValue),
    },
    secondary: {
      data: chartData.secondary,
      text: getValueText(chartData.secondary, numberConfigForSecondary),
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

function getValueText(value: undefined | number, formatConfig: Required<NumberFormatConfig>) {
  if (value === undefined) {
    return '';
  } else if (isNaN(value)) {
    return '#N/A';
  } else {
    return applyFormatPlainText(formatConfig, value);
  }
}
