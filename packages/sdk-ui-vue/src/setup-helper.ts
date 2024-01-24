import { h, ref, toRaw, type FunctionalComponent, isReactive, type Slots } from 'vue';
import { createSisenseContextConnector, createThemeContextConnector } from './providers';
import { ComponentAdapter, createElement, createWrapperElement } from '@sisense/sdk-ui-preact';

export function isObject(value: unknown): boolean {
  return value !== null && !Array.isArray(value) && typeof value === 'object';
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
 * @internal
 * @description This is a helper function to render a component without children.
 */
export const setupHelper = <P, C>(component: C, props: P) => {
  if (!props) return null;
  const refElement = ref<HTMLDivElement | null>(null);
  const rawProps = toDeepRaw<P>(props);
  const createPreactComponent = () => {
    return createElement(component as FunctionalComponent, rawProps as P);
  };
  const componentAdapter = new ComponentAdapter(createPreactComponent, [
    createSisenseContextConnector(),
    createThemeContextConnector(),
  ]);

  return () => {
    if (refElement.value) {
      componentAdapter.render(refElement.value);
    }
    return h('div', { ref: refElement });
  };
};

/**
 * @internal
 * @description This is a helper function to render a component with children.
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
        contexts ? contexts : [createSisenseContextConnector(), createThemeContextConnector()],
      );

      componentAdapter.render(contextMenuRef.value);
    }
    return [
      h('div', { ref: contextMenuRef }),
      h('div', { ref: contextMenuChildrenRef }, slots.default ? slots.default() : []),
    ];
  };
};
