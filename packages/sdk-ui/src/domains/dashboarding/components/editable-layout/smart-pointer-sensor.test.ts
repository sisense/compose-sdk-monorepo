import type { PointerEvent } from 'react';

import type { PointerSensorOptions } from '@dnd-kit/core';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { SmartPointerSensor } from './smart-pointer-sensor.js';

/**
 * Invokes the sensor's `onPointerDown` activator with a synthetic native event
 * whose target is `target`, and returns whether activation was allowed plus the
 * `onActivation` spy.
 */
function activate(
  target: EventTarget | null,
  { isPrimary = true, button = 0 }: { isPrimary?: boolean; button?: number } = {},
) {
  const onActivation = vi.fn();
  const nativeEvent = { isPrimary, button, target } as unknown as PointerEvent['nativeEvent'];
  const handler = SmartPointerSensor.activators[0].handler;
  const activated = handler(
    { nativeEvent } as PointerEvent,
    {
      onActivation,
    } as PointerSensorOptions,
  );
  return { activated, onActivation };
}

describe('SmartPointerSensor', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('activates DnD for a primary left-click on a plain element', () => {
    const div = document.createElement('div');
    document.body.appendChild(div);

    const { activated, onActivation } = activate(div);

    expect(activated).toBe(true);
    expect(onActivation).toHaveBeenCalledTimes(1);
  });

  it('does not activate when the pointer is not primary', () => {
    const div = document.createElement('div');
    const { activated, onActivation } = activate(div, { isPrimary: false });

    expect(activated).toBe(false);
    expect(onActivation).not.toHaveBeenCalled();
  });

  it('does not activate for a non-left mouse button', () => {
    const div = document.createElement('div');
    const { activated, onActivation } = activate(div, { button: 2 });

    expect(activated).toBe(false);
    expect(onActivation).not.toHaveBeenCalled();
  });

  it.each(['input', 'textarea', 'select', 'button'])(
    'does not activate when the target is an interactive <%s>',
    (tag) => {
      const el = document.createElement(tag);
      document.body.appendChild(el);

      const { activated, onActivation } = activate(el);

      expect(activated).toBe(false);
      expect(onActivation).not.toHaveBeenCalled();
    },
  );

  it('does not activate when the target is contenteditable', () => {
    const el = document.createElement('div');
    el.setAttribute('contenteditable', 'true');
    document.body.appendChild(el);

    const { activated, onActivation } = activate(el);

    expect(activated).toBe(false);
    expect(onActivation).not.toHaveBeenCalled();
  });

  it('does not activate when an ancestor is marked with data-no-dnd', () => {
    const wrapper = document.createElement('div');
    wrapper.setAttribute('data-no-dnd', '');
    const child = document.createElement('span');
    wrapper.appendChild(child);
    document.body.appendChild(wrapper);

    const { activated, onActivation } = activate(child);

    expect(activated).toBe(false);
    expect(onActivation).not.toHaveBeenCalled();
  });

  it('activates when contenteditable is explicitly disabled', () => {
    const el = document.createElement('div');
    el.setAttribute('contenteditable', 'false');
    document.body.appendChild(el);

    const { activated, onActivation } = activate(el);

    expect(activated).toBe(true);
    expect(onActivation).toHaveBeenCalledTimes(1);
  });

  it('activates when the target is not an Element', () => {
    const { activated, onActivation } = activate(null);

    expect(activated).toBe(true);
    expect(onActivation).toHaveBeenCalledTimes(1);
  });
});
