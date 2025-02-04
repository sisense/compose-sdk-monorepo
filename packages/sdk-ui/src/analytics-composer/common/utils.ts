import { TranslatableError } from '@/translation/translatable-error';
import { ExpandedQueryModel, SimpleQueryModel } from '../types.js';
import { ChartWidgetProps, PivotTableWidgetProps } from '@/props';
import { ExecuteQueryParams, ExecutePivotQueryParams } from '@/query-execution';
import {
  ALL_CHART_TYPES,
  DynamicChartType,
} from '../../chart-options-processor/translations/types.js';

export function toKebabCase(str: string): string {
  return str
    .replace(/\s+/g, '-') // Replace whitespace with hyphens
    .replace(/([a-z])([A-Z])/g, '$1-$2') // Convert camelCase to kebab-case
    .toLowerCase(); // Convert to lowercase
}

export function capitalizeFirstLetter(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Sanitize ID of a dimension
 *
 * @param str - input string
 * @return sanitized ID
 */
export function sanitizeDimensionId(str: string) {
  // Regular expression pattern to match [table.column (Calendar)]
  const regex = /\[(.+?)\s\(Calendar\)\]/;

  // Replace [table.column (Calendar)] with [table.column]
  return str.replace(regex, '[$1]').trim();
}

export function validateQueryModel(model: any): SimpleQueryModel {
  if (!model) {
    throw new TranslatableError('errors.emptyModel');
  } else if (!model.metadata) {
    throw new TranslatableError('errors.missingMetadata');
  } else if (!model.model) {
    throw new TranslatableError('errors.missingModelTitle');
  }

  return model;
}

export function isEmptyQueryModel(queryModel: ExpandedQueryModel | undefined | null): boolean {
  return !queryModel || !queryModel.jaql.datasource.title || !queryModel.jaql.metadata.length;
}

export function validateChartType(chartType: DynamicChartType | 'pivot' | 'pivot2') {
  const ALLOWED_TYPES = [...ALL_CHART_TYPES, 'pivot', 'pivot2'] as const;

  if (!ALLOWED_TYPES.includes(chartType))
    throw new TranslatableError('errors.chartTypeNotSupported', { chartType });
}

function isPivotTableWidgetPropsLocal(props: any): props is PivotTableWidgetProps {
  return 'widgetType' in props && props.widgetType === 'pivot';
}

export function checkIfMeasuresExist(
  props: ChartWidgetProps | PivotTableWidgetProps | ExecuteQueryParams | ExecutePivotQueryParams,
): boolean {
  const hasMeasuresOrValues =
    ('measures' in props && isNonEmptyArray(props.measures as [])) ||
    ('values' in props && isNonEmptyArray(props.values as []));

  // for pivot table widget
  if (isPivotTableWidgetPropsLocal(props)) {
    return 'values' in props.dataOptions && isNonEmptyArray(props.dataOptions.values as []);
  }

  if ('chartType' in props) {
    if (props.chartType === 'scatter') {
      return (
        'x' in props.dataOptions &&
        'y' in props.dataOptions &&
        (props.dataOptions.x !== undefined || props.dataOptions.y !== undefined)
      );
    }
    if (props.chartType === 'scattermap')
      return 'geo' in props.dataOptions && isNonEmptyArray(props.dataOptions.geo);
    return 'value' in props.dataOptions && isNonEmptyArray(props.dataOptions.value as []);
  }

  return hasMeasuresOrValues;
}

export function isNonEmptyArray<T>(array: T[]): boolean {
  return Array.isArray(array) && array.length > 0;
}

/**
 * Removes the first empty line or string if the next line contains "import *" or "import {".
 *
 * The `stringifyExtraImports` function can return an empty string if there are no measures or filters, then
 * `filterFactory` or `measureFactory` are not required for import.
 * In our code templates, we use the `{{extraImportsString}}` placeholder, and
 * if it is replaced with an empty string, our tests may break.
 * This function ensures that such invalid empty lines before imports are removed to maintain proper formatting.
 *
 * @param input - the populated template
 * @returns The modified string with the first empty line removed if the next line contains "import *" or "import {". If no such condition is met, the input remains unchanged.
 */
export function removeEmptyLineBeforeImport(input: string) {
  const lines = input.split('\n');

  for (let i = 0; i < lines.length - 1; i++) {
    if (lines[i].trim() === '') {
      // Check if the current line is empty
      const nextLine = lines[i + 1].trim();
      // Check if the next line contains "import *" or "import {"
      if (nextLine.startsWith('import *') || nextLine.startsWith('import {')) {
        lines.splice(i, 1); // Remove the empty line
        break; // Stop after removing the first match
      }
    }
  }

  return lines.join('\n');
}
