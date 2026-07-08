import {
  DEFAULT_HEADER_ITEM_SIZE,
  getHeaderItemStyle,
  resolveHeaderItemSize,
} from './header-item-size.js';

describe('resolveHeaderItemSize', () => {
  it('falls back to the framework default when no size is given', () => {
    expect(resolveHeaderItemSize()).toEqual({
      width: DEFAULT_HEADER_ITEM_SIZE,
      height: DEFAULT_HEADER_ITEM_SIZE,
    });
  });

  it('applies the provided default to unspecified dimensions', () => {
    expect(resolveHeaderItemSize({ width: 80 }, 28)).toEqual({ width: 80, height: 28 });
  });

  it('keeps explicitly provided dimensions', () => {
    expect(resolveHeaderItemSize({ width: 80, height: 44 }, 28)).toEqual({ width: 80, height: 44 });
  });
});

describe('getHeaderItemStyle', () => {
  const size = { width: 80, height: 28 };

  it('always lays out as a vertically centered flex box with the resolved height', () => {
    const style = getHeaderItemStyle(size, 'content');
    expect(style.display).toBe('flex');
    expect(style.alignItems).toBe('center');
    expect(style.height).toBe('28px');
  });

  it('grows to fill the row for the spacer', () => {
    const style = getHeaderItemStyle(size, 'grow');
    expect(style.flex).toBe('1 1 auto');
    expect(style.minWidth).toBe(0);
  });

  it('shrinks/ellipsizes for a truncating title', () => {
    const style = getHeaderItemStyle(size, 'truncate');
    expect(style.flex).toBe('0 1 auto');
    expect(style.minWidth).toBe(0);
  });

  it('never shrinks a content item and lets it take its natural width', () => {
    const style = getHeaderItemStyle(size, 'content');
    expect(style.flex).toBe('0 0 auto');
    expect(style.width).toBeUndefined();
  });

  it('gives an external item a fixed width and centers its content on both axes', () => {
    const style = getHeaderItemStyle(size);
    expect(style.flex).toBe('0 0 auto');
    expect(style.width).toBe('80px');
    expect(style.justifyContent).toBe('center');
    expect(style.alignItems).toBe('center');
  });
});
