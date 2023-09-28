import areaChartNoResultsImage from './area-no-results-small.svg';
import lineChartNoResultsImage from './line-no-results-small.svg';
import barChartNoResultsImage from './bar-no-results-small.svg';
import columnChartNoResultsImage from './column-no-results-small.svg';
import polarChartNoResultsImage from './polar-no-results-small.svg';
import funnelChartNoResultsImage from './funnel-no-results.svg';
import pieChartNoResultsImage from './pie-no-results-small.svg';
import scatterChartNoResultsImage from './scatter-no-results-small.svg';
import indicatorChartNoResultsImage from './indicator-no-results-small.svg';
import tableNoResultsImage from './table-no-results-small.svg';
import treemapChartNoResultsImage from './treemap-no-results-small.svg';
import { ChartType, TableType } from '../../../types';

const noResultOverlayImages = {
  area: areaChartNoResultsImage,
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
};

export function getNoResultOverlayImage(type: ChartType | TableType) {
  const defaultTypeFallback = 'bar';
  return noResultOverlayImages[type] ?? noResultOverlayImages[defaultTypeFallback];
}
