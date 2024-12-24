import React from 'react';
import ReactDOM from 'react-dom';
import classNames from 'classnames';
import type { TooltipProps } from 'rc-tooltip/lib/Tooltip';

import { DEPRECATED_Tooltip } from '../DEPRECATED_Tooltip';

import type { PositioningConfig } from './align.interface';

const noop = () => {};

import styles from './Popover.module.scss';

const DEFAULT_Z_INDEX = 1069;

export type PopoverProps = Pick<
  TooltipProps,
  'children' | 'onVisibleChange' | 'overlay' | 'placement' | 'trigger' | 'visible' | 'overlayStyle'
> & {
  align?: PositioningConfig;
  level?: number;
  bubbleMouseEvents?: boolean;
  mask?: boolean;
  maskClassName?: string;
  onRequestClose?: (ev: Event) => void;
  zIndex?: number;
  getTooltipContainer?: () => HTMLElement;
};

const Popover = (props: PopoverProps): JSX.Element => {
  const {
    bubbleMouseEvents = false,
    level = 0,
    mask: maskVisible = true,
    onRequestClose = noop,
    visible = false,
    zIndex = DEFAULT_Z_INDEX,
    maskClassName,
    getTooltipContainer,
  } = props;

  const getMaskContainer = () => {
    let container = document.body;

    if (getTooltipContainer) {
      container = getTooltipContainer();
    }

    return container;
  };

  const onClick = (e: Event) => {
    if (bubbleMouseEvents) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <>
      {visible && maskVisible && (
        <PortalFunctionalComponentWrapper portalRootEl={getMaskContainer()}>
          <div
            className={classNames(styles.popoverMask, maskClassName)}
            style={{ zIndex: (zIndex + level).toString() }}
            onClick={(event) => onRequestClose?.(event.nativeEvent)}
          />
        </PortalFunctionalComponentWrapper>
      )}
      <DEPRECATED_Tooltip
        {...props}
        overlayClassName={styles.popover}
        hideArrow
        onClick={onClick}
        zIndex={zIndex + level + 1}
        align={props.align}
      />
    </>
  );
};

const PortalFunctionalComponentWrapper = (props: {
  children: React.ReactNode;
  portalRootEl: HTMLElement;
}) => {
  return ReactDOM.createPortal(props.children, props.portalRootEl);
};

export default Popover;
export { Popover };
