import {
  isChartWidgetProps,
  isPivotTableWidgetProps,
} from '@/domains/widgets/components/widget-by-id/utils';
import type { DrilldownSelection } from '@/types';

import type { WidgetChangeEvent } from './change-events';
import type { WidgetProps } from './components/widget/types';

/**
 * Type guard: chart drilldown payload is an array of DrilldownSelection.
 */
function isChartDrilldownPayload(payload: unknown): payload is DrilldownSelection[] {
  return Array.isArray(payload) && payload.every(isDrilldownSelection);
}

function isDrilldownSelection(x: unknown): x is DrilldownSelection {
  return typeof x === 'object' && x !== null && 'points' in x && 'nextDimension' in x;
}

/**
 * Type guard: pivot drilldown payload has target and selections.
 */
function isPivotDrilldownPayload(
  payload: unknown,
): payload is { target: unknown; selections: DrilldownSelection[] } {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    'target' in payload &&
    'selections' in payload &&
    Array.isArray((payload as { selections: unknown }).selections) &&
    (payload as { selections: unknown[] }).selections.every(isDrilldownSelection)
  );
}

/**
 * Reduces a WidgetChangeEvent to a Partial<WidgetProps> delta for state merge.
 *
 * Pure, allocation-only; no mutation. Used by the composition layer (e.g. useComposedDashboard)
 * to translate atomic events into prop updates.
 *
 * Validates that the event payload structure matches the widget type before applying.
 * Returns empty delta when payload structure is incompatible (e.g. chart array payload
 * for a pivot widget), avoiding silent corruption.
 *
 * @param event - The widget change event
 * @param currentWidget - The current widget state
 * @returns A partial props object to merge into the widget
 */
export function widgetChangeEventToDelta(
  event: WidgetChangeEvent,
  currentWidget: WidgetProps,
): Partial<WidgetProps> {
  // eslint-disable-next-line sonarjs/no-small-switch
  switch (event.type) {
    case 'title/changed':
      return { title: event.payload.title };
    case 'drilldownSelections/changed':
      if (isChartWidgetProps(currentWidget) && isChartDrilldownPayload(event.payload)) {
        return {
          drilldownOptions: {
            ...currentWidget.drilldownOptions,
            drilldownSelections: event.payload,
          },
        };
      }
      if (isPivotTableWidgetProps(currentWidget) && isPivotDrilldownPayload(event.payload)) {
        const { target, selections } = event.payload;
        return {
          drilldownOptions: {
            ...currentWidget.drilldownOptions,
            drilldownTarget: target,
            drilldownSelections: selections,
          },
        };
      }
      return {};
    default:
      return {};
  }
}
