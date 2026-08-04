import {
  type AnyComponentFunction,
  ComponentAdapter,
  type ContextConnector,
  createWrapperElement,
} from '@sisense/sdk-ui-preact';
import { h, isReactive, onBeforeUnmount, ref, type Slots, toRaw } from 'vue';

import { isObject } from '../utils.js';
import {
  createCustomWidgetsContextConnector,
  createPluginContextConnector,
  createSisenseContextConnector,
  createThemeContextConnector,
} from './context-connectors';

export function createDefaultContextConnectors() {
  return [
    createPluginContextConnector(),
    createCustomWidgetsContextConnector(),
    createSisenseContextConnector(),
    createThemeContextConnector(),
  ];
}

export function getRawData<T>(data: T): T {
  return isReactive(data) ? toRaw(data) : data;
}

export function toDeepRaw<T>(data: T): T {
  const rawData = getRawData<T>(data);

  for (const key in rawData) {
    const value = rawData[key];

    if (!isObject(value) && !Array.isArray(value)) {
      continue;
    }

    rawData[key] = toDeepRaw<typeof value>(value);
  }

  return rawData; // much better: structuredClone(rawData)
}

/**
 * Renders a component without children.
 *
 * `props` is either the component's reactive props object, or a getter returning the props to
 * render. Use a getter when the Vue-flavored props need converting into the preact props shape
 * (e.g. converting Vue components carried in props into preact components): it is called on every
 * render, so prop updates keep flowing through Vue's reactivity. Converting once before calling
 * this helper would instead snapshot the props at `setup` time and freeze them.
 *
 * A props object is unwrapped with {@link toDeepRaw} before rendering; a getter owns that step, so
 * it can convert the already-unwrapped props.
 *
 * @internal
 */
export const setupHelper = <C extends AnyComponentFunction>(
  component: C,
  props: Parameters<C>[0] | (() => Parameters<C>[0]),
  contextConnectors: ContextConnector<any>[] = createDefaultContextConnectors(),
) => {
  if (!props) return null;
  const elementRef = ref<HTMLDivElement | null>(null);
  // props objects are never functions, so this distinguishes the two forms; the casts are needed
  // because `Parameters<C>[0]` is unconstrained and so overlaps the getter in the union
  const getProps =
    typeof props === 'function'
      ? (props as () => Parameters<C>[0])
      : () => toDeepRaw(props as Parameters<C>[0]);

  const componentAdapter = new ComponentAdapter<C>(component, contextConnectors);

  onBeforeUnmount(() => {
    componentAdapter.destroy();
  });

  return () => {
    if (elementRef.value) {
      componentAdapter.render(elementRef.value, getProps());
    }

    return h('div', { ref: elementRef, style: 'width: 100%; height: 100%' });
  };
};

/**
 * Renders a component with children.
 *
 * @internal
 */
export const setupHelperWithChildren = <C extends AnyComponentFunction>(
  component: C,
  props: Parameters<C>[0],
  slots: Slots,
  contextConnectors: ContextConnector<any>[] = createDefaultContextConnectors(),
) => {
  const elementRef = ref<HTMLDivElement>();
  const childrenElementRef = ref<HTMLDivElement>();

  const componentAdapter = new ComponentAdapter(component, contextConnectors);

  onBeforeUnmount(() => {
    componentAdapter.destroy();
  });

  return () => {
    if (elementRef.value && childrenElementRef.value) {
      const children = createWrapperElement(childrenElementRef.value);

      componentAdapter.render(elementRef.value, { ...toDeepRaw(props), children });
    }

    return [
      h('div', { ref: elementRef }),
      h('div', { ref: childrenElementRef }, slots.default ? slots.default() : []),
    ];
  };
};
