import {
  ComponentAdapter,
  createElement,
  ExternalComponentAdapterElement,
  type ExternalComponentAdapterElementProps,
  type PreactNode,
} from '@sisense/sdk-ui-preact';
import {
  type Component,
  defineComponent,
  type DefineComponent,
  h,
  onBeforeUnmount,
  ref,
} from 'vue';

import { createDefaultContextConnectors, toDeepRaw } from './setup-helper';
import { VueComponentAdapter, type VueComponentAdapterContexts } from './vue-component-adapter';

/**
 * A preact component. Its render output matches the preact-facing component interfaces, so a
 * component produced by {@link ComponentTranslator.toPreactComponent} can be handed to any of them
 * (custom widget map, dashboard header item, ...).
 *
 * @internal
 */
export type PreactComponent<Props> = (props: Props) => PreactNode;

/**
 * A Vue component: a component options object, a `defineComponent` result, or any valid Vue
 * component.
 *
 * @internal
 */
export type VueComponent<Props> = Component<Props> | DefineComponent<Props>;
type AnyObject = Record<string, any>;

/**
 * Wraps a Vue component in a preact component that drives the Vue component's lifecycle — created
 * once on mount, updated in place on props change, destroyed on unmount.
 */
function wrapInPreactComponent<Props extends AnyObject>(
  component: VueComponent<Props>,
  contexts: VueComponentAdapterContexts,
): PreactComponent<Props> {
  return (props: Props) => {
    const adapterElementProps: ExternalComponentAdapterElementProps<Props> = {
      adapterFactory: () => new VueComponentAdapter<Props>(component, contexts),
      componentProps: props,
    };
    // `createElement` yields a preact VNode; the preact-facing component interfaces type their
    // render output as a React node, so the VNode is re-typed to the shared node type once here.
    return createElement(ExternalComponentAdapterElement, adapterElementProps) as PreactNode;
  };
}

/**
 * Builds a Vue component that renders the given preact component through the shared
 * {@link ComponentAdapter}, exactly like the hand-written Vue wrapper components do.
 *
 * The wrapper declares no props: everything it is given arrives as attrs and is forwarded to the
 * preact component, so it works for any props shape. `inheritAttrs: false` keeps those attrs off
 * the host element.
 *
 * Contexts are resolved by the wrapper's own `setup` through Vue's `inject`, so the preact
 * component sees the Sisense, theme, and custom-widget context of wherever the consumer renders it.
 */
function wrapInVueComponent<Props extends AnyObject>(
  preactComponent: PreactComponent<Props>,
): VueComponent<Props> {
  return defineComponent({
    name: 'PreactComponent',
    inheritAttrs: false,
    setup: (_props, { attrs }) => {
      const elementRef = ref<HTMLDivElement | null>(null);
      const componentAdapter = new ComponentAdapter(
        // the adapter renders any preact function component; the attrs are forwarded untyped
        preactComponent as (props: unknown) => PreactNode,
        createDefaultContextConnectors(),
      );

      onBeforeUnmount(() => {
        componentAdapter.destroy();
      });

      return () => {
        if (elementRef.value) {
          componentAdapter.render(elementRef.value, toDeepRaw({ ...attrs }));
        }

        return h('div', { ref: elementRef, style: 'width: 100%; height: 100%' });
      };
    },
  }) as VueComponent<Props>;
}

/**
 * Translates components between Vue and preact in both directions.
 *
 * Shared infrastructure for features that let consumers pass a native Vue component into an
 * otherwise preact-facing interface — custom widgets and dashboard header items today, widget and
 * filter-tile headers in the future — and that hand preact components back to consumers, where
 * every component is exposed as a real Vue component.
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
export type ComponentTranslator = ReturnType<typeof createComponentTranslator>;

/**
 * Creates a {@link ComponentTranslator}.
 *
 * @param contexts - Parent contexts provided to each Vue component adapted for preact, captured in
 * the host component's `setup`.
 * @internal
 */
export function createComponentTranslator(contexts: VueComponentAdapterContexts) {
  /**
   * Vue component -> its preact counterpart. Holds both the preact wrapper created for a Vue
   * component and the original preact component behind a generated Vue wrapper.
   * Values are stored type-erased; each generic function re-applies its own `Props`.
   */
  const preactComponents = new WeakMap<object, PreactComponent<never>>();

  /** Preact component -> its Vue counterpart. The exact mirror of {@link preactComponents}. */
  const vueComponents = new WeakMap<object, VueComponent<never>>();

  /** Records a translated pair so either direction resolves it, in either order. */
  const register = <Props extends AnyObject>(
    vueComponent: VueComponent<Props>,
    preactComponent: PreactComponent<Props>,
  ): void => {
    preactComponents.set(vueComponent, preactComponent);
    vueComponents.set(preactComponent, vueComponent as VueComponent<never>);
  };

  return {
    /**
     * Translates a Vue component into a preact component.
     *
     * A Vue wrapper produced by {@link fromPreactComponent} is unwrapped back to the preact
     * component it renders, rather than being wrapped a second time.
     */
    toPreactComponent: <Props extends AnyObject>(
      component: VueComponent<Props>,
    ): PreactComponent<Props> => {
      const known = preactComponents.get(component);
      if (known) {
        // re-applies the caller's `Props` to the type-erased registry value
        return known as PreactComponent<Props>;
      }

      const wrapped = wrapInPreactComponent(component, contexts);
      register(component, wrapped);
      return wrapped;
    },

    /**
     * Translates a preact component into a Vue component.
     *
     * A preact wrapper produced by {@link toPreactComponent} is unwrapped back to the Vue component
     * it renders; any other preact component is wrapped in a generated Vue component that renders
     * it, so consumers can render it in a Vue template like any other component.
     */
    fromPreactComponent: <Props extends AnyObject>(
      component: PreactComponent<Props>,
    ): VueComponent<Props> => {
      const known = vueComponents.get(component);
      if (known) {
        // re-applies the caller's `Props` to the type-erased registry value
        return known as VueComponent<Props>;
      }

      const wrapped = wrapInVueComponent(component);
      register(wrapped, component);
      return wrapped;
    },
  };
}
