/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable complexity */
/* eslint-disable sonarjs/cognitive-complexity */
import { numericFormatter } from 'react-number-format';
import round from 'lodash/round';

// If decimalScale = 3, keep 3 digits after the decimal point, e.g. 1.000,
// when decimalScale = 'auto', use decimal 2
export type DecimalScale = number | 'auto';

export type NumberFormatConfig = {
  name: 'Numbers' | 'Currency' | 'Percent';
  decimalScale: DecimalScale;
  trillion: boolean; // e.g. 1T
  billion: boolean; // 1B
  million: boolean; // 1M
  kilo: boolean; // 1K
  thousandSeparator: boolean; // if true, show the thousand separator, e.g. 1,000 if false 1000
  // symbol and prefix are used together, if prefix is true,
  // append the symbol in front of the number, e.g. symbol is $ -> $1000
  // if prefix is false, append the symbol after the number, e.g. symbol is ¥ -> 1000¥
  prefix: boolean;
  symbol: string;
};

const oneKilo = 1000;
const oneMillion = oneKilo * 1000;
const oneBillion = oneMillion * 1000;
const oneTrillion = oneBillion * 1000;

export const defaultConfig: NumberFormatConfig = {
  name: 'Numbers',
  decimalScale: 'auto',
  trillion: true,
  billion: true,
  million: true,
  kilo: true,
  thousandSeparator: true,
  prefix: true,
  symbol: '$',
};

export const applyFormatStaticMarkup = (config: NumberFormatConfig, value: number) => {
  return isNaN(value) ? `` : `<span>${applyFormat(config, value)}</span>`;
};

/**
 * Rounds a number to a specified decimal scale.
 *
 * Positive numbers are rounded up if the fractional part is greater than or equal to 0.5, and rounded down otherwise.
 * Negative numbers are rounded up if the fractional part is less than -0.5, and rounded down otherwise.
 *
 * @example
 * roundNumber(1.25, 1);
 * // Returns 1.3
 *
 * roundNumber(1.249, 1);
 * // Returns 1.2
 *
 * roundNumber(-1.249, 1);
 * // Returns -1.2
 *
 * roundNumber(-1.25, 1);
 * // Returns -1.3
 * @param value - The number to round.
 * @param decimalScale - The decimal scale to round to.
 * @returns The rounded number.
 */
const roundNumber = (value: number, decimalScale: number) => {
  return Math.sign(value) * round(Math.abs(value), decimalScale);
};

export const applyFormat = (config: NumberFormatConfig, value: number) => {
  // This method takes a NumberFormatConfig and turns a value into a formatted React component
  // such as <span>{'$1,000.00'}</span>

  // If fixedDecimalScale is true, it adds 0 to match given decimalScale,
  // please see https://www.npmjs.com/package/react-number-format
  const fixedDecimalScale = config.decimalScale !== 0 && config.decimalScale !== 'auto';
  const decimalScale = config.decimalScale === 'auto' ? 2 : config.decimalScale;

  let thousandSeparator: true | undefined = true; // In the 'react-number-format' library, thousandSeparator prop only takes true and undefined
  if (config.name === 'Numbers' && !config.thousandSeparator) {
    thousandSeparator = undefined;
  }

  let prefix: string | undefined = undefined;
  let suffix: string | undefined = undefined;
  let newValue = value;
  if (config.name === 'Percent') {
    suffix = '%';
    newValue = value * 100.0;
  }

  if (config.name === 'Numbers' || config.name === 'Currency') {
    if (config.trillion && Math.abs(value) / oneTrillion >= 1) {
      newValue = value / oneTrillion;
      suffix = 'T';
    } else if (config.billion && Math.abs(value) / oneBillion >= 1) {
      newValue = value / oneBillion;
      suffix = 'B';
    } else if (config.million && Math.abs(value) / oneMillion >= 1) {
      newValue = value / oneMillion;
      suffix = 'M';
    } else if (config.kilo && Math.abs(value) / oneKilo >= 1) {
      newValue = value / oneKilo;
      suffix = 'K';
    }
  }

  if (config.name === 'Currency') {
    if (config.prefix) {
      prefix = config.symbol;
    } else {
      if (suffix) {
        // if it already has suffix T,B,M, or K, then we put the dollar symbol after that
        suffix = `${suffix}${config.symbol}`;
      } else {
        suffix = config.symbol;
      }
    }
  }

  // Performs number rounding by `roundNumber` function to achieve rounding with correct fractional thresholds,
  // while `numericFormatter` simply truncates the decimal portion beyond `decimalScale`.
  return numericFormatter(`${roundNumber(newValue, decimalScale)}`, {
    displayType: 'text',
    thousandSeparator: thousandSeparator,
    fixedDecimalScale: fixedDecimalScale,
    decimalScale: decimalScale,
    prefix: prefix,
    suffix: suffix,
  });
};

export const applyFormatPlainText = (config: NumberFormatConfig, value: number) => {
  // This method returns a plain string such as '$12.5k'
  let markup = applyFormatStaticMarkup(config, value);
  markup = markup.replace('<span>', '');
  markup = markup.replace('</span>', '');
  return markup;
};
