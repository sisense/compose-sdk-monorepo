import merge from 'ts-deepmerge';
import {
  DEFAULT_DIVIDER_COLOR,
  DEFAULT_DIVIDER_WIDTH,
  getDefaultThemeSettings,
} from '../theme-provider/default-theme-settings';
import {
  ThemeOid,
  CompleteThemeSettings,
  SpaceSizes,
  RadiusSizes,
  ShadowsTypes,
  AlignmentTypes,
} from '../types.js';

/**
 * Legacy analog of CompleteThemeSettings used in Sisense UI.
 */
export type LegacyDesignSettings = {
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
 * Palette object used in legacy (form Sisense UI).
 */
export type LegacyPalette = {
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
export type LegacyPaletteError = {
  message: string;
  status: 'error';
};

/**
 * Mapping of legacy design properties types to theme setting types
 */
export const LEGACY_DESIGN_TYPES = {
  none: 'None',
  small: 'Small',
  medium: 'Medium',
  large: 'Large',

  left: 'Left',
  center: 'Center',
  right: 'Right',

  light: 'Light',
  dark: 'Dark',
};

/**
 * Converts legacy (used in Sisense UI) design settings and it's palette object to CompleteThemeSettings.
 *
 * @param legacyDesignSettings - legacy design settings.
 * @param legacyPalette - legacy palette object.
 * @returns
 */
export function convertToThemeSettings(
  legacyDesignSettings: LegacyDesignSettings,
  legacyPalette: LegacyPalette,
): CompleteThemeSettings {
  const themeSettings: Omit<CompleteThemeSettings, 'aiChat'> = {
    chart: {
      textColor: legacyDesignSettings.dashboards.widgetTextColor,
      backgroundColor: legacyDesignSettings.dashboards.widgetBackgroundColor,
      secondaryTextColor: legacyDesignSettings.dashboards.widgetSecondaryTextColor,
      panelBackgroundColor: legacyDesignSettings.dashboards.panelBackgroundColor,
      animation: {
        init: {
          duration: 'auto',
        },
        redraw: {
          duration: 'auto',
        },
      },
    },
    typography: {
      fontFamily: legacyDesignSettings.typography.fontFamily,
      primaryTextColor: legacyDesignSettings.typography.primaryTextColor,
      secondaryTextColor: legacyDesignSettings.typography.secondaryTextColor,
    },
    palette: {
      variantColors: legacyPalette.colors,
    },
    general: {
      brandColor: legacyDesignSettings.general.brandColor,
      backgroundColor: legacyDesignSettings.general.backgroundColor,
      primaryButtonTextColor: legacyDesignSettings.general.primaryButtonTextColor,
      primaryButtonHoverColor: legacyDesignSettings.general.primaryButtonHoverColor,
    },
    widget: {
      spaceAround: LEGACY_DESIGN_TYPES[legacyDesignSettings.dashboards.widgetSpacing] as SpaceSizes,
      cornerRadius: LEGACY_DESIGN_TYPES[
        legacyDesignSettings.dashboards.widgetCornerRadius
      ] as RadiusSizes,
      shadow: LEGACY_DESIGN_TYPES[legacyDesignSettings.dashboards.widgetShadow] as ShadowsTypes,
      border: legacyDesignSettings.dashboards.widgetBorderEnabled,
      borderColor: legacyDesignSettings.dashboards.widgetBorderColor,
      header: {
        titleTextColor: legacyDesignSettings.dashboards.widgetTitleColor,
        titleAlignment: LEGACY_DESIGN_TYPES[
          legacyDesignSettings.dashboards.widgetTitleAlignment
        ] as AlignmentTypes,
        dividerLine: legacyDesignSettings.dashboards.widgetTitleDividerEnabled,
        dividerLineColor: legacyDesignSettings.dashboards.widgetTitleDividerColor,
        backgroundColor: legacyDesignSettings.dashboards.widgetTitleBackgroundColor,
      },
    },
    dashboard: {
      backgroundColor: legacyDesignSettings.dashboards.layoutBackgroundColor,
      dividerLineWidth: DEFAULT_DIVIDER_WIDTH,
      dividerLineColor: DEFAULT_DIVIDER_COLOR,
    },
  };
  return merge.withOptions({ mergeArrays: false }, getDefaultThemeSettings(), themeSettings);
}

export function getPaletteName(legacyDesignSettings: LegacyDesignSettings): string {
  return legacyDesignSettings.dashboards.colorPaletteName;
}
