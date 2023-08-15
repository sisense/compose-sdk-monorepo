import {
  Attribute,
  CalculatedMeasureColumn,
  Column,
  Measure,
  MeasureColumn,
} from '@sisense/sdk-data';
import {
  Category,
  Value,
  StyledColumn,
  StyledMeasureColumn,
  isMeasureColumn,
  AnyColumn,
} from './types';

type AnyObject = Record<string, any>;

/**
 * Combines the properties of two objects, where:
 *  - properties from "sourceToInherit" will be inherited by the result object.
 *  - properties from "sourceToAbsorb" will be copied into the result object.
 * Properties from "sourceToAbsorb" will safely override properties with the same name from "sourceToInherit" without modifying the original object.
 *
 * @param sourceToInherit - The object whose properties will be inherited.
 * @param sourceToAbsorb - The object whose properties will be copied as own properties.
 * @returns - A new object that combines the properties of the two input objects.
 */
const safeMerge = (sourceToInherit: AnyObject, sourceToAbsorb: AnyObject): AnyObject => {
  return Object.assign(Object.create(sourceToInherit), sourceToAbsorb) as AnyObject;
};

export const translateColumnToCategory = (c: StyledColumn | Column): Category => {
  const isStyledColumn = 'column' in c;
  const column = isStyledColumn ? c.column : c;
  const style = isStyledColumn ? c : {};

  return safeMerge(column, style) as Category;
};

export const translateColumnToValue = (
  c: MeasureColumn | CalculatedMeasureColumn | StyledMeasureColumn,
): Value => {
  const isStyledColumn = 'column' in c;
  const column = isStyledColumn ? c.column : c;
  const style = isStyledColumn ? c : {};

  const value = safeMerge(column, {
    ...style,
    title: (c as Value).title ?? column.title ?? column.name,
    enabled: true,
  }) as Value;

  value.aggregation = value.aggregation || 'sum';
  return value;
};

export const translateColumnToCategoryOrValue = (value: AnyColumn) => {
  return isMeasureColumn(value) ? translateColumnToValue(value) : translateColumnToCategory(value);
};

export const translateMeasureToValue = (measure: Measure) => measure as unknown as Value;
export const translateAttributeToCategory = (attribute: Attribute) => attribute as Category;

export const translateValueToMeasure = (value: Value) => value as unknown as Measure;
export const translateCategoryToAttribute = (category: Category) => category as Attribute;

export const getDataOptionTitle = (option: Category | Value) => {
  return (option as Value).title ?? option.name;
};
