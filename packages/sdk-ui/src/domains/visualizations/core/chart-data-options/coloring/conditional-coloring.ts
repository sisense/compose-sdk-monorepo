import { AbsoluteColoringFunction } from '.';
import {
  ConditionalDataColorOptions,
  DataColorCondition,
  DataColorOptions,
} from '../../../../../types';

/**
 * Returns a transformer that replaces formula-driven conditions' `expression` with
 * their resolved numeric value (see `DataColorCondition.valueMeasure`), keyed by
 * `valueMeasure.name` — read live rather than cached, since the query's unique-naming step
 * may rename the measure in place after it was added to a condition. A formula-driven
 * condition whose value is missing from `resolvedValues` is dropped, since an unresolved
 * threshold cannot be meaningfully compared against.
 *
 * @param resolvedValues - Resolved numeric values keyed by measure name.
 * @returns A transformer producing a copy of `colorOptions` with resolved condition values.
 * @internal
 */
export const withResolvedConditionValues =
  (resolvedValues: Readonly<Record<string, number>> | undefined) =>
  (colorOptions: Readonly<DataColorOptions>): DataColorOptions => {
    if (typeof colorOptions === 'string' || colorOptions.type !== 'conditional') {
      return colorOptions;
    }

    const conditions = (colorOptions.conditions ?? []).flatMap((condition) => {
      if (!condition.valueMeasure) {
        return [condition];
      }
      const resolvedValue = resolvedValues?.[condition.valueMeasure.name];
      return resolvedValue === undefined
        ? []
        : [{ ...condition, expression: String(resolvedValue) }];
    });

    return { ...colorOptions, conditions };
  };

/**
 * Retrieves the conditional coloring function based on the provided color options.
 *
 * @param colorOpts - The color options for conditional coloring.
 * @returns The conditional coloring function.
 */
export function getConditionalColoringFunction(
  colorOpts: ConditionalDataColorOptions,
): AbsoluteColoringFunction {
  const conditions = (colorOpts.conditions ?? []).map((condition) => ({
    match: getConditionMatcherFn(condition),
    color: condition.color,
  }));

  return (value: number) => {
    const rightCondition = conditions.find((condition) => condition.match(value));
    if (rightCondition) {
      return rightCondition.color;
    }
    return colorOpts.defaultColor;
  };
}

/**
 * Retrieves the condition matcher function based on the provided condition.
 *
 * @param condition - The color condition.
 * @returns The condition matcher function.
 */

// eslint-disable-next-line complexity
function getConditionMatcherFn(condition: DataColorCondition) {
  const expression = Number(condition.expression);
  switch (condition.operator) {
    case '<':
      return (value: number) => value < expression;
    case '>':
      return (value: number) => value > expression;
    case '≤':
    case '<=':
      return (value: number) => value <= expression;
    case '≥':
    case '>=':
      return (value: number) => value >= expression;
    case '=':
      return (value: number) => value == expression;
    case '≠':
    case '!=':
      return (value: number) => value != expression;
    default:
      return () => true;
  }
}
