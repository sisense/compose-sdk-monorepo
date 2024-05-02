/* eslint-disable @typescript-eslint/naming-convention */
import React from 'react';
import styles from './switcher.module.scss';
import classnames from 'classnames';

type callback = (e: React.MouseEvent<HTMLDivElement>) => void;

type Props = {
  active: boolean;
  onClick?: callback;
  disabled?: boolean;
};

export const Switcher = ({ active, onClick, disabled }: Props) => {
  const themeSettings = { general: { brandColor: '#ffcb05' } };
  let color = '#ffcb05';
  if (
    themeSettings &&
    themeSettings.general.brandColor &&
    themeSettings.general.brandColor !== '#ffcb05'
  ) {
    color = themeSettings.general.brandColor;
  }

  return active ? (
    <div
      className={classnames(styles.component, {
        [styles.disabled]: !!disabled,
      })}
      onClick={disabled ? undefined : onClick}
    >
      <SwitcherOnColored color={color} />
    </div>
  ) : (
    <div className={styles.component}>
      <div
        className={classnames(styles.switcher, {
          [styles.inactive]: !active,
          [styles.disabled]: !!disabled,
        })}
        onClick={disabled ? undefined : onClick}
      />
    </div>
  );
};

export const SwitcherOnColored = ({ color }: { color: string }) => {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M6.32353 17.0024H16.6765C19.0853 17.0024 21 14.9858 21 12.3884C21 9.79086 19.0853 8 16.6765 8H6.32353C3.91471 8 2 9.79086 2 12.3884C2 14.9858 3.91471 17.0024 6.32353 17.0024Z"
        fill={color}
      />
      <path
        d="M16.5 17.5C13.7386 17.5 11.5 15.2614 11.5 12.5C11.5 9.73858 13.7386 7.5 16.5 7.5C19.2614 7.5 21.5 9.73858 21.5 12.5C21.5 15.2614 19.2614 17.5 16.5 17.5Z"
        fill="white"
        stroke="#C4C8CD"
      />
    </svg>
  );
};
