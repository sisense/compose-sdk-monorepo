import { h, ref, toRaw, type FunctionalComponent, isReactive } from 'vue';
import { createSisenseContextConnector, createThemeContextConnector } from './providers';
import { ComponentAdapter, createElement } from '@sisense/sdk-ui-preact';

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
