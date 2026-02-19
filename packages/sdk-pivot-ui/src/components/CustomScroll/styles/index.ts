import { CSSProperties } from 'react';

/**
 * Default container styles
 *
 * @readonly
 */
export const containerStyleDefault: CSSProperties = {
  position: 'relative',
  overflow: 'hidden',
  width: '100%',
  height: '100%',
};

/**
 * Container with auto height styles
 *
 * @readonly
 */
export const containerStyleAutoHeight: CSSProperties = {
  height: 'auto',
};

/**
 * Default view styles
 *
 * @readonly
 */
export const viewStyleDefault: CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  overflow: 'scroll',
  WebkitOverflowScrolling: 'touch',
};

/**
 * View with auto height styles
 *
 * @readonly
 */
export const viewStyleAutoHeight: CSSProperties = {
  position: 'relative',
  top: undefined,
  left: undefined,
  right: undefined,
  bottom: undefined,
};

/**
 * Horizontal track styles
 *
 * @readonly
 */
export const trackHorizontalStyleDefault: CSSProperties = {
  position: 'absolute',
  height: 6,
};

/**
 * Vertical track styles
 *
 * @readonly
 */
export const trackVerticalStyleDefault: CSSProperties = {
  position: 'absolute',
  width: 6,
};

/**
 * Horizontal thumb styles
 *
 * @readonly
 */
export const thumbHorizontalStyleDefault: CSSProperties = {
  position: 'relative',
  display: 'block',
  height: '100%',
};

/**
 * Vertical thumb styles
 *
 * @readonly
 */
export const thumbVerticalStyleDefault: CSSProperties = {
  position: 'relative',
  display: 'block',
  width: '100%',
};

/**
 * Disable select styles
 *
 * @readonly
 */
export const disableSelectStyle: CSSProperties = {
  userSelect: 'none',
};

/**
 * Disable select reset styles
 *
 * @readonly
 */
export const disableSelectStyleReset: CSSProperties = {
  userSelect: 'auto',
};
