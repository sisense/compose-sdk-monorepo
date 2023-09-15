/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable complexity */
/* eslint-disable max-lines-per-function */
import {
  defaultConfig,
  applyFormatPlainText,
} from '../../chart-options-processor/translations/number-format-config';
import { IndicatorDataOptions } from '../../chart-data-options/types';
import {
  IndicatorChartDesignOptions,
  NumericIndicatorSubType,
} from '../../chart-options-processor/translations/design-options';
import { IndicatorChartData } from '../../chart-data/types';
import { LegacyIndicatorChartTypes } from './types';
import { NumberFormatConfig } from '../../types';
import {
  AllowedIndicatorColoringTypes,
  getValueColorOptions,
} from './indicator-legacy-chart-options/override-with-value-color';
import {
  ColoringService,
  getColoringServiceByColorOptions,
} from '../../chart-data-options/coloring';

export type IndicatorLegacyChartDataOptions = ReturnType<typeof createLegacyChartDataOptions>;

const getValueCustomBackgroundColor = (
  chartData: IndicatorChartData,
  chartDesignOptions: IndicatorChartDesignOptions,
  chartDataOptions: IndicatorDataOptions,
) => {
  const isValueBgColorCase = !(
    chartDesignOptions.indicatorType === 'numeric' &&
    chartDesignOptions.numericSubtype === 'numericSimple'
  );
  const colorOptions = getValueColorOptions(chartDataOptions);

  if (isValueBgColorCase && colorOptions && chartData.value) {
    const coloringService = getColoringServiceByColorOptions(
      colorOptions,
    ) as ColoringService<AllowedIndicatorColoringTypes>;

    return coloringService.getColor(chartData.value);
  }

  return null;
};

export const createLegacyChartDataOptions = (
  chartData: IndicatorChartData,
  chartDesignOptions: IndicatorChartDesignOptions,
  chartDataOptions: IndicatorDataOptions,
) => {
  const min = chartData.min || 0;
  const max = chartData.max || 100;

  const numberConfigForValue =
    getNumberFormatConfigForColumn(chartDataOptions, 'value') ?? defaultConfig;
  const numberConfigForSecondary =
    getNumberFormatConfigForColumn(chartDataOptions, 'secondary') ?? defaultConfig;
  const numberConfigForMin =
    getNumberFormatConfigForColumn(chartDataOptions, 'min') ?? defaultConfig;
  const numberConfigForMax =
    getNumberFormatConfigForColumn(chartDataOptions, 'max') ?? defaultConfig;

  const valueCustomBgColor = getValueCustomBackgroundColor(
    chartData,
    chartDesignOptions,
    chartDataOptions,
  );

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
      text: applyFormatPlainText(numberConfigForValue, chartData.value as number),
    },
    secondary: {
      data: chartData.secondary,
      text: chartData.secondary
        ? applyFormatPlainText(numberConfigForSecondary, chartData.secondary)
        : '',
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
  chartDataOptions: IndicatorDataOptions,
  columnName: keyof IndicatorDataOptions,
): NumberFormatConfig | undefined {
  const column = chartDataOptions[columnName]?.[0];
  if (column && 'numberFormatConfig' in column) {
    return column.numberFormatConfig;
  }
  return undefined;
}

const defaultIndicatorData = {
  color: '#00cee6',
  showSecondary: false,
};
