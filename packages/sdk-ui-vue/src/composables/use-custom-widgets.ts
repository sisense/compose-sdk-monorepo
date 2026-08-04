import {
  type CustomWidgetComponent as CustomWidgetComponentPreact,
  type CustomWidgetComponentProps,
  type GenericDataOptions,
} from '@sisense/sdk-ui-preact';
import type { Component, DefineComponent } from 'vue';

import { createComponentTranslator } from '../helpers/component-translator';
import { getCustomWidgetsContext } from '../providers/custom-widgets-provider';
import { getSisenseContext } from '../providers/sisense-context-provider/sisense-context';
import { getThemeContext } from '../providers/theme-provider/theme-context';

/** Re-export related types */
export type { CustomWidgetComponentProps, GenericDataOptions };

/**
 * Type representing a Vue component that can be used as a user-defined custom widget.
 * This can be a Vue component options object, a defineComponent result, or any valid Vue component.
 */
export type CustomWidgetComponent<
  Props extends CustomWidgetComponentProps = CustomWidgetComponentProps,
> = Component<Props> | DefineComponent<Props>;

/**
 * Vue composable function for working with custom widgets
 *
 * @example
 * How to use `useCustomWidgets` to register a custom widget in a dashboard:
 * ```vue
<script setup lang="ts">
import { onUnmounted } from 'vue';
import { useCustomWidgets, DashboardById } from '@sisense/sdk-ui-vue';
import CustomHistogramWidget from './custom-histogram-widget';

const { registerCustomWidget, unregisterCustomWidget } = useCustomWidgets();
registerCustomWidget('histogramwidget', CustomHistogramWidget);
// Optionally unregister on unmount (e.g. if the widget should only be available within this component)
onUnmounted(() => unregisterCustomWidget('histogramwidget'));

</script>
<template>
  <DashboardById dashboardOid="your-dashboard-oid" />
</template>
 * ```
 *
 * @group Dashboards
 */
export const useCustomWidgets = () => {
  const context = getCustomWidgetsContext();

  // Parent contexts are captured once here, in setup scope, and provided to every registered
  // component when it is adapted for preact.
  const componentTranslator = createComponentTranslator({
    sisenseContext: getSisenseContext(),
    themeContext: getThemeContext(),
    customWidgetsContext: context,
  });

  return {
    /**
     * Registers a new custom widget.
     *
     * @param customWidgetType - The unique identifier for the custom widget type.
     * @param customWidget - The custom widget component to register.
     */
    registerCustomWidget: <Props extends CustomWidgetComponentProps = CustomWidgetComponentProps>(
      customWidgetType: string,
      customWidget: CustomWidgetComponent<Props>,
    ): void => {
      if (!context.value.customWidgetsMap.has(customWidgetType)) {
        // Convert the Vue component into a preact component that manages its lifecycle
        // (created once on mount, updated in-place on props change, destroyed on unmount).
        context.value.customWidgetsMap.set(
          customWidgetType,
          componentTranslator.toPreactComponent(customWidget) as CustomWidgetComponentPreact<any>,
        );
        context.value = {
          customWidgetsMap: new Map(context.value.customWidgetsMap),
        };
      }
    },
    /**
     * Unregisters a custom widget for the given type name.
     *
     * @param customWidgetType - The unique identifier for the custom widget type.
     */
    unregisterCustomWidget: (customWidgetType: string): void => {
      if (context.value.customWidgetsMap.delete(customWidgetType)) {
        context.value = {
          customWidgetsMap: new Map(context.value.customWidgetsMap),
        };
      }
    },
    /**
     * Checks if a custom widget is registered.
     *
     * @param customWidgetType - The type of the custom widget.
     * @returns True if the custom widget is registered, false otherwise.
     */
    hasCustomWidget: (customWidgetType: string) =>
      context.value.customWidgetsMap.has(customWidgetType),
  };
};
