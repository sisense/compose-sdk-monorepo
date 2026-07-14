import { Attribute, Filter } from '@sisense/sdk-data';

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
 *
 * @internal
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
 * Event triggered when a FilterWidget's date granularity changes
 * (the level selector in the date variant of the dropdown).
 *
 * @example
 * ```ts
 * { type: 'dateLevel/changed', payload: { attribute: DM.Commerce.Date.Months } }
 * ```
 *
 * @internal
 */
export interface FilterWidgetDateLevelChangedEvent {
  /** Event type */
  type: 'dateLevel/changed';
  /** The attribute at the newly selected granularity (a LevelAttribute) */
  payload: { attribute: Attribute };
}

/**
 * Event triggered when the FilterWidget's filter selection changes
 * (member selection in the dropdown, or clearing the selection).
 *
 * @example
 * ```ts
 * { type: 'filter/changed', payload: { filter: filterFactory.members(DM.Commerce.Country, ['France']) } }
 * ```
 *
 * @internal
 */
export interface FilterWidgetFilterChangedEvent {
  /** Event type */
  type: 'filter/changed';
  /** The new filter state (`null` when the selection is cleared) */
  payload: { filter: Filter | null };
}

/**
 * Events that can be triggered by the FilterWidget component through its
 * unified `onChange` channel (same pattern as ChartWidget / PivotTableWidget).
 *
 * @internal
 */
export type FilterWidgetChangeEvent =
  | FilterWidgetFilterChangedEvent
  | FilterWidgetDateLevelChangedEvent
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
 *
 * Persistable state changes (e.g. scroll position, future title/customOptions)
 * flow through {@link WidgetPropsUpdate} and `DashboardPersistenceManager.updateWidget`,
 * NOT through this channel. Use `WidgetChangeEvent` for transient/interactive
 * events; use `WidgetPropsUpdate` for "if this is lost on reload, the user
 * notices."
 */
export type WidgetChangeEvent =
  | ChartWidgetChangeEvent
  | PivotTableWidgetChangeEvent
  | FilterWidgetChangeEvent;
