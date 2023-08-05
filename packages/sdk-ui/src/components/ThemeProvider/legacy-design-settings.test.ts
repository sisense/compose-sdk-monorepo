import {
  corporatePalette,
  redLegacyDesignSettings,
  redThemeSettings,
} from './__mocks__/legacy-design-settings.mock';
import { convertToThemeSettings, getPaletteName } from './legacy-design-settings';

describe('legacy-design-settings', () => {
  describe('convertToThemeSettings', () => {
    it('should convert LegacyDesignSettings and LegacyPalette to ThemeSettings', () => {
      const themeSettings = convertToThemeSettings(redLegacyDesignSettings, corporatePalette);
      expect(themeSettings).toEqual(redThemeSettings);
    });
  });

  describe('getPaletteName', () => {
    it('should return the color palette name from LegacyDesignSettings', () => {
      const paletteName = getPaletteName(redLegacyDesignSettings);
      expect(paletteName).toBe('Corporate');
    });
  });
});
