import { AbsoluteColoringFunction } from '.';
import { ConditionalDataColorOptions, DataColorCondition } from '../../types';

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
