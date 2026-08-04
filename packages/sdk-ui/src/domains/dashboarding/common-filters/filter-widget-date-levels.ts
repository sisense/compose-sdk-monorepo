import { Filter, isLevelAttribute } from '@sisense/sdk-data';

import type { FilterWidgetProps } from '@/domains/widgets/components/filter-widget/types';
import { isFilterWidgetProps } from '@/domains/widgets/components/widget-by-id/utils.js';
import type { WidgetProps, WithCommonWidgetProps } from '@/domains/widgets/components/widget/types';

/**
 * Returns the date granularity levels from `allFilters` that are in use on the same dimension
 * as `widget`, excluding the granularity already owned by the widget's linked filter.
 * Used to hide already-claimed levels from a FilterWidget's granularity dropdown.
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

  const dateLevelFiltersForDim = allFilters.filter(
    (f) => f.attribute.expression === expr && isLevelAttribute(f.attribute),
  );
  if (dateLevelFiltersForDim.length === 0) return [];

  const ownGranularity =
    widget.filter != null && isLevelAttribute(widget.filter.attribute)
      ? widget.filter.attribute.granularity
      : isLevelAttribute(widget.attribute)
      ? widget.attribute.granularity
      : undefined;

  return dateLevelFiltersForDim
    .flatMap((f) => (isLevelAttribute(f.attribute) ? [f.attribute.granularity] : []))
    .filter((g) => g !== ownGranularity);
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
