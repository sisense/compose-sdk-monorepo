import { DateRangeFilterTile as DateRangeFilterTilePreact } from '@sisense/sdk-ui-preact';
import type { DateRangeFilterTileProps as DateRangeFilterTilePropsPreact } from '@sisense/sdk-ui-preact';
import { defineComponent } from 'vue';
import type { PropType } from 'vue';

import { setupHelper } from '../../helpers/setup-helper';

/**
 * Props of the {@link @sisense/sdk-ui-vue!DateRangeFilterTile | `DateRangeFilterTile`} component.
 */
export interface DateRangeFilterTileProps extends DateRangeFilterTilePropsPreact {}

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
 * import { DateRangeFilterTile, type DateRangeFilterTileProps } from '@sisense/sdk-ui-vue';
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
 * <img src="media://vue-date-range-filter-tile-example.png" width="600px" />
 * @param props - DateRangeFilterTile props
 * @returns DateRangeFilterTile component
 * @group Filter Tiles
 */
export const DateRangeFilterTile = defineComponent({
  props: {
    /**
     * {@inheritDoc @sisense/sdk-ui!DateRangeFilterTileProps.attribute}
     */
    attribute: {
      type: Object as PropType<DateRangeFilterTileProps['attribute']>,
      required: true,
    },
    /**
     * {@inheritDoc @sisense/sdk-ui!DateRangeFilterTileProps.dataSource}
     */
    datasource: [String, Object] as PropType<DateRangeFilterTileProps['dataSource']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!DateRangeFilterTileProps.earliestDate}
     */
    earliestDate: Object as PropType<DateRangeFilterTileProps['earliestDate']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!DateRangeFilterTileProps.filter}
     */
    filter: {
      type: Object as PropType<DateRangeFilterTileProps['filter']>,
      required: true,
    },
    /**
     * {@inheritDoc @sisense/sdk-ui!DateRangeFilterTileProps.lastDate}
     */
    lastDate: Object as PropType<DateRangeFilterTileProps['lastDate']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!DateRangeFilterTileProps.onChange}
     */
    onChange: {
      type: Function as PropType<DateRangeFilterTileProps['onChange']>,
      required: true,
    },
    /**
     * {@inheritDoc @sisense/sdk-ui!DateRangeFilterTileProps.parentFilters}
     */
    parentFilters: Object as PropType<DateRangeFilterTileProps['parentFilters']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!DateRangeFilterTileProps.title}
     */
    title: {
      type: String as PropType<DateRangeFilterTileProps['title']>,
      required: true,
    },
    /**
     * {@inheritDoc @sisense/sdk-ui!DateRangeFilterTileProps.tiled}
     * @internal
     */
    tiled: Boolean as PropType<DateRangeFilterTileProps['tiled']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!DateRangeFilterTileProps.onDelete}
     */
    onDelete: Function as PropType<DateRangeFilterTileProps['onDelete']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!DateRangeFilterTileProps.onEdit}
     */
    onEdit: Function as PropType<DateRangeFilterTileProps['onEdit']>,
  },
  setup: (props) => setupHelper(DateRangeFilterTilePreact, props),
});
