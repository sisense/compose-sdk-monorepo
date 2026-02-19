// @ts-ignore
import css from 'dom-css';

let scrollbarWidth: boolean | number = false;
let oldDevicePixelRatio = 0;

export default function getScrollbarWidth(): number {
  const devicePixelRatio = window.devicePixelRatio || 1;
  if (
    scrollbarWidth !== false &&
    scrollbarWidth !== 0 &&
    devicePixelRatio === oldDevicePixelRatio
  ) {
    // return scrollbarWidth as number;
  }
  oldDevicePixelRatio = devicePixelRatio;
  /* istanbul ignore else */
  if (typeof document !== 'undefined') {
    let widthTestDiv = document.querySelector('.csdk-pivot-scrollbar-width-checker') as HTMLElement;
    if (!widthTestDiv) {
      widthTestDiv = document.createElement('div');
      widthTestDiv.className = 'csdk-pivot-scrollbar-width-checker';
      css(widthTestDiv, {
        width: 100,
        height: 100,
        position: 'absolute',
        top: -9999,
        overflow: 'scroll',
        MsOverflowStyle: 'scrollbar',
      });
      let host = document.querySelector('.pivot-container');
      if (!host) {
        host = document.body;
        // do not cache such value
        oldDevicePixelRatio = -1;
      }
      host.appendChild(widthTestDiv);
    }

    scrollbarWidth = widthTestDiv.offsetWidth - widthTestDiv.clientWidth;
  } else {
    scrollbarWidth = 0;
  }

  return scrollbarWidth || 0;
}
