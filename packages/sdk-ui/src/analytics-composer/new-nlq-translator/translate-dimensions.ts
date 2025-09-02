import { Attribute, JaqlDataSourceForDto, JSONArray } from '@sisense/sdk-data';
import { NormalizedTable } from '../types.js';
import { createAttribute } from './common.js';

function isStringArray(value: JSONArray): value is string[] {
  return value.every((item) => typeof item === 'string');
}

export const translateDimensionsJSON = (
  dimensionsJSON: JSONArray,
  dataSource: JaqlDataSourceForDto,
  tables: NormalizedTable[],
): Attribute[] => {
  if (!dimensionsJSON) {
    return [];
  }
  if (!isStringArray(dimensionsJSON)) {
    throw new Error('Invalid dimensions JSON. Expected an array of strings.');
  }
  return dimensionsJSON.map((dimension) => {
    return createAttribute(dimension, dataSource, tables);
  });
};
