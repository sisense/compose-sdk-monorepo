// @ts-ignore
import * as React from 'react';

// @ts-ignore
import css from 'dom-css';
import raf, { cancel as caf } from 'raf';

import {
  renderThumbHorizontalDefault,
  renderThumbVerticalDefault,
  renderTrackHorizontalDefault,
  renderTrackVerticalDefault,
} from './defaultRenderElements.js';
import {
  containerStyleAutoHeight,
  containerStyleDefault,
  disableSelectStyle,
  disableSelectStyleReset,
  thumbHorizontalStyleDefault,
  thumbVerticalStyleDefault,
  trackHorizontalStyleDefault,
  trackVerticalStyleDefault,
  viewStyleAutoHeight,
  viewStyleDefault,
} from './styles/index.js';
import { CustomScrollI } from './types.js';
import { getInnerHeight, getInnerWidth, getScrollbarWidth, isString } from './utils/index.js';

type TrackGetter = (options: any) => React.ReactNode | React.ReactPortal;

type Props = {
  onScroll?: Function;
  renderTrackHorizontal: TrackGetter;
  renderTrackVertical: TrackGetter;
  renderThumbHorizontal: (options: any) => React.ReactNode;
  renderThumbVertical: (options: any) => React.ReactNode;
  thumbSize?: number;
  thumbMinSize: number;
  hideTracksWhenNotNeeded?: boolean;
  autoHide?: boolean;
  autoHideTimeout: number;
  autoHideDuration: number;
  autoHeight?: boolean;
  autoHeightMin: number | string;
  autoHeightMax: number | string;
  style?: React.CSSProperties;
  children?: any;
  className?: string;
  scrollOffset?: number;
};

export class CustomScroll extends React.PureComponent<Props> implements CustomScrollI {
  view: HTMLDivElement = document.createElement('div');

  trackHorizontal: HTMLDivElement = document.createElement('div');

  trackVertical: HTMLDivElement = document.createElement('div');

  thumbHorizontal: HTMLDivElement = document.createElement('div');

  thumbVertical: HTMLDivElement = document.createElement('div');

  requestFrame: number | undefined;

  prevPageX: number = 0;

  prevPageY: number = 0;

  dragging: boolean = false;

  hideTracksTimeout: any = null;

  detectScrollingInterval: any = null;

  trackMouseOver: boolean = false;

  viewScrollTop: number = 0;

  lastViewScrollTop: number = 0;

  viewScrollLeft: number = 0;

  lastViewScrollLeft: number = 0;

  scrolling: boolean = false;

  static defaultProps = {
    renderTrackHorizontal: renderTrackHorizontalDefault,
    renderTrackVertical: renderTrackVerticalDefault,
    renderThumbHorizontal: renderThumbHorizontalDefault,
    renderThumbVertical: renderThumbVerticalDefault,
    thumbMinSize: 30,
    hideTracksWhenNotNeeded: false,
    autoHide: false,
    autoHideTimeout: 1000,
    autoHideDuration: 200,
    autoHeight: false,
    autoHeightMin: 0,
    autoHeightMax: 200,
    scrollOffset: 0,
  };

  componentDidMount() {
    this.addListeners();
    this.update();
  }

  componentDidUpdate() {
    this.update();
  }

  componentWillUnmount() {
    this.removeListeners();
    caf(this.requestFrame as number);
    if (this.hideTracksTimeout) {
      clearTimeout(this.hideTracksTimeout);
    }
    if (this.detectScrollingInterval) {
      clearInterval(this.detectScrollingInterval);
    }
  }

  /**
   * returns all dimensions
   *
   * @returns {object} - CustomScroll scroll and size params
   * @private
   */
  getMeasurements() {
    const {
      scrollLeft = 0,
      scrollTop = 0,
      scrollWidth = 0,
      scrollHeight = 0,
      clientWidth = 0,
      clientHeight = 0,
    } = this.view || {};

    return {
      left: scrollLeft / (scrollWidth - clientWidth) || 0,
      top: scrollTop / (scrollHeight - clientHeight) || 0,
      scrollLeft,
      scrollTop,
      scrollWidth,
      scrollHeight,
      clientWidth,
      clientHeight,
    };
  }

  /**
   * calculates horizontal thumb's width
   *
   * @returns {number} - horizontal thumb width
   * @private
   */
  getThumbHorizontalWidth() {
    const { scrollWidth, clientWidth } = this.view;
    return this.getThumbDimension(scrollWidth, clientWidth, false);
  }

