import React, { forwardRef } from 'react';

import styled from '@emotion/styled';
import MenuItem from '@mui/material/MenuItem';
import Select, { type SelectChangeEvent } from '@mui/material/Select';
import { type SelectProps } from '@mui/material/Select';
import { Icon, type IconProps } from '@sisense/sdk-shared-ui/Icon';
import { Typography } from '@sisense/sdk-shared-ui/Typography';

type MuiSelectDisplayProps = React.HTMLAttributes<HTMLDivElement> & {
  'data-testid'?: string;
};

export const MENU_ITEM_ARROW_DOWN_ICON =
  "url(\"data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M16.2604 8.58124L10.9174 16.0615L7 12.1442L7.70711 11.4371L10.7898 14.5197L15.4467 8L16.2604 8.58124Z' fill='%235B6372'/%3E%3C/svg%3E%0A\")";

type StyledContainerProps = {
  backgroundColor?: string;
  primaryColor?: string;
};

const StyledContainer = styled.div<StyledContainerProps>`
  display: flex;
  flex-direction: row;
  align-items: center;
  background-color: ${(props) => props.backgroundColor};
  color: ${(props) => props.primaryColor};
  border-radius: 4px;
`;

type StyledLabelProps = {
  primaryColor?: string;
};

const StyledLabel = styled(Typography)<StyledLabelProps>`
  padding-left: 20px;
  margin-right: 8px;
  color: ${(props) => props.primaryColor};
  cursor: default;
  font-family: inherit;
`;

const StyledSelect = styled(Select)`
  & .MuiSelect-select {
    padding: 10px 32px 10px 10px !important;
  }

  & .MuiOutlinedInput-notchedOutline {
    border: none;
  }

  & .MuiSelect-icon {
    top: calc(50% - 11px);

    &.MuiSelect-iconOpen {
      top: calc(50% - 16px);
    }
  }
`;

type StyledIconProps = {
  primaryColor?: string;
};

const StyledIcon = styled(Icon)<StyledIconProps>`
  svg {
    color: ${(props) => props.primaryColor};
  }
`;

const StyledMenuItem = styled(MenuItem)`
  padding-left: 10px;
  font-family: inherit;
  font-weight: 400;
  font-size: 13px;
  line-height: 18px;

  &.Mui-selected {
    position: relative;
    background: transparent;

    &:after {
      margin-left: 15px;
      content: '';
      display: block;
      position: absolute;
      width: 24px;
      height: 24px;
      top: 3px;
      background-image: ${MENU_ITEM_ARROW_DOWN_ICON};
    }
  }
`;

export type SelectWithLabelProps = {
  /** The label text displayed next to the select */
  label: string;
  /** The current selected value */
  value: number;
  /** Array of options to display in the select */
  options: number[];
  /** Callback fired when the value changes */
  onChange?: (value: number) => void;
  /** Optional data-testid for testing */
  dataTestId?: string;
  /** Optional className for the container */
  className?: string;
  /** Optional theme for the select */
  theme?: {
    primaryColor?: string;
    backgroundColor?: string;
  };
} & Omit<SelectProps, 'value' | 'onChange' | 'children'>;

/**
 * A select component with a label, matching the style of MUI TablePagination's rowsPerPage select.
 *
 * @example
 * ```tsx
 * <SelectWithLabel
 *   label="Rows per page"
 *   value={10}
 *   options={[10, 25, 50, 100]}
 *   onChange={(value) => console.log(value)}
 * />
 * ```
 */
export const SelectWithLabel = forwardRef<HTMLDivElement, SelectWithLabelProps>(
  ({ label, value, options, onChange, dataTestId, className, theme, ...selectProps }, ref) => {
    const { primaryColor, backgroundColor } = theme ?? {};
    const handleChange = (event: SelectChangeEvent<unknown>) => {
      onChange?.(Number(event.target.value));
    };

    return (
      <StyledContainer
        ref={ref}
        className={className}
        backgroundColor={backgroundColor}
        primaryColor={primaryColor}
        data-testid={dataTestId}
      >
        <StyledLabel variant="bodyParagraph" primaryColor={primaryColor}>
          {label}
        </StyledLabel>
        <StyledSelect
          value={value}
          onChange={handleChange}
          IconComponent={(props: IconProps) => (
            <StyledIcon {...props} primaryColor={primaryColor} name="general-arrow-big-down" />
          )}
          renderValue={(selectedValue: unknown) => (
            <Typography color={primaryColor} variant="bodyParagraph">
              {String(selectedValue)}
            </Typography>
          )}
          {...selectProps}
        >
          {options.map((option) => (
            <StyledMenuItem key={option} value={option}>
              <Typography variant="bodyParagraph">{option}</Typography>
            </StyledMenuItem>
          ))}
        </StyledSelect>
      </StyledContainer>
    );
  },
);

SelectWithLabel.displayName = 'SelectWithLabel';

export default SelectWithLabel;
