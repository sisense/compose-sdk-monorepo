import * as React from 'react';

import { RESIZE_CONTROL } from './classes.js';

type Props = {
  onResizeStart: () => number;
  onResize: (widthAfterResize: number) => void;
  onResizeEnd: (widthAfterResize: number) => void;
};

const isHorizontalDirection = (movementX?: number): boolean => {
  const isInternetExplorer = typeof movementX === 'undefined';
  if (isInternetExplorer) {
    return true;
  }

  return !!movementX;
};

export class ResizeColumnControl extends React.Component<Props> {
  resizeControlPosition: number = 0;

  widthAfterResize: number = 0;

  currentElementWidth: number = 0;

  shouldComponentUpdate() {
    return false;
  }

  /**
   * Handler for resize element
   *
   * @param {any} event - event for resize
   * @returns {void} - return nothing
   * @private
   */
  resizeElement(event: any): void {
    const { onResize } = this.props;
    const { movementX, clientX } = event;

    if (isHorizontalDirection(movementX)) {
      const mouseHorizontalPosition = clientX;
      const elementWidth = this.resizeControlPosition - this.currentElementWidth;
      this.widthAfterResize = mouseHorizontalPosition - elementWidth;

      onResize(this.widthAfterResize);
    }
  }

  onMouseDown = (mouseDownEvent: any): void => {
    mouseDownEvent.preventDefault();

    this.currentElementWidth = this.props.onResizeStart();
    this.resizeControlPosition = mouseDownEvent.clientX;

    window.addEventListener('mouseup', this.onHandleUp);
    window.addEventListener('mousemove', this.onHandleResize);
  };

  onClick = (e: React.SyntheticEvent<HTMLDivElement, MouseEvent | KeyboardEvent>): void => {
    e.stopPropagation();
  };

  onHandleUp = (mouseUpEvent: any): void => {
    const { clientX } = mouseUpEvent;
    if (!this.widthAfterResize) {
      const mouseHorizontalPosition = clientX;
      const elementWidth = this.resizeControlPosition - this.currentElementWidth;
      this.widthAfterResize = mouseHorizontalPosition - elementWidth;
    }

    this.props.onResizeEnd(this.widthAfterResize);

    window.removeEventListener('mousemove', this.onHandleResize, false);
    window.removeEventListener('mouseup', this.onHandleUp, false);
  };

  onHandleResize = (event: any): void => {
    this.resizeElement(event);
  };

  render() {
    return (
      <div
        className={RESIZE_CONTROL}
        onMouseDownCapture={this.onMouseDown}
        onClick={this.onClick}
        role="button"
        aria-label="Resize control"
        tabIndex={0}
        onKeyPress={this.onClick}
      />
    );
  }
}

export default ResizeColumnControl;
