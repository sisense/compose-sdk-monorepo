/* eslint-disable complexity */
/* eslint-disable max-lines */
import { useState } from 'react';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Button from '@mui/material/Button';
import useButtons from './use-buttons';
import DrillPopper from './use-popper';
import { useThemeForBreadcrumbs } from './use-theme-for-breadcrumbs';
import React from 'react';
import styled from '@emotion/styled';

import { DrilldownBreadcrumbsProps } from '../../../props';

interface DrillButtonProps {
  isActive: boolean;
  isLastActive: boolean;
  filterDisplayValue: string[];
  handleMouseEnter: (event: React.MouseEvent<HTMLElement>) => void;
  handleMouseLeave: () => void;
  handleClick: () => void;
  themeProps: ThemeProps;
  popperParams?: {
    filterDisplayValues: string[];
    anchorEl: HTMLElement;
  } | null;
  index: number;
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

interface StyledButtonProps {
  theme: ThemeProps;
  active: string;
  index: number;
}

export const BREADCRUMBS_BORDER_COLOR = '#F2F2F2';

const StyledDrillButton = styled(Button)<StyledButtonProps>`
  && {
    font-family: ${({ theme }) => theme.fontFamily};
    position: relative;
    border-radius: 0;
    border: 1px solid ${BREADCRUMBS_BORDER_COLOR};
    border-right: none;
    color: ${({ active, theme }) =>
      active === 'true' ? theme.primaryTextColor : theme.secondaryTextColor};
    background-color: ${({ active, theme }) =>
      active === 'true' ? theme.activeDrillBackgroundColor : theme.chartBackgroundColor};
    left: ${({ index }) => (index === 0 ? '-1.875rem' : index === 2 ? '-3.188rem' : '-2.55rem')};
    padding-right: 1.25rem;
    padding-left: 1.875rem;
    height: 1.85rem;
    text-transform: none;
    transition: background-color 0.2s, border-color 0.2s, color 0.2s;
    cursor: ${({ active }) => (active === 'true' ? 'pointer' : 'auto')};

    &:hover {
      background-color: ${({ active, theme }) =>
        active === 'true' ? theme.activeDrillHoverBackgroundColor : theme.chartBackgroundColor};
      border: 1px solid ${BREADCRUMBS_BORDER_COLOR};
      border-right: none;
    }
  }
`;
const DrillButton: React.FC<DrillButtonProps> = ({
  isActive,
  filterDisplayValue,
  handleMouseEnter,
  handleMouseLeave,
  handleClick,
  themeProps,
  popperParams,
  index,
}) => {
  return (
    <StyledDrillButton
      theme={themeProps}
      active={isActive.toString()}
      index={index}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      <span className="flex items-center justify-between">
        <span className="mr-2">
          {filterDisplayValue.slice(0, 2).join(', ')}
          {filterDisplayValue.length > 2 && ', ...'}
        </span>
        {isActive ? (
          <span
            className="csdk-absolute csdk-bottom-1 csdk-right-0 csdk-h-5 csdk-w-5 csdk-translate-x-1/2 csdk-rotate-45"
            style={{
              backgroundColor:
                filterDisplayValue === popperParams?.filterDisplayValues
                  ? themeProps.activeDrillHoverBackgroundColor
                  : themeProps.activeDrillBackgroundColor,
              borderTop: `1px solid ${BREADCRUMBS_BORDER_COLOR}`,
              borderRight: `1px solid ${BREADCRUMBS_BORDER_COLOR}`,
              transition: 'background-color 0.2s, border-color 0.2s, color 0.2s',
              zIndex: 8,
            }}
          />
        ) : undefined}
        <span
          className={`csdk-absolute csdk-bottom-1 -csdk-right-4 ${
            isActive ? 'csdk-h-5 csdk-w-5' : 'csdk-h-3 csdk-w-3 csdk-top-2'
          } csdk-transform translate-x-1/2 csdk-rotate-45`}
          style={{
            backgroundColor: themeProps.chartBackgroundColor,
            borderTop: `1px solid ${BREADCRUMBS_BORDER_COLOR}`,
            borderRight: `1px solid ${BREADCRUMBS_BORDER_COLOR}`,
            zIndex: 7,
          }}
        ></span>
      </span>
    </StyledDrillButton>
  );
};

export const DrilldownBreadcrumbs: React.FC<DrilldownBreadcrumbsProps> = ({
  filtersDisplayValues,
  currentDimension,
  clearDrilldownSelections,
  sliceDrilldownSelections,
}) => {
  const [popperParams, setPopoverParams] = useState<{
    filterDisplayValues: string[];
    anchorEl: HTMLElement;
  } | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const themeProps = useThemeForBreadcrumbs();
  const { CancelButton, CurrentDrillButton } = useButtons({
    clearDrilldownSelections,
    currentDimension,
    filtersDisplayValues,
    isHovered,
    setIsHovered,
    themeProps,
  });
  const handleMouseEnter =
    (filterDisplayValue: string[]) => (event: React.MouseEvent<HTMLElement>) => {
      setIsHovered(true);
      setPopoverParams({ filterDisplayValues: filterDisplayValue, anchorEl: event.currentTarget });
    };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setPopoverParams(null);
  };

  const isActiveDrill = (i: number) => i < filtersDisplayValues.length - 1;
  const isLastActiveDrill = (i: number) => i === filtersDisplayValues.length - 2;

  if (!filtersDisplayValues.length) return null;

  return (
    <Breadcrumbs
      separator={''}
      sx={{ backgroundColor: themeProps.chartBackgroundColor, paddingLeft: '1rem' }}
    >
      <CancelButton />
      {filtersDisplayValues.map((filterDisplayValue, i) => {
        const isActive = isActiveDrill(i);
        const isLastActive = isLastActiveDrill(i);
        return (
          <div key={i}>
            <DrillButton
              isActive={isActive}
              isLastActive={isLastActive}
              filterDisplayValue={filterDisplayValue}
              handleMouseEnter={handleMouseEnter(filterDisplayValue)}
              handleMouseLeave={handleMouseLeave}
              handleClick={() => sliceDrilldownSelections(i + 1)}
              themeProps={themeProps}
              popperParams={popperParams}
              index={i}
            />
          </div>
        );
      })}
      <CurrentDrillButton />
      <DrillPopper
        popperParams={popperParams}
        currentDimension={currentDimension}
        themeProps={themeProps}
      />
    </Breadcrumbs>
  );
};
