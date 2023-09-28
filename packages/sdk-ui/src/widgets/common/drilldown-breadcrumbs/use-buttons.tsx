import Button from '@mui/material/Button';
import React from 'react';
import { Attribute } from '@sisense/sdk-data';
import { Dispatch, SetStateAction } from 'react';
import styled from '@emotion/styled';
import { BREADCRUMBS_BORDER_COLOR } from './drilldown-breadcrumbs';

interface ButtonsProps {
  clearDrilldownSelections: () => void;
  currentDimension: Attribute;
  filtersDisplayValues: string[][];
  isHovered: boolean;
  setIsHovered: Dispatch<SetStateAction<boolean>>;
  themeProps: ThemeProps;
}
interface ThemeProps {
  primaryTextColor: string;
  secondaryTextColor: string;
  fontFamily: string;
  backgroundColor: string;
  brandColor: string;
  primaryButtonTextColor: string;
  chartBackgroundColor: string;
  activeDrillBackgroundColor: string;
  activeDrillHoverBackgroundColor: string;
}
interface StyledButton {
  theme: ThemeProps;
}
interface Buttons {
  CancelButton: React.FC;
  CurrentDrillButton: React.FC;
}

// eslint-disable-next-line max-lines-per-function
const useButtons = ({
  clearDrilldownSelections,
  currentDimension,
  filtersDisplayValues,
  setIsHovered,
  themeProps,
}: ButtonsProps): Buttons => {
  const currentColumn = currentDimension.expression.match(/\[(.*?)]/)?.[1]?.split('.')[1] || '';

  const StyledCancelButton = styled(Button)<StyledButton>`
    && {
      background-color: ${themeProps.activeDrillBackgroundColor};
      color: ${themeProps.primaryButtonTextColor};
      border-radius: 100%;
      border: 1px solid ${BREADCRUMBS_BORDER_COLOR};
      min-width: 38px;
      z-index: 10;
      padding: 7px;
      cursor: pointer;
      text-transform: none;

      &:hover {
        background-color: ${themeProps.activeDrillHoverBackgroundColor};
        color: ${themeProps.primaryTextColor};
      }
    }
  `;

  const Icon = styled.svg`
    width: 24px;
    height: 24px;
    fill: currentColor;
  `;

  const CancelButton: React.FC = () => {
    return (
      <StyledCancelButton
        theme={themeProps}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={clearDrilldownSelections}
      >
        <Icon width={24} height={24}>
          <path
            fill="currentColor"
            d="M12 12.293L6.854 7.146a.5.5 0 1 0-.708.708L11.293 13l-5.147 5.146a.5.5 0 0 0 .708.708L12 13.707l5.146 5.147a.5.5 0 0 0 .708-.708L12.707 13l5.147-5.146a.5.5 0 0 0-.708-.708L12 12.293z"
          ></path>
        </Icon>
      </StyledCancelButton>
    );
  };

  const StyledCurrentDrillButton = styled(Button)<StyledButton>`
    && {
      position: relative;
      font-family: ${(props) => props.theme.fontFamily};
      border-radius: 0;
      border: 1px solid ${BREADCRUMBS_BORDER_COLOR};
      background-color: ${(props) => props.theme.chartBackgroundColor};
      border-right: none;
      border-left: none;
      left: ${filtersDisplayValues.length < 2 ? '-3rem' : '-4.5rem'};
      color: ${(props) => props.theme.secondaryTextColor};
      padding-right: 1.25rem;
      padding-left: ${filtersDisplayValues.length === 2 ? '3.125rem' : '2.5rem'};
      height: 1.85rem;
      transition: background-color 0.2s, border-color 0.2s, color 0.2s;
      text-transform: none;
      cursor: auto;
      pointer-events: none;

      &:hover {
        background-color: ${(props) => props.theme.chartBackgroundColor};
        border: 1px solid ${BREADCRUMBS_BORDER_COLOR};
        border-right: none;
        border-left: none;
      }
    }
  `;

  const CurrentDrillButton: React.FC = () => {
    return (
      <StyledCurrentDrillButton theme={themeProps}>
        {currentColumn} (All)
        <span className="flex items-center justify-between">
          <span
            className="csdk-absolute csdk-bottom-1 csdk-h-5 csdk-w-5 csdk-transform csdk-translate-x-1/2 csdk-rotate-45"
            style={{
              backgroundColor: 'transparent',
              borderTop: `1px solid ${BREADCRUMBS_BORDER_COLOR}`,
              borderRight: `1px solid ${BREADCRUMBS_BORDER_COLOR}`,
            }}
          ></span>
        </span>
      </StyledCurrentDrillButton>
    );
  };

  return { CancelButton, CurrentDrillButton };
};

export default useButtons;
