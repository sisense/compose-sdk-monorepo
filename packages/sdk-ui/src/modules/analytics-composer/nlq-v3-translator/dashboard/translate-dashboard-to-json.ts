import {
  Filter,
  FilterRelations,
  isFilterRelations,
  splitFiltersAndRelations,
} from '@sisense/sdk-data';

import { DashboardProps } from '@/domains/dashboarding/types.js';

import type { NlqTranslationError, NlqTranslationResult } from '../../types.js';
import { translateFiltersToJSON } from '../constructs/filters/translate-filters-to-json.js';
import { mapTranslationErrors, withWidgetsArrayPath } from '../shared/utils/error-path.js';
import {
  collectTranslationErrors,
  stripDelimitersFromJson,
  translateDataSourceToJSON,
  translateWidgetsOptionsToJSON,
} from '../shared/utils/translation-helpers.js';
import type { DashboardJSON } from '../types.js';
import { translateWidgetToJSON } from '../widget/translate-widget-to-json.js';

/**
 * Resolves the data source each serialized filter entry should be tagged with, one per entry in
 * `translateFiltersToJSON`'s output order (see that function for why a `FilterRelations` tree
 * always serializes as a single entry). Pushes a translation error instead of returning a value
 * when a combined `FilterRelations` tree's leaves target more than one data source — that shape
 * can't be tagged with a single source without silently guessing.
 *
 * @internal
 * @param filters - The dashboard's CSDK filters, used as the source of truth for each entry's data source
 * @param translationErrors - Error accumulator to push into when a combined tree can't be resolved
 * @returns One data source title (or `undefined`) per serialized entry, or `null` when rejected
 */
function resolveFilterEntryDataSources(
  filters: Filter[] | FilterRelations,
  translationErrors: NlqTranslationError[],
): (string | undefined)[] | null {
  if (!isFilterRelations(filters)) {
    return filters.map((filter) => filter.attribute?.dataSource?.title);
  }

  const leafDataSources = splitFiltersAndRelations(filters)
    .filters.map((filter) => filter.attribute?.dataSource?.title)
    .filter((title): title is string => title !== undefined);
  const distinctDataSources = new Set(leafDataSources);
  if (distinctDataSources.size > 1) {
    translationErrors.push({
      path: 'filters',
      input: filters,
      message:
        'Cannot serialize a combined filter expression whose leaves target different data ' +
        `sources (${Array.from(distinctDataSources).join(', ')}). Each dashboard-level filter ` +
        'tile must target a single data source.',
    });
    return null;
  }
  return [leafDataSources[0]];
}

/**
 * Translates CSDK DashboardProps to NLQ DashboardJSON format.
 * Direction: CSDK → JSON
 *
 * Translates each widget using `translateWidgetToJSON` and dashboard-level filters using the
 * shared filter translator. Each resulting filter tile is tagged with the data source of the
 * `Filter`/`FilterRelations` it came from (via `attribute.dataSource`) whenever that differs from
 * `defaultDataSource` — see `DashboardFilterWithDataSourceJSON` — so a multi-data-source
 * filter panel round-trips correctly. Translation fails if any widget or filter translation fails,
 * or if a combined `FilterRelations` tree's leaves target more than one data source (that shape
 * can't be represented as today's single-tag-per-tile JSON).
 *
 * @param dashboardProps - Dashboard props to serialize
 * @returns NlqTranslationResult with DashboardJSON or errors
 * @internal
 */
export const translateDashboardToJSON = (
  dashboardProps: DashboardProps,
): NlqTranslationResult<DashboardJSON> => {
  const translationErrors: NlqTranslationError[] = [];

  // Translate each widget using WidgetProps from the dashboard
  const widgetJSONs: DashboardJSON['widgets'] = [];
  dashboardProps.widgets.forEach((widget, widgetIndex) => {
    const result = translateWidgetToJSON(widget);
    if (!result.success) {
      translationErrors.push(
        ...mapTranslationErrors(result.errors, withWidgetsArrayPath(widgetIndex)),
      );
      return;
    }
    widgetJSONs.push(result.data);
  });

  // Translate dashboard-level filters. translateFiltersToJSON preserves index correspondence
  // with dashboardProps.filters (one FunctionCall per Filter, or a single-element array when
  // filters is one FilterRelations tree), so each resulting entry can be zipped back to the
  // data source it came from and tagged only when that differs from defaultDataSource.
  let filtersJSON: DashboardJSON['filters'] = undefined;
  if (dashboardProps.filters) {
    const rawFunctionCalls = collectTranslationErrors(
      () => translateFiltersToJSON(dashboardProps.filters),
      translationErrors,
    );
    if (rawFunctionCalls) {
      const defaultDataSourceTitle =
        dashboardProps.defaultDataSource !== undefined
          ? translateDataSourceToJSON(dashboardProps.defaultDataSource)
          : undefined;

      const entryDataSources = resolveFilterEntryDataSources(
        dashboardProps.filters,
        translationErrors,
      );

      if (entryDataSources) {
        filtersJSON = rawFunctionCalls.map((functionCall, i) => {
          // eslint-disable-next-line security/detect-object-injection -- i is the map's own loop index
          const entryDataSource = entryDataSources[i];
          return entryDataSource !== undefined && entryDataSource !== defaultDataSourceTitle
            ? { dataSource: entryDataSource, filter: functionCall }
            : functionCall;
        });
      }
    }
  }

  if (translationErrors.length > 0) {
    return { success: false, errors: translationErrors };
  }

  const widgetsOptionsJSON =
    dashboardProps.widgetsOptions !== undefined
      ? translateWidgetsOptionsToJSON(dashboardProps.widgetsOptions)
      : undefined;

  const dashboardJSON: DashboardJSON = {
    widgets: widgetJSONs,
    ...(dashboardProps.id !== undefined && { id: dashboardProps.id }),
    ...(dashboardProps.title !== undefined && { title: dashboardProps.title }),
    ...(filtersJSON && filtersJSON.length > 0 && { filters: filtersJSON }),
    ...(dashboardProps.layoutOptions !== undefined && {
      layoutOptions: dashboardProps.layoutOptions,
    }),
    ...(dashboardProps.config !== undefined && { config: dashboardProps.config }),
    ...(dashboardProps.defaultDataSource !== undefined && {
      defaultDataSource: translateDataSourceToJSON(dashboardProps.defaultDataSource),
    }),
    ...(dashboardProps.styleOptions !== undefined && { styleOptions: dashboardProps.styleOptions }),
    ...(widgetsOptionsJSON !== undefined && { widgetsOptions: widgetsOptionsJSON }),
  };

  return {
    success: true,
    data: stripDelimitersFromJson(dashboardJSON),
  };
};
