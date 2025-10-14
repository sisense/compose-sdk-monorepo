import {
  AreamapChartDataOptions,
  ChartDataOptions,
  PivotTableDataOptions,
  TableDataOptions,
} from '../../../chart-data-options/types.js';
import { DynamicChartType } from '../../../chart-options-processor/translations/types.js';

// A union of top-level data options types we might return
export type WidgetDataOptions = ChartDataOptions | TableDataOptions | PivotTableDataOptions;

// Return partials, since many data option shapes have required fields that should be provided by the caller.
export function getWidgetTypeDefaultDataOptions(
  chartType: DynamicChartType | 'pivot' | 'pivot2',
): Partial<WidgetDataOptions> {
  switch (chartType) {
    // Cartesian family
    case 'line':
    case 'area':
    case 'bar':
    case 'column':
    case 'polar':
      return { category: [], value: [], breakBy: [] };

    // Categorical family
    case 'pie':
    case 'funnel':
    case 'treemap':
    case 'sunburst':
      return { category: [], value: [] };

    // Scatter
    case 'scatter':
      return {};

    // Indicator
    case 'indicator':
      return {};

    // Range (AreaRange)
    case 'arearange':
      return { category: [], value: [], breakBy: [] };

    // Boxplot (both variants require non-empty fields, keep defaults empty)
    case 'boxplot':
      return {};

    // Geo charts
    case 'areamap':
      // 'geo' is required in AreamapChartDataOptions. Leave defaults empty as a Partial.
      return {} as Partial<AreamapChartDataOptions>;
    case 'scattermap':
      return { geo: [] };

    // Tabular
    case 'table':
      return { columns: [] };
    case 'pivot':
    case 'pivot2':
      return {};

    // Image and others without data options
    case 'image':
    default:
      return {};
  }
}
