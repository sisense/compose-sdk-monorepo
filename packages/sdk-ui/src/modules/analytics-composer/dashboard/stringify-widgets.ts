import { WidgetProps } from '@/domains/widgets/components/widget/types';

import { TemplateKeyMapByWidgetType, UiFramework } from '../types.js';
import { getWidgetCode } from '../widget/to-widget-code.js';

export const stringifyWidgets = (widgets: WidgetProps[], uiFramework: UiFramework): string => {
  const templateKeyMap: TemplateKeyMapByWidgetType = {
    chart: 'chartWidgetPropsTmpl',
    pivot: 'pivotTableWidgetPropsTmpl',
  };
  return `[${widgets
    .map((widgetProps) => getWidgetCode(widgetProps, uiFramework, templateKeyMap))
    .join(',\n')}]`;
};
