import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import { DrilldownBreadcrumbs as DrilldownBreadcrumbsPreact } from '@sisense/sdk-ui-preact';
import type { DrilldownBreadcrumbsProps } from '@sisense/sdk-ui-preact';
import { setupHelperWithChildren } from '../setup-helper';

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
 * @prop {Function} clearDrilldownSelections - Function to clear all drilldown selections made by the user.
 * @prop {Object} currentDimension - Object representing the current dimension in the drilldown path.
 * @prop {Function} sliceDrilldownSelections - Function to slice the drilldown selections up to a certain index, allowing the user to navigate back in the drilldown path.
 * @prop {Object} filtersDisplayValues - Object mapping the internal filter values to human-readable display values, enhancing the usability of the breadcrumbs.
 */
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
