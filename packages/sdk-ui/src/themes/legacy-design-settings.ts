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
  ThemeSettingsFont,
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
  domainUrl: string,
): CompleteThemeSettings {
  const themeSettings: Omit<CompleteThemeSettings, 'aiChat'> = {
    chart: {
      textColor: legacyDesignSettings.dashboards.widgetTextColor,
      backgroundColor: legacyDesignSettings.dashboards.widgetBackgroundColor,
      secondaryTextColor: legacyDesignSettings.dashboards.widgetSecondaryTextColor,
      panelBackgroundColor: legacyDesignSettings.dashboards.widgetBackgroundColor,
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
      fontsLoader: {
        fonts: prepareLegacyThemeSettingsFonts(
          legacyDesignSettings.typography.fontFamily,
          domainUrl,
          legacyDesignSettings.typography.customFontSelected,
        ),
      },
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
    filter: {
      panel: {
        titleColor: legacyDesignSettings.dashboards.panelTitleTextColor,
        backgroundColor: legacyDesignSettings.dashboards.panelBackgroundColor,
      },
    },
  };
  return merge.withOptions({ mergeArrays: false }, getDefaultThemeSettings(), themeSettings);
}

export function getPaletteName(legacyDesignSettings: LegacyDesignSettings): string {
  return legacyDesignSettings.dashboards.colorPaletteName;
}

function prepareLegacyThemeSettingsFonts(
  fontFamily: string,
  domainUrl: string,
  isCustomFont: boolean,
): ThemeSettingsFont[] {
  const BASE_FONTS_PATH = 'resources/base/fonts/';
  const CUSTOM_FONTS_PATH = 'fonts/';
  const path = isCustomFont ? CUSTOM_FONTS_PATH : BASE_FONTS_PATH;

  return [
    {
      fontFamily: fontFamily,
      fontWeight: 'normal',
      fontStyle: 'normal',
      src: [
        {
          url: `${domainUrl}${path}${fontFamily}-Regular.eot`,
        },
        {
          local: `${fontFamily}-Regular`,
        },
        {
          url: `${domainUrl}${path}${fontFamily}-Regular.eot?#iefix`,
          // eslint-disable-next-line sonarjs/no-duplicate-string
          format: 'embedded-opentype',
        },
        {
          url: `${domainUrl}${path}${fontFamily}-Regular.ttf`,
          format: 'truetype',
        },
      ],
    },
    {
      fontFamily: fontFamily,
      fontWeight: 600,
      fontStyle: 'normal',
      src: [
        {
          url: `${domainUrl}${path}${fontFamily}-SemiBold.eot`,
        },
        {
          local: `${fontFamily}-SemiBold`,
        },
        {
          url: `${domainUrl}${path}${fontFamily}-SemiBold.eot?#iefix`,
          format: 'embedded-opentype',
        },
        {
          url: `${domainUrl}${path}${fontFamily}-SemiBold.ttf`,
          format: 'truetype',
        },
      ],
    },
    {
      fontFamily: fontFamily,
      fontWeight: 'bold',
      fontStyle: 'normal',
      src: [
        {
          url: `${domainUrl}${path}${fontFamily}-Bold.eot`,
        },
        {
          local: `${fontFamily}-Bold`,
        },
        {
          url: `${domainUrl}${path}${fontFamily}-Bold.eot?#iefix`,
          format: 'embedded-opentype',
        },
        {
          url: `${domainUrl}${path}${fontFamily}-Bold.ttf`,
          format: 'truetype',
        },
      ],
    },
  ];
}
