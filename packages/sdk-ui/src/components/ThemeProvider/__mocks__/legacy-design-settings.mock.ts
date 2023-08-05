import { ThemeSettings } from '../../../types.js';
import { LegacyDesignSettings, LegacyPalette } from '../legacy-design-settings.js';

export const redLegacyDesignSettings: LegacyDesignSettings = {
  oid: '64a408e0affe66003378c8d7',
  typography: {
    customFontSelected: false,
    predefinedFont: 'Open Sans',
    hyperlinkColor: '#1FAFF3',
    hyperlinkHoverColor: '#0065E3',
    primaryTextColor: '#ff0000',
    secondaryTextColor: '#f9a8a8',
    fontFamily: 'Open Sans',
  },
  general: {
    brandColor: '#ff0505',
    primaryButtonHoverColor: '#F2B900',
    primaryButtonTextColor: '#3A4356',
    secondaryButtonBaseColor: '#EDEEF1',
    secondaryButtonHoverColor: '#D0D3DB',
    secondaryButtonTextColor: '#3A4356',
    backgroundColor: '#16161C',
  },
  dashboards: {
    toolbarBackgroundColor: '#16161C',
    toolbarSecondaryTextColor: '#C5C8CF',
    toolbarTextColor: '#FFFFFF',
    colorPaletteName: 'Corporate',
    navBackgroundColor: '#16161C',
    navTextColor: '#FFFFFF',
    navTextHoverColor: '#FFFFFF',
    navHoverBackgroundColor: '#313138',
    panelBackgroundColor: '#313138',
    panelTitleTextColor: '#FFFFFF',
    widgetTextColor: '#FFFFFF',
    widgetSecondaryTextColor: '#C5C8CF',
    widgetBackgroundColor: '#ec4646',
    widgetTitleBackgroundColor: '#4f2727',
    widgetTitleColor: '#fe0000',
    widgetTitleAlignment: 'left',
    widgetSecondaryTitleColor: '#b93434',
    widgetTitleDividerEnabled: false,
    widgetTitleDividerColor: '#FFFFFF',
    widgetBorderEnabled: false,
    widgetBorderColor: '#C5C8CF',
    widgetCornerRadius: 'none',
    widgetShadow: 'none',
    widgetSpacing: 'none',
    layoutBackgroundColor: '#313138',
  },
  isSystem: false,
  name: 'REDRUM',
  isDefault: true,
  lastModified: '2023-07-04T13:32:52.618Z',
  created: '2023-07-04T11:56:16.000Z',
};

export const redThemeSettings: ThemeSettings = {
  chart: {
    textColor: '#FFFFFF',
    backgroundColor: '#ec4646',
    secondaryTextColor: '#C5C8CF',
  },
  typography: {
    fontFamily: 'Open Sans',
  },
  palette: {
    variantColors: ['#779fa8', '#bf1e1d', '#787070'],
  },
  general: {
    brandColor: '#ff0505',
    primaryButtonTextColor: '#3A4356',
    backgroundColor: '#16161C',
  },
};

export const corporatePalette: LegacyPalette = {
  _id: '64106b7c984c23001b2d472e',
  colors: ['#779fa8', '#bf1e1d', '#787070'],
  name: 'Corporate',
  isDefault: false,
  sortOrder: 50,
  isSystem: true,
};
