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
      className={classNames(
        'csdk-my-[2px] csdk-flex csdk-items-center csdk-leading-4 csdk-text-[13px]',
        wrapperClassName,
        {
          'csdk-cursor-pointer': !props.disabled,
        },
      )}
    >
      <input
        {...checkboxProps}
        type="checkbox"
        className={classNames(
          'csdk-accent-UI-default csdk-h-checkbox csdk-w-checkbox csdk-m-checkbox',
          {
            'csdk-cursor-pointer': !props.disabled,
          },
        )}
      />
      {label && <span className="csdk-border-l csdk-pl-3">{label}</span>}
    </label>
  );
};
