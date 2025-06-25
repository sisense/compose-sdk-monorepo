import { h, ref, toRaw, isReactive, type Slots, onBeforeUnmount } from 'vue';
import {
  createCustomWidgetsContextConnector,
  createSisenseContextConnector,
  createThemeContextConnector,
} from './context-connectors';
import {
  ComponentAdapter,
  type ContextConnector,
  createWrapperElement,
  type AnyComponentFunction,
} from '@sisense/sdk-ui-preact';
import { isObject } from '../utils.js';

export function createDefaultContextConnectors() {
  return [
    createSisenseContextConnector(),
    createThemeContextConnector(),
    createCustomWidgetsContextConnector(),
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
 * @internal
 */
export const setupHelper = <C extends AnyComponentFunction>(
  component: C,
  props: Parameters<C>[0],
  contextConnectors: ContextConnector<any>[] = createDefaultContextConnectors(),
) => {
  if (!props) return null;
  const elementRef = ref<HTMLDivElement | null>(null);

  const componentAdapter = new ComponentAdapter<C>(component, contextConnectors);

  onBeforeUnmount(() => {
    componentAdapter.destroy();
  });

  return () => {
    if (elementRef.value) {
      componentAdapter.render(elementRef.value, toDeepRaw(props));
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
