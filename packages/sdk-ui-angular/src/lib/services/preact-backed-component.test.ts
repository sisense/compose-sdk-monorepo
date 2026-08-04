/** @vitest-environment jsdom */
import { Type } from '@angular/core';
import { describe, expect, it } from 'vitest';

import {
  getPreactComponent,
  type PreactComponent,
  wrapInAngularComponent,
} from './preact-backed-component';

const somePreactComponent: PreactComponent<{ size: number }> = () => null;

describe('preact-backed-component', () => {
  it('carries the Preact component on the wrapper', () => {
    const component = wrapInAngularComponent(somePreactComponent);

    expect(getPreactComponent(component)).toBe(somePreactComponent);
  });

  it('creates a distinct wrapper per call', () => {
    const first = wrapInAngularComponent(somePreactComponent);
    const second = wrapInAngularComponent(somePreactComponent);

    expect(first).not.toBe(second);
    expect(getPreactComponent(first)).toBe(getPreactComponent(second));
  });

  it('names the wrapper after the Preact component, for readable diagnostics', () => {
    const component = wrapInAngularComponent(somePreactComponent);

    expect(component.name).toBe('PreactBacked(somePreactComponent)');
  });

  it('resolves undefined for a regular component class', () => {
    class RegularComponent {}

    expect(getPreactComponent(RegularComponent as Type<unknown>)).toBeUndefined();
  });

  it('does not mistake a subclass of a wrapper for a wrapper', () => {
    const component = wrapInAngularComponent(somePreactComponent);
    class Subclass extends (component as unknown as { new (): object }) {}

    expect(getPreactComponent(Subclass as unknown as Type<unknown>)).toBeUndefined();
  });
});
