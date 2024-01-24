import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import { DrilldownBreadcrumbs as DrilldownBreadcrumbsPreact } from '@sisense/sdk-ui-preact';
import type { DrilldownBreadcrumbsProps } from '@sisense/sdk-ui-preact';
import { setupHelperWithChildren } from '../setup-helper';

export const DrilldownBreadcrumbs = defineComponent({
  props: {
    clearDrilldownSelections: Function as PropType<
      DrilldownBreadcrumbsProps['clearDrilldownSelections']
    >,
    currentDimension: Object as PropType<DrilldownBreadcrumbsProps['currentDimension']>,
    sliceDrilldownSelections: Function as PropType<
      DrilldownBreadcrumbsProps['sliceDrilldownSelections']
    >,
    filtersDisplayValues: Object as PropType<DrilldownBreadcrumbsProps['filtersDisplayValues']>,
  },
  setup: (props, { slots }) => {
    return setupHelperWithChildren(DrilldownBreadcrumbsPreact, props, slots, []);
  },
});
