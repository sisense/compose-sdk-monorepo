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
    const div = document.createElement('div');
    css(div, {
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
    host.appendChild(div);
    scrollbarWidth = div.offsetWidth - div.clientWidth;
    host.removeChild(div);
  } else {
    scrollbarWidth = 0;
  }

  return scrollbarWidth || 0;
}
