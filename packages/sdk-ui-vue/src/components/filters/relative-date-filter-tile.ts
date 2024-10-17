import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import { RelativeDateFilterTile as RelativeDateFilterTilePreact } from '@sisense/sdk-ui-preact';
import type { RelativeDateFilterTileProps } from '@sisense/sdk-ui-preact';
import { setupHelper } from '../../setup-helper.js';

/**
 * Relative Date Filter Tile component for filtering data by relative date.
 *
 * @example
 * Vue example of configuring the date min max values and handling onUpdate event.
 * ```vue
 * <template>
 *   <RelativeDateFilterTile
 *     :title="relativeDateFilter.title"
 *     :filter="relativeDateFilter.filter"
 *     :arrangement="relativeDateFilter.arrangement"
 *     :onUpdate="relativeDateFilter.onUpdate"
 *   />
 * </template>
 *
 * <script setup lang="ts">
 * import { ref } from 'vue';
 * import { RelativeDateFilterTile, type RelativeDateFilterTileProps } from '@sisense/sdk-ui-vue';
 * import { filterFactory } from '@sisense/sdk-data';
 * import * as DM from '../assets/sample-retail-model';
 *
 * const relativeDateFilterValue = ref<Filter | null>(filterFactory.dateRelativeTo(DM.DimDate.Date.Months, 0, 18);
 *
 * const relativeDateFilter = ref<RelativeDateFilterTileProps>({
 *   title: 'Relative Date Filter Tile',
 *   filter: relativeDateFilterValue.value!,
 *   arrangement: 'vertical',
 *   onUpdate(filter) {
 *     relativeDateFilterValue.value = filter;
 *   },
 * });
 * </script>
 * ```
 * <img src="media://vue-relative-date-filter-tile-example.png" width="800px" />
 * @param props - RelativeDateFilterTile props
 * @returns RelativeDateFilterTile component
 * @group Filter Tiles
 */
export const RelativeDateFilterTile = defineComponent({
  props: {
    /**
     * {@inheritDoc @sisense/sdk-ui!RelativeDateFilterTileProps.title}
     */
    title: Object as PropType<RelativeDateFilterTileProps['title']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!RelativeDateFilterTileProps.filter}
     */
    filter: Object as PropType<RelativeDateFilterTileProps['filter']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!RelativeDateFilterTileProps.arrangement}
     */
    arrangement: Object as PropType<RelativeDateFilterTileProps['arrangement']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!RelativeDateFilterTileProps.onUpdate}
     */
    onUpdate: Function as PropType<RelativeDateFilterTileProps['onUpdate']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!RelativeDateFilterTileProps.limit}
     */
    limit: Object as PropType<RelativeDateFilterTileProps['limit']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!RelativeDateFilterTileProps.tileDesignOptions}
     * @internal
     */
    tileDesignOptions: Object as PropType<RelativeDateFilterTileProps['tileDesignOptions']>,
  },
  setup: (props) => setupHelper(RelativeDateFilterTilePreact, props),
});
