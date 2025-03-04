/**
 * Checks if a given string is a valid numeric representation,
 * including integers, decimals, and numbers in scientific notation.
 *
 * Supported formats:
 * - Integers: "123", "-456"
 * - Decimals: "3.14", "-0.001", ".5", "10."
 * - Scientific notation: "1e3", "-2.5E-2", "3.14e+10"
 */
export function isNumericString(str: string): boolean {
  return /^[+-]?(\d+(\.\d*)?|\.\d+)([eE][+-]?\d+)?$/.test(str);
}
