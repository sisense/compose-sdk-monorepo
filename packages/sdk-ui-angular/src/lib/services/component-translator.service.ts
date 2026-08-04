import { Injectable, Type } from '@angular/core';
import {
  createElement,
  ExternalComponentAdapterElement,
  type ExternalComponentAdapterElementProps,
  type PreactNode,
} from '@sisense/sdk-ui-preact';

import { AngularComponentAdapter } from './angular-component-adapter';
import { DynamicRenderer } from './dynamic-renderer.service';
import { type PreactComponent, wrapInAngularComponent } from './preact-backed-component';

export type { PreactComponent };

/**
 * Wraps an Angular component class in a Preact component that drives the Angular component's
 * lifecycle — created once on mount, updated in place on props change, destroyed on unmount.
 */
function wrapInPreactComponent<Props>(
  component: Type<Props>,
  dynamicRenderer: DynamicRenderer,
): PreactComponent<Props> {
  return (props: Props) => {
    const adapterElementProps: ExternalComponentAdapterElementProps<Props> = {
      adapterFactory: () => new AngularComponentAdapter<Props>(dynamicRenderer, component),
      componentProps: props,
    };
    // `createElement` yields a Preact VNode; the Preact-facing component interfaces type their
    // render output as a React node, so the VNode is re-typed to the shared node type once here.
    return createElement(ExternalComponentAdapterElement, adapterElementProps) as PreactNode;
  };
}

/**
 * Translates components between Angular and Preact in both directions.
 *
 * Shared infrastructure for features that let consumers pass a native Angular component into an
 * otherwise Preact-facing interface — custom widgets and dashboard header items, etc.
 * Also, allow tranforming Preact components back to Angular components.
 *
 * The two methods are inverses of each other, and translation is stable: the same input always
 * yields the same output instance, so the renderer sees a constant component identity across
 * re-renders (no unmount/remount) and consumers get back the very component they passed in.
 * Translating a wrapper back always unwraps it, so a component never gets wrapped twice.
 *
 * The translator owns no live component instances: it produces components and adapter *factories*,
 * and each adapter is created and destroyed by the wrapper that mounts it. Both registries are
 * keyed weakly, so nothing has to be released explicitly when the host component unmounts.
 *
 * @internal
 */
@Injectable({ providedIn: 'root' })
export class ComponentTranslator {
  /**
   * Angular component -> its Preact counterpart. Holds both the Preact wrapper created for an
   * Angular component and the original Preact component behind a Preact-backed Angular wrapper.
   * Values are stored type-erased; each generic method re-applies its own `Props`.
   */
  private readonly preactComponents = new WeakMap<object, PreactComponent<never>>();

  /** Preact component -> its Angular counterpart. The exact mirror of {@link preactComponents}. */
  private readonly angularComponents = new WeakMap<object, Type<never>>();

  constructor(private dynamicRenderer: DynamicRenderer) {}

  /**
   * Translates an Angular component into a Preact component.
   *
   * An Angular component produced by {@link fromPreactComponent} is unwrapped back to the Preact
   * component it stands for, rather than being wrapped a second time.
   */
  toPreactComponent<Props>(component: Type<Props>): PreactComponent<Props> {
    const known = this.preactComponents.get(component);
    if (known) {
      // re-applies the caller's `Props` to the type-erased registry value
      return known as PreactComponent<Props>;
    }

    const wrapped = wrapInPreactComponent(component, this.dynamicRenderer);
    this.register(component, wrapped);
    return wrapped;
  }

  /**
   * Translates a Preact component into an Angular component type.
   *
   * A Preact wrapper produced by {@link toPreactComponent} is unwrapped back to the Angular
   * component class it renders. Any other Preact component is wrapped in a Preact-backed Angular
   * wrapper that stands for it, which `DynamicRenderer` knows how to render — so consumers can
   * reorder it, remove it, pass it back to the SDK, or hand it to the SDK's renderer.
   */
  fromPreactComponent<Props>(component: PreactComponent<Props>): Type<Props> {
    const known = this.angularComponents.get(component);
    if (known) {
      // re-applies the caller's `Props` to the type-erased registry value
      return known as Type<Props>;
    }

    const wrapped = wrapInAngularComponent(component);
    this.register(wrapped, component);
    return wrapped;
  }

  /** Records a translated pair so either direction resolves it, in either order. */
  private register<Props>(
    angularComponent: Type<Props>,
    preactComponent: PreactComponent<Props>,
  ): void {
    this.preactComponents.set(angularComponent, preactComponent);
    this.angularComponents.set(preactComponent, angularComponent as Type<never>);
  }
}
