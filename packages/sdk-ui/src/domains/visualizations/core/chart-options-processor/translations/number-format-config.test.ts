import { i18nextInstance } from '@/infra/translation/initialize-i18n';
import { registerAllTranslations } from '@/infra/translation/register-all-translations';

import {
  applyFormat,
  applyFormatPlainText,
  applyFormatStaticMarkup,
  getCompleteNumberFormatConfig,
  getNumberSeparators,
} from './number-format-config.js';

const testConfig = getCompleteNumberFormatConfig({ kilo: false });

describe('NumberFormatConfig', () => {
  describe('applyFormat', () => {
    it('should render formatted number as a string', () => {
      const results = applyFormat(testConfig, 1000);
      expect(results).toBe('1,000');
    });

    it('should round up when the decimal portion is greater than or equal to 0.5', () => {
      const config = getCompleteNumberFormatConfig({ decimalScale: 1 });
      const value = 1.25;
      const result = applyFormat(config, value);
      expect(result).toBe('1.3');
    });

    it('should round down when the decimal portion is less than 0.5', () => {
      const config = getCompleteNumberFormatConfig({ decimalScale: 1 });
      const value = 1.249;
      const result = applyFormat(config, value);
      expect(result).toBe('1.2');
    });

    it('should round up for negative numbers when the decimal portion is greater than or equal to 0.5', () => {
      const config = getCompleteNumberFormatConfig({ decimalScale: 1 });
      const value = -1.249;
      const result = applyFormat(config, value);
      expect(result).toBe('-1.2');
    });

    it('should round down for negative numbers when the decimal portion is less than 0.5', () => {
      const config = getCompleteNumberFormatConfig({ decimalScale: 1 });
      const value = -1.25;
      const result = applyFormat(config, value);
      expect(result).toBe('-1.3');
    });
  });

  describe('applyFormatStaticMarkup', () => {
    it('should return markup string for formatted number', () => {
      const results = applyFormatStaticMarkup(testConfig, 1000);
      expect(results).toBe('<span>1,000</span>');
    });
  });

  describe('applyFormatPlainText', () => {
    it('should return plain string for formatted number', () => {
      const results = applyFormatPlainText(testConfig, 1000);
      expect(results).toBe('1,000');
    });
  });

  describe('getCompleteNumberFormatConfig', () => {
    it('should return a complete NumberFormatConfig object with default values for missing properties', () => {
      const results = getCompleteNumberFormatConfig({ kilo: false });
      expect(results).toEqual({
        name: 'Numbers',
        decimalScale: 'auto',
        trillion: true,
        billion: true,
        million: true,
        kilo: false,
        thousandSeparator: true,
        prefix: true,
        symbol: '$',
      });
    });
  });

  describe('localization', () => {
    const currency = getCompleteNumberFormatConfig({ name: 'Currency', decimalScale: 2 });

    beforeAll(() => {
      registerAllTranslations();
    });

    afterEach(async () => {
      await i18nextInstance.changeLanguage('en-US');
    });

    it.each([
      ['en-US', '8.92', '$1.70B'],
      ['de-DE', '8,92', '$1,70Mrd'],
      ['ja-JP', '8.92', '$1.70(十億)'],
      ['fr-FR', '8,92', '$1,70B'],
    ])('uses the %s separators and abbreviations', async (language, plain, abbreviated) => {
      await i18nextInstance.changeLanguage(language);

      expect(applyFormat(getCompleteNumberFormatConfig({ decimalScale: 2 }), 8.92)).toBe(plain);
      expect(applyFormat(currency, 1_700_000_000)).toBe(abbreviated);
    });

    it('groups thousands with the locale separator', async () => {
      await i18nextInstance.changeLanguage('de-DE');

      expect(applyFormat(testConfig, 1234)).toBe('1.234');
    });

    it('follows a language change at runtime', async () => {
      const config = getCompleteNumberFormatConfig({ decimalScale: 2 });
      expect(applyFormat(config, 8.92)).toBe('8.92');

      await i18nextInstance.changeLanguage('de-DE');

      expect(applyFormat(config, 8.92)).toBe('8,92');
    });

    it.each([
      ['de-DE', ['Tsd', 'Mio', 'Mrd', 'Bio']],
      ['es-AR', ['M', 'MM', 'B', 'T']],
      ['es-ES', ['M', 'MM', 'B', 'T']],
      ['ja-JP', ['(千)', '(百万)', '(十億)', '(兆)']],
      ['pt-BR', ['Mil', 'Mi', 'Bi', 'Tri']],
      ['ru-RU', ['тыс.', 'млн', 'млрд', 'трлн']],
      ['tr-TR', ['K', 'M', 'B', 'T']],
      ['zh-CN', ['千', '百万', '十亿', '万亿']],
    ])('abbreviates thousand to trillion for %s', async (language, suffixes) => {
      await i18nextInstance.changeLanguage(language);
      const config = getCompleteNumberFormatConfig({ decimalScale: 0 });

      const results = [1e3, 1e6, 1e9, 1e12].map((value) => applyFormat(config, 789 * value));

      expect(results).toEqual(suffixes.map((suffix) => `789${suffix}`));
    });
  });

  describe('getNumberSeparators', () => {
    it('reads the separators of the given locale', () => {
      expect(getNumberSeparators('de-DE')).toEqual({ thousand: '.', decimal: ',' });
      expect(getNumberSeparators('es-ES')).toEqual({ thousand: '.', decimal: ',' });
    });

    it('falls back to English separators for an invalid locale', () => {
      expect(getNumberSeparators('not a locale')).toEqual({ thousand: ',', decimal: '.' });
    });

    it('falls back to English separators for an unsupported locale', () => {
      expect(getNumberSeparators('zz-ZZ')).toEqual({ thousand: ',', decimal: '.' });
    });
  });
});
