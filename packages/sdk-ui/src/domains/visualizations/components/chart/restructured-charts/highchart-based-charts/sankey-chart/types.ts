import { SankeyChartDataOptionsInternal } from '@/domains/visualizations/core/chart-data-options/types';
import { ChartData } from '@/domains/visualizations/core/chart-data/types';
import { SankeyChartDesignOptions } from '@/domains/visualizations/core/chart-options-processor/translations/design-options';
import { SankeyStyleOptions } from '@/types';

/**
 * A single flow link between two Sankey nodes.
 */
export type SankeyLink = {
  from: string;
  to: string;
  weight: number;
};

/**
 * A single node in a Sankey diagram.
 */
export type SankeyNode = {
  id: string;
  name?: string;
  color?: string;
  /** Raw query value for this node — used to build members filters on click. */
  rawValue?: unknown;
  /** When true, the node (and its links) should be visually dimmed for highlight mode. */
  blur?: boolean;
};

/**
 * Processed chart data ready for the Highcharts Sankey renderer.
 */
export type SankeyChartData = {
  type: 'sankey';
  links: SankeyLink[];
  nodes: SankeyNode[];
  /** Total links before truncation; undefined when no truncation occurred. */
  totalLinksBeforeTruncation?: number;
};

export const isSankeyChartData = (chartData: ChartData): chartData is SankeyChartData =>
  chartData.type === 'sankey';

export type { SankeyChartDataOptionsInternal };
export type { SankeyChartDesignOptions };
export type SankeyChartStyleOptions = SankeyStyleOptions;
