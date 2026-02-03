import { Attribute, Filter, filterFactory, MembersFilter } from '@sisense/sdk-data';
import isEqual from 'lodash-es/isEqual';
import last from 'lodash-es/last';

import { applyDrilldownDimension } from '@/domains/drilldown/drilldown-utils.js';
import {
  applyDrilldownDimensionToPivot,
  getInitialDimensionLocation,
} from '@/domains/widgets/components/pivot-table-widget/utils.js';
import {
  ChartDataOptions,
  ChartType,
  DrilldownOptions,
  GenericDataOptions,
  PivotTableDataOptions,
  PivotTableDrilldownOptions,
  WidgetType,
} from '@/index.js';
import { haveSameAttribute } from '@/shared/utils/filters-comparator.js';
import { isSameAttribute } from '@/shared/utils/filters.js';

import { FiltersIgnoringRules, PureFilter } from './types.js';

export function getAllowedFilters(
  filters: PureFilter[],
  ignoreFiltersOptions: FiltersIgnoringRules,
) {
  if (ignoreFiltersOptions.all) {
    return [];
  }

  return filters.filter((pureFilter) => {
    return !ignoreFiltersOptions.ids?.includes(pureFilter.config.guid);
  });
}

export function getFilterByAttribute(filters: Filter[], attribute: Attribute) {
  return filters.find((f) => isSameAttribute(f.attribute, attribute));
}

export function createCommonFilter(
  attribute: Attribute,
  members: (string | number)[],
  existingCommonFilters: Filter[],
) {
  const existingFilter = getFilterByAttribute(existingCommonFilters, attribute);
  return filterFactory.members(
    attribute,
    members.map((v) => `${v}`),
    {
      guid: existingFilter?.config.guid,
      backgroundFilter: (existingFilter as MembersFilter | undefined)?.config.backgroundFilter,
    },
  );
}

export function isEqualMembersFilters(filterA: Filter, filterB: Filter) {
  return (
    haveSameAttribute(filterA, filterB) &&
    'members' in filterA &&
    'members' in filterB &&
    isEqual((filterA as MembersFilter).members, (filterB as MembersFilter).members)
  );
}

type GetWidgetDataOptionsWithDrilldownParams = {
  widgetType?: WidgetType;
  chartType?: ChartType;
  dataOptions: ChartDataOptions | PivotTableDataOptions | GenericDataOptions;
  drilldownOptions?: DrilldownOptions | PivotTableDrilldownOptions;
};

/**
 * Applies drilldown to the widget data options.
 *
 * @param params - The parameters for the function.
 * @param params.widgetType - The type of the widget.
 * @param params.chartType - The type of the chart.
 * @param params.dataOptions - The data options of the widget.
 * @param params.drilldownOptions - The drilldown options of the widget.
 * @returns The widget data options with drilldown applied.
 */
export function getWidgetDataOptionsWithDrilldown({
  widgetType,
  chartType,
  dataOptions,
  drilldownOptions,
}: GetWidgetDataOptionsWithDrilldownParams) {
  if (widgetType === 'pivot') {
    const pivotDrilldownOptions = drilldownOptions as PivotTableDrilldownOptions | undefined;
    const pivotDataOptions = dataOptions as PivotTableDataOptions;
    const drilldownSelections = pivotDrilldownOptions?.drilldownSelections;
    const drilldownTarget = pivotDrilldownOptions?.drilldownTarget;

    if (drilldownSelections && drilldownSelections.length && drilldownTarget) {
      const initialDimensionLocation = getInitialDimensionLocation(
        pivotDataOptions,
        drilldownTarget,
        drilldownSelections,
      );
      const lastSelection = last(drilldownSelections);

      if (initialDimensionLocation && lastSelection?.nextDimension) {
        return applyDrilldownDimensionToPivot(
          pivotDataOptions,
          initialDimensionLocation,
          lastSelection.nextDimension,
        );
      }
    }
  }

  if (chartType) {
    const chartWidgetDrilldownOptions = drilldownOptions as DrilldownOptions | undefined;
    const chartWidgetDataOptions = dataOptions as ChartDataOptions;
    const drilldownSelections = chartWidgetDrilldownOptions?.drilldownSelections;

    if (drilldownSelections && drilldownSelections.length) {
      const lastSelection = last(drilldownSelections);

      if (lastSelection?.nextDimension) {
        return applyDrilldownDimension(
          chartType,
          chartWidgetDataOptions,
          lastSelection.nextDimension,
        );
      }
    }
  }

  return dataOptions;
}
