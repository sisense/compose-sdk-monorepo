import {
  BackgroundFilterJaql,
  BaseJaql,
  createFilterFromJaql,
  IncludeAllFilterJaql,
} from '@sisense/sdk-data';

import {
  CascadingFilterDto,
  DashboardDto,
  FilterDto,
} from '../../../../infra/api/types/dashboard-dto.js';
import { extractFilterModelFromJaql, extractWidgetFilters } from './translate-widget-filters.js';
import {
  FiltersIgnoringRules,
  FusionWidgetType,
  PanelItem,
  WidgetDashboardFilterMode,
  WidgetDto,
} from './types.js';
import { getEnabledPanelItems, mergeFilters } from './utils.js';

/**
 * Extracts and merges dashboard and widget filters. This consolidates all
 * filters applicable for a widget.
 *
 * @param dashboard - The dashboard containing the filters.
 * @param widget - The widget containing the filters.
 * @returns An object containing an array of filters and an array of highlights.
 * @internal
 */
export function extractCombinedFilters(dashboard: DashboardDto, widget: WidgetDto) {
  const { filters: dashboardFilters, highlights } = extractDashboardFiltersForWidget(
    dashboard,
    widget,
  );
  const widgetFilters = extractWidgetFilters(widget.metadata.panels);
  const filters = mergeFilters(dashboardFilters, widgetFilters);
  return {
    filters,
    highlights,
  };
}

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
    getDashboardFilters(dashboard.filters || [], filtersIgnoringRules),
    getDashboardBackgroundFilters(dashboard.filters || []),
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
 * @param dashboardFilters - The array of dashboard filters
 * @param filtersIgnoringRules - Optional rules for excluding filters.
 * @returns An array of filtered dashboard filters.
 */
export function getDashboardFilters(
  dashboardFilters: Array<FilterDto | CascadingFilterDto>,
  filtersIgnoringRules?: FiltersIgnoringRules,
) {
  return splitCascadingDashboardFilters(dashboardFilters)
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
 * @param dashboardFilters - The array of dashboard filters
 * @returns An array of background filters from the dashboard.
 */
export function getDashboardBackgroundFilters(
  dashboardFilters: Array<FilterDto | CascadingFilterDto>,
) {
  const dashboardBackgroundFilters: FilterDto[] = [];

  splitCascadingDashboardFilters(dashboardFilters).forEach(({ jaql }) => {
    const { backgroundFilter } = extractFilterModelFromJaql(jaql);
    if (backgroundFilter) {
      dashboardBackgroundFilters.push({
        jaql: {
          ...jaql,
          filter: backgroundFilter,
          ...(jaql.datatype === 'datetime' && {
            level: (backgroundFilter as BackgroundFilterJaql).level,
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
    allowedAttributes.includes(filter.jaql.dim) && !(filter.jaql.filter as IncludeAllFilterJaql).all
  );
}

/**
 * Retrieves a list of attributes allowed for widget highlight filters.
 *
 * @param {WidgetDto} widgetDto - The widget to retrieve highlight attributes from.
 * @returns {string[]} An array of allowed attributes for highlight filters.
 */
function getAllowedWidgetHighlightAttributes(widgetDto: WidgetDto) {
  const highlightsAllowedPanelNames = getHighlightsAllowedPanelNames(widgetDto.type);
  const allowedAttributes: string[] = [];

  for (const panelName of highlightsAllowedPanelNames) {
    const panelItems = getEnabledPanelItems(widgetDto.metadata.panels, panelName);
    const panelAttributes = panelItems.map((item: PanelItem) => (item.jaql as BaseJaql).dim);
    allowedAttributes.push(...panelAttributes);
  }

  return allowedAttributes;
}

/**
 * Gets the panel names allowed for highlight filters based on the widget type.
 *
 * @param {FusionWidgetType} widgetType - The type of the widget.
 * @returns {string[]} An array of panel names allowed for highlight filters.
 */
function getHighlightsAllowedPanelNames(widgetType: FusionWidgetType) {
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
