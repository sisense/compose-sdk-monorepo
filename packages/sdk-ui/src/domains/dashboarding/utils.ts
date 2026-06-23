import { WidgetProps } from '@/domains/widgets/components/widget/types';

import { WidgetsPanelColumnLayout } from './types.js';

export const getDividerStyle = (color: string, width: number) => `${width}px solid ${color}`;

/**
 * Gets the default layout for a set of widgets.
 *
 * Widgets are laid out in a single column vertically.
 *
 * @param widgets - The widgets to create a layout for.
 * @returns The default layout for the widgets.
 */
export const getDefaultWidgetsPanelLayout = (widgets: WidgetProps[]): WidgetsPanelColumnLayout => {
  return {
    columns: [
      {
        widthPercentage: 100,
        rows: widgets.map((widget) => ({
          cells: [{ widthPercentage: 100, widgetId: widget.id }],
        })),
      },
    ],
  };
};

/**
 * Returns a copy of the layout with a new full-width row holding `widgetId` appended to the first
 * column (a column is created if the layout has none). Pure; does not mutate the input.
 *
 * @param layout - The current widgets-panel layout.
 * @param widgetId - The id of the widget to append.
 * @returns The layout with the widget appended.
 */
export const withWidgetAppendedToPanelLayout = (
  layout: WidgetsPanelColumnLayout,
  widgetId: string,
): WidgetsPanelColumnLayout => {
  const newRow = { cells: [{ widthPercentage: 100, widgetId }] };
  if (layout.columns.length === 0) {
    return { columns: [{ widthPercentage: 100, rows: [newRow] }] };
  }
  return {
    ...layout,
    columns: layout.columns.map((column, index) =>
      index === 0 ? { ...column, rows: [...column.rows, newRow] } : column,
    ),
  };
};

/**
 * With optionally disabled auto height.
 *
 * @param widgetProps - The widget props to disable the auto height for.
 * @param shouldDisable - Whether to disable the auto height.
 * @returns The widget props with the auto height disabled if applicable.
 */
export const withOptionallyDisabledAutoHeight = (
  widgetProps: WidgetProps,
  shouldDisable: boolean,
): WidgetProps => {
  if (
    widgetProps.widgetType === 'pivot' &&
    widgetProps.styleOptions?.isAutoHeight &&
    shouldDisable
  ) {
    return {
      ...widgetProps,
      styleOptions: { ...widgetProps.styleOptions, isAutoHeight: false },
    };
  }
  return widgetProps;
};

/**
 * Checks if all widgets have auto height and supports dynamic height.
 *
 * @param widgetProps - The widget props to check for auto height.
 * @returns True if all widgets have auto height, false otherwise.
 */
export const checkForAutoHeight = (widgetProps: WidgetProps[]): boolean => {
  return widgetProps.every((w) => w.widgetType === 'pivot' && w.styleOptions?.isAutoHeight);
};
