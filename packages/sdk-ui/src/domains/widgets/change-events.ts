import { Attribute } from '@sisense/sdk-data';

import { DataOptionLocation, DrilldownSelection } from '@/types';

/**
 * Event triggered when chart widget drilldown selections change.
 *
 * @example
 * ```ts
 * { type: 'drilldownSelections/changed', payload: [{ points: [...], nextDimension }] }
 * ```
 */
export interface ChartWidgetDrilldownSelectionsChangedEvent {
  /** Event type */
  type: 'drilldownSelections/changed';
  /** The new drilldown selections */
  payload: DrilldownSelection[];
}

/**
 * Event triggered when widget title changes (e.g. inline rename).
 *
 * @example
 * ```ts
 * { type: 'title/changed', payload: { title: 'New Title' } }
 * ```
 */
export interface WidgetTitleChangedEvent {
  /** Event type */
  type: 'title/changed';
  /** The new title */
  payload: { title: string };
}

/**
 * Events that can be triggered by the ChartWidget component.
 */
export type ChartWidgetChangeEvent =
  | ChartWidgetDrilldownSelectionsChangedEvent
  | WidgetTitleChangedEvent;

/**
 * Event triggered when pivot table widget drilldown selections change.
 *
 * @example
 * ```ts
 * { type: 'drilldownSelections/changed', payload: { target, selections } }
 * ```
 */
export interface PivotTableWidgetDrilldownSelectionsChangedEvent {
  /** Event type */
  type: 'drilldownSelections/changed';
  /** The drilldown target and new selections */
  payload: {
    target: Attribute | DataOptionLocation;
    selections: DrilldownSelection[];
  };
}

/**
 * Events that can be triggered by the PivotTableWidget component.
 */
export type PivotTableWidgetChangeEvent =
  | PivotTableWidgetDrilldownSelectionsChangedEvent
  | WidgetTitleChangedEvent;

/**
 * Events that can be triggered by widget components.
 *
 * Union of all widget-specific change events. Extensible for TextWidget, CustomWidget future events.
 *
 * @example
 * ```ts
 * ChartWidget onChange handler:
 * onChange={(event) => {
 *   if (event.type === 'drilldownSelections/changed') {
 *     setDrilldownSelections(event.payload);
 *   }
 * }}
 * ```
 */
export type WidgetChangeEvent = ChartWidgetChangeEvent | PivotTableWidgetChangeEvent;
