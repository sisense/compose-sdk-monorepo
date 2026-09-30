import { Filter, isLevelAttribute } from '@sisense/sdk-data';

import type { FilterWidgetProps } from '@/domains/widgets/components/filter-widget/types';
import { isFilterWidgetProps } from '@/domains/widgets/components/widget-by-id/utils.js';
import type { WidgetProps, WithCommonWidgetProps } from '@/domains/widgets/components/widget/types';

/**
 * Returns the date granularity levels from `allFilters` that are claimed by filters on the
 * same dimension that are not this widget's own linked filter.
 *
 * Used to hide already-claimed levels from a FilterWidget's granularity dropdown — including
 * when the claimed grain matches this widget's current attribute. A new List created on the
 * same Weeks level as Condition "This Week" used to keep Weeks available (`g !== ownGrain`)
 * and then overwrite the Condition expression on empty Apply.
 *
 * The dropdown still surfaces the widget's current level when it is excluded (so the control
 * can name where it is parked); see `translatedGranularities` in FilterWidgetDropdown.
 * @param widget - The filter widget whose dimension and linked filter determine the exclusions.
 * @param allFilters - All active dashboard filters to check for date-level usage.
 * @returns Returns an array of granularity strings that should be hidden from the widget's dropdown.
 * @internal
 */
function getExcludedDateLevels(
  widget: WithCommonWidgetProps<FilterWidgetProps, 'filter'>,
  allFilters: readonly Filter[],
): string[] {
  const expr = widget.attribute?.expression;
  if (!expr) return [];

  const ownFilterGuid = widget.filter?.config.guid;

  const claimedByOthers = allFilters
    .filter(
      (f) =>
        f.attribute.expression === expr &&
        isLevelAttribute(f.attribute) &&
        f.config.guid !== ownFilterGuid,
    )
    .flatMap((f) => (isLevelAttribute(f.attribute) ? [f.attribute.granularity] : []));

  return [...new Set(claimedByOthers)];
}

/**
 * Hides already-claimed date granularities from a FilterWidget's dropdown by
 * injecting `excludedDateLevels` derived from the active dashboard filters.
 * Non-FilterWidget props, and FilterWidgets with nothing to exclude, pass
 * through unchanged.
 * @param allFilters - All active dashboard filters to check for date-level usage
 * @returns Returns a widget transformer that injects `excludedDateLevels` into FilterWidgets.
 * @internal
 */
export const withExcludedDateLevels =
  (allFilters: readonly Filter[]) =>
  (widget: WidgetProps): WidgetProps => {
    if (!isFilterWidgetProps(widget)) return widget;
    const excludedDateLevels = getExcludedDateLevels(widget, allFilters);
    return excludedDateLevels.length > 0 ? { ...widget, excludedDateLevels } : widget;
  };
