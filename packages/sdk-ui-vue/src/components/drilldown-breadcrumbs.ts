import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import { DrilldownBreadcrumbs as DrilldownBreadcrumbsPreact } from '@sisense/sdk-ui-preact';
import type { DrilldownBreadcrumbsProps as DrilldownBreadcrumbsPropsPreact } from '@sisense/sdk-ui-preact';
import { setupHelperWithChildren } from '../setup-helper';

/**
 * Props of the {@link @sisense/sdk-ui-vue!DrilldownBreadcrumbs | `DrilldownBreadcrumbs`} component.
 */
export interface DrilldownBreadcrumbsProps extends DrilldownBreadcrumbsPropsPreact {}

/**
 * `DrilldownBreadcrumbs` component from the `@sisense/sdk-ui-vue` package.
 * This component provides a way to display and interact with the drilldown path in data visualization components,
 * allowing users to navigate through different levels of data drilldowns. It includes functionalities to clear selections
 * or slice through the drilldown selections for a more intuitive data exploration experience.
 *
 * @example
 * Here's how to use the `DrilldownBreadcrumbs` component:
 * ```vue
 * <template>
 *   <DrilldownBreadcrumbs
 *     :clearDrilldownSelections="clearSelections"
 *     :currentDimension="currentDimension"
 *     :sliceDrilldownSelections="sliceSelections"
 *     :filtersDisplayValues="filtersDisplayValues"
 *   />
 * </template>
 *
 * <script>
 * import { ref } from 'vue';
 * import DrilldownBreadcrumbs from './DrilldownBreadcrumbs.vue';
 *
 * export default {
 *   components: { DrilldownBreadcrumbs },
 *   setup() {
 *     const clearSelections = () => {};
 *     const currentDimension = ref({<current dimension object>});
 *     const sliceSelections = (index) => { <logic to slice selections up to index> };
 *     const filtersDisplayValues = ref({<object mapping filter values to display values>});
 *
 *     return { clearSelections, currentDimension, sliceSelections, filtersDisplayValues };
 *   }
 * };
 * </script>
 * ```
 *
 * @group Drilldown
 */
export const DrilldownBreadcrumbs = defineComponent({
  props: {
    /**
     * {@inheritDoc @sisense/sdk-ui!DrilldownBreadcrumbsProps.clearDrilldownSelections}
     *
     * @category Widget
     */
    clearDrilldownSelections: Function as PropType<
      DrilldownBreadcrumbsProps['clearDrilldownSelections']
    >,
    /**
     * {@inheritDoc @sisense/sdk-ui!DrilldownBreadcrumbsProps.currentDimension}
     *
     * @category Widget
     */
    currentDimension: Object as PropType<DrilldownBreadcrumbsProps['currentDimension']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!DrilldownBreadcrumbsProps.sliceDrilldownSelections}
     *
     * @category Widget
     */
    sliceDrilldownSelections: Function as PropType<
      DrilldownBreadcrumbsProps['sliceDrilldownSelections']
    >,
    /**
     * {@inheritDoc @sisense/sdk-ui!DrilldownBreadcrumbsProps.filtersDisplayValues}
     *
     * @category Widget
     */
    filtersDisplayValues: Object as PropType<DrilldownBreadcrumbsProps['filtersDisplayValues']>,
  },
  setup: (props, { slots }) => {
    return setupHelperWithChildren(DrilldownBreadcrumbsPreact, props, slots, []);
  },
});
