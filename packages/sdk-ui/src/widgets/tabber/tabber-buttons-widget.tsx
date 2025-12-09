import React from 'react';

import { asSisenseComponent } from '@/decorators/component-decorators/as-sisense-component';
import styled from '@/styled';
import { TranslatableError } from '@/translation/translatable-error';

import { TabberButtonsWidgetProps, TabberButtonsWidgetStyleOptions } from './types';

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

const List = styled.div<{ tabsInterval: string; tabsAlignment: string; tabsSize: string }>`
  vertical-align: middle;
  position: relative;
  width: 100%;
  padding: 0
    ${({ tabsInterval }) => {
      if (tabsInterval === 'small') return '6px';
      if (tabsInterval === 'large') return '24px';
      return '12px';
    }};
  text-align: ${({ tabsAlignment }) => tabsAlignment};
  font-size: ${({ tabsSize }) => {
    if (tabsSize === 'small') return '1.0em';
    if (tabsSize === 'large') return '1.7em';
    return '1.3em';
  }};
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

const Separator = styled.div<{ tabsInterval: string }>`
  display: inline;
  width: 1px;
  height: 100%;
  border-right: 1px solid #d1d1d1;
  /* Adjust margins based on tabsInterval */
  margin: 0
    ${({ tabsInterval }) => {
      if (tabsInterval === 'small') return '6px';
      if (tabsInterval === 'large') return '24px';
      return '12px';
    }};
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
