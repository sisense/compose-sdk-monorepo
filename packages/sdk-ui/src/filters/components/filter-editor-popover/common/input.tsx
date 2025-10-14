import { DetailedHTMLProps, InputHTMLAttributes, useEffect, useRef } from 'react';

import styled from '@emotion/styled';

import { ERROR_COLOR } from '@/const';
import { useThemeContext } from '@/theme-provider';
import { Themable } from '@/theme-provider/types';
import { getElementStateColor } from '@/theme-provider/utils';
import { ElementStates } from '@/types';

const InputContainer = styled.span`
  display: inline-flex;
  position: relative;
`;

const InputErrorLabel = styled.span`
  position: absolute;
  bottom: -19px;
  left: 0;
  color: ${ERROR_COLOR};
  font-size: 11px;
  white-space: nowrap;
`;

export const BaseInput = styled.input<Themable>`
  box-sizing: border-box;
  border-radius: 4px;
  outline: none;
  background: ${({ theme }) => theme.general.popover.input.backgroundColor};
  color: ${({ theme }) => theme.general.popover.input.textColor};
  line-height: 28px;
  height: 28px;
  border: none;
  text-indent: 8px;
  font-family: inherit;
  padding-right: 8px;
  border: 1px solid
    ${({ theme }) =>
      getElementStateColor(theme.general.popover.input.borderColor, ElementStates.DEFAULT)};

  &:hover {
    border: 1px solid
      ${({ theme }) =>
        getElementStateColor(theme.general.popover.input.borderColor, ElementStates.HOVER)};
  }

  &:focus {
    border: 1px solid
      ${({ theme }) =>
        getElementStateColor(theme.general.popover.input.borderColor, ElementStates.FOCUS)};
  }

  &::placeholder {
    color: inherit;
    opacity: 0.5;
  }
`;

type InputProps = DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> & {
  error?: boolean | string;
  wrapperStyle?: React.CSSProperties;
  inputRef?: (input: HTMLInputElement) => void;
};

/** @internal */
export function Input(props: InputProps) {
  const { themeSettings } = useThemeContext();
  const { error, wrapperStyle, inputRef, ...baseInputProps } = props;

  const inputElRef = useRef(null);

  useEffect(() => {
    if (inputElRef.current) {
      inputRef?.(inputElRef.current);
    }
  }, [inputRef]);

  return (
    <InputContainer style={wrapperStyle}>
      <BaseInput
        theme={themeSettings}
        ref={inputElRef}
        {...baseInputProps}
        style={{
          ...baseInputProps.style,
          ...(error && { borderColor: ERROR_COLOR }),
          ...(baseInputProps.type === 'number' && { paddingRight: '0' }),
        }}
      />
      {error && <InputErrorLabel>{error}</InputErrorLabel>}
    </InputContainer>
  );
}
