import React from 'react';

import { asSisenseComponent } from '@/decorators/component-decorators/as-sisense-component';
import styled from '@/styled';
import { TranslatableError } from '@/translation/translatable-error';

import { TabberButtonsWidgetProps, TabberButtonsWidgetStyleOptions } from './types';

/**
 * Converts tabsInterval value to CSS string.
 * Pure function that handles predefined sizes and numbers (pixels).
 *
 * @param tabsInterval - The tabs interval value
 * @returns CSS string representation of the interval
 * @internal
 */
export function tabsIntervalToCss(
  tabsInterval: TabberButtonsWidgetStyleOptions['tabsInterval'],
): string {
  if (tabsInterval === undefined) {
    return '12px'; // default fallback
  }
  if (typeof tabsInterval === 'string') {
    switch (tabsInterval) {
      case 'small':
        return '6px';
      case 'large':
        return '24px';
      case 'medium':
      default:
        return '12px';
    }
  }
  if (typeof tabsInterval === 'number' && Number.isFinite(tabsInterval) && tabsInterval >= 0) {
    return `${tabsInterval}px`;
  } else if (typeof tabsInterval === 'number') {
    console.warn(`Invalid tabber tabs interval ${tabsInterval}, using default instead`);
  }
  return '12px'; // default fallback
}

/**
 * Converts tabsSize value to CSS string.
 * Pure function that handles predefined sizes and numbers (pixels).
 *
 * @param tabsSize - The tabs size value
 * @returns CSS string representation of the size
 * @internal
 */
export function tabsSizeToCss(tabsSize: TabberButtonsWidgetStyleOptions['tabsSize']): string {
  if (tabsSize === undefined) {
    return '1.3em'; // default fallback (medium)
  }
  if (typeof tabsSize === 'string') {
    switch (tabsSize) {
      case 'small':
        return '1.0em';
      case 'large':
        return '1.7em';
      case 'medium':
      default:
        return '1.3em';
    }
  }
  if (typeof tabsSize === 'number' && Number.isFinite(tabsSize) && tabsSize >= 0) {
    return `${tabsSize}px`;
  } else if (typeof tabsSize === 'number') {
    console.warn(`Invalid tabber tabs size ${tabsSize}, using default instead`);
  }
  return '1.3em'; // default fallback
}

const defaultStyleOptions: Required<TabberButtonsWidgetStyleOptions> = {
  showSeparators: true,
  showDescription: false,
  selectedColor: '#FFCB05',
  unselectedColor: '#9EA2AB',
  descriptionColor: '#9EA2AB',
  selectedBackgroundColor: '#FFFFFF',
  unselectedBackgroundColor: '#FFFFFF',
  tabsSize: 'medium',
  tabsInterval: 'medium',
  tabsAlignment: 'center',
  tabCornerRadius: 'none',
};

const ContentWrapper = styled.div`
  font-size: 13px;
  font-weight: bold;
  text-transform: uppercase;
  margin: 0 auto;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
`;

const List = styled.div<{
  tabsInterval: TabberButtonsWidgetStyleOptions['tabsInterval'];
  tabsAlignment: string;
  tabsSize: TabberButtonsWidgetStyleOptions['tabsSize'];
}>`
  vertical-align: middle;
  position: relative;
  width: 100%;
  padding: 0 ${({ tabsInterval }) => tabsIntervalToCss(tabsInterval)};
  text-align: ${({ tabsAlignment }) => tabsAlignment};
  font-size: ${({ tabsSize }) => tabsSizeToCss(tabsSize)};
`;

const TabItemContainer = styled.div<{
  isActive: boolean;
  selectedColor: string;
  unselectedColor: string;
  selectedBackgroundColor?: string;
  unselectedBackgroundColor?: string;
  tabCornerRadius: string;
}>`
  position: relative;
  display: inline-block;
  cursor: pointer;
  color: ${({ isActive, selectedColor, unselectedColor }) =>
    isActive ? selectedColor : unselectedColor};
  background-color: ${({ isActive, selectedBackgroundColor, unselectedBackgroundColor }) =>
    isActive
      ? selectedBackgroundColor || 'transparent'
      : unselectedBackgroundColor || 'transparent'};
  border-radius: ${({ tabCornerRadius }) => {
    if (tabCornerRadius === 'small') return '5px';
    if (tabCornerRadius === 'medium') return '10px';
    if (tabCornerRadius === 'large') return '20px';
    return '0';
  }};
  padding: 0 5px;
`;

const TabItem = styled.span`
  display: inline-block;
`;

const Separator = styled.div<{
  tabsInterval: TabberButtonsWidgetStyleOptions['tabsInterval'];
}>`
  display: inline;
  width: 1px;
  height: 100%;
  border-right: 1px solid #d1d1d1;
  /* Adjust margins based on tabsInterval */
  margin: 0 ${({ tabsInterval }) => tabsIntervalToCss(tabsInterval)};
`;

const Description = styled.span<{ descriptionColor: string }>`
  color: ${({ descriptionColor }) => descriptionColor};
  margin-right: 8px;
`;

/**
 * Visual representation of a Fusion's widget with tabber buttons
 * @param props - Tabber buttons widget props
 * @internal
 */
export const TabberButtonsWidget = asSisenseComponent({
  componentName: 'tabber-buttons',
})((props: TabberButtonsWidgetProps) => {
  const { styleOptions, customOptions, description = '' } = props;
  const {
    showSeparators,
    showDescription,
    selectedColor,
    unselectedColor,
    descriptionColor,
    tabsSize,
    tabsInterval,
    tabsAlignment,
    tabCornerRadius,
  } = { ...defaultStyleOptions, ...styleOptions };

  if (!customOptions.tabNames.length) {
    throw new TranslatableError('errors.tabberInvalidConfiguration');
  }

  return (
    <ContentWrapper>
      <List tabsInterval={tabsInterval} tabsSize={tabsSize} tabsAlignment={tabsAlignment}>
        {showDescription && description && (
          <Description descriptionColor={descriptionColor}>{description}</Description>
        )}

        {customOptions.tabNames.map((tabName, index) => (
          <React.Fragment key={index}>
            <TabItemContainer
              isActive={index === customOptions.activeTab}
              selectedColor={selectedColor}
              unselectedColor={unselectedColor}
              selectedBackgroundColor={styleOptions?.selectedBackgroundColor}
              unselectedBackgroundColor={styleOptions?.unselectedBackgroundColor}
              tabCornerRadius={tabCornerRadius}
            >
              <TabItem onClick={() => customOptions.onTabSelected?.(index)}>{tabName}</TabItem>
            </TabItemContainer>
            {index !== customOptions.tabNames.length - 1 && showSeparators && (
              <Separator tabsInterval={tabsInterval} data-testid={'tabber-separator'} />
            )}
          </React.Fragment>
        ))}
      </List>
    </ContentWrapper>
  );
});
