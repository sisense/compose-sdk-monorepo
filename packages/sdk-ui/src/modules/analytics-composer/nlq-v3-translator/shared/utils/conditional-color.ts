/**
 * A conditional `color` style. Its rules may carry a formula-driven threshold in `valueMeasure`.
 *
 * Rules are unchecked, so a rule may be null.
 *
 * @typeParam TCondition - Shape of a rule: a runtime condition or its JSON form.
 */
export type ConditionalColor<TCondition> = {
  type: 'conditional';
  conditions: (TCondition | null | undefined)[];
};

/**
 * Checks whether a measure column's `color` style is a conditional one with a list of rules.
 * Only the `type` and the list are checked, not the shape of each rule.
 *
 * @param color - The `color` style of a measure column.
 * @returns True when the style is conditional.
 */
export function isConditionalColor<TCondition extends object>(
  color: unknown,
): color is ConditionalColor<TCondition> {
  return (
    typeof color === 'object' &&
    color !== null &&
    'type' in color &&
    color.type === 'conditional' &&
    'conditions' in color &&
    Array.isArray(color.conditions)
  );
}
