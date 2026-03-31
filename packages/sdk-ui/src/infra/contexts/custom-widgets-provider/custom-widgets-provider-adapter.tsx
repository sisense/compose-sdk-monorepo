import { PropsWithChildren, useEffect, useRef } from 'react';

import { useWidgetPluginRegistry } from '@/infra/plugins/use-widget-plugin-registry';
import type { CustomVisualization } from '@/infra/plugins/widget-plugins/types';

import { CustomContextProviderProps } from '../../../types';
import { CustomWidgetComponent, CustomWidgetComponentProps } from './types.js';

/** @internal */
export type CustomWidgetsProviderAdapterProps = CustomContextProviderProps<
  CustomWidgetsContextAdapter<CustomWidgetComponentProps>
>;

/** @internal */
export type CustomWidgetsContextAdapter<T = CustomWidgetComponentProps> = {
  customWidgetsMap: Map<string, CustomWidgetComponent<T>>;
};

/**
 * Minimal registry interface for legacy widget reconciliation.
 * Keeps the helper decoupled from the concrete registry implementation.
 */
interface LegacyWidgetRegistry {
  register(name: string, component: CustomVisualization, source: 'legacy'): void;
  unregister(name: string, source: 'legacy'): void;
}

/**
 * Reconciles the registry with the current customWidgetsMap:
 * - Registers new or changed widgets (unregister first if component reference changed)
 * - Unregisters widgets that were removed from the map
 *
 * @returns Set of widget type names currently registered — used for cleanup on unmount
 */
function reconcileLegacyWidgets(
  registry: LegacyWidgetRegistry,
  current: Map<string, CustomWidgetComponent<CustomWidgetComponentProps>>,
  prev: Map<string, CustomWidgetComponent<CustomWidgetComponentProps>>,
): Set<string> {
  const keysToCleanup = new Set<string>();

  current.forEach((component, widgetTypeName) => {
    const prevComponent = prev.get(widgetTypeName);
    if (prevComponent !== component) {
      registry.unregister(widgetTypeName, 'legacy');
      registry.register(widgetTypeName, component as CustomVisualization, 'legacy');
    }
    keysToCleanup.add(widgetTypeName);
  });

  prev.forEach((_, widgetTypeName) => {
    if (!current.has(widgetTypeName)) {
      registry.unregister(widgetTypeName, 'legacy');
    }
  });

  return keysToCleanup;
}

/**
 * Creates a cleanup function that unregisters all given keys from the registry.
 * Called on effect unmount or before re-run to ensure removed keys don't persist.
 */
function createLegacyCleanup(registry: LegacyWidgetRegistry, keys: Set<string>): () => void {
  return () => {
    keys.forEach((widgetTypeName) => registry.unregister(widgetTypeName, 'legacy'));
  };
}

/**
 * Custom Widget Provider Adapter component that allows passing external custom widgets context.
 *
 * Bridges pre-initialized custom widget data from an external wrapper to child React components.
 * Syncs the widget registry with customWidgetsMap on updates and cleans up on unmount.
 *
 * @internal
 */
export const CustomWidgetsProviderAdapter: React.FC<
  PropsWithChildren<CustomWidgetsProviderAdapterProps>
> = (props) => {
  const { error, context, children } = props;
  if (error) {
    throw error;
  }
  const widgetRegistry = useWidgetPluginRegistry();
  const { customWidgetsMap } = context;
  const prevRef = useRef<Map<string, CustomWidgetComponent<CustomWidgetComponentProps>>>(new Map());

  useEffect(() => {
    const keysToCleanup = reconcileLegacyWidgets(widgetRegistry, customWidgetsMap, prevRef.current);
    prevRef.current = new Map(customWidgetsMap);

    return createLegacyCleanup(widgetRegistry, keysToCleanup);
  }, [customWidgetsMap, widgetRegistry]);

  return <>{children}</>;
};
