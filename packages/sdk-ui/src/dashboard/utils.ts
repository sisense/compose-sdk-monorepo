import { WidgetProps } from '@/props';

import { WidgetsPanelColumnLayout } from './types';

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
