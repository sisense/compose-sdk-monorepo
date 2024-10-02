import Button from '@mui/material/Button';
import React from 'react';
import { Attribute } from '@sisense/sdk-data';
import { Dispatch, SetStateAction } from 'react';
import styled from '@emotion/styled';
import { BREADCRUMBS_BORDER_COLOR } from './drilldown-breadcrumbs';
import { useTranslation } from 'react-i18next';

interface ButtonsProps {
  clearDrilldownSelections: () => void;
  currentDimension: Attribute;
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
  setIsHovered,
  themeProps,
}: ButtonsProps): Buttons => {
  const { t: translate } = useTranslation();
  const currentColumn = currentDimension.name;

  const StyledCancelButton = styled(Button)<StyledButton>`
    && {
      background-color: ${themeProps.activeDrillBackgroundColor};
      color: ${themeProps.primaryButtonTextColor};
      border-radius: 100%;
      border: 2px solid white;
      min-width: 39px;
      width: 39px;
      height: 39px;
      z-index: 10;
      padding: 7px;
      cursor: pointer;
      text-transform: none;
      margin-right: -5px;

      &:hover {
        background-color: ${themeProps.activeDrillHoverBackgroundColor};
        color: ${themeProps.primaryTextColor};
      }
    }
  `;

  const Icon = styled.svg`
    width: 22px;
    height: 22px;
    fill: #9ea2ab;
  `;

  const CancelButton: React.FC = () => {
    return (
      <StyledCancelButton
        theme={themeProps}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={clearDrilldownSelections}
      >
        <Icon width={22} height={22} viewBox={'0 0 24 24'}>
          <path
            fill="#9EA2AB"
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
      color: ${(props) => props.theme.secondaryTextColor};
      padding-right: 1.25rem;
      padding-left: 1.875rem;
      height: 1.64rem;
      font-size: 13px;
      transition: background-color 0.2s, border-color 0.2s, color 0.2s;
      text-transform: none;
      cursor: auto;
      pointer-events: none;
      white-space: nowrap;

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
        {currentColumn} ({translate('drilldown.breadcrumbsAllSuffix')})
        <span className="flex items-center justify-between">
          <span
            className="csdk-absolute csdk-right-[0px] csdk-top-[3px] csdk-h-[18px] csdk-w-[18px] csdk-transform csdk-translate-x-1/2 csdk-rotate-45"
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
