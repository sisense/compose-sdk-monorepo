import type { WidgetHeaderItem } from '@/domains/widgets/shared/widget-header/widget-header-config';
import { WidgetHeaderTargets } from '@/domains/widgets/shared/widget-header/widget-header-targets';

import { ChartTableToggleButton, type ChartTableToggleLabels } from './chart-table-toggle-button';

/**
 * Id of the chart↔table toggle's header item.
 *
 * An ordinary item id, not a {@link WidgetHeaderTargets} one: the toggle is an opt-in feature a
 * consumer wires on, not something a widget header has by default.
 *
 * @internal
 */
export const CHART_TABLE_TOGGLE_ITEM_ID = 'chart-table-toggle';

/**
 * Builds the chart↔table toggle's header item, which switches a chart between its own type and a
 * table.
 *
 * Placed before the info button, where the control used to sit — an anchor that resolves even on
 * widgets whose info button is hidden.
 *
 * @param options - The toggle's current state and how to flip it.
 * @param options.pressed - Whether the widget currently shows the table view.
 * @param options.onPressedChange - Called when the button is clicked.
 * @param options.disabled - Whether the toggle is shown but not operable.
 * @param options.disabledTitle - Native `title` while disabled, explaining why.
 * @param options.labels - Accessible labels for the control.
 * @returns The header item to contribute through `config.header.items`.
 * @internal
 */
export const createChartTableToggleItem = ({
  pressed,
  onPressedChange,
  disabled,
  disabledTitle,
  labels,
}: {
  pressed: boolean;
  onPressedChange: (pressed: boolean) => void;
  disabled?: boolean;
  disabledTitle?: string;
  labels?: ChartTableToggleLabels;
}): WidgetHeaderItem => ({
  id: CHART_TABLE_TOGGLE_ITEM_ID,
  position: { type: 'auto' },
  component: () => (
    <ChartTableToggleButton
      pressed={pressed}
      onPressedChange={onPressedChange}
      disabled={disabled}
      disabledTitle={disabledTitle}
      labels={labels}
    />
  ),
});