  /**
   * calculates vertical thumb's height
   *
   * @returns {number} - vertical thumb height
   * @private
   */
  getThumbVerticalHeight() {
    const { scrollHeight, clientHeight } = this.view;
    return this.getThumbDimension(scrollHeight, clientHeight, true);
  }

  /**
   * calculates thumb's dimension
   *
   * @param {number} scrollDimension - scroll width | height
   * @param {number} clientDimension - client width | height
   * @param {boolean} isVertical - handle calculations for horizontal or vertical
   * @returns {number} -thumb dimension
   * @private
   */
  getThumbDimension(scrollDimension: number, clientDimension: number, isVertical: boolean) {
    const { thumbSize, thumbMinSize } = this.props;
    const trackDimension = isVertical
      ? getInnerHeight(this.trackVertical)
      : getInnerWidth(this.trackHorizontal);
    const dimension = Math.ceil((clientDimension / scrollDimension) * trackDimension);
    if (Math.abs(trackDimension - dimension) <= 2) return 0;
    if (thumbSize) return thumbSize;
    return Math.max(dimension, thumbMinSize);
  }

  /**
   * Calculates scrollLeft by offset arg
   *
   * @param {number} offset - offset to calulate by
   * @returns {number} - scrollLeft by offset
   * @private
   */
  getScrollLeftForOffset(offset: number) {
    const { scrollWidth, clientWidth } = this.view;
    const trackWidth = getInnerWidth(this.trackHorizontal);
    const thumbWidth = this.getThumbHorizontalWidth();
    return (offset / (trackWidth - thumbWidth)) * (scrollWidth - clientWidth);
  }

  /**
   * Calculates scrollTop by offset arg
   *
   * @param {number} offset - offset to calulate by
   * @returns {number} - scrollTop by offset
   * @private
   */
  getScrollTopForOffset(offset: number) {
    const { scrollHeight, clientHeight } = this.view;
    const trackHeight = getInnerHeight(this.trackVertical);
    const thumbHeight = this.getThumbVerticalHeight();
    return (offset / (trackHeight - thumbHeight)) * (scrollHeight - clientHeight);
  }

  /**
   * initial DOM components listeners attach
   *
   * @returns {void}
   * @private
   */
  addListeners() {
    /* istanbul ignore if */
    if (typeof document === 'undefined' || !this.view) return;
    const { view, trackHorizontal, trackVertical, thumbHorizontal, thumbVertical } = this;
    view.addEventListener('scroll', this.handleScroll);
    trackHorizontal.addEventListener('mouseenter', this.handleTrackMouseEnter);
    trackHorizontal.addEventListener('mouseleave', this.handleTrackMouseLeave);
    trackHorizontal.addEventListener('mousedown', this.handleHorizontalTrackMouseDown);
    trackVertical.addEventListener('mouseenter', this.handleTrackMouseEnter);
    trackVertical.addEventListener('mouseleave', this.handleTrackMouseLeave);
    trackVertical.addEventListener('mousedown', this.handleVerticalTrackMouseDown);
    thumbHorizontal.addEventListener('mousedown', this.handleHorizontalThumbMouseDown);
    thumbVertical.addEventListener('mousedown', this.handleVerticalThumbMouseDown);
    window.addEventListener('resize', this.handleWindowResize);
  }

  /**
   * initial DOM components listeners remove
   *
   * @returns {void}
   * @private
   */
  removeListeners() {
    /* istanbul ignore if */
    if (typeof document === 'undefined' || !this.view) return;
    const { view, trackHorizontal, trackVertical, thumbHorizontal, thumbVertical } = this;
    view.removeEventListener('scroll', this.handleScroll);
    trackHorizontal.removeEventListener('mouseenter', this.handleTrackMouseEnter);
    trackHorizontal.removeEventListener('mouseleave', this.handleTrackMouseLeave);
    trackHorizontal.removeEventListener('mousedown', this.handleHorizontalTrackMouseDown);
    trackVertical.removeEventListener('mouseenter', this.handleTrackMouseEnter);
    trackVertical.removeEventListener('mouseleave', this.handleTrackMouseLeave);
    trackVertical.removeEventListener('mousedown', this.handleVerticalTrackMouseDown);
    thumbHorizontal.removeEventListener('mousedown', this.handleHorizontalThumbMouseDown);
    thumbVertical.removeEventListener('mousedown', this.handleVerticalThumbMouseDown);
    window.removeEventListener('resize', this.handleWindowResize);
    // Possibly setup by `handleDragStart`
    this.teardownDragging();
  }

  /**
   * Tracks display during scroll handler
   *
   * @param {boolean} shouldStart - start status | stop status
   * @returns {void}
   * @private
   */
  handleScrollAutoHide(shouldStart: boolean = true) {
    const { autoHide } = this.props;
    if (!autoHide) return;
    if (shouldStart) {
      this.showTracks();
    } else {
      this.hideTracks();
    }
  }

