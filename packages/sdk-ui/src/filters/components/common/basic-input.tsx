/* eslint-disable @typescript-eslint/restrict-plus-operands */
import {
  createRef,
  CSSProperties,
  type FunctionComponent,
  type InputHTMLAttributes,
  useCallback,
  useState,
} from 'react';

import styled from '@emotion/styled';
import isNumber from 'lodash-es/isNumber';

import { useThemeContext } from '@/theme-provider';

const StyledBasicInput = styled.input`
  box-sizing: border-box;
  height: 100%;
  border-width: 1px;
  border-style: solid;
  background-color: transparent;
  font-size: 13px;
  color: inherit;
  padding: 0 8px;
  border-radius: 0;
  transition: border-color 250ms;
  border-color: #e6e6e6;
  width: 100%;
  height: 24px;
  box-sizing: border-box;

  &:disabled {
    cursor: not-allowed;
  }

  &:invalid {
    border-color: #fb7570;
  }

  &::placeholder {
    color: inherit;
    opacity: 0.75;
  }

  &:focus {
    outline: none;
    border-color: inherit;
  }

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
`;

const ArrowsContainer = styled.div`
  border: 1px solid #e6e6e6;
  border-left: none;
  display: flex;
  flex-direction: column;
  width: 14px;
  height: 24px;
  box-sizing: border-box;
`;

const ButtonWithIcon = styled.button`
  height: 12px;
  width: 14px;
  position: relative;
  overflow: hidden;
  padding: 0;
  margin: 0;
  border: none;
  background-color: transparent;
  cursor: pointer;

  svg {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    margin-left: -0.5px;
  }
`;

type BasicInputProps = {
  label?: string;
  callback: (value: string) => void;
  containerStyle?: CSSProperties;
  labelStyle?: CSSProperties;
  inputStyle?: CSSProperties;
} & InputHTMLAttributes<HTMLInputElement>;

export const BasicInput: FunctionComponent<BasicInputProps> = (props) => {
  const {
    callback,
    className,
    type = 'text',
    value,
    disabled,
    containerStyle,
    labelStyle,
    inputStyle,
    ...restProps
  } = props;
  const [text, setText] = useState(value?.toString() ?? '');
  const inputRef = createRef<HTMLInputElement>();
  const { themeSettings } = useThemeContext();

  const updateNumericValue = useCallback(
    (value: string, updateType: 'increment' | 'decrement') => {
      const newValue = updateType === 'increment' ? parseFloat(value) + 1 : parseFloat(value) - 1;

      if (isNumber(newValue)) {
        callback(newValue.toString());
        setText(newValue.toString());
      }
    },
    [callback, setText],
  );

  return (
    <div className={'csdk-flex csdk-items-center csdk-gap-x-2'} style={containerStyle}>
      {props.label && (
        <label style={labelStyle} className={'csdk-min-w-fit'} htmlFor={props.id}>
          {props.label}
        </label>
      )}
      <div className="csdk-h-full csdk-w-[100%] csdk-flex csdk-justify-end">
        <StyledBasicInput
          {...restProps}
          type={type}
          style={inputStyle}
          ref={inputRef}
          className={['csdk-border-UI-default', className].join(' ')}
          value={text}
          onChange={(e) => {
            callback(e.target.value);
            setText(e.target.value);
          }}
          disabled={disabled}
        />

        {type === 'number' && (
          <ArrowsContainer>
            <ButtonWithIcon onClick={() => updateNumericValue(text, 'increment')}>
              <svg className={'csdk-mt-[2px]'} width={24} height={24} viewBox="0 0 24 24">
                <path
                  fill={themeSettings.typography.primaryTextColor}
                  d="M12 10.16l-3.174 2.719a.5.5 0 0 1-.65-.76l3.5-2.998a.5.5 0 0 1 .65 0l3.5 2.998a.5.5 0 1 1-.65.76L12 10.159z"
                ></path>
              </svg>
            </ButtonWithIcon>
            <ButtonWithIcon onClick={() => updateNumericValue(text, 'decrement')}>
              <svg className={'csdk-mt-[-2px]'} width={24} height={24} viewBox="0 0 24 24">
                <path
                  fill={themeSettings.typography.primaryTextColor}
                  d="M12 13.84l3.174-2.719a.5.5 0 0 1 .65.76l-3.5 2.998a.5.5 0 0 1-.65 0l-3.5-2.998a.5.5 0 1 1 .65-.76L12 13.841z"
                ></path>
              </svg>
            </ButtonWithIcon>
          </ArrowsContainer>
        )}
      </div>
    </div>
  );
};
