import { isNarrativeWidgetProps } from '@/domains/widgets/components/widget-by-id/utils.js';
import type { WidgetProps } from '@/domains/widgets/components/widget/types';
import type { ContextfulTransformer } from '@/shared/utils/utility-types/transformer.js';

/**
 * Marks every narrative widget as sitting on a dashboard open in shared mode (co-authoring), so
 * the narrative is requested for the dashboard's shared copy. A `sharedMode` the widget already
 * carries is kept.
 *
 * @param sharedMode - Whether the dashboard is open in shared mode.
 * @returns Transformer of the widget props: the same list, with `sharedMode` set on each
 *   narrative widget; the input when `sharedMode` is false or there is no narrative widget.
 * @internal
 */
export const withNarrativeSharedMode: ContextfulTransformer<WidgetProps[], boolean> =
  (sharedMode) => (widgets) => {
    if (!sharedMode || !widgets.some(isNarrativeWidgetProps)) return widgets as WidgetProps[];

    return widgets.map((widget) =>
      isNarrativeWidgetProps(widget) && widget.sharedMode === undefined
        ? { ...widget, sharedMode }
        : widget,
    );
  };
