import {
  corporatePalette,
  redPwcDesignSettings,
  redThemeSettings,
} from './__mocks__/pwc-design-settings.mock';
import { convertToThemeSettings, getPaletteName } from './pwc-design-settings';

describe('pwc-design-settings', () => {
  describe('convertToThemeSettings', () => {
    it('should convert PwcDesignSettings and PwcPalette to ThemeSettings', () => {
      const themeSettings = convertToThemeSettings(redPwcDesignSettings, corporatePalette);
      expect(themeSettings).toEqual(redThemeSettings);
    });
  });

  describe('getPaletteName', () => {
    it('should return the color palette name from PwcDesignSettings', () => {
      const paletteName = getPaletteName(redPwcDesignSettings);
      expect(paletteName).toBe('Corporate');
    });
  });
});
