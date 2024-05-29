/* eslint-disable @typescript-eslint/restrict-plus-operands */
import { useState, type FunctionComponent, type InputHTMLAttributes, createRef } from 'react';
import styled from '@emotion/styled';

const StyledBasicInput = styled.input`
  box-sizing: border-box;
  height: 100%;
  border-width: 1px;
  border-style: solid;
  background-color: transparent;
  font-size: 13px;
  color: inherit;
  padding-left: 0.375rem;
  border-radius: 0.375rem;
  transition: border-color 250ms;

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

type BasicInputProps = {
  label?: string;
  callback: (value: string) => void;
} & InputHTMLAttributes<HTMLInputElement>;

export const BasicInput: FunctionComponent<BasicInputProps> = (props) => {
  const { callback, className, value, disabled, ...restProps } = props;
  const [text, setText] = useState(value?.toString() ?? '');
  const inputRef = createRef<HTMLInputElement>();

  return (
    <div className={'csdk-flex csdk-items-center csdk-gap-x-2 csdk-justify-end csdk-h-6'}>
      {props.label && (
        <label className={'csdk-min-w-fit'} htmlFor={props.id}>
          {props.label}
        </label>
      )}
      <div className="csdk-h-full">
        <StyledBasicInput
          {...restProps}
          ref={inputRef}
          className={['csdk-border-UI-default', className].join(' ')}
          value={text}
          onChange={(e) => {
            callback(e.target.value);
            setText(e.target.value);
          }}
          disabled={disabled}
        />
      </div>
    </div>
  );
};
