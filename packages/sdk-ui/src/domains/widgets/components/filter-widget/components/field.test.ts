import { describe, expect, it } from 'vitest';

import { resolveFieldState } from './field';

describe('resolveFieldState', () => {
  it('paints the default state when nothing is happening', () => {
    expect(resolveFieldState({})).toBe('default');
  });

  it('prefers disabled over every other signal', () => {
    expect(resolveFieldState({ disabled: true, state: 'hover', hovered: true, active: true })).toBe(
      'disabled',
    );
  });

  it('prefers a pinned state over live interaction', () => {
    expect(resolveFieldState({ state: 'default', hovered: true, active: true })).toBe('default');
  });

  it('reads an open control as active', () => {
    expect(resolveFieldState({ active: true })).toBe('active');
  });

  it('prefers active over hover, since an open control is usually hovered too', () => {
    expect(resolveFieldState({ hovered: true, active: true })).toBe('active');
  });

  it('reads a hovered control as hover', () => {
    expect(resolveFieldState({ hovered: true })).toBe('hover');
  });
});
