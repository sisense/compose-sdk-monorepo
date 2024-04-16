import { ExpandedQueryModel, SimpleQueryModel } from './types';

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
    throw Error('Empty model');
  } else if (!model.metadata) {
    throw Error('Missing metadata');
  } else if (!model.model) {
    throw Error('Missing model title');
  }

  return model;
}

export function isEmptyQueryModel(queryModel: ExpandedQueryModel | undefined | null): boolean {
  return !queryModel || !queryModel.jaql.datasource.title || !queryModel.jaql.metadata.length;
}
