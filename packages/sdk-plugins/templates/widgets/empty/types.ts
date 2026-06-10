import type {
  CustomVisualizationStyleOptions,
  GenericDataOptions,
  StyledColumn,
  StyledMeasureColumn,
} from '@sisense/sdk-ui';

/**
 * Data options for this plugin — each key maps to a dataPanel input by name.
 * Rename fields to match the inputs you declare in index.tsx (e.g. x/y for coordinate
 * charts, lat/lon for geo, path for hierarchical). Keep names short — they appear in
 * cross-filtering DataPoint entries.
 */
export interface DataOptions extends GenericDataOptions {
  category: StyledColumn[];
  value: StyledMeasureColumn[];
}

/**
 * Style options for this plugin — add fields for every style setting your design panel controls.
 */
export type StyleOptions = CustomVisualizationStyleOptions;
