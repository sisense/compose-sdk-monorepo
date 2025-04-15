import classNames from 'classnames';
import React, { MouseEventHandler, useState } from 'react';

import styles from './DEPRECATED_Icon.module.scss';

// eslint-disable-next-line @typescript-eslint/naming-convention
export type DEPRECATED_IconProps = {
  className?: string;
  disabled?: boolean;
  hoverSuffix?: string;
  name: string;
  onClick?: MouseEventHandler<HTMLSpanElement>;
  onMouseEnter?: MouseEventHandler<HTMLSpanElement>;
  onMouseLeave?: MouseEventHandler<HTMLSpanElement>;
  spin?: boolean;
  title?: string;
  dataTestId?: string;
} & React.HTMLAttributes<HTMLSpanElement>;

const noop = () => {};

// eslint-disable-next-line @typescript-eslint/naming-convention
const DEPRECATED_Icon = (props: DEPRECATED_IconProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const {
    className = '',
    disabled = false,
    name,
    hoverSuffix = '',
    onClick = noop,
    onMouseEnter = noop,
    onMouseLeave = noop,
    title = '',
  } = props;
  const handleMouseEnter = (evt: React.MouseEvent<HTMLSpanElement>) => {
    if (!isHovered) setIsHovered(true);

    onMouseEnter(evt);
  };
  const handleMouseLeave = (evt: React.MouseEvent<HTMLSpanElement>) => {
    if (isHovered) setIsHovered(false);

    onMouseLeave(evt);
  };

  const iconStyle = { top: 'auto' };
  const iconName = !disabled && isHovered && hoverSuffix ? `${name}${hoverSuffix}` : name;
  const iconClassName = classNames('app-icon', `app-icon--${iconName}`);
  const svgClassName = classNames('app-icon__svg');
  const iconClass = classNames(iconClassName, className, {
    [styles.clickable]: onClick !== noop,
    [styles.disabled]: disabled,
  });

  const { dataTestId, ...spanProps } = props;
  const extraProps = { disabled, onClick, ...spanProps };

  if (title && !disabled) {
    extraProps.title = title;
  }
  delete extraProps.hoverSuffix;

  return (
    <span
      {...extraProps}
      className={iconClass}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      data-testid={dataTestId}
    >
      <svg className={svgClassName} style={iconStyle}>
        <use xlinkHref={`#${iconName}`} />
        <symbol id="general-arrow-down" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M12 13.84l3.174-2.719a.5.5 0 0 1 .65.76l-3.5 2.998a.5.5 0 0 1-.65 0l-3.5-2.998a.5.5 0 1 1 .65-.76L12 13.841z"
          ></path>
        </symbol>
        <symbol id="general-vi-small-white" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M8.354 11.646l-.708.708 3.418 3.417 5.343-7.48-.814-.582-4.657 6.52z"
          ></path>
        </symbol>
      </svg>
    </span>
  );
};

export default DEPRECATED_Icon;
export { DEPRECATED_Icon }; // Named export