  /**
   * Sets listeners on dragging
   *
   * @returns {void}
   * @private
   */
  setupDragging() {
    css(document.body, disableSelectStyle);
    document.addEventListener('mousemove', this.handleDrag);
    document.addEventListener('mouseup', this.handleDragEnd);
    document.onselectstart = () => false;
  }

  /**
   * Removes listeners on dragging
   *
   * @returns {void}
   * @private
   */
  teardownDragging() {
    css(document.body, disableSelectStyleReset);
    document.removeEventListener('mousemove', this.handleDrag);
    document.removeEventListener('mouseup', this.handleDragEnd);
    // @ts-ignore
    document.onselectstart = undefined;
  }

  /**
   * Sets status 'drag' and setups dragging
   *
   * @param {Event} event - standard drag event
   * @returns {void}
   * @private
   */
  handleDragStart(event: Event) {
    this.dragging = true;
    event.stopImmediatePropagation();
    this.setupDragging();
  }

  /**
   * Tracks last scroll position
   *
   * @returns {void}
   * @private
   */
  handleDragEndAutoHide() {
    const { autoHide } = this.props;
    if (!autoHide) return;
    this.hideTracks();
  }

  /**
   * Tracks last scroll position
   *
   * @returns {void}
   * @private
   */
  handleTrackMouseEnterAutoHide() {
    const { autoHide } = this.props;
    if (!autoHide) return;
    this.showTracks();
  }

  /**
   * Tracks last scroll position
   *
   * @returns {void}
   * @private
   */
  handleTrackMouseLeaveAutoHide() {
    const { autoHide } = this.props;
    if (!autoHide) return;
    this.hideTracks();
  }

  /**
   * Tracks last scroll position
   *
   * @returns {void}
   * @private
   */
  showTracks() {
    clearTimeout(this.hideTracksTimeout);
    css(this.trackHorizontal, { opacity: 1 });
    css(this.trackVertical, { opacity: 1 });
  }

  /**
   * Tracks last scroll position
   *
   * @returns {void}
   * @private
   */
  hideTracks() {
    if (this.dragging || this.trackMouseOver || this.scrolling) return;
    const { autoHideTimeout } = this.props;
    clearTimeout(this.hideTracksTimeout);
    this.hideTracksTimeout = setTimeout(() => {
      css(this.trackHorizontal, { opacity: 0 });
      css(this.trackVertical, { opacity: 0 });
    }, autoHideTimeout);
  }

  /**
   * Tracks last scroll position
   *
   * @returns {void}
   * @private
   */
  detectScrolling() {
    if (this.scrolling) return;
    this.scrolling = true;
    this.handleScrollAutoHide(true);
    this.detectScrollingInterval = setInterval(() => {
      if (
        this.lastViewScrollLeft === this.viewScrollLeft &&
        this.lastViewScrollTop === this.viewScrollTop
      ) {
        clearInterval(this.detectScrollingInterval);
        this.scrolling = false;
        this.handleScrollAutoHide(false);
      }
      this.lastViewScrollLeft = this.viewScrollLeft;
      this.lastViewScrollTop = this.viewScrollTop;
    }, 100);
  }

  /**
   * raf manager for function
   *
   * @param {Function} callback - raf callback
   * @returns {void}
   * @private
   */
  raf(callback: Function) {
    if (this.requestFrame) raf.cancel(this.requestFrame);
    this.requestFrame = raf(() => {
      this.requestFrame = undefined;
      callback();
    });
  }

  /**
   * CustomScroll recalculation and update
   *
   * @param {Function} callback - raf callback
   * @returns {void}
   * @private
   */
  handleUpdate(callback?: Function) {
    const { hideTracksWhenNotNeeded } = this.props;
    const values = this.getMeasurements();
    const { scrollLeft, clientWidth, scrollWidth } = values;
    const trackHorizontalWidth = getInnerWidth(this.trackHorizontal);
    const thumbHorizontalWidth = this.getThumbHorizontalWidth();
    const thumbHorizontalX =
      (scrollLeft / (scrollWidth - clientWidth)) * (trackHorizontalWidth - thumbHorizontalWidth);
    const thumbHorizontalStyle = {
      width: thumbHorizontalWidth,
      transform: `translateX(${thumbHorizontalX}px)`,
    };
    const { scrollTop, clientHeight, scrollHeight } = values;
    const trackVerticalHeight = getInnerHeight(this.trackVertical);
    const thumbVerticalHeight = this.getThumbVerticalHeight();
    const thumbVerticalY =
      (scrollTop / (scrollHeight - clientHeight)) * (trackVerticalHeight - thumbVerticalHeight);
    const thumbVerticalStyle = {
      height: thumbVerticalHeight,
      transform: `translateY(${thumbVerticalY}px)`,
    };
    if (hideTracksWhenNotNeeded) {
      const trackHorizontalStyle = {
        visibility: scrollWidth > clientWidth ? 'visible' : 'hidden',
      };
      const trackVerticalStyle = {
        visibility: scrollHeight > clientHeight ? 'visible' : 'hidden',
      };
      css(this.trackHorizontal, trackHorizontalStyle);
      css(this.trackVertical, trackVerticalStyle);
    }
    css(this.thumbHorizontal, thumbHorizontalStyle);
    css(this.thumbVertical, thumbVerticalStyle);
    if (typeof callback !== 'function') return;
    callback(values);
  }

