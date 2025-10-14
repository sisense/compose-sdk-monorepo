import { type ButtonHTMLAttributes, type FunctionComponent } from 'react';

import styled from '@emotion/styled';

import { DEFAULT_BACKGROUND_COLOR } from '@/const';
import { Themable } from '@/theme-provider/types';

import { getSlightlyDifferentColor } from '../../../utils/color';
import { DateIcon } from '../icons';

export type Variant = 'white' | 'grey';

type InputProps = {
  variant?: Variant;
  label?: string;
  isActive?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const isWhite = (variant: Variant | undefined) => variant === 'white';

export type DateRangeFieldButtonProps = InputProps & Themable;

const disabledBg = 'rgb(240, 240, 240)';
const disabledColor = 'rgba(0, 0, 0, 0.26)';

const CalendarButton = styled.button<DateRangeFieldButtonProps>`
  cursor: pointer;
  background-color: ${({ theme, variant, disabled }) =>
    disabled
      ? disabledBg
      : isWhite(variant)
      ? theme.general.backgroundColor
      : DEFAULT_BACKGROUND_COLOR};
  border: ${({ variant }) =>
    isWhite(variant) ? '1px solid rgb(110 115 125 / var(--tw-border-opacity))' : 'none'};
  color: ${({ theme, isActive, disabled }) =>
    disabled
      ? disabledColor
      : isActive
      ? theme.general.primaryButtonTextColor
      : theme.typography.primaryTextColor};
  border-radius: 0.375rem;
  &:hover {
    background-color: ${({ theme, variant, disabled }) =>
      disabled
        ? disabledBg
        : getSlightlyDifferentColor(
            isWhite(variant) ? theme.general.backgroundColor : DEFAULT_BACKGROUND_COLOR,
          )};
    transition: 0.2s;
  }
  transition: color 250ms;
`;

type Variantable = {
  variant: Variant;
};

const CalendarLabel = styled.label<Themable & Variantable>`
  color: ${({ theme, variant }) =>
    isWhite(variant) ? theme.typography.primaryTextColor : theme.general.primaryButtonTextColor};
`;

export const DateRangeFieldButton: FunctionComponent<DateRangeFieldButtonProps> = (props) => {
  const { variant = 'grey', label, isActive, theme } = props;
  const defaultClass = `csdk-text-left csdk-w-[152px] csdk-bg-[${DEFAULT_BACKGROUND_COLOR}] csdk-text-[13px] csdk-outline-0 csdk-border csdk-border-transparent csdk-p-input csdk-h-6 csdk-rounded-[4px] `;
  const disabled = 'disabled:csdk-placeholder:csdk-opacity-30 disabled:csdk-cursor-not-allowed ';
  const focus = 'focus:csdk-border-solid focus:csdk-border-input focus:csdk-border-UI-default ';
  const hover = 'hover:csdk-border-guiding csdk-text-text-active ';

  return (
    <div
      className={'csdk-relative csdk-flex csdk-mr-[5px] csdk-cursor-pointer'}
      aria-label={'DateRangeField'}
    >
      {label && (
        <CalendarLabel
          htmlFor={props.id}
          className={'csdk-my-[5px] csdk-mr-[7px] csdk-text-[13px] csdk-leading-[18px]'}
          theme={theme}
          variant={variant}
        >
          {label}
        </CalendarLabel>
      )}
      <div className={'csdk-relative csdk-h-6'}>
        <CalendarButton
          {...props}
          variant={variant}
          aria-label={'DateRangeFieldButton'}
          className={
            defaultClass +
            disabled +
            focus +
            hover +
            'csdk-pl-2.5 csdk-pr-10 csdk-overflow-hidden ' +
            (props.className || '')
          }
        >
          {props.value}
          <div
            aria-label="DateRangeFieldIcon"
            className="csdk-absolute csdk-right-[4px] csdk-top-1/2 csdk-transform -csdk-translate-y-1/2"
          >
            <DateIcon
              className="csdk-flex csdk-text-text-active"
              aria-hidden="true"
              iconColor={
                isActive ? theme.general.primaryButtonTextColor : theme.typography.primaryTextColor
              }
            />
          </div>
        </CalendarButton>
      </div>
    </div>
  );
};
