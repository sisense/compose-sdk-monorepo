import type { Attribute, Filter } from '@sisense/sdk-data';

import type { VisualizationStateUpdate } from '@/infra/plugins/widget-plugins/types';
import type { DataOptionLocation, DrilldownSelection } from '@/types';

/**
 * Event triggered when chart widget drilldown selections change.
 *
 * @example
 * ```ts
 * { type: 'drilldownSelections/changed', payload: [{ points: [...], nextDimension }] }
 * ```
 */
export interface ChartWidgetDrilldownSelectionsChangedEvent {
  /** Event type. */
  type: 'drilldownSelections/changed';
  /** The new drilldown selections. */
  payload: DrilldownSelection[];
}

/**
 * Event triggered when widget title changes, for example on an inline rename.
 *
 * @example
 * ```ts
 * { type: 'title/changed', payload: { title: 'New Title' } }
 * ```
 *
 * @internal
 */
export interface WidgetTitleChangedEvent {
  /** Event type. */
  type: 'title/changed';
  /** The new title. */
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
  /** Event type. */
  type: 'drilldownSelections/changed';
  /** The drilldown target and new selections. */
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
  /** Event type. */
  type: 'dateLevel/changed';
  /** The attribute at the newly selected granularity (a LevelAttribute). */
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
  /** Event type. */
  type: 'filter/changed';
  /** The new filter state (`null` when the selection is cleared). */
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
 * Events that can be triggered by the NarrativeWidget component.
 *
 * @internal
 */
export type NarrativeWidgetChangeEvent = WidgetTitleChangedEvent;

/**
 * Event triggered when a custom widget's plugin visualization pushes a state update
 * through `CustomVisualizationProps.onChange`.
 *
 * The payload is the plugin's {@link VisualizationStateUpdate} as-is; the dashboard
 * composition layer (`useWidgetUpdatesPersistence`) translates it into a persistable
 * `WidgetPropsUpdate`.
 *
 * @example
 * ```ts
 * { type: 'visualizationState/changed', payload: { customOptions: { lastPage: 3 } } }
 * ```
 *
 * @internal
 */
export interface CustomWidgetVisualizationStateChangedEvent {
  /** Event type. */
  type: 'visualizationState/changed';
  /** The plugin's partial state update. */
  payload: VisualizationStateUpdate;
}

/**
 * Events that can be triggered by the CustomWidget component.
 *
 * @internal
 */
export type CustomWidgetChangeEvent =
  | CustomWidgetVisualizationStateChangedEvent
  | WidgetTitleChangedEvent;

/**
 * Events that can be triggered by widget components.
 *
 * Union of all widget-specific change events. Extensible for TextWidget future events.
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
 * A change event reports what happened; it is not itself the persisted shape.
 * Persisting is done by the composition-layer middleware that observes the event and
 * calls `DashboardPersistenceManager.updateWidget` (e.g. `useWidgetRenaming` for
 * `title/changed`, `useWidgetUpdatesPersistence` translating
 * `visualizationState/changed` into a {@link WidgetPropsUpdate}). State that no widget
 * event reports (e.g. navigator scroll position) is wired to `WidgetPropsUpdate` directly.
 */
export type WidgetChangeEvent =
  | ChartWidgetChangeEvent
  | PivotTableWidgetChangeEvent
  | FilterWidgetChangeEvent
  | NarrativeWidgetChangeEvent
  | CustomWidgetChangeEvent;
