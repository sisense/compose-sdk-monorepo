import { h, ref, toRaw, type FunctionalComponent, isReactive, type Slots } from 'vue';
import {
  createPluginsContextConnector,
  createSisenseContextConnector,
  createThemeContextConnector,
} from './providers';
import {
  ComponentAdapter,
  type ContextConnector,
  createElement,
  createWrapperElement,
} from '@sisense/sdk-ui-preact';
import { isObject } from './utils';

export function createDefaultContextConnectors() {
  return [
    createSisenseContextConnector(),
    createThemeContextConnector(),
    createPluginsContextConnector(),
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
export const setupHelper = <P, C>(
  component: C,
  props: P,
  createContextConnectorsFn: () => ContextConnector<any>[] = createDefaultContextConnectors,
) => {
  if (!props) return null;
  const rawProps = toDeepRaw(props);
  const refElement = ref<HTMLDivElement | null>(null);

  return () => {
    if (refElement.value) {
      const createPreactComponent = () => {
        return createElement(component as FunctionalComponent, rawProps as P);
      };
      const componentAdapter = new ComponentAdapter(
        createPreactComponent,
        createContextConnectorsFn(),
      );

      componentAdapter.render(refElement.value);
    }

    return h('div', { ref: refElement, style: 'width: 100%; height: 100%' });
  };
};

/**
 * Renders a component with children.
 *
 * @internal
 */
export const setupHelperWithChildren = <P, C>(
  component: C,
  props: P,
  slots: Slots,
  contexts?: [],
) => {
  const rawProps = toDeepRaw(props) as P;
  const contextMenuRef = ref<HTMLDivElement>();
  const contextMenuChildrenRef = ref<HTMLDivElement>();

  return () => {
    if (contextMenuRef.value && contextMenuChildrenRef.value) {
      const children = createWrapperElement(contextMenuChildrenRef.value);
      const componentAdapter = new ComponentAdapter(
        () => {
          return createElement(component as FunctionalComponent, rawProps, children);
        },
        contexts
          ? contexts
          : [
              createSisenseContextConnector(),
              createThemeContextConnector(),
              createPluginsContextConnector(),
            ],
      );

      componentAdapter.render(contextMenuRef.value);
    }
    return [
      h('div', { ref: contextMenuRef }),
      h('div', { ref: contextMenuChildrenRef }, slots.default ? slots.default() : []),
    ];
  };
};
