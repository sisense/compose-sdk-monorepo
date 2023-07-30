/**
 * @internal
 * Dictionary of how to map legacy chart options to theme settings for overriding
 * [PATH_IN_LEGACY_CHART_OPTIONS]: [PATH_IN_THEME_SETTINGS]
 */
export const legacyOptionsToThemeSettingsDictionary = {
  fontFamily: 'typography.fontFamily',
  'title.color': 'chart.textColor',
  backgroundColor: 'chart.backgroundColor',
  'label.color': 'chart.textColor',
  'secondaryTitle.color': 'chart.secondaryTextColor',
};
