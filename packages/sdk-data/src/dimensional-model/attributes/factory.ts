import { withComposeCodeForAttribute } from '../compose-code-utils.js';
import { Attribute, CustomFormulaContext } from '../interfaces.js';
import { DimensionalCalculatedAttribute } from './attributes.js';

/**
 * Creates a calculated attribute (a formula-based {@link Attribute}) from a valid custom formula.
 *
 * This is the attribute counterpart of {@link @sisense/sdk-data!measureFactory.customFormula | measureFactory.customFormula}:
 * the resulting element is consumed as an attribute (for example, in the `category`/`breakBy` of a
 * chart's data options, or in `dimensions` of a query) and produces categorical/grouping values
 * rather than an aggregated number.
 *
 * Use square brackets (`[]`) within the `formula` to reference attributes. Each unique reference
 * must be defined using a `property:value` pair in the `context` parameter. Supported functions
 * include string functions (for example `Concat`, `Left`, `Right`) and conditional expressions
 * (`IF`, `CASE`).
 * See full list of supported [dashboard functions](https://docs.sisense.com/main/SisenseLinux/dashboard-functions-reference.htm#String) for calculated attributes.
 *
 * Only `text` data type is supported for calculated attributes.
 *
 * @example
 * Combine two attributes into a single text attribute.
 * ```ts
 * const ageAndGender = attributeFactory.customFormula(
 *   'Age & Gender',
 *   'Concat([ageRange], " ", [gender])',
 *   {
 *     ageRange: DM.Commerce.AgeRange,
 *     gender: DM.Commerce.Gender,
 *   },
 * );
 * ```
 *
 * Bucket a numeric attribute into named groups with a `CASE` expression.
 * ```ts
 * const ageGroup = attributeFactory.customFormula(
 *   'Age Group',
 *   "CASE WHEN [ageRange] = '0-18' THEN 'Minor' WHEN [ageRange] = '65+' THEN 'Senior' ELSE 'Adult' END",
 *   { ageRange: DM.Commerce.AgeRange },
 * );
 * ```
 *
 * @param title - Title of the calculated attribute to be displayed
 * @param formula - Formula used to compute the attribute's values
 * @param context - Formula context as a map of names to attributes (and, in advanced cases, measures or filters)
 * @returns A calculated attribute instance

 * @group Factories
 */
export const customFormula: (
  title: string,
  formula: string,
  context: CustomFormulaContext,
) => Attribute = withComposeCodeForAttribute((title, formula, context) => {
  // context keys must be wrapped in brackets to match the references used in the formula
  const newContext = Object.fromEntries(
    Object.entries(context ?? {}).map(([key, value]) => [
      key.startsWith('[') ? key : `[${key}]`,
      value,
    ]),
  );

  return new DimensionalCalculatedAttribute(title, formula, newContext);
}, 'customFormula');
