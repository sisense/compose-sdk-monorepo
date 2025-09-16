import merge from 'ts-deepmerge';
import { CompleteThemeSettings } from '../types';
import { HighchartsOptionsInternal } from './chart-options-service';
import { LegendSettings } from './translations/legend-section';
import { AxisPlotBand } from './translations/axis-section';

export const applyThemeToChart = (
  chartOptions: HighchartsOptionsInternal,
  themeSettings?: CompleteThemeSettings,
): HighchartsOptionsInternal => {
  if (!themeSettings) {
    return chartOptions;
  }

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

  const mergedOptions = merge(basicOptions, chartOptions);

  mergedOptions.xAxis = mergedOptions.xAxis?.map((axis) => {
    axis.plotBands = axis.plotBands?.map((plotBand) => {
      return merge(plotBand, {
        ...plotBandOptions,
        color: themeSettings?.chart.backgroundColor,
      } as AxisPlotBand);
    });
    const mergedAxis = merge(axis, axisOptions);
    if (mergedAxis.stackLabels) {
      mergedAxis.stackLabels.style = {
        ...mergedAxis.stackLabels.style,
        color: themeSettings.chart.textColor,
        fontFamily: themeSettings.typography.fontFamily,
      };
    }
    return mergedAxis;
  });

  if (mergedOptions.yAxis) {
    mergedOptions.yAxis = mergedOptions.yAxis.map((axis) => {
      axis.plotBands = axis.plotBands?.map((plotBand) => {
        return merge(plotBand, {
          ...plotBandOptions,
          color: plotBand.color || themeSettings?.chart.backgroundColor,
        }) as AxisPlotBand;
      });
      const mergedAxis = merge(axis, axisOptions);
      if (mergedAxis.stackLabels) {
        mergedAxis.stackLabels.style = {
          ...mergedAxis.stackLabels.style,
          color: themeSettings.chart.textColor,
          fontFamily: themeSettings.typography.fontFamily,
        };
      }
      return mergedAxis;
    });
  }

  return mergedOptions;
};

/**
 * Composable variant of applyThemeToChart.
 * Returns a function that applies theme options to the chart options.
 *
 * @param themeSettings - The theme settings to use.
 * @returns A function that applies theme options to the chart options.
 */
export function withThemeOptions(
  themeSettings?: CompleteThemeSettings,
): (chartOptions: HighchartsOptionsInternal) => HighchartsOptionsInternal {
  return (chartOptions: HighchartsOptionsInternal) =>
    applyThemeToChart(chartOptions, themeSettings);
}
