import { Filter, FilterRelations } from '@sisense/sdk-data';

import type { WidgetsOptions } from '@/domains/dashboarding/dashboard-model/types.js';
import { DashboardProps } from '@/domains/dashboarding/types.js';
import type { WidgetProps } from '@/domains/widgets/components/widget/types.js';

import type { NlqTranslationError, NlqTranslationResult } from '../../types.js';
import { translateFiltersFromJSON } from '../constructs/filters/translate-filters-from-json.js';
import { mapTranslationErrors, withWidgetsArrayPath } from '../shared/utils/error-path.js';
import { createSchemaIndex } from '../shared/utils/schema-index.js';
import { collectTranslationErrors } from '../shared/utils/translation-helpers.js';
import type { DashboardInput } from '../types.js';
import { translateWidgetFromJSON } from '../widget/translate-widget-from-json.js';

/**
 * Translates NLQ DashboardJSON format to CSDK DashboardProps.
 * Direction: JSON → CSDK
 *
 * Translates each widget using `translateWidgetFromJSON` (which requires each widget JSON to
 * have an `id`). Dashboard-level filters are translated using the shared filter translator.
 *
 * Translation fails if any widget or filter translation fails.
 *
 * @param input - DashboardInput containing dashboardJSON and data schema context
 * @returns NlqTranslationResult with DashboardProps or errors
 * @internal
 */
export const translateDashboardFromJSON = (
  input: DashboardInput,
): NlqTranslationResult<DashboardProps> => {
  const { data: dashboardJSON, context } = input;

  const translationErrors: NlqTranslationError[] = [];

  // Translate each widget — id is required, translateWidgetFromJSON errors if missing
  const widgets: WidgetProps[] = [];
  if (!Array.isArray(dashboardJSON.widgets)) {
    translationErrors.push({
      path: 'widgets',
      input: dashboardJSON.widgets,
      message: 'Invalid dashboard JSON. Expected widgets to be an array.',
    });
  } else {
    dashboardJSON.widgets.forEach((widgetJSON, widgetIndex) => {
      const widgetResult = translateWidgetFromJSON({ data: widgetJSON, context });
      if (!widgetResult.success) {
        translationErrors.push(
          ...mapTranslationErrors(widgetResult.errors, withWidgetsArrayPath(widgetIndex)),
        );
        return;
      }
      widgets.push(widgetResult.data);
    });
  }

  // Translate dashboard-level filters
  let filters: Filter[] | FilterRelations | null = null;
  if (dashboardJSON.filters && dashboardJSON.filters.length > 0) {
    const schemaIndex = createSchemaIndex(context.tables);
    filters = collectTranslationErrors(
      () =>
        translateFiltersFromJSON({
          data: dashboardJSON.filters!,
          context: { dataSource: context.dataSource, schemaIndex },
        }),
      translationErrors,
    );
  }

  if (translationErrors.length > 0) {
    return { success: false, errors: translationErrors };
  }

  const result: DashboardProps = {
    widgets,
    ...(dashboardJSON.id !== undefined && { id: dashboardJSON.id }),
    ...(dashboardJSON.title !== undefined && { title: dashboardJSON.title }),
    ...(filters !== null && { filters }),
    ...(dashboardJSON.layoutOptions !== undefined && {
      layoutOptions: dashboardJSON.layoutOptions,
    }),
    ...(dashboardJSON.config !== undefined && { config: dashboardJSON.config }),
    ...(dashboardJSON.defaultDataSource !== undefined && {
      defaultDataSource: dashboardJSON.defaultDataSource,
    }),
    ...(dashboardJSON.styleOptions !== undefined && { styleOptions: dashboardJSON.styleOptions }),
    ...(dashboardJSON.widgetsOptions !== undefined && {
      widgetsOptions: dashboardJSON.widgetsOptions as WidgetsOptions,
    }),
  };

  return { success: true, data: result };
};
