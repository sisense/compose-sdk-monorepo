import {
  createWrapperElement,
  type CustomWidgetComponent as CustomWidgetComponentPreact,
  type CustomWidgetComponentProps,
  type GenericDataOptions,
} from '@sisense/sdk-ui-preact';
import type { Component, DefineComponent } from 'vue';
import { getCustomWidgetsContext } from '../providers/custom-widgets-provider';
import { renderComponent } from '../helpers/dynamic-renderer';

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
      const customWidgetPreactComponent: CustomWidgetComponentPreact<Props> = (props: Props) => {
        const renderedComponent = renderComponent(customWidget, props);
        return createWrapperElement(renderedComponent.element as HTMLDivElement, () =>
          renderedComponent.destroy(),
        );
      };

      if (!context.value.customWidgetsMap.has(customWidgetType)) {
        context.value.customWidgetsMap.set(
          customWidgetType,
          customWidgetPreactComponent as CustomWidgetComponentPreact<any>,
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
