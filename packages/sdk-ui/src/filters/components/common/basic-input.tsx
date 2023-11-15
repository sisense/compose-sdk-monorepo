/* eslint-disable @typescript-eslint/restrict-plus-operands */
import { useState, type FunctionComponent, type InputHTMLAttributes, createRef } from 'react';

type BasicInputProps = {
  variant?: 'white' | 'grey';
  label: string;
  callback: (value: string) => void;
} & InputHTMLAttributes<HTMLInputElement>;

export const BasicInput: FunctionComponent<BasicInputProps> = (props) => {
  const { callback, className, value, disabled, ...restProps } = props;
  const [text, setText] = useState(value?.toString() ?? '');
  const inputRef = createRef<HTMLInputElement>();

  const grey = 'csdk-bg-background-priority ';
  const white = 'csdk-bg-white ';
  const variant = props.variant === 'white' ? white : grey;

  return (
    <div className={'csdk-flex csdk-items-center csdk-gap-x-2 csdk-m-px csdk-justify-end'}>
      {props.label && <label htmlFor={props.id}>{props.label}</label>}
      <div className="csdk-h-6">
        <input
          {...restProps}
          ref={inputRef}
          className={
            'csdk-box-border csdk-h-full csdk-border-solid csdk-border-UI-default csdk-border-input csdk-rounded-md invalid:csdk-border-semantic-error disabled:csdk-placeholder:opacity-30 disabled:csdk-cursor-not-allowed csdk-text-text-active ' +
            variant +
            'pl-10 csdk-text-[13px]' +
            className
          }
          style={{ borderWidth: '1px!important' }}
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
