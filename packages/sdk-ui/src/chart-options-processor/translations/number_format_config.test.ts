import {
  applyFormat,
  defaultConfig,
  applyFormatStaticMarkup,
  applyFormatPlainText,
} from './number_format_config';

const testConfig = { ...defaultConfig, kilo: false };

describe('NumberFormatConfig', () => {
  describe('applyFormat', () => {
    it('should render formatted number as a string', () => {
      const results = applyFormat(testConfig, 1000);
      expect(results).toBe('1,000');
    });

    it('should round up when the decimal portion is greater than or equal to 0.5', () => {
      const config = { ...defaultConfig, decimalScale: 1 };
      const value = 1.25;
      const result = applyFormat(config, value);
      expect(result).toBe('1.3');
    });

    it('should round down when the decimal portion is less than 0.5', () => {
      const config = { ...defaultConfig, decimalScale: 1 };
      const value = 1.249;
      const result = applyFormat(config, value);
      expect(result).toBe('1.2');
    });

    it('should round up for negative numbers when the decimal portion is greater than or equal to 0.5', () => {
      const config = { ...defaultConfig, decimalScale: 1 };
      const value = -1.249;
      const result = applyFormat(config, value);
      expect(result).toBe('-1.2');
    });

    it('should round down for negative numbers when the decimal portion is less than 0.5', () => {
      const config = { ...defaultConfig, decimalScale: 1 };
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
});
