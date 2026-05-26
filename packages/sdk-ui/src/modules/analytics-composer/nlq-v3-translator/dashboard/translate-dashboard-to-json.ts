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
 * Translates CSDK DashboardProps to NLQ DashboardJSON format.
 * Direction: CSDK → JSON
 *
 * Translates each widget using `translateWidgetToJSON` and dashboard-level filters using
 * the shared filter translator. Translation fails if any widget or filter translation fails.
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

  // Translate dashboard-level filters
  let filtersJSON: DashboardJSON['filters'] = undefined;
  if (dashboardProps.filters) {
    const result = collectTranslationErrors(
      () => translateFiltersToJSON(dashboardProps.filters),
      translationErrors,
    );
    filtersJSON = (result ?? undefined) as DashboardJSON['filters'];
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
