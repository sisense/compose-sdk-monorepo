import { useEffect, useRef, type FunctionComponent, type InputHTMLAttributes } from 'react';
import classNames from 'classnames';

type CheckboxProps = {
  label?: string;
  isLabelInactive?: boolean;
  wrapperClassName?: string;
  indeterminate?: boolean;
} & InputHTMLAttributes<HTMLInputElement>;

export const Checkbox: FunctionComponent<CheckboxProps> = (props) => {
  const { wrapperClassName, label, isLabelInactive, indeterminate, ...checkboxProps } = props;
  const labelClassnames = ['csdk-border-l', 'csdk-pl-3'];

  const cbRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (cbRef.current) cbRef.current.indeterminate = indeterminate ?? false;
  }, [cbRef, indeterminate]);

  if (isLabelInactive) labelClassnames.push('csdk-opacity-50');

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
        ref={cbRef}
        type="checkbox"
        className={classNames(
          'csdk-accent-UI-default csdk-h-checkbox csdk-w-checkbox csdk-m-checkbox',
          {
            'csdk-cursor-pointer': !props.disabled,
          },
        )}
      />
      {label && <span className={labelClassnames.join(' ')}>{label}</span>}
    </label>
  );
};
