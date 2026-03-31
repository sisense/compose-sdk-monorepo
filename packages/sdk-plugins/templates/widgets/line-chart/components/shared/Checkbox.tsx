import type { FunctionComponent, InputHTMLAttributes } from 'react';

import classNames from 'classnames';

export const Checkbox: FunctionComponent<InputHTMLAttributes<HTMLInputElement>> = ({
  className,
  disabled,
  ...props
}) => {
  return (
    <label
      className={classNames(
        'csdk-my-[2px] csdk-flex csdk-items-center csdk-leading-4 csdk-text-[13px]',
        {
          'csdk-cursor-pointer': !disabled,
        },
        className,
      )}
    >
      <input
        {...props}
        type="checkbox"
        className={classNames(
          'csdk-accent-UI-default csdk-h-checkbox csdk-w-checkbox csdk-m-checkbox',
          {
            'csdk-cursor-pointer': !disabled,
          },
        )}
      />
    </label>
  );
};
