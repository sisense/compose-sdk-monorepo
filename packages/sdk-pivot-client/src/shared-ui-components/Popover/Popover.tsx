import React, { forwardRef } from 'react';
import ReactDOM from 'react-dom';
import classNames from 'classnames';
import * as RcTooltip from 'rc-tooltip';

import { DEPRECATED_Tooltip } from '../DEPRECATED_Tooltip';

import type { PositioningConfig } from './align.interface';

const noop = () => {};

import styles from './Popover.module.scss';

const DEFAULT_Z_INDEX = 1069;

export type PopoverProps = Pick<
  RcTooltip.RCTooltip.Props,
  | 'children'
  | 'onVisibleChange'
  | 'overlay'
  | 'placement'
  | 'trigger'
  | 'visible'
  | 'getTooltipContainer'
  | 'overlayStyle'
> & {
  align?: PositioningConfig;
  level?: number;
  bubbleMouseEvents?: boolean;
  mask?: boolean;
  maskClassName?: string;
  onRequestClose?: (ev: Event) => void;
  zIndex?: number;
};

export const Popover = forwardRef<HTMLDivElement, PopoverProps>((props, ref): JSX.Element => {
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
      container = getTooltipContainer() as HTMLElement;
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
        ref={ref}
        {...props}
        overlayClassName={styles.popover}
        hideArrow
        onClick={onClick}
        zIndex={zIndex + level + 1}
      />
    </>
  );
});

const PortalFunctionalComponentWrapper = (props: {
  children: React.ReactNode;
  portalRootEl: HTMLElement;
}) => {
  return ReactDOM.createPortal(props.children, props.portalRootEl);
};