  /**
   * CustomScroll recalculation and update with raf wrapper (public)
   *
   * @param {Function} callback - raf callback
   * @returns {void}
   */
  update(callback?: Function) {
    this.raf(() => this.handleUpdate(callback));
  }

  /**
   * Manually set scroll left
   *
   * @param {number} left - manual left
   * @returns {void}
   */
  scrollLeft(left: number = 0) {
    if (!this.view) return;
    this.view.scrollLeft = left;
  }

  /**
   * Manually set scroll top
   *
   * @param {number} top - manual top
   * @returns {void}
   */
  scrollTop(top: number = 0) {
    if (!this.view) return;
    this.view.scrollTop = top;
  }

  handleScroll = (event: Event) => {
    const { onScroll } = this.props;
    if (onScroll) onScroll(event);
    this.update((values: any) => {
      const { scrollLeft, scrollTop } = values;
      this.viewScrollLeft = scrollLeft;
      this.viewScrollTop = scrollTop;
    });
    this.detectScrolling();
  };

  handleWindowResize = () => {
    this.update();
  };

  handleDrag = (event: MouseEvent) => {
    if (this.prevPageX) {
      const { clientX } = event;
      const { left: trackLeft } = this.trackHorizontal.getBoundingClientRect();
      const thumbWidth = this.getThumbHorizontalWidth();
      const clickPosition = thumbWidth - this.prevPageX;
      const offset = -trackLeft + clientX - clickPosition;
      this.view.scrollLeft = this.getScrollLeftForOffset(offset);
    }
    if (this.prevPageY) {
      const { clientY } = event;
      const { top: trackTop } = this.trackVertical.getBoundingClientRect();
      const thumbHeight = this.getThumbVerticalHeight();
      const clickPosition = thumbHeight - this.prevPageY;
      const offset = -trackTop + clientY - clickPosition;
      this.view.scrollTop = this.getScrollTopForOffset(offset);
    }
    return false;
  };

  handleDragEnd = () => {
    this.dragging = false;
    this.prevPageY = 0;
    this.prevPageX = 0;
    this.teardownDragging();
    this.handleDragEndAutoHide();
  };

  handleHorizontalTrackMouseDown = (event: MouseEvent) => {
    event.preventDefault();
    const { target, clientX } = event;
    if (target instanceof HTMLElement) {
      const { left: targetLeft } = target.getBoundingClientRect();
      const thumbWidth = this.getThumbHorizontalWidth();
      const offset = Math.abs(targetLeft - clientX) - thumbWidth / 2;
      this.view.scrollLeft = this.getScrollLeftForOffset(offset);
    }
  };

  handleVerticalTrackMouseDown = (event: MouseEvent) => {
    event.preventDefault();
    const { target, clientY } = event;
    if (target instanceof HTMLElement) {
      const { top: targetTop } = target.getBoundingClientRect();
      const thumbHeight = this.getThumbVerticalHeight();
      const offset = Math.abs(targetTop - clientY) - thumbHeight / 2;
      this.view.scrollTop = this.getScrollTopForOffset(offset);
    }
  };

  handleHorizontalThumbMouseDown = (event: MouseEvent) => {
    event.preventDefault();
    this.handleDragStart(event);
    const { target, clientX } = event;
    if (target instanceof HTMLElement) {
      const { offsetWidth } = target;
      const { left } = target.getBoundingClientRect();
      this.prevPageX = offsetWidth - (clientX - left);
    }
  };

  handleVerticalThumbMouseDown = (event: MouseEvent) => {
    event.preventDefault();
    this.handleDragStart(event);
    const { target, clientY } = event;
    if (target instanceof HTMLElement) {
      const { offsetHeight } = target;
      const { top } = target.getBoundingClientRect();
      this.prevPageY = offsetHeight - (clientY - top);
    }
  };

