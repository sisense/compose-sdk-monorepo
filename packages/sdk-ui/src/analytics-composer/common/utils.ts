import { TranslatableError } from '@/translation/translatable-error';
import { ExpandedQueryModel, SimpleQueryModel } from '../types.js';

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

export function escapeSingleQuotes(str?: string) {
  if (!str) {
    return str;
  }
  // Replace single quotes with escaped single quotes
  // Only when the single quote is not preceded by a backslash
  return str.replace(/(?<!\\)'/g, "\\'");
}
