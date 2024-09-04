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
 * import { CriteriaFilterTile } from '@sisense/sdk-ui-vue';
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
 * <img src="media://vue-criteria-filter-tile-example.png" width="600px" />
 * @param props - Criteria filter tile props
 * @returns Criteria filter tile component
 * @group Filter Tiles
 */
export const CriteriaFilterTile = defineComponent({
  props: {
    /**
     * {@inheritDoc @sisense/sdk-ui!CriteriaFilterTileProps.arrangement}
     */
    arrangement: Object as PropType<CriteriaFilterTileProps['arrangement']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!CriteriaFilterTileProps.filter}
     */
    filter: Object as PropType<CriteriaFilterTileProps['filter']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!CriteriaFilterTileProps.measures}
     */
    measures: Object as PropType<CriteriaFilterTileProps['measures']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!CriteriaFilterTileProps.onUpdate}
     */
    onUpdate: Function as PropType<CriteriaFilterTileProps['onUpdate']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!CriteriaFilterTileProps.title}
     */
    title: Object as PropType<CriteriaFilterTileProps['title']>,
  },

  setup: (props) => setupHelper(CriteriaFilterTilePreact, props),
});
