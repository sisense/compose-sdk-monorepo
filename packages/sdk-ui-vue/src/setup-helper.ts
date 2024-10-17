import { h, ref, toRaw, type FunctionalComponent, isReactive, type Slots } from 'vue';
import {
  createPluginsContextConnector,
  createSisenseContextConnector,
  createThemeContextConnector,
} from './providers';
import { ComponentAdapter, createElement, createWrapperElement } from '@sisense/sdk-ui-preact';
import { getSisenseContext } from './providers/sisense-context-provider';
import { getThemeContext } from './providers/theme-provider';
import { isObject } from './utils';
import { getPluginsContext } from './providers/plugins-provider';

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
export const setupHelper = <P, C>(component: C, props: P) => {
  if (!props) return null;
  const rawProps = toDeepRaw(props);
  const refElement = ref<HTMLDivElement | null>(null);
  const context = getSisenseContext();
  const themeSettings = getThemeContext();
  const pluginsContext = getPluginsContext();

  return () => {
    if (refElement.value) {
      const createPreactComponent = () => {
        return createElement(component as FunctionalComponent, rawProps as P);
      };
      const componentAdapter = new ComponentAdapter(createPreactComponent, [
        createSisenseContextConnector(context.value),
        createThemeContextConnector(themeSettings ? themeSettings.value : undefined),
        createPluginsContextConnector(pluginsContext.value),
      ]);

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
  const context = getSisenseContext();
  const themeSettings = getThemeContext();
  const pluginsContext = getPluginsContext();

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
              createSisenseContextConnector(context.value),
              createThemeContextConnector(themeSettings ? themeSettings.value : undefined),
              createPluginsContextConnector(pluginsContext.value),
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
