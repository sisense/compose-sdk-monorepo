import type {
  CustomVisualizationStyleOptions,
  GenericDataOptions,
  StyledColumn,
  StyledMeasureColumn,
} from '@sisense/sdk-ui';

/**
 * Style options for the simple-table custom widget.
 */
export interface StyleOptions extends CustomVisualizationStyleOptions {
  /** Background color of the table header */
  headerBackgroundColor?: string;
  /** Text color of the table header */
  headerTextColor?: string;
  /** Padding (in pixels) for table cells */
  cellPadding?: number;
  /** Font size (in pixels) for table content */
  fontSize?: number;
}

export interface DataOptions extends GenericDataOptions {
  category: StyledColumn[];
  value: StyledMeasureColumn[];
}
