/**
 * All possible color options for data.
 *
 * @see {@link https://docs.sisense.com/main/SisenseLinux/selecting-colors-in-widgets.htm | Selecting Colors in Widgets}
 */
export type DataColorOptions =
  | string
  | UniformDataColorOptions
  | RangeDataColorOptions
  | ConditionalDataColorOptions;

/**
 * Uniform color options for data similar to the Single Color option in the Sisense UI.
 *
 * @example
 * An example of specifying red as a uniform color for all data values.
 *
 * ```ts
 * {
 *   type: 'uniform',
 *   color: 'red',
 * }
 * ```
 * @see {@link https://docs.sisense.com/main/SisenseLinux/selecting-colors-in-widgets.htm | Selecting Colors in Widgets}
 */
export type UniformDataColorOptions = {
  /**
   * Color options type
   */
  type: 'uniform';
  /**
   * Color name, e.g., `red`, or a hexadecimal value, e.g., `#ff0000`.
   */
  color: string;
};

/**
 * Range color options for data similar to the Range option in the Sisense UI.
 *
 * Use `minColor` and `maxColor` to define the start and end color of the range.
 * A color name (for example, `red`), or a hexadecimal value (for example, `#ff0000`) can be specified.
 *
 * By default, the color range is set to match the minimum and maximum values of the data.
 * You can also override the default value range by
 * setting the `minValue`, `midValue`, and `maxValue` properties.
 *
 * @example
 * An example of specifying colors for data values ranging
 * from red (for min value) to blue (for max value)
 * with 2 more colors in between for a total of 4 colors:
 *
 * ```ts
 * {
 *   type: 'range',
 *   steps: 4,
 *   minColor: 'red',
 *   maxColor: 'blue',
 * }
 * ```
 * @see {@link https://docs.sisense.com/main/SisenseLinux/selecting-colors-in-widgets.htm | Selecting Colors in Widgets}
 */
export type RangeDataColorOptions = {
  /**
   * Color options type
   */
  type: 'range';
  /**
   * Distinct number of colors in the range
   */
  steps?: number;
  /**
   * Start color of the range
   */
  minColor?: string;
  /**
   * End color of the range
   */
  maxColor?: string;
  /**
   * Minimum value explicitly set to override the minimum value of the data
   */
  minValue?: number;
  /**
   * Middle value explicitly set to override the middle value of the data
   */
  midValue?: number;
  /**
   * Maximum value explicitly set to override the maximum value of the data
   */
  maxValue?: number;
};

/**
 * Conditional color options for data similar to the Conditional Color option in the Sisense UI.
 *
 * This option allows you to define color conditions.
 * Each condition is a logical expression that defines how data values are mapped into colors.
 * These conditions are evaluated in the order in which they appear in the array.
 *
 * @example
 * An example of a condition stating that a negative data value is displayed in red
 * and another condition stating that a positive data value is green.
 *
 * ```ts
 * {
 *   type: 'conditional',
 *   conditions: [
 *     { color: 'red', expression: '0', operator: '<' },
 *     { color: 'green', expression: '0', operator: '>=' },
 *   ],
 *   defaultColor: 'red',
 * }
 * ```
 * @see {@link https://docs.sisense.com/main/SisenseLinux/selecting-colors-in-widgets.htm | Selecting Colors in Widgets}
 */
export type ConditionalDataColorOptions = {
  /**
   * Color options type
   */
  type: 'conditional';
  /**
   * Array of color conditions
   */
  conditions?: DataColorCondition[];
  /**
   * Default color when no condition is met
   */
  defaultColor?: string;
};

/**
 * Color condition for {@link ConditionalDataColorOptions} represented as a logical expression.
 *
 * See {@link ConditionalDataColorOptions} for examples.
 *
 * @see {@link https://docs.sisense.com/main/SisenseLinux/selecting-colors-in-widgets.htm | Selecting Colors in Widgets}
 */
export type DataColorCondition = {
  /**
   * Color for this condition
   */
  color: string;
  /**
   * Expression representing the data value
   */
  expression: string;
  /**
   * Supported operators for `expression`
   */
  operator: '<' | '>' | '≤' | '<=' | '≥' | '>=' | '=' | '≠' | '!=';
};
