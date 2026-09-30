import type { WidgetsPanelLayout } from '@/domains/dashboarding/dashboard-model/types.js';
import { isNarrativeWidgetProps } from '@/domains/widgets/components/widget-by-id/utils.js';
import type { WidgetProps } from '@/domains/widgets/components/widget/types';
import type { ContextfulTransformer } from '@/shared/utils/utility-types/transformer.js';

/**
 * Lists the widget ids of the layout's visible cells, in reading order: column by column, row by
 * row.
 * @param layout - Widgets-panel layout.
 * @returns Ids of the widgets in visible cells.
 */
function visibleWidgetIdsInLayoutOrder(layout: WidgetsPanelLayout): string[] {
  return (layout.columns ?? []).flatMap((column) =>
    (column.rows ?? []).flatMap((row) =>
      (row.cells ?? []).filter((cell) => !cell.hidden).map((cell) => cell.widgetId),
    ),
  );
}

/**
 * Hands every narrative widget the dashboard widgets it describes: the other widgets that are
 * visible in the layout, in layout order, with the props they have at this point of the pipeline
 * (dashboard filters and highlights already connected). Narrative widgets never describe each
 * other. A widget that is not in the layout does not count as visible.
 *
 * @param layout - Final widgets-panel layout, hidden cells included.
 * @returns Transformer of the connected widget props: the same list, with `widgets` set on each
 *   narrative widget; the input when there is none.
 * @internal
 */
export const withNarrativeSiblings: ContextfulTransformer<WidgetProps[], WidgetsPanelLayout> =
  (layout) => (widgets) => {
    if (!widgets.some(isNarrativeWidgetProps)) return widgets as WidgetProps[];

    const byId = new Map(widgets.map((widget) => [widget.id, widget]));
    const siblings = visibleWidgetIdsInLayoutOrder(layout)
      .map((id) => byId.get(id))
      .filter((widget): widget is WidgetProps => !!widget && !isNarrativeWidgetProps(widget));

    return widgets.map((widget) =>
      isNarrativeWidgetProps(widget) ? { ...widget, widgets: siblings } : widget,
    );
  };
