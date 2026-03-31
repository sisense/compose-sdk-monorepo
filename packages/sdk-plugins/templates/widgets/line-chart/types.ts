import type {
  GenericDataOptions,
  LineStyleOptions,
  StyledColumn,
  StyledMeasureColumn,
} from '@sisense/sdk-ui';

/**
 * Data options for the line-chart plugin — keys map to dataPanel inputs declared in index.tsx.
 */
export interface DataOptions extends GenericDataOptions {
  categories: StyledColumn[];
  values: StyledMeasureColumn[];
  breakBy: StyledColumn[];
}

/**
 * Style options for the line-chart plugin.
 * Picks only the properties editable via DesignPanels from LineStyleOptions.
 */
export interface StyleOptions
  extends Pick<
    LineStyleOptions,
    | 'subtype'
    | 'line'
    | 'legend'
    | 'seriesLabels'
    | 'markers'
    | 'xAxis'
    | 'yAxis'
    | 'y2Axis'
    | 'navigator'
  > {}
