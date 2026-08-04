import { createRef } from 'react';

import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useBlurOnPointerDownOutside } from './use-blur-on-pointer-down-outside.js';

describe('useBlurOnPointerDownOutside', () => {
  let element: HTMLElement;
  let child: HTMLElement;
  let outside: HTMLElement;

  beforeEach(() => {
    element = document.createElement('div');
    child = document.createElement('span');
    element.appendChild(child);
    outside = document.createElement('div');
    document.body.appendChild(element);
    document.body.appendChild(outside);
  });

  afterEach(() => {
    element.remove();
    outside.remove();
    vi.restoreAllMocks();
  });

  /**
   * Dispatches a synthetic bubbling `pointerdown` event on the document using
   * the provided target, simulating a pointer interaction for the hook under test.
   * @param target - The event target used for the simulated pointerdown interaction
   */
  const dispatchPointerDown = (target: EventTarget) => {
    const event = new Event('pointerdown', { bubbles: true });
    Object.defineProperty(event, 'target', { value: target });
    document.dispatchEvent(event);
  };

  it('blurs the element on pointerdown outside it', () => {
    const ref = createRef<HTMLElement>();
    ref.current = element;
    const blurSpy = vi.spyOn(element, 'blur');

    renderHook(() => useBlurOnPointerDownOutside(ref, true));
    dispatchPointerDown(outside);

    expect(blurSpy).toHaveBeenCalledTimes(1);
  });

  it('does not blur when pointerdown occurs inside the element', () => {
    const ref = createRef<HTMLElement>();
    ref.current = element;
    const blurSpy = vi.spyOn(element, 'blur');

    renderHook(() => useBlurOnPointerDownOutside(ref, true));
    dispatchPointerDown(child);

    expect(blurSpy).not.toHaveBeenCalled();
  });

  it('does not attach the listener when inactive', () => {
    const ref = createRef<HTMLElement>();
    ref.current = element;
    const blurSpy = vi.spyOn(element, 'blur');

    renderHook(() => useBlurOnPointerDownOutside(ref, false));
    dispatchPointerDown(outside);

    expect(blurSpy).not.toHaveBeenCalled();
  });

  it('removes the listener on unmount', () => {
    const ref = createRef<HTMLElement>();
    ref.current = element;
    const blurSpy = vi.spyOn(element, 'blur');

    const { unmount } = renderHook(() => useBlurOnPointerDownOutside(ref, true));
    unmount();
    dispatchPointerDown(outside);

    expect(blurSpy).not.toHaveBeenCalled();
  });

  it('does nothing when the ref is not attached to an element', () => {
    const ref = createRef<HTMLElement>();

    expect(() => {
      renderHook(() => useBlurOnPointerDownOutside(ref, true));
      dispatchPointerDown(outside);
    }).not.toThrow();
  });
});
