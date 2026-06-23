import omit from 'lodash-es/omit';

import { TabberButtonsWidgetCustomOptions, TabberButtonsWidgetStyleOptions } from '@/types.js';

import { TabberWidgetDto, TabberWidgetDtoStyle, TabberWidgetDtoTab } from '../types.js';

/**
 * Maps TabberWidgetDtoStyle tab corner radius to TabberButtonsWidgetStyleOptions format.
 * Pure function that transforms DTO format to CSDK format.
 *
 * @param tabCornerRadius - The corner radius from DTO
 * @returns The corner radius in CSDK format
 */
function mapTabberDtoTabCornerRadius(
  tabCornerRadius: TabberWidgetDtoStyle['tabCornerRadius'],
): TabberButtonsWidgetStyleOptions['tabCornerRadius'] {
  switch (tabCornerRadius) {
    case 'SMALL':
      return 'small';
    case 'MEDIUM':
      return 'medium';
    case 'LARGE':
      return 'large';
  }
  return 'none';
}

/**
 * Maps TabberWidgetDtoStyle tabs alignment to TabberButtonsWidgetStyleOptions format.
 * Pure function that transforms DTO format to CSDK format.
 *
 * @param tabsAlignment - The tabs alignment from DTO
 * @returns The tabs alignment in CSDK format
 */
function mapTabberDtoTabsAlignment(
  tabsAlignment: TabberWidgetDtoStyle['tabsAlignment'],
): TabberButtonsWidgetStyleOptions['tabsAlignment'] {
  switch (tabsAlignment) {
    case 'LEFT':
      return 'left';
    case 'CENTER':
      return 'center';
    case 'RIGHT':
      return 'right';
  }
}

/**
 * Maps TabberWidgetDtoStyle tabs interval to TabberButtonsWidgetStyleOptions format.
 * Pure function that transforms DTO format to CSDK format.
 *
 * @param tabsInterval - The tabs interval from DTO
 * @returns The tabs interval in CSDK format
 */
function mapTabberDtoTabsInterval(
  tabsInterval: TabberWidgetDtoStyle['tabsInterval'],
): TabberButtonsWidgetStyleOptions['tabsInterval'] {
  switch (tabsInterval) {
    case 'SMALL':
      return 'small';
    case 'MEDIUM':
      return 'medium';
    case 'LARGE':
      return 'large';
    default:
      if (typeof tabsInterval === 'number') {
        return tabsInterval;
      }
      return 'small';
  }
}

/**
 * Maps TabberWidgetDtoStyle tabs size to TabberButtonsWidgetStyleOptions format.
 * Pure function that transforms DTO format to CSDK format.
 *
 * @param tabsSize - The tabs size from DTO
 * @returns The tabs size in CSDK format
 */
function mapTabberDtoTabsSize(
  tabsSize: TabberWidgetDtoStyle['tabsSize'],
): TabberButtonsWidgetStyleOptions['tabsSize'] {
  switch (tabsSize) {
    case 'SMALL':
      return 'small';
    case 'MEDIUM':
      return 'medium';
    case 'LARGE':
      return 'large';
    default:
      if (typeof tabsSize === 'number') {
        return tabsSize;
      }
      return 'medium';
  }
}

/**
 * Extracts style options from TabberWidgetDtoStyle.
 * Pure function that transforms tabber widget DTO style to CSDK style options.
 * Removes fields that belong in customOptions and renames background color fields.
 * Background colors are applied when provided, regardless of the useSelectedBkg/useUnselectedBkg flags.
 *
 * @param tabberStyleDto - The tabber widget style from DTO
 * @returns The tabber widget style options for CSDK
 */
export function extractTabberButtonsWidgetStyleOptions(
  tabberStyleDto: TabberWidgetDtoStyle,
): TabberButtonsWidgetStyleOptions {
  const styleOptions = omit(tabberStyleDto, [
    'tabs',
    'activeTab',
    'tabCornerRadius',
    'tabsAlignment',
    'tabsInterval',
    'tabsSize',
    'selectedBkgColor',
    'unselectedBkgColor',
    'useSelectedBkg',
    'useUnselectedBkg',
    'showTitle',
  ]);

  return {
    ...styleOptions,
    tabCornerRadius: mapTabberDtoTabCornerRadius(tabberStyleDto.tabCornerRadius),
    tabsAlignment: mapTabberDtoTabsAlignment(tabberStyleDto.tabsAlignment),
    tabsInterval: mapTabberDtoTabsInterval(tabberStyleDto.tabsInterval),
    tabsSize: mapTabberDtoTabsSize(tabberStyleDto.tabsSize),
    // Only include background colors if the corresponding flag is set in the DTO
    ...(tabberStyleDto.useSelectedBkg && {
      selectedBackgroundColor: tabberStyleDto.selectedBkgColor,
    }),
    ...(tabberStyleDto.useUnselectedBkg && {
      unselectedBackgroundColor: tabberStyleDto.unselectedBkgColor,
    }),
  };
}

/**
 * Extracts custom options from TabberWidgetDtoStyle.
 * Pure function that extracts tab names and active tab index from DTO style.
 *
 * @param tabberDto - The tabber widget props DTO
 * @returns Object containing tab names and active tab index
 */
export function extractTabberButtonsWidgetCustomOptions(tabberDto: TabberWidgetDto): {
  tabNames: string[];
  activeTab: number;
} {
  const tabs = tabberDto.style.tabs || tabberDto.tabs || [];
  const { activeTab } = tabberDto.style;
  return {
    tabNames: tabs.map((tab) => tab.title),
    // Default to 0 (first tab) if activeTab is missing or invalid
    activeTab: parseInt(activeTab || '0', 10),
  };
}

