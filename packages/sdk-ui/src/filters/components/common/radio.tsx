/* eslint-disable @typescript-eslint/restrict-plus-operands */
import type { FunctionComponent, InputHTMLAttributes } from 'react';

type RadioProps = { label?: string } & InputHTMLAttributes<HTMLInputElement>;

export const Radio: FunctionComponent<RadioProps> = (props) => {
  return (
    <label>
      <input
        {...props}
        className={
          'csdk-accent-UI-default csdk-text-UI-default  csdk-w-radio csdk-h-radio csdk-m-radio ' +
          props.className
        }
        type={'radio'}
      />
      {props.label}
    </label>
  );
};
