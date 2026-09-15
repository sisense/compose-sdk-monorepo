import { Filter, FilterRelations } from '@sisense/sdk-data';

import type { WidgetsOptions } from '@/domains/dashboarding/dashboard-model/types.js';
import { DashboardProps } from '@/domains/dashboarding/types.js';
import type { WidgetProps } from '@/domains/widgets/components/widget/types.js';

import type { DataSchemaContext } from '../../types.js';
import type { NlqTranslationError, NlqTranslationResult } from '../../types.js';
import { translateFiltersFromJSON } from '../constructs/filters/translate-filters-from-json.js';
import { mapTranslationErrors, withWidgetsArrayPath } from '../shared/utils/error-path.js';
import { mergeTranslatedFilters } from '../shared/utils/merge-translated-filters.js';
import { createSchemaIndex, type SchemaIndex } from '../shared/utils/schema-index.js';
import type { DashboardInput } from '../types.js';
import { isDashboardFilterWithDataSource } from '../types.js';
import { translateWidgetFromJSON } from '../widget/translate-widget-from-json.js';

/**
 * Remaps a translated filter's error path from `filters[0]...` (the index inside the
 * single-element array each filter tile is translated as) to `filters[<filterIndex>]...` (the
 * tile's actual position in the dashboard's top-level `filters` array).
 *
 * @internal
 * @param filterIndex - Position of the filter tile in the dashboard's top-level `filters` array
 * @returns A function that remaps a translation error's path to that position
 */
function remapSingleFilterErrorPath(
  filterIndex: number,
): (error: NlqTranslationError) => NlqTranslationError {
  return (error) => ({
    ...error,
    path: error.path.replace(/^filters\[0\]/, `filters[${filterIndex}]`),
  });
}

/**
 * Resolves which supplied context matches a target data source title.
 *
 * When no title is given (neither the widget nor the dashboard specifies one) and exactly one
 * context was supplied, that single context is used — preserves single-datasource behavior
 * where nothing in the JSON needs to name its data source. Otherwise the title must match exactly
 * one supplied context's `dataSource.title` — two contexts sharing a title is treated the same as
 * no match (ambiguous), never silently resolved against an arbitrary one of them — so a
 * multi-datasource dashboard never silently resolves a widget or filter against the wrong schema.
 */
function resolveDataSchemaContext(
  contexts: readonly DataSchemaContext[],
  targetDataSource: string | undefined,
): DataSchemaContext | undefined {
  if (targetDataSource !== undefined) {
    const matches = contexts.filter((context) => context.dataSource.title === targetDataSource);
    return matches.length === 1 ? matches[0] : undefined;
  }
  return contexts.length === 1 ? contexts[0] : undefined;
}

/**
 * Translates NLQ DashboardJSON format to CSDK DashboardProps.
 * Direction: JSON → CSDK
 *
 * Translates each widget using `translateWidgetFromJSON` (which requires each widget JSON to
 * have an `id`). Each widget is resolved against the {@link DataSchemaContext} matching its own
 * `dataSource` (falling back to `dashboardJSON.defaultDataSource`), since widgets can span
 * multiple data sources. Each dashboard-level filter tile is translated independently and
 * resolved against the context matching its own `dataSource` when tagged (see
 * `DashboardFilterWithDataSourceJSON`), falling back to `dashboardJSON.defaultDataSource`
 * otherwise, then merged back together — since a filter panel can also span multiple data
 * sources.
 *
 * Translation fails if any widget or filter translation fails, or if a widget's or a filter's
 * data source doesn't match any supplied context.
 *
 * @param input - DashboardInput containing dashboardJSON and the multi-data-source schema context
 * @returns NlqTranslationResult with DashboardProps or errors
 * @internal
 */
export const translateDashboardFromJSON = (
  input: DashboardInput,
): NlqTranslationResult<DashboardProps> => {
  const { data: dashboardJSON, context: contexts } = input;

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
      const widgetDataSource = 'dataSource' in widgetJSON ? widgetJSON.dataSource : undefined;
      const targetDataSource = widgetDataSource ?? dashboardJSON.defaultDataSource;
      const context = resolveDataSchemaContext(contexts, targetDataSource);
      if (!context) {
        translationErrors.push({
          path: `widgets[${widgetIndex}]`,
          input: widgetJSON,
          message:
            targetDataSource !== undefined
              ? `No data schema context found for data source '${targetDataSource}'.`
              : 'Widget has no data source, and no unambiguous default context was supplied ' +
                '(multiple contexts given, none marked as default).',
        });
        return;
      }

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

  // Translate dashboard-level filters — each tile independently, then merged, since a filter
  // panel can span multiple data sources just like the widgets above.
  let filters: Filter[] | FilterRelations | null = null;
  if (dashboardJSON.filters && dashboardJSON.filters.length > 0) {
    const schemaIndexByContext = new Map<DataSchemaContext, SchemaIndex>();
    let merged: Filter[] | FilterRelations = [];
    let hasFilterErrors = false;

    dashboardJSON.filters.forEach((entry, filterIndex) => {
      const tagged = isDashboardFilterWithDataSource(entry);
      const targetDataSource =
        (tagged ? entry.dataSource : undefined) ?? dashboardJSON.defaultDataSource;
      const context = resolveDataSchemaContext(contexts, targetDataSource);
      if (!context) {
        hasFilterErrors = true;
        translationErrors.push({
          path: `filters[${filterIndex}]`,
          input: entry,
          message:
            targetDataSource !== undefined
              ? `No data schema context found for data source '${targetDataSource}'.`
              : 'Filter has no data source, and no unambiguous default context was supplied ' +
                '(multiple contexts given, none marked as default).',
        });
        return;
      }

      let schemaIndex = schemaIndexByContext.get(context);
      if (!schemaIndex) {
        schemaIndex = createSchemaIndex(context.tables);
        schemaIndexByContext.set(context, schemaIndex);
      }

      const functionCall = tagged ? entry.filter : entry;
      const result = translateFiltersFromJSON({
        data: [functionCall],
        context: { dataSource: context.dataSource, schemaIndex },
      });
      if (!result.success) {
        hasFilterErrors = true;
        translationErrors.push(
          ...mapTranslationErrors(result.errors, remapSingleFilterErrorPath(filterIndex)),
        );
        return;
      }
      merged = mergeTranslatedFilters(merged, result.data);
    });

    filters = hasFilterErrors ? null : merged;
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
