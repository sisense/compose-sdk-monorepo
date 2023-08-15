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
  background-color: ${({ theme, isActive }) =>
    isActive ? theme.general.brandColor : theme.general.backgroundColor};
  color: ${({ theme, isActive }) =>
    isActive ? theme.general.primaryButtonTextColor : theme.typography.primaryTextColor};
  border: 1px solid ${({ theme }) => theme.general.primaryButtonTextColor};
`;

type CalendarLabelProps = LabelHTMLAttributes<HTMLLabelElement> & ThemeMixin;
const CalendarLabel = styled.label<CalendarLabelProps>`
  color: ${({ theme }) => theme.general.primaryButtonTextColor};
`;

export const DateRangeFieldButton: FunctionComponent<DateRangeFieldButtonProps> = (props) => {
  const defaultClass = 'text-left w-[200px] outline-0  border-none  p-input h-button  rounded-md ';
  const disabled = 'disabled:placeholder:opacity-30 disabled:cursor-not-allowed ';
  const focus = 'focus:border-solid focus:border-input focus:border-UI-default ';
  const hover = 'hover:border-2 hover:border-guiding text-text-active ';

  return (
    <div className={'relative flex mr-2 cursor-pointer'} aria-label={'DateRangeField'}>
      {props.label && (
        <CalendarLabel
          htmlFor={props.id}
          className={'text-text-content pr-2 w-[50px]'}
          theme={props.theme}
        >
          {props.label}
        </CalendarLabel>
      )}
      <div className={'relative h-button'}>
        <CalendarButton
          {...props}
          aria-label={'DateRangeFieldButton'}
          className={
            defaultClass +
            disabled +
            focus +
            hover +
            'pl-4 pr-10 overflow-hidden ' +
            (props.className || '')
          }
        >
          {props.value}
          <div
            aria-label="DateRangeFieldIcon"
            className="absolute right-2 top-1/2 transform -translate-y-1/2"
          >
            <DateIcon
              className=" text-text-active"
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
