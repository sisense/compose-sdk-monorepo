import { DashboardDto, FilterDto, CascadingFilterDto } from '../api/types/dashboard-dto';
import { extractFilterModelFromJaql } from './translate-widget-filters';
import {
  FiltersIgnoringRules,
  PanelItem,
  WidgetDashboardFilterMode,
  WidgetDto,
  WidgetType,
} from './types';
import { getEnabledPanelItems } from './utils';

import {
  BackgroundFilter,
  BaseJaql,
  createFilterFromJaql,
  IncludeAllFilter,
} from '@sisense/sdk-data';

/**
 * Extracts dashboard filters applicable to a widget.
 *
 * @param {DashboardDto} dashboard - The dashboard containing the filters.
 * @param {WidgetDto} widget - The widget to extract filters from.
 * @returns {object} An object containing an array of filters and an array of highlights.
 */
export function extractDashboardFiltersForWidget(dashboard: DashboardDto, widget: WidgetDto) {
  const filtersIgnoringRules = widget.metadata.ignore;

  const { filters, highlights } = groupDashboardFilters(
    getDashboardFilters(dashboard, filtersIgnoringRules),
    getDashboardBackgroundFilters(dashboard),
    widget,
  );

  return {
    filters: filters.map((f) => createFilterFromJaql(f.jaql, f.instanceid)),
    highlights: highlights.map((f) => createFilterFromJaql(f.jaql)),
  };
}

/**
 * Splits cascading dashboard filters into individual filters.
 *
 * @param {Array<FilterDto | CascadingFilterDto>} dashboardFilters - The array of dashboard filters.
 * @returns {FilterDto[]} An array of individual filters.
 */
function splitCascadingDashboardFilters(dashboardFilters: Array<FilterDto | CascadingFilterDto>) {
  const splitDashboardFilters: FilterDto[] = [];

  for (const filter of dashboardFilters) {
    if (filter.isCascading) {
      const cascadingFilter = filter;
      const { disabled } = cascadingFilter;
      const splittedFilters = cascadingFilter.levels.map(
        (level) => ({ jaql: level, disabled } as FilterDto),
      );
      splitDashboardFilters.push(...splittedFilters);
    } else {
      splitDashboardFilters.push(filter);
    }
  }

  return splitDashboardFilters;
}

/**
 * Retrieves the dashboard filters with optional exclusion rules.
 *
 * @param dashboard - The dashboard to retrieve filters from.
 * @param filtersIgnoringRules - Optional rules for excluding filters.
 * @returns An array of filtered dashboard filters.
 */
function getDashboardFilters(dashboard: DashboardDto, filtersIgnoringRules?: FiltersIgnoringRules) {
  return splitCascadingDashboardFilters(dashboard.filters || [])
    .filter(({ instanceid = '', disabled }) => {
      return (
        !filtersIgnoringRules?.all && !disabled && !filtersIgnoringRules?.ids.includes(instanceid)
      );
    })
    .map(({ jaql, instanceid }) => {
      const { filter, turnOffMembersFilter } = extractFilterModelFromJaql(jaql);
      return {
        instanceid,
        jaql: {
          ...jaql,
          filter: {
            ...filter,
            ...(turnOffMembersFilter && { filter: turnOffMembersFilter }),
          },
        },
      };
    });
}

/**
 * Retrieves the dashboard background filters.
 *
 * @param dashboard - The dashboard to retrieve background filters from.
 * @returns An array of background filters from the dashboard.
 */
function getDashboardBackgroundFilters(dashboard: DashboardDto) {
  const dashboardBackgroundFilters: FilterDto[] = [];

  splitCascadingDashboardFilters(dashboard.filters || []).forEach(({ jaql }) => {
    const { backgroundFilter } = extractFilterModelFromJaql(jaql);
    if (backgroundFilter) {
      dashboardBackgroundFilters.push({
        jaql: {
          ...jaql,
          filter: backgroundFilter,
          ...(jaql.datatype === 'datetime' && {
            level: (backgroundFilter as BackgroundFilter).level,
          }),
        },
      } as FilterDto);
    }
  });

  return dashboardBackgroundFilters;
}

/**
 * Groups dashboard filters into filters and highlights based on widget configuration.
 *
 * @param {FilterDto[]} dashboardFilters - The array of dashboard filters.
 * @param {WidgetDto} widget - The widget that filters are applied to.
 * @returns {object} An object containing an array of filters and an array of highlights.
 */
function groupDashboardFilters(
  dashboardFilters: FilterDto[],
  dashboardBackgroundFilters: FilterDto[],
  widget: WidgetDto,
) {
  const isWidgetAllowHighlightFilters =
    widget.options?.dashboardFiltersMode === WidgetDashboardFilterMode.SELECT;
  let filters: FilterDto[] = [];
  const highlights: FilterDto[] = [];

  dashboardFilters.forEach((dashboardFilter) => {
    if (
      isWidgetAllowHighlightFilters &&
      isHighlightFilterApplicableToWidget(dashboardFilter, widget)
    ) {
      highlights.push(dashboardFilter);
    } else {
      filters.push(dashboardFilter);
    }
  });

  filters = [...filters, ...dashboardBackgroundFilters];

  return { filters, highlights };
}

/**
 * Checks if a highlight filter is applicable to a widget.
 *
 * @param {FilterDto} filter - The filter to be checked.
 * @param {WidgetDto} widget - The widget that filters are applied to.
 * @returns {boolean} `true` if the filter is applicable; otherwise, `false`.
 */
function isHighlightFilterApplicableToWidget(filter: FilterDto, widget: WidgetDto) {
  const allowedAttributes = getAllowedWidgetHighlightAttributes(widget);
  return (
    allowedAttributes.includes(filter.jaql.dim) && !(filter.jaql.filter as IncludeAllFilter).all
  );
}

/**
 * Retrieves a list of attributes allowed for widget highlight filters.
 *
 * @param {WidgetDto} widget - The widget to retrieve highlight attributes from.
 * @returns {string[]} An array of allowed attributes for highlight filters.
 */
function getAllowedWidgetHighlightAttributes(widget: WidgetDto) {
  const highlightsAllowedPanelNames = getHighlightsAllowedPanelNames(widget.type as WidgetType);
  const allowedAttributes: string[] = [];

  for (const panelName of highlightsAllowedPanelNames) {
    const panelItems = getEnabledPanelItems(widget.metadata.panels, panelName);
    const panelAttributes = panelItems.map((item: PanelItem) => (item.jaql as BaseJaql).dim);
    allowedAttributes.push(...panelAttributes);
  }

  return allowedAttributes;
}

/**
 * Gets the panel names allowed for highlight filters based on the widget type.
 *
 * @param {WidgetType} widgetType - The type of the widget.
 * @returns {string[]} An array of panel names allowed for highlight filters.
 */
function getHighlightsAllowedPanelNames(widgetType: WidgetType) {
  switch (widgetType) {
    case 'chart/line':
    case 'chart/area':
      return ['x-axis'];
    case 'chart/bar':
    case 'chart/column':
    case 'chart/polar':
    case 'chart/pie':
    case 'treemap':
      return ['categories'];
    case 'chart/scatter':
      return ['x-axis', 'y-axis', 'point'];
    case 'chart/boxplot':
      return ['category'];
    case 'map/scatter':
      return ['geo'];
    case 'pivot2':
      return ['rows', 'columns'];
    default:
      // Note: all other widgets are not support highlight filters. For example: funnel, table, indicator
      return [];
  }
}
