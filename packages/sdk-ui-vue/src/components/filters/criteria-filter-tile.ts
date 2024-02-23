import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import { CriteriaFilterTile as CriteriaFilterTilePreact } from '@sisense/sdk-ui-preact';
import type { CriteriaFilterTileProps } from '@sisense/sdk-ui-preact';
import { setupHelper } from '../../setup-helper';
import type { NumericFilter, RankingFilter, TextFilter } from '@sisense/sdk-data';
/**
 * UI component that allows the user to filter numeric or text attributes according to
 * a number of built-in operations defined in the {@link NumericFilter}, {@link TextFilter}, or {@link RankingFilter}.
 *
 * The arrangement prop determines whether the filter is rendered vertically or horizontally, with the latter intended for toolbar use and omitting title, enable/disable, and collapse/expand functionality.
 *
 * @example
 * Here's how you can use the CriteriaFilterTile component in a Vue application:
 * ```vue
 * <template>
 *   <CriteriaFilterTile
 *     :title="criteriaFilterTileProps.title"
 *     :filter="criteriaFilterTileProps.filter"
 *     :onUpdate="onUpdate"
 *   />
 * </template>
 *
 * <script setup lang="ts">
 * import { ref } from 'vue';
 * import {CriteriaFilterTile} from '@sisense/sdk-ui-vue';
 * import { filterFactory } from '@sisense/sdk-data';
 *
 * const criteriaFilterTileProps = ref({
 *  title: 'Revenue',
 *  filter: filterFactory.greaterThanOrEqual(DM.Commerce.Revenue, 10000)
 * });
 *
 * const onUpdate = (filter: Filter | null) => {
 *  ...
 * }
 * </script>
 * ```
 * <img src="media://criteria-filter-tile-example-1.png" width="300px" />
 * @param props - Criteria filter tile props
 * @returns Criteria filter tile component
 */
export const CriteriaFilterTile = defineComponent({
  props: {
    arrangement: Object as PropType<CriteriaFilterTileProps['arrangement']>,
    filter: Object as PropType<CriteriaFilterTileProps['filter']>,
    measures: Object as PropType<CriteriaFilterTileProps['measures']>,
    onUpdate: Function as PropType<CriteriaFilterTileProps['onUpdate']>,
    title: Object as PropType<CriteriaFilterTileProps['title']>,
  },

  setup: (props) => setupHelper(CriteriaFilterTilePreact, props),
});
