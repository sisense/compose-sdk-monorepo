import {
  createElement,
  type CustomWidgetComponent as CustomWidgetComponentPreact,
  type CustomWidgetComponentProps,
  ExternalComponentAdapterElement,
  type ExternalComponentAdapterElementProps,
  type GenericDataOptions,
} from '@sisense/sdk-ui-preact';
import type { Component, DefineComponent } from 'vue';

import { VueComponentAdapter } from '../helpers/vue-component-adapter';
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
import { useCustomWidgets, DashboardById } from '@sisense/sdk-ui-vue';
import CustomHistogramWidget from './custom-histogram-widget';

const { registerCustomWidget } = useCustomWidgets();
registerCustomWidget('histogramwidget', CustomHistogramWidget);

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

  // Capture parent contexts once at registration time
  const sisenseContext = getSisenseContext();
  const themeContext = getThemeContext();
  const customWidgetsContext = context;

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
      const contexts = {
        sisenseContext,
        themeContext,
        customWidgetsContext,
      };

      /**
       * Factory function that creates an adapter for the Vue component.
       * This is called once per component mount by the ExternalComponentAdapterElement.
       */
      const createAdapter = () => {
        return new VueComponentAdapter<Props>(customWidget, contexts);
      };

      /**
       * Preact wrapper component that manages the Vue component lifecycle.
       * Uses ExternalComponentAdapterElement (which uses hooks internally in the correct Preact context)
       * to ensure the Vue component is:
       * - Created once on mount
       * - Updated in-place on props changes (preserving state)
       * - Properly destroyed on unmount
       */
      const CustomWidgetWrapper: CustomWidgetComponentPreact<Props> = (props: Props) => {
        const adapterElementProps: ExternalComponentAdapterElementProps<Props> = {
          adapterFactory: createAdapter,
          componentProps: props,
        };
        return createElement(ExternalComponentAdapterElement, adapterElementProps) as ReturnType<
          CustomWidgetComponentPreact<Props>
        >;
      };

      if (!context.value.customWidgetsMap.has(customWidgetType)) {
        context.value.customWidgetsMap.set(
          customWidgetType,
          CustomWidgetWrapper as CustomWidgetComponentPreact<any>,
        );
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
