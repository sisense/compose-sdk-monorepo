import { HighchartsOptionsInternal } from './chart-options-processor/chart-options-service.js';

/**
 * Wraps `chart.events.load` / `render` so `onReady` fires after Highcharts paints,
 * while preserving any existing handlers.
 *
 * @param options - Highcharts options to augment.
 * @param onReady - Callback invoked after each preserved load/render handler.
 * @returns Options with load/render handlers that also call `onReady`.
 * @internal
 */
export function applyOnReadyToHighchartsOptions(
  options: HighchartsOptionsInternal,
  onReady: () => void,
): HighchartsOptionsInternal {
  const existingEvents = options.chart.events ?? {};
  const existingLoad = existingEvents.load;
  const existingRender = existingEvents.render;

  return {
    ...options,
    chart: {
      ...options.chart,
      events: {
        ...existingEvents,
        // Highcharts binds `this` to the chart; preserve it for existing handlers
        // (e.g. cartesian/boxplot `load` reading `this.chartWidth`).
        load: function () {
          existingLoad?.call(this);
          onReady();
        },
        render: function () {
          existingRender?.call(this);
          onReady();
        },
      },
    },
  };
}