/**
 * Maps TabberButtonsWidgetStyleOptions tab corner radius back to DTO format.
 * Inverse of {@link mapTabberDtoTabCornerRadius}.
 *
 * @param tabCornerRadius - The corner radius in CSDK format
 * @returns The corner radius in DTO format
 */
function mapTabberTabCornerRadiusToDto(
  tabCornerRadius: TabberButtonsWidgetStyleOptions['tabCornerRadius'],
): TabberWidgetDtoStyle['tabCornerRadius'] {
  switch (tabCornerRadius) {
    case 'small':
      return 'SMALL';
    case 'medium':
      return 'MEDIUM';
    case 'large':
      return 'LARGE';
  }
  return 'NONE';
}

/**
 * Maps TabberButtonsWidgetStyleOptions tabs alignment back to DTO format.
 * Inverse of {@link mapTabberDtoTabsAlignment}.
 *
 * @param tabsAlignment - The tabs alignment in CSDK format
 * @returns The tabs alignment in DTO format
 */
function mapTabberTabsAlignmentToDto(
  tabsAlignment: TabberButtonsWidgetStyleOptions['tabsAlignment'],
): TabberWidgetDtoStyle['tabsAlignment'] {
  switch (tabsAlignment) {
    case 'left':
      return 'LEFT';
    case 'right':
      return 'RIGHT';
  }
  return 'CENTER';
}

/**
 * Maps TabberButtonsWidgetStyleOptions tabs interval back to DTO format.
 * Inverse of {@link mapTabberDtoTabsInterval}. Numbers pass through as pixels.
 *
 * @param tabsInterval - The tabs interval in CSDK format
 * @returns The tabs interval in DTO format
 */
function mapTabberTabsIntervalToDto(
  tabsInterval: TabberButtonsWidgetStyleOptions['tabsInterval'],
): TabberWidgetDtoStyle['tabsInterval'] {
  switch (tabsInterval) {
    case 'small':
      return 'SMALL';
    case 'large':
      return 'LARGE';
    default:
      if (typeof tabsInterval === 'number') {
        return tabsInterval;
      }
      return 'MEDIUM';
  }
}

/**
 * Maps TabberButtonsWidgetStyleOptions tabs size back to DTO format.
 * Inverse of {@link mapTabberDtoTabsSize}. Numbers pass through as pixels.
 *
 * @param tabsSize - The tabs size in CSDK format
 * @returns The tabs size in DTO format
 */
function mapTabberTabsSizeToDto(
  tabsSize: TabberButtonsWidgetStyleOptions['tabsSize'],
): TabberWidgetDtoStyle['tabsSize'] {
  switch (tabsSize) {
    case 'small':
      return 'SMALL';
    case 'large':
      return 'LARGE';
    default:
      if (typeof tabsSize === 'number') {
        return tabsSize;
      }
      return 'MEDIUM';
  }
}

/**
 * Builds the tabber DTO style from CSDK tabber style and custom options.
 * Inverse of {@link extractTabberButtonsWidgetStyleOptions} and
 * {@link extractTabberButtonsWidgetCustomOptions}: re-encodes the lowercase enum
 * values back to uppercase, reconstructs the `useSelectedBkg`/`useUnselectedBkg`
 * flags from the presence of the corresponding background colors, and
 * re-materializes `tabs`/`activeTab` from the custom options.
 *
 * Note: `displayWidgetIds`/`hideWidgetIds` are not represented in the CSDK
 * widget model, so the re-materialized tabs carry empty id lists.
 *
 * @param styleOptions - The tabber style options from WidgetModel.styleOptions
 * @param customOptions - The tabber custom options from WidgetModel.customOptions
 * @returns The tabber widget style for the DTO
 */
export function toTabberWidgetStyle(
  styleOptions: TabberButtonsWidgetStyleOptions,
  customOptions: TabberButtonsWidgetCustomOptions,
): TabberWidgetDtoStyle {
  const tabs: TabberWidgetDtoTab[] = (customOptions.tabNames ?? []).map((title) => ({
    title,
    displayWidgetIds: [],
    hideWidgetIds: [],
  }));

  return {
    tabs,
    activeTab: String(Number.isFinite(customOptions.activeTab) ? customOptions.activeTab : 0),
    showTitle: false,
    showSeparators: styleOptions.showSeparators ?? true,
    showDescription: styleOptions.showDescription ?? true,
    descriptionColor: styleOptions.descriptionColor ?? '',
    selectedColor: styleOptions.selectedColor ?? '',
    unselectedColor: styleOptions.unselectedColor ?? '',
    tabCornerRadius: mapTabberTabCornerRadiusToDto(styleOptions.tabCornerRadius),
    tabsAlignment: mapTabberTabsAlignmentToDto(styleOptions.tabsAlignment),
    tabsInterval: mapTabberTabsIntervalToDto(styleOptions.tabsInterval),
    tabsSize: mapTabberTabsSizeToDto(styleOptions.tabsSize),
    // The background colors are only meaningful when their flags are set; mirror the
    // read path, which drops the colors unless the flag is true.
    useSelectedBkg: styleOptions.selectedBackgroundColor !== undefined,
    useUnselectedBkg: styleOptions.unselectedBackgroundColor !== undefined,
    selectedBkgColor: styleOptions.selectedBackgroundColor ?? '',
    unselectedBkgColor: styleOptions.unselectedBackgroundColor ?? '',
  };
}
