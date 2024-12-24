import React, { ChangeEvent, MouseEvent } from 'react';
import classnames from 'classnames';

import { DEPRECATED_Icon } from '../DEPRECATED_Icon';

import style from './Checkbox.module.scss';

// eslint-disable-next-line @typescript-eslint/naming-convention
export type DEPRECATED_CheckboxProps = {
  checked: boolean;
  className?: string;
  disabled?: boolean;
  inline?: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;

  // The description is the icon and text. If undefined, use onChange.
  onDescriptionClick?: () => void;
  text?: string;
  textClassName?: string;
  title?: string;
  transparent?: boolean;
  dataTestId?: string;
  iconName?: string;
  inputCheckboxClassName?: string;
};

// eslint-disable-next-line @typescript-eslint/naming-convention
const DEPRECATED_Checkbox = (props: DEPRECATED_CheckboxProps) => {
  const {
    className,
    disabled,
    inline,
    text,
    textClassName,
    title,
    transparent,
    dataTestId,
    iconName,
    onDescriptionClick,
    inputCheckboxClassName,
    ...otherProps
  } = props;

  const propsPassedToInput: any = { disabled, ...otherProps };
  if (title && !disabled) {
    // eslint-disable-next-line
    propsPassedToInput.title = title;
  }

  const cssPrefix = 'custom-checkbox';

  const containerClass = classnames(
    cssPrefix,
    {
      'custom-checkbox--inline': inline,
      [style.disabled]: disabled,
    },
    className,
  );
  const checkboxClass = classnames(`${cssPrefix}__icon`, 'app-icon app-icon--form-checkbox-mark', {
    [style.transparent]: transparent,
  });
  const textClass = classnames(`${cssPrefix}__text`, textClassName);
  const onDescriptionClickWrapper = onDescriptionClick
    ? (e: MouseEvent) => {
        onDescriptionClick();
        e.preventDefault();
      }
    : undefined;

  return (
    <div className={containerClass}>
      <label className={`${cssPrefix}__label`}>
        <div className={classnames(style.sharedComponentsInputCheckbox, inputCheckboxClassName)}>
          <input
            type="checkbox"
            className={`${cssPrefix}__input`}
            data-testid={dataTestId}
            {...propsPassedToInput}
          />
          <span className={checkboxClass}>
            <svg className="app-icon__svg">
              <use xlinkHref="#form-checkbox-mark" />
            </svg>
          </span>
        </div>
        {iconName && (
          <DEPRECATED_Icon
            name={iconName}
            className={style.icon}
            onClick={onDescriptionClickWrapper}
          />
        )}
        <span className={textClass} onClick={onDescriptionClickWrapper}>
          {text}
        </span>
      </label>
    </div>
  );
};

export default DEPRECATED_Checkbox;
export { DEPRECATED_Checkbox };
