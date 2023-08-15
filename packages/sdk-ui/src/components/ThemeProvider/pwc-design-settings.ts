import { ThemeOid, CompleteThemeSettings } from '../../types';

/**
 * Legacy analog of CompleteThemeSettings used in PWC (PrismWebClient).
 */
export type PwcDesignSettings = {
  oid: ThemeOid;
  dashboards: {
    toolbarBackgroundColor: string;
    toolbarSecondaryTextColor: string;
    toolbarTextColor: string;
    colorPaletteName: string;
    navBackgroundColor: string;
    navTextColor: string;
    navTextHoverColor: string;
    navHoverBackgroundColor: string;
    panelBackgroundColor: string;
    panelTitleTextColor: string;
    widgetTextColor: string;
    widgetSecondaryTextColor: string;
    widgetBackgroundColor: string;
    widgetTitleBackgroundColor: string;
    widgetTitleColor: string;
    widgetTitleAlignment: 'left' | 'center';
    widgetSecondaryTitleColor: string;
    widgetTitleDividerEnabled: boolean;
    widgetTitleDividerColor: string;
    widgetBorderEnabled: boolean;
    widgetBorderColor: string;
    widgetCornerRadius: 'none' | 'small' | 'medium' | 'large';
    widgetShadow: 'none' | 'light' | 'medium' | 'dark';
    widgetSpacing: 'none' | 'small' | 'medium' | 'large';
    layoutBackgroundColor: string;
  };
  typography: {
    customFontSelected: boolean;
    fontFamily: string;
    hyperlinkColor: string;
    hyperlinkHoverColor: string;
    predefinedFont: string;
    primaryTextColor: string;
    secondaryTextColor: string;
  };
  general: {
    brandColor: string;
    primaryButtonHoverColor: string;
    primaryButtonTextColor: string;
    secondaryButtonBaseColor: string;
    secondaryButtonHoverColor: string;
    secondaryButtonTextColor: string;
    backgroundColor: string;
  };
  isDefault: boolean;
  isSystem: boolean;
  lastModified: string;
  created: string;
  name: string;
};

/**
 * Palette object used in PWC.
 */
export type PwcPalette = {
  _id: string;
  colors: string[];
  name: string;
  isDefault: boolean;
  sortOrder: number;
  isSystem: boolean;
};

/**
 * Error object returned by server when palette is not found.
 */
export type PwcPaletteError = {
  message: string;
  status: 'error';
};

/**
 * Converts PWC design settings and it's palette object to CompleteThemeSettings.
 *
 * @param pwcDesignSettings - PWC design settings.
 * @param pwcPalette - PWC palette object.
 * @returns
 */
export function convertToThemeSettings(
  pwcDesignSettings: PwcDesignSettings,
  pwcPalette: PwcPalette,
): CompleteThemeSettings {
  const themeSettings: CompleteThemeSettings = {
    chart: {
      textColor: pwcDesignSettings.dashboards.widgetTextColor,
      backgroundColor: pwcDesignSettings.dashboards.widgetBackgroundColor,
      secondaryTextColor: pwcDesignSettings.dashboards.widgetSecondaryTextColor,
    },
    typography: {
      fontFamily: pwcDesignSettings.typography.fontFamily,
    },
    palette: {
      variantColors: pwcPalette.colors,
    },
    general: {
      brandColor: pwcDesignSettings.general.brandColor,
      backgroundColor: pwcDesignSettings.general.backgroundColor,
      primaryButtonTextColor: pwcDesignSettings.general.primaryButtonTextColor,
    },
  };
  return themeSettings;
}

export function getPaletteName(pwcDesignSettings: PwcDesignSettings): string {
  return pwcDesignSettings.dashboards.colorPaletteName;
}
