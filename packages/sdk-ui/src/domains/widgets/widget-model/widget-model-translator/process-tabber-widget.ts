import { createDataOptionsFromPanels } from '@/domains/widgets/components/widget-by-id/translate-widget-data-options.js';
import { extractStyleOptions } from '@/domains/widgets/components/widget-by-id/translate-widget-style-options';
import { extractTabberButtonsWidgetCustomOptions } from '@/domains/widgets/components/widget-by-id/translate-widget-style-options/tabber.js';
import {
  Panel,
  TabberWidgetDto,
  WidgetDto,
} from '@/domains/widgets/components/widget-by-id/types.js';
import { GenericDataOptions, TabberButtonsWidgetStyleOptions } from '@/types.js';

/**
 * Processes officially supported tabber custom widgets (WidgetsTabber).
 * Pure function that creates data and style options for the TabberButtonsWidget.
 * Maps from DTO widget type ('WidgetsTabber') to CSDK widget type ('tabber-buttons').
 *
 * @param params - Parameters for processing tabber widget
 * @returns Object containing fusion type, custom type, data options, style options, and custom options
 */
export const processTabberWidget = (params: {
  panels: Panel[];
  widgetDto: WidgetDto;
  variantColors: string[];
}): {
  fusionWidgetType: 'custom';
  customWidgetType: 'tabber-buttons';
  dataOptions: GenericDataOptions;
  styleOptions: TabberButtonsWidgetStyleOptions;
  customOptions: Record<string, any>;
} => {
  const { panels, widgetDto, variantColors } = params;

  // Extract customOptions for tabber-buttons (DTO type is 'WidgetsTabber')
  const customOptions = extractTabberButtonsWidgetCustomOptions(widgetDto as TabberWidgetDto);

  return {
    fusionWidgetType: 'custom',
    customWidgetType: 'tabber-buttons',
    dataOptions: createDataOptionsFromPanels(panels, variantColors),
    styleOptions: extractStyleOptions(
      'WidgetsTabber',
      widgetDto,
    ) as TabberButtonsWidgetStyleOptions,
    customOptions,
  };
};
