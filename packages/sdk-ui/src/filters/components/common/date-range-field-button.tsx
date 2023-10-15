import styled from '@emotion/styled';
import { CompleteThemeSettings } from '../../../types';
import { type FunctionComponent, type ButtonHTMLAttributes, LabelHTMLAttributes } from 'react';
import { DateIcon } from '../icons';

type InputProps = {
  variant?: 'white' | 'grey';
  label: string;
  isActive?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>;

type ThemeMixin = {
  theme: CompleteThemeSettings;
};
export type DateRangeFieldButtonProps = InputProps & ThemeMixin;

const CalendarButton = styled.button<DateRangeFieldButtonProps>`
  color: ${({ theme, isActive }) =>
    isActive ? theme.general.primaryButtonTextColor : theme.typography.primaryTextColor};
`;

type CalendarLabelProps = LabelHTMLAttributes<HTMLLabelElement> & ThemeMixin;
const CalendarLabel = styled.label<CalendarLabelProps>`
  color: ${({ theme }) => theme.general.primaryButtonTextColor};
`;

export const DateRangeFieldButton: FunctionComponent<DateRangeFieldButtonProps> = (props) => {
  const defaultClass =
    'csdk-text-left csdk-w-[152px] csdk-bg-[#f4f4f8] csdk-text-[13px] csdk-outline-0 csdk-border csdk-border-transparent csdk-p-input csdk-h-button csdk-rounded-[4px] ';
  const disabled = 'disabled:csdk-placeholder:csdk-opacity-30 disabled:csdk-cursor-not-allowed ';
  const focus = 'focus:csdk-border-solid focus:csdk-border-input focus:csdk-border-UI-default ';
  const hover = 'hover:csdk-border-guiding csdk-text-text-active ';

  return (
    <div
      className={'csdk-relative csdk-flex csdk-mr-2 csdk-cursor-pointer'}
      aria-label={'DateRangeField'}
    >
      {props.label && (
        <CalendarLabel
          htmlFor={props.id}
          className={
            'csdk-text-text-content csdk-my-[5px] csdk-mr-[7px] csdk-text-[13px] csdk-leading-[18px]'
          }
          theme={props.theme}
        >
          {props.label}
        </CalendarLabel>
      )}
      <div className={'csdk-relative csdk-h-button'}>
        <CalendarButton
          {...props}
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
                props.isActive
                  ? props.theme.general.primaryButtonTextColor
                  : props.theme.typography.primaryTextColor
              }
            />
          </div>
        </CalendarButton>
      </div>
    </div>
  );
};
