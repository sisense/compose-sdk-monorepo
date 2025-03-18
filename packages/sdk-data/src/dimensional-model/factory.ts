/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { MetadataTypes } from './types.js';
import { Element } from './interfaces.js';
import { DimensionalElement } from './base.js';

import { createMeasure } from './measures/measures.js';
import { createFilter } from './filters/filters.js';
import { createDimension } from './dimensions/index.js';
import { createAttribute } from './attributes.js';
import { TranslatableError } from '../translation/translatable-error.js';

/**
 * Generate an array of dimension model instances out of the given JSON array
 *
 * @param items - a JSON array  to create an elements from
 * @returns a dimensional model instances
 * @internal
 */
export function createAll(items: Array<any>): Element[] {
  return items.map((e) => <DimensionalElement>create(e));
}

/**
 * Generate a dimension model instance out of the given JSON object
 *
 * @param item - a JSON object to create an Element from
 * @returns a dimensional model instance
 * @internal
 */
export function create(item: any): Element | Element[] {
  if (Array.isArray(item)) {
    return createAll(item);
  }

  // todo: implement filter generation
  if (MetadataTypes.isFilter(item)) {
    return createFilter(item);
  } else if (MetadataTypes.isMeasure(item)) {
    return createMeasure(item);
  } else if (MetadataTypes.isAttribute(item)) {
    return createAttribute(item);
  }

  // dimension
  else if (
    MetadataTypes.isDimension(item) ||
    item.dim ||
    item.id ||
    item.type === 'dimension' ||
    item.attributes ||
    item.dimtype
  ) {
    return createDimension(item);
  }

  throw new TranslatableError('errors.unsupportedDimensionalElement');
}
