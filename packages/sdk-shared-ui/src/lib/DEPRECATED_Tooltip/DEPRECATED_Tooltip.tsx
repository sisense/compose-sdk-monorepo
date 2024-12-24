/* eslint-disable @typescript-eslint/naming-convention */
import React from 'react';
import classnames from 'classnames';
import RcTooltip from 'rc-tooltip';
import type { TooltipProps } from 'rc-tooltip/lib/Tooltip';

import styles from './DEPRECATED_Tooltip.module.scss';
import { styleguideConstants } from '../constants/styleguideConstants';

export type DEPRECATED_TooltipProps = {
  breakingLongWord?: boolean;
  hideArrow?: boolean;
  onClick?: (ev: MouseEvent) => void;
  overlayClassName?: string;
  zIndex?: number;
  imgOverlay?: boolean;
  semanticText?: boolean;
} & TooltipProps;

const DEPRECATED_Tooltip = (
  props: React.PropsWithChildren<DEPRECATED_TooltipProps>,
): JSX.Element => {
  const {
    breakingLongWord,
    hideArrow = false,
    overlayClassName,
    overlay,
    imgOverlay = false,
    semanticText,
    ...otherProps
  } = props;

  const overlayClasses = classnames(
    overlayClassName,
    'slf-default',
    styleguideConstants.SISENSE_NAMESPACE,
    {
      'hide-arrow': hideArrow,
      [styles.breakLongWord]: breakingLongWord,
      [styles.semanticText]: semanticText,
      [styles.semanticText]: semanticText,
    },
  );

  const getOverlay = () => {
    if (typeof overlay === 'string') {
      if (imgOverlay) {
        return <img src={overlay} />;
      } else {
        return <div dangerouslySetInnerHTML={{ __html: overlay }} />;
      }
    }

    return overlay;
  };

  return (
    <RcTooltip
      destroyTooltipOnHide
      overlay={getOverlay()}
      {...otherProps}
      overlayClassName={overlayClasses}
    />
  );
};

export default DEPRECATED_Tooltip;
export { DEPRECATED_Tooltip };
