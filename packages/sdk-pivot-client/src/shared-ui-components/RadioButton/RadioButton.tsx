import React from 'react';
import classnames from 'classnames';

import style from './RadioButton.module.scss';

export type RadioButtonProps = {
  checked: boolean;
  value: string;
  text: string;
  disabled?: boolean;
  inline?: boolean;
  name?: string;
  onChange: (evt: React.ChangeEvent<HTMLInputElement>) => void;
  preventClick?: boolean;
  title?: string;
  inputRadioButtonClassName?: string;
  className?: string;
  textClassName?: string;
  dataTestId?: string;
};

export const RadioButton = ({
  checked,
  text,
  disabled = false,
  inline = false,
  title = '',
  name = '',
  value,
  onChange,
  preventClick,
  inputRadioButtonClassName,
  className,
  textClassName,
  dataTestId = undefined,
}: RadioButtonProps) => {
  const inputProps = {
    disabled,
    name,
    value,
    ...(title && !disabled && { title }),
  };
  const handleChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    if (preventClick) {
      evt.preventDefault();
      evt.stopPropagation();
      return;
    }

    onChange(evt);
  };

  const radioButtonClasses = classnames(
    'custom-radiobtn',
    {
      'custom-radiobtn--inline': inline,
      [style.disabled]: disabled,
    },
    className,
  );

  return (
    <div className={radioButtonClasses}>
      <label className="custom-radiobtn__label">
        <div
          className={classnames(
            style.sharedComponentsInputRadioButton,
            inputRadioButtonClassName,
            {},
          )}
        >
          <input
            className="custom-radiobtn__input"
            type="radio"
            onChange={handleChange}
            checked={checked}
            data-testid={dataTestId}
            {...inputProps}
          />
          <span className="custom-radiobtn__icon" />
        </div>
        <span className={classnames('custom-radiobtn__text', textClassName)}>{text}</span>
      </label>
    </div>
  );
};
