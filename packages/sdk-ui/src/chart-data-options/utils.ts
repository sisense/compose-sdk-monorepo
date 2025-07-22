import {
  Attribute,
  CalculatedMeasureColumn,
  Column,
  LevelAttribute,
  Measure,
  MeasureColumn,
  isDatetime,
  DimensionalLevelAttribute,
  JaqlElement,
  DateLevels,
} from '@sisense/sdk-data';
import { StyledColumn, StyledMeasureColumn, AnyColumn, CategoryStyle, ValueStyle } from './types';

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
export const safeMerge = <T extends AnyObject, S extends AnyObject>(
  sourceToInherit: T,
  sourceToAbsorb: S,
): T & S => {
  return Object.assign(Object.create(sourceToInherit), sourceToAbsorb) as T & S;
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

export const splitColumn = <C extends AnyColumn>(targetColumn: C) => {
  if (isStyledColumn(targetColumn)) {
    const { column, ...style } = targetColumn;
    return {
      column: column,
      style: style as CategoryStyle | ValueStyle,
    };
  }

  return {
    column: targetColumn,
    style: {} as CategoryStyle | ValueStyle,
  };
};

/**
 * Checks if the given argument is a measure column.
 *
 * @param arg
 * @internal
 */
export function isMeasureColumn(
  arg: AnyColumn,
): arg is MeasureColumn | CalculatedMeasureColumn | StyledMeasureColumn {
  const column = 'column' in arg ? arg.column : arg;
  const hasAggregation = 'aggregation' in column && !!column.aggregation;
  const hasContext = 'context' in column && !!(column as CalculatedMeasureColumn).context;
  const hasFormula = 'formula' in column && !!(column as JaqlElement).formula;

  if (hasAggregation || hasContext || hasFormula) {
    return true;
  }
  /**
   * Note: implicitly verifies that the column is a "measure" by checking that it is not
   * an "attribute" related column with a mandatory "type" property.
   */
  return !('type' in column);
}

/**
 * Returns the title of a column (data option).
 *
 * @param column - The column to get the title of.
 * @param name - The name of the column.
 * @returns The title of the column.
 */
export const getDataOptionTitle = ({ column, name }: StyledColumn | StyledMeasureColumn) => {
  // Use optional `name` property of styled column
  if (name) {
    return name;
  }

  // Use `title` property of measure column if it exists
  if ('title' in column && column.title) {
    return column.title;
  }

  // Default column name
  return column.name;
};

export const getDataOptionGranularity = ({ column, granularity }: StyledColumn) => {
  return granularity || (column as DimensionalLevelAttribute).granularity || DateLevels.Years;
};

/** @internal */
export const translateColumnToAttribute = (c: Column | StyledColumn) => {
  const { column: attribute } = splitColumn(c);
  return attribute as Attribute;
};

export const translateColumnToMeasure = (
  c: MeasureColumn | CalculatedMeasureColumn | StyledMeasureColumn,
) => {
  const { column: measure } = splitColumn(c);
  return measure as Measure;
};

/**
 * Checks if column is a StyledColumns.
 *
 * @param category - The target column to check.
 * @internal
 */
export function isStyledColumn(
  targetColumn: AnyColumn,
): targetColumn is StyledColumn | StyledMeasureColumn {
  return 'column' in targetColumn && targetColumn.column !== undefined;
}

/**
 * Checks if an category is a StyledCategory.
 *
 * @param category - The category to check.
 * @internal
 */
export function isCategoryStyle(category: Column | CategoryStyle): category is CategoryStyle {
  return !('column' in category);
}

export function normalizeColumn(targetColumn: Column | StyledColumn): StyledColumn {
  const { column, style } = splitColumn(targetColumn) as { column: Column; style: CategoryStyle };

  const levelDimensionDateFormat = isDatetime(column.type)
    ? (column as LevelAttribute)?.getFormat?.()
    : undefined;

  const dateFormat = style.dateFormat || levelDimensionDateFormat;

  const nColumn = {
    ...style,
    column,
  };

  if (dateFormat) {
    nColumn.dateFormat = dateFormat;
  }

  return nColumn;
}

export function normalizeMeasureColumn(
  targetColumn: MeasureColumn | CalculatedMeasureColumn | StyledMeasureColumn,
): StyledMeasureColumn {
  const { column, style } = splitColumn(targetColumn) as {
    column: MeasureColumn | CalculatedMeasureColumn;
    style: ValueStyle;
  };

  return {
    ...style,
    column: safeMerge(column, {
      title: column.title ?? column.name,
      aggregation: (column as MeasureColumn).aggregation ?? 'sum',
    }) as MeasureColumn,
    enabled: true,
  };
}

export function normalizeAnyColumn(targetColumn: AnyColumn) {
  return isMeasureColumn(targetColumn)
    ? normalizeMeasureColumn(targetColumn)
    : normalizeColumn(targetColumn);
}
