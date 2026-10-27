import {
  type CalculatedAttributeDataType,
  isCalculatedAttributeDataType,
  MetadataTypes,
} from '@sisense/sdk-data';

/** A single bracket reference that is the whole formula, e.g. `[A1]`. */
const SINGLE_REFERENCE = /^\s*(\[[^\]]+\])\s*$/;

/** A CASE result that is a single literal or reference, ending at the next WHEN, ELSE or END. */
const CASE_RESULT =
  /\b(?:THEN|ELSE)\s+('[^']*'|"[^"]*"|-?[\d.]+|\[[^\]]+\])\s*(?=\b(?:WHEN|ELSE|END)\b)/gi;

/** A formula that is exactly one CASE expression, with nothing around it. */
const WHOLE_CASE = /^\s*CASE\b[\s\S]*\bEND\s*$/i;

/** Every CASE keyword, to rule out nested or chained CASE expressions. */
const CASE_KEYWORD = /\bCASE\b/gi;

/** Every THEN or ELSE keyword, to tell whether each result was read. */
const CASE_RESULT_KEYWORD = /\b(?:THEN|ELSE)\b/gi;

const NUMBER_LITERAL = /^-?[\d.]+$/;

/** String literals, emptied before scanning so their contents are never read as keywords. */
const STRING_LITERAL = /'[^']*'|"[^"]*"/g;

/**
 * Returns the data type of a processed context element, when it can be told.
 *
 * @param element - A processed context value (attribute, calculated attribute or measure).
 * @returns The element's data type, or undefined when unknown.
 */
const dataTypeOfElement = (element: unknown): CalculatedAttributeDataType | undefined => {
  if (!element || typeof element !== 'object' || !('type' in element)) return undefined;
  const { type } = element;
  if (type === MetadataTypes.CalculatedAttribute) {
    const dataType = 'dataType' in element ? element.dataType : undefined;
    return isCalculatedAttributeDataType(dataType) ? dataType : undefined;
  }
  if (type === MetadataTypes.NumericAttribute) return 'numeric';
  if (type === MetadataTypes.TextAttribute) return 'text';
  if (type === MetadataTypes.DateLevel) return 'datetime';
  if (MetadataTypes.isMeasure(element)) return 'numeric';
  return undefined;
};

/**
 * Returns the data type of one CASE result value: a literal or a bracket reference.
 *
 * @param value - The raw result token.
 * @param context - Processed formula context.
 * @returns The value's data type, or undefined when unknown.
 */
const dataTypeOfValue = (
  value: string,
  context: Record<string, unknown>,
): CalculatedAttributeDataType | undefined => {
  if (value.startsWith("'") || value.startsWith('"')) return 'text';
  if (NUMBER_LITERAL.test(value)) return 'numeric';
  return dataTypeOfElement(context[value]);
};

/**
 * Infers a calculated dimension's result type from its formula, when the formula decides it.
 * Covers a bare column reference and a CASE whose results all share one type.
 *
 * @param formula - The calculated dimension's formula.
 * @param context - Processed formula context, keyed by bracket reference.
 * @returns The inferred data type, or undefined when the formula does not decide it.
 */
export const inferCalculatedDimensionDataType = (
  formula: string,
  context: Record<string, unknown>,
): CalculatedAttributeDataType | undefined => {
  const reference = SINGLE_REFERENCE.exec(formula)?.[1];
  if (reference) return dataTypeOfElement(context[reference]);

  // keywords inside quoted strings are text, not CASE syntax
  const code = formula.replace(STRING_LITERAL, "''");

  // a CASE wrapped in another expression (e.g. LEN(CASE ... END)) takes that expression's type
  if (!WHOLE_CASE.test(code) || [...code.matchAll(CASE_KEYWORD)].length !== 1) {
    return undefined;
  }

  // a result that is an expression (e.g. LEN([A])) cannot be typed here, so leave it open
  const results = [...code.matchAll(CASE_RESULT)];
  if (results.length !== [...code.matchAll(CASE_RESULT_KEYWORD)].length) return undefined;

  const resultTypes = results.map(([, value]) => dataTypeOfValue(value, context));
  const [first] = resultTypes;
  return first && resultTypes.every((type) => type === first) ? first : undefined;
};

/**
 * Resolves the data type to put on a calculated dimension: the type its formula decides wins
 * over a given one, which may be missing or wrong when generated.
 *
 * @param formula - The calculated dimension's formula.
 * @param context - Processed formula context.
 * @param given - The data type supplied with the formula, if any.
 * @returns The resolved data type, or undefined to keep the default.
 */
export const resolveCalculatedDimensionDataType = (
  formula: string,
  context: Record<string, unknown>,
  given: unknown,
): CalculatedAttributeDataType | undefined =>
  inferCalculatedDimensionDataType(formula, context) ??
  (isCalculatedAttributeDataType(given) ? given : undefined);
