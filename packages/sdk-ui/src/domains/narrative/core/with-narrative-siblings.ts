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
 * The dashboard widgets a narrative describes: the non-narrative widgets visible in the layout, in
 * layout order, or every non-narrative widget, in list order, when there is no layout. A widget
 * that is not in the layout does not count as visible.
 * @param widgets - Dashboard widgets.
 * @param layout - Widgets-panel layout, hidden cells included.
 * @returns The widgets to narrate.
 * @internal
 */
export function getNarrativeSiblings(
  widgets: readonly WidgetProps[],
  layout?: WidgetsPanelLayout,
): WidgetProps[] {
  const byId = new Map(widgets.map((widget) => [widget.id, widget]));
  const ordered = layout
    ? visibleWidgetIdsInLayoutOrder(layout)
        .map((id) => byId.get(id))
        .filter((widget): widget is WidgetProps => !!widget)
    : widgets;
  return ordered.filter((widget) => !isNarrativeWidgetProps(widget));
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

    const siblings = getNarrativeSiblings(widgets, layout);

    return widgets.map((widget) =>
      isNarrativeWidgetProps(widget) ? { ...widget, widgets: siblings } : widget,
    );
  };
