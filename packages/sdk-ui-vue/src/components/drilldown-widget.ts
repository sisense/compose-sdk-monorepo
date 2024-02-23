import type { Component, PropType } from 'vue';
import type { ContextMenuProps, DrilldownWidgetProps } from '@sisense/sdk-ui-preact';
import { defineComponent } from 'vue';

export type DrilldownWidgetConfig = {
  isBreadcrumbsDetached?: boolean;
  breadcrumbsComponent?: Component;
  contextMenuComponent?: (props: ContextMenuProps) => Component;
};

export const DrilldownWidgetTs = defineComponent({
  props: {
    config: {
      type: Object as PropType<DrilldownWidgetConfig>,
      required: false,
      default: () => ({}),
    },
    drilldownDimensions: {
      type: Array as PropType<DrilldownWidgetProps['drilldownDimensions']>,
      required: false,
      default: () => [],
    },
    initialDimension: {
      type: Object as PropType<DrilldownWidgetProps['initialDimension']>,
      required: false,
      default: () => ({}),
    },
  },
  setup: () => {},
});
