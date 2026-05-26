import { convertDataSource } from '@sisense/sdk-data';

import type { WidgetProps } from '@/domains/widgets/components/widget/types.js';
import type { GenericDataOptions } from '@/types.js';

import type { NlqTranslationResult } from '../../types.js';
import { translateChartFromJSON } from '../chart/translate-chart-from-json.js';
import { translatePivotTableFromJSON } from '../pivot-table/translate-pivot-table-from-json.js';
import type { WidgetInput } from '../types.js';
import {
  hasRequiredWidgetId,
  missingWidgetIdError,
  toChartWidgetProps,
  toPivotTableWidgetProps,
  translateCustomWidgetFiltersFromJSON,
  translateEnvelopeWidgetFromJSON,
  validateWidgetType,
} from './helpers/index.js';

/**
 * Translates NLQ WidgetJSON format to CSDK widget props.
 * Direction: JSON → CSDK
 *
 * Dispatches to the appropriate sub-translator based on `widgetType`:
 * - `'chart'` → `translateChartFromJSON`
 * - `'pivot'` → `translatePivotTableFromJSON`
 * - `'text'` → pass-through (no data translation)
 * - `'custom'` → filters/highlights translated; dataOptions passed through as opaque JSON
 *
 *
 * @param input - WidgetInput containing widgetJSON and data schema context
 * @returns NlqTranslationResult with WidgetProps or errors
 * @internal
 */
export const translateWidgetFromJSON = (input: WidgetInput): NlqTranslationResult<WidgetProps> => {
  const { data: widgetJSON, context } = input;

  const widgetTypeError = validateWidgetType(widgetJSON);
  if (widgetTypeError) {
    return { success: false, errors: [widgetTypeError] };
  }

  if (!hasRequiredWidgetId(widgetJSON)) {
    return { success: false, errors: [missingWidgetIdError(widgetJSON)] };
  }

  switch (widgetJSON.widgetType) {
    case 'chart':
      return translateEnvelopeWidgetFromJSON(
        widgetJSON,
        context,
        translateChartFromJSON,
        toChartWidgetProps,
      );

    case 'pivot':
      return translateEnvelopeWidgetFromJSON(
        widgetJSON,
        context,
        translatePivotTableFromJSON,
        toPivotTableWidgetProps,
      );

    case 'text': {
      const textProps: Extract<WidgetProps, { widgetType: 'text' }> = {
        widgetType: 'text',
        id: widgetJSON.id,
        styleOptions: widgetJSON.styleOptions,
        ...(widgetJSON.config !== undefined && { config: widgetJSON.config }),
      };
      return { success: true, data: textProps };
    }

    case 'custom': {
      const {
        id,
        customWidgetType,
        title,
        description,
        dataSource,
        config,
        filters,
        highlights,
        dataOptions,
        styleOptions,
        customOptions,
      } = widgetJSON;

      const filtersResult = translateCustomWidgetFiltersFromJSON(filters, highlights, context);
      if (!filtersResult.success) {
        return filtersResult;
      }

      const customProps: Extract<WidgetProps, { widgetType: 'custom' }> = {
        widgetType: 'custom',
        id,
        customWidgetType,
        dataSource: dataSource !== undefined ? dataSource : convertDataSource(context.dataSource),
        dataOptions: (dataOptions ?? {}) as GenericDataOptions,
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(config !== undefined && { config }),
        ...(styleOptions !== undefined && { styleOptions }),
        ...(customOptions !== undefined && { customOptions }),
        ...filtersResult.data,
      };

      return { success: true, data: customProps };
    }

    default: {
      return {
        success: false,
        errors: [
          {
            path: 'widgetType',
            input: widgetJSON,
            message: `Unknown widgetType: ${String(
              (widgetJSON as { widgetType?: unknown }).widgetType,
            )}`,
          },
        ],
      };
    }
  }
};
