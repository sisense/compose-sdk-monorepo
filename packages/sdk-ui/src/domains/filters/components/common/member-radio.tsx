import { type FunctionComponent, type InputHTMLAttributes } from 'react';

import classNames from 'classnames';

type MemberRadioProps = {
  label?: string;
  isLabelInactive?: boolean;
  wrapperClassName?: string;
} & InputHTMLAttributes<HTMLInputElement>;

export const MemberRadio: FunctionComponent<MemberRadioProps> = (props) => {
  const { wrapperClassName, label, isLabelInactive, ...radioProps } = props;
  const labelClassnames = ['csdk-border-l', 'csdk-pl-3'];
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
        {...radioProps}
        type="radio"
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
