import { isNarrativeWidgetProps } from '@/domains/widgets/components/widget-by-id/utils.js';
import type { WidgetProps } from '@/domains/widgets/components/widget/types';
import type { ContextfulTransformer } from '@/shared/utils/utility-types/transformer.js';

/**
 * Hands every narrative widget the id of the saved dashboard it sits on, so the narrative is
 * requested for that dashboard by id. A `dashboardId` the widget already carries is kept.
 *
 * @param dashboardId - Id of the saved dashboard.
 * @returns Transformer of the widget props: the same list, with `dashboardId` set on each
 *   narrative widget; the input when there is none.
 * @internal
 */
export const withNarrativeDashboardId: ContextfulTransformer<WidgetProps[], string> =
  (dashboardId) => (widgets) => {
    if (!widgets.some(isNarrativeWidgetProps)) return widgets as WidgetProps[];

    return widgets.map((widget) =>
      isNarrativeWidgetProps(widget) && !widget.dashboardId ? { ...widget, dashboardId } : widget,
    );
  };
