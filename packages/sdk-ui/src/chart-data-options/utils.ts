import {
  Attribute,
  CalculatedMeasureColumn,
  Column,
  LevelAttribute,
  Measure,
  MeasureColumn,
  isDatetime,
} from '@sisense/sdk-data';
import isEmpty from 'lodash/isEmpty';
import {
  Category,
  Value,
  StyledColumn,
  StyledMeasureColumn,
  isMeasureColumn,
  AnyColumn,
  CategoryStyle,
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

/**
 * Combines two objects into a single one with saving prototype inheritance of "sourceWithInheritance" argument
 *
 * @param sourceWithInheritance - The object that has own and inherited properties.
 * @param sourceToAbsorb - The object whose properties will be copied as own properties.
 * @returns - A new object that combines the properties of the two input objects.
 */
export const safeCombine = <T extends AnyObject>(
  sourceWithInheritance: T,
  sourceToAbsorb: AnyObject,
): T => {
  return Object.assign(
    Object.create(Object.getPrototypeOf(sourceWithInheritance)),
    sourceWithInheritance,
    sourceToAbsorb,
  ) as T;
};

export const splitColumn = (c: StyledColumn | Column) => {
  const isStyledColumn = 'column' in c;
  let column: Column = c as Column;
  let style: CategoryStyle | undefined;

  if (isStyledColumn) {
    const { column: extractedColumn, ...extractedStyle } = c;
    column = extractedColumn;
    if (!isEmpty(extractedStyle)) {
      style = extractedStyle;
    }
  }

  return {
    column,
    style,
  };
};

export const translateColumnToCategory = (c: StyledColumn | Column): Category => {
  const { column, style: baseStyle } = splitColumn(c);

  const levelDimensionDateFormat = isDatetime(column.type)
    ? (column as LevelAttribute)?.getFormat?.()
    : undefined;
  const style = { ...baseStyle, dateFormat: baseStyle?.dateFormat || levelDimensionDateFormat };

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

export const translateColumnToAttribure = (c: StyledColumn | Column) => {
  return translateCategoryToAttribute(translateColumnToCategory(c));
};
export const translateColumnToMeasure = (
  c: MeasureColumn | CalculatedMeasureColumn | StyledMeasureColumn,
) => {
  return translateValueToMeasure(translateColumnToValue(c));
};
