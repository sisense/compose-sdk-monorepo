import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { DEPRECATED_Icon } from '../DEPRECATED_Icon';

import styles from './DEPRECATED_Button.module.scss';

export type ButtonProps = {
  allowDisabledTitle?: boolean;
  className?: string;
  disabled?: boolean;
  hoverSuffix?: string;
  iconClassName?: string;
  iconName?: string;
  transparent?: boolean;
  text?: string;
  trailingIconName?: string;
  title?: string;
  dark?: boolean;
  gray?: boolean;
  secondary?: boolean;
  dataTestId?: string;
  ariaLabel?: React.AriaAttributes['aria-label'];
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

// Used since in sisense-styleguide repo, there is a new line between the icon span and the text span
// The browser shows this new line as a space between the button spans and the text,
// so we are doing it as well until the styleguide will be changed
const SPACE = ' ';

// eslint-disable-next-line @typescript-eslint/naming-convention
const DEPRECATED_Button = (props: ButtonProps) => {
  const {
    allowDisabledTitle,
    className,
    disabled,
    hoverSuffix,
    iconClassName,
    iconName,
    transparent,
    text,
    trailingIconName,
    title,
    dark,
    gray,
    secondary,
    dataTestId,
    ariaLabel = 'button',
    ...otherProps
  } = props;

  const isIconOnlyComponent = !text;

  const buttonClass = classNames(
    'btn',
    {
      'btn--disabled': disabled,
      'btn--transp': transparent,
      'btn--dark': dark,
      'btn--icon': isIconOnlyComponent,
      'btn--gray': gray,
      [styles.btnSecondary]: secondary,
    },
    styles.sharedComponentsButton,
    className,
  );

  const iconClass = classNames('btn__icon', iconClassName);
  const iconComponent = iconName && (
    <DEPRECATED_Icon
      className={iconClass}
      name={iconName}
      disabled={disabled}
      hoverSuffix={hoverSuffix}
    />
  );

  const textClass = classNames('btn__text', styles.sharedComponentsButtonText);
  const textComponent = text && <span className={textClass}>{text}</span>;

  const spaceComponent = iconComponent && textComponent && SPACE;
  const trailingIconComponent = trailingIconName && (
    <DEPRECATED_Icon
      className={iconClass}
      name={trailingIconName}
      disabled={disabled}
      hoverSuffix={hoverSuffix}
    />
  );

  const extraProps = {
    disabled,
    title: title && (!disabled || allowDisabledTitle) ? title : undefined,
    ...otherProps,
  };

  return (
    <button {...extraProps} className={buttonClass} data-testid={dataTestId} aria-label={ariaLabel}>
      {iconComponent}
      {spaceComponent}
      {textComponent}
      {trailingIconComponent}
    </button>
  );
};

DEPRECATED_Button.propTypes = {
  allowDisabledTitle: PropTypes.bool,
  className: PropTypes.string,
  disabled: PropTypes.bool,
  hoverSuffix: PropTypes.string,
  iconClassName: PropTypes.string,
  iconName: PropTypes.string,
  onClick: PropTypes.func.isRequired,
  text: PropTypes.string,
  title: PropTypes.string,
  trailingIconName: PropTypes.string,
  transparent: PropTypes.bool,
  dark: PropTypes.bool,
  gray: PropTypes.bool,
};

DEPRECATED_Button.defaultProps = {
  allowDisabledTitle: false,
};

export default DEPRECATED_Button;
export { DEPRECATED_Button }; // Named export
