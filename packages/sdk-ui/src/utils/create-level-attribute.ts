import { TFunction } from '@sisense/sdk-common';
import { DimensionalLevelAttribute, getColumnNameFromAttribute } from '@sisense/sdk-data';

import { generateAttributeName } from '@/utils/generate-attribute-name';

/**
 * Creates a level attribute from a base level attribute and a granularity
 *
 * @param baseLevelAttribute - The base level attribute
 * @param granularity - The granularity
 * @param t - The translation function
 * @returns The level attribute
 */
export function createLevelAttribute(
  baseLevelAttribute: DimensionalLevelAttribute,
  granularity: string,
  t?: TFunction,
): DimensionalLevelAttribute {
  // todo: change after adding 'title' support for Filter
  const columnName = getColumnNameFromAttribute(baseLevelAttribute);
  const name = t ? generateAttributeName(t, columnName, granularity) : columnName;

  return new DimensionalLevelAttribute(
    name,
    baseLevelAttribute.expression,
    granularity,
    DimensionalLevelAttribute.getDefaultFormatForGranularity(granularity),
    undefined,
    undefined,
    baseLevelAttribute.dataSource,
  );
}