  handleTrackMouseEnter = () => {
    this.trackMouseOver = true;
    this.handleTrackMouseEnterAutoHide();
  };

  handleTrackMouseLeave = () => {
    this.trackMouseOver = false;
    this.handleTrackMouseLeaveAutoHide();
  };

  setTrackVerticalRef = (ref?: HTMLDivElement | null) => {
    if (ref) {
      this.trackVertical = ref;
    }
  };

  setThumbVerticalRef = (ref?: HTMLDivElement | null) => {
    if (ref) {
      this.thumbVertical = ref;
    }
  };

  setTrackHorizontalRef = (ref?: HTMLDivElement | null) => {
    if (ref) {
      this.trackHorizontal = ref;
    }
  };

  setThumbHorizontalRef = (ref?: HTMLDivElement | null) => {
    if (ref) {
      this.thumbHorizontal = ref;
    }
  };

  setViewRef = (ref?: HTMLDivElement | null) => {
    if (ref) {
      this.view = ref;
    }
  };

  renderTracks() {
    const {
      renderThumbVertical,
      renderThumbHorizontal,
      renderTrackHorizontal,
      renderTrackVertical,
      autoHideDuration,
      autoHide,
    } = this.props;

    const trackAutoHeightStyle = {
      transition: `opacity ${autoHideDuration}ms`,
      opacity: 0,
    };

    const trackHorizontalStyle = {
      ...trackHorizontalStyleDefault,
      ...(autoHide && trackAutoHeightStyle),
    };

    const trackVerticalStyle = {
      ...trackVerticalStyleDefault,
      ...(autoHide && trackAutoHeightStyle),
    };

    const thumbVertical = renderThumbVertical({
      style: thumbVerticalStyleDefault,
      ref: this.setThumbVerticalRef,
    });

    const trackVertical = renderTrackVertical({
      key: 'trackVertical',
      style: trackVerticalStyle,
      ref: this.setTrackVerticalRef,
      children: thumbVertical,
      className: 'scroll-elem__vertical-track',
    });

    const thumbHorizontal = renderThumbHorizontal({
      style: thumbHorizontalStyleDefault,
      ref: this.setThumbHorizontalRef,
    });

    const trackHorizontal = renderTrackHorizontal({
      key: 'trackHorizontal',
      style: trackHorizontalStyle,
      ref: this.setTrackHorizontalRef,
      children: thumbHorizontal,
      className: 'scroll-elem__horizontal-track',
    });
    return [trackHorizontal, trackVertical];
  }

  render() {
    const scrollbarWidth = getScrollbarWidth();
    const { autoHeight, autoHeightMin, autoHeightMax, style, children, ...props } = this.props;

    const rootStyle: React.CSSProperties = {
      ...containerStyleDefault,
      ...(autoHeight && {
        ...containerStyleAutoHeight,
        minHeight: autoHeightMin,
        maxHeight: autoHeightMax,
      }),
      ...style,
    };

    const containerStyle: React.CSSProperties = {
      ...containerStyleDefault,
      ...(autoHeight && {
        ...containerStyleAutoHeight,
        minHeight: autoHeightMin,
        maxHeight: autoHeightMax,
      }),
      ...style,
    };

    if (typeof containerStyle.height === 'number') {
      containerStyle.height -= props.scrollOffset || 0;
    }

    const viewStyle = {
      ...viewStyleDefault,
      ...(autoHeight && {
        ...viewStyleAutoHeight,
        // Add scrollbarWidth to autoHeight in order to compensate negative margins
        minHeight: isString(autoHeightMin)
          ? `calc(${autoHeightMin} + ${scrollbarWidth}px)`
          : (autoHeightMin as number) + scrollbarWidth,
        maxHeight: isString(autoHeightMax)
          ? `calc(${autoHeightMax} + ${scrollbarWidth}px)`
          : (autoHeightMax as number) + scrollbarWidth,
      }),
    };
    if (!scrollbarWidth) {
      viewStyle.scrollbarWidth = 'none';
    }

    const rootClassName = props.className || 'pivot-scroller';
    const containerClassName = `${rootClassName}__container`;
    const viewClassName = `${rootClassName}__view`;

    return (
      <div className={rootClassName} style={rootStyle}>
        <div className={containerClassName} style={containerStyle}>
          <div className={viewClassName} style={viewStyle} ref={this.setViewRef}>
            {children}
          </div>
        </div>
        {this.renderTracks()}
      </div>
    );
  }
}

export default CustomScroll;
