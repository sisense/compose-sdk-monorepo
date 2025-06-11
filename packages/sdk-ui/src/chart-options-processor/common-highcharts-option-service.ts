import merge from 'ts-deepmerge';
import { CompleteThemeSettings } from '..';
import { HighchartsOptionsInternal } from './chart-options-service';

// Highcharts default is 1000ms
export const DEFAULT_ANIMATION_DURATION_MS_INIT = 600;

// Highcharts default is 500ms
export const DEFAULT_ANIMATION_DURATION_MS_UPDATE = 300;

/*
 * Applies common highcharts options to the chart.
 */
export const applyCommonHighchartsOptions = (
  chartOptions: HighchartsOptionsInternal,
  themeSettings: CompleteThemeSettings,
  accessibilityEnabled: boolean,
): HighchartsOptionsInternal => {
  const initAnimation = {
    duration:
      themeSettings.chart.animation.init.duration === 'auto'
        ? DEFAULT_ANIMATION_DURATION_MS_INIT
        : themeSettings.chart.animation.init.duration,
  };
  const updateAnimation = {
    duration:
      themeSettings.chart.animation.redraw.duration === 'auto'
        ? DEFAULT_ANIMATION_DURATION_MS_UPDATE
        : themeSettings.chart.animation.redraw.duration,
  };
  return merge(chartOptions, {
    accessibility: { enabled: accessibilityEnabled },
    chart: { animation: updateAnimation },
    plotOptions: {
      series: { animation: initAnimation },
    },
    boost: { useGPUTranslations: true, usePreAllocated: true },
  });
};

/**
 * Composable variant of applyCommonHighchartsOptions.
 * Returns a function that applies common highcharts options to the chart options.
 *
 * @param themeSettings - The theme settings to use.
 * @param accessibilityEnabled - Whether accessibility is enabled.
 * @returns A function that applies common highcharts options to the chart.
 */
export function withCommonHighchartsOptions(
  themeSettings: CompleteThemeSettings,
  accessibilityEnabled: boolean,
): (chartOptions: HighchartsOptionsInternal) => HighchartsOptionsInternal {
  return (chartOptions: HighchartsOptionsInternal) =>
    applyCommonHighchartsOptions(chartOptions, themeSettings, accessibilityEnabled);
}
