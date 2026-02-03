import omit from 'lodash-es/omit';

import { TabberButtonsWidgetStyleOptions } from '@/types.js';

import { TabberWidgetDto, TabberWidgetDtoStyle } from '../types.js';

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
