import merge from 'ts-deepmerge';
import { CompleteThemeSettings } from '../types';
import { HighchartsOptionsInternal } from './chart-options-service';
import { LegendSettings } from './translations/legend-section';

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
