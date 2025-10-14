import { ChartType, TableType } from '../../types';
import areaChartNoResultsImage from './area-no-results-small.svg';
import barChartNoResultsImage from './bar-no-results-small.svg';
import boxplotChartNoResultsImage from './boxplot-no-results-small.svg';
import calendarHeatmapChartNoResultsImage from './calendar-heatmap-no-results-small.svg';
import columnChartNoResultsImage from './column-no-results-small.svg';
import funnelChartNoResultsImage from './funnel-no-results.svg';
import indicatorChartNoResultsImage from './indicator-no-results-small.svg';
import lineChartNoResultsImage from './line-no-results-small.svg';
import pieChartNoResultsImage from './pie-no-results-small.svg';
import polarChartNoResultsImage from './polar-no-results-small.svg';
import scatterChartNoResultsImage from './scatter-no-results-small.svg';
import sunburstChartNoResultsImage from './sunburst-no-results-small.svg';
import tableNoResultsImage from './table-no-results-small.svg';
import treemapChartNoResultsImage from './treemap-no-results-small.svg';
import usaMapNoResultsImage from './usa-map-no-results-small.svg';

const noResultOverlayImages = {
  area: areaChartNoResultsImage,
  arearange: areaChartNoResultsImage,
  line: lineChartNoResultsImage,
  bar: barChartNoResultsImage,
  column: columnChartNoResultsImage,
  polar: polarChartNoResultsImage,
  funnel: funnelChartNoResultsImage,
  pie: pieChartNoResultsImage,
  scatter: scatterChartNoResultsImage,
  indicator: indicatorChartNoResultsImage,
  table: tableNoResultsImage,
  treemap: treemapChartNoResultsImage,
  areamap: usaMapNoResultsImage,
  scattermap: usaMapNoResultsImage,
  boxplot: boxplotChartNoResultsImage,
  sunburst: sunburstChartNoResultsImage,
  'calendar-heatmap': calendarHeatmapChartNoResultsImage,
};

export function getNoResultOverlayImage(type: ChartType | TableType) {
  const defaultTypeFallback = 'bar';
  return noResultOverlayImages[type] ?? noResultOverlayImages[defaultTypeFallback];
}
