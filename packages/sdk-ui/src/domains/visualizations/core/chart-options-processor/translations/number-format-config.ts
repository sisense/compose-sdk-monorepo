/* eslint-disable @typescript-eslint/no-use-before-define */
import { numericFormatter } from 'react-number-format';

import round from 'lodash-es/round';

import { i18nextInstance } from '@/infra/translation/initialize-i18n';
import type { CompleteNumberFormatConfig, NumberFormatConfig } from '@/types';

const oneKilo = 1000;
const oneMillion = oneKilo * 1000;
const oneBillion = oneMillion * 1000;
const oneTrillion = oneBillion * 1000;

type NumberSeparators = { readonly thousand: string; readonly decimal: string };

const defaultSeparators: NumberSeparators = { thousand: ',', decimal: '.' };
const separatorsCache = new Map<string, NumberSeparators>();

const readSeparators = (locale: string): NumberSeparators => {
  try {
    // A well-formed but unsupported tag (e.g. `zz-ZZ`) does not throw: Intl falls back to the
    // runtime's default locale, which would leak the browser's separators.
    if (Intl.NumberFormat.supportedLocalesOf([locale]).length === 0) {
      return defaultSeparators;
    }
    // Seven digits: some locales (e.g. es-ES) skip grouping on four-digit numbers.
    const parts = new Intl.NumberFormat(locale).formatToParts(1234567.1);
    return {
      thousand: parts.find((part) => part.type === 'group')?.value ?? defaultSeparators.thousand,
      decimal: parts.find((part) => part.type === 'decimal')?.value ?? defaultSeparators.decimal,
    };
  } catch {
    // An invalid language tag makes Intl throw a RangeError.
    return defaultSeparators;
  }
};

/**
 * Returns the thousand and decimal separators used by the given locale.
 *
 * @param locale - BCP 47 locale tag, such as the current i18n language.
 * @returns The locale's separators, or `,` and `.` when the locale is invalid or unsupported.
 * @internal
 */
export const getNumberSeparators = (locale: string): NumberSeparators => {
  const cached = separatorsCache.get(locale);
  if (cached) {
    return cached;
  }
  const separators = readSeparators(locale);
  separatorsCache.set(locale, separators);
  return separators;
};

const defaultConfig: CompleteNumberFormatConfig = {
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

/**
 * Returns a complete NumberFormatConfig object with default values for missing properties.
 *
 * @param partialConfig - A partial NumberFormatConfig object with props to rewrite default ones.
 * @returns The config with defaults filled in.
 */
export const getCompleteNumberFormatConfig = (
  partialConfig?: NumberFormatConfig,
): CompleteNumberFormatConfig => {
  return {
    ...defaultConfig,
    ...(partialConfig || {}),
  };
};

/**
 * Formats a value and wraps it in a `<span>`.
 *
 * @param config - The number format config.
 * @param value - The value to format.
 * @returns The formatted markup, or an empty string for `NaN`.
 */
export const applyFormatStaticMarkup = (config: CompleteNumberFormatConfig, value: number) => {
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

/**
 * Formats a value with the given config, using the separators and abbreviations
 * of the current i18n language.
 *
 * @param config - The number format config.
 * @param value - The value to format.
 * @returns The formatted value, e.g. `$1,000.00` for `en-US` or `$1.000,00` for `de-DE`.
 */
export const applyFormat = (config: CompleteNumberFormatConfig, value: number) => {
  // If fixedDecimalScale is true, it adds 0 to match given decimalScale,
  // please see https://www.npmjs.com/package/react-number-format
  const { t: translate, language } = i18nextInstance;
  const separators = getNumberSeparators(language);
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
      suffix = translate('formatting.number.abbreviations.trillion');
    } else if (config.billion && Math.abs(value) / oneBillion >= 1) {
      newValue = value / oneBillion;
      suffix = translate('formatting.number.abbreviations.billion');
    } else if (config.million && Math.abs(value) / oneMillion >= 1) {
      newValue = value / oneMillion;
      suffix = translate('formatting.number.abbreviations.million');
    } else if (config.kilo && Math.abs(value) / oneKilo >= 1) {
      newValue = value / oneKilo;
      suffix = translate('formatting.number.abbreviations.thousand');
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
    thousandSeparator: thousandSeparator ? separators.thousand : undefined,
    fixedDecimalScale: fixedDecimalScale,
    decimalScale: decimalScale,
    decimalSeparator: separators.decimal,
    prefix: prefix,
    suffix: suffix,
  });
};

/**
 * Formats a value as plain text, without the wrapping markup.
 *
 * @param config - The number format config.
 * @param value - The value to format.
 * @returns The formatted value, e.g. `$12.5K`.
 */
export const applyFormatPlainText = (config: CompleteNumberFormatConfig, value: number) => {
  let markup = applyFormatStaticMarkup(config, value);
  markup = markup.replace('<span>', '');
  markup = markup.replace('</span>', '');
  return markup;
};

/**
 * Formats a number value, respecting the `defaultNumberFormatting.enabled` setting.
 * Returns the formatted value when default formatting is enabled OR an explicit config is provided.
 * Falls back to `String(value)` when default formatting is disabled and no explicit config exists.
 *
 * @param value - The numeric value to format.
 * @param partialConfig - Optional explicit number format config set on the data option.
 * @param isDefaultNumberFormattingEnabled - Whether default number formatting is active.
 * @param formatter - Formatting function to use; defaults to `applyFormat`.
 * @returns Formatted string when default formatting is enabled or an explicit config is provided; `String(value)` otherwise.
 */
export function formatNumberWithFallback(
  value: number,
  partialConfig: NumberFormatConfig | undefined,
  isDefaultNumberFormattingEnabled: boolean,
  formatter: (config: CompleteNumberFormatConfig, value: number) => string = applyFormat,
): string {
  const hasExplicitConfig = partialConfig !== undefined;

  if (!isDefaultNumberFormattingEnabled && !hasExplicitConfig) {
    return String(value);
  }

  const config = getCompleteNumberFormatConfig(partialConfig);
  return formatter(config, value);
}
