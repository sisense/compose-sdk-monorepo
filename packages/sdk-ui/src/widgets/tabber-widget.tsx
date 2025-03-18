/* eslint-disable @typescript-eslint/naming-convention */
import React from 'react';

import styled from '@emotion/styled';
import { TabberWidgetExtraProps, TabberWidgetProps } from '@/props';

const defaultStyleOptions = {
  showTitle: false,
  showSeparators: true,
  showDescription: false,
  useSelectedBkg: false,
  useUnselectedBkg: false,
  selectedColor: '#FFCB05',
  unselectedColor: '#9EA2AB',
  descriptionColor: '#9EA2AB',
  selectedBkgColor: '#FFFFFF',
  unselectedBkgColor: '#FFFFFF',
  tabsSize: 'MEDIUM' as TabSize,
  tabsInterval: 'MEDIUM' as TabInterval,
  tabsAlignment: 'CENTER' as TabAlignment,
  tabCornerRadius: 'NONE' as TabCornerRadius,
  tabs: [],
  activeTab: 0,
};
/**
 * Tabber widget tab size
 * @group TabberWidget
 * @internal
 */
export type TabSize = 'SMALL' | 'MEDIUM' | 'LARGE';

/**
 * Tabber widget tab interval
 * @group TabberWidget
 * @internal
 */
export type TabInterval = 'SMALL' | 'MEDIUM' | 'LARGE';

/**
 * Tabber widget tab alignment
 * @group TabberWidget
 * @internal
 */
export type TabAlignment = 'LEFT' | 'CENTER' | 'RIGHT';

/**
 * Tabber widget tab corner radius
 * @group TabberWidget
 * @internal
 */
export type TabCornerRadius = 'SMALL' | 'MEDIUM' | 'LARGE' | 'NONE';

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
      if (tabsInterval === 'SMALL') return '6px';
      if (tabsInterval === 'LARGE') return '24px';
      return '12px';
    }};
  text-align: ${({ tabsAlignment }) => tabsAlignment.toLowerCase()};
  font-size: ${({ tabsSize }) => {
    if (tabsSize === 'SMALL') return '1.0em';
    if (tabsSize === 'LARGE') return '1.7em';
    return '1.3em';
  }};
`;

const TabItemContainer = styled.div<{
  isActive: boolean;
  selectedColor: string;
  unselectedColor: string;
  useSelectedBkg: boolean;
  useUnselectedBkg: boolean;
  selectedBkgColor: string;
  unselectedBkgColor: string;
  tabCornerRadius: string;
  // onClick: () => void;
}>`
  position: relative;
  display: inline-block;
  cursor: pointer;
  color: ${({ isActive, selectedColor, unselectedColor }) =>
    isActive ? selectedColor : unselectedColor};
  background-color: ${({
    isActive,
    useSelectedBkg,
    useUnselectedBkg,
    selectedBkgColor,
    unselectedBkgColor,
  }) =>
    isActive && useSelectedBkg
      ? selectedBkgColor
      : useUnselectedBkg
      ? unselectedBkgColor
      : 'transparent'};
  border-radius: ${({ tabCornerRadius }) => {
    if (tabCornerRadius === 'SMALL') return '5px';
    if (tabCornerRadius === 'MEDIUM') return '10px';
    if (tabCornerRadius === 'LARGE') return '20px';
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
      if (tabsInterval === 'SMALL') return '6px';
      if (tabsInterval === 'LARGE') return '24px';
      return '12px';
    }};
`;

const Description = styled.span<{ descriptionColor: string }>`
  color: ${({ descriptionColor }) => descriptionColor};
  margin-right: 8px;
`;

/**
 * Visual representation of a Fusion's tabber widget
 * @param styleOptions
 * @param description
 * @param props
 * @constructor
 * @group TabberWidget
 * @internal
 */
export const TabberWidget = ({
  styleOptions = defaultStyleOptions,
  description = '',
  ...props
}: TabberWidgetProps) => {
  const { tabs } = styleOptions;
  const { selectedTab, onTabSelected } = props as TabberWidgetExtraProps;
  const finalStyle = { ...defaultStyleOptions, ...styleOptions };

  const {
    showSeparators,
    showDescription,
    useSelectedBkg,
    useUnselectedBkg,
    selectedColor,
    unselectedColor,
    descriptionColor,
    selectedBkgColor,
    unselectedBkgColor,
    tabsSize,
    tabsInterval,
    tabsAlignment,
    tabCornerRadius,
  } = finalStyle;

  return (
    <ContentWrapper>
      <List tabsInterval={tabsInterval} tabsSize={tabsSize} tabsAlignment={tabsAlignment}>
        {showDescription && description && (
          <Description descriptionColor={descriptionColor}>{description}</Description>
        )}

        {tabs.map((tab, index) => (
          <React.Fragment key={index}>
            <TabItemContainer
              isActive={index === selectedTab}
              selectedColor={selectedColor}
              unselectedColor={unselectedColor}
              useSelectedBkg={useSelectedBkg}
              useUnselectedBkg={useUnselectedBkg}
              selectedBkgColor={selectedBkgColor}
              unselectedBkgColor={unselectedBkgColor}
              tabCornerRadius={tabCornerRadius}
            >
              <TabItem onClick={() => onTabSelected(index)}>{tab.title}</TabItem>
            </TabItemContainer>
            {index !== tabs.length - 1 && showSeparators && (
              <Separator tabsInterval={tabsInterval} data-testid={'tabber-separator'} />
            )}
          </React.Fragment>
        ))}
      </List>
    </ContentWrapper>
  );
};
