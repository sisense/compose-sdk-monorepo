import React from 'react';
import classnames from 'classnames';

export type ToggleProps = {
  checked: boolean;
  className?: string;
  disabled?: boolean;
  inline?: boolean;
  onChange: (evt: React.ChangeEvent<HTMLInputElement>) => any;
  text?: string;
};

export const DEPRECATED_Toggle = ({
  checked,
  onChange,
  className = '',
  disabled = false,
  inline = false,
  text = '',
}: ToggleProps) => {
  const inputProps = {
    checked,
    disabled,
    onChange,
  };
  const cssPrefix = 'custom-togglebtn';
  const containerClass = classnames(
    cssPrefix,
    {
      [`${cssPrefix}--inline`]: inline,
    },
    className,
  );
  const checkboxClass = `${cssPrefix}__icon`;

  return (
    <div className={containerClass}>
      <label className={`${cssPrefix}__label`}>
        <input type="checkbox" className={`${cssPrefix}__input`} {...inputProps} />
        <span className={checkboxClass} />
        {text && <span className={`${cssPrefix}__text`}>{text}</span>}
      </label>
    </div>
  );
};
