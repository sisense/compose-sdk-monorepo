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
  category: StyledColumn[];
  value: StyledMeasureColumn[];
  breakBy: StyledColumn[];
}

/**
 * Style options for the line-chart plugin.
 *
 * Picks only the properties exposed by `DesignPanel` from `LineStyleOptions`.
 * Add another key here (and a control in `DesignPanel.tsx`) to expose more
 * style controls to dashboard editors.
 */
export type StyleOptions = Pick<LineStyleOptions, 'subtype' | 'line' | 'legend'>;
