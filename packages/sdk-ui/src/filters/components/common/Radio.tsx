/* eslint-disable @typescript-eslint/restrict-plus-operands */
import type { FunctionComponent, InputHTMLAttributes } from 'react';

type RadioProps = { label?: string } & InputHTMLAttributes<HTMLInputElement>;

export const Radio: FunctionComponent<RadioProps> = (props) => {
  return (
    <label>
      <input
        {...props}
        className={'accent-UI-default text-UI-default  w-radio h-radio m-radio ' + props.className}
        type={'radio'}
      />
      {props.label}
    </label>
  );
};
