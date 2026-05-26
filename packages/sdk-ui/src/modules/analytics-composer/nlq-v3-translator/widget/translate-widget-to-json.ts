import type { WidgetProps } from '@/domains/widgets/components/widget/types.js';

import type { NlqTranslationError, NlqTranslationResult } from '../../types.js';
import { translateChartToJSON } from '../chart/translate-chart-to-json.js';
import {
  translateFiltersToJSON,
  translateHighlightsToJSON,
} from '../constructs/filters/translate-filters-to-json.js';
import { translatePivotTableToJSON } from '../pivot-table/translate-pivot-table-to-json.js';
import {
  collectTranslationErrors,
  stripDelimitersFromJson,
  translateDataSourceToJSON,
} from '../shared/utils/translation-helpers.js';
import type { CustomWidgetJSON, WidgetJSON } from '../types.js';

/**
 * Translates CSDK widget props to NLQ WidgetJSON format.
 * Direction: CSDK → JSON
 *
 * Dispatches to the appropriate sub-translator based on `widgetType`:
 * - `'chart'` → `translateChartToJSON`
 * - `'pivot'` → `translatePivotTableToJSON`
 * - `'text'` → pass-through of styleOptions
 * - `'custom'` → filters/highlights translated; dataOptions passed through as opaque JSON
 *
 * @param widgetProps - Widget props with widgetType discriminant (id required)
 * @returns NlqTranslationResult with WidgetJSON or errors
 * @internal
 */
export const translateWidgetToJSON = (
  widgetProps: WidgetProps,
): NlqTranslationResult<WidgetJSON> => {
  const { widgetType } = widgetProps;

  switch (widgetType) {
    case 'chart': {
      const result = translateChartToJSON(widgetProps);
      if (!result.success) return result;
      const chartWidgetJSON: Extract<WidgetJSON, { widgetType: 'chart' }> = {
        ...result.data,
        widgetType: 'chart',
        id: widgetProps.id,
        ...(widgetProps.title !== undefined && { title: widgetProps.title }),
        ...(widgetProps.description !== undefined && { description: widgetProps.description }),
        ...(widgetProps.dataSource !== undefined && {
          dataSource: translateDataSourceToJSON(widgetProps.dataSource),
        }),
        ...(widgetProps.config !== undefined && { config: widgetProps.config }),
        ...(widgetProps.highlightSelectionDisabled !== undefined && {
          highlightSelectionDisabled: widgetProps.highlightSelectionDisabled,
        }),
      };
      return {
        success: true,
        data: stripDelimitersFromJson(chartWidgetJSON),
      };
    }

    case 'pivot': {
      const result = translatePivotTableToJSON(widgetProps);
      if (!result.success) return result;
      const pivotTableWidgetJSON: Extract<WidgetJSON, { widgetType: 'pivot' }> = {
        ...result.data,
        widgetType: 'pivot',
        id: widgetProps.id,
        ...(widgetProps.title !== undefined && { title: widgetProps.title }),
        ...(widgetProps.description !== undefined && { description: widgetProps.description }),
        ...(widgetProps.dataSource !== undefined && {
          dataSource: translateDataSourceToJSON(widgetProps.dataSource),
        }),
        ...(widgetProps.config !== undefined && { config: widgetProps.config }),
      };
      return {
        success: true,
        data: stripDelimitersFromJson(pivotTableWidgetJSON),
      };
    }

    case 'text': {
      const textJSON: Extract<WidgetJSON, { widgetType: 'text' }> = {
        widgetType: 'text',
        id: widgetProps.id,
        styleOptions: widgetProps.styleOptions,
        ...(widgetProps.config !== undefined && { config: widgetProps.config }),
      };
      return { success: true, data: textJSON };
    }

    case 'custom': {
      const translationErrors: NlqTranslationError[] = [];

      const filtersJSON =
        widgetProps.filters !== undefined
          ? collectTranslationErrors(
              () => translateFiltersToJSON(widgetProps.filters),
              translationErrors,
            )
          : undefined;

      const highlightsJSON =
        widgetProps.highlights !== undefined
          ? collectTranslationErrors(
              () => translateHighlightsToJSON(widgetProps.highlights),
              translationErrors,
            )
          : undefined;

      if (translationErrors.length > 0) {
        return { success: false, errors: translationErrors };
      }

      const customJSON: Extract<WidgetJSON, { widgetType: 'custom' }> = {
        widgetType: 'custom',
        customWidgetType: widgetProps.customWidgetType,
        id: widgetProps.id,
        ...(widgetProps.title !== undefined && { title: widgetProps.title }),
        ...(widgetProps.description !== undefined && { description: widgetProps.description }),
        ...(widgetProps.dataSource !== undefined && {
          dataSource: translateDataSourceToJSON(widgetProps.dataSource),
        }),
        ...(widgetProps.config !== undefined && { config: widgetProps.config }),
        ...(widgetProps.dataOptions !== undefined && {
          dataOptions: widgetProps.dataOptions as Record<string, unknown>,
        }),
        ...(widgetProps.styleOptions !== undefined && { styleOptions: widgetProps.styleOptions }),
        ...(widgetProps.customOptions !== undefined && {
          customOptions: widgetProps.customOptions,
        }),
        ...(filtersJSON &&
          filtersJSON.length > 0 && {
            filters: filtersJSON as CustomWidgetJSON['filters'],
          }),
        ...(highlightsJSON &&
          highlightsJSON.length > 0 && {
            highlights: highlightsJSON as CustomWidgetJSON['highlights'],
          }),
      };

      return { success: true, data: customJSON };
    }

    default: {
      return {
        success: false,
        errors: [
          {
            path: 'widgetType',
            input: widgetProps,
            message: `Unknown widgetType: ${String(widgetType)}`,
          },
        ],
      };
    }
  }
};
