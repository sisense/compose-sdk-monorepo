import { type FunctionComponent, type ButtonHTMLAttributes } from 'react';
import { DateIcon } from '../icons';

type InputProps = {
  variant?: 'white' | 'grey';
  label: string;
  isActive?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export const DateRangeFieldButton: FunctionComponent<InputProps> = (props) => {
  const { variant: variantProp, isActive, ...buttonProps } = props;
  const grey = 'bg-background-priority ';
  const white = 'bg-white ';
  const active = 'bg-yellow-400 ';
  const variant = isActive ? active : variantProp === 'white' ? white : grey;
  const defaultClass = 'text-left w-[200px] outline-0  border-none  p-input h-button  rounded-md ';

  const disabled = 'disabled:placeholder:opacity-30 disabled:cursor-not-allowed ';

  const focus = 'focus:border-solid focus:border-input focus:border-UI-default ';
  const hover = 'hover:border-2 hover:border-guiding text-text-active ';

  return (
    <div className={'relative flex mr-2 cursor-pointer'} aria-label={'DateRangeField'}>
      {props.label && (
        <label htmlFor={props.id} className={'text-text-content pr-2 w-[50px]'}>
          {props.label}
        </label>
      )}
      <div className={'relative h-button'}>
        <button
          {...buttonProps}
          aria-label={'DateRangeFieldButton'}
          className={
            defaultClass +
            disabled +
            focus +
            hover +
            variant +
            'pl-4 pr-10 overflow-hidden ' +
            (props.className || '')
          }
        >
          {props.value}
          <div
            aria-label="DateRangeFieldIcon"
            className="absolute right-2 top-1/2 transform -translate-y-1/2"
          >
            <DateIcon className=" text-text-active" aria-hidden="true" />
          </div>
        </button>
      </div>
    </div>
  );
};
