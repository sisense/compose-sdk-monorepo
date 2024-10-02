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
