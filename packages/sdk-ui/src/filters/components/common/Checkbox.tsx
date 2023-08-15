import type { FunctionComponent, InputHTMLAttributes } from 'react';
import classNames from 'classnames';

type CheckboxProps = {
  label?: string;
  wrapperClassName?: string;
} & InputHTMLAttributes<HTMLInputElement>;

export const Checkbox: FunctionComponent<CheckboxProps> = (props) => {
  const { wrapperClassName, label, ...checkboxProps } = props;
  return (
    <label
      className={classNames('my-[2px] flex items-center leading-4 text-[13px]', wrapperClassName, {
        'cursor-pointer': !props.disabled,
      })}
    >
      <input
        {...checkboxProps}
        type="checkbox"
        className={classNames('accent-UI-default h-checkbox w-checkbox m-checkbox', {
          'cursor-pointer': !props.disabled,
        })}
      />
      {label && <span className="border-l pl-2">{label}</span>}
    </label>
  );
};
