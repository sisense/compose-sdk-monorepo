import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import { DateRangeFilterTile as DateRangeFilterTilePreact } from '@sisense/sdk-ui-preact';
import type { DateRangeFilterTileProps } from '@sisense/sdk-ui-preact';
import { setupHelper } from '../../setup-helper';

/**
 * Date Range Filter Tile component for filtering data by date range.
 *
 * @example
 * Vue example of configuring the date min max values and handling onChange event.
 * ```vue
 * <template>
 *   <DateRangeFilterTile
 *     :title="dateRangeFilterTileProps.title"
 *     :attribute="dateRangeFilterTileProps.attribute"
 *     :filter="dateRangeFilterTileProps.filter"
 *     :onChange="onChange" />
 * </template>
 *
 * <script setup lang="ts">
 * import { ref } from 'vue';
 * import {CriteriaFilterTile} from '@sisense/sdk-ui-vue';
 *
 * const dateRangeFilterTileProps = ref({
 *   title: 'Date Range',
 *   attribute: DM.Commerce.Date.Years,
 *   filter: filterFactory.dateRange(DM.Commerce.Date.Years),
 * });
 *
 * const onChange = (filter: Filter) => {
 *  ...
 * }
 * </script>
 * ```
 */
export const DateRangeFilterTile = defineComponent({
  props: {
    attribute: Object as PropType<DateRangeFilterTileProps['attribute']>,
    datasource: Object as PropType<DateRangeFilterTileProps['dataSource']>,
    earliestDate: Object as PropType<DateRangeFilterTileProps['earliestDate']>,
    filter: Object as PropType<DateRangeFilterTileProps['filter']>,
    lastDate: Object as PropType<DateRangeFilterTileProps['lastDate']>,
    onChange: Function as PropType<DateRangeFilterTileProps['onChange']>,
    parentFilters: Object as PropType<DateRangeFilterTileProps['parentFilters']>,
    title: Object as PropType<DateRangeFilterTileProps['title']>,
  },
  setup: (props) => setupHelper(DateRangeFilterTilePreact, props),
});
