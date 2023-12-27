/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable max-lines-per-function */
/* eslint-disable sonarjs/no-identical-functions */
import merge from 'ts-deepmerge';
import { CompleteThemeSettings } from '../types';
import { HighchartsOptionsInternal } from './chart-options-service';
import cloneDeep from 'lodash/cloneDeep';
import { LegendSettings } from './translations/legend-section';

const DEFAULT_THEME_SETTINGS: CompleteThemeSettings = {
  chart: {
    backgroundColor: '#FFFFFF',
    textColor: '#000000',
    secondaryTextColor: '#E4E4E4',
    panelBackgroundColor: '#F6F6F6',
  },
  typography: {
    fontFamily: '"Open Sans","Roboto","Helvetica","Arial",sans-serif',
    primaryTextColor: '#5B6372',
    secondaryTextColor: '#9EA2AB',
  },
  palette: {
    variantColors: ['#00cee6', '#9b9bd7', '#6eda55', '#fc7570', '#fbb755', '#218a8c'],
  },
  general: {
    backgroundColor: '#ffffff',
    brandColor: '#ffcb05',
    primaryButtonTextColor: '#3a4356',
    primaryButtonHoverColor: '#f2b900',
  },
};

export const applyThemeToChart = (
  chartOptions: HighchartsOptionsInternal,
  themeSettings?: CompleteThemeSettings,
): HighchartsOptionsInternal => {
  if (!themeSettings) {
    return chartOptions;
  }

  const pie = {
    allowPointSelect: false,
    showInLegend: true,
    dataLabels: {
      style: {
        color: themeSettings.chart.textColor,
        fontFamily: themeSettings.typography.fontFamily,
      },
      showPercentLabels: true,
      showDecimals: false,
      pieMinimumFontSizeToTextLabel: 8,
    },
  };

  const chart = {
    backgroundColor: themeSettings.chart.backgroundColor,
  };

  const tooltip = {
    style: {
      fontFamily: themeSettings.typography.fontFamily,
    },
  };

  const legend = {
    itemStyle: {
      color: themeSettings.chart.textColor,
      fontFamily: themeSettings.typography.fontFamily,
    },
  } as LegendSettings;

  const seriesDataLabelsStyle = {
    style: {
      color: themeSettings.chart.textColor,
      fontFamily: themeSettings.typography.fontFamily,
    },
  };

  const plotOptions = {
    series: {
      dataLabels: seriesDataLabelsStyle,
    },
    pie,
  };

  const drilldown = {
    activeDataLabelStyle: {
      color: themeSettings.chart.textColor,
    },
    breadcrumbs: {
      buttonTheme: {
        fill: themeSettings.general.brandColor,
        stroke: themeSettings.general.brandColor,
        style: {
          color: themeSettings.general.primaryButtonTextColor,
        },
        states: {
          hover: {
            fill: themeSettings.general.primaryButtonHoverColor,
            stroke: themeSettings.general.primaryButtonHoverColor,
          },
        },
      },
    },
  };

  const basicOptions = {
    chart,
    tooltip,
    legend,
    plotOptions,
    drilldown,
  };

  const axisOptions = {
    labels: {
      style: {
        color: themeSettings.chart.textColor,
        fontFamily: themeSettings.typography.fontFamily,
      },
    },
    title: {
      style: {
        color: themeSettings.chart.textColor,
        fontFamily: themeSettings.typography.fontFamily,
      },
    },
  };
  const plotBandOptions = {
    color: themeSettings?.chart.backgroundColor,
    label: {
      style: {
        color: themeSettings.chart.textColor,
        fontFamily: themeSettings.typography.fontFamily,
      },
    },
  };

  const mergedOptions = merge(chartOptions, basicOptions);

  mergedOptions.xAxis = mergedOptions.xAxis?.map((axis) => {
    axis.plotBands = axis.plotBands?.map((plotBand) => {
      return merge(plotBand, plotBandOptions);
    });
    return merge(axis, axisOptions);
  });

  if (mergedOptions.yAxis) {
    mergedOptions.yAxis = mergedOptions.yAxis.map((axis) => {
      axis.plotBands = axis.plotBands?.map((plotBand) => {
        return merge(plotBand, plotBandOptions);
      });
      return merge(axis, axisOptions);
    });
  }

  return mergedOptions;
};

/**
 * Returns default theme settings, which can be used as base for custom theme options.
 *
 * @returns Theme settings object
 * @internal
 */
export const getDefaultThemeSettings = (): CompleteThemeSettings =>
  cloneDeep(DEFAULT_THEME_SETTINGS);
