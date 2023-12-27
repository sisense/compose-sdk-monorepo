import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import { DateRangeFilterTile as DateRangeFilterTilePreact } from '@sisense/sdk-ui-preact';
import type { DateRangeFilterTileProps } from '@sisense/sdk-ui-preact';
import { setupHelper } from '../../setup-helper';

/**
 * A Vue component that wraps the DateRangeFilterTile Preact component for use in Vue applications.
 * It maintains compatibility with Vue's reactivity system while preserving the functionality of the DateRangeFilterTile.
 *
 * @example
 * Here's how you can use the DateRangeFilterTile component in a Vue application:
 * ```vue
 * <template>
 *   <DateRangeFilterTile :props="dateRangeFilterTileProps" />
 * </template>
 *
 * <script setup lang="ts">
 * import { ref } from 'vue';
 * import {CriteriaFilterTile} from '@sisense/sdk-ui-vue';
 *
 * const dateRangeFilterTileProps = ref({
 *   // Configure your dateRangeFilterTileProps
 * });
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
