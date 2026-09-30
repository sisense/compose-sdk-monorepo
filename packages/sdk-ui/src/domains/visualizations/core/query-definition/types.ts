import type { Attribute, Filter, FilterRelations, Measure } from '@sisense/sdk-data';

/**
 * Category of a query pill for styling (color).
 *
 * @sisenseInternal
 */
export type QueryPillCategory = 'measure' | 'dimension' | 'filter' | 'operator';

/**
 * Background and text colors for a query-definition pill.
 *
 * @sisenseInternal
 */
export interface QueryPillColor {
  bg: string;
  text: string;
}

type CustomPillPresentation = {
  /** When omitted, color follows {@link QueryPillCategory} defaults. */
  color?: QueryPillColor;
  /**
   * Collapse priority. Custom pills default to `true`: they stay visible ahead of
   * unpinned query pills, still capped by the visible-pill limit.
   */
  pin?: boolean;
};

/**
 * Host-owned pill appended after chips derived from the query.
 * A `Filter[]` value is one chip; its tooltip lists each member's normal filter label.
 * A {@link FilterRelations} value is one chip; its tooltip shows its filters joined by AND/OR.
 *
 * @sisenseInternal
 */
export type QueryDefinitionCustomPill =
  | (CustomPillPresentation & { category: 'filter'; value: Filter; label?: string })
  | (CustomPillPresentation & { category: 'filter'; value: readonly Filter[]; label: string })
  | (CustomPillPresentation & { category: 'filter'; value: FilterRelations; label: string })
  | (CustomPillPresentation & { category: 'measure'; value: Measure; label?: string })
  | (CustomPillPresentation & { category: 'dimension'; value: Attribute; label?: string });

/**
 * A single pill item in the query definition (measure, dimension, filter, or operator).
 *
 * @sisenseInternal
 */
export interface QueryPillItem {
  type: 'pill';
  /** Display label (friendly name) */
  label: string;
  /** Category for pill color */
  category: QueryPillCategory;
  /** Optional stable id for keys */
  id?: string;
  /** Source entity for debug/tooltip JSON (measure, dimension attribute, filter, etc.) */
  tooltipData?: Attribute | Measure | Filter | FilterRelations;
  /** Overrides category default colors. */
  color?: QueryPillColor;
  /** When true, collapse prefers this pill over unpinned pills (still respects the visible limit). */
  pin?: boolean;
  /**
   * When set, tooltip lists these filter rows (column bold, then value) instead of the
   * compose-code model.
   */
  groupedTooltipLines?: readonly GroupedTooltipLine[];
  /**
   * When set, tooltip shows this AND/OR tree of filter rows instead of the compose-code model.
   */
  relationsTooltip?: RelationsTooltipNode;
}

/**
 * One row in a grouped-filter tooltip (`Column: value`).
 *
 * @sisenseInternal
 */
export interface GroupedTooltipLine {
  column: string;
  value: string;
}

/**
 * AND/OR group in a filter-relations tooltip; `items` are joined by `operator`.
 *
 * @sisenseInternal
 */
export interface RelationsTooltipGroup {
  operator: 'AND' | 'OR';
  items: readonly RelationsTooltipNode[];
}

/**
 * Node of a filter-relations tooltip: one filter row or a nested AND/OR group.
 *
 * @sisenseInternal
 */
export type RelationsTooltipNode = GroupedTooltipLine | RelationsTooltipGroup;

/**
 * Connector between pill groups (plain text, no pill styling).
 *
 * @internal
 */
export interface ConnectorItem {
  type: 'connector';
  label: string;
}

/**
 * View model for the QueryDefinition component: ordered list of pills and connectors.
 * Order: Measures → "by" → Dimensions → "for"/"where" → Filters → Operators.
 *
 * @sisenseInternal
 */
export type QueryDefinitionViewModel = (QueryPillItem | ConnectorItem)[];

/**
 * Type guard for connector items.
 *
 * @internal
 */
export function isConnectorItem(item: QueryPillItem | ConnectorItem): item is ConnectorItem {
  return item.type === 'connector';
}

/**
 * Type guard for pill items.
 *
 * @internal
 */
export function isPillItem(item: QueryPillItem | ConnectorItem): item is QueryPillItem {
  return item.type === 'pill';
}
