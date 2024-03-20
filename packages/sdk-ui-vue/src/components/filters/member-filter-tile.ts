import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import { MemberFilterTile as MemberFilterTilePreact } from '@sisense/sdk-ui-preact';
import type { MemberFilterTileProps } from '@sisense/sdk-ui-preact';
import { setupHelper } from '../../setup-helper';

/**
 * UI component that allows the user to select members to include/exclude in a
 * filter. A query is executed against the provided data source to fetch
 * all members that are selectable.
 *
 * @example
 * Below is an example for filtering countries in the `Country` dimension of the `Sample ECommerce` data model.
 * ```vue
 * <template>
 *       <MemberFilterTile
 *         :attribute="memberFilter.attribute"
 *         :onChange="memberFilter.onChange"
 *         :dataSource="memberFilter.dataSource"
 *         :title="memberFilter.title"
 *       />
 * </template>
 *
 * <script setup lang="ts">
 * import { ref } from 'vue';
 * import {MemberFilterTile, type MemberFilterTileProps} from '@sisense/sdk-ui-vue';
 *
 * const memberFilterValue = ref<Filter | null>(null);
 *
 * const memberFilter = ref<MemberFilterTileProps>({
 *   dataSource: DM.DataSource,
 *   title: 'Member Filter',
 *   attribute: DM.DimProducts.ProductName,
 *   filter: memberFilterValue.value,
 *   onChange(filter) {
 *     memberFilterValue.value = filter;
 *   },
 * });
 *
 *
 * </script>
 * ```
 * <img src="media://vue-member-filter-tile-example.png" width="300px" />
 * @param props - MemberFilterTile props
 * @returns MemberFilterTile component
 * @group Filter Tiles
 */

export const MemberFilterTile = defineComponent({
  props: {
    attribute: Object as PropType<MemberFilterTileProps['attribute']>,
    dataSource: Object as PropType<MemberFilterTileProps['dataSource']>,
    filter: Object as PropType<MemberFilterTileProps['filter']>,
    onChange: Function as PropType<MemberFilterTileProps['onChange']>,
    parentFilters: Object as PropType<MemberFilterTileProps['parentFilters']>,
    title: Object as PropType<MemberFilterTileProps['title']>,
  },
  setup: (props) => setupHelper(MemberFilterTilePreact, props),
});
