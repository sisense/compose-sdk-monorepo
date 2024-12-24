import React, { useState, useRef, useEffect, MouseEventHandler } from 'react';
import classnames from 'classnames';

import { DEPRECATED_Icon } from '../DEPRECATED_Icon';

import styles from './Input.module.scss';

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'small' | 'onChange'> {
  className?: string;
  inputClassName?: string;
  onChange: (value: string) => void;
  onClicked?: MouseEventHandler;
  onBlur?: () => void;
  placeholder?: string;
  search?: boolean;
  dataTestId?: string;
  defaultValue?: string;
  value?: string;
  autoFocus?: boolean;
  clearable?: boolean;
  password?: boolean;
  disabled?: boolean;
  size?: 'small' | 'large';
  icon?: { name: string; placement?: 'right' | 'left' };
  trimInput?: boolean;
  ariaLabel?: React.AriaAttributes['aria-label'];
}

const Input = (props: InputProps): JSX.Element => {
  const {
    className,
    inputClassName,
    onChange,
    onClicked,
    onBlur = () => {},
    placeholder,
    search,
    dataTestId,
    defaultValue,
    value,
    autoFocus,
    clearable,
    password,
    disabled = false,
    size,
    icon,
    trimInput,
    ariaLabel = 'input',
  } = props;

  const [inputValue, setInputValue] = useState(defaultValue || value || '');
  const [passwordIsVisible, setPasswordIsVisible] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { name: iconName = '', placement: iconPlacement } = icon || {};

  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  return (
    <div className={classnames(styles.component, className)}>
      {search && (
        <DEPRECATED_Icon
          className={classnames(styles.searchIcon, {
            [styles.large]: size === 'large',
          })}
          name="general-search-small"
        />
      )}
      <input
        className={classnames(styles.input, inputClassName, {
          [styles.withLeftIcon]: search || (icon && iconPlacement === 'left'),
          [styles.large]: size === 'large',
        })}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => {
          const value = trimInput ? e.target.value.trim() : e.target.value;
          onChange(value);
          setInputValue(e.target.value);
        }}
        onClick={onClicked}
        onBlur={onBlur}
        data-testid={dataTestId}
        defaultValue={defaultValue}
        value={value ?? inputValue}
        autoFocus={autoFocus}
        type={password && !passwordIsVisible ? 'password' : 'text'}
        ref={inputRef}
        aria-label={ariaLabel}
      />
      {clearable && !password && !icon && (
        <DEPRECATED_Icon
          className={classnames(styles.clearIcon, {
            [styles.clearIconHidden]: inputValue === '',
            [styles.large]: size === 'large',
          })}
          name="general-x"
          onClick={() => {
            setInputValue('');
            onChange('');
          }}
          onMouseDown={(e) => e.preventDefault()}
        />
      )}
      {password && (
        <DEPRECATED_Icon
          className={classnames(styles.passwordVisibilityIcon, {
            [styles.large]: size === 'large',
          })}
          name={passwordIsVisible ? 'general-unhide' : 'general-show'}
          onClick={() => {
            setPasswordIsVisible(!passwordIsVisible);
          }}
          onMouseDown={(e) => e.preventDefault()}
        />
      )}
      {icon && !clearable && !password && (
        <DEPRECATED_Icon
          className={classnames(styles.customIcon, {
            [styles.large]: size === 'large',
            [styles.isLeft]: iconPlacement === 'left',
          })}
          name={iconName}
        />
      )}
    </div>
  );
};

export default Input;
export { Input };
