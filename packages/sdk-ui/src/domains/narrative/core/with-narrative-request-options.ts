import { isNarrativeWidgetProps } from '@/domains/widgets/components/widget-by-id/utils.js';
import type { WidgetProps } from '@/domains/widgets/components/widget/types';

/**
 * How the dashboard holding narrative widgets is open, so that each narrative requests the same
 * dashboard instance by id.
 *
 * @example
 * ```ts
 * const options: NarrativeRequestOptions = { sharedMode: true, adminAccess: false };
 * ```
 * @group Dashboards
 * @sisenseInternal
 */
export interface NarrativeRequestOptions {
  /** The dashboard is open in shared mode (co-authoring). */
  sharedMode?: boolean;
  /** The dashboard is open through Admin Access. */
  adminAccess?: boolean;
}

const REQUEST_OPTION_KEYS = ['sharedMode', 'adminAccess'] as const;

/**
 * Sets the request options on the dashboard's narrative widget from how the dashboard is open. A
 * dashboard normally holds one; any other narrative widget gets the same options. A value the
 * widget already carries is kept.
 *
 * @example
 * Mark the narrative widget of a dashboard built with `toDashboardProps`.
 * ```ts
 * const props = dashboardModelTranslator.toDashboardProps(dashboardModel);
 * const widgets = withNarrativeRequestOptions({ sharedMode, adminAccess })(props.widgets);
 * ```
 * @param options - How the dashboard is open.
 * @returns Transformer of the widget props: the same list, with the options that are true set on
 *   the narrative widget; the input when no option is true or there is no narrative widget.
 * @group Dashboards
 * @sisenseInternal
 */
export const withNarrativeRequestOptions =
  (options: NarrativeRequestOptions) =>
  (widgets: readonly WidgetProps[]): WidgetProps[] => {
    const keys = REQUEST_OPTION_KEYS.filter((key) => options[key] === true);
    if (keys.length === 0 || !widgets.some(isNarrativeWidgetProps)) {
      return widgets as WidgetProps[];
    }

    return widgets.map((widget) => {
      if (!isNarrativeWidgetProps(widget)) return widget;
      const missing = keys.filter((key) => widget[key] === undefined);
      return missing.length === 0
        ? widget
        : { ...widget, ...Object.fromEntries(missing.map((key) => [key, true])) };
    });
  };
