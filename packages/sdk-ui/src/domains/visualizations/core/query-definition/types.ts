import { Attribute, Filter, FilterRelations, Measure } from '@sisense/sdk-data';

/**
 * Category of a query pill for styling (color).
 *
 * @sisenseInternal
 */
export type QueryPillCategory = 'measure' | 'dimension' | 'filter' | 'operator';

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
}

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
