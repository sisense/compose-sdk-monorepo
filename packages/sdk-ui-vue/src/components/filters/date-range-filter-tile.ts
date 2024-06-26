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
 *         <DateRangeFilterTile
 *           :title="dateRangeFilter.title"
 *           :datasource="dateRangeFilter.dataSource"
 *           :attribute="dateRangeFilter.attribute"
 *           :filter="dateRangeFilter.filter"
 *           :onChange="dateRangeFilter.onChange"
 *         />
 * </template>
 *
 * <script setup lang="ts">
 * import { ref } from 'vue';
 * import {CriteriaFilterTile, type DateRangeFilterTileProps} from '@sisense/sdk-ui-vue';
 * import { filterFactory } from '@sisense/sdk-data';
 * import * as DM from '../assets/sample-retail-model';
 *
 * const dateRangeFilterValue = ref<Filter | null>(filterFactory.dateRange(DM.DimDate.Date.Years));
 *
 * const dateRangeFilter = ref<DateRangeFilterTileProps>({
 *   title: 'Date Range',
 *   attribute: DM.DimDate.Date.Years,
 *   filter: dateRangeFilterValue.value!,
 *   onChange(filter) {
 *     dateRangeFilterValue.value = filter;
 *   },
 * });
 * </script>
 * ```
 * <img src="media://vue-date-range-filter-tile-example.png" width="800px" />
 * @param props - DateRangeFilterTile props
 * @returns DateRangeFilterTile component
 * @group Filter Tiles
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
    /** @internal */
    tiled: Boolean as PropType<DateRangeFilterTileProps['tiled']>,
  },
  setup: (props) => setupHelper(DateRangeFilterTilePreact, props),
});
